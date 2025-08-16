interface ResultsTableProps {
    results: any[];
}

export default function ResultsTable({ results }: ResultsTableProps) {
    if (!results || results.length === 0) {
        return null;
    }

    const columns = Object.keys(results[0]);

    return (
        <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-700">
                <thead class="bg-gray-750">
                    <tr>
                        {columns.map((column) => (
                            <th
                                key={column}
                                class="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider"
                            >
                                {column}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody class="bg-gray-800 divide-y divide-gray-700">
                    {results.map((row, rowIndex) => (
                        <tr key={rowIndex} class="hover:bg-gray-750">
                            {columns.map((key, colIndex) => (
                                <td key={colIndex} class="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                                    {row[key] !== null && row[key] !== undefined ? String(row[key]) : 'NULL'}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}