import Button from './Button.tsx';

interface PaginationNavigationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    disabled?: boolean;
}

export default function PaginationNavigation({
    currentPage,
    totalPages,
    onPageChange,
    disabled = false
}: PaginationNavigationProps) {
    const isFirstPage = currentPage === 1;
    const isLastPage = currentPage === totalPages;

    return (
        <div class="flex space-x-1">
            <Button 
                onClick={() => onPageChange(1)}
                disabled={disabled || isFirstPage}
                variant="secondary"
                size="sm"
            >
                First
            </Button>
            <Button 
                onClick={() => onPageChange(currentPage - 1)}
                disabled={disabled || isFirstPage}
                variant="secondary"
                size="sm"
            >
                ← Previous
            </Button>
            <div class="px-3 py-1 text-gray-300 flex items-center">
                Page {currentPage} of {totalPages || 1}
            </div>
            <Button 
                onClick={() => onPageChange(currentPage + 1)}
                disabled={disabled || isLastPage}
                variant="secondary"
                size="sm"
            >
                Next →
            </Button>
            <Button 
                onClick={() => onPageChange(totalPages)}
                disabled={disabled || isLastPage}
                variant="secondary"
                size="sm"
            >
                Last
            </Button>
        </div>
    );
}