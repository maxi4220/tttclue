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
    getPlayerInRoom(room, socketId){
        return room.players.find(a=>a.socketId === socketId)
    }
    checkAnswer(io, room, socketId, answerSocketId) {
        const player = this.getPlayerInRoom(room, socketId);
        
        if(player.answeredCount < player.answers.length){
            
            if( answerSocketId === player.currentPlayer ){
                player.answers.find(p=>p.q === player.currentPlayer).a = answerSocketId;
                player.answeredCount++;
                player.correct+=3;

                room.totalAnswers++;

                io.to(socketId).emit("playerCorrect", answerSocketId);
            } else {
                player.incorrect ++;
                io.to(socketId).emit("playerIncorrect", answerSocketId);
            }
            if( player.answeredCount === player.answers.length ) {
                player.endTime = new Date().getTime();

                player.points =  this.calculatePlayerPoints(player);
                room.scoreboard.push(
                    {
                        name: player.name, 
                        points: player.points, 
                        time: player.endTime - player.startTime // milliseconds
                    }
                );

                io.emit("playerFinished", room.scoreboard.sort((a, b)=>b.points-a.points), player.socketId);
                
                let totalAnswers = player.answers.length * ( player.answers.length + 1 );
                if ( room.totalAnswers === totalAnswers ) {
                    io.emit("gameFinished", "");
                }
            }
        }
    }

    calculatePlayerPoints(player) {
        const MULTIPLIER = 150;
        let playerPoints = 0;

        playerPoints = (player.correct * MULTIPLIER) - 
                       (player.incorrect * MULTIPLIER) - 
                       ((player.endTime - player.startTime) / MULTIPLIER);
        playerPoints = parseInt(playerPoints);

        return playerPoints;
    }

    startGame(io, room){
        room.scoreboard = [];
        room.totalAnswers = 0;
        room.players.forEach(p => {
            p.answers = [];
            p.answeredCount = 0;
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

            console.log(p.answers);
            const currentPlayer = this.getPlayerInRoom(room, p.answers[0].q);
            p.currentPlayer = currentPlayer.socketId;
            io.to(p.socketId).emit("getCurrentPlayer", {
                truth1: currentPlayer.truth1,
                truth2: currentPlayer.truth2,
                lie: currentPlayer.lie, 
                currentPlayerIndex: currentPlayer.currentPlayerIndex + 1
            });
            p.startTime = new Date().getTime();
        });
    }
}

class Room {
    Debug = null;
    gameState = 0;
    hostId = {};
    players = [];
    totalAnswers = 0;
    scoreboard = [];

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
    clean(){
        this.totalAnswers = 0;
        this.scoreboard = [];
        this.players.forEach(player => {
            player.clean();
        })
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
    points = 0;
    correct = 0;
    incorrect = 0;
    
    startTime = 0;
    endTime = 0;

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
        this.currentPlayer = "";
        this.currentPlayerIndex = 0;
        this.points = 0;
        this.startTime = 0;
        this.endTime = 0;
        this.correct = 0;
        this.incorrect = 0;
    }
}

module.exports = Game;