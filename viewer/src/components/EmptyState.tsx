interface EmptyStateProps {
    icon: string;
    title: string;
    description?: string;
    className?: string;
}

export default function EmptyState({ 
    icon, 
    title, 
    description, 
    className = '' 
}: EmptyStateProps) {
    return (
        <div class={`text-center py-8 text-gray-400 ${className}`}>
            <div class="text-4xl mb-2">{icon}</div>
            <h3 class="text-xl font-medium text-white mb-2">{title}</h3>
            {description && <p>{description}</p>}
        </div>
    );
}