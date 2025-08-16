import { useState, useEffect } from 'preact/hooks';
import { RemoteDatabase } from '../../client/mod.ts';
import Header from './components/Header.tsx';
import ConnectionPanel from './components/ConnectionPanel.tsx';
import TablesSidebar from './components/TablesSidebar.tsx';
import TableDisplay from './components/TableDisplay.tsx';
import { DatabaseManager } from './modules/database.ts';
import { TableInfo } from './modules/types.ts';

export default function App() {
    const [db, setDb] = useState<RemoteDatabase | null>(null);
    const [tables, setTables] = useState<TableInfo[]>([]);
    const [selectedTable, setSelectedTable] = useState<string | null>(null);
    const [tableData, setTableData] = useState<any[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [url, setUrl] = useState<string>('ws://judy.localdomain/domain/remote');
    const [tableInfo, setTableInfo] = useState<string>('');
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [totalRows, setTotalRows] = useState<number>(0);
    const [totalPages, setTotalPages] = useState<number>(0);

    const connectToDatabase = async () => {
        try {
            setLoading(true);
            setError(null);

            const database = new RemoteDatabase(url);
            await database.open();

            const tableInfo = await DatabaseManager.loadTables(database);
            setDb(database);
            setTables(tableInfo);
        } catch (err) {
            setError(`Failed to connect to database: ${err.message}`);
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const loadTableData = async (tableName: string, page: number = 1) => {
        if (!db) return;

        try {
            setLoading(true);
            setError(null);
            setSelectedTable(tableName);
            setCurrentPage(page);

            const result = await DatabaseManager.loadTableData(db, tableName, page);
            setTableData(result.tableData);
            setTableInfo(result.tableInfo);
            setTotalRows(result.totalRows);
            setTotalPages(result.totalPages);
        } catch (err) {
            setError(`Failed to load table data: ${err.message}`);
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const disconnect = () => {
        if (db) {
            db.close();
            setDb(null);
            setTables([]);
            setSelectedTable(null);
            setTableData([]);
            setTableInfo('');
            setCurrentPage(1);
            setTotalRows(0);
            setTotalPages(0);
        }
    };

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (db) {
                db.close();
            }
        };
    }, [db]);

    return (
        <div class="min-h-screen bg-gray-900 p-4">
            <div class="container mx-auto px-4 py-8">
                <Header />
                <ConnectionPanel 
                    db={db}
                    url={url}
                    setUrl={setUrl}
                    setDb={setDb}
                    setTables={setTables}
                    setLoading={setLoading}
                    setError={setError}
                />
                <div class="flex flex-col lg:flex-row gap-6">
                    <TablesSidebar 
                        tables={tables}
                        selectedTable={selectedTable}
                        loading={loading}
                        db={db}
                        loadTableData={(tableName) => loadTableData(tableName, 1)}
                    />
                    <TableDisplay 
                        selectedTable={selectedTable}
                        tableData={tableData}
                        tableInfo={tableInfo}
                        loading={loading}
                        error={error}
                        currentPage={currentPage}
                        totalPages={totalPages}
                        totalRows={totalRows}
                        onPageChange={(page) => selectedTable && loadTableData(selectedTable, page)}
                    />
                </div>
            </div>
        </div>
    );
}