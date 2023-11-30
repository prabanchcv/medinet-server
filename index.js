require("./config/mongo").connect();
const express = require("express");
const app = express();
const cors = require("./middlewares/cors");
const userRoute = require("./Routes/userRoute");
const adminRoute = require("./Routes/adminRoute");
const doctorRoute = require("./Routes/doctorRoute");
const { Server } = require("socket.io");
const socketManager = require("./config/socket");
const mongoSanitize= require("express-mongo-sanitize")
const xss = require("xss-clean")
const path = require('path');

app.use(cors);

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.use(mongoSanitize())
app.use(xss())

app.use("/images", express.static("images"));

app.use("/", userRoute);
app.use("/admin", adminRoute);
app.use("/doctor", doctorRoute);
// Serve static files from the React build output directory
app.use(express.static(path.join(__dirname, 'dist')));
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

const server = app.listen(3000, () => {
  console.log("connected");
});
const io = new Server(server, { cors: true });
socketManager(io);
