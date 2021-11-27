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
    checkAnswer(io, room, socketId, answerSocketId) {
        const player = this.getPlayerInRoom(room, socketId);
        
        if(player.answeredCount < player.answers.length){
            
            if( answerSocketId === player.currentPlayer ){
                player.answers.find(p=>p.q === player.currentPlayer).a = answerSocketId;
                player.answeredCount++;
                io.to(socketId).emit("playerCorrect", answerSocketId);
                room.totalAnswers++;
                let totalAnswers = player.answers.length * ( player.answers.length + 1 );

                if ( room.totalAnswers === totalAnswers ) {
                    io.emit("gameFinished", "");
                }

            } else {
                io.to(socketId).emit("playerIncorrect", answerSocketId);
            }
            if( player.answeredCount === player.answers.length ) {
                io.to(socketId).emit("playerFinished"); // send scoreboard
            }
        }
    }
    startGame(io, room){
        room.players.forEach(p => {
            p.answers = [];
            room.players
                .map(player => player.socketId)                
                .map((value) => ({ value, sort: Math.random() }))
                .sort((a, b) => a.sort - b.sort)
                .map(({ value }) => value)
                .forEach((value)=>{
                    if(p.socketId !== value) {
                        p.answers.push({q: value, a: ""})
                    }
                });

                
            const currentPlayer = this.getPlayerInRoom(room, p.answers[0].q);
            p.currentPlayer = currentPlayer.socketId;
            io.to(p.socketId).emit("getCurrentPlayer", {
                truth1: currentPlayer.truth1,
                truth2: currentPlayer.truth2,
                lie: currentPlayer.lie
            });
            this.startTime = new Date().getTime();
        });
    }
}

class Room {
    Debug = null;
    gameState = 0;
    hostId = {};
    players = [];
    totalAnswers = 0;

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
    currentPlayer = "";
    currentPlayerIndex = 0;

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