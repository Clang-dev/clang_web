import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import MicButton from '../assets/MicButton.png';
import { getClassroom, getTranscript, saveTranscript, getbackendUrl } from '../service/fetchService';
import { useUser } from '../hooks/UserContext';

interface RoomInfo {
  name: string;
  created_by: string;
}

interface TranscriptionResponse {
  created_at: string;
  user_uid: string;
  transcripted_text: string;
  username: string;
}

interface TranscriptLine {
  speaker_name: string;
  speaker_uid: string | null;
  text: string;
  created_at: string;
}

const AudioTranscription = () => {
  const navigate = useNavigate();
  const { id: room_id } = useParams<{ id: string }>();
  const location = useLocation();
  const { user, loading: userLoading } = useUser();

  // State variables
  const [roomInfo, setRoomInfo] = useState<RoomInfo | null>(null);
  const [isHost, setIsHost] = useState<boolean | undefined>();
  // const [roomLoading, setRoomLoading] = useState(true);
  const [messagesLoading, setMessagesLoading] = useState(true);
  const [status, setStatus] = useState('Click to start transcription');
  const [isRecording, setIsRecording] = useState(false);
  // const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState<TranscriptLine[]>([]);
  // const [buffer, setBuffer] = useState('');
  const [allTranscript, setAllTranscript] = useState<TranscriptLine[]>([]);
  const [isExitPopupVisible, setExitPopupVisible] = useState(false);

  // User and WebSocket details
  // const user_name = user?.username; 
  const recorderRef = useRef<MediaRecorder | null>(null);
  const socketRef = useRef<WebSocket | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const setupWebSocketConnection = () => {
    if (!user || !room_id) return null;

    const socket = new WebSocket(
      `${getbackendUrl()}/0.1.0/transcribe/room/asr_translate_v2?classroom_uid=${room_id}&user_uid=${user.uid}`
    );
    
    socket.onopen = () => {
      setStatus('Connected. Ready to record.');
    };

    socket.onmessage = event => {
      if (!event.data) return;
      setTranscript(prev => [...prev, { 
        speaker_name: user.username, 
        speaker_uid: user.uid,
        text: event.data,
        created_at: new Date().toISOString(),
      }]);
    };

    socket.onclose = () => {
      setStatus('Click to start transcription');
      setIsRecording(false);
    };

    socket.onerror = () => {
      setStatus('Connection error. Please try again.');
      setIsRecording(false);
    };

    return socket;
  };

  useEffect(() => {
    if (userLoading) {
      return; // Wait for user to be loaded
    }

    if (!user) {
      navigate('/login'); // Redirect if not logged in
      return;
    }

    if (!room_id) {
      navigate('/join-room'); // Redirect if no room ID
      return;
    }

    const getRoomInfo = async () => {
      try {
        const data = await getClassroom(room_id);
        setRoomInfo(data);
        setIsHost(data.created_by === user.uid);
      } catch (error) {
        console.error('Could not fetch classroom info.', error);
        alert('Could not fetch classroom info.');
      } 
    };

    const getConversations = async () => {
      try {
        const transcriptions = await getTranscript(room_id);
        const processed: TranscriptLine[] = transcriptions.map((msg: TranscriptionResponse) => ({
          speaker_name: msg.username,
          speaker_uid: msg.user_uid,
          text: msg.transcripted_text,
          created_at: msg.created_at,
        }));
        setAllTranscript(processed);
      } catch (error) {
        console.error('Could not fetch messages.', error);
      } finally {
        setMessagesLoading(false);
      }
    };

    getRoomInfo();
    getConversations();
    
    // Initial WebSocket setup - further reconnections will be handled by toggleRecording
    const initialSocket = setupWebSocketConnection();
    socketRef.current = initialSocket;

    // Cleanup WebSocket on component unmount
    return () => {
      if (socketRef.current) {
        socketRef.current.close();
      }
      if (recorderRef.current && recorderRef.current.state !== 'inactive') {
        recorderRef.current.stop();
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
    };
  }, [room_id, user, userLoading, navigate]);

  // Handle browser back button and navigation prevention for hosts
  useEffect(() => {
    if (!isHost || !user) return;

    // Prevent page unload (closing tab, refreshing, navigating away)
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = 'As the host, leaving will end the session for all participants. Are you sure you want to leave?';
      return 'As the host, leaving will end the session for all participants. Are you sure you want to leave?';
    };

    // Prevent browser back button
    const handlePopState = (e: PopStateEvent) => {
      e.preventDefault();
      setExitPopupVisible(true);
      // Push current state back to prevent actual navigation
      window.history.pushState(null, '', window.location.href);
    };

    // Handle navigation attempts via React Router or other programmatic navigation
    const handleBeforeUnloadCapture = (e: Event) => {
      if (isHost && !isExitPopupVisible) {
        e.preventDefault();
        setExitPopupVisible(true);
        return false;
      }
    };

    // Add event listeners
    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('popstate', handlePopState);
    
    // Also capture any attempts to navigate away
    document.addEventListener('beforeunload', handleBeforeUnloadCapture, true);
    
    // Push initial state to handle back button
    window.history.pushState(null, '', window.location.href);
    
    // Additional protection: override window.close for hosts
    const originalClose = window.close;
    window.close = () => {
      if (isHost && !window.confirm('As the host, closing will end the session for all participants. Are you sure?')) {
        return;
      }
      originalClose.call(window);
    };

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('popstate', handlePopState);
      document.removeEventListener('beforeunload', handleBeforeUnloadCapture, true);
      window.close = originalClose;
    };
  }, [isHost, user, isExitPopupVisible]);

  const handleExitConfirm = () => {
    setExitPopupVisible(false);
    // Clean up resources before leaving
    if (socketRef.current) {
      socketRef.current.close();
    }
    if (recorderRef.current && recorderRef.current.state !== 'inactive') {
      recorderRef.current.stop();
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    
    // Navigate to join room page
    navigate('/join-room');
  };

  const handleExitCancel = () => {
    setExitPopupVisible(false);
  };

  

  const toggleRecording = async () => {
    if (!user) {
      alert('You must be logged in to start transcription.');
      navigate('/login');
      return;
    }

    if (!isRecording) {
      try {
        // Make sure we have a working socket connection
        if (!socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) {
          setStatus('Connecting...');
          socketRef.current = setupWebSocketConnection();
          
          // Wait a bit for the connection to establish
          await new Promise(resolve => setTimeout(resolve, 500));
          
          if (!socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) {
            setStatus('Failed to connect. Please try again.');
            return;
          }
        }

        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        streamRef.current = stream;
        setStatus('Recording...');
        setIsRecording(true);
        // setIsSpeaking(true);

        const recorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
        recorderRef.current = recorder;

        recorder.addEventListener('dataavailable', event => {
          if (event.data.size > 0 && socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
            socketRef.current.send(event.data);
          }
        });

        recorder.start(500); // Send data every 500ms
      } catch (error) {
        console.error('Error starting recording:', error);
        setStatus('Failed to start recording.');
      }
    } else {
      setStatus('Click to start transcription');
      setIsRecording(false);
      // setIsSpeaking(false);

      if (recorderRef.current && recorderRef.current.state !== 'inactive') {
        recorderRef.current.stop();
      }
      if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
        socketRef.current.close();
      }

      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }

      console.log(transcript.length, 'transcript length');

      if (transcript.length > 0) {
        const textToSave = transcript.map(t => t.text).join(' ');
        if (textToSave) {
          // Create a complete transcript object for the UI
          const finalTranscript = {
            speaker_name: user.username,
            speaker_uid: user.uid,
            text: textToSave,
            created_at: new Date().toISOString(),
          };
          
          // Update the UI immediately
          setAllTranscript(prev => [...prev, finalTranscript]);
          
          // Save to database in parallel
          saveTranscript(textToSave, room_id!)
            .then(() => {
              // Clear the transcript buffer after saving
              setTranscript([]);
            })
            .catch(err => console.error('Failed to save transcript', err));
        }
      }
    }
  };

  const roomName = location.state?.roomName || roomInfo?.name || 'Room';

  return (
    <div style={styles.container}>
      <div style={styles.headerContainer}>
        <h2 style={styles.headerText}>{roomName}</h2>
      </div>

      <div style={styles.contentContainerScrollable}>
        {messagesLoading || userLoading ? (
          <p>Loading messages...</p>
        ) : (
          allTranscript.map((line, index) => (
            <div key={index} style={styles.card}>
              <div style={styles.cardHeader}>
                <div
                  style={{
                    ...styles.tag,
                    backgroundColor:
                      line.speaker_uid === user?.uid ? '#5a43f3' : '#f0ad4e',
                  }}>
                  <span style={styles.tagText}>{line.speaker_name}</span>
                </div>
              </div>
              <p>{line.text}</p>
            </div>
          ))
        )}
        {isRecording && transcript.length > 0 && (
          <div style={styles.card}>
            <div style={styles.cardHeader}>
              <div style={{...styles.tag, backgroundColor: isHost ? '#5a43f3' : '#f0ad4e'}}>
                <span style={styles.tagText}>{transcript[0].speaker_name}</span>
              </div>
            </div>
            <p>{transcript.map(t => t.text).join(' ')}</p>
          </div>
        )}

        {/* {isRecording && buffer && (
          <div style={styles.card}>
            <div style={styles.cardHeader}>
              <div style={{...styles.tag, backgroundColor: '#5a43f3'}}>
                <span style={styles.tagText}>{user_name}</span>
              </div>
            </div>
            <p>{buffer}</p>
          </div>
        )} */}
      </div>

      <p style={{textAlign: 'center', marginBottom: 10}}>{status}</p>

      <button onClick={toggleRecording} style={styles.micButtonContainer}>
        <img src={MicButton} alt="Mic" style={styles.micButton} />
      </button>

      {/* Exit Confirmation Popup */}
      {isExitPopupVisible && (
        <div style={styles.popupOverlay}>
          <div style={styles.popupContainerExit}>
            <div style={styles.popupContentExit}>
              <h3 style={styles.popupTitleExit}>Leave Room?</h3>
              <p style={styles.popupMessageExit}>
                As the host, leaving the room will end the session for all participants. Are you sure you want to leave?
              </p>
            </div>
            <div style={styles.popupButtonsContainer}>
              <button onClick={handleExitCancel} style={styles.popupButtonCancel}>
                Cancel
              </button>
              <button onClick={handleExitConfirm} style={styles.popupButtonConfirm}>
                Leave Room
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    padding: 0,
    backgroundColor: '#fff',
    minHeight: '100vh',
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    overflow: 'hidden',
  },
  headerContainer: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: 0,
    gap: 10,
    padding: '20px 20px 10px 20px',
    background: '#fff',
    zIndex: 10,
    borderBottom: '1px solid #eee',
  },
  backButton: {
    background: 'none',
    border: 'none',
    padding: 8,
    borderRadius: 8,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  },
  backArrow: {
    fontSize: 24,
    color: '#333',
    fontWeight: 'bold',
    lineHeight: 1,
  },
  headerText: {
    margin: 0,
    fontSize: 20,
    fontWeight: 600,
  },
  contentContainerScrollable: {
    display: 'flex',
    flexDirection: 'column',
    gap: 15,
    flex: 1,
    minHeight: 0,
    overflowY: 'auto',
    padding: '10px 16px 120px 16px',
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
    left: '50%',
    bottom: 32,
    transform: 'translateX(-50%)',
    zIndex: 100,
    background: 'linear-gradient(180deg, #7b61ff 0%, #5a43f3 100%)',
    borderRadius: '50%',
    boxShadow: '0 4px 24px rgba(122, 99, 246, 0.25)',
    width: 72,
    height: 72,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: 'none',
    outline: 'none',
    padding: 0,
    cursor: 'pointer',
    transition: 'box-shadow 0.2s',
  },
  micButton: {
    width: 40,
    height: 40,
  },
  popupOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100vw',
    height: '100vh',
    backgroundColor: 'rgba(0,0,0,0.38)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },
  popupContainerFinished: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    width: 350,
    minHeight: 260,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  popupContentFinished: {
    flex: 1,
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    marginTop: 24,
    marginBottom: 24,
  },
  popupTitleFinished: {
    fontSize: 20,
    fontWeight: 700,
    color: '#111',
    margin: 0,
    marginBottom: 8,
    textAlign: 'left',
  },
  popupMessageFinished: {
    fontSize: 16,
    color: '#222',
    margin: 0,
    marginBottom: 0,
    textAlign: 'left',
  },
  popupButtonFinished: {
    width: '100%',
    background: '#3680f7',
    color: '#fff',
    fontWeight: 700,
    fontSize: 16,
    border: 'none',
    borderRadius: 12,
    padding: '16px 0',
    marginTop: 16,
    cursor: 'pointer',
    textAlign: 'center',
  },
  popupContainerExit: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    width: 350,
    minHeight: 200,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    alignItems: 'center',
    position: 'relative',
  },
  popupContentExit: {
    flex: 1,
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  popupTitleExit: {
    fontSize: 20,
    fontWeight: 700,
    color: '#111',
    margin: 0,
    marginBottom: 12,
    textAlign: 'left',
  },
  popupMessageExit: {
    fontSize: 16,
    color: '#666',
    margin: 0,
    lineHeight: 1.4,
    textAlign: 'left',
  },
  popupButtonsContainer: {
    display: 'flex',
    gap: 12,
    width: '100%',
  },
  popupButtonCancel: {
    flex: 1,
    background: '#f5f5f5',
    color: '#333',
    fontWeight: 600,
    fontSize: 16,
    border: 'none',
    borderRadius: 12,
    padding: '14px 0',
    cursor: 'pointer',
    textAlign: 'center',
    transition: 'background-color 0.2s',
  },
  popupButtonConfirm: {
    flex: 1,
    background: '#ff4757',
    color: '#fff',
    fontWeight: 600,
    fontSize: 16,
    border: 'none',
    borderRadius: 12,
    padding: '14px 0',
    cursor: 'pointer',
    textAlign: 'center',
    transition: 'background-color 0.2s',
  },
};

export default AudioTranscription;