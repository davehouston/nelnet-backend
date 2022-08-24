import {describe, before, after, it} from 'mocha';
import {assert} from 'chai';
import AWS from 'aws-sdk-mock';

import {initiateAuth} from '../src/Auth.js';

// Just enough to get the 'req' object correct for testing.
const fakeRequest = { 
  headers: { host: 'localhost:5000', 'user-agent': 'curl/7.81.0', accept: '*/*' },
  ip: '169.254.1.2',
  hostname: 'fake.example.com',
  path: '/auth/session'
};

// Some potential results we may get back, to save some typing
// later
const results = { 
  caughtError: {
    error: true,
    recoverable: false
  },
  missingUsername: { 
    missing: 'username',
    error: true,
    recoverable: false
  },
  missingSRP: { 
    missing: 'srp',
    error: true,
    recoverable: false
  }
};

describe("initiateAuth functional tests", async () => { 
  before(() => { 
    AWS.mock('CognitoIdentityServiceProvider', 'adminInitiateAuth', () => { 
      return new Promise((res, rej) => { 
        // Make this return an actual, real (mocked) AWS result. 
        res(true);
      });
    });
  });

  it("should fail with missing parameters", async () => { 
    const res = await initiateAuth(null, null, fakeRequest);
    assert.deepEqual(res, results.missingUsername);
  });

  it("should fail with a missing srp", async () => { 
    const res = await initiateAuth('dave', null, fakeRequest);
    assert.deepEqual(res, results.missingSRP);
  });


  it("should succeed with proper inputs", async () => { 
    const res = await initiateAuth('dave', '5612313', fakeRequest);
    // Obviously the wrong value, but for now, the mocked value returns
    // true on success.  
    assert.equal(res, true);
  });

  after(() => { 
    AWS.restore('CognitoIdentityServiceProvider');
  });
});


