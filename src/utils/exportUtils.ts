import { AccidentReport } from "@/types/types";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface Column {
    header: string;
    accessorKey: keyof AccidentReport;
}

export const downloadPDF = (data: AccidentReport[], columns: Column[]) => {
    const doc = new jsPDF();
    const tableColumn = columns.map(col => col.header)
    const tableRows = data.map(row => columns.map(col => row[col.accessorKey]))

    autoTable(doc, {
        head: [tableColumn],
        body: tableRows
    })
    doc.save("accident-report-history.pdf")
};