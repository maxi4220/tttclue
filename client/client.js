const colors = {
    Reset : "\x1b[0m",
    Bright : "\x1b[1m",
    Dim : "\x1b[2m",
    Underscore : "\x1b[4m",
    Blink : "\x1b[5m",
    Reverse : "\x1b[7m",
    Hidden : "\x1b[8m",
    FgBlack : "\x1b[30m",
    FgRed : "\x1b[31m",
    FgGreen : "\x1b[32m",
    FgYellow : "\x1b[33m",
    FgBlue : "\x1b[34m",
    FgMagenta : "\x1b[35m",
    FgCyan : "\x1b[36m",
    FgWhite : "\x1b[37m",
    BgBlack : "\x1b[40m",
    BgRed : "\x1b[41m",
    BgGreen : "\x1b[42m",
    BgYellow : "\x1b[43m",
    BgBlue : "\x1b[44m",
    BgMagenta : "\x1b[45m",
    BgCyan : "\x1b[46m",
    BgWhite : "\x1b[47m",
};


let allPlayers = [];
let socket = io({transports: ['websocket'], upgrade: false});
let ready = false;
let gameState = 0; // Game not started
let currentPlayer;
let playerClicked;

const startGame = document.createElement("button");
startGame.appendChild(document.createTextNode("Start game"));
startGame.onclick = function(){
    if(validateData()){
        updatePlayers(allPlayers);
        ready = true;
        if ( gameState === 1 ) {
            blockInputs(true);        
            const playerName = document.getElementById("playerName");
            const truth1 = document.getElementById("truth1");
            const truth2 = document.getElementById("truth2");
            const lie = document.getElementById("lie");

            startGame.style.display = "none";
            socket.emit("startGame", {
                name: playerName.value,
                ready: true,
                truth1: truth1.value,
                truth2: truth2.value,
                lie: lie.value
            });
        } else {
            window.alert("All must be ready");
        }
    }
};


const playerName = document.getElementById("playerName");
const truth1 = document.getElementById("truth1");
const truth2 = document.getElementById("truth2");
const lie = document.getElementById("lie");
playerName.value = dummyPlayers[Math.floor(Math.random() * 50)].name;
truth1.value = "I am " + dummyPlayers[Math.floor(Math.random() * 50)].age + " years old.";
truth2.value = "My blood type is " + dummyPlayers[Math.floor(Math.random() * 50)].blood + ".";
lie.value = "I'm " + dummyPlayers[Math.floor(Math.random() * 50)].height + " tall.";

socket.on("host", function(socketId) {
    const hostGuest = document.getElementById("hostGuest");
    hostGuest.innerHTML = "";
    hostGuest.appendChild(startGame);
    document.getElementById("socketId").innerHTML = socketId;    
});

socket.on("debug", function(data) {
    let debugCont = document.getElementById("debug");
    if(debugCont.children.length > 0)
        debugCont.removeChild(debugCont.children[0]);
    let ul = document.createElement("ul");
    data.forEach(function(el) {
        let li = document.createElement("li");
        li.style.fontWeight = "bold";
        li.innerText = el.name;
        ul.appendChild(li);

        li = document.createElement("li");
        li.innerText = el.id;
        ul.appendChild(li);

        el.values.forEach(function(value) {
            li = document.createElement("li");
            li.innerText = value;
            ul.appendChild(li);
        });
        
    });

    debugCont.appendChild(ul)

    
    document.getElementById("socketId").innerHTML = socket.id;
});

socket.on("updatePlayers", function(players) {
    allPlayers = players;
    updatePlayers(players);
});

socket.on("startGame", function(){
    /*let gameStarting = document.getElementById("gameStarting");
    gameStarting.style.display = "";*/
    gameState = 2; //playing

    let btnNotReady = document.getElementById("btnNotReady");
    let btnReady = document.getElementById("btnReady");
    if(btnNotReady)
        btnNotReady.style.display = "none";
    if(btnReady)
        btnReady.style.display = "none";


    updateScreenGameStarted();
});
socket.on("getCurrentPlayer", function(player){
    currentPlayer = player;
    showCurrentPlayer();
});
socket.on("playerCorrect", function(socketId){
    console.log(colors.FgGreen, socketId + " is correct");
    playerClicked.classList.add("playerCorrect");
    playerClicked.onclick = undefined;
    socket.emit("showNextPlayer");
});
socket.on("playerIncorrect", function(socketId){
    console.log(colors.FgRed, socketId + " is incorrect");
    playerClicked.className = "playerIncorrect";
    window.setTimeout(function(){
        playerClicked.classList.remove("playerIncorrect");
    },1000);
});
socket.on("playerFinished", function(){
    console.log("You answered all.");
});
socket.on("gameFinished", function(){
    console.log("Game finished");
});

function updatePlayers(players) {
    let ulPlayers = document.getElementById("players");
    let ulEligiblePlayers = document.getElementById("eligiblePlayers");
    let readyCount = 0;

    ulPlayers.innerHTML = "";
    ulEligiblePlayers.innerHTML = "";
    for(let i = 0; i < players.length; i++){
        let player = players[i];
        let li = document.createElement("li");
        if(player.ready){
            li.className = "ready";
        } else {
            li.className = "notReady";
        }
        let text = "";        
        text = player.name || player.socketId;
        text += " - ";
        text += player.ready ? "Ready" : "Not ready";
        li.appendChild(document.createTextNode(text));
        ulPlayers.appendChild(li);
        
        if( player.socketId !== socket.id ){
            let li2 = document.createElement("li");
            li2.appendChild(document.createTextNode(player.name));
            li2.socketId = player.socketId;

            li2.onclick = function(event){
                let eventObj;
                if (window.event) {
                    eventObj = window.event.srcElement;
                }
                else {
                    eventObj = event.target;
                }
                socket.emit("choosePlayer", eventObj.socketId);
                console.log(eventObj.socketId);
                playerClicked = eventObj;
            };
            ulEligiblePlayers.appendChild(li2);
        }
        
        if ( player.socketId !== socket.id && player.ready) {
            readyCount++;
        }
    }
    if(players.length > 1 && readyCount === players.length - 1) {
        gameState = 1; // Game is starting
    }
}

function sendName(event) {
    var name = document.getElementById("playerName");
    name.innerHTML = event.target.value;
    socket.emit("changeName", event.target.value);
}
function validateData() {
    const playerName = document.getElementById("playerName");
    const truth1 = document.getElementById("truth1");
    const truth2 = document.getElementById("truth2");
    const lie = document.getElementById("lie");

    if( playerName.value === "" ){
        window.alert("enter your name");
        return false;
    }
    if( truth1.value === "" ){
        window.alert("enter the truth 1 about you");
        return false;
    }
    if( truth2.value === "" ){
        window.alert("enter the truth 2 about you");
        return false;
    }
    if( lie.value === "" ){
        window.alert("enter the lie about you");
        return false;
    }
    return true;
}
function setReady() {
    if(validateData()){
        blockInputs(true);
        const btnReady = document.getElementById("btnReady");
        const btnNotReady = document.getElementById("btnNotReady");
        
        const playerName = document.getElementById("playerName");
        const truth1 = document.getElementById("truth1");
        const truth2 = document.getElementById("truth2");
        const lie = document.getElementById("lie");

        btnReady.style.display = "none";
        btnNotReady.style.display = "";
        ready = true;
        socket.emit("setReady", {
            name: playerName.value,
            ready: true,
            truth1: truth1.value,
            truth2: truth2.value,
            lie: lie.value
        });
    }
}
function setNotReady() {
    blockInputs(false);
    const btnReady = document.getElementById("btnReady");
    const btnNotReady = document.getElementById("btnNotReady");
    btnReady.style.display = "";
    btnNotReady.style.display = "none";
    ready = false;
    socket.emit("setNotReady");
}
function blockInputs(val){
    const playerName = document.getElementById("playerName");
    const truth1 = document.getElementById("truth1");
    const truth2 = document.getElementById("truth2");
    const lie = document.getElementById("lie");
    playerName.disabled = val;
    truth1.disabled = val;
    truth2.disabled = val;
    lie.disabled = val;
}

function updateScreenGameStarted() {
    let eligiblePlayers = document.getElementById("eligiblePlayers");
    let players = document.getElementById("players");
    let btnShowNextPlayer = document.getElementById("btnShowNextPlayer");
    

    players.style.display="none";
    eligiblePlayers.style.display="";
    btnShowNextPlayer.style.display="";

    // show next player button (if possible)
}

function showCurrentPlayer() {
    let divCurrentPlayer = document.getElementById("currentPlayer");
    divCurrentPlayer.innerHTML = "";

    let li = document.createElement("li");
    li.appendChild(document.createTextNode(currentPlayer.truth1));
    divCurrentPlayer.appendChild(li)
    let li2 = document.createElement("li");
    li2.appendChild(document.createTextNode(currentPlayer.truth2));
    divCurrentPlayer.appendChild(li2)
    let li3 = document.createElement("li");
    li3.appendChild(document.createTextNode(currentPlayer.lie));
    divCurrentPlayer.appendChild(li3)
    divCurrentPlayer.style.display = "block";
}

function restart(){
    let btnReady = document.getElementById("btnReady");
    btnReady.style.display = "";
    gameState = 0;
}

function showNextPlayer(){
    socket.emit("showNextPlayer");
}