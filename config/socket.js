module.exports = function (io) {
  const emailToSocketIdMap = new Map();
  const socketIdToEmailMap = new Map();

  io.on("connection", (socket) => {

      
        //chat 

        socket.on('set-up', (userData) => {
          socket.join(userData)
      });

      socket.on('setup', (userData) => {
          console.log(`User ${userData._id} connected to chat`);
          socket.join(userData._id);
          socket.emit('chat-connected');
      });

      socket.on('join-chat', (roomId, user, doctor) => {
        
          socket.join(roomId);
          if(doctor && user){
          socket.in(doctor).emit('user-requested',user,roomId)
          }
          io.to(roomId).emit('chat-connected');
      });

      socket.on('send-message', (message, chatId) => {
          console.log(message, chatId);
          socket.in(chatId).emit('recieved-message', message)
      })

      socket.on('doc-rejected',(user)=>{
          socket.in(user).emit('chat-rejected')
      })

      socket.on('leave-chat',(roomId) => {
          socket.leave(roomId)
      });

      //video



    socket.on("room:join", (data) => {
      const { email, room } = data;
      emailToSocketIdMap.set(email, socket.id);
      socketIdToEmailMap.set(socket.id, email);
      io.to(room).emit("user:joined", { email, id: socket.id });
      socket.join(room);
      io.to(socket.id).emit("room:join", data);
    });

    socket.on("user:call", ({ to, offer }) => {
      io.to(to).emit("incoming:call", { from: socket.id, offer });
    });

    socket.on("call:accepted", ({ to, ans }) => {
      io.to(to).emit("call:accepted", { from: socket.id, ans });
    });

    socket.on("peer:nego:needed", ({ to, offer }) => {
      io.to(to).emit("peer:nego:needed", { from: socket.id, offer });
    });

    socket.on("peer:nego:done", ({ to, ans }) => {
      io.to(to).emit("peer:nego:final", { from: socket.id, ans });
    });
    socket.on("socket:disconnect", ({ socketId }) => {
      // Handle socket disconnection
      const email = socketIdToEmailMap.get(socketId);
      if (email) {
        emailToSocketIdMap.delete(email);
        socketIdToEmailMap.delete(socketId);
      }

      const targetSocket = io.sockets.sockets.get(socketId);
      if (targetSocket) {
        targetSocket.disconnect();
      }
    });
  });
};
