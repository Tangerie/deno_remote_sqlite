import { Database } from "@db/sqlite";

export interface DatabaseConfig {
    path: string;
    readonly: boolean;
}

const handles = new Map<string, { count: number, handle: Database }>();

export const openDb = (cfg : DatabaseConfig) => {
    const key = JSON.stringify(cfg);

    const useCache = !cfg.readonly;

    if(useCache && handles.has(key)) {
        handles.get(key)!.count++;
        return handles.get(key)!.handle;
    }

    const db = new Database(cfg.path, {
        readonly: cfg.readonly
    }) as Database & { _close: Database["close"] };
    
    if(useCache) {
        Object.assign(db, { _close: db.close });
        
        Object.assign(db, {
            close() {
                handles.get(key)!.count--;
                if(handles.get(key)!.count === 0) {
                    db._close();
                    handles.delete(key);
                }
            }
        });

        handles.set(key, {
            count: 1,
            handle: db
        });
    }

    return db as Database;
}