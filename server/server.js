const path = require('path');
const http = require('http');
const express = require('express');
const socketIO = require('socket.io');

const publicPath = path.join(__dirname, '../client');
const port = process.env.PORT || 3000;
let app = express();
let server = http.createServer(app);
let io = socketIO(server);

let appInsights = require('applicationinsights');
appInsights.setup("82ec8f86-b612-4a48-a621-da5f63aeca4b").start();
/*
const scrapeIt = require("scrape-it");

const request = require("request");

require('dotenv').config();

request.get( "https://login.microsoftonline.com/5b973f99-77df-4beb-b27d-aa0c70b8482c/oauth2/v2.0/token", { 
        form: {
            "grant_type": "client_credentials",
            "client_id": "84103cda-984a-4cc0-aba5-db2d6d9e8760",
            "client_secret": "1M67Q~lyBcXge~SDORM0FA0EsaNG0nKsOzYDv",
            "scope": "api://84103cda-984a-4cc0-aba5-db2d6d9e8760/.default"
        }
    }, (err, httpResponse, body) => {
        
        
        
        // console.log(JSON.parse(body)["access_token"]);
        
        request.get( "https://graph.microsoft.com/v1.0/me", { 
            headers: {
                Authorization: "Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsIng1dCI6Imwzc1EtNTBjQ0g0eEJWWkxIVEd3blNSNzY4MCIsImtpZCI6Imwzc1EtNTBjQ0g0eEJWWkxIVEd3blNSNzY4MCJ9.eyJhdWQiOiJhcGk6Ly84NDEwM2NkYS05ODRhLTRjYzAtYWJhNS1kYjJkNmQ5ZTg3NjAiLCJpc3MiOiJodHRwczovL3N0cy53aW5kb3dzLm5ldC81Yjk3M2Y5OS03N2RmLTRiZWItYjI3ZC1hYTBjNzBiODQ4MmMvIiwiaWF0IjoxNjM2NzQ1ODQ4LCJuYmYiOjE2MzY3NDU4NDgsImV4cCI6MTYzNjc0OTc0OCwiYWlvIjoiRTJaZ1lNallXQ25QVUhxTVI2clBhb0tRazRnekFBPT0iLCJhcHBpZCI6Ijg0MTAzY2RhLTk4NGEtNGNjMC1hYmE1LWRiMmQ2ZDllODc2MCIsImFwcGlkYWNyIjoiMSIsImlkcCI6Imh0dHBzOi8vc3RzLndpbmRvd3MubmV0LzViOTczZjk5LTc3ZGYtNGJlYi1iMjdkLWFhMGM3MGI4NDgyYy8iLCJvaWQiOiI5NmFiYTI5My00ZDJkLTRlMmEtODEwZS05M2I2MWMzYjMwNWQiLCJyaCI6IjAuQVNFQW1ULVhXOTkzNjB1eWZhb01jTGhJTE5vOEVJUkttTUJNcTZYYkxXMmVoMkFoQUFBLiIsInN1YiI6Ijk2YWJhMjkzLTRkMmQtNGUyYS04MTBlLTkzYjYxYzNiMzA1ZCIsInRpZCI6IjViOTczZjk5LTc3ZGYtNGJlYi1iMjdkLWFhMGM3MGI4NDgyYyIsInV0aSI6IjFvWHFaZjdxUlVLX0tZSXc3WFJqQUEiLCJ2ZXIiOiIxLjAifQ.YD5bgkt7JQF6rv3zPe7Z__KCE-fVyRkFz7YyoLjIm296iQjKqLmr3Ta4RRnQqD6QotKAQv9rJMhO0kGUA3B2Oy45nhTrO3ApHY8QaFKmPrkfzOG8eVD_4NqiwOzU7paeEQn3aNWvDAUOO2xqm2B2mLjaGKj_s9yxN6roEKtihbnZ9tAnwUCzV7971HVvmo0TtEIGnjXNc8VSQKEfhZlvctH7-3FD1M2ajM2eesTyKhN43RHI51j-TDt9gl1eK8zfNfvskjHEGd1tRg2XtmifFHsopjryQ2EHJlC6GDXPZgHUzcOIRDkhu_0sGoQmcs1I6wAK7W5wBjaasU-Du2Mepg"
            }
        }, (err, httpResponse, body) => {
            
            console.log(body);
    
        });
    });
    


https.get({ 
    hostname: "graph.microsoft.com", path: "/v1.0/me",
    headers: {
        Authorization: "Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsIng1dCI6Imwzc1EtNTBjQ0g0eEJWWkxIVEd3blNSNzY4MCIsImtpZCI6Imwzc1EtNTBjQ0g0eEJWWkxIVEd3blNSNzY4MCJ9.eyJhdWQiOiJhcGk6Ly84NDEwM2NkYS05ODRhLTRjYzAtYWJhNS1kYjJkNmQ5ZTg3NjAiLCJpc3MiOiJodHRwczovL3N0cy53aW5kb3dzLm5ldC81Yjk3M2Y5OS03N2RmLTRiZWItYjI3ZC1hYTBjNzBiODQ4MmMvIiwiaWF0IjoxNjM2NzQxODMwLCJuYmYiOjE2MzY3NDE4MzAsImV4cCI6MTYzNjc0NTczMCwiYWlvIjoiRTJaZ1lMaG5JdlVsMisyWjRKbm8zZWJYN3BWdkFBQT0iLCJhcHBpZCI6Ijg0MTAzY2RhLTk4NGEtNGNjMC1hYmE1LWRiMmQ2ZDllODc2MCIsImFwcGlkYWNyIjoiMSIsImlkcCI6Imh0dHBzOi8vc3RzLndpbmRvd3MubmV0LzViOTczZjk5LTc3ZGYtNGJlYi1iMjdkLWFhMGM3MGI4NDgyYy8iLCJvaWQiOiI5NmFiYTI5My00ZDJkLTRlMmEtODEwZS05M2I2MWMzYjMwNWQiLCJyaCI6IjAuQVNFQW1ULVhXOTkzNjB1eWZhb01jTGhJTE5vOEVJUkttTUJNcTZYYkxXMmVoMkFoQUFBLiIsInN1YiI6Ijk2YWJhMjkzLTRkMmQtNGUyYS04MTBlLTkzYjYxYzNiMzA1ZCIsInRpZCI6IjViOTczZjk5LTc3ZGYtNGJlYi1iMjdkLWFhMGM3MGI4NDgyYyIsInV0aSI6IjZSeEdlbFVkS0V1TUhRbTdrX3RlQUEiLCJ2ZXIiOiIxLjAifQ.OGt5ZkNB3wzE_KZpD36ghgphhK7iRmNBMU74EWNThJMgZ4ysZpoD3O8lDRXL_ybZlR7JUdvPfH4FgwuPkumDqBi9JGW-8G6kCFhdoDI7KZULui-myf20ZrFvrYLpLONeJjLrCwL2TWAFc-q-362c_lWv3g5Jkxd9j9iJ-TdY9y8jr0Pr2-kL5nazIhgo3lynnri_RXUUC0h3ai3WwVpY9DSKHBdRhknmmbFbx-z_kYIcNYw-U4epwfcS5NESYtFgJbPRwr8E-SuNPh7K_Z3mC_VimPhLGSmZGxtGERMLxKgXD6MyNFcCZ8dPGaH9oOnl423oW2FXzvajMjBQsV6jtA"
    }}, (response) => {
        var result = ''
        response.on('data', function (chunk) {
            result += chunk;
        });
    
        response.on('end', function () {
            console.log(result);
        });
    
    });

*/
const Game = require("./game");
const game = new Game();
let debugItems = [];

app.use(express.static(publicPath));

server.listen(port, ()=> {
    console.log(`Server is up on port ${port}.`)
});


io.on('connection', (socket) => {
    debugItems = [];
    console.log('A user just connected. ' + socket.id);


    if ( game.rooms.length === 0 ) {
        game.createRoom(socket);
        socket.emit("host", socket.id);
    } else {
        game.addPlayerToRoom(socket, game.rooms[0]);
    }

    game.rooms[0]?.players.forEach((el)=>{
        debugItems.push({
            id: el.socket.id,
            name: "UserSocketId",
            values: []
        })
    });
    
    socket.on('disconnect', () => {
        debugItems = [];
        console.log('A user has disconnected.' + socket.id);

        
        if ( game.rooms.length > 0 ) {
            console.log("rooms > 1");

                
            game.rooms[0].players.splice(
                game.rooms[0].players.indexOf(
                    game.rooms[0].players.find(a=>a.socket.id===socket.id)
                ), 1
            );

            game.rooms[0]?.players.forEach((el)=>{
                debugItems.push({
                    id: el.socket.id,
                    name: "UserSocketId",
                    values: []
                })
            });
            debugItems.push({
                id: "ID: " + game.rooms[0]?.id,
                name: "Room",
                values: ["Host: " + game.rooms[0]?.host, "Players: " + game.rooms[0]?.players.length]
            })
            // If the disconencted one was host of a room
            if ( game.rooms[0].host === socket.id ) {
                console.log("host disconnected");

                // Check if there are other players in that room
                if ( game.rooms[0].players.length > 0 ) {
                    console.log("set host to the other player");
                    
                    // Assign host to the first player of the room
                    game.rooms[0].host = game.rooms[0].players[0].socket.id;
                    game.rooms[0].players[0].socket.emit("host", game.rooms[0].host);

                } else {

                    game.rooms = [];

                }

            }

            // get another host if there are more clients connected
        }
        
    })

    debugItems.push({
        id: "ID: " + game.rooms[0]?.id,
        name: "Room",
        values: ["Host: " + game.rooms[0]?.host, "Players: " + game.rooms[0]?.players.length]
    })
});

setInterval(() => {
    io.emit("debug", debugItems);
}, 1000);
