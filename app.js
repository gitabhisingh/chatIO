const express = require("express");
const { createServer } = require("node:http");
const { Server } = require("socket.io");

const app = express();
const server = createServer(app);
const io = new Server(server);

const usernames = [];

server.listen(process.env.PORT || 3000);

app.get("/", function (req, res) {
  res.sendFile(__dirname + "/index.html");
});

io.on("connection", function (socket) {
  console.log("Connection Established.");
  socket.on("new user", function (data, callback) {
    if (usernames.indexOf(data) != -1) {
      callback(false);
    } else {
      callback(true);
      socket.username = data;
      usernames.push(socket.username);
      updateUsernames();
    }
  });

  // Update Usernames
  function updateUsernames() {
    io.emit("usernames", usernames);
  }

  //Send msg event
  socket.on("send message", function (data) {
    io.emit("new message", { msg: data, user: socket.username });
  });

  //Disconnect
  socket.on("disconnect", function (data) {
    if (!socket.username) return;
    usernames.splice(usernames.indexOf(socket.username), 1);
    updateUsernames();
  });
});
