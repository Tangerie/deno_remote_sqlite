import { useState } from 'preact/hooks';
import { useDatabaseStore } from '../stores/databaseStore.ts';
import { useUIStore } from '../stores/uiStore.ts';
import ResultsTable from '../components/ResultsTable.tsx';

export default function ExecuteSQL() {
    const { db } = useDatabaseStore(state => ({
        db: state.db
    }));
    const { loading } = useUIStore(state => ({
        loading: state.loading
    }));
    
    const [query, setQuery] = useState<string>('');
    const [results, setResults] = useState<any[] | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [executing, setExecuting] = useState<boolean>(false);

    const executeQuery = async () => {
        if (!db || !query.trim()) return;
        
        try {
            setExecuting(true);
            setError(null);
            setResults(null);
            
            // This is a placeholder - in a real implementation, you would execute the query
            // const result = await db.execute(query);
            // setResults(result);
            
            // For now, we'll just simulate a delay and show a placeholder result
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Placeholder result
            setResults([
                { id: 1, name: 'John Doe', email: 'john@example.com' },
                { id: 2, name: 'Jane Smith', email: 'jane@example.com' },
                { id: 3, name: 'Bob Johnson', email: 'bob@example.com' }
            ]);
        } catch (err: any) {
            setError(`Query execution failed: ${err.message}`);
        } finally {
            setExecuting(false);
        }
    };

    return (
        <div class="bg-gray-800 rounded-lg shadow-lg p-6">
            <h2 class="text-2xl font-semibold text-white mb-6">Execute SQL</h2>
            
            <div class="mb-6">
                <label for="sql-query" class="block text-sm font-medium text-gray-300 mb-2">
                    SQL Query
                </label>
                <textarea
                    id="sql-query"
                    value={query}
                    onChange={(e) => setQuery(e.currentTarget.value)}
                    class="w-full h-32 bg-gray-750 text-white rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                    placeholder="SELECT * FROM table_name;"
                    disabled={loading || executing}
                />
                
                <div class="mt-3 flex justify-end">
                    <button
                        onClick={executeQuery}
                        disabled={loading || executing || !query.trim() || !db}
                        class={`px-4 py-2 rounded-md font-medium transition duration-300 ${
                            loading || executing || !query.trim() || !db
                                ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                                : 'bg-blue-600 hover:bg-blue-700 text-white'
                        }`}
                    >
                        {executing ? 'Executing...' : 'Execute Query'}
                    </button>
                </div>
            </div>
            
            {executing && (
                <div class="flex justify-center items-center h-32">
                    <div class="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                </div>
            )}
            
            {error && (
                <div class="bg-red-900 border-l-4 border-red-500 p-4 mb-4">
                    <div class="flex">
                        <div class="flex-shrink-0">
                            <div class="w-5 h-5 text-red-500">⚠</div>
                        </div>
                        <div class="ml-3">
                            <p class="text-sm text-red-200">{error}</p>
                        </div>
                    </div>
                </div>
            )}
            
            {results && (
                <div class="mt-6">
                    <h3 class="text-lg font-medium text-white mb-3">Results</h3>
                    <ResultsTable results={results} />
                </div>
            )}
            
            {!results && !error && !executing && (
                <div class="text-center py-8 text-gray-400">
                    <div class="text-4xl mb-2">▶️</div>
                    <p>Enter a SQL query and click "Execute Query" to run it</p>
                </div>
            )}
        </div>
    );
}