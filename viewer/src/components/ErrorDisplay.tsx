interface ErrorDisplayProps {
    error: string;
    className?: string;
}

export default function ErrorDisplay({ error, className = '' }: ErrorDisplayProps) {
    return (
        <div class={`bg-red-900 border-l-4 border-red-500 p-4 mb-4 ${className}`}>
            <div class="flex">
                <div class="flex-shrink-0">
                    <div class="w-5 h-5 text-red-500">⚠</div>
                </div>
                <div class="ml-3">
                    <p class="text-sm text-red-200">{error}</p>
                </div>
            </div>
        </div>
    );
}