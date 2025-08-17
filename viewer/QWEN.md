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
- When subscribing to values from a store (i.e. `useExampleStore(...)`), do not select the entire state as that will cause any change in the state to make the component re-render and potentially all children. Also do not subscribe to parts of the store that aren't required for the same reason.
    ```tsx
    // Instead of 
    const { key, otherKey, someDeeplyNestedDict } = useExampleStore(state => state);

    return <h1>{key} ({someDeeplyNestedDict.someKey})</h1>

    // Do
    const key = useExampleStore(state => state.key);
    const someKeyFromNested = useExampleStore(state => state.someDeeplyNestedDict.someKey);

    return <h1>{key} ({someKeyFromNested})</h1>
    ```

# IMPORTANT
- DO NOT RUN `npm`, `npx` OR `deno` COMMANDS.
- A development server is already running, DO NOT start another.
- ONLY IMPORT `RemoteDatabase` from `@tangerie/deno_remote_sqlite/client`
- ONLY IMPORT `createUseStore` locally