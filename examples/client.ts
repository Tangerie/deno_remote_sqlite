import { RemoteDatabase } from "../client/mod.ts";

if (!import.meta.main) {
  throw new Error("This is to be run, not imported")
}


const db = new RemoteDatabase("ws://localhost:8090/socket");
await db.open();
const stmt = await db.prepare("SELECT * FROM albums")
console.log(await stmt.get());
console.log(await stmt.all());
db.close();