import api from "@/api/api"
import { AccidentReport } from "@/types/interfaces";

export const reportAccident = async (data: AccidentReport) => {
    try {
        const token: string | null = sessionStorage.getItem("token")
        if (!token) {
            console.error("Es necesario incluir el token en cada petición a la API.")
        }

        let config = {
            headers: {
                Authorization: `Token ${token}`
            }
        }
        console.log(config.headers)

        const response = await api.post("/accident-reports/", data, config)
        return response.data
    } catch (error) {
        console.error(`Error reportando el accidente: ${error}`)
        throw error
    }
}

export const getAccidentReports = async () => {
    try {
        const token: string | null = sessionStorage.getItem("token")
        if (!token) {
            throw new Error("Es necesario incluir el token en cada petición a la API.")
        }

        let config = {
            headers: {
                Authorization: `Token ${token}`
            }
        }
        console.log(config.headers)

        const response = await api.get("/accident-reports", config)
        return response.data
    } catch (error) {
        console.error(`Error obteniendo los reportes de accidentes: ${error}`)
        throw error
    }
}