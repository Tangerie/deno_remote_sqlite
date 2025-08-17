import { useState } from 'preact/hooks';
import { useDatabaseStore } from '../stores/databaseStore.ts';
import { useUIStore } from '../stores/uiStore.ts';
import ResultsTable from '../components/ResultsTable.tsx';
import LoadingSpinner from '../components/LoadingSpinner.tsx';
import ErrorDisplay from '../components/ErrorDisplay.tsx';
import EmptyState from '../components/EmptyState.tsx';
import Button from '../components/Button.tsx';

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
                    <Button
                        onClick={executeQuery}
                        disabled={loading || executing || !query.trim() || !db}
                        variant="primary"
                        loading={executing}
                    >
                        Execute Query
                    </Button>
                </div>
            </div>
            
            {executing && (
                <div class="flex justify-center items-center h-32">
                    <LoadingSpinner size="md" />
                </div>
            )}
            
            {error && <ErrorDisplay error={error} />}
            
            {results && (
                <div class="mt-6">
                    <h3 class="text-lg font-medium text-white mb-3">Results</h3>
                    <ResultsTable results={results} />
                </div>
            )}
            
            {!results && !error && !executing && (
                <EmptyState 
                    icon="▶️" 
                    title="Execute SQL Query" 
                    description="Enter a SQL query and click &quot;Execute Query&quot; to run it" 
                />
            )}
        </div>
    );
}