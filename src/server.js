import express from "express";
import http from "http";
import {Server} from "socket.io";
import { instrument } from "@socket.io/admin-ui";

const app = express();

app.set("view engine", "pug");
app.set("views", __dirname + "/views");

app.use("/public", express.static(__dirname + "/public")); //public 폴더를 유저에게 공개해 줌
app.get("/", (_, res) => res.render("index"));
app.get("/*", (_, res) => res.redirect("/")); 

const handleListen = () => console.log(`Listening on http://localhost:3000`);

const httpServer = http.createServer(app);
const wsServer = new Server(httpServer, {
    cors: {
      origin: ["https://admin.socket.io"],
      credentials: true
    }
});

instrument(wsServer, {
    auth: false
});

httpServer.listen(3000, handleListen);

function publicRooms() {
    const {
        sockets: {
            adapter: { sids, rooms },
        },
    } = wsServer;
    
    // const sids = wsServer.sockets.adapter.sids;
    // const rooms = wsServer.sockets.adapter.rooms;
    
    const publicRooms = [];
    rooms.forEach((_, key) => {
        if (sids.get(key) === undefined) {
            publicRooms.push(key);
        }
    });
    return publicRooms;
}

function countPerson(roomName) {
    return wsServer.sockets.adapter.rooms.get(roomName)?.size;
}

wsServer.on("connection", socket => {

    socket.onAny((event) => {
        console.log(`Socket Event: ${event}`);
        console.log(wsServer.sockets.adapter.rooms);
    });
    socket.on("enter_room", (roomName, done) => {
        socket.join(roomName);
        done(countPerson(roomName));
        socket.to(roomName).emit("welcome", socket.nickname, countPerson(roomName));
    });
    socket.on("disconnecting", () => {
        socket.rooms.forEach((room) => 
            socket.to(room).emit("bye", socket.nickname, countPerson(room) -1 ));
    });
    socket.on("returnHome", () => {
        socket.rooms.forEach((room) => 
        socket.to(room).emit("bye", socket.nickname, countPerson(room) -1 ));
    })
    socket.on("new_message", (message, room, done) => {
        socket.to(room).emit("new_message", socket.nickname, message, socket.id);
        done();
    });
    socket.on("name_change", name => socket["nickname"] = name);
});

/* 
const wss = new WebSocket.Server({ server });
const sockets = [];
//매번 새로운 브라우저가 서버에 접근하면 하단 코드는 연결된 각 브라우저에 대해 작동함
wss.on("connection", (socket) => {
    sockets.push(socket);
    socket["nickname"] = "Anon";
    console.log("Connected to Browser ✅"); //브라우저와 연결 완료
    socket.on("close", () => console.log("Disconnected fron the Browser ❌")); //브라우저와 연결 해제
    socket.on("message", (sentMessage) => {
        const message = JSON.parse(sentMessage);
        switch(message.type){
            case "new_message":
                sockets.forEach(aSocket => 
                    aSocket.send(`${socket.nickname}: ${message.payload.toString('utf-8')}`));
                console.log(message);
                console.log(socket["nickname"]);
                break;
            case "nickname":
                socket["nickname"] = message.payload;
                console.log(message);
                console.log(socket["nickname"]);
                break;
        }
    });
}); */


//on 메소드는 누군가에게 연결 요청이 와서 연결된 사람의 정보를 제공해주고,
//해당 이벤트를 실행하기 위한 function은 Socket(연결된 브라우저와의 연결)을 변수로 한다.



