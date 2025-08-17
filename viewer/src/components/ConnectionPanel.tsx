import { useDatabaseStore, openDb, closeDb, setUrl } from '../stores/databaseStore.ts';
import { useUIStore } from '../stores/uiStore.ts';
import ConnectionStatus from './ConnectionStatus.tsx';
import Button from './Button.tsx';

export default function ConnectionPanel() {
    const { db, url } = useDatabaseStore(state => ({
        db: state.db,
        url: state.url
    }));
    const { loading } = useUIStore(state => ({
        loading: state.loading
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
                    <ConnectionStatus isConnected={!!db} />
                </div>
                <div class="flex items-end">
                    <Button
                        onClick={db ? disconnect : connectToDatabase}
                        disabled={loading}
                        variant={db ? "danger" : "primary"}
                        className="w-full"
                        loading={loading}
                    >
                        {db ? 'Disconnect' : 'Connect'}
                    </Button>
                </div>
            </div>
        </div>
    );
}