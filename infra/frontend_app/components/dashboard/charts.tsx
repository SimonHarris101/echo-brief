"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DonutChart } from "@tremor/react"

const chargePointsData = [
  { name: "Type 2", value: 45 },
  { name: "CCS", value: 30 },
  { name: "CHAdeMO", value: 25 },
]

const locationData = [
  { name: "New York", value: 35 },
  { name: "Los Angeles", value: 25 },
  { name: "Chicago", value: 20 },
  { name: "Houston", value: 20 },
]

export function DashboardCharts() {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Charge Points by Type</CardTitle>
        </CardHeader>
        <CardContent>
          <DonutChart
            data={chargePointsData}
            category="value"
            index="name"
            valueFormatter={(number) => `${number}%`}
            colors={["blue", "cyan", "indigo"]}
            className="h-[200px]"
          />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Locations by City</CardTitle>
        </CardHeader>
        <CardContent>
          <DonutChart
            data={locationData}
            category="value"
            index="name"
            valueFormatter={(number) => `${number}%`}
            colors={["blue", "cyan", "indigo", "violet"]}
            className="h-[200px]"
          />
        </CardContent>
      </Card>
    </div>
  )
}

