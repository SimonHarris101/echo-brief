import { createContext } from 'react'

export interface ChargePoint {
  id: string
  name: string
  status: string
}

export const ChargePointsContext = createContext<{
  chargePoints: ChargePoint[]
  setChargePoints: (chargePoints: ChargePoint[]) => void
}>({
  chargePoints: [],
  setChargePoints: () => {},
}) 