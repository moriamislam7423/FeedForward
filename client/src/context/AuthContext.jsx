import { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  // This is fake login data for now. Later, we connect it to the real backend auth route.
  const [user, setUser] = useState({
    id: 'demo-user-1',
    name: 'Demo Volunteer',
    role: 'volunteer'
  });

  function switchRole(role) {
    const names = {
      volunteer: 'Demo Volunteer',
      business: 'Demo Business',
      recipient: 'Demo Shelter'
    };

    setUser({
      id: `demo-${role}-1`,
      name: names[role],
      role
    });
  }

  return (
    <AuthContext.Provider value={{ user, switchRole }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
