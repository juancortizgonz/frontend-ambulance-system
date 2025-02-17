import api from "@/api/api"
import { AccidentReport } from "@/types/interfaces";

export const reportAccident = async (data: AccidentReport) => {
    try {
        const token: string | null = localStorage.getItem("token")
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