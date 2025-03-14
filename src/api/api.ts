import axios from "axios"

type AuthToken = string | null


const authToken: AuthToken = localStorage.getItem("token")
const api = axios.create({
    baseURL: `http://localhost:8000/api/v1`,
    headers: {
        'Content-Type': 'application/json',
        'Authorization': `Token ${authToken}`,
    }
})

export default api