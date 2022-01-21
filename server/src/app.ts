import express, { Express, Request, Response, NextFunction } from "express";
import * as socketIO from "socket.io";
import * as http from "http";
import cors from "cors";
import { instrument } from "@socket.io/admin-ui";

const app: Express = express();
app.use(cors());
app.use(express.json());
const server = http.createServer(app);
const PORT: number = 4000;
const io = new socketIO.Server(server, {
  cors: {
    origin: "*",
  },
});

app.get("/", (_: Request, res: Response) =>
  res.sendFile(__dirname + "/index.html")
);
interface chatData {
  user: string;
  chat: string;
  timestamp: string;
}
interface joinData {
  room: string;
  user: string;
}
interface chats {
  [room: string]: chatData[];
}
interface idMatch {
  [id: string]: string;
}

let chats: chats = {};
let idToRoom: idMatch = {};
let idToNick: idMatch = {};

io.on("connection", (socket) => {
  console.log(`some connection ${socket.id}`);

  socket.on("join", (data: joinData) => {
    console.log(`${data.user} joined ${data.room}`);
    //socket room join and information implementation
    socket.join(data.room);
    idToRoom[socket.id] = data.room;
    idToNick[socket.id] = data.user;

    //Make ChatList when array doesn't exist
    if (!chats[data.room]) chats[data.room] = [];
    // console.log(chats[data.room]);

    //Welcoming and synchronize chats
    let room_name = idToRoom[socket.id];
    let response: chatData = {
      user: "ADMIN",
      chat: "Welcome",
      timestamp: new Date().toLocaleString(),
    };
    socket.emit("getChat", response);
    // console.log("synchro!");
    socket.emit("synchronize", chats[room_name]);
    io.to(data.room).emit(
      "users",
      Object.values(idToRoom).filter((room) => room === room_name).length
    );
    // socket.broadcast.emit(
    //   "users",
    //   Object.values(idToRoom).filter((room) => room === room_name).length
    // );
  });
  socket.on("chat", (data: chatData) => {
    //Insert chat in roomname's chatlist
    // console.log(data.chat);
    let room_name = idToRoom[socket.id];
    // console.log(room_name);
    chats[room_name].push(data);
    // console.log(`sending ${data}`);
    socket.broadcast.to(room_name).emit("getChat", data);
  });

  socket.on("disconnect", () => {
    if (idToRoom[socket.id]) {
      let room_name = idToRoom[socket.id];
      let nick_name = idToNick[socket.id];
      if (
        Object.values(idToRoom).filter((room) => room === room_name).length == 1
      ) {
        // console.log(chats[room_name]);
        console.log(`Chat end, Saved`);
      }
      console.log(`${nick_name} leaved ${room_name}`);
      //Delete objects
      delete idToRoom[socket.id];
      delete idToNick[socket.id];
      socket.broadcast
        .to(room_name)
        .emit(
          "users",
          Object.values(idToRoom).filter((room) => room === room_name).length
        );
    } else {
      console.log(`This guy didn't engaged with chatting`);
    }
  });
});

instrument(io, {
  namespaceName: "/admin",
  auth: false,
});

server.listen(PORT, () => console.log(`Server listening on : ${PORT}`));
