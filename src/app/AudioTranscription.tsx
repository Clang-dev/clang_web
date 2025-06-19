import { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { IoChevronBack } from 'react-icons/io5';
import type { IconBaseProps } from 'react-icons';
import type { ComponentType } from 'react';
import MicButton from '../assets/MicButton.png'; 

interface TranscriptLine {
  speaker_name: string;
  speaker_uid: string | null; // Use string | null to handle cases where speaker_uid might not be available
  text: string;
  created_at: string;
}

const AudioTranscription = () => {
  const navigate = useNavigate();
  const { id: room_id } = useParams();
  const [status, setStatus] = useState('Click to start transcription');
  const [isRecording, setIsRecording] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState<TranscriptLine[]>([]);
  
  const [allTranscript, setAllTranscript] = useState<TranscriptLine[]>([]);
  const [buffer, setBuffer] = useState('');
  const [isExitPopupVisible, setExitPopupVisible] = useState(false);
  // const user_uid = 'demo-user';
  const user_uid = localStorage.getItem("user_uid");

  const user_name = 'You';
  const recorderRef = useRef<MediaRecorder | null>(null);
  const socketRef = useRef<WebSocket | null>(null);
  const classroom_uid = localStorage.getItem("classroom_uid");
  


  const BackIcon = IoChevronBack as ComponentType<IconBaseProps>;

  // Convert URL-friendly room ID back to readable room name
  const roomName = room_id ? room_id.split('-').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ') : '';

  useEffect(() => {
    const fakeLines: TranscriptLine[] = [
      {
        speaker_name: 'Host',
        speaker_uid: 'host-uid',
        text: 'Welcome to the session!',
        created_at: new Date().toISOString(),
      },
    ];
    setAllTranscript(fakeLines);
  }, []);
  

  const toggleRecording = async () => {
    if (!isRecording) {
      setStatus('Recording...');
      setIsRecording(true);
      setIsSpeaking(true);
      setTranscript([
        {
          speaker_name: user_name,
          speaker_uid: user_uid,
          text: 'This is a live demo transcription...',
          created_at: new Date().toISOString(),
        },
      ]);
      setBuffer('(buffering...)');

      // << ADDED >>
      const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const socket = new WebSocket(`https://clang-a3xo.onrender.com/0.1.0/transcribe/room/asr_translate_v2?classroom_uid=${classroom_uid}&user_uid=${user_uid}`);



      const mediaRecorder = new MediaRecorder(audioStream, {
        mimeType: 'audio/webm'
      });

      socket.onopen = () => {
        mediaRecorder.addEventListener('dataavailable', async (event) => {
          if (event.data.size > 0 && socket.readyState === WebSocket.OPEN) {
            socket.send(event.data);
          }
        });

        mediaRecorder.start(250); // send data every 250ms
      };

socket.onmessage = (message) => {
  const received = message.data;
  if (received) {
    setTranscript((prev) => [
      ...prev,
      {
        speaker_name: user_name,
        speaker_uid: user_uid,
        text: received,
        created_at: new Date().toISOString(),
      }
    ]);
  }
};


      // Store references for stopping later
      recorderRef.current = mediaRecorder;
      socketRef.current = socket;
    } else {
      setStatus('Click to start transcription');
      setIsRecording(false);
      setIsSpeaking(false);
      setTranscript([]);
      setBuffer('');
        // ✅ STOP MediaRecorder
      if (recorderRef.current && recorderRef.current.state !== 'inactive') {
        recorderRef.current.stop();
        recorderRef.current = null;
      }

      // ✅ CLOSE WebSocket
      if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
        socketRef.current.close();
        socketRef.current = null;
      }
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.headerContainer}>
        <button
          type="button"
          onClick={() => setExitPopupVisible(true)}
          style={{ background: 'none', border: 'none' }}
        >
          <BackIcon size={24} color="#000" />
        </button>
        <h2 style={styles.headerText}>{roomName}</h2>
      </div>

      <p style={{ textAlign: 'center', marginBottom: 10 }}>{status}</p>

      <div style={styles.contentContainer}>
        {allTranscript.map((line) => (
          <div
            key={`${line.speaker_uid}-${line.created_at}`}
            style={{
              ...styles.card,
              backgroundColor: line.speaker_uid === 'host-uid' ? '#e9f4ff' : '#fff7f0',
            }}
          >
            <div style={styles.cardHeader}>
              <div
                style={{
                  ...styles.tag,
                  backgroundColor: line.speaker_uid === 'host-uid' ? '#007fff' : '#ff8e2c',
                }}
              >
                <span style={styles.tagText}>{line.speaker_name}</span>
              </div>
            </div>
            <p>{line.text}</p>
          </div>
        ))}

        {isSpeaking && (
          <div style={{ ...styles.card, backgroundColor: '#fff7f0' }}>
            <div style={styles.cardHeader}>
              <div style={{ ...styles.tag, backgroundColor: '#ff8e2c' }}>
                <span style={styles.tagText}>{user_name}</span>
              </div>
            </div>
            {transcript.map((line) => (
              <p key={`${line.speaker_uid}-${line.created_at}`}>
                {line.text}
                {line === transcript[transcript.length - 1] && buffer && (
                  <i style={{ color: 'gray' }}> {buffer}</i>
                )}
              </p>
            ))}
          </div>
        )}
      </div>

      <div style={styles.micButtonContainer}>
        <button 
          type="button"
          onClick={toggleRecording} 
          style={{ background: 'none', border: 'none' }}
        >
          <img src={MicButton} style={styles.micButton} alt="Mic" />
        </button>
      </div>

      {isExitPopupVisible && (
        <div style={styles.popupOverlay}>
          <div style={styles.popupContainer}>
            <h3 style={styles.popupTitle}>Are you sure you want to leave?</h3>
            <p style={styles.popupMessage}>
              Your translations will not be saved.
            </p>
            <button
              type="button"
              style={styles.popupButton}
              onClick={() => navigate('/join-room')}
            >
              Leave
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    padding: 20,
    backgroundColor: '#fff',
    minHeight: '100vh',
    position: 'relative',
  },
  headerContainer: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: 20,
    gap: 10,
  },
  headerText: {
    margin: 0,
    fontSize: 20,
    fontWeight: 600,
  },
  contentContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: 15,
  },
  card: {
    padding: 15,
    borderRadius: 12,
    backgroundColor: '#f4f4f4',
  },
  cardHeader: {
    marginBottom: 8,
  },
  tag: {
    borderRadius: 12,
    padding: '4px 10px',
    display: 'inline-block',
  },
  tagText: {
    color: '#fff',
    fontWeight: 600,
    fontSize: 12,
  },
  micButtonContainer: {
    position: 'fixed',
    bottom: 20,
    left: '50%',
    transform: 'translateX(-50%)',
  },
  micButton: {
    width: 75,
    height: 75,
  },
  popupOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0,0,0,0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  popupContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    width: 350,
    textAlign: 'center',
  },
  popupTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 14,
  },
  popupMessage: {
    fontSize: 14,
    color: '#1c1c1c',
    marginBottom: 24,
  },
  popupButton: {
    backgroundColor: '#e9eaed',
    padding: '10px 20px',
    border: 'none',
    borderRadius: 8,
    fontWeight: 'bold',
    cursor: 'pointer',
  },
};

export default AudioTranscription;
