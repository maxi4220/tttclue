const { v4: uuidv4 } = require('uuid');

class Game {
    rooms = [];
    allPlayers = [];
    
    constructor(){
        console.log("New Game");
    }

    createRoom( socket ) {
        console.log("Create Room");
        if ( this.rooms.length === 0 ) {
            let player = new Player( socket );
            this.rooms.push( new Room( player ) );
        }
    }
    addPlayerToRoom ( socket, room ) {
        console.log("new player " + socket.id);
        let player = new Player( socket );
        room.addPlayer( player );
    }
}

class Room {
    host = {};
    players = [];

    constructor( player ) {
        console.log("New Room. Host: " + player.socket.id);
        this.host = player.socket.id;
        this.players.push(player);
    }

    addPlayer( player ) {
        this.players.push(player);
    }
}

class Player {
    socket = {};
    name = "";
    image = ""; //base64

    constructor ( socket ) {
        console.log("New Player");
        this.socket = socket;
    }
}

module.exports = Game;