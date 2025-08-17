# IMPORTANT
- DO NOT RUN `npm`, `npx` OR `deno` COMMANDS.
- A development server is already running, DO NOT start another.
- ONLY IMPORT `RemoteDatabase` from `@tangerie/deno_remote_sqlite/client`

# Project
Create a preact app, using typescript, deno, vite and tailwindcss. It's a sqlite database viewer (allow user to browse tables), using `@tangerie/deno_remote_sqlite/client`.

@CODING_STYLE.md

### Global Store
- When creating a store, export all the resulting actions directly.
    ```ts
    const { get, actions, select, selector, set, subscribe } = store.actions;
    // Instead of 
    export { actions };

    // Do
    export const { clearDb, resetAll, resetTableData } = appStore.actions;
    ```
- When creating the actions, avoid writing just setters, instead they should encapsulate more behaviour.
    ```ts
    // Instead of
    createStore({
        ...
        actions: {
            // Database actions
            setDb: (state, db: RemoteDatabase | null) => {
                state.db = db;
            },
            clearDb: (state) => {
                if (state.db) {
                    state.db.close();
                }
                state.db = null;
            },
            setCurrentPage: (state, page: number) => {
                state.currentPage = page;
            },
            setTableData: (state, data: any[]) => {
                state.tableData = data;
            },
        }
        ...
    })

    // Do
    createStore({
        ...
        actions: {
            // Database actions
            async openDb(state) {
                state.db = new RemoteDatabase(state.url);
                await state.db.open();
            },
            closeDb(state) {
                if (state.db) {
                    state.db.close();
                }
                state.db = null;
            },
            async setCurrentPage(state, page: number) {
                state.currentPage = page;
                state.tableData = await loadDataFromPage(state.db, state.currentPage);
            },
        }
        ...
    })
    ```

# IMPORTANT
- DO NOT RUN `npm`, `npx` OR `deno` COMMANDS.
- A development server is already running, DO NOT start another.
- ONLY IMPORT `RemoteDatabase` from `@tangerie/deno_remote_sqlite/client`
- ONLY IMPORT createUseStore locally