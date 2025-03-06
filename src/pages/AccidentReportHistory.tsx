import { getAccidentReports } from "@/services/services"
import Table from "@/components/Table"
import { useEffect, useState } from "react"
import { AccidentReport } from "@/types/types"
import { getCoreRowModel, useReactTable } from "@tanstack/react-table"
import { downloadPDF } from "@/utils/exportUtils"

const AccidentReportHistory = () => {
    const [data, setData] = useState<AccidentReport[]>(() => [])

    useEffect(() => {
        const fetchData = async () => {
            try {
                const dataFromApi = await getAccidentReports();
                setData(dataFromApi);
                console.log(`Longitud de los reportes obtenidos: ${dataFromApi.length}`);
            } catch (error) {
                console.error("Error fetching accident reports:", error);
            }
        };
        fetchData();
    }, []);

    const columns = [
        {
            header: "ID",
            accessorKey: "id" as keyof AccidentReport,  
        },
        {
            header: "Dirección",
            accessorKey: "address" as keyof AccidentReport,
        },
        {
            header: "Latitud",
            accessorKey: "latitude" as keyof AccidentReport,
        },
        {
            header: "Longitud",
            accessorKey: "longitude" as keyof AccidentReport,
        },
        {
            header: "Severidad",
            accessorKey: "severity" as keyof AccidentReport,
        }
    ]

    const table = useReactTable({
        columns,
        data,
        getCoreRowModel: getCoreRowModel(),
    })

    console.log(data) // ToDo: Remove this line

    return (
        <div className="container mx-auto p-4 flex flex-col items-center">
            <h1 className="font-bold text-2xl my-4">Accident report history</h1>
            <div className="mb-4">
                <button onClick={() => downloadPDF(data, columns)} className="mr-2 p-2 bg-blue-500 text-white rounded">Download PDF</button>
            </div>
            <Table table={table} />
        </div>
    )
}

export default AccidentReportHistory