if (!import.meta.main) {
  throw new Error("This is to be run, not imported")
}

import { Application, type Context, Router } from "./deps.ts";
import { makeDatabaseSocketHandler } from "./mod.ts";

const app = new Application();
const port = 8090;
const router = new Router();

router.get("/socket", (ctx : Context) => makeDatabaseSocketHandler(ctx, {
  readonly: true,
  path: "./exampledb.sqlite3"
}));

app.use(router.routes());
app.use(router.allowedMethods());

console.log("Listening at http://localhost:" + port);
await app.listen({ port });