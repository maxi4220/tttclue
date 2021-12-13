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
    
    let room = io.of("/").adapter.rooms.get("room");

    if ( !room || ( room && game.rooms[0].gameState === 0 ) ) {
        
        socket.join("room");
        socket.data.host = false;

        room = io.of("/").adapter.rooms.get("room");
        
        if ( room.size == 1 ) {
            game.createRoom(socket.id);
            hostSocket = socket;
            socket.data.host = true;
            socket.emit("host", socket.id);
        } else {
            game.addPlayerToRoom(socket.id, game.rooms[0]);
        }

        auxUpdatePlayers(game.rooms[0].players);
        socket.on('disconnect', () => {
            Debug.clear();
            let room = io.of("/").adapter.rooms.get("room");
            
            if(room){
                game.rooms[0].removePlayer(socket.id);

                auxUpdatePlayers(game.rooms[0].players);
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
            } else {
                game.rooms = [];
            }
        });
        socket.on("choosePlayer", (answerSocketId)=>{
            game.checkAnswer(io, game.rooms[0], socket.id, answerSocketId);

        });
        socket.on("changeName", (name)=>{
            const player = game.getPlayerInRoom(game.rooms[0], socket.id);
            if(player){
                player.name = name;
                auxUpdatePlayers(game.rooms[0].players);
            }
        });
        socket.on("startGame", (data)=>{
            game.rooms[0].gameState = 1;
            const player = game.getPlayerInRoom(game.rooms[0], socket.id);
            player.name = data.name;
            player.image = data.image;
            player.ready = data.ready;
            player.truth1 = data.truth1;
            player.truth2 = data.truth2;
            player.lie = data.lie;
            
            game.rooms[0].players
                .map( p => p.socketId )
                .forEach( socketId => {
                    io.to( socketId ).emit("updatePlayers", 
                        game.rooms[0].players
                            .map(player => ({ ...player, sort: Math.random() }))
                            .sort((a, b) => a.sort - b.sort));
                })

            io.emit("startGame");
            game.startGame(io, game.rooms[0]);
        });
        socket.on("setReady", (data)=>{
            game.rooms[0].players.map((p)=>{
                if(p.socketId === socket.id){
                    p.name = data.name;
                    p.image = data.image;
                    p.ready = true;
                    p.truth1 = data.truth1;
                    p.truth2 = data.truth2;
                    p.lie = data.lie;
                }
            });
            
            auxUpdatePlayers(game.rooms[0].players);
        });
        socket.on("setNotReady", ()=>{
            game.rooms[0].players.map((p)=>{
                if(p.socketId === socket.id){
                    p.ready = false;
                }
            });
            
            auxUpdatePlayers(game.rooms[0].players);
        });
        socket.on("showNextPlayer", ()=>{
            let player = game.getPlayerInRoom(game.rooms[0], socket.id);

            if( player.answeredCount < player.answers.length ){
                let nextAvailable;
                let nextPlayer;
                
                while ( !nextPlayer ) {
                    nextAvailable = player.answers[player.currentPlayerIndex];
                    if ( nextAvailable.a === "" && nextAvailable.q !== player.currentPlayer ) {

                        nextPlayer = game.getPlayerInRoom(game.rooms[0], nextAvailable.q);
                        player.currentPlayer = nextAvailable.q;
                        
                        socket.emit("getCurrentPlayer", {
                            truth1: nextPlayer.truth1,
                            truth2: nextPlayer.truth2,
                            lie: nextPlayer.lie,
                            currentPlayerIndex: player.currentPlayerIndex + 1
                        });
                    } 
                    
                    if( player.currentPlayerIndex < player.answers.length - 1 ) {
                        player.currentPlayerIndex++;
                    } else {
                        player.currentPlayerIndex = 0;
                        if( !player.answers.find(a => a.a === "" && a.q !== player.currentPlayer) ) {
                            break;
                        }
                    }
                }
            }
        });
        Debug.add({
            id: "ID: room",
            name: "Room",
            values: ["Host: " + hostSocket.id, "Players: " + io.of("/").in("room").adapter.sids.size]
        });
    }
});

if( Debug.enabled ) {
    setInterval(() => {
        if(game.rooms.length > 0) {
            // console.log(game.rooms[0].players)
        }
        io.emit("debug", Debug.debugItems);
    }, 1000);
}
function auxUpdatePlayers(players){
    players = players.map((player)=>{
        return {
            name: player.name,
            socketId: player.socketId,
            ready: player.ready
        }
    });
    io.emit("updatePlayers", players);
}