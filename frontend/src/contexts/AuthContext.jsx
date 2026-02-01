import { createContext, useContext, useState, useEffect } from 'react';
import {
  CognitoUserPool,
  CognitoUser,
  AuthenticationDetails,
  CognitoUserAttribute,
} from 'amazon-cognito-identity-js';
import { CognitoIdentityClient } from '@aws-sdk/client-cognito-identity';
import { fromCognitoIdentityPool } from '@aws-sdk/credential-provider-cognito-identity';
import { awsConfig, adminConfig } from '../config/aws-config';
import { initAdminDB, saveUser, getUser, getPlatformLockdown } from '../services/admin';

const userPool = new CognitoUserPool({
  UserPoolId: awsConfig.userPoolId,
  ClientId: awsConfig.userPoolWebClientId,
});

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [credentials, setCredentials] = useState(null);
  const [authError, setAuthError] = useState(null);
  const [isLockdown, setIsLockdown] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const cognitoUser = userPool.getCurrentUser();
    if (cognitoUser) {
      cognitoUser.getSession(async (err, session) => {
        if (err) {
          setLoading(false);
          return;
        }
        if (session.isValid()) {
          cognitoUser.getUserAttributes(async (err, attributes) => {
            if (err) {
              setLoading(false);
              return;
            }
            const userData = {};
            attributes.forEach((attr) => {
              userData[attr.Name] = attr.Value;
            });

            const idToken = session.getIdToken().getJwtToken();
            const creds = await getAwsCredentials(idToken);

            if (creds) {
              // Initialize admin DB and check status
              initAdminDB(creds);

              const email = userData.email;
              const isSuperAdmin = adminConfig.superAdminEmails.includes(email);

              // Check platform lockdown
              try {
                const lockdownStatus = await getPlatformLockdown();
                setIsLockdown(lockdownStatus.enabled);

                // If lockdown is enabled and user is not super admin, block access
                if (lockdownStatus.enabled && !isSuperAdmin) {
                  setAuthError('Platform is currently in lockdown mode. Please try again later.');
                  cognitoUser.signOut();
                  setUser(null);
                  setCredentials(null);
                  setLoading(false);
                  return;
                }
              } catch (e) {
                console.error('Error checking lockdown:', e);
              }

              // Check if user is disabled
              try {
                const dbUser = await getUser(email);
                if (dbUser && dbUser.isDisabled) {
                  setAuthError('Your account has been disabled. Please contact support.');
                  cognitoUser.signOut();
                  setUser(null);
                  setCredentials(null);
                  setLoading(false);
                  return;
                }

                // Update user's last login
                await saveUser({
                  email: email,
                  cognitoId: userData.sub,
                  name: userData.name,
                  isDisabled: dbUser?.isDisabled || false,
                  createdAt: dbUser?.createdAt,
                });
              } catch (e) {
                console.error('Error checking user status:', e);
              }
            }

            setUser({
              username: cognitoUser.getUsername(),
              ...userData,
              idToken: idToken,
            });
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

      userPool.signUp(email, password, attributeList, null, async (err, result) => {
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
      setAuthError(null);

      const cognitoUser = new CognitoUser({
        Username: email,
        Pool: userPool,
      });

      const authDetails = new AuthenticationDetails({
        Username: email,
        Password: password,
      });

      cognitoUser.authenticateUser(authDetails, {
        onSuccess: async (session) => {
          cognitoUser.getUserAttributes(async (err, attributes) => {
            if (err) {
              reject(err);
              return;
            }
            const userData = {};
            attributes.forEach((attr) => {
              userData[attr.Name] = attr.Value;
            });

            const idToken = session.getIdToken().getJwtToken();
            const creds = await getAwsCredentials(idToken);

            if (creds) {
              initAdminDB(creds);

              const isSuperAdmin = adminConfig.superAdminEmails.includes(email);

              // Check platform lockdown
              try {
                const lockdownStatus = await getPlatformLockdown();
                setIsLockdown(lockdownStatus.enabled);

                if (lockdownStatus.enabled && !isSuperAdmin) {
                  setAuthError('Platform is currently in lockdown mode. Please try again later.');
                  cognitoUser.signOut();
                  setUser(null);
                  setCredentials(null);
                  reject(new Error('Platform is in lockdown mode'));
                  return;
                }
              } catch (e) {
                console.error('Error checking lockdown:', e);
              }

              // Check if user is disabled
              try {
                const dbUser = await getUser(email);
                if (dbUser && dbUser.isDisabled) {
                  setAuthError('Your account has been disabled. Please contact support.');
                  cognitoUser.signOut();
                  setUser(null);
                  setCredentials(null);
                  reject(new Error('Account disabled'));
                  return;
                }

                // Save/update user in DynamoDB
                await saveUser({
                  email: email,
                  cognitoId: userData.sub,
                  name: userData.name,
                  isDisabled: dbUser?.isDisabled || false,
                  createdAt: dbUser?.createdAt,
                });
              } catch (e) {
                console.error('Error with user sync:', e);
              }
            }

            const userInfo = {
              username: cognitoUser.getUsername(),
              ...userData,
              idToken: idToken,
            };
            setUser(userInfo);
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
    setAuthError(null);
  };

  const clearAuthError = () => {
    setAuthError(null);
  };

  // Check if current user is admin
  const isAdmin = user?.email && adminConfig.adminEmails.includes(user.email);

  // Check if current user is super admin
  const isSuperAdmin = user?.email && adminConfig.superAdminEmails.includes(user.email);

  const value = {
    user,
    credentials,
    loading,
    signUp,
    signIn,
    signOut,
    getAwsCredentials,
    authError,
    clearAuthError,
    isAdmin,
    isSuperAdmin,
    isLockdown,
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
