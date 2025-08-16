import { useState } from 'preact/hooks';
import { RemoteDatabase } from '../../../client/mod.ts';
import { DatabaseManager } from '../modules/database.ts';
import { TableInfo } from '../modules/types.ts';

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

    const disconnect = () => {
        if (db) {
            db.close();
            setDb(null);
            setTables([]);
        }
    };

    return (
        <div class="bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
            <h2 class="text-2xl font-semibold text-white mb-4">Database Connection</h2>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                    <label class="block text-sm font-medium text-gray-300 mb-1">WebSocket URL</label>
                    <input
                        type="text"
                        value={url}
                        onInput={(e) => setUrl(e.target.value)}
                        class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
                        placeholder="wss://your-database-server.com"
                    />
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-300 mb-1">Status</label>
                    <div class={`px-3 py-2 rounded-md ${db ? 'bg-green-900 text-green-200' : 'bg-red-900 text-red-200'}`}>
                        {db ? 'Connected' : 'Disconnected'}
                    </div>
                </div>
                <div class="flex items-end">
                    <button
                        onClick={db ? disconnect : connectToDatabase}
                        class="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition duration-300"
                    >
                        {db ? 'Disconnect' : 'Connect'}
                    </button>
                </div>
            </div>
        </div>
    );
}