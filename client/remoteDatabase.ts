import type { Statement } from "@db/sqlite";

const OUTGOING_MESSAGE_TYPES = ["prepare", "run", "prepare.all", "prepare.get", "prepare.finalize"] as const;
const INCOMING_MESSAGE_TYPES = ["respond", "error"] as const;

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

export class RemoteStatement {
    private origin : RemoteDatabase;
    private handle : RemoteStatementHandle;
    private isDone = false;
    constructor(origin : RemoteDatabase, handle : RemoteStatementHandle) {
        this.origin = origin;
        this.handle = handle;
    }

    public async get<R extends object = {}>(...params : Parameters<Statement["get"]>) : Promise<R | undefined> {
        if(this.isDone) throw new Error("Statement has been disposed")
        return await this.origin.sendAndWait({
            type: "prepare.get",
            payload: {
                handle: this.handle,
                args: params
            }
        })
    }

    public async all<R extends object = {}>(...params : Parameters<Statement["all"]>) : Promise<R[]> {
        if(this.isDone) throw new Error("Statement has been disposed")
        return await this.origin.sendAndWait({
            type: "prepare.all",
            payload: {
                handle: this.handle,
                args: params
            }
        })
    }

    public async finalize() {
        if(this.isDone) throw new Error("Statement has been disposed");
        this.isDone = true;
        await this.origin.sendAndWait({
            type: "prepare.finalize",
            payload: this.handle
        })
    }
}

export class RemoteDatabase {
    private nextId: number = 0;
    private socket : WebSocket;
    private waitingCallbacks = new Map<number, (data : unknown, error : boolean) => void>();

    constructor(url : string) {
        this.socket = new WebSocket(url);
        this.socket.onmessage = (ev) => {
            this.onMessage(JSON.parse(ev.data));
        }
    }

    public open(): Promise<undefined> {
        if(this.socket.readyState === WebSocket.OPEN) return Promise.resolve(undefined);
        else if(this.socket.readyState !== WebSocket.CONNECTING) {
            throw new Error("Failed to open");
        }
        return new Promise((resolve, reject) => {
            this.socket.onopen = () => { resolve(undefined) };
        })
    }

    private onMessage(msg : IncomingMessage) {
        if(msg.type === "error") {
            const waiting = this.waitingCallbacks.get(msg.id);
            if(!waiting) {
                console.error("Recieved Uknown Response");
                return;
            }
            waiting(msg.payload, true);
            this.waitingCallbacks.delete(msg.id);
            throw new Error(`${msg.payload}`);
        }

        if(msg.type === "respond") {
            const waiting = this.waitingCallbacks.get(msg.id);
            if(!waiting) {
                console.error("Recieved Uknown Response");
                return;
            }
            waiting(msg.payload, false);
            this.waitingCallbacks.delete(msg.id);
        }
    }

    private send(msg : OutgoingMessage) {
        this.socket.send(JSON.stringify(msg));
    }

    public sendAndWait<R extends unknown>(msg : Omit<OutgoingMessage, "id">) : Promise<R> {
        const id = this.nextId++;
        this.send({ id, ...msg });
        return new Promise((resolve, reject) => {
            const callBack = (data : unknown, error: boolean) => {
                if(error) reject(data);
                else resolve(data as R);
            };
            this.waitingCallbacks.set(id, callBack);
        });
    }

    private async sendCall<R extends unknown>(type : OutgoingMessageType, ...params : unknown[]) {
        return await this.sendAndWait<R>({
            type,
            payload: params
        })
    }

    public async prepare(statement: string): Promise<RemoteStatement> {
        const handleId = await this.sendCall<RemoteStatementHandle>("prepare", statement);
        return new RemoteStatement(this, handleId);
    }

    public run<T extends object = {}>(statement : string, ...params : Parameters<Statement["all"]>) : Promise<T[]> {
        return this.sendCall<T[]>("run", statement, ...params);
    }

    public close() {
        this.socket.close();
    }
}