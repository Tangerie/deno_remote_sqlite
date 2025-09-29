# SQLite Remote Table Extension Documentation

## Overview

This SQLite extension creates virtual tables that fetch and cache data from a remote HTTP server. The data is fetched once when the table is created and stored in memory for the duration of the connection.

## How It Works

### Module Registration (`sqlite3_create_module`)

The extension registers a virtual table module named `remote_table` with SQLite. This registration happens once when the extension is loaded:

```c
sqlite3_create_module(db, "remote_table", &remoteModule, 0);
```

The `remoteModule` structure contains function pointers that define the virtual table's behavior:

- **Lifecycle**: `xCreate`, `xConnect`, `xDisconnect`, `xDestroy`
- **Cursor Operations**: `xOpen`, `xClose`
- **Query Execution**: `xFilter`, `xNext`, `xEof`, `xColumn`, `xRowid`
- **Query Optimization**: `xBestIndex`

### Virtual Table Creation Flow

1. **User executes**: `CREATE VIRTUAL TABLE ... USING remote_table(url, query)`
2. **SQLite calls**: `xCreate` or `xConnect`
3. **Extension**:
   - Parses the URL and SQL query arguments
   - Makes HTTP POST request to the server
   - Receives JSON array response
   - Extracts column names from first row
   - Caches all data in memory
   - Declares table schema to SQLite

### Query Execution Flow

1. **User executes**: `SELECT * FROM virtual_table WHERE condition`
2. **SQLite**:
   - Calls `xBestIndex` for query planning
   - Calls `xOpen` to create a cursor
   - Calls `xFilter` to start the query
3. **For each row**:
   - `xEof` checks if more rows exist
   - `xColumn` retrieves column values
   - `xRowid` provides row identifier
   - `xNext` advances to next row
4. **Cleanup**: `xClose` destroys the cursor

## Server Requirements

The server must:
1. Accept POST requests at the specified URL
2. Receive SQL query as plain text in request body
3. Return JSON array of objects (each object = one row)
4. Return HTTP 200 for success
5. Optionally return error as `{"error": "message"}` with HTTP 400

Example server response:
```json
[
  {"id": 1, "name": "Alice", "age": 30},
  {"id": 2, "name": "Bob", "age": 25}
]
```

## Usage Examples

### Basic Setup

```sql
-- Load the extension
.load ./remote_table

-- Create a virtual table
CREATE VIRTUAL TABLE users_remote 
USING remote_table(
    'http://localhost:8090/sql/',  -- Server endpoint
    'SELECT * FROM users'           -- SQL to execute on server
);
```

### Querying

```sql
-- Simple queries
SELECT * FROM users_remote;
SELECT name, age FROM users_remote WHERE age > 25;

-- Aggregations (performed locally)
SELECT COUNT(*), AVG(age) FROM users_remote;

-- Joins with local tables
CREATE TABLE local_scores (user_id INT, score REAL);
SELECT u.name, s.score 
FROM users_remote u 
JOIN local_scores s ON u.id = s.user_id;
```

## Architecture Details

### Memory Management

- Data is cached in memory using cJSON structures
- Memory is freed when virtual table is dropped or connection closes
- Each virtual table instance maintains its own data cache

### Type Mapping

| JSON Type | SQLite Type |
|-----------|-------------|
| String    | TEXT        |
| Number (int) | INTEGER  |
| Number (float) | REAL   |
| Boolean   | INTEGER (0/1) |
| null      | NULL        |
| Object/Array | TEXT (JSON string) |

### Column Name Sanitization

Non-alphanumeric characters in JSON field names are replaced with underscores for SQLite compatibility:
- `user-name` → `user_name`  
- `email@address` → `email_address`

### Limitations

1. **Read-only**: No INSERT, UPDATE, or DELETE operations
2. **Static data**: Data is fetched once at table creation
3. **Memory usage**: Entire result set is cached in memory
4. **No WHERE optimization**: Filters are applied locally, not pushed to server
5. **JSON only**: Server must return JSON array format

## Error Handling

The extension handles various error conditions:

- **Network errors**: Connection timeouts, DNS failures
- **HTTP errors**: Non-200 status codes
- **JSON errors**: Invalid JSON, non-array responses
- **Server errors**: Explicit error responses from server
- **SQL errors**: Invalid virtual table arguments

Errors are reported through SQLite's standard error mechanism.

## Performance Considerations

1. **Initial fetch**: Can be slow for large datasets
2. **Memory usage**: Proportional to result set size
3. **Query performance**: After initial fetch, queries are fast (in-memory)
4. **No index support**: All queries are full table scans

## Security Notes

- Use HTTPS URLs for secure data transmission
- Validate and sanitize SQL queries on the server
- Implement authentication/authorization on server endpoints
- Be aware of memory consumption with large result sets

## Debugging

Check for common issues:

1. **Extension won't load**: Check library dependencies with `ldd remote_table.so`
2. **Network errors**: Test server endpoint with curl: `curl -X POST -d "SELECT 1" http://localhost:8090/sql/`
3. **JSON errors**: Validate server response format
4. **Column issues**: Check for special characters in field names

## Advanced Usage

### Multiple Remote Tables

```sql
-- Different queries to same server
CREATE VIRTUAL TABLE active_users 
USING remote_table('http://localhost:8090/sql/', 
                   'SELECT * FROM users WHERE active = 1');

CREATE VIRTUAL TABLE recent_orders 
USING remote_table('http://localhost:8090/sql/', 
                   'SELECT * FROM orders WHERE date > date(''now'', ''-30 days'')');

-- Join remote tables
SELECT u.name, COUNT(o.id) as order_count
FROM active_users u
LEFT JOIN recent_orders o ON u.id = o.user_id
GROUP BY u.name;
```

### Creating Views

```sql
CREATE VIEW user_summary AS
SELECT 
    name,
    age,
    CASE 
        WHEN age < 20 THEN 'Teen'
        WHEN age < 30 THEN 'Young Adult'
        WHEN age < 50 THEN 'Adult'
        ELSE 'Senior'
    END as age_group
FROM users_remote;
```

## License

This extension uses:
- SQLite (Public Domain)
- libcurl (MIT/X derivative license)
- cJSON (MIT License)