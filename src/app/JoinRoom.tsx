import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { IoChevronBack } from 'react-icons/io5';
import type { IconBaseProps } from 'react-icons';
import type { ComponentType } from 'react';

interface RoomItemProps {
  flag: string;
  language: string;
  courseName: string;
  creater_name: string;
  id: string;
}

const JoinRoom = () => {
  const navigate = useNavigate();
  const [roomsData, setRoomsData] = useState<RoomItemProps[]>([]);
  const [loading, setLoading] = useState(true);

  const BackIcon = IoChevronBack as ComponentType<IconBaseProps>;

  useEffect(() => {
    // Simulate fetching rooms
    setTimeout(() => {
      const fakeData: RoomItemProps[] = [
        {
          flag: '🇺🇸',
          language: 'English',
          courseName: 'AI Class Spring',
          creater_name: 'Prof. Smith',
          id: '1',
        },
        {
          flag: '🇰🇷',
          language: 'Korean',
          courseName: 'ML for Everyone',
          creater_name: 'Dr. Kim',
          id: '2',
        },
      ];
      setRoomsData(fakeData);
      setLoading(false);
    }, 500);
  }, []);

  if (roomsData.length === 0 && !loading) {
    return <div style={styles.loadingText}>No Room Available</div>; 
  }

  return (
    <div style={styles.container}>
      <div style={styles.headerContainer}>
        <button 
          type="button"
          onClick={() => navigate('/')} 
          style={styles.backButton}
        >
          <BackIcon size={24} color="#000" />
        </button>
        <h2 style={styles.headerText}>Join Room</h2>
      </div>

      <div style={styles.roomList}>
        {!loading ? (
          roomsData.map((room) => (
            <button
              key={room.id}
              type="button"
              style={styles.roomItemContainer}
              onClick={() => navigate(`/transcription/${room.id}`)}
            >
              <RoomItem {...room} />
            </button>
          ))
        ) : (
          <p style={styles.loadingText}>Loading...</p>
        )}
      </div>

      <div style={styles.buttonsContainer}>
        <button
          type="button"
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

const RoomItem: React.FC<RoomItemProps> = ({ flag, language, courseName, creater_name }) => (
  <div style={styles.roomDetails}>
    <div style={styles.roomHeader}>
      <span style={styles.roomFlag}>{flag}</span>
      <span style={styles.roomLang}>{language}</span>
    </div>
    <div style={styles.roomTitle}>{courseName}</div>
    <div style={styles.roomcreater_name}>{creater_name}</div>
  </div>
);

const styles: Record<string, React.CSSProperties> = {
  container: {
    padding: 20,
    backgroundColor: '#fff',
    minHeight: '100vh',
  },
  headerContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    marginBottom: 20,
  },
  backButton: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
  },
  headerText: {
    fontSize: 20,
    fontWeight: 600,
    color: '#000',
    margin: 0,
  },
  loadingText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
    textAlign: 'center',
  },
  roomList: {
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
    marginBottom: 20,
  },
  roomItemContainer: {
    backgroundColor: '#F9FAFB',
    border: '1px solid #e0e0e0',
    borderRadius: 8,
    padding: 16,
    textAlign: 'left',
    cursor: 'pointer',
  },
  roomDetails: {
    display: 'flex',
    flexDirection: 'column',
  },
  roomHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    marginBottom: 5,
  },
  roomFlag: {
    fontSize: 14,
  },
  roomLang: {
    fontSize: 14,
    fontWeight: 600,
    color: '#1c1c1c',
  },
  roomTitle: {
    fontSize: 16,
    fontWeight: 600,
    color: '#1c1c1c',
  },
  roomcreater_name: {
    fontSize: 12,
    color: '#1c1c1c',
    opacity: 0.5,
  },
  buttonsContainer: {
    marginTop: 'auto',
  },
  button: {
    width: '100%',
    padding: '14px 0',
    borderRadius: 8,
    border: 'none',
    fontSize: 16,
    fontWeight: 'bold',
    cursor: 'pointer',
  },
  buttonText: {
    fontWeight: 'bold',
  },
  secondaryButton: {
    backgroundColor: '#F4F5F6',
  },
  secondaryButtonText: {
    color: '#3680F7',
  },
};

export default JoinRoom;
