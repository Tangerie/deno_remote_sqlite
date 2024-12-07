if (!import.meta.main) {
  throw new Error("This is to be run, not imported")
}

import { Application, Router, type Context } from "jsr:@oak/oak@^17.1.3"
import { DatabaseSocketHandler } from "./mod.ts";

const app = new Application();
const port = 8090;
const router = new Router();

router.get("/socket", async (ctx : Context) => {
  new DatabaseSocketHandler(await ctx.upgrade(), {
    readonly: true,
    path: "./exampledb.sqlite3"
  })
});

app.use(router.routes());
app.use(router.allowedMethods());

console.log("Listening at http://localhost:" + port);
await app.listen({ port });