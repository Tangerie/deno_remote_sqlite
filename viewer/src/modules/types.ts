export interface TableInfo {
    name: string;
    columns: string[];
}

export interface TableDataResult {
    tableData: any[];
    tableInfo: string;
    totalRows: number;
    currentPage: number;
    totalPages: number;
}