const path = require('path')
const http = require('http')
const express = require('express')
const socketio = require('socket.io')
const Filter = require('bad-words')
const { generateMessage, generateLocationMessage } = require('./utils/messages')
const { addUser, removeUser, getUser, getUsersInRoom } = require('./utils/users')

const app = express();
const server = http.createServer(app)
// new instance of scoketio
const io = socketio(server)   //here our server supports websocket

const port = process.env.PORT || 3000
const publicDirectoryPath = path.join(__dirname, '../public')

app.use(express.static(publicDirectoryPath))

// Goal: Render usernmae for text messages
// 1. Setup the server to send username to client 
// 2. Edit every call to "generateMessage" to include username
// -Use "Admin" for sys messages like connect/welcome/disconnect
//3. Update client to render useername in template





//server (emit) -> client (receive) -countUpdated
//client (emit) -> server (receive) -increment

// make a connection with the user from server side
io.on('connection', (socket)=>{
  console.log('New Websocket connection');
  // socket.emit("message", generateMessage('Welcome to the chatApp'))
  // socket.broadcast.emit('message', generateMessage('A new user has joined!'))
    // socket.on('join', ({ username, room }, callback) => {
    socket.on('join', (options, callback) => {
       const { error, user } = addUser({ id: socket.id,...options})
        
        if(error) {
           return callback(error)
        }
        
        socket.join(user.room);

        socket.emit('message', generateMessage('Admin','Welcome to the chatApp'));
        socket.broadcast.to(user.room).emit('message', generateMessage('Admin', `${user.username} joined!`)); //to specific chat room
        io.to(user.room).emit('roomData', {    //to everybody to specific room
        room: user.room,
        users: getUsersInRoom(user.room)
        })

        callback()    //know the cliet they are join(without passing argument)

    //socket.emmit, io.emit, socket.broadcast.emit
    //io.to.emit => it emit a event to everybody with specific room
    //socket.broadcast.to.emit=>to specific chat room
    });
  
    //Goal: Send messages to correct room
  //1. Use getUser inside "sendMessage" event handler to get user data
  //2. Emit the message to their current room
  //3. Test your work!
  //4. Repeat for "sendLocation"
  

  // socket.on('sendMessage', (message) =>{
  socket.on('sendMessage', (message, callback) => {
    const user = getUser(socket.id)
    const filter = new Filter();

    if (filter.isProfane(message)) {
      return callback('Profanity is not allowed!');
    }

    io.to(user.room).emit('message', generateMessage(user.username, message));
    // io.emit('message', generateMessage(message));
    // callback('Delivered!')
    callback();
  });

  socket.on('sendLocation', (coords, callback) => {
    // io.emit("message", `Location: ${coords.latitude}, ${coords.longitude}`);
    const user = getUser(socket.id)
    io.to(user.room).emit(
      'locationMessage',
      generateLocationMessage(user.username,
        `https://google.com/maps?q=${coords.latitude},${coords.longitude}`
      )
    );
    callback();
  });
 
  socket.on('disconnect', () => {
    const user = removeUser(socket.id)

    if(user){
      io.to(user.room).emit('message', generateMessage('Admin', `${user.username} has left!`));
      io.to(user.room).emit('roomData', {
        room: user.room,
        users: getUsersInRoom(user.room)
      })
    }

    // io.emit('message', generateMessage('A user has left!'));
  });
})

server.listen(port, ()=>{
    console.log(`server running on ${port}..`)
})
