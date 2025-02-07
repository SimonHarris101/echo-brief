"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangle, Zap, Battery, Users, BatteryChargingIcon as ChargingPile, MapPin } from 'lucide-react'

interface OverviewCardProps {
  title: string
  value: string | number
  icon: React.ReactNode
  subtitle?: string
}

function OverviewCard({ title, value, icon, subtitle }: OverviewCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">
          {title}
        </CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {subtitle && (
          <p className="text-xs text-muted-foreground">{subtitle}</p>
        )}
      </CardContent>
    </Card>
  )
}

export function OverviewCards() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <OverviewCard
        title="Faults & Connectivity Loss"
        value="4"
        icon={<AlertTriangle className="h-4 w-4 text-yellow-500" />}
      />
      <OverviewCard
        title="Active Charging Sessions"
        value="2,031"
        icon={<Battery className="h-4 w-4 text-green-500" />}
      />
      <OverviewCard
        title="Charging Sessions"
        value="103.27k"
        icon={<Battery className="h-4 w-4 text-blue-500" />}
      />
      <OverviewCard
        title="Total Energy"
        value="1,482,989"
        subtitle="kWh"
        icon={<Zap className="h-4 w-4 text-yellow-500" />}
      />
      <OverviewCard
        title="Total Revenue"
        value="$355,917.36"
        icon={<span className="text-green-500 font-bold">$</span>}
      />
      <OverviewCard
        title="New Users"
        value="1,003"
        icon={<Users className="h-4 w-4 text-blue-500" />}
      />
      <OverviewCard
        title="New Charge Points"
        value="750"
        icon={<ChargingPile className="h-4 w-4 text-purple-500" />}
      />
    </div>
  )
}

