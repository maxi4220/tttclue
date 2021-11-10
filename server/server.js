const path = require('path');
const http = require('http');
const express = require('express');
const socketIO = require('socket.io');

const publicPath = path.join(__dirname, '../client');
const port = process.env.PORT || 3000;
let app = express();
let server = http.createServer(app);
let io = socketIO(server);



const Game = require("./game");
const game = new Game();

app.use(express.static(publicPath));

server.listen(port, ()=> {
    console.log(`Server is up on port ${port}.`)
});


io.on('connection', (socket) => {
    console.log('A user just connected. ' + socket.id);

    if ( game.rooms.length === 0 ) {
        game.createRoom(socket);
        socket.emit("host", "hdfhdfh");
    } else {
        game.addPlayerToRoom(socket, game.rooms[0]);
    }

    socket.on('disconnect', () => {
        console.log('A user has disconnected.' + socket.id);

        
        if ( game.rooms.length > 0 ) {
            console.log("rooms > 1");

                
            game.rooms[0].players.splice(
                game.rooms[0].players.indexOf(
                    game.rooms[0].players.find(a=>a.socket.id===socket.id)
                )
            );
            // If the disconencted one was host of a room
            if ( game.rooms[0].host === socket.id ) {
                console.log("host disconnected");


                console.log(game.rooms[0].players.length);
                // Check if there are other players in that room
                if ( game.rooms[0].players.length > 0 ) {
                    console.log("set host to the other player");
                    
                    // Assign host to the first player of the room
                    game.rooms[0].host = game.rooms[0].players[0].socket.id;
                    game.rooms[0].players[0].socket.emit("host", "hdfhdfh");

                } else {

                    game.rooms = [];

                }

            }

            // get another host if there are more clients connected
        }
        
    })

});