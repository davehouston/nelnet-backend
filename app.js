import express from "express";
import {challengeResponse, initiateAuth} from "./src/Auth.js";

const app = express();

app.get("/", async (req, res) => { 
  const myResponse = "works!" + await initiateAuth() + await challengeResponse();
  res.send(myResponse);
});

app.listen(5000, () => { 
  console.log("listening on port 5000");
});
