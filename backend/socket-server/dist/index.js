import express from 'express';
import { createServer } from 'node:http';
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';
import { Server } from 'socket.io';
import { WebSocketServer } from 'ws';
// @ts-ignore
import { setupWSConnection } from 'y-websocket/server';
const app = express();
const server = createServer(app); //create the http server
const io = new Server(server, {
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"],
    },
});
//Create a Websocket server
const wss = new WebSocketServer({ noServer: true });
//websocket connections 
wss.on('connection', (ws, req) => {
    setupWSConnection(ws, req);
    console.log("setup web socket");
});
const __dirname = dirname(fileURLToPath(import.meta.url));
//Define a route handler / that gets called when we hit our website home.
app.get('/', (req, res) => {
    res.send('Server Started :)');
    //res.sendFile(join(__dirname, 'page.tsx'));
});
//Handle upgrades
server.on('upgrade', (request, socket, head) => {
    // Extract the pathname (ignoring query parameters)
    const pathname = request.url?.split('?')[0];
    // Route Y.js WebSocket connections
    if (pathname === '/yjs') {
        wss.handleUpgrade(request, socket, head, (ws) => {
            wss.emit('connection', ws, request); // Forward to y-websocket
        });
    }
    else {
        socket.destroy();
    }
});
io.on('connection', (socket) => {
    console.log('A user connected', socket.id);
    socket.on("join-room", (projectId) => {
        socket.join(projectId);
        console.log("room joined: ", socket.id, projectId);
    });
    socket.on("request-current-doc", (payload) => {
        const { projectId, stateVector } = payload;
        if (!projectId || !stateVector) {
            console.error("Missing projectId or stateVector");
            return;
        }
        console.log("id,", projectId);
        socket.to(projectId).emit("retrieve-current-doc", { client: socket.id, state: stateVector });
        console.log("in request event", stateVector);
    });
    socket.on("provide-current-doc", (diff, client) => {
        io.to(client).emit("load-current-doc", diff);
        console.log("in provide event");
    });
    //emit all changes to every socket in the room
    socket.on("doc-update", (projectId, update) => {
        socket.to(projectId).emit("changes-made", update); //send the update under an event 
        console.log("in update event");
    });
    socket.on('disconnect', () => {
        console.log('user disconnected');
    });
});
const PORT = 3001;
server.listen(PORT, () => {
    console.log(`server running at http://localhost:${PORT}`);
});
