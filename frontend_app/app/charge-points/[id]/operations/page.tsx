"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { OperationsPanel } from "@/components/operations/operations-panel"
import { ChargePoint } from "@/components/charge-points/charge-points-context"
import { Skeleton } from "@/components/ui/skeleton"

export default function ChargePointOperationsPage() {
  const { id } = useParams()
  const [chargePoint, setChargePoint] = useState<ChargePoint | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchChargePoint() {
      try {
        // In a real application, you would fetch this data from your API
        // For now, we'll simulate an API call with a timeout
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        // Mock data - replace this with actual API call
        const mockChargePoint: ChargePoint = {
          id: id as string,
          description: "Mock Charge Point",
          ocppProtocol: "ocpp1.6J",
          lastHeartbeat: new Date().toISOString(),
          status: "Available",
          registrationStatus: "Accepted",
          endpointAddress: "https://example.com",
          vendor: "Mock Vendor",
          model: "Mock Model",
          serialNumber: "MOCK-001",
          firmwareVersion: "1.0.0",
          address: {
            street: "Mock Street",
            houseNumber: "1",
            zipCode: "12345",
            city: "Mock City",
            country: "Mock Country"
          },
          misc: {
            adminAddress: "admin@example.com",
            latitude: "0",
            longitude: "0",
            additionalNote: "This is a mock charge point"
          }
        }

        setChargePoint(mockChargePoint)
      } catch (error) {
        console.error("Failed to fetch charge point:", error)
        // Handle error state here
      } finally {
        setIsLoading(false)
      }
    }

    fetchChargePoint()
  }, [id])

  if (isLoading) {
    return <LoadingSkeleton />
  }

  if (!chargePoint) {
    return <div>Charge point not found</div>
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">
          Operations - {chargePoint.id}
        </h2>
      </div>
      <OperationsPanel chargePoint={chargePoint} />
    </div>
  )
}

function LoadingSkeleton() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <Skeleton className="h-10 w-[250px]" />
      <Skeleton className="h-[600px] w-full" />
    </div>
  )
}

