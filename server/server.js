const path = require('path');
const http = require('http');
const express = require('express');
const socketIO = require('socket.io');

const publicPath = path.join(__dirname, '../client');
const port = process.env.PORT || 3000;
let app = express();
let server = http.createServer(app);
let io = socketIO(server);


const { Debug, colors } = require("./debug");
Debug.enabled = true;
const Game = require("./game");
const game = new Game(Debug);

let hostSocket = null;

app.use(express.static(publicPath));

server.listen(port, ()=> {
    console.log(colors.FgGreen, `Server is up on port ${port}.`, colors.Reset);
});


// The user connects
io.on('connection', (socket) => {
    Debug.clear();
    // console.log(colors.FgGreen, 'A user just connected. ' + socket.id, colors.Reset);
    socket.join("room");
    socket.data.host = false;
    let room = io.of("/").adapter.rooms.get("room");
    
    if ( room.size == 1 ) {
        game.createRoom(socket.id);
        hostSocket = socket;
        socket.data.host = true;
        socket.emit("host", socket.id);
    } else {
        game.addPlayerToRoom(socket.id, game.rooms[0]);
    }
    
    io.emit("playerConnected", game.rooms[0].players);
   
    // User disconnected
    socket.on('disconnect', () => {
        Debug.clear();
        let room = io.of("/").adapter.rooms.get("room");
        
        game.rooms[0].removePlayer(socket.id);

        io.emit("playerDisconnected", game.rooms[0].players);
        // Choose another host if players available
        if ( socket.data.host && room.size > 0) {
            
            io.of("/")
            .in("room")
            .fetchSockets()
            .then((sockets)=>{
                hostSocket = sockets[0];
                sockets[0].data.host = true;
                sockets[0].emit("host", sockets[0].id);
            });
            
        }
        Debug.add({
            id: "ID: room",
            name: "Room",
            values: ["Host: " + hostSocket.id, "Players: " + io.of("/").in("room").adapter.sids.size]
        })
    });
    

    socket.on("changeName", (data) => {
        game.rooms[0].players.find(a=>a.socketId === socket.id).name = data;
        console.log(data);
        io.emit("playerConnected", game.rooms[0].players);
    });
    Debug.add({
        id: "ID: room",
        name: "Room",
        values: ["Host: " + hostSocket.id, "Players: " + io.of("/").in("room").adapter.sids.size]
    })
});

if( Debug.enabled ) {
    setInterval(() => {
        if(game.rooms.length > 0) {
            // console.log(game.rooms[0].players)
        }
        io.emit("debug", Debug.debugItems);
    }, 100);
}