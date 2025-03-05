import { getAccidentReports } from "@/services/services"
import { useEffect, useState } from "react"

const AccidentReportHistory = () => {
    const [accidentReportData, setAccidentReportData] = useState([])

    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await getAccidentReports();
                setAccidentReportData(data);
                console.log(`Longitud de los reportes obtenidos: ${data.length}`);
            } catch (error) {
                console.error("Error fetching accident reports:", error);
            }
        };
        fetchData();
    }, []);

    console.log(accidentReportData) // ToDo: Remove this line

    return (
        <div>
            <h1>Accident report history</h1>
        </div>
    )
}

export default AccidentReportHistory