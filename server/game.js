const { v4: uuidv4 } = require('uuid');

class Game {
    Debug = null;
    rooms = [];
    startTime = 0;
    endTime = 0;
    
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
    getPlayerInRoom(room, socketId){
        return room.players.find(a=>a.socketId === socketId)
    }
    checkAnswer(room, socketId, questionSocketId, answerSocketId) {
        const player = this.getPlayerInRoom(room, socketId);
        
        if(player.answeredCount < player.answers.length){
            player.answers.find(p=>p.q === questionSocketId).a = answerSocketId;
            this.answeredCount++;
        }
    }
    startGame(io, room){
        room.players.forEach(player => {
            
            room.players
                .map(player => player.socketId)                
                .map((value) => ({ value, sort: Math.random() }))
                .sort((a, b) => a.sort - b.sort)
                .map(({ value }) => value)
                .forEach((value)=>{
                    player.answers.push({q: value, a: ""})
                });

            player.answers.splice(player.answers.indexOf(player.answers.find(a=>a.q === player.socketId)), 1);
            io.to(player.socketId).emit("getCurrentPlayer", this.getPlayerInRoom(room, player.answers[0].q))
            this.startTime = new Date().getTime();
        });
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
    answers = [];
    finished = false;
    answeredCount = 0;

    constructor ( socketId, Debug ) {
        this.Debug = Debug;
        this.socketId = socketId;
        this.clean();
    }
    clean() {
        this.ready = false;
        this.truth1 = "";
        this.truth2 = "";
        this.lie = "";
        this.answers = [];
        this.finished = false;
        this.answeredCount = 0;
    }
}

module.exports = Game;