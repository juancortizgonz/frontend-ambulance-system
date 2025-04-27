import { createContext, useState, useMemo, ReactNode, useEffect } from "react"
import { AuthContextType } from "@/types/interfaces"

export const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [token, setToken] = useState<string | null>(null)
    const [role, setRole] = useState<string | null>(null)
    const [userId, setUserId] = useState<number | null>(null)

    useEffect(() => {
        const storedToken = sessionStorage.getItem("token")
        const storedRole = sessionStorage.getItem("role")
        const storedUserId = sessionStorage.getItem("userId")

        if (storedToken) setToken(storedToken)
        if (storedRole) setRole(storedRole)
        if (storedUserId) setUserId(parseInt(storedUserId))
    }, [])

    const setAuthInfo = (token: string, role: string, userId: number) => {
        setToken(token)
        setRole(role)
        setUserId(userId)
        sessionStorage.setItem("token", token)
        sessionStorage.setItem("role", role)
        sessionStorage.setItem("userId", userId.toString())
    }

    const clearAuthInfo = () => {
        setToken(null)
        setRole(null)
        setUserId(null)
        sessionStorage.removeItem("token")
        sessionStorage.removeItem("role")
        sessionStorage.removeItem("userId")
    }

    const value = useMemo(() => ({ token, role, userId, setAuthInfo, clearAuthInfo }), [token, role, userId]);

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    )
}