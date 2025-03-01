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


// Auth
export interface AuthContextType {
    token: string | null
    role: string | null
    userId: number | null
    email: string | null
    setAuthInfo: (token: string, role: string, userId: number, email: string) => void
    clearAuthInfo: () => void
}