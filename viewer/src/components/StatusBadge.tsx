interface StatusBadgeProps {
    isConnected: boolean;
    label: string;
}

export default function StatusBadge({ isConnected, label }: StatusBadgeProps) {
    return (
        <div class={`px-3 py-2 rounded-md text-center ${
            isConnected 
                ? 'bg-green-900 text-green-200' 
                : 'bg-red-900 text-red-200'
        }`}>
            {label}
        </div>
    );
}