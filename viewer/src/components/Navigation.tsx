import { useLocation } from 'preact-iso';
import NavigationItem from './NavigationItem.tsx';

export default function Navigation() {
    const { url } = useLocation();
    
    return (
        <div class="mb-6">
            <div class="border-b border-gray-700">
                <nav class="flex space-x-8">
                    <NavigationItem 
                        path="/browse" 
                        title="Browse Tables" 
                        currentPath={url} 
                    />
                    <NavigationItem 
                        path="/schema" 
                        title="View Schemas" 
                        currentPath={url} 
                    />
                    <NavigationItem 
                        path="/sql" 
                        title="Execute SQL" 
                        currentPath={url} 
                    />
                </nav>
            </div>
        </div>
    );
}