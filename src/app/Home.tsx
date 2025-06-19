import React from 'react';
import { useNavigate } from 'react-router-dom';

const Home: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div style={styles.container}>
      <div style={styles.centeredTextContainer}>
        <h1 style={styles.clangText}>CLANG</h1>
      </div>

      <div style={styles.buttonContainer}>
        <button
          style={styles.button}
          onClick={() => navigate('/join-room')}
        >
          <span style={styles.buttonText}>Join Room</span>
        </button>

        <button
          style={{ ...styles.button, ...styles.secondaryButton }}
          onClick={() => navigate('/create-room')}
        >
          <span style={{ ...styles.buttonText, ...styles.secondaryButtonText }}>
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
    padding: '0 20px 20px',
  },
  button: {
    width: '100%',
    height: 50,
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
    fontSize: 16,
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
