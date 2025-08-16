import { useDatabaseStore, openDb, closeDb, setUrl } from '../stores/databaseStore.ts';
import { useUIStore } from '../stores/uiStore.ts';
import ConnectionStatus from './ConnectionStatus.tsx';

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
                    <button
                        onClick={db ? disconnect : connectToDatabase}
                        disabled={loading}
                        class={`w-full font-medium py-2 px-4 rounded-md transition duration-300 flex items-center justify-center ${
                            loading 
                                ? 'bg-gray-600 text-gray-400 cursor-not-allowed' 
                                : db 
                                    ? 'bg-red-600 hover:bg-red-700 text-white' 
                                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                        }`}
                    >
                        {loading ? (
                            <>
                                <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Connecting...
                            </>
                        ) : db ? 'Disconnect' : 'Connect'}
                    </button>
                </div>
            </div>
        </div>
    );
}