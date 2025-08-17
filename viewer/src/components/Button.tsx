import { JSX } from "preact";

interface ButtonProps {
    children: preact.ComponentChildren;
    onClick?: (e: JSX.TargetedMouseEvent<HTMLButtonElement>) => void;
    type?: "button" | "submit" | "reset";
    variant?: "primary" | "secondary" | "danger" | "success";
    size?: "sm" | "md" | "lg";
    disabled?: boolean;
    className?: string;
    loading?: boolean;
}

export default function Button({
    children,
    onClick,
    type = "button",
    variant = "primary",
    size = "md",
    disabled = false,
    className = "",
    loading = false
}: ButtonProps) {
    const baseClasses = "font-medium rounded-md transition duration-300 flex items-center justify-center";
    
    const variantClasses = {
        primary: "bg-blue-600 hover:bg-blue-700 text-white",
        secondary: "bg-gray-600 hover:bg-gray-700 text-white",
        danger: "bg-red-600 hover:bg-red-700 text-white",
        success: "bg-green-600 hover:bg-green-700 text-white"
    };
    
    const sizeClasses = {
        sm: "px-3 py-1 text-sm",
        md: "px-4 py-2",
        lg: "px-6 py-3 text-lg"
    };
    
    const disabledClasses = disabled || loading 
        ? "bg-gray-600 text-gray-400 cursor-not-allowed" 
        : "";
    
    const combinedClasses = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${disabledClasses} ${className}`;
    
    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled || loading}
            class={combinedClasses}
        >
            {loading ? (
                <>
                    <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {children}
                </>
            ) : children}
        </button>
    );
}