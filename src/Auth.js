import AWS from "aws-sdk";

// Rely on environmental variables for AWS credentials, region, etc. 
const Cognito = new AWS.CognitoIdentityServiceProvider();

// Returns an access token, a challenge response, or an error.
const initiateAuth = async (username, srp) => { 
  const params = { 
    AuthFlow: "USER_SRP_AUTH",            // Only supported flow, for now
    ClientId: process.env.ClientId,       // Fix injection attack later
    UserPollId: process.env.UserPoolId, 
    AuthParameters: { 
      USERNAME: username,
      SRP_A: srp
    },
    ContextData: await getContextData()
  };

  try { 
    const res = await Cognito.AdminInitateAuth(params).promise();
  } catch(e) { 
    
  }

  return new Promise((resolve, reject) => { 
    resolve("oranges");
  });
};

const challengeResponse = async (challengeParams) => { 
  return new Promise((resolve, reject) => { 
    resolve("challenge accepted and met, here's a token!");
  });
};

// Returns the ContextData object for Cognito requests
//  -> may require dependency injection or passing the "request" or express "app" 
//  objects in.
const getContextData = async () => { 
  // Do a lot of looking at the existing host / process.env / AWS metadata URL if running
  // on EC2, etc. 

  // Almost certainly going to be async, esp. if pulling via metadata api
  const response = { 
    stuff: "things",
    hostname: "example.com"
  };

  return new Promise((resolve, reject) => { resolve(response); });
};

export {initiateAuth, challengeResponse};

