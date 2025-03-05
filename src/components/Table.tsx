import { flexRender, Table as TableType } from "@tanstack/react-table"
import React from "react"


interface TableProps {
    table: TableType<any>
}

const Table: React.FC<TableProps> = ({ table }) => {

    return (
        <div className="h-full w-3/4 overflow-x-auto mx-auto mt-4">
            <table className="w-full min-w-max table table-xs">
            <thead>
                {table.getHeaderGroups().map(headerGroup => (
                    <tr key={headerGroup.id}>
                        {headerGroup.headers.map(header => (
                            <th 
                                key={header.id}
                                className="border-b border-blue-gray-100 bg-blue-gray-50 p-4"
                            >
                                {header.isPlaceholder
                                    ? null
                                    : flexRender(
                                        header.column.columnDef.header,
                                        header.getContext()
                                    )}
                            </th>
                        ))}
                    </tr>
                ))}
            </thead>
            <tbody>
                {table.getRowModel().rows.map(row => (
                    <tr key={row.id} className="border-b border-blue-gray-100">
                        {row.getVisibleCells().map(cell => (
                            <td key={cell.id} className="px-4 py-7">
                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                            </td>
                        ))}
                    </tr>
                ))}
            </tbody>
        </table>
        </div>
        
    )
}

export default Table