import { useState } from 'preact/hooks';
import { RemoteDatabase } from '../../../client/mod.ts';

interface TableInfo {
    name: string;
    columns: string[];
}

interface ConnectionPanelProps {
    db: RemoteDatabase | null;
    url: string;
    setUrl: (url: string) => void;
    setDb: (db: RemoteDatabase | null) => void;
    setTables: (tables: TableInfo[]) => void;
    setLoading: (loading: boolean) => void;
    setError: (error: string | null) => void;
}

export default function ConnectionPanel({
    db,
    url,
    setUrl,
    setDb,
    setTables,
    setLoading,
    setError
}: ConnectionPanelProps) {
    const connectToDatabase = async () => {
        try {
            setLoading(true);
            setError(null);

            const database = new RemoteDatabase(url);
            await database.open();

            // Get list of tables
            const tableRows = await database.run("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name");
            console.log(tableRows);

            // Get column info for each table
            const tableInfo: TableInfo[] = [];
            for (const row of tableRows) {
                const columnRows = await database.run(`PRAGMA table_info("${row.name}")`);
                console.log(columnRows);

                tableInfo.push({
                    name: row.name,
                    columns: columnRows.map(col => col.name)
                });
            }

            setDb(database);
            setTables(tableInfo);
        } catch (err) {
            setError(`Failed to connect to database: ${err.message}`);
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
        }
    };

    return (
        <div class="bg-white rounded-lg shadow-lg p-6 mb-8">
            <h2 class="text-2xl font-semibold text-gray-800 mb-4">Database Connection</h2>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">WebSocket URL</label>
                    <input
                        type="text"
                        value={url}
                        onInput={(e) => setUrl(e.target.value)}
                        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="wss://your-database-server.com"
                    />
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <div class={`px-3 py-2 rounded-md ${db ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {db ? 'Connected' : 'Disconnected'}
                    </div>
                </div>
                <div class="flex items-end">
                    <button
                        onClick={db ? disconnect : connectToDatabase}
                        class="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-md transition duration-300"
                    >
                        {db ? 'Disconnect' : 'Connect'}
                    </button>
                </div>
            </div>
        </div>
    );
}