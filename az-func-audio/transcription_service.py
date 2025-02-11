import logging
import time
from typing import Dict, Any, Optional
import requests
from azure.identity import DefaultAzureCredential
import os
import sys


sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
from config import AppConfig
from storage_service import StorageService


class TranscriptionService:
    def __init__(self, config: AppConfig):
        self.config = config
        self.logger = logging.getLogger(__name__)
        self.credential = DefaultAzureCredential()
        self.storage_service = StorageService(config)
        self.endpoint = f"https://{config.speech_deployment}.cognitiveservices.azure.com/speechtotext/v3.2"

    def _get_auth_token(self) -> str:
        """Get authentication token for Azure services"""
        try:
            token = self.credential.get_token(
                "https://cognitiveservices.azure.com/.default"
            )
            self.logger.info("Successfully acquired authentication token")
            return token.token
        except Exception as e:
            self.logger.error(f"Failed to acquire authentication token: {str(e)}")
            raise

    def _get_headers(self) -> Dict[str, str]:
        """Get headers for API requests"""
        token = self._get_auth_token()
        return {"Content-Type": "application/json", "Authorization": f"Bearer {token}"}

    def _prepare_transcription_properties(self, blob_url: str) -> Dict[str, Any]:
        """Prepare transcription job properties"""
        return {
            "contentUrls": [blob_url],
            "locale": self.config.speech_transcription_locale,
            "displayName": f"Transcription_{time.strftime('%Y%m%d_%H%M%S')}",
            "properties": {
                "diarizationEnabled": True,
                "speakers": {
                    "minCount": 1,
                    "maxCount": int(self.config.speech_max_speakers),
                },
                "languageIdentification": {
                    "candidateLocales": self.config.speech_candidate_locales.split(","),
                },
                "profanityFilterMode": "None",  # Add profanity filter settings here
            },
        }

    def submit_transcription_job(self, blob_url: str) -> str:
        """Submit transcription job and return job ID"""
        try:
            self.logger.info(f"Submitting transcription job for {blob_url}")
            properties = self._prepare_transcription_properties(blob_url)
            headers = self._get_headers()

            response = requests.post(
                f"{self.endpoint}/transcriptions",
                headers=headers,
                json=properties,
                timeout=30,
            )

            if response.status_code == 400:
                self.logger.error(f"Bad request error: {response.text}")
                raise ValueError(
                    f"Invalid request: {response.json().get('message', 'Unknown error')}"
                )

            response.raise_for_status()
            transcription_id = response.json()["self"].split("/")[-1]
            self.logger.info(
                f"Successfully submitted transcription job. ID: {transcription_id}"
            )
            return transcription_id

        except Exception as e:
            self.logger.error(f"Failed to submit transcription job: {str(e)}")
            raise

    def check_status(
        self, transcription_id: str, timeout: int = 18000, interval: int = 20
    ) -> Dict[str, Any]:
        """Check transcription status with timeout"""
        start_time = time.time()
        status_endpoint = f"{self.endpoint}/transcriptions/{transcription_id}"
        headers = self._get_headers()

        while True:
            # if time.time() - start_time > timeout:
            #     raise TimeoutError(f"Transcription timed out after {timeout} seconds")

            try:
                response = requests.get(status_endpoint, headers=headers)
                response.raise_for_status()
                status_data = response.json()

                status = status_data.get("status")
                self.logger.info(f"Transcription status: {status}")

                if status == "Succeeded":
                    return status_data
                elif status == "Failed":
                    error_message = status_data.get("error", {}).get(
                        "message", "Unknown error"
                    )
                    raise Exception(f"Transcription failed: {error_message}")
                elif status == "Running":
                    self.logger.info("Transcription is still processing...")

                time.sleep(interval)

            except requests.exceptions.RequestException as e:
                self.logger.error(f"Error checking status: {str(e)}")
                time.sleep(min(interval * 2, 60))  # Exponential backoff
            except Exception as e:
                self.logger.error(f"Unexpected error checking status: {str(e)}")
                raise

    def _check_status_once(self, transcription_id: str) -> Dict[str, Any]:
        """Single status check without retry logic"""
        status_endpoint = f"{self.endpoint}/transcriptions/{transcription_id}"
        headers = self._get_headers()

        response = requests.get(status_endpoint, headers=headers)
        response.raise_for_status()
        return response.json()

    def _format_transcription(self, results: Dict[str, Any]) -> str:
        """Format transcription results as text"""
        formatted_lines = []
        current_speaker = None

        for phrase in results.get("recognizedPhrases", []):
            speaker = phrase.get("speaker", "Unknown")
            text = phrase.get("nBest", [{}])[0].get("display", "").strip()
            confidence = phrase.get("nBest", [{}])[0].get("confidence", 0)

            if text:
                if speaker != current_speaker:
                    formatted_lines.append(f"\n--- Speaker {speaker} ---")
                    current_speaker = speaker

                line = text
                if confidence < 0.8:
                    line = f"{text} [Confidence: {confidence:.2f}]"

                formatted_lines.append(f"  {line}")

        return "\n".join(formatted_lines)

    def get_results(self, status_data: Dict[str, Any]) -> str:
        """Retrieve transcription results"""
        try:
            files_url = status_data.get("links", {}).get("files")
            if not files_url:
                raise ValueError("Files URL not found in status data")

            self.logger.info("Retrieving transcription files list")
            headers = self._get_headers()
            files_response = requests.get(files_url, headers=headers)
            files_response.raise_for_status()

            files_data = files_response.json()
            if not files_data.get("values"):
                raise ValueError("No transcription files found")

            result_url = files_data["values"][0]["links"]["contentUrl"]
            self.logger.info("Retrieving transcription content")

            result_response = requests.get(result_url)
            result_response.raise_for_status()

            transcription_data = result_response.json()
            formatted_text = self._format_transcription(transcription_data)

            return formatted_text

        except Exception as e:
            self.logger.error(f"Failed to retrieve transcription results: {str(e)}")
            raise

    def transcribe(self, blob_url: str) -> Dict[str, Any]:
        """Main transcription workflow"""
        try:
            # Submit transcription job
            transcription_id = self.submit_transcription_job(blob_url)

            # Wait for completion
            self.logger.info("Waiting for transcription to complete...")
            status_data = self.check_status(transcription_id)

            # Get results
            self.logger.info("Retrieving transcription results...")
            return self.get_results(status_data)

        except Exception as e:
            self.logger.error(f"Transcription workflow failed: {str(e)}")
            raise
