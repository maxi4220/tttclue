let allPlayers = [];
let scoreboardPlayers = [];
let socket = io({transports: ['websocket'], upgrade: false});
let ready = false;
let gameState = 0; // Game not started
let currentPlayer;
let playerClicked;
let host = false;

const startGame = document.createElement("button");

function init() {
    
    startGame.appendChild(document.createTextNode("Start game"));
    startGame.className = "commonButton";
    startGame.id = "btnStartGame";
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
                showAlert("All must be ready!");
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
    socket.emit("changeName", playerName.value);
}

socket.on("host", function(socketId) {
    const hostGuest = document.getElementById("hostGuest");
    hostGuest.innerHTML = "";
    hostGuest.appendChild(startGame);
    document.getElementById("socketId").innerHTML = socketId;    
    host = true;
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

    let idInputContainer = document.getElementById("idInputContainer");
    idInputContainer.style.display = "none"

    updateScreenGameStarted();
});
socket.on("getCurrentPlayer", function(player){
    currentPlayer = player;
    showCurrentPlayer();
});
socket.on("playerCorrect", function(socketId){
    console.log(socketId + " is correct");
    playerClicked.classList.add("playerCorrect");
    playerClicked.onclick = undefined;
    socket.emit("showNextPlayer");
});
socket.on("playerIncorrect", function(socketId){
    console.log(socketId + " is incorrect");
    playerClicked.className = "playerIncorrect";
    window.setTimeout(function(){
        playerClicked.classList.remove("playerIncorrect");
    },1000);
});

socket.on("playerFinished", function(scoreboard, socketId){
    
    if ( socketId === socket.id ) {
        gameState = 3; // player finished
    }
    
    if ( gameState === 3 ) {
        
        console.log("You answered all.");

        let btnShowNextPlayer = document.getElementById("btnShowNextPlayer");
        btnShowNextPlayer.style.display = "none";

        let currentPlayerContainer = document.getElementById("currentPlayerContainer");
        currentPlayerContainer.style.display = "none";

        let eligiblePlayers = document.getElementById("eligiblePlayers");
        eligiblePlayers.style.display = "none";

        updateScoreboard(scoreboard);

    }
});

socket.on("gameFinished", function(players){
    gameState = 4; // game finished
    let playAgainContainer = document.getElementById("playAgainContainer");
    playAgainContainer.style.display = "";
    setNotReady();
    scoreboardPlayers = players;
    // enable button to play again on the host
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
        li.appendChild(document.createTextNode(text));
        ulPlayers.appendChild(li);
        
        if( player.socketId !== socket.id ){
            let li2 = document.createElement("div");
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
    } else {
        gameState = 0;
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
        showAlert("Enter your name.");
        return false;
    }
    if( truth1.value === "" ){
        showAlert("Enter your first truth.");
        return false;
    }
    if( truth2.value === "" ){
        showAlert("Enter your second truth.");
        return false;
    }
    if( lie.value === "" ){
        showAlert("Enter your lie.");
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
    if(btnNotReady)
        btnReady.style.display = "";
    if(btnNotReady)
        btnNotReady.style.display = "none";
    ready = false;
    gameState = 0;
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
    let currentPlayerContainer = document.getElementById("currentPlayerContainer");
    let divCurrentPlayer = document.getElementById("currentPlayer");
    divCurrentPlayer.innerHTML = "";

    let liIndex = document.createElement("div");
    liIndex.appendChild(document.createTextNode(currentPlayer.currentPlayerIndex + ". "));
    liIndex.style.backgroundColor = "rgba(175, 175, 175, 0.25)";
    liIndex.style.padding = "0.5em";
    divCurrentPlayer.appendChild(liIndex)


    let truthsLie = [];

    truthsLie.push(currentPlayer.truth1);
    truthsLie.push(currentPlayer.truth2);
    truthsLie.push(currentPlayer.lie);


    
    let random = parseInt(Math.random()*5);
    let indexes = [];
    switch(random){
        case 0:
            indexes.push(0);
            indexes.push(1);
            indexes.push(2);
            break;
        case 1:
            indexes.push(0);
            indexes.push(2);
            indexes.push(1);
            break;
        case 2:
            indexes.push(1);
            indexes.push(0);
            indexes.push(2);
            break;
        case 3:
            indexes.push(1);
            indexes.push(2);
            indexes.push(0);
            break;
        case 4:
            indexes.push(2);
            indexes.push(1);
            indexes.push(0);
            break;
        case 5:
            indexes.push(2);
            indexes.push(0);
            indexes.push(1);
            break;
    }
    for(let i in indexes){
        let div = document.createElement("div");
        div.appendChild(document.createTextNode(truthsLie[ indexes[i] ]));
        divCurrentPlayer.appendChild(div);
    }
    


    currentPlayerContainer.style.display = "block";
}

function restart(){
    let btnReady = document.getElementById("btnReady");
    let btnStartGame = document.getElementById("btnStartGame");
    let objScoreboardContainer = document.getElementById("scoreboardContainer");
    let idInputContainer = document.getElementById("idInputContainer");
    let playAgainContainer = document.getElementById("playAgainContainer");
    
    

    let ulPlayers = document.getElementById("players");
    ulPlayers.style.display = "";

    objScoreboardContainer.style.display = "none";
    playAgainContainer.style.display = "none";
    
    idInputContainer.style.display = "";
    

    if(btnReady)
        btnReady.style.display = "";
    if(btnStartGame)
        btnStartGame.style.display = "";

    gameState = 0;
}

function showNextPlayer(){
    socket.emit("showNextPlayer");
}

function updateScoreboard(scoreboard) {
    let objScoreboardContainer = document.getElementById("scoreboardContainer");
    let objScoreboard = document.getElementById("scoreboard");
    objScoreboard.innerHTML = "";
    
    for(let i = 0; i < scoreboard.length; i++) {

        let player = scoreboard[i];

        let div = document.createElement("div");
        
        let position = document.createElement("span");
        let name = document.createElement("span");
        let points = document.createElement("span");
        let time = document.createElement("span");

        position.appendChild(document.createTextNode( parseInt(i+1)+". "));
        name.appendChild(document.createTextNode(player.name+" - "));
        points.appendChild(document.createTextNode(player.points+" pts. "));
        time.appendChild(document.createTextNode(player.time+" ms."));

        div.appendChild(position);
        div.appendChild(name);
        div.appendChild(points);
        div.appendChild(time);
        div.socketId = player.socketId;

        /*div.onmouseout = function(){
            let scoreboardDetail = document.getElementById("scoreboardDetail");
            scoreboardDetail.innerHTML = "";
        }*/
        div.onmouseover = function(event){
            if (window.event) {
                eventObj = window.event.srcElement;
            }
            else {
                eventObj = event.target;
            }

            if(eventObj.parentNode.socketId){
                eventObj = eventObj.parentNode;
            }
            
            let scoreboardDetail = document.getElementById("scoreboardDetail");
            let socketId = eventObj.socketId;
            let truth1 = document.createElement("div");
            let truth2 = document.createElement("div");
            let lie = document.createElement("div");
            let player;
            for(let i = 0; i < scoreboardPlayers.length; i++){
                player = scoreboardPlayers[i];
                if ( player.socketId === socketId ) {
                    break;
                }
            }
            
            truth1.appendChild(document.createTextNode("Truth 1: " + player.truth1 ));
            truth2.appendChild(document.createTextNode("Truth 2: " + player.truth2 ));
            lie.appendChild(document.createTextNode("Lie: " + player.lie ));

            scoreboardDetail.innerHTML = "";

            scoreboardDetail.appendChild(truth1);
            scoreboardDetail.appendChild(truth2);
            scoreboardDetail.appendChild(lie);
        };

        objScoreboard.appendChild(div);
        objScoreboard.onmouseout = function(){
            let scoreboardDetail = document.getElementById("scoreboardDetail");
            scoreboardDetail.innerHTML = "";
        };

    }


    objScoreboardContainer.style.display = "";

}

function showAlert(message) {
    var x = document.getElementById("snackbar");
    x.innerHTML = message;
    // Add the "show" class to DIV
    x.className = "show";
  
    // After 3 seconds, remove the show class from DIV
    setTimeout(function(){ x.className = x.className.replace("show", ""); }, 3000);
}