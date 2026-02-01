import { createContext, useContext, useState, useEffect } from 'react';
import {
  CognitoUserPool,
  CognitoUser,
  AuthenticationDetails,
  CognitoUserAttribute,
} from 'amazon-cognito-identity-js';
import { CognitoIdentityClient } from '@aws-sdk/client-cognito-identity';
import { fromCognitoIdentityPool } from '@aws-sdk/credential-provider-cognito-identity';
import { awsConfig } from '../config/aws-config';

const userPool = new CognitoUserPool({
  UserPoolId: awsConfig.userPoolId,
  ClientId: awsConfig.userPoolWebClientId,
});

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [credentials, setCredentials] = useState(null);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const cognitoUser = userPool.getCurrentUser();
    if (cognitoUser) {
      cognitoUser.getSession((err, session) => {
        if (err) {
          setLoading(false);
          return;
        }
        if (session.isValid()) {
          cognitoUser.getUserAttributes((err, attributes) => {
            if (err) {
              setLoading(false);
              return;
            }
            const userData = {};
            attributes.forEach((attr) => {
              userData[attr.Name] = attr.Value;
            });
            setUser({
              username: cognitoUser.getUsername(),
              ...userData,
              idToken: session.getIdToken().getJwtToken(),
            });
            getAwsCredentials(session.getIdToken().getJwtToken());
          });
        }
        setLoading(false);
      });
    } else {
      setLoading(false);
    }
  };

  const getAwsCredentials = async (idToken) => {
    const cognitoIdentityClient = new CognitoIdentityClient({
      region: awsConfig.region,
    });

    const credentialProvider = fromCognitoIdentityPool({
      client: cognitoIdentityClient,
      identityPoolId: awsConfig.identityPoolId,
      logins: {
        [`cognito-idp.${awsConfig.region}.amazonaws.com/${awsConfig.userPoolId}`]: idToken,
      },
    });

    try {
      const creds = await credentialProvider();
      setCredentials(creds);
      return creds;
    } catch (error) {
      console.error('Error getting AWS credentials:', error);
      return null;
    }
  };

  const signUp = (email, password, name) => {
    return new Promise((resolve, reject) => {
      const attributeList = [
        new CognitoUserAttribute({ Name: 'email', Value: email }),
        new CognitoUserAttribute({ Name: 'name', Value: name }),
      ];

      userPool.signUp(email, password, attributeList, null, (err, result) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(result);
      });
    });
  };

  const signIn = (email, password) => {
    return new Promise((resolve, reject) => {
      const cognitoUser = new CognitoUser({
        Username: email,
        Pool: userPool,
      });

      const authDetails = new AuthenticationDetails({
        Username: email,
        Password: password,
      });

      cognitoUser.authenticateUser(authDetails, {
        onSuccess: (session) => {
          cognitoUser.getUserAttributes((err, attributes) => {
            if (err) {
              reject(err);
              return;
            }
            const userData = {};
            attributes.forEach((attr) => {
              userData[attr.Name] = attr.Value;
            });
            const userInfo = {
              username: cognitoUser.getUsername(),
              ...userData,
              idToken: session.getIdToken().getJwtToken(),
            };
            setUser(userInfo);
            getAwsCredentials(session.getIdToken().getJwtToken());
            resolve(userInfo);
          });
        },
        onFailure: (err) => {
          reject(err);
        },
      });
    });
  };

  const signOut = () => {
    const cognitoUser = userPool.getCurrentUser();
    if (cognitoUser) {
      cognitoUser.signOut();
    }
    setUser(null);
    setCredentials(null);
  };

  const value = {
    user,
    credentials,
    loading,
    signUp,
    signIn,
    signOut,
    getAwsCredentials,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
