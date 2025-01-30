"use client"

import { useState } from "react"
import { AudioRecordingsHeader } from "@/components/audio-recordings/header"
import { AudioRecordingsTable } from "@/components/audio-recordings/table"
import { AudioRecordingsFilter, FilterValues } from "@/components/audio-recordings/filter"
import { AudioRecordingsProvider } from "@/components/audio-recordings/audio-recordings-context"

export default function AudioRecordingsPage() {
  const [filters, setFilters] = useState<FilterValues>({
    jobId: "",
    status: "all",
    uploadDate: new Date().toISOString().split('T')[0], // Default to today's date
  })

  return (
    <AudioRecordingsProvider>
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <AudioRecordingsHeader />
        <AudioRecordingsFilter onFilterChange={setFilters} initialFilters={filters} />
        <AudioRecordingsTable filters={filters} onFilterChange={setFilters} />
      </div>
    </AudioRecordingsProvider>
  )
}

