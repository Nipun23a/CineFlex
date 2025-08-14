import {Server} from "socket.io";

const HOLD_MS = 2 * 60 * 1000;
const room = (showtimeId) => `showtime:${showtimeId}`;

const locks = new Map();

let io = null;

export const initWs = (httpServer) => {
    io = new Server(httpServer,{
        cors: {origin: "*"},
        transports: ['websocket'],
    });

    io.on("connection",(socket)=>{
        socket.on("showtime:join",({showtimeId})=>{
            if (!showtimeId) return;
            socket.join(room(showtimeId));
        });

        socket.on("seat:hold", ({ showtimeId, code, userId }) => {
            if (!showtimeId || !code || !userId) return;

            const key = `${showtimeId}:${code}`;
            const cur = locks.get(key);
            // already locked by someone (or still valid)
            if (cur && cur.expiresAt > Date.now()) {
                socket.emit("seat:hold-denied", { showtimeId, code });
                return;
            }

            // (re)lock
            if (cur) clearTimeout(cur.timeout);
            const expiresAt = Date.now() + HOLD_MS;
            const timeout = setTimeout(() => {
                locks.delete(key);
                io.to(room(showtimeId)).emit("seat:unlocked", { showtimeId, code });
            }, HOLD_MS);

            locks.set(key, { userId, expiresAt, timeout });
            io.to(room(showtimeId)).emit("seat:locked", { showtimeId, code, userId, expiresAt });
        });

        socket.on("seat:release", ({ showtimeId, code, userId }) => {
            if (!showtimeId || !code) return;
            const key = `${showtimeId}:${code}`;
            const cur = locks.get(key);
            if (!cur) return;

            // Only owner can release (or allow null to force-release)
            if (userId && cur.userId !== userId) return;

            clearTimeout(cur.timeout);
            locks.delete(key);
            io.to(room(showtimeId)).emit("seat:unlocked", { showtimeId, code });
        });
    });
    return io;
};
export const getIo = () => io;

export const clearLocksFor = (showtimeId,codes) => {
    for (const code of codes){
        const key = `${showtimeId}:${code}`;
        const cur = locks.get(key);
        if (cur){
            clearTimeout(cur.timeout);
            locks.delete(key);
        }
    }
}

export const isLockedByOther = (showtimeId,code,userId)=>{
    const key = `${showtimeId}:${code}`;
    const cur = locks.get(key);
    if (!cur) return false;
    if (cur.expiresAt > Date.now()) return false;
    return cur.userId !== userId;
}