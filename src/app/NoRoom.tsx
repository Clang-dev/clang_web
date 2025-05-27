import React from 'react';
import { useNavigate } from 'react-router-dom';
import { IoChevronBack } from 'react-icons/io5';
import type { IconBaseProps } from 'react-icons';

const NoRoom = () => {
  const navigate = useNavigate();
  const BackIcon = IoChevronBack as React.ComponentType<IconBaseProps>;

  return (
    <div style={styles.container}>
      <div style={styles.headerContainer}>
        <button 
          type="button"
          onClick={() => navigate(-1)} 
          style={{ background: 'none', border: 'none', cursor: 'pointer' }}
        >
          <BackIcon size={24} color="#000" />
        </button>
        <h2 style={styles.headerText}>Join Room</h2>
      </div>

      <div style={styles.noRoomContainer}>
        <div style={styles.noRoomTextContainer}>
          <p style={styles.noRoomTitle}>There are no rooms!</p>
          <p style={styles.noRoomMessage}>Please refresh or create your room.</p>
        </div>

        <div style={styles.buttonRow}>
          <button
            type="button"
            style={{ ...styles.button, ...styles.refreshButton }}
            onClick={() => navigate('/join')}
          >
            <span style={styles.refreshButtonText}>Refresh</span>
          </button>
          <button
            type="button"
            style={{ ...styles.button, ...styles.createRoomButton }}
            onClick={() => navigate('/create')}
          >
            <span style={styles.createRoomButtonText}>Create Room</span>
          </button>
        </div>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#FFFFFF',
    padding: 20,
  },
  headerContainer: {
    display: 'flex',
    alignItems: 'center',
    height: 56,
    marginBottom: 20,
    flexDirection: 'row' as const,
  },
  headerText: {
    fontSize: 20,
    fontWeight: 600,
    color: '#000',
    marginLeft: 10,
  },
  noRoomContainer: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    paddingInline: 32,
    marginBottom: 180,
  },
  noRoomTextContainer: {
    alignItems: 'center',
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 40,
  },
  noRoomTitle: {
    fontSize: 16,
    fontWeight: 600,
    color: '#1c1c1c',
  },
  noRoomMessage: {
    fontSize: 14,
    fontWeight: 400,
    color: '#1c1c1c',
    marginTop: 4,
  },
  buttonRow: {
    display: 'flex',
    flexDirection: 'row' as const,
    justifyContent: 'space-between',
    width: '100%',
    gap: 10,
  },
  button: {
    flex: 1,
    height: 40,
    borderRadius: 8,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    cursor: 'pointer',
    border: 'none',
  },
  refreshButton: {
    backgroundColor: '#e9eaed',
  },
  refreshButtonText: {
    color: '#1c1c1c',
    fontSize: 14,
    fontWeight: 'bold',
  },
  createRoomButton: {
    backgroundColor: '#3680f7',
  },
  createRoomButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
};

export default NoRoom;
