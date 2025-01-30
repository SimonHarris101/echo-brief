import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { AudioRecording } from "./audio-recordings-context"
import { FileAudio, FileText, FileIcon as FilePdf, Calendar, User, Tag, RefreshCw } from 'lucide-react'
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

interface ViewDetailsDialogProps {
  recording: AudioRecording
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ViewDetailsDialog({ recording, open, onOpenChange }: ViewDetailsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Audio Recording Details</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold flex items-center">
                <FileAudio className="mr-2" /> Recording
              </h3>
              <audio 
                controls 
                className="w-full mt-2"
              >
                <source src={recording.file_path} type="audio/mpeg" />
                Your browser does not support the audio element.
              </audio>
              <div className="mt-2">
                <Button 
                  onClick={() => window.open(recording.file_path, '_blank')}
                  variant="outline"
                >
                  Download Audio
                </Button>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold flex items-center">
                <Tag className="mr-2" /> Job ID
              </h3>
              <p className="mt-1">{recording.id}</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold flex items-center">
                <User className="mr-2" /> User ID
              </h3>
              <p className="mt-1">{recording.user_id}</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold flex items-center">
                <RefreshCw className="mr-2" /> Status
              </h3>
              <Badge 
                variant={
                  recording.status === "completed" ? "success" :
                  recording.status === "processing" ? "default" :
                  recording.status === "uploaded" ? "secondary" :
                  "destructive"
                }
                className="mt-1"
              >
                {recording.status}
              </Badge>
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold flex items-center">
                <Calendar className="mr-2" /> Created At
              </h3>
              <p className="mt-1">{new Date(recording.created_at).toLocaleString()}</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold flex items-center">
                <Calendar className="mr-2" /> Updated At
              </h3>
              <p className="mt-1">{new Date(recording.updated_at).toLocaleString()}</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold">Prompt Category ID</h3>
              <p className="mt-1">{recording.prompt_category_id || "N/A"}</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold">Prompt Subcategory ID</h3>
              <p className="mt-1">{recording.prompt_subcategory_id || "N/A"}</p>
            </div>
          </div>
        </div>
        <Separator className="my-4" />
        <div className="space-y-4">
          {recording.transcription_file_path && (
            <div>
              <h3 className="text-lg font-semibold flex items-center">
                <FileText className="mr-2" /> Transcription
              </h3>
              <div className="flex items-center space-x-2 mt-2">
                <Button onClick={() => window.open(recording.transcription_file_path, '_blank')}>
                  View Transcription TXT
                </Button>
              </div>
            </div>
          )}
          {recording.analysis_file_path && (
            <div>
              <h3 className="text-lg font-semibold flex items-center">
                <FilePdf className="mr-2" /> Analysis
              </h3>
              <div className="flex items-center space-x-2 mt-2">
                <Button onClick={() => window.open(recording.analysis_file_path, '_blank')}>
                  View Analysis PDF
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

