import {Server, Socket} from "socket.io";
import http from "http";

export const setupSocket = (server: http.Server) => {
    const io = new Server(server);
    io.on("connection", (socket: Socket) => {
        console.log("Socket connected", socket.id)

        socket.on("disconnect", () => {
            console.log("Socket disconnected", socket.id);
        })
    })

    return io;
}