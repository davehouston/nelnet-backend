// TODO: For a serious app, put this in its own module, to 
// facilitate testing routes, etc. as well.  Especially since
// there's some business logic that creeped in for "get /auth/session"
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


// These functions should all be in their own module in a larger app. 
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
    console.log("Error", authRes);
    return;
  }

  if( authRes.AccessToken !== null ) { 
    res.status(200);
    res.send(authRes.AccessToken);    // Does not conform to AWS API spec, yet
    console.log("Token Success", { extra: "things", without: "PII" });
    return;
  }

  if( authRes.challengeResponse !== null ) { 
    res.status(202);
    res.send(authRes.challengeResponse);  // does not conform to AWS API spec, yet
    console.log("Challenge Response", { more: "things", alsoWithout: "PII" });
    return;
  }

  res.status(500);
  res.send("Unknown error");
});

app.listen(5000, () => { 
  console.log("listening on port 5000"); // BORING
});
