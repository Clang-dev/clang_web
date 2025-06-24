import React from 'react';
import {useNavigate} from 'react-router-dom';

const Home = () => {
  const navigate = useNavigate();

  return (
    <div style={styles.container}>
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

const styles: {[key: string]: React.CSSProperties} = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    minHeight: '100vh',
    backgroundColor: '#FFFFFF',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: '40px',
    boxSizing: 'border-box',
  },
  centeredTextContainer: {
    flex: 1,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  clangText: {
    fontSize: '48px',
    fontWeight: 'bold',
    color: '#1C1C1C',
    margin: 0,
  },
  buttonContainer: {
    width: '100%',
    maxWidth: '400px',
    padding: '0 20px 20px',
    boxSizing: 'border-box',
  },
  button: {
    height: '50px',
    backgroundColor: '#3680F7',
    borderRadius: '8px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: '14px',
    border: 'none',
    width: '100%',
    cursor: 'pointer',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: '16px',
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