"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import 'leaflet/dist/leaflet.css'
// import { Icon } from 'leaflet'
import dynamic from "next/dynamic";

const DynamicMapContainer = dynamic(() => import('react-leaflet').then(mod => mod.MapContainer), { ssr: false })
const DynamicMarker = dynamic(() => import('react-leaflet').then(mod => mod.Marker), { ssr: false })
const DynamicPopup = dynamic(() => import('react-leaflet').then(mod => mod.Popup), { ssr: false })
const DynamicTileLayer = dynamic(() => import('react-leaflet').then(mod => mod.TileLayer), { ssr: false })

// Sample data - replace with real data
const locations = [
  { id: 1, name: "Station 1", lat: 40.7128, lng: -74.0060 },
  { id: 2, name: "Station 2", lat: 40.7580, lng: -73.9855 },
  { id: 3, name: "Station 3", lat: 40.7829, lng: -73.9654 },
]

// const customIcon = new Icon({
//   iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
//   iconSize: [25, 41],
//   iconAnchor: [12, 41],
// })

export function LocationsMap() {
  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle className="text-lg font-medium">Locations</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[400px] w-full rounded-md border">
          <DynamicMapContainer
            center={[40.7128, -74.0060]}
            zoom={13}
            style={{ height: "100%", width: "100%" }}
          >
            <DynamicTileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            {locations.map((location) => (
              <DynamicMarker
                key={location.id}
                position={[location.lat, location.lng]}
                // icon={customIcon}
              >
                <DynamicPopup>
                  {location.name}
                </DynamicPopup>
              </DynamicMarker>
            ))}
          </DynamicMapContainer>
        </div>
      </CardContent>
    </Card>
  )
}

