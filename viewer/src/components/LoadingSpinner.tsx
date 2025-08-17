interface LoadingSpinnerProps {
    size?: 'sm' | 'md' | 'lg';
    className?: string;
}

export default function LoadingSpinner({ 
    size = 'md', 
    className = '' 
}: LoadingSpinnerProps) {
    const sizeClasses = {
        sm: 'h-4 w-4',
        md: 'h-8 w-8',
        lg: 'h-12 w-12'
    };
    
    const borderClasses = {
        sm: 'border-2',
        md: 'border-4',
        lg: 'border-4'
    };
    
    return (
        <div class={`flex justify-center items-center ${className}`}>
            <div class={`${sizeClasses[size]} ${borderClasses[size]} border-gray-600 border-t-blue-500 rounded-full animate-spin`}></div>
        </div>
    );
}