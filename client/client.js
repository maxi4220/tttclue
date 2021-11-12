let socket = io({transports: ['websocket'], upgrade: false});

socket.on("host", function(socketId) {
    document.getElementById("host").innerHTML = "Host";
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

function sendName(event) {
    document.getElementById("playerName").innerHTML = event.target.value;

}