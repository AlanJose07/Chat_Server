const http = require('http');
const mySql = require('mysql');
const db = require('./db');
const cors = require('cors');
const { instrument } = require('@socket.io/admin-ui');
const socketIo = require('socket.io');
require('custom-env').env('stage');
const fs = require('fs');




console.log(process.env.NODE_ENV)

const path = require('path');
const ejs = require('ejs');

// Get the directory name of the current file
const dirName = path.dirname(__filename);

// console.log("Path:", dirName);
const userRooms = new Map();
let roomsData = {};








const allowedOriginList = ['http://localhost:3000',
    'http://localhost:3000', 'http://127.0.0.1:5501/testfile.html',
    'https://admin.socket.io',
    'http://127.0.0.1:5501', 'http://127.0.0.1:5501', 'http://127.0.0.1:5500', 'http://127.0.0.1:5500', 'https://chat-server-3gs8.onrender.com', 'https://chat-server-dev-pgc6.onrender.com'
];

if (process.env.DB_CONNECTION != "OFF") {
    db.connect(function (err) {
        if (err) throw err;
        console.log('DB Connected');

    });
}

const { url } = require('inspector');
const { Socket } = require('dgram');
const { log } = require('console');
var staffs;

let json = {
    'H1': '12',
    'H2': '211'
};
function dbCall(res, uri) {
    console.log("URI:-", uri)

    db.query("SELECT * FROM `tbl_staff` WHERE staff_id=" + uri, function (err, result, fields) {
        if (err) throw err
        res.writeHead(200, { 'Content-Type': 'text/json' });
        res.write(JSON.stringify(result));
        res.end();
    });
    // res.write('123');
    // res.end();
}
const corsOptions = {
    origin: ['http://example.com', 'http://another-example.com', 'http://127.0.0.1:5501',
        'https://admin.socket.io',
        'http://127.0.0.1:5500', 'http://127.0.0.1:5500/', 'https://chat-server-3gs8.onrender.com', 'http://localhost:3000/socket.io', 'https://chat-server-dev-pgc6.onrender.com'], // Array of allowed origins
};


const chatServer = http.createServer(function (req, res) {
    // res.writeHead(200, { 'Content-Type': 'text/json' });
    cors(corsOptions)(req, res, () => {
        // Your server logic here
        console.log("Response:", req.method);




        let uri = req.url;
        console.log("URI:-", uri.split('/')[1])
        // console.log("Path:",req.path)
        switch (uri.split('/')[1]) {
            case 'admin_aj_07':
                if (req.method === 'GET') {
                    const roomStats = Object.entries(roomsData).map(([room, data]) => ({
                        room,
                        userCount: data.users.size,
                        messageCount: data.messages.length,
                    }));
                    // Render the EJS template
                    ejs.renderFile(path.join(__dirname, 'views', 'admin.ejs'), { rooms: roomStats, roomsData }, (err, html) => {
                        if (err) {
                            console.error('EJS Render Error:', err); // Log the error for debugging
                            res.writeHead(500);
                            res.end(`Error rendering the admin page: ${err.message}`);
                        } else {
                            res.writeHead(200, { 'Content-Type': 'text/html' });
                            res.end(html);
                        }
                    });
                } else {
                    res.writeHead(405);
                    res.end('Method Not Allowed');
                }
                break;
            case 'user':
                if (req.method === 'OPTIONS') {
                    res.end();
                    return;
                }
                const origin = req.headers.origin;
                console.log("Origin:", origin)
                // if (allowedOriginList.includes(origin)) {
                //     console.log("Allowed")
                //     res.setHeader('Access-Control-Allow-Origin', origin);
                //     res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type, Accept');
                //     res.setHeader('Access-Control-Allow-Credentials', true);
                // }
                // if (req.method !== 'GET') {
                //     res.writeHead(405, { 'Content-Type': 'application/json' });
                //     res.end(JSON.stringify({ error: 'Method Not Allowed' }));
                // }
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.write(JSON.stringify(json));
                res.end();
                break;

            case 'goa_belt':
                dbCall(res, uri.split('/')[2]);
                break;

            case 'dbconEnd':
                db.end((error) => {
                    if (error) {
                        console.error('Error closing MySQL connection:', error);
                        return;
                    }
                    console.log('MySQL connection closed.');
                    res.writeHead(200, { 'Content-Type': 'text' });
                    res.end('DB Connection Closed');
                });
                break;
            case 'alanJose':
                fs.readFile(__dirname + "/alan-jose.html", function (err, contents) {
                    if (err) {
                        res.writeHead(500);
                        res.end(err);
                        return;
                    }
                    res.setHeader("Content-Type", "text/html");
                    res.writeHead(200);
                    res.end(contents);
                });
                break;
            case 'chatpage1':
                fs.readFile(__dirname + "/chatpage1.html", function (err, contents) {
                    if (err) {
                        res.writeHead(500);
                        res.end(err);
                        return;
                    }
                    res.setHeader("Content-Type", "text/html");
                    res.writeHead(200);
                    res.end(contents);
                });
                break;
            default:
                res.setHeader("Content-Type", "text/html");
                res.writeHead(404);
                res.end("<h1>Not Found</h1>");

        }

    });
}).listen(10000, function () {
    console.log("Server Listening")
});



// Socket Connection
const io = socketIo(chatServer, {
    cors: {
        origin: corsOptions.origin, // Allow all origins, or specify a list of allowed origins
        methods: ["GET", "POST", "OPTIONS"], // Allowed methods
        allowedHeaders: ["my-custom-header"], // Allowed headers
        credentials: true, // Allow credentials
    },
});

io.on('connection', (socket) => {

    socket.on('join room', (room) => {
        socket.join(room);
        io.to(room).emit('socket_id', socket.id);
        console.log(`User Joined room: ${room}`);

        // Initialize room data if it doesn't exist
        if (!roomsData[room]) {
            roomsData[room] = {
                users: new Set(),
                messages: [],
            };
        }
        roomsData[room].users.add(socket.id);
        console.log("Users List:", roomsData[room].users.size);
        console.log("-----------------------------------------------------------");
    });

    socket.on('leave room', (room) => {
        socket.leave(room);
        console.log(`User Left room: ${room}`);
        if (roomsData[room]) {
            roomsData[room].users.delete(socket.id);
        }
    });
    socket.on('send_image_file', (fileToSend,room, senderID, senderUsername) => {
        console.table({"room":room,"senderID":senderID,"FileName":fileToSend.name,"fileType":fileToSend.type})
        io.to(room).emit('receive files', fileToSend, senderID, senderUsername,room);
    });

    // Updated sendMessageToRoom event to include username
    socket.on('sendMessageToRoom', (room, message, user_socketID, username) => {
        console.log()
        // Check if the room exists in roomsData
        if (!roomsData[room]) {
            // If it doesn't exist, initialize it
            roomsData[room] = {
                users: new Set(),
                messages: []
            };
        }

        // Save the message
        roomsData[room].messages.push({ user_socketID, username, message });

        // Emit the message to the room
        io.to(room).emit('message', room, message, user_socketID, username);
        console.log(`${room}:-Message: ${message}:-User:`, user_socketID, `:-Username:`, username);
    });

});

instrument(io, { auth: false })


