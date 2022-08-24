import AWS from "aws-sdk";

// Returns an access token, a challenge response, or an error.
const initiateAuth = async (username, srp, req) => { 
  
  // Be very verbose, could be much better
  if( username == null || username == undefined ) { 
    return { missing: 'username', error: true, recoverable: false };
  } 

  if( srp == null || srp == undefined ) { 
    return { missing: 'srp', error: true, recoverable: false };
  } 
  
  // Build the initiate auth parameters up.  Please ignore the 
  // environmental injection attack.  
  const ClientId = process.env.ClientId || "none";
  const UserPoolId = process.env.UserPoolId || "none";
  const params = { 
    AuthFlow: "USER_SRP_AUTH",            // Only supported flow, for now
    ClientId,
    UserPoolId,
    AuthParameters: { 
      USERNAME: username,
      SRP_A: srp
    },
    ContextData: getContextData(req)
  };

  // This is expensive.  Should it be a singleton? 
  const idProvider = new AWS.CognitoIdentityServiceProvider();

  let res;
  try { 
    res = await idProvider.adminInitiateAuth(params).promise();
  } catch(e) { 
    // Be more graceful and robust logging messages. Careful to not
    // expose too much detail up the stack; wouldn't want to log
    // credentials, etc. 
    console.log("Error interacting with AWS:");
    console.log(e);
    return { 
      error: true,
      message: "An error occured",
      recoverable: false
    };
  }

  // Let the route handler decide what to do with the output, we're just here
  // to talk to AWS.  Maybe extract only the necessary bits before returning.
  return res;
};

// Implementation coming later, for now, async stub.
const challengeResponse = async (challengeParams) => { 
  return new Promise((resolve, reject) => { 
    resolve("challenge accepted and met, here's a token!");
  });
};

// Returns the ContextData object for Cognito requests
const getContextData =  (req) => { 
  const headers = req.headers;
  const response = { 
    HttpHeaders: Object.keys(headers).map((key) => { 
      return { headerName: key, headerValue: headers[key] }
    }),
    IpAddress: req.ip,
    ServerName: req.hostname,
    ServerPath: req.path
  };
  return response;
};

export {initiateAuth, challengeResponse};

