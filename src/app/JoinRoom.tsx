import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { IoChevronBack } from 'react-icons/io5';
import type { IconBaseProps } from 'react-icons';
import type { ComponentType } from 'react';
import { getRooms } from '../service/fetchService';
import NoRoom from './NoRoom';

interface RoomItemProps {
  flag: string;
  language: string;
  courseName: string;
  creater_name: string;
  id: string;
}

interface RoomResponse {
  language: string;
  name: string;
  creater_name: string;
  uid: string;
}

const JoinRoom = () => {
  const navigate = useNavigate();
  const [roomsData, setRoomsData] = useState<RoomItemProps[]>([]);
  const [loading, setLoading] = useState(true);

  const BackIcon = IoChevronBack as ComponentType<IconBaseProps>;

  useEffect(() => {
    const fetchRooms = async () => {
      setLoading(true);
      try {
        const data = await getRooms();

        if (data === null) {
          navigate('/login');
          return;
        }

        const processedData: RoomItemProps[] = data.map((room: RoomResponse) => ({
          flag: room.language === 'en' ? '🇺🇸' : '🇰🇷',
          language: room.language === 'en' ? 'English' : 'Korean',
          courseName: room.name,
          creater_name: room.creater_name,
          id: room.uid,
        }));

        setRoomsData(processedData);
      } catch (error) {
        console.error('Could not fetch classrooms.', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRooms();
  }, [navigate]);

  if (loading) {
    return <p style={styles.loadingText}>Loading...</p>;
  }

  if (roomsData.length === 0) {
    return <NoRoom />;
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
        {roomsData.map(room => (
          <button
            key={room.id}
            type="button"
            style={styles.roomItemContainer}
            onClick={() =>
              navigate(`/transcription/${room.id}`, {
                state: { roomName: room.courseName },
              })
            }
          >
            <RoomItem {...room} />
          </button>
        ))}
      </div>

      <div style={styles.buttonsContainer}>
        <button
          type="button"
          style={styles.button}
          onClick={() => navigate('/create-room')}
        >
          <span style={styles.buttonText}>Create Room</span>
        </button>
      </div>
    </div>
  );
};

const RoomItem: React.FC<RoomItemProps> = ({
  flag,
  language,
  courseName,
  creater_name,
}) => (
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
    paddingTop: 50,
  },
  roomList: {
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
    marginBottom: 80, // Avoid overlap with fixed button
  },
  roomItemContainer: {
    backgroundColor: '#fff',
    border: 'none',
    borderRadius: 8,
    padding: '16px',
    textAlign: 'left',
    cursor: 'pointer',
    boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
    width: '100%',
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
    marginBottom: 6,
  },
  roomcreater_name: {
    fontSize: 12,
    color: '#1c1c1c',
    opacity: 0.5,
  },
  buttonsContainer: {
    width: '100%',
    maxWidth: 420,
    position: 'fixed',
    left: '50%',
    transform: 'translateX(-50%)',
    bottom: 0,
    background: 'rgba(255,255,255,0.95)',
    padding: '20px 20px 32px 20px',
    boxSizing: 'border-box',
    zIndex: 100,
  },
  button: {
    width: '100%',
    height: 40,
    padding: '0 16px',
    background: '#3680f7',
    border: 'none',
    borderRadius: 8,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    cursor: 'pointer',
    boxShadow: '0 2px 8px rgba(54,128,247,0.08)',
    marginTop: 0,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 700,
    fontSize: 14,
    fontFamily: 'Pretendard, Pretendard Variable, sans-serif',
    lineHeight: '14px',
    textAlign: 'center',
    width: '100%',
  },
};

export default JoinRoom;