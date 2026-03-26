import { createContext, useContext, useEffect, useState } from 'react';
import keycloak from '../Keycloak';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    keycloak
      .init({
        onLoad: 'login-required',
        checkLoginIframe: false,
      })
      .then((authenticated) => {
        if (authenticated && keycloak.tokenParsed) {
          const parsed = keycloak.tokenParsed;
          setUser({
            id:        parsed.sub,
            email:     parsed.email,
            firstName: parsed.given_name,
            lastName:  parsed.family_name,
            fullName:  parsed.name,
          });
          setToken(keycloak.token);
        }
      })
      .finally(() => setIsLoading(false));

    // Refresh automatique du token toutes les 60s
    const interval = setInterval(() => {
      keycloak.updateToken(30).catch(() => keycloak.logout());
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  const logout = () => {
    keycloak.logout({ redirectUri: window.location.origin });
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      isAuthenticated: !!user,
      isLoading,
      logout,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};