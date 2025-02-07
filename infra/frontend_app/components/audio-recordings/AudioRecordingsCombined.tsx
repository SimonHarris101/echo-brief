"use client";

import { useEffect, useState, useRef } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { JOBS_API } from "@/lib/apiConstants";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { FileAudio, Eye, RefreshCw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { AudioRecordingsProvider } from "@/components/audio-recordings/audio-recordings-context";
import { cn } from "@/lib/utils";
import { CalendarIcon } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ViewDetailsDialog } from "./view-details-dialog";

const statusEnum = z.enum(["all", "uploaded", "processing", "completed", "failed"]);

const filterSchema = z.object({
  job_id: z.string().optional(),
  status: statusEnum.default("all"),
  created_at: z.string().optional(),
});

export type FilterValues = z.infer<typeof filterSchema>;

export function AudioRecordingsCombined({ initialFilters }: { initialFilters: FilterValues }) {
  const [audioRecordings, setAudioRecordings] = useState<any[]>([]);
  const [cachedData, setCachedData] = useState<any[]>([]); // Cached API data
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const hasFetchedData = useRef(false);
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 10;
  const [selectedRecording, setSelectedRecording] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);


  const form = useForm<FilterValues>({
    resolver: zodResolver(filterSchema),
    defaultValues: { ...initialFilters, created_at: format(new Date(), "yyyy-MM-dd") },
  });

  // Fetch data from API and cache it
  const fetchJobData = async (forceRefresh = false) => {
    if (!forceRefresh) {
      // Load from localStorage first
      const cachedJobs = localStorage.getItem("cachedJobs");
      if (cachedJobs) {
        const parsedData = JSON.parse(cachedJobs);
        setCachedData(parsedData);
        setAudioRecordings(parsedData);
        setIsLoading(false);
        return;
      }
    }

    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No authentication token found. Please log in again.");

      const response = await fetch(JOBS_API, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      });

      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

      const data = await response.json();
      setAudioRecordings(data.jobs || []);
      setCachedData(data.jobs || []); // Store fresh data in state
      localStorage.setItem("cachedJobs", JSON.stringify(data.jobs || [])); // Store in cache
    } catch (error) {
      console.error("Error fetching audio recordings:", error);
      setError("Failed to fetch data. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Load cached data on mount
  useEffect(() => {
    if (hasFetchedData.current) return;
    hasFetchedData.current = true;
    fetchJobData();
  }, []);

  // Refresh button handler 
  const handleRefresh = () => {
    localStorage.removeItem("cachedJobs"); // Clear cache
    fetchJobData(true);
  };

  // Apply Filters based on Cached Data
  const onSubmit = (data: FilterValues) => {
    setIsLoading(true);

    const filteredData = cachedData.filter((job) => {
      const jobDate = format(new Date(parseInt(job.created_at)), "yyyy-MM-dd");
      return (
        (data.job_id ? job.id.includes(data.job_id) : true) &&
        (data.status !== "all" ? job.status === data.status : true) &&
        (data.created_at ? jobDate === data.created_at : true)
      );


    });

    setAudioRecordings(filteredData);
    setIsLoading(false);
    setError(filteredData.length === 0 ? "No jobs found with the selected filters." : null);
  };

  // Reset Filters
  const handleReset = () => {
    form.reset({ job_id: "", status: "all", created_at: "" });
    setAudioRecordings(cachedData); // Load cached data instead of calling API
  };

  // Pagination Logic
  const totalPages = Math.ceil(audioRecordings.length / recordsPerPage);
  const paginatedData = audioRecordings.slice((currentPage - 1) * recordsPerPage, currentPage * recordsPerPage);
  const statusVariants: Record<string, string> = {
    completed: "bg-green-500 text-white",
    processing: "bg-yellow-500 text-black",
    uploaded: "bg-blue-500 text-white",
    failed: "bg-red-500 text-white",
    default: "bg-gray-400 text-white",
  };

  return (
    <AudioRecordingsProvider>
      <Card className="max-w-5xl mx-auto mt-8 p-6">
        <CardHeader>
          <CardTitle>Audio Recordings</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField control={form.control} name="job_id" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Job ID</FormLabel>
                    <FormControl><Input placeholder="Enter Job ID" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <FormField control={form.control} name="status" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        {statusEnum.options.map((status) => (
                          <SelectItem key={status} value={status}>{status.charAt(0).toUpperCase() + status.slice(1)}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField
                  control={form.control}
                  name="created_at"
                  render={({ field }) => (
                    <FormItem >
                      <FormLabel>Upload Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full justify-start text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? format(new Date(field.value), "yyyy-MM-dd") : "Pick a date"}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent align="start" className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={field.value ? new Date(field.value) : undefined}
                            onSelect={(date) => field.onChange(date ? format(date, "yyyy-MM-dd") : "")}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )} />

              </div>

              <div className="flex justify-between items-center">
                <div className="flex space-x-4">
                  <Button type="submit">Apply Filters</Button>
                  <Button type="button" variant="outline" onClick={handleReset}>Reset</Button>
                </div>
                <Button type="button" variant="outline" onClick={handleRefresh} className="flex items-center">
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Refresh
                </Button>
              </div>
            </form>
          </Form>

          {isLoading && <Progress value={90} className="mt-4 mb-4" />}


          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Job ID</TableHead>
                <TableHead>File Name</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Upload Date</TableHead>
                <TableHead>Actions</TableHead>

              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedData.map((row) => (
                <TableRow key={row.id}>
                  <TableCell>{row.id}</TableCell>
                  <TableCell className="text-blue-500 font-medium">{row.file_name}</TableCell>

                  <TableCell>
                    <Badge className={cn("px-4 py-1 text-xs rounded-md min-w-[100px] flex items-center justify-center", statusVariants[row.status] || statusVariants.default)}>
                      {row.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{new Date(parseInt(row.created_at)).toLocaleDateString()}</TableCell>
                  <TableCell>
                    {/* Action Dropdown */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="icon" onClick={() => setSelectedRecording(row)}>
                          <Eye className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      {selectedRecording && selectedRecording.id === row.id && (
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => {
                            setSelectedRecording(row);
                            setIsDialogOpen(true);
                          }}>
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                          {row.status === "uploaded" && (
                            <DropdownMenuItem onClick={() => null}>
                              <RefreshCw className="mr-2 h-4 w-4" />
                              Retry Processing
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      )}
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* Pagination Controls*/}
          <div className="flex justify-between mt-4">
            <Button onClick={() => setCurrentPage(currentPage - 1)} disabled={currentPage === 1}>Previous</Button>
            <span>Page {currentPage} of {totalPages}</span>
            <Button onClick={() => setCurrentPage(currentPage + 1)} disabled={currentPage >= totalPages}>Next</Button>
          </div>
          {selectedRecording && (
            <ViewDetailsDialog
              recording={selectedRecording}
              open={isDialogOpen}
              onOpenChange={(open) => {
                setIsDialogOpen(open);
                if (!open) setSelectedRecording(null);
              }}
            />
          )}
        </CardContent>
      </Card>
    </AudioRecordingsProvider>
  );
}
