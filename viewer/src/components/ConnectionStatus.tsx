interface ConnectionStatusProps {
    isConnected: boolean;
}

export default function ConnectionStatus({ isConnected }: ConnectionStatusProps) {
    return (
        <div class={`px-3 py-2 rounded-md ${isConnected ? 'bg-green-900 text-green-200' : 'bg-red-900 text-red-200'}`}>
            {isConnected ? 'Connected' : 'Disconnected'}
        </div>
    );
}