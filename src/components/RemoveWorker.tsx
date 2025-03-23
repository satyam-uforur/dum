"use client"

import type React from "react"

import { useState, useEffect } from "react"
import axios from "axios"
import { Search, Trash2, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ToastContainer, toast } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"

interface Worker {
  _id: string
  username: string
  email: string
  role: string
}

export default function RemoveWorker() {
  const [workers, setWorkers] = useState<Worker[]>([])
  const [filteredWorkers, setFilteredWorkers] = useState<Worker[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(true)
  const [confirmDialog, setConfirmDialog] = useState(false)
  const [selectedWorker, setSelectedWorker] = useState<Worker | null>(null)

  // Determine the endpoint based on user role
  const getUserDashboard = () => {
    if (typeof window !== "undefined") {
      const username = localStorage.getItem("role") || ""
      if (username.startsWith("Director")) {
        return "/dashboard/director"
      } else if (username.startsWith("TeamLead")) {
        return "/dashboard/teamlead"
      } else if (username.startsWith("Associate")) {
        return "/dashboard/associate"
      }
    }
    return "/"
  }

  // Fetch workers on component mount
  useEffect(() => {
    fetchWorkers()
  }, [])

  // Filter workers when search term changes
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredWorkers(workers)
    } else {
      const filtered = workers.filter(
        (worker) =>
          worker.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
          worker.email.toLowerCase().includes(searchTerm.toLowerCase()),
      )
      setFilteredWorkers(filtered)
    }
  }, [searchTerm, workers])

  const fetchWorkers = async () => {
    setLoading(true)
    try {
      // Replace with your actual API endpoint
      const response = await axios.get("http://localhost:3535/getwor")

      console.log(response.data)
      // Set workers data
      setWorkers(response.data.data)
      setFilteredWorkers(response.data.data)
    } catch (error) {
      toast.error("Failed to fetch workers")
      console.error("Error fetching workers:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
  }

  const confirmRemove = (worker: Worker) => {
    setSelectedWorker(worker)
    setConfirmDialog(true)
  }

  const removeWorker = async () => {
    if (!selectedWorker) return

    try {
      console.log(selectedWorker)
      // Replace with your actual API endpoint
      await axios.delete(`http://localhost:3535/removeworker/${selectedWorker._id}`)

      // Update local state
      setWorkers(workers.filter((w) => w._id !== selectedWorker._id))

      toast.success(`Worker ${selectedWorker.username} has been removed`)

      // Close dialog
      setConfirmDialog(false)
      fetchWorkers()
    } catch (error) {
      toast.error("Failed to remove worker")
      console.error("Error removing worker:", error)
    }
  }

  return (
    <div className="min-h-screen pt-12 bg-gray-100">
      <ToastContainer />
      <div className="max-w-4xl mx-auto py-2 px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900">Remove Worker</h2>
          </div>

          <div className="mb-6">
            <Label htmlFor="search">Search Workers</Label>
            <div className="relative mt-1">
              <Input
                id="search"
                type="text"
                placeholder="Search by name or email"
                value={searchTerm}
                onChange={handleSearchChange}
                className="pl-10"
              />
              <Search className="h-5 w-5 text-gray-400 absolute left-3 top-2.5" />
            </div>
          </div>

          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading workers...</p>
            </div>
          ) : filteredWorkers.length === 0 ? (
            <div className="text-center py-8 flex flex-col items-center">
              <AlertCircle className="h-12 w-12 text-gray-400 mb-2" />
              <p className="text-gray-600">
                {searchTerm ? "No workers found matching your search" : "No workers found in the system"}
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Username</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead className="w-24">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredWorkers.map((worker) => (
                  <TableRow key={worker._id}>
                    <TableCell className="font-medium">{worker.username}</TableCell>
                    <TableCell>{worker.email}</TableCell>
                    <TableCell>
                      <Button variant="destructive" size="sm" onClick={() => confirmRemove(worker)}>
                        <Trash2 className="h-4 w-4 mr-1" />
                        Remove
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          <div className="mt-6">
            <Button type="button" variant="outline" className="w-full" onClick={() => getUserDashboard()}>
              Back to Dashboard
            </Button>
          </div>
        </div>
      </div>

      {/* Confirmation Dialog */}
      <Dialog open={confirmDialog} onOpenChange={setConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Removal</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove {selectedWorker?.username}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={removeWorker}>
              Remove Worker
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

