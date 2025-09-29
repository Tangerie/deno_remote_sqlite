import { Router } from "@oak/oak";
import { openDb, type DatabaseConfig } from "./db.ts";
import { DatabaseSocketHandler } from "./socket.ts";
import { dirname, basename, extname } from "@std/path";

export function createRemoteSQliteRouter(cfg : DatabaseConfig) : Router {
    function runSQL(query : string) : { status : number, body : object } {        
        const db = openDb(cfg);
        try {
            using stmt = db.prepare(query);
            return {
                body: stmt.all(),
                status: 200
            }
        } catch (err) {
            console.error(err);
            return {
                body: {
                    error: "Invalid SQL",
                    ...(err instanceof Error ? { data: err.stack } : {})
                },
                status: 400
            }
        } finally {
            db.close();
        }
    }

    const router = new Router();

    router.get("/", async ctx => {
        if(ctx.isUpgradable) {
            new DatabaseSocketHandler(await ctx.upgrade(), cfg);
        } else if(ctx.request.url.searchParams.has("sql")) {
            const { body, status } = runSQL(ctx.request.url.searchParams.get("sql")!);
            ctx.response.body = body;
            ctx.response.status = status;
        } else {
            await ctx.send({
                path: basename(cfg.path),
                root: dirname(cfg.path),
                extensions: [ extname(cfg.path).slice(1) ]
            })
        }
    });

    router.post("/", async ctx => {
        const sql = await ctx.request.body.text();
        const { body, status } = runSQL(sql);
        ctx.response.body = body;
        ctx.response.status = status;
    });

    return router;
}