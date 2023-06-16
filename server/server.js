import {} from "dotenv/config";
import express from "express";
import { connect } from "./db/connections.js";
import { fileRouter } from "./routes/file.js";
import cors from "cors";
const server = express();
const port = 1000;

server.use(express.json())
server.use(cors())  //Connct Reaact with backend



server.use(express.json());
server.set('view engine', 'ejs');
server.use("/", fileRouter);





// Enable CORS
server.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  next();
});



let serverInstance; // Variable to hold the server instance

const start = async () => {
  try {
    await connect(process.env.MONGO_CONNECTION_STRING);
    serverInstance = server.listen(port, () =>
      console.log(`Server is listening on port ${port}`)
    );

    serverInstance.on('error', (error) => {
      if (error.code === 'EADDRINUSE') {
        console.error(`Port ${port} is already in use.`);
      } else {
        console.error('An error occurred:', error);
      }
    });
  } catch (error) {
    console.error('An error occurred:', error);
  }
};

const stop = () => {
  if (serverInstance) {
    serverInstance.close(() => {
      console.log(`Server has been closed and port ${port} is now free.`);
    });
  }
};

start();

// Example usage: Call the stop() function whenever you want to close the listening port
// stop();
