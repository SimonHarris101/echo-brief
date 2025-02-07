import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AudioRecording } from "./audio-recordings-context";
import { FileAudio, FileText, FileIcon as FilePdf, Calendar, User, Tag, RefreshCw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

interface ViewDetailsDialogProps {
  recording: AudioRecording;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const statusStyles: Record<string, string> = {
  completed: "bg-green-500 text-white border border-green-700 shadow-md px-4 py-1 rounded-full",
  processing: "bg-yellow-500 text-black border border-yellow-600 shadow-md px-4 py-1 rounded-full",
  uploaded: "bg-blue-500 text-white border border-blue-700 shadow-md px-4 py-1 rounded-full",
  failed: "bg-red-500 text-white border border-red-700 shadow-md px-4 py-1 rounded-full",
  default: "bg-gray-500 text-white border border-gray-600 shadow-md px-4 py-1 rounded-full",
};

export function ViewDetailsDialog({ recording, open, onOpenChange }: ViewDetailsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className={cn(
          "w-[600px] h-auto max-w-[90vw] p-6 rounded-xl shadow-lg overflow-hidden",
          "bg-white text-black dark:bg-gray-900 dark:text-white"
        )}
      >
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold mb-4">Audio Recording Details</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center">
            <FileAudio className="mr-2" /> Recording
          </h3>
          <div className="bg-gray-200 dark:bg-gray-800 p-3 rounded-lg shadow-md">
            <audio controls className="w-full rounded-lg">
              <source src={recording.file_path} type="audio/mpeg" />
              Your browser does not support the audio element.
            </audio>
          </div>
          <Button 
            onClick={() => window.open(recording.file_path, '_blank')}
            variant="outline"
            className="w-full font-semibold rounded-lg mt-2"
          >
            Download Audio
          </Button>
        </div>

        <Separator className="my-4 border-gray-300 dark:border-gray-700" />

        <div className="grid grid-cols-2 gap-6 text-sm">
          <div>
            <h3 className="text-gray-600 dark:text-gray-400 flex items-center mb-1">
              <Tag className="mr-2" /> Job ID
            </h3>
            <p className="font-medium">{recording.id}</p>
          </div>
          <div>
            <h3 className="text-gray-600 dark:text-gray-400 flex items-center mb-1">
              <User className="mr-2" /> User ID
            </h3>
            <p className="font-medium">{recording.user_id}</p>
          </div>
          <div className="col-span-2 flex items-center justify-between mt-4">
            <div>
              <h3 className="text-gray-600 dark:text-gray-400 flex items-center mb-1">
                <RefreshCw className="mr-2" /> Status
              </h3>
              <Badge 
                className={cn(
                  "px-4 py-1 text-sm font-semibold flex justify-center items-center",
                  statusStyles[recording.status] || statusStyles.default
                )}
              >
                {recording.status.charAt(0).toUpperCase() + recording.status.slice(1)}
              </Badge>
            </div>
          </div>
        </div>

        <Separator className="my-4 border-gray-300 dark:border-gray-700" />

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <h3 className="text-gray-600 dark:text-gray-400 flex items-center mb-1">
              <Calendar className="mr-2" /> Created At
            </h3>
            <p className="font-medium">{new Date(recording.created_at).toLocaleString()}</p>
          </div>
          <div>
            <h3 className="text-gray-600 dark:text-gray-400 flex items-center mb-1">
              <Calendar className="mr-2" /> Updated At
            </h3>
            <p className="font-medium">{new Date(recording.updated_at).toLocaleString()}</p>
          </div>
          <div>
            <h3 className="text-gray-400">Prompt Category ID</h3>
            <p className="font-medium">{recording.prompt_category_id || "N/A"}</p>
          </div>
          <div>
            <h3 className="text-gray-400">Prompt Subcategory ID</h3>
            <p className="font-medium">{recording.prompt_subcategory_id || "N/A"}</p>
          </div>
        </div>

        <Separator className="my-4 border-gray-300 dark:border-gray-700" />

        {recording.transcription_file_path && (
          <div className="mb-2">
            <h3 className="text-md font-semibold flex items-center mb-1">
              <FileText className="mr-2" /> Transcription
            </h3>
            <Button 
              onClick={() => window.open(recording.transcription_file_path, '_blank')} 
              className="w-full font-semibold rounded-lg shadow-md"
            >
              View Transcription TXT
            </Button>
          </div>
        )}
        {recording.analysis_file_path && (
          <div className="mb-2">
            <h3 className="text-md font-semibold flex items-center mb-1">
              <FilePdf className="mr-2" /> Analysis
            </h3>
            <Button 
              onClick={() => window.open(recording.analysis_file_path, '_blank')} 
              className="w-full font-semibold rounded-lg shadow-md"
            >
              View Analysis PDF
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
