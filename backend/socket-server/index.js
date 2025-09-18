"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = require("express");
var node_http_1 = require("node:http");
var node_url_1 = require("node:url");
var node_path_1 = require("node:path");
var socket_io_1 = require("socket.io");
var ws_1 = require("ws");
// @ts-ignore
var utils_js_1 = require("y-websocket/bin/utils.js");
var app = (0, express_1.default)();
var server = (0, node_http_1.createServer)(app); //create the http server
var io = new socket_io_1.Server(server, {
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"],
    },
});
//Create a Websocket server
var wss = new ws_1.WebSocketServer({ noServer: true });
//websocket connections 
wss.on('connection', function (ws, req) {
    (0, utils_js_1.setupWSConnection)(ws, req);
    console.log("setup web socket");
});
var __dirname = (0, node_path_1.dirname)((0, node_url_1.fileURLToPath)(import.meta.url));
//Define a route handler / that gets called when we hit our website home.
app.get('/', function (req, res) {
    res.send('Server Started :)');
    //res.sendFile(join(__dirname, 'page.tsx'));
});
//Handle upgrades
server.on('upgrade', function (request, socket, head) {
    var _a;
    // Extract the pathname (ignoring query parameters)
    var pathname = (_a = request.url) === null || _a === void 0 ? void 0 : _a.split('?')[0];
    // Route Y.js WebSocket connections
    if (pathname === '/yjs') {
        wss.handleUpgrade(request, socket, head, function (ws) {
            wss.emit('connection', ws, request); // Forward to y-websocket
        });
    }
    else {
        socket.destroy();
    }
});
io.on('connection', function (socket) {
    console.log('A user connected', socket.id);
    socket.on("join-room", function (projectId) {
        socket.join(projectId);
        console.log("room joined: ", socket.id, projectId);
    });
    socket.on("request-current-doc", function (payload) {
        var projectId = payload.projectId, stateVector = payload.stateVector;
        if (!projectId || !stateVector) {
            console.error("Missing projectId or stateVector");
            return;
        }
        console.log("id,", projectId);
        socket.to(projectId).emit("retrieve-current-doc", { client: socket.id, state: stateVector });
        console.log("in request event", stateVector);
    });
    socket.on("provide-current-doc", function (diff, client) {
        io.to(client).emit("load-current-doc", diff);
        console.log("in provide event");
    });
    //emit all changes to every socket in the room
    socket.on("doc-update", function (projectId, update) {
        socket.to(projectId).emit("changes-made", update); //send the update under an event 
        console.log("in update event");
    });
    socket.on('disconnect', function () {
        console.log('user disconnected');
    });
});
var PORT = 3001;
server.listen(PORT, function () {
    console.log("server running at http://localhost:".concat(PORT));
});
