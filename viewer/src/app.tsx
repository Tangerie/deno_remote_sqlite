import { useEffect } from 'preact/hooks';
import { Router, Route } from 'preact-iso';
import { RemoteDatabase } from '@tangerie/deno_remote_sqlite/client';
import Header from './components/Header.tsx';
import Navigation from './components/Navigation.tsx';
import ConnectionPanel from './components/ConnectionPanel.tsx';
import TablesSidebar from './components/TablesSidebar.tsx';
import BrowseTables from './pages/BrowseTables.tsx';
import ViewSchemas from './pages/ViewSchemas.tsx';
import ExecuteSQL from './pages/ExecuteSQL.tsx';
import { DatabaseManager } from './modules/database.ts';
import { TableInfo } from './modules/types.ts';
import { 
    useAppStore, 
    openDb, 
    closeDb, 
    selectTable, 
    loadTableData as loadTableDataAction,
    setPageSize, 
    setLoading, 
    setError, 
    setTableData, 
    setTableColumns, 
    setTableInfo, 
    setTotalRows, 
    setTotalPages 
} from './stores/appStore.ts';

export default function App() {
    const { 
        db, 
        tables, 
        selectedTable, 
        tableData, 
        tableColumns, 
        loading, 
        error, 
        url, 
        tableInfo, 
        currentPage, 
        pageSize, 
        totalRows, 
        totalPages 
    } = useAppStore(state => state);

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
            await loadTableDataAction(tableName, page);
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