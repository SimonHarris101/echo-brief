"use client"

import { createContext, useContext, useState, useCallback } from 'react'
import { FilterValues } from './filter'
import { JOBS_API } from '@/lib/apiConstants';

export interface AudioRecording {
  id: string
  user_id: string
  file_path: string
  transcription_file_path: string | null
  analysis_file_path: string | null
  prompt_category_id: string
  prompt_subcategory_id: string
  status: 'uploaded' | 'processing' | 'completed' | 'error'
  transcription_id: string | null
  created_at: number
  updated_at: number
  type: string
  _rid: string
  _self: string
  _etag: string
  _attachments: string
  _ts: number
}

interface AudioRecordingsContextType {
  audioRecordings: AudioRecording[]
  fetchAudioRecordings: (filters: FilterValues) => Promise<void>
  error: string | null
}

const AudioRecordingsContext = createContext<AudioRecordingsContextType | undefined>(undefined)

export function AudioRecordingsProvider({ children }: { children: React.ReactNode }) {
  const [audioRecordings, setAudioRecordings] = useState<AudioRecording[]>([])
  const [error, setError] = useState<string | null>(null)

  const fetchAudioRecordings = useCallback(async (filters: FilterValues) => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        throw new Error('No authentication token found. Please log in again.')
      }

      const queryParams = new URLSearchParams({
        job_id: filters.jobId || '',
        status: filters.status === 'all' ? '' : filters.status,
        created_at: filters.uploadDate,
      }).toString()

      console.log('Fetching audio recordings with params:', queryParams)

      const response = await fetch(`${JOBS_API}?${queryParams}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('API response error:', response.status, errorText)
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`)
      }

      const data = await response.json()
      console.log('Received data:', data)
      setAudioRecordings(data.jobs || [])
      setError(null)
    } catch (error) {
      console.error('Error fetching audio recordings:', error)
      setError(error.message)
      setAudioRecordings([])
    }
  }, [])

  return (
    <AudioRecordingsContext.Provider value={{
      audioRecordings,
      fetchAudioRecordings,
      error
    }}>
      {children}
    </AudioRecordingsContext.Provider>
  )
}

export function useAudioRecordings() {
  const context = useContext(AudioRecordingsContext)
  if (context === undefined) {
    throw new Error('useAudioRecordings must be used within an AudioRecordingsProvider')
  }
  return context
}

