import { createContext, useState, useMemo, ReactNode, useEffect } from "react"
import { AuthContextType } from "@/types/interfaces"

export const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [token, setToken] = useState<string | null>(null)
    const [role, setRole] = useState<string | null>(null)
    const [userId, setUserId] = useState<number | null>(null)
    const [email, setEmail] = useState<string | null>(null)

    useEffect(() => {
        const storedToken = localStorage.getItem("token")
        const storedRole = localStorage.getItem("role")
        const storedUserId = localStorage.getItem("userId")
        const storedEmail = localStorage.getItem("email")

        if (storedToken) setToken(storedToken)
        if (storedRole) setRole(storedRole)
        if (storedUserId) setUserId(parseInt(storedUserId))
        if (storedEmail) setEmail(storedEmail)
    }, [])

    const setAuthInfo = (token: string, role: string, userId: number, email: string) => {
        setToken(token)
        setRole(role)
        setUserId(userId)
        setEmail(email)
        localStorage.setItem("token", token)
        localStorage.setItem("role", role)
        localStorage.setItem("userId", userId.toString())
        localStorage.setItem("email", email)
    }

    const clearAuthInfo = () => {
        setToken(null)
        setRole(null)
        setUserId(null)
        setEmail(null)
        localStorage.removeItem("token")
        localStorage.removeItem("role")
        localStorage.removeItem("userId")
        localStorage.removeItem("email")
    }

    const value = useMemo(() => ({ token, role, userId, email, setAuthInfo, clearAuthInfo }), [token, role, userId, email]);

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    )
}