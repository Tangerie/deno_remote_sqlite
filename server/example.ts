if (!import.meta.main) {
  throw new Error("This is to be run, not imported")
}

import { Application, type Context, Router } from "@oak/oak";
import { SocketServer  } from "./mod.ts";

const app = new Application();
const port = 8080;
const router = new Router();
const server = new SocketServer();

router.get("/socket", (ctx : Context) => server.handleConnection(ctx));

app.use(router.routes());
app.use(router.allowedMethods());

console.log("Listening at http://localhost:" + port);
await app.listen({ port });