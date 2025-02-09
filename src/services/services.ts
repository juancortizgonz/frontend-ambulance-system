import api from "@/api/api"
import { AccidentReport } from "@/types/interfaces";

export const reportAccident = async (data: AccidentReport) => {
    try {
        const response = await api.post("/accident-reports", data)
        return response.data
    } catch (error) {
        console.error(`Error reportando el accidente: ${error}`)
        throw error
    }
}