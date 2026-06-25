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

export class RemoteStatement<T extends object = {}> implements AsyncDisposable {
    private sendAndWait : RemoteDatabase["sendAndWait"];
    private handle : RemoteStatementHandle;
    private isDone = false;

    constructor(sendAndWait : RemoteDatabase["sendAndWait"], handle : RemoteStatementHandle) {
        this.sendAndWait = sendAndWait;
        this.handle = handle;
    }

    public async get<R extends object = T>(...params : Parameters<Statement["get"]>) : Promise<R | undefined> {
        if(this.isDone) throw new Error("Statement has been disposed");
        
        return await this.sendAndWait({
            type: "prepare.get",
            payload: {
                handle: this.handle,
                args: params
            }
        })
    }

    public async all<R extends object = T>(...params : Parameters<Statement["all"]>) : Promise<R[]> {
        if(this.isDone) throw new Error("Statement has been disposed");

        return await this.sendAndWait({
            type: "prepare.all",
            payload: {
                handle: this.handle,
                args: params
            }
        })
    }

    public async finalize() {
        if(this.isDone) return;
        this.isDone = true;
        await this.sendAndWait({
            type: "prepare.finalize",
            payload: this.handle
        })
    }

    async [Symbol.asyncDispose]() {
        await this.finalize();
    }
}

export class RemoteDatabase implements Disposable {
    private nextId: number = 0;
    private socket : WebSocket;
    private waitingCallbacks = new Map<number, (data : unknown, error : boolean) => void>();
    private closed = false;
    private openPromise : Promise<undefined>;

    private _lastSendDbg? : OutgoingMessage = undefined;

    constructor(url : string) {
        this.socket = new WebSocket(url);

        this.openPromise = new Promise<undefined>((resolve, reject) => {
            if(this.socket.readyState === WebSocket.OPEN) return resolve(undefined);
            this.socket.addEventListener("open", () => resolve(undefined), { once: true });
            this.socket.addEventListener("error", () => reject(new Error("Failed to connect")), { once: true });
        });
        
        // Avoid an unhandled rejection if the caller never awaits open().
        // Callers that do await open() still observe the rejection.
        this.openPromise.catch(() => {});

        this.socket.onmessage = (ev) => {
            let msg : IncomingMessage;
            try {
                msg = JSON.parse(ev.data);
            } catch {
                console.error("Received malformed message", ev.data);
                return;
            }
            this.onMessage(msg);
        };

        this.socket.onerror = () => this.failAll(new Error("Socket error"));
        this.socket.onclose = () => this.failAll(new Error("Socket closed"));
    }

    public open(): Promise<undefined> {
        return this.openPromise;
    }

    private failAll(err : Error) {
        this.closed = true;
        if(this.waitingCallbacks.size === 0) return;
        for(const callback of this.waitingCallbacks.values()) {
            callback(err, true);
        }
        this.waitingCallbacks.clear();
    }

    private onMessage(msg : IncomingMessage) {
        if(msg.type === "error") {
            const waiting = this.waitingCallbacks.get(msg.id);
            if(!waiting) {
                console.error("Received unknown response", msg);
                return;
            }
            waiting(msg.payload, true);
            this.waitingCallbacks.delete(msg.id);
        }

        if(msg.type === "respond") {
            const waiting = this.waitingCallbacks.get(msg.id);
            if(!waiting) {
                console.error("Received unknown response", msg);
                return;
            }
            waiting(msg.payload, false);
            this.waitingCallbacks.delete(msg.id);
        }
    }

    private send(msg : OutgoingMessage) {
        this._lastSendDbg = msg;
        this.socket.send(JSON.stringify(msg));
    }

    public sendAndWait<R extends unknown>(msg : Omit<OutgoingMessage, "id">) : Promise<R> {
        if(this.closed || this.socket.readyState >= WebSocket.CLOSING) {
            return Promise.reject(new Error("Connection is closed"));
        }
        const id = this.nextId++;
        return new Promise<R>((resolve, reject) => {
            this.waitingCallbacks.set(id, (data, error) => {
                if(error) reject(data);
                else resolve(data as R);
            });
            this.send({ id, ...msg });
        });
    }

    private async sendCall<R extends unknown>(type : OutgoingMessageType, ...params : unknown[]) {
        return await this.sendAndWait<R>({
            type,
            payload: params
        })
    }

    public async prepare<T extends object = {}>(statement: string): Promise<RemoteStatement<T>> {
        const handleId = await this.sendCall<RemoteStatementHandle>("prepare", statement);
        return new RemoteStatement(this.sendAndWait.bind(this), handleId);
    }

    public run<T extends object = {}>(statement : string, ...params : Parameters<Statement["all"]>) : Promise<T[]> {
        return this.sendCall<T[]>("run", statement, ...params);
    }

    public close() {
        this.closed = true;
        this.socket.close();
    }

    [Symbol.dispose]() {
        this.close();
    }
}