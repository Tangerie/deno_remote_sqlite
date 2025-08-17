interface ResultsTableHeaderProps {
    columns: string[];
}

export default function ResultsTableHeader({ columns }: ResultsTableHeaderProps) {
    return (
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
    );
}