const express = require("express");
const app = express();
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: "http://localhost:5173",
        methods: ["GET", "POST"],
    },
});

io.on("connection", (socket) => {
    console.log(`User connnected: ${socket.id}`);

    socket.on("send_message", (data) => {
        console.log("message: ", data);

        socket.broadcast.emit("send_response", data);
    });

    socket.on("join_room", (data) => {
        console.log("join room: ", data);
        socket.join(data);
    });

    socket.on("send_room_message", (data) => {
        console.log("room message: ", data);
        socket.to(data.room).emit("send_response", data);
    });
});

server.listen(3000, () => {
    console.log("Server is running");
});
