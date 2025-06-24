import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  ReactNode,
} from 'react';
import {me} from '../service/fetchService';
import {useNavigate} from 'react-router-dom';

// Define the shape of the user data
interface User {
  uid: string;
  username: string;
  is_verified: boolean;
  email: string;
  role: string;
  created_at: Date;
}

// Define the context shape
interface UserContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  loading: boolean;
}

// Create context
export const UserContext = createContext<UserContextType | undefined>(
  undefined,
);

// Define props for the provider
interface UserProviderProps {
  children: ReactNode;
}

export const useUser = (): UserContextType => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

// User Provider component
export const UserProvider: React.FC<UserProviderProps> = ({children}) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await me();
        if (!response) {
          // No response or token refresh failed
          navigate('/login', {replace: true});
        } else {
          const data = await response.json();
          if (response.ok) {
            setUser(data);
          } else {
            // Response not OK (e.g., invalid token)
            navigate('/login', {replace: true});
          }
        }
      } catch (error) {
        console.error('Error fetching user:', error);
        navigate('/login', {replace: true});
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [navigate]);

  return (
    <UserContext.Provider value={{user, setUser, loading}}>
      {children}
    </UserContext.Provider>
  );
};