import { getAccidentReports } from "@/services/services"
import Table from "@/components/Table"
import { useEffect, useState } from "react"
import { AccidentReport } from "@/types/types"
import { getCoreRowModel, useReactTable } from "@tanstack/react-table"
import { downloadPDF, downloadCSV } from "@/utils/exportUtils"
import { format } from "date-fns"
import { info } from "console"

const AccidentReportHistory = () => {
    const [data, setData] = useState<AccidentReport[]>(() => [])

    useEffect(() => {
        const fetchData = async () => {
            try {
                const dataFromApi = await getAccidentReports();
                setData(dataFromApi);
            } catch (error) {
                console.error("Error fetching accident reports:", error);
            }
        };
        fetchData();
    }, []);

    console.log(`Data from the API: ${JSON.stringify(data)}`)

    const columns = [
        { header: "ID", accessorKey: "id" as keyof AccidentReport },
        { 
            header: "Fecha del accidente",
            accessorKey: "accident_time" as keyof AccidentReport,
            cell: info => format(new Date(info.row.original.accident_time), "dd/MM/yyyy HH:mm")
        },
        { header: "Dirección", accessorKey: "address" as keyof AccidentReport },
        { header: "Latitud", accessorKey: "latitude" as keyof AccidentReport },
        { header: "Longitud", accessorKey: "longitude" as keyof AccidentReport },
        { 
            header: "¿Está activo?", 
            accessorKey: "is_active" as keyof AccidentReport,
            cell: info => info.row.original.is_active ? "Sí" : "No"
        },
        { 
            header: "¿Está resuelto?", 
            accessorKey: "is_resolved" as keyof AccidentReport,
            cell: info => info.row.original.is_resolved ? "Sí" : "No"
        },
        { header: "Descripción", accessorKey: "description" as keyof AccidentReport },
        { 
            header: "Severidad", 
            accessorKey: "severity" as keyof AccidentReport,
            cell: info => info.row.original.severity === "BASIC" ? "Básica" : "UCI"
        }
    ]

    const table = useReactTable({
        columns,
        data,
        getCoreRowModel: getCoreRowModel(),
    })

    return (
        <div className="container mx-auto p-4 flex flex-col items-center">
            <h1 className="font-bold text-2xl my-4">Accident report history</h1>
            <div className="mb-4">
                <button onClick={() => downloadPDF(data, columns)} className="mr-2 p-2 bg-blue-500 text-white rounded">Download PDF</button>
                <button onClick={() => downloadCSV(data, columns)} className="p-2 bg-green-500 text-white rounded">Download CSV</button>
            </div>
            <Table table={table} />
        </div>
    )
}

export default AccidentReportHistory