const { v4: uuidv4 } = require('uuid');

class Game {
    Debug = null;
    rooms = [];
    
    constructor(Debug){
        this.Debug = Debug;
    }

    createRoom( socketId ) {
        let room = new Room( socketId, this.Debug );
        if ( this.rooms.length === 0 ) {
            let player = new Player( socketId, this.Debug );
            room.addPlayer( player );
        }
        this.rooms.push( room );
    }
    addPlayerToRoom ( socketId, room ) {
        let player = new Player( socketId, this.Debug );
        room.addPlayer( player );
    }
}

class Room {
    Debug = null;
    hostId = {};
    players = [];

    constructor( playerId, Debug) {
        this.Debug = Debug;
        this.hostId = playerId;
    }
    addPlayer( player ) {
        this.players.push(player);
    }
    removePlayer( socketId ) {
        this.players.splice(this.players.indexOf(this.players.find(a=>a.socketId === socketId)), 1);
    }
}

class Player {
    Debug = null;
    socketId = "";
    name = "";
    image = "";
    ready = false;
    truth1 = "";
    truth2 = "";
    lie = "";

    constructor ( socketId, Debug ) {
        this.Debug = Debug;
        this.socketId = socketId;
    }
}
module.exports = Game;