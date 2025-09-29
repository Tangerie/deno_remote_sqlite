if (!import.meta.main) {
  throw new Error("This is to be run, not imported")
}

import { Application, Router } from "@oak/oak"
import { createRemoteSQliteRouter } from "../server/oak.ts";

const app = new Application();
const port = 8090;
const router = new Router();

router.use("/sql", createRemoteSQliteRouter({
    readonly: true,
    path: "./exampledb.sqlite3"
}).routes());

app.use(router.routes());
app.use(router.allowedMethods());

console.log("Listening at http://localhost:" + port);
await app.listen({ port });