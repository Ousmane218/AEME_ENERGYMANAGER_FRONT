import React, { createContext, useContext, useEffect, useState } from 'react';
import keycloak from '../Keycloak';
import { getCurrentProfile } from '../services/profileService';


const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [profileError, setProfileError] = useState(null);
  const isRun = React.useRef(false);

  useEffect(() => {
    if (isRun.current) return;
    isRun.current = true;

    keycloak
      .init({
        onLoad: 'check-sso',
        silentCheckSsoRedirectUri: window.location.origin + '/silent-check-sso.html',
        checkLoginIframe: false,
      })
      .then(async (authenticated) => {
        if (authenticated && keycloak.tokenParsed) {
          setToken(keycloak.token);
          const parsed = keycloak.tokenParsed;

          try {
            const profile = await getCurrentProfile();

            const isAdmin = profile.role === 'ADMIN';
            const isDage = profile.role === 'DAGE';
            const isGestionnaire = profile.role === 'GESTIONNAIRE';

            const membershipFallback = profile.structure?.name || profile.ministere?.name || parsed.membershipService || 'Aucun service assigné';

            setUser({
              id: profile.id,
              keycloakId: parsed.sub,
              role: profile.role,
              actif: profile.actif,
              profile: profile,
              isAdmin,
              isDage,
              isGestionnaire,
              email: profile.email || parsed.email,
              firstName: profile.prenom || parsed.given_name,
              lastName: profile.nom || parsed.family_name,
              fullName: (profile.prenom && profile.nom) ? `${profile.prenom} ${profile.nom}` : parsed.name,
              username: parsed.preferred_username,
              membershipService: membershipFallback
            });
            setProfileError(null);
          } catch (error) {
            const status = error.response?.status;
            if (status === 401) {
              keycloak.clearToken();
              setUser(null);
              setProfileError('Session expirée. Veuillez vous reconnecter.');
            } else if (status === 403) {
              setUser(null);
              setProfileError('Accès interdit ou profil inactif');
            } else {
              setUser(null);
              setProfileError('Erreur de chargement du profil métier');
            }
          }
        }
      })
      .catch((err) => {
        console.error('Keycloak init error', err);
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

  const login = () => {
    keycloak.login({ redirectUri: window.location.origin + '/dashboard' });
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      isAuthenticated: !!user,
      isLoading,
      profileError,
      login,
      logout,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};