import React from 'react';
import {useNavigate} from 'react-router-dom';
import {useUser} from '../hooks/UserContext';
import {logout} from '../service/fetchService';

const Home = () => {
  const navigate = useNavigate();
  const { user, setUser } = useUser();

  const handleSignOut = async () => {
    const success = await logout();
    if (success) {
      setUser(null);
      navigate('/login');
    }
  };

  return (
    <div style={styles.container}>
      {/* Header with Sign Out button */}
      {user && (
        <div style={styles.header}>
          <div style={styles.userInfo}>
            <span style={styles.welcomeText}>Welcome, {user.username}!</span>
          </div>
          <button style={styles.signOutButton} onClick={handleSignOut}>
            <span style={styles.signOutText}>Sign Out</span>
          </button>
        </div>
      )}

      <div style={styles.centeredTextContainer}>
        <h1 style={styles.clangText}>CLANG</h1>
      </div>

      <div style={styles.buttonContainer}>
        <button
          style={styles.button}
          onClick={() => navigate('/join-room')}>
          <span style={styles.buttonText}>Join Room</span>
        </button>

        <button
          style={{...styles.button, ...styles.secondaryButton}}
          onClick={() => navigate('/create-room')}>
          <span style={{...styles.buttonText, ...styles.secondaryButtonText}}>
            Create Room
          </span>
        </button>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 40,
    height: '100vh',
  },
  header: {
    width: '100%',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '20px 24px',
    borderBottom: '1px solid #E5E7EB',
  },
  userInfo: {
    flex: 1,
  },
  welcomeText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
  },
  signOutButton: {
    backgroundColor: 'transparent',
    border: '1px solid #D1D5DB',
    borderRadius: 6,
    padding: '8px 16px',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  signOutText: {
    color: '#6B7280',
    fontSize: 14,
    fontWeight: '500',
  },
  centeredTextContainer: {
    flex: 1,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  clangText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#1C1C1C',
    margin: 0,
  },
  buttonContainer: {
    width: '100%',
    padding: '0 40px 20px',    
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    paddingBottom: 20,
  },
  button: {
    width: '100%',
    height: 40,
    backgroundColor: '#3680F7',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
    border: 'none',
    cursor: 'pointer',
    
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  secondaryButton: {
    backgroundColor: '#F4F5F6',
  },
  secondaryButtonText: {
    color: '#3680F7',
  },
};

export default Home;