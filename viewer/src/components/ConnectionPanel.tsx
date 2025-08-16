import { RemoteDatabase } from '@tangerie/deno_remote_sqlite/client';
import { DatabaseManager } from '../modules/database.ts';
import { TableInfo } from '../modules/types.ts';
import { useAppStore, openDb, closeDb, setUrl, setLoading, setError, setTables } from '../stores/appStore.ts';

export default function ConnectionPanel() {
    const { db, url } = useAppStore(state => ({
        db: state.db,
        url: state.url
    }));

    const connectToDatabase = async () => {
        // Using the new openDb action which encapsulates the connection logic
        await openDb(url);
    };

    const disconnect = () => {
        closeDb();
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
                        onInput={(e) => setUrl((e.target as HTMLInputElement).value)}
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