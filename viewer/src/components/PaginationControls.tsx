import PageSizeSelector from './PageSizeSelector.tsx';
import PaginationNavigation from './PaginationNavigation.tsx';

interface PaginationControlsProps {
    currentPage: number;
    totalPages: number;
    pageSize: number;
    totalRows: number;
    startIndex: number;
    endIndex: number;
    onPageChange: (page: number) => void;
    onPageSizeChange: (newPageSize: number) => void;
    disabled?: boolean;
}

export default function PaginationControls({
    currentPage,
    totalPages,
    pageSize,
    totalRows,
    startIndex,
    endIndex,
    onPageChange,
    onPageSizeChange,
    disabled = false
}: PaginationControlsProps) {
    const handlePageSizeChange = (newPageSize: number) => {
        // Reset to first page when changing page size
        onPageSizeChange(newPageSize);
    };

    return (
        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <PageSizeSelector 
                pageSize={pageSize}
                onPageSizeChange={handlePageSizeChange}
                disabled={disabled}
            />
            
            <div class="flex flex-wrap items-center gap-2">
                <div class="text-gray-300 whitespace-nowrap">
                    Showing {startIndex}-{endIndex} of {totalRows || 0}
                </div>
                <PaginationNavigation
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={onPageChange}
                    disabled={disabled}
                />
            </div>
        </div>
    );
}