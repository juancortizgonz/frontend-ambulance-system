export interface AccidentReport {
    accidentTime?: string
    createdAt?: string
    updatedAt?: string
    description: string
    isActive: boolean
    isResolved: boolean
    resolvedAt?: string
    latitude: number
    longitude: number
    address: string
    assignedAmbulance: number | null
    severity: string
}