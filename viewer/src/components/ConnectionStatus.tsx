import StatusBadge from './StatusBadge.tsx';

interface ConnectionStatusProps {
    isConnected: boolean;
}

export default function ConnectionStatus({ isConnected }: ConnectionStatusProps) {
    return (
        <StatusBadge 
            isConnected={isConnected} 
            label={isConnected ? 'Connected' : 'Disconnected'} 
        />
    );
}