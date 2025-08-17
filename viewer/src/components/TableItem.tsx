import { useUIStore } from '../stores/uiStore.ts';
import { useDatabaseStore } from '../stores/databaseStore.ts';
import TableItemLoading from './TableItemLoading.tsx';

interface TableItemProps {
    tableName: string;
    isSelected: boolean;
    onClick: () => void;
}

export default function TableItem({ tableName, isSelected, onClick }: TableItemProps) {
    const { loading } = useUIStore(state => ({
        loading: state.loading
    }));
    const { selectedTable } = useDatabaseStore(state => ({
        selectedTable: state.selectedTable
    }));

    const isLoading = loading && isSelected && selectedTable === tableName;

    if (isLoading) {
        return <TableItemLoading tableName={tableName} isSelected={isSelected} />;
    }

    return (
        <li>
            <button
                onClick={onClick}
                disabled={loading}
                class={`w-full text-left px-4 py-2 rounded-md transition duration-200 flex items-center ${
                    isSelected
                        ? 'bg-blue-900 text-blue-100'
                        : 'hover:bg-gray-700 text-gray-200'
                } ${loading && !isSelected ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
                <span class={`mr-3 ${isSelected ? 'text-blue-400' : 'text-blue-300'}`}>📋</span>
                {tableName}
            </button>
        </li>
    );
}