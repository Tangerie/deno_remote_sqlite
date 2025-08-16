# Project
Create a preact app, using typescript, deno, vite and tailwindcss. It's a sqlite database viewer (allow user to browse tables), using `@tangerie/remote-sqlite/client`.


```ts
// @tangerie/remote-sqlite/client
import type { Statement } from "@db/sqlite";
/**
 * Remote statement class that provides prepared statement functionality over WebSocket
 */
export declare class RemoteStatement {
    /**
     * Creates a new RemoteStatement instance
     * @param origin - The RemoteDatabase instance that created this statement
     * @param handle - The remote handle identifier for this statement
     */
    constructor(origin: RemoteDatabase, handle: RemoteStatementHandle);

    /**
     * Execute the prepared statement and return the first row
     * @param params - Parameters to bind to the statement
     * @returns Promise resolving to the first row or undefined if no rows
     */
    get<R extends object = {}>(...params: Parameters<Statement["get"]>): Promise<R | undefined>;

    /**
     * Execute the prepared statement and return all rows
     * @param params - Parameters to bind to the statement
     * @returns Promise resolving to an array of all rows
     */
    all<R extends object = {}>(...params: Parameters<Statement["all"]>): Promise<R[]>;

    /**
     * Finalize and dispose of the prepared statement
     * @returns Promise that resolves when the statement is finalized
     */
    finalize(): Promise<void>;
}

/**
 * Remote database class that provides SQLite database functionality over WebSocket
 */
export declare class RemoteDatabase {
    /**
     * Creates a new RemoteDatabase instance
     * @param url - WebSocket URL to connect to the remote database server
     */
    constructor(url: string);

    /**
     * Open the WebSocket connection to the database
     * @returns Promise that resolves when the connection is established
     */
    open(): Promise<undefined>;

    /**
     * Send a message and wait for a response
     * @param msg - Message to send (without id, which is auto-generated)
     * @returns Promise resolving to the response data
     */
    sendAndWait<R extends unknown>(msg: Omit<OutgoingMessage, "id">): Promise<R>;

    /**
     * Prepare a SQL statement for execution
     * @param statement - SQL statement string to prepare
     * @returns Promise resolving to a RemoteStatement instance
     */
    prepare(statement: string): Promise<RemoteStatement>;

    /**
     * Execute a SQL statement directly and return all results
     * @param statement - SQL statement string to execute
     * @param params - Parameters to bind to the statement
     * @returns Promise resolving to an array of result rows
     */
    run<T extends object = {}>(statement: string, ...params: Parameters<Statement["all"]>): Promise<T[]>;

    /**
     * Close the WebSocket connection to the database
     */
    close(): void;
}


/** Example **/
const db = new RemoteDatabase("ws://localhost:8090/socket");
await db.open();
const stmt = await db.prepare("SELECT * FROM albums")
console.log(await stmt.get());
console.log(await stmt.all());
db.close();
```