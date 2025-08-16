import { useState, useEffect } from 'preact/hooks';
import { RemoteDatabase } from '../../client/mod.ts';

interface TableInfo {
  name: string;
  columns: string[];
}

export default function App() {
  const [db, setDb] = useState<RemoteDatabase | null>(null);
  const [tables, setTables] = useState<TableInfo[]>([]);
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const [tableData, setTableData] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [url, setUrl] = useState<string>('ws://judy.localdomain/domain/remote');

  const connectToDatabase = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const database = new RemoteDatabase(url);
      await database.open();
      
      // Get list of tables
      const tableStmt = await database.prepare("SELECT name FROM sqlite_master WHERE type='table'");
      const tableRows = await tableStmt.all<{name: string}>();
      await tableStmt.finalize();
      console.log(tableRows);
      
      // Get column info for each table
      const tableInfo: TableInfo[] = [];
      for (const row of tableRows) {
        const columnStmt = await database.prepare(`PRAGMA table_info("${row.name}")`);
        const columnRows = await columnStmt.all<{name: string}>();
        await columnStmt.finalize();
        console.log(columnRows);
        
        tableInfo.push({
          name: row.name,
          columns: columnRows.map(col => col.name)
        });
      }
      
      setDb(database);
      setTables(tableInfo);
    } catch (err) {
      setError(`Failed to connect to database: ${err.message}`);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadTableData = async (tableName: string) => {
    if (!db) return;
    
    try {
      setLoading(true);
      setError(null);
      setSelectedTable(tableName);
      
      const stmt = await db.prepare(`SELECT * FROM "${tableName}"`);
      const rows = await stmt.all();
      await stmt.finalize();
      
      setTableData(rows);
    } catch (err) {
      setError(`Failed to load table data: ${err.message}`);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const disconnect = () => {
    if (db) {
      db.close();
      setDb(null);
      setTables([]);
      setSelectedTable(null);
      setTableData([]);
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (db) {
        db.close();
      }
    };
  }, [db]);

  return (
    <div class="w-screen min-h-screen bg-gray-900 text-white p-6">
      <div class="max-w-6xl mx-auto">
        <header class="mb-8">
          <h1 class="text-3xl font-bold mb-2">SQLite Database Browser</h1>
          <p class="text-gray-400">Browse SQLite databases remotely using WebSocket connections</p>
        </header>

        {!db ? (
          <div class="bg-gray-800 rounded-lg p-6 max-w-md">
            <h2 class="text-xl font-semibold mb-4">Connect to Database</h2>
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium mb-1">WebSocket URL</label>
                <input
                  type="text"
                  value={url}
                  onInput={(e) => setUrl(e.target.value)}
                  class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="ws://localhost:8090/socket"
                />
              </div>
              <button
                onClick={connectToDatabase}
                disabled={loading}
                class="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-2 px-4 rounded-md transition duration-200"
              >
                {loading ? 'Connecting...' : 'Connect'}
              </button>
            </div>
          </div>
        ) : (
          <div>
            <div class="flex justify-between items-center mb-6">
              <h2 class="text-xl font-semibold">Database Tables</h2>
              <button
                onClick={disconnect}
                class="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-md transition duration-200"
              >
                Disconnect
              </button>
            </div>

            {error && (
              <div class="bg-red-900 border border-red-700 text-red-200 px-4 py-3 rounded mb-6">
                {error}
              </div>
            )}

            <div class="grid grid-cols-1 lg:grid-cols-4 gap-6">
              <div class="lg:col-span-1 bg-gray-800 rounded-lg p-4">
                <h3 class="font-medium mb-3">Tables</h3>
                <ul class="space-y-2">
                  {tables.map((table) => (
                    <li key={table.name}>
                      <button
                        onClick={() => loadTableData(table.name)}
                        class={`w-full text-left px-3 py-2 rounded-md transition duration-200 ${
                          selectedTable === table.name
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-700 hover:bg-gray-600 text-gray-200'
                        }`}
                      >
                        {table.name}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

              <div class="lg:col-span-3 bg-gray-800 rounded-lg p-4">
                {selectedTable ? (
                  <div>
                    <h3 class="font-medium mb-3">{selectedTable}</h3>
                    {loading ? (
                      <div class="text-center py-8">Loading data...</div>
                    ) : tableData.length > 0 ? (
                      <div class="overflow-x-auto">
                        <table class="min-w-full divide-y divide-gray-700">
                          <thead>
                            <tr>
                              {Object.keys(tableData[0]).map((column) => (
                                <th
                                  key={column}
                                  class="px-4 py-2 text-left text-sm font-medium text-gray-300 uppercase tracking-wider"
                                >
                                  {column}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody class="divide-y divide-gray-700">
                            {tableData.map((row, rowIndex) => (
                              <tr key={rowIndex}>
                                {Object.values(row).map((value, colIndex) => (
                                  <td key={colIndex} class="px-4 py-2 text-sm text-gray-200">
                                    {value !== null && value !== undefined ? String(value) : 'NULL'}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div class="text-center py-8 text-gray-400">No data found in table</div>
                    )}
                  </div>
                ) : (
                  <div class="text-center py-8 text-gray-400">
                    Select a table from the list to view its data
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}