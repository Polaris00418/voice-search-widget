const express = require("express");
const app = express();
const http = require("http").Server(app);
const io = require("socket.io")(http);
const port = process.env.PORT || 8181;
const GcpAPI = require("./services/gcp-api.js");

http.listen(port, function() {});

const gcpAPI = new GcpAPI();

io.on("connection", socket => {
  socket.on("startStream", () => {
    gcpAPI.startRecognitionStream(io);
  });

  socket.on("audiodata", data => {
    gcpAPI.writingToStream(data);
  });

  socket.on("endStream", () => {
    gcpAPI.stopRecognitionStream();
  });
});
