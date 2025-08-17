interface NavigationItemProps {
    path: string;
    title: string;
    currentPath: string;
}

export default function NavigationItem({ path, title, currentPath }: NavigationItemProps) {
    // Normalize the URL for matching
    const normalizedCurrentPath = currentPath === '/' ? '/browse' : currentPath;
    
    return (
        <a
            href={path}
            class={`py-4 px-1 border-b-2 font-medium text-sm ${
                normalizedCurrentPath === path
                    ? 'border-blue-500 text-blue-400'
                    : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-300'
            }`}
        >
            {title}
        </a>
    );
}