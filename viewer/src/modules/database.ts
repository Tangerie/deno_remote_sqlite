import { RemoteDatabase } from '../../../client/mod.ts';
import { TableInfo } from './types.ts';

export class DatabaseManager {
    static async loadTables(database: RemoteDatabase): Promise<TableInfo[]> {
        // Get list of tables
        const tableRows = await database.run("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name");
        console.log(tableRows);

        // Get column info for each table
        const tableInfo: TableInfo[] = [];
        for (const row of tableRows) {
            const columnRows = await database.run(`PRAGMA table_info("${row.name}")`);
            console.log(columnRows);

            tableInfo.push({
                name: row.name,
                columns: columnRows.map(col => col.name)
            });
        }

        return tableInfo;
    }

    static async loadTableData(database: RemoteDatabase, tableName: string) {
        // Get total row count
        const countResult = await database.run(`SELECT COUNT(*) as count FROM "${tableName}"`);
        const totalRows = countResult[0].count;

        // Load first page of data
        const rows = await database.run(`SELECT * FROM "${tableName}" LIMIT 50 OFFSET 0`);

        return {
            tableData: rows,
            tableInfo: `${totalRows} rows`
        };
    }
}