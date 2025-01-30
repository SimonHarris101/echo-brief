"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useQuery } from "@tanstack/react-query"
import { PlugZap, Tags, Users, Calendar, Activity, Network, Heart, Power } from 'lucide-react'

interface Statistics {
  numChargeBoxes: number
  numOcppTags: number
  numUsers: number
  numReservations: number
  numTransactions: number
  heartbeatToday: number
  heartbeatYesterday: number
  heartbeatEarlier: number
  numOcpp12JChargeBoxes: number
  numOcpp15JChargeBoxes: number
  numOcpp16JChargeBoxes: number
  statusCountMap: {
    [key: string]: number
  }
}

async function getStats(): Promise<Statistics> {
  // Simulating API call delay
  await new Promise(resolve => setTimeout(resolve, 1000))
  
  // Mock data
  return {
    numChargeBoxes: 156,
    numOcppTags: 892,
    numUsers: 1234,
    numReservations: 45,
    numTransactions: 78,
    heartbeatToday: 1456,
    heartbeatYesterday: 1389,
    heartbeatEarlier: 15678,
    numOcpp12JChargeBoxes: 23,
    numOcpp15JChargeBoxes: 45,
    numOcpp16JChargeBoxes: 88,
    statusCountMap: {
      Available: 142,
      Faulted: 8,
      Preparing: 6
    }
  }
}

export function DashboardStats() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: getStats
  })

  if (isLoading) {
    return <div>Loading...</div>
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Number of Charge Points
          </CardTitle>
          <PlugZap className="h-4 w-4 text-blue-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats?.numChargeBoxes || 0}</div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Active Transactions
          </CardTitle>
          <Activity className="h-4 w-4 text-green-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats?.numTransactions || 0}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Number of OCPP Tags
          </CardTitle>
          <Tags className="h-4 w-4 text-purple-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats?.numOcppTags || 0}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Number of Users
          </CardTitle>
          <Users className="h-4 w-4 text-indigo-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats?.numUsers || 0}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Active Reservations
          </CardTitle>
          <Calendar className="h-4 w-4 text-yellow-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats?.numReservations || 0}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Connected JSON Charge Points
          </CardTitle>
          <Network className="h-4 w-4 text-blue-500" />
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>OCPP 1.2:</span>
              <span className="font-medium">{stats?.numOcpp12JChargeBoxes || 0}</span>
            </div>
            <div className="flex justify-between">
              <span>OCPP 1.5:</span>
              <span className="font-medium">{stats?.numOcpp15JChargeBoxes || 0}</span>
            </div>
            <div className="flex justify-between">
              <span>OCPP 1.6:</span>
              <span className="font-medium">{stats?.numOcpp16JChargeBoxes || 0}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Received Heartbeats
          </CardTitle>
          <Heart className="h-4 w-4 text-red-500" />
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Today:</span>
              <span className="font-medium">{stats?.heartbeatToday || 0}</span>
            </div>
            <div className="flex justify-between">
              <span>Yesterday:</span>
              <span className="font-medium">{stats?.heartbeatYesterday || 0}</span>
            </div>
            <div className="flex justify-between">
              <span>Earlier:</span>
              <span className="font-medium">{stats?.heartbeatEarlier || 0}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Connector Status
          </CardTitle>
          <Power className="h-4 w-4 text-emerald-500" />
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Available:</span>
              <span className="font-medium">{stats?.statusCountMap?.Available || 0}</span>
            </div>
            <div className="flex justify-between">
              <span>Faulted:</span>
              <span className="font-medium">{stats?.statusCountMap?.Faulted || 0}</span>
            </div>
            <div className="flex justify-between">
              <span>Preparing:</span>
              <span className="font-medium">{stats?.statusCountMap?.Preparing || 0}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

