import { RemoteDatabase } from '@tangerie/deno_remote_sqlite/client';
import { TableInfo } from './types.ts';

// Simplified database functions
export const getTables = async (database: RemoteDatabase): Promise<TableInfo[]> => {
    // Get list of tables
    const tableRows = await database.run<{name : string}>("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name");

    // Get column info for each table
    const tables: TableInfo[] = [];
    for (const row of tableRows) {
        const columnRows = await database.run<{name: string}>(`SELECT * FROM pragma_table_xinfo(?) WHERE hidden = 0`, row.name);
        tables.push({
            name: row.name,
            columns: columnRows.map(col => col.name)
        });
    }

    return tables;
};

export const queryTable = async (database: RemoteDatabase, tableName: string, page: number = 1, pageSize: number = 50) => {
    // Get total row count
    const countResult = await database.run<{count: number}>(`SELECT COUNT(*) as count FROM "${tableName}"`);
    const totalRows = countResult[0].count;

    // Calculate offset
    const offset = (page - 1) * pageSize;

    // Load page of data
    const rows = await database.run<any>(`SELECT * FROM "${tableName}" LIMIT ${pageSize} OFFSET ${offset}`);

    return {
        tableData: rows,
        tableInfo: `${totalRows} rows`,
        totalRows,
        currentPage: page,
        totalPages: Math.ceil(totalRows / pageSize)
    };
};