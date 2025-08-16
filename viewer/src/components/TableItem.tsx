import { useUIStore } from '../stores/uiStore.ts';
import { useDatabaseStore } from '../stores/databaseStore.ts';

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

    return (
        <li>
            <button
                onClick={onClick}
                disabled={loading}
                class={`w-full text-left px-4 py-2 rounded-md transition duration-200 flex items-center ${
                    isLoading
                        ? 'bg-blue-900 text-blue-100 cursor-wait'
                        : isSelected
                            ? 'bg-blue-900 text-blue-100'
                            : 'hover:bg-gray-700 text-gray-200'
                } ${loading && !isSelected ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
                {isLoading ? (
                    <>
                        <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-blue-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span>{tableName}</span>
                    </>
                ) : (
                    <>
                        <span class={`mr-3 ${isSelected ? 'text-blue-400' : 'text-blue-300'}`}>📋</span>
                        {tableName}
                    </>
                )}
            </button>
        </li>
    );
}