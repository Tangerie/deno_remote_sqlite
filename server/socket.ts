import type { DatabaseConfig } from "./mod.ts";
import type { Database, Statement } from "./deps.ts";
import { openDb } from "./db.ts";

const INCOMING_MESSAGE_TYPES = ["prepare", "run", "prepare.all", "prepare.get", "prepare.finalize"] as const;
const OUTGOING_MESSAGE_TYPES = ["respond", "error"] as const;

type IncomingMessageType = (typeof INCOMING_MESSAGE_TYPES)[number];
type OutgoingMessageType = (typeof OUTGOING_MESSAGE_TYPES)[number];

type MessageType = IncomingMessageType | OutgoingMessageType;

interface Message {
    id: number,
    type: MessageType,
    payload?: unknown
}

interface IncomingMessage extends Message {
    type: IncomingMessageType
}

interface OutgoingMessage extends Message {
    type: OutgoingMessageType
}

type RemoteStatementHandle = number;

export class DatabaseSocketHandler {
    private socket : WebSocket;
    private db : Database;
    private _nextStatementHandle : RemoteStatementHandle = 0;
    private statements : Map<RemoteStatementHandle, Statement>;

    constructor(socket : WebSocket, cfg : DatabaseConfig) {
        this.db = openDb(cfg);
        this.socket = socket;
        this.socket.onopen = () => this.onOpen();
        this.socket.onmessage = ev => {
            const msg = JSON.parse(ev.data);
            try {
                this.onMessage(msg);
            } catch(err) {
                this.error(msg.id, `${err}`);
                console.error(err);
            }
        }
        this.socket.onclose = () => this.onClose();
        this.statements = new Map();
    }

    onOpen() {
        this.statements.set(-1, this.db.prepare("SELECT * FROM albums WHERE albumId < :id"))
    }

    onMessage(msg : IncomingMessage) {
        if(!INCOMING_MESSAGE_TYPES.includes(msg.type)) {
            return this.error(msg.id, "Unknown Message Type");
        }
        
        if(msg.type === "prepare") {
            const params = msg.payload as Parameters<Database["prepare"]>;
            const stmt = this.db.prepare(...params);
            const handle = this._nextStatementHandle++;
            this.statements.set(handle, stmt);
            this.respond(msg.id, handle);
        } else if(msg.type === "run") {
            const [statementStr, ...params] = msg.payload as [string, ...Parameters<Statement["all"]>]
            const stmt = this.db.prepare(statementStr);
            const results = stmt.all(...params);
            stmt.finalize();
            this.respond(msg.id, results);
        } else if(msg.type === "prepare.get") {
            const { handle, args } = msg.payload as { handle: RemoteStatementHandle, args: Parameters<Statement["get"]> }
            const stmt = this.statements.get(handle);
            if(!stmt) {
                return this.error(msg.id, "Invalid Handle")
            }
            const result = stmt.get(...args);
            this.respond(msg.id, result);
        } else if(msg.type === "prepare.all") {
            const { handle, args } = msg.payload as { handle: RemoteStatementHandle, args: Parameters<Statement["all"]> }
            const stmt = this.statements.get(handle);
            if(!stmt) {
                return this.error(msg.id, "Invalid Handle")
            }
            const results = stmt.all(...args);
            this.respond(msg.id, results);
        } else if(msg.type === "prepare.finalize") {
            const handle = msg.payload as RemoteStatementHandle;
            const stmt = this.statements.get(handle);
            if(!stmt) {
                return this.error(msg.id, "Invalid Handle")
            }
            stmt.finalize();
            this.statements.delete(handle);
            this.respond(msg.id, true);
        }
    }

    send(msg : OutgoingMessage) {
        this.socket.send(JSON.stringify(msg))
    }

    respond(id : number, payload?: unknown) {
        return this.send({
            id, type: "respond", payload
        })
    }

    error(id : number, payload?: unknown) {
        return this.send({
            id, type: "error", payload
        })
    }

    onClose() {
        this.db.close()
    }
}