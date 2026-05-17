import { createContext, useContext, useEffect, useState } from 'react';

const AuthContext = createContext(null);

const demoUsers = {
  volunteer: {
    id: 'demo-volunteer-1',
    name: 'Demo Volunteer',
    email: 'volunteer@demo.com',
    role: 'volunteer'
  },
  business: {
    id: 'demo-business-1',
    name: 'Demo Business',
    email: 'business@demo.com',
    role: 'business'
  },
  recipient: {
    id: 'demo-recipient-1',
    name: 'Demo Shelter',
    email: 'shelter@demo.com',
    role: 'recipient'
  }
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  useEffect(function () {
    const savedUser = localStorage.getItem('feedforward_user');

    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  function login(name, email, role) {
    const newUser = {
      id: 'demo-' + role + '-custom',
      name: name,
      email: email,
      role: role
    };

    localStorage.setItem('feedforward_user', JSON.stringify(newUser));
    setUser(newUser);
  }

  function logout() {
    localStorage.removeItem('feedforward_user');
    setUser(null);
  }

  function switchRole(role) {
    localStorage.setItem('feedforward_user', JSON.stringify(demoUsers[role]));
    setUser(demoUsers[role]);
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, switchRole }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}