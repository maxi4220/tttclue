let allPlayers = [];
let socket = io({transports: ['websocket'], upgrade: false});
let ready = false;
let gameState = 0; // Game not started

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

function updatePlayers(players) {
    let ulPlayers = document.getElementById("players");
    let gameCanStart = false;
    let readyCount = 0;

    ulPlayers.innerHTML = "";
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
        
        if ( player.socketId !== socket.id && player.ready) {
            readyCount++;
        }
    }
    if(players.length > 1 && readyCount === players.length - 1) {
        gameState = 1; // Game is starting
        let gameStarting = document.getElementById("gameStarting");
        gameStarting.style.display = "";
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