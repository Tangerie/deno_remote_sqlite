import type { DatabaseConfig } from "./mod.ts";
import type { Database } from "./deps.ts";
import { openDb } from "./db.ts";

interface Message {
    type: string,
    payload?: unknown
}

export class DatabaseSocketHandler {
    private socket : WebSocket;
    private db : Database;
    constructor(socket : WebSocket, cfg : DatabaseConfig) {
        this.db = openDb(cfg);
        this.socket = socket;
        this.socket.onopen = () => this.onOpen();
        this.socket.onmessage = ev => {
            this.onMessage(JSON.parse(ev.data));
        }
        this.socket.onclose = () => this.onClose();
    }

    onOpen() {

    }

    onMessage(msg : Message) {
        console.log(msg);
        if(msg.type === "query") {
            const results = this.db.prepare(msg.payload as string).all();
            this.send("result", results);
        }
    }

    send(type : string, payload? : unknown) {
        this.socket.send(JSON.stringify({ type, payload }))
    }

    onClose() {
        this.db.close()
    }
}