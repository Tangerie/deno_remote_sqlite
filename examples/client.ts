import { RemoteDatabase } from "../client/mod.ts";

if (!import.meta.main) {
  throw new Error("This is to be run, not imported")
}


const db = new RemoteDatabase("ws://localhost:8090/sql");
await db.open();
const stmt = await db.prepare<{ id : number }>("SELECT * FROM albums")
console.log(await stmt.get());
console.log(await stmt.all());

console.log(await db.sql`SELECT * FROM albums WHERE id = ${1}`);
console.log(await db.exec(`DELETE FROM albums WHERE id = ?`, 1));
db.close();