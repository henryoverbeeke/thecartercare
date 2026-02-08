import { createContext, useContext, useState } from 'react';

const AdminContext = createContext(null);

export function AdminProvider({ children }) {
  // View-as-user state: when set, admin views the app as this user
  const [viewAsUser, setViewAsUser] = useState(null);
  
  // Developer view mode: controls what the developer sees
  const [devViewMode, setDevViewMode] = useState('developer'); // 'developer', 'admin', 'user'

  const startViewingAs = (userData) => {
    setViewAsUser({
      email: userData.email,
      cognitoId: userData.cognitoId,
      name: userData.name,
    });
  };

  const stopViewingAs = () => {
    setViewAsUser(null);
  };

  const value = {
    viewAsUser,
    startViewingAs,
    stopViewingAs,
    isViewingAsUser: !!viewAsUser,
    devViewMode,
    setDevViewMode,
  };

  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>;
}

export function useAdmin() {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
}
