// Utility functions for table data rendering

export const getColumnNames = (data: any[]): string[] => {
    if (!data || data.length === 0) {
        return [];
    }
    return Object.keys(data[0]);
};

export const renderCellContent = (value: any): string => {
    if (value === null || value === undefined) {
        return 'NULL';
    }
    return String(value);
};

export const createPlaceholderArray = (length: number): undefined[] => {
    return Array.from({ length });
};