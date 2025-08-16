import { useLocation } from 'preact-iso';

export default function Navigation() {
    const { url } = useLocation();
    
    // Normalize the URL for matching
    const normalizedUrl = url === '/' ? '/browse' : url;
    
    return (
        <div class="mb-6">
            <div class="border-b border-gray-700">
                <nav class="flex space-x-8">
                    <a
                        href="/browse"
                        class={`py-4 px-1 border-b-2 font-medium text-sm ${
                            normalizedUrl === '/browse'
                                ? 'border-blue-500 text-blue-400'
                                : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-300'
                        }`}
                    >
                        Browse Tables
                    </a>
                    <a
                        href="/schema"
                        class={`py-4 px-1 border-b-2 font-medium text-sm ${
                            normalizedUrl === '/schema'
                                ? 'border-blue-500 text-blue-400'
                                : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-300'
                        }`}
                    >
                        View Schemas
                    </a>
                    <a
                        href="/sql"
                        class={`py-4 px-1 border-b-2 font-medium text-sm ${
                            normalizedUrl === '/sql'
                                ? 'border-blue-500 text-blue-400'
                                : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-300'
                        }`}
                    >
                        Execute SQL
                    </a>
                </nav>
            </div>
        </div>
    );
}