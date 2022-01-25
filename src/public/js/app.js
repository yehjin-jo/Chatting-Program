const socket = io();

const welcome = document.getElementById("welcome");
const joinForm = welcome.querySelector("#join");
const roomListTab = document.getElementById("roomList");

const main = document.getElementById("main");
const messageList = main.querySelector("#messageList");
const messageInput = main.querySelector("textarea");

let roomName;
let nickname;
let messageFromWhere = false;

hiddenContent(true);
joinForm.addEventListener("submit", handleJoinSubmit);

function handleJoinSubmit(event) {
    event.preventDefault();
    const nicknameInput = joinForm.querySelector("#nickName");
    const roomnameInput = joinForm.querySelector("#roomName");

    roomName = roomnameInput.value;
    nickname = nicknameInput.value;
    
    socket.emit("name_change", nickname);
    socket.emit("enter_room",roomName, showRoom);
    
    nicknameInput.value = "";
    roomnameInput.value = "";
    
    hiddenContent(false);
}

function showRoom(newCount) {
    const h3 = main.querySelector("h3");
    h3.innerText = `Room ${roomName} (${newCount})`;
    
    messageInput.addEventListener("keydown", (e) => {
        const keycode = e.which || e.keycode;
        console.log(keycode);
        if(messageInput.value !== "") {
            if(keycode == 13 && !e.shiftKey) {
                e.preventDefault();
                messageSubmit();
                messageInput.value = "";
            }
        }
    });

    const messageForm = main.querySelector("#message");
    messageForm.addEventListener("submit", (e) => {
        e.preventDefault();
        messageSubmit();
    });

    const home = main.querySelector("#returnHome");
    home.addEventListener("click", handleHomeBtn);
} 

function handleMessageSubmit(event) {
    event.preventDefault();
    messageSubmit();
}

function messageSubmit() {
    const message = messageInput.value;
    socket.emit("new_message", message, roomName, () => {
        messageFrom(socket.id);
        showMessage(nickname, message);
        console.log(`Send ${nickname}`);
    });
    messageInput.value = "";
}

function handleHomeBtn(event) {
    event.preventDefault();
    const previousRoom = roomName;
    socket.emit("returnHome");
    hiddenContent(true);

    const h3 = welcome.querySelector("h3");
    h3.innerText = `Do you join again previous room, ${previousRoom}? >>>`;
    h3.addEventListener("click", (e) => {
        e.preventDefault();
        socket.emit("enter_room",previousRoom, showRoom);
        hiddenContent(false);
    });
}

function hiddenContent(visible) {
    if(visible) {
        main.hidden = true;
        welcome.style.display = "";
    } else {
        main.hidden = false;
        welcome.style.display = "none";
    }
}

function showMessage(user, message) {
    const messageLine = document.createElement("div");
    const nicknameLine = document.createElement("div");
    const textLine = document.createElement("div");

    if(messageFromWhere) {
        messageLine.classList.add("messageFromMe");

    } else {
        messageLine.classList.add("messageFromOther");
    }

    textLine.classList.add("textLine");
    nicknameLine.classList.add("nicknameList");
    textLine.innerText = message;
    nicknameLine.innerText = user;

    messageLine.append(nicknameLine);
    messageLine.append(textLine);
    messageList.appendChild(messageLine);
    messageList.scrollTop = messageList.scrollHeight;
}

function messageFrom(id) {
    if (socket.id === id) {
        messageFromWhere = true;
    } else {
        messageFromWhere = false;
    }     
}

function countCurrentPerson(newCount) {
    const h3 = main.querySelector("h3");
    h3.innerText = `Room ${roomName} (${newCount})`;
}

function showAlertMessage(message) {
    const userAlert = document.createElement("div");
    userAlert.className = "userAlert";
    userAlert.innerText = message;
    messageList.appendChild(userAlert);
    messageList.scrollTop = messageList.scrollHeight;
}

socket.on("welcome", (user, newCount) => {
    showAlertMessage(`Welcome ${user}!`);
    countCurrentPerson(newCount);
});

socket.on("bye", (user, newCount) => {
    showAlertMessage(`${user} left T^T`);
    countCurrentPerson(newCount);
});

socket.on("new_message", (user, message, id) => {
    messageFrom(id);
    console.log(`Receive ${user}`);
    showMessage(user, message);
    messageList
});



/* const messageList = document.querySelector("ul");

const nicknameForm = document.querySelector("#nickname");
const messageForm = document.querySelector("#message");
const socket = new WebSocket(`ws://${window.location.host}`);

function makeMessage(type, payload) {
    const msg = {type, payload};
    return JSON.stringify(msg);
}

//서버와 연결되면 실행
socket.addEventListener("open", () => {
    console.log("Connected to Server ✅");
});

socket.addEventListener("message", (message) => {
    const li = document.createElement("li");
    li.innerText = message.data;
    messageList.append(li);
});

//서버와 연결 헤제
socket.addEventListener("close", () => {
    console.log("Connected to Server ❌");
});

function handleMessageSubmit(event) {
    event.preventDefault();
    const input = messageForm.querySelector("input");
    socket.send(makeMessage("new_message", input.value));
    const li = document.createElement("li");
    li.innerText = `You: ${input.value}`;
    messageList.append(li);
    input.value = "";
}

function handleNicknameSubmit(event) {
    event.preventDefault();
    const input = nicknameForm.querySelector("input");
    socket.send(makeMessage("nickname", input.value));
    input.value = "";

}

messageForm.addEventListener("submit", handleMessageSubmit);
nicknameForm.addEventListener("submit", handleNicknameSubmit); */