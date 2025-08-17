interface ResultsTableBodyProps {
    data: any[];
    columns: string[];
}

export default function ResultsTableBody({ data, columns }: ResultsTableBodyProps) {
    return (
        <tbody class="bg-gray-800 divide-y divide-gray-700">
            {data.map((row, rowIndex) => (
                <tr key={rowIndex} class="hover:bg-gray-750">
                    {columns.map((key, colIndex) => (
                        <td key={colIndex} class="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                            {row[key] !== null && row[key] !== undefined ? String(row[key]) : 'NULL'}
                        </td>
                    ))}
                </tr>
            ))}
        </tbody>
    );
}