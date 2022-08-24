import express from "express";
import {challengeResponse, initiateAuth} from "./src/Auth.js";

const app = express();

const sendError = (message, genericMessage, recoverable, res) => { 
  console.error(message);
  const retVal = {
    recoverable,
    message: genericMessage
  };
  res.status(403);
  res.send(retVal);
  res.end();
};

app.get("/auth/session", async (req, res) => { 
  console.log(req.query)
  const username = req.query.username;
  const srp = req.query.srp;
  if( !("username" in req.query) || !("srp" in req.query) ) { 
    return sendError("Missing query parameters", "Invalid request", false, res);
  }

  let authRes;
  try { 
    authRes = await initiateAuth(username, srp, req);
  } catch(e) { 
    sendError(e, "An error was encountered.", false, req);
  }


  if( authRes.error === true ) { 
    res.status(403);
    res.send(authRes);
    return;
  }

  if( authRes.AccessToken !== null ) { 
    res.status(200);
    res.send(authRes.AccessToken);    // Does not conform to AWS API spec, yet
    return;
  }

  if( authRes.challengeResponse !== null ) { 
    res.status(202);
    res.send(authRes.challengeResponse);  // does not comform to AWS API spec, yet
    return;
  }

  res.status(500);
  res.send('Unknown error');
});

app.listen(5000, () => { 
  console.log("listening on port 5000");
});
