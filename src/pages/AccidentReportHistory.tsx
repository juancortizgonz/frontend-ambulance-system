import { getAccidentReports } from "@/services/services"
import Table from "@/components/Table"
import { useEffect, useState } from "react"
import { AccidentReport } from "@/types/types"
import { getCoreRowModel, useReactTable } from "@tanstack/react-table"

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
            accessorKey: "id",  
        },
        {
            header: "Dirección",
            accessorKey: "address",
        },
        {
            header: "Latitud",
            accessorKey: "latitude",
        },
        {
            header: "Longitud",
            accessorKey: "longitude",
        },
        {
            header: "Severidad",
            accessorKey: "severity",
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
            <Table table={table} />
        </div>
    )
}

export default AccidentReportHistory