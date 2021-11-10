let socket = io({transports: ['websocket'], upgrade: false});

socket.on("host", (socket) => {
    document.getElementById("host").innerHTML = "Host";
});