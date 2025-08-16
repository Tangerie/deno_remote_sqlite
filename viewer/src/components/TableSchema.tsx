import { TableInfo } from '../modules/types.ts';

interface TableSchemaProps {
    table: TableInfo;
    isSelected: boolean;
}

export default function TableSchema({ table, isSelected }: TableSchemaProps) {
    return (
        <div 
            class={`bg-gray-750 rounded-lg p-4 border-l-4 ${isSelected ? 'border-blue-500' : 'border-gray-600'}`}
        >
            <div class="flex justify-between items-center">
                <h3 class="text-xl font-medium text-white">{table.name}</h3>
            </div>
            
            <div class="mt-3">
                <h4 class="text-sm font-medium text-gray-300 mb-2">Columns:</h4>
                <div class="flex flex-wrap gap-2">
                    {table.columns.map((column) => (
                        <span 
                            key={column} 
                            class="bg-gray-700 text-gray-300 px-2 py-1 rounded text-sm"
                        >
                            {column}
                        </span>
                    ))}
                </div>
            </div>
        </div>
    );
}