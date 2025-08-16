import { useEffect } from 'preact/hooks';
import { Router, Route } from 'preact-iso';
import Header from './components/Header.tsx';
import Navigation from './components/Navigation.tsx';
import ConnectionPanel from './components/ConnectionPanel.tsx';
import TablesSidebar from './components/TablesSidebar.tsx';
import BrowseTables from './pages/BrowseTables.tsx';
import ViewSchemas from './pages/ViewSchemas.tsx';
import ExecuteSQL from './pages/ExecuteSQL.tsx';
import { 
    useDatabaseStore, 
    openDb, 
    closeDb, 
    selectTable 
} from './stores/databaseStore.ts';
import { 
    useTableDataStore,
    loadTableData as loadTableDataAction,
    setPageSize
} from './stores/tableDataStore.ts';
import { 
    useUIStore,
    setLoading,
    setError
} from './stores/uiStore.ts';

export default function App() {
    const { db, tables, selectedTable, url } = useDatabaseStore(state => state);
    const { 
        tableData, 
        tableColumns, 
        tableInfo, 
        currentPage, 
        pageSize, 
        totalRows, 
        totalPages 
    } = useTableDataStore(state => state);
    const { loading, error } = useUIStore(state => state);

    const loadTableData = async (tableName: string, page: number, newPageSize?: number) => {
        if (!db) return;
        
        const effectivePageSize = newPageSize !== undefined ? newPageSize : pageSize;

        try {
            setLoading(true);
            setError(null);
            await selectTable(tableName);
            
            if (newPageSize !== undefined) {
                setPageSize(newPageSize);
            }

            // Load the table data after selecting the table
            await loadTableDataAction(db, tableName, page, effectivePageSize, tables);
        } catch (err: any) {
            setError(`Failed to load table data: ${err.message}`);
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            closeDb();
        };
    }, []);

    return (
        <div class="min-h-screen bg-gray-900 p-4">
            <div class="container mx-auto px-4 py-8">
                <Header />
                <ConnectionPanel />
                
                <div class="flex flex-col lg:flex-row gap-6">
                    {/* Tables Sidebar - always visible */}
                    <TablesSidebar 
                        loadTableData={(tableName) => loadTableData(tableName, 1)}
                    />
                    
                    <div class="flex-1">
                        {/* Navigation */}
                        <Navigation />
                        
                        {/* Router for tab content */}
                        <Router>

                            <Route 
                                path="/browse" 
                                component={() => (
                                    <BrowseTables
                                        loadTableData={loadTableData}
                                    />
                                )} 
                            />
                            <Route 
                                path="/schema" 
                                component={() => (
                                    <ViewSchemas />
                                )} 
                            />
                            <Route 
                                path="/sql" 
                                component={() => (
                                    <ExecuteSQL />
                                )} 
                            />
                        </Router>
                    </div>
                </div>
            </div>
        </div>
    );
}