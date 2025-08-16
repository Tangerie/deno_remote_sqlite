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
import { useAppStore, appActions } from './stores/appStore.ts';

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
            appActions.setLoading(true);
            appActions.setError(null);
            appActions.setSelectedTable(tableName);
            appActions.setCurrentPage(page);
            if (newPageSize !== undefined) {
                appActions.setPageSize(newPageSize);
            }

            const result = await DatabaseManager.loadTableData(db, tableName, page, effectivePageSize);
            appActions.setTableData(result.tableData);
            
            // Store column information for placeholder rows
            if (result.tableData.length > 0) {
                appActions.setTableColumns(Object.keys(result.tableData[0]));
            } else {
                // Get columns from table info
                const table = tables.find(t => t.name === tableName);
                if (table) {
                    appActions.setTableColumns(table.columns);
                }
            }
            
            appActions.setTableInfo(result.tableInfo);
            appActions.setTotalRows(result.totalRows);
            appActions.setTotalPages(result.totalPages);
        } catch (err: any) {
            appActions.setError(`Failed to load table data: ${err.message}`);
            console.error(err);
        } finally {
            appActions.setLoading(false);
        }
    };

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (db) {
                db.close();
                appActions.setDb(null);
            }
        };
    }, [db]);

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