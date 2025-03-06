import { AccidentReport } from "@/types/types";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import Papa from "papaparse";

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

export const downloadCSV = (data: AccidentReport[], columns: Column[]) => {
    const csv = Papa.unparse(data);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "accident_reports.csv");
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};