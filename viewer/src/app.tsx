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

    const loadTableData = async (tableName: string) => {
        if (!db) return;

        try {
            setLoading(true);
            setError(null);
            setSelectedTable(tableName);

            const { tableData, tableInfo } = await DatabaseManager.loadTableData(db, tableName);
            setTableData(tableData);
            setTableInfo(tableInfo);
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
        <div class="min-h-screen bg-gray-50 p-4">
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
                        loadTableData={loadTableData}
                    />
                    <TableDisplay 
                        selectedTable={selectedTable}
                        tableData={tableData}
                        tableInfo={tableInfo}
                        loading={loading}
                        error={error}
                    />
                </div>
            </div>
        </div>
    );
}