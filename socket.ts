// socket.ts
import { Server as HttpServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';

let io: SocketIOServer;

const initializeSocket = (server: HttpServer) => {
  io = new SocketIOServer(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    console.log("User connected ", socket.id);

    socket.on("join_room", (value) => {
      console.log("joining room: ", value);
      socket.join(value);
    });

    socket.on("send_message", (value) => {
      socket.to(value.room || "default").emit("receive_message", value);
      console.log("value: ", value);
    });
  });
};

const getIO = () => {
  if (!io) {
    throw new Error("Socket.io is not initialized!");
  }
  return io;
};

export { initializeSocket, getIO };
