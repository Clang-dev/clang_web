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

interface WebSocketMessage {
  type: string;
  speaker_name?: string;
  speaker_uid?: string;
  text?: string;
  created_at?: string;
  message?: string;
  participant_count?: number;
  current_speaker?: string;
  username?: string;
}

const AudioTranscription = () => {
  const navigate = useNavigate();
  const { id: room_id } = useParams<{ id: string }>();
  const location = useLocation();
  const { user, loading: userLoading } = useUser();

  // State variables
  const [roomInfo, setRoomInfo] = useState<RoomInfo | null>(null);
  const [isHost, setIsHost] = useState<boolean | undefined>();
  const [messagesLoading, setMessagesLoading] = useState(true);
  const [status, setStatus] = useState('Connecting to room...');
  const [isRecording, setIsRecording] = useState(false);
  const [isSpeaker, setIsSpeaker] = useState(false);
  const [currentSpeaker, setCurrentSpeaker] = useState<string | null>(null);
  const [participantCount, setParticipantCount] = useState(0);
  const [allTranscript, setAllTranscript] = useState<TranscriptLine[]>([]);
  const [liveTranscript, setLiveTranscript] = useState<string>(''); // Current live transcription text
  const [liveTranscriptSpeaker, setLiveTranscriptSpeaker] = useState<{name: string, uid: string} | null>(null); // Current live speaker info
  const [isExitPopupVisible, setExitPopupVisible] = useState(false);

  // Refs
  const recorderRef = useRef<MediaRecorder | null>(null);
  const socketRef = useRef<WebSocket | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [allTranscript, liveTranscript]);

  const setupWebSocketConnection = () => {
    if (!user || !room_id) return null;

    const socket = new WebSocket(
      `${getbackendUrl()}/0.1.0/transcribe/room/asr_translate_v2?classroom_uid=${room_id}&user_uid=${user.uid}`
    );
    
    socket.onopen = () => {
      setStatus('Connected to room');
    };

    socket.onmessage = event => {
      try {
        const message: WebSocketMessage = JSON.parse(event.data);
        handleWebSocketMessage(message);
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    socket.onclose = () => {
      setStatus('Disconnected from room');
      setIsRecording(false);
      setIsSpeaker(false);
    };

    socket.onerror = () => {
      setStatus('Connection error. Please try again.');
      setIsRecording(false);
      setIsSpeaker(false);
    };

    return socket;
  };

  const handleWebSocketMessage = (message: WebSocketMessage) => {
    switch (message.type) {
      case 'room_joined':
        setParticipantCount(message.participant_count || 0);
        setCurrentSpeaker(message.current_speaker || null);
        // Clear any stale live transcription when joining
        setLiveTranscript('');
        setLiveTranscriptSpeaker(null);
        if (message.current_speaker && message.current_speaker !== user?.uid) {
          setStatus('Someone is speaking. Tap mic when ready.');
        } else {
          setStatus('Tap mic to speak');
        }
        break;

      case 'transcription':
        // Handle live transcription updates (visible to all users)
        if (message.text) {
          // Replace live transcription with the latest complete text
          setLiveTranscript(prev => prev + (prev ? ' ' : '') + message.text);
          setLiveTranscriptSpeaker({
            name: message.speaker_name || 'Unknown',
            uid: message.speaker_uid || ''
          });
        }
        break;

      case 'transcription_final':
        // Handle finalized transcription (when speaker stops recording)
        if (message.text) {
          const finalLine: TranscriptLine = {
            speaker_name: message.speaker_name || 'Unknown',
            speaker_uid: message.speaker_uid || null,
            text: message.text,
            created_at: message.created_at || new Date().toISOString(),
          };
          
          // Add to permanent transcripts for all users (including the speaker)
          setAllTranscript(prev => [...prev, finalLine]);
          
          // Clear live transcription if it's from the same speaker
          if (message.speaker_uid === liveTranscriptSpeaker?.uid) {
            setLiveTranscript('');
            setLiveTranscriptSpeaker(null);
          }
        }
        break;

      case 'speaker_granted':
        setIsSpeaker(true);
        setCurrentSpeaker(user?.uid || null);
        setStatus('You are now speaking');
        // Clear any existing live transcription
        setLiveTranscript('');
        setLiveTranscriptSpeaker(null);
        // Automatically start recording when speaker is granted
        startRecording();
        break;

      case 'speaker_denied':
        setStatus('Someone else is speaking. Please wait.');
        break;

      case 'speaker_released':
        if (message.speaker_uid === user?.uid || !message.speaker_uid) {
          setIsSpeaker(false);
          setCurrentSpeaker(null);
          setStatus('Ready to speak');
        }
        // Clear live transcription when speaker is released
        setLiveTranscript('');
        setLiveTranscriptSpeaker(null);
        break;

      case 'speaker_changed':
        setCurrentSpeaker(message.speaker_uid || null);
        if (message.speaker_uid !== user?.uid) {
          setStatus(`${message.speaker_name} is speaking`);
        }
        // Clear live transcription when speaker changes
        setLiveTranscript('');
        setLiveTranscriptSpeaker(null);
        break;

      case 'participant_joined':
        setParticipantCount(message.participant_count || 0);
        break;

      case 'participant_left':
        setParticipantCount(message.participant_count || 0);
        break;

      case 'room_closing':
        setStatus('Host has left. Room is closing.');
        setTimeout(() => navigate('/join-room'), 2000);
        break;

      case 'error':
        setStatus(message.message || 'An error occurred');
        break;

      default:
        console.log('Unknown message type:', message.type);
    }
  };

  const sendWebSocketMessage = (message: any) => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify(message));
    }
  };

  const requestSpeakerAutomatic = () => {
    if (!currentSpeaker) {
      sendWebSocketMessage({ type: 'request_speaker' });
      setStatus('Requesting to speak...');
    }
  };

  const releaseSpeakerAutomatic = () => {
    if (isSpeaker) {
      sendWebSocketMessage({ type: 'release_speaker' });
      setIsSpeaker(false);
      setStatus('Ready');
    }
  };

  const startRecording = async () => {
    if (!isSpeaker) {
      setStatus('You need to be the speaker to record');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      setIsRecording(true);
      setStatus('Recording...');

      const recorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      recorderRef.current = recorder;

      recorder.addEventListener('dataavailable', event => {
        if (event.data.size > 0) {
          // Convert audio blob to base64 and send via WebSocket
          const reader = new FileReader();
          reader.onload = () => {
            const base64Data = reader.result?.toString().split(',')[1];
            if (base64Data) {
              sendWebSocketMessage({
                type: 'audio_data',
                data: base64Data
              });
            }
          };
          reader.readAsDataURL(event.data);
        }
      });

      recorder.start(500); // Send data every 500ms
    } catch (error) {
      console.error('Error starting recording:', error);
      setStatus('Failed to start recording');
      setIsRecording(false);
    }
  };

  const stopRecording = () => {
    if (!user) return; // Early return if user is null
    
    setIsRecording(false);
    
    if (recorderRef.current && recorderRef.current.state !== 'inactive') {
      recorderRef.current.stop();
    }
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }

    // Handle live transcription finalization
    if (liveTranscript.trim()) {
      const finalText = liveTranscript.trim();
      
      // Notify other users that transcription is finalized
      sendWebSocketMessage({
        type: 'transcription_final',
        text: finalText,
        speaker_name: user.username,
        speaker_uid: user.uid,
        created_at: new Date().toISOString(),
      });
      
      // Save to database
      saveTranscript(finalText, room_id!)
        .catch(err => console.error('Failed to save transcript', err));
    }
    
    // Clear live transcription - the final transcript will be added when we receive the transcription_final message
    setLiveTranscript('');
    setLiveTranscriptSpeaker(null);
  };

  const toggleRecording = async () => {
    if (!user) {
      alert('You must be logged in to start transcription.');
      navigate('/login');
      return;
    }

    // If someone else is speaking, can't start recording
    if (currentSpeaker && currentSpeaker !== user.uid) {
      setStatus('Someone else is currently speaking');
      return;
    }

    // If not recording, try to become speaker and start recording
    if (!isRecording) {
      // If not current speaker, request to become speaker first
      if (!isSpeaker) {
        requestSpeakerAutomatic();
        // The actual recording will start when we receive speaker_granted
        return;
      }
      // If already speaker, start recording
      await startRecording();
    } else {
      // Stop recording and release speaker
      stopRecording();
      releaseSpeakerAutomatic();
    }
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
    
    // Setup WebSocket connection immediately when entering room
    const socket = setupWebSocketConnection();
    socketRef.current = socket;

    // Cleanup on component unmount
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

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = 'As the host, leaving will end the session for all participants. Are you sure you want to leave?';
      return 'As the host, leaving will end the session for all participants. Are you sure you want to leave?';
    };

    const handlePopState = (e: PopStateEvent) => {
      e.preventDefault();
      setExitPopupVisible(true);
      window.history.pushState(null, '', window.location.href);
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('popstate', handlePopState);
    window.history.pushState(null, '', window.location.href);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('popstate', handlePopState);
    };
  }, [isHost, user, isExitPopupVisible]);

  const handleExitConfirm = () => {
    setExitPopupVisible(false);
    if (socketRef.current) {
      socketRef.current.close();
    }
    if (recorderRef.current && recorderRef.current.state !== 'inactive') {
      recorderRef.current.stop();
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    navigate('/join-room');
  };

  const handleExitCancel = () => {
    setExitPopupVisible(false);
  };

  const roomName = location.state?.roomName || roomInfo?.name || 'Room';

  return (
    <div style={styles.container}>
      <div style={styles.headerContainer}>
        <h2 style={styles.headerText}>{roomName}</h2>
        <div style={styles.roomInfo}>
          <span style={styles.participantCount}>👥 {participantCount}</span>
          {isHost && (
            <span style={styles.hostIndicator}>👑 Host</span>
          )}
          {currentSpeaker && (
            <span style={styles.speakerIndicator}>
              🎤 {currentSpeaker === user?.uid ? 'You' : 'Someone'} speaking
            </span>
          )}
        </div>
      </div>

      <div style={styles.contentContainerScrollable} ref={scrollRef}>
        {messagesLoading || userLoading ? (
          <p>Loading messages...</p>
        ) : (
          <>
            {/* Render permanent/saved transcripts */}
            {allTranscript.map((line, index) => (
              <div key={`saved-${index}`} style={styles.card}>
                <div style={styles.cardHeader}>
                  <div style={styles.messageHeader}>
                    <div
                      style={{
                        ...styles.tag,
                        backgroundColor: line.speaker_uid === user?.uid 
                          ? '#5a43f3' 
                          : line.speaker_uid === roomInfo?.created_by 
                            ? '#e74c3c' // Host color (red)
                            : '#f0ad4e', // Regular participant color
                      }}>
                      <span style={styles.tagText}>
                        {line.speaker_name}
                        {line.speaker_uid === roomInfo?.created_by && ' 👑'}
                      </span>
                    </div>
                    <span style={styles.timestamp}>
                      {new Date(line.created_at).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                </div>
                <p style={styles.messageText}>{line.text}</p>
              </div>
            ))}
            
            {/* Render live transcription (visible to all users) */}
            {liveTranscript && liveTranscriptSpeaker && (
              <div style={{...styles.card, ...styles.liveTranscriptCard}}>
                <div style={styles.cardHeader}>
                  <div style={styles.liveTranscriptHeader}>
                    <div
                      style={{
                        ...styles.tag,
                        backgroundColor: liveTranscriptSpeaker.uid === user?.uid 
                          ? '#5a43f3' 
                          : liveTranscriptSpeaker.uid === roomInfo?.created_by 
                            ? '#e74c3c' // Host color (red)
                            : '#f0ad4e', // Regular participant color
                      }}>
                      <span style={styles.tagText}>
                        {liveTranscriptSpeaker.name}
                        {liveTranscriptSpeaker.uid === roomInfo?.created_by && ' 👑'}
                      </span>
                    </div>
                    <div style={styles.liveIndicator}>
                      <span style={styles.recordingDot}>●</span>
                      <span style={styles.liveText}>Speaking...</span>
                    </div>
                  </div>
                </div>
                <p style={styles.liveTranscriptText}>{liveTranscript}</p>
              </div>
            )}
          </>
        )}
      </div>

      <div style={styles.controlsContainer}>
        <p style={styles.statusText}>{status}</p>

        <button 
          onClick={toggleRecording} 
          style={{
            ...styles.micButtonContainer,
            opacity: (currentSpeaker && currentSpeaker !== user?.uid) ? 0.3 : 1,
            backgroundColor: isRecording ? '#ff4757' : '#5a43f3'
          }}
          disabled={!!(currentSpeaker && currentSpeaker !== user?.uid)}
        >
          <img src={MicButton} alt="Mic" style={styles.micButton} />
        </button>
        
        {currentSpeaker && currentSpeaker !== user?.uid && (
          <p style={styles.disabledText}>Someone else is speaking</p>
        )}
      </div>

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
    flexDirection: 'column',
    marginBottom: 0,
    padding: '20px 20px 10px 20px',
    background: '#fff',
    zIndex: 10,
    borderBottom: '1px solid #eee',
  },
  headerText: {
    margin: 0,
    fontSize: 20,
    fontWeight: 600,
    marginBottom: 8,
  },
  roomInfo: {
    display: 'flex',
    gap: 16,
    alignItems: 'center',
    fontSize: 14,
    color: '#666',
  },
  participantCount: {
    display: 'flex',
    alignItems: 'center',
    gap: 4,
  },
  speakerIndicator: {
    display: 'flex',
    alignItems: 'center',
    gap: 4,
    color: '#5a43f3',
    fontWeight: 500,
  },
  hostIndicator: {
    display: 'flex',
    alignItems: 'center',
    gap: 4,
    color: '#e74c3c',
    fontWeight: 600,
    fontSize: 14,
  },
  contentContainerScrollable: {
    display: 'flex',
    flexDirection: 'column',
    gap: 15,
    flex: 1,
    minHeight: 0,
    overflowY: 'auto',
    padding: '10px 16px 160px 16px',
  },
  card: {
    padding: 18,
    borderRadius: 20,
    backgroundColor: '#fff',
    boxShadow: '0 2px 16px rgba(0, 0, 0, 0.06)',
    border: '1px solid #f5f5f5',
    marginBottom: 4,
  },
  cardHeader: {
    marginBottom: 8,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  tag: {
    borderRadius: 25,
    padding: '8px 16px',
    display: 'inline-block',
    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.12)',
    fontWeight: 600,
  },
  tagText: {
    color: '#fff',
    fontWeight: 700,
    fontSize: 13,
    letterSpacing: '0.2px',
  },
  liveTranscriptCard: {
    border: '2px solid #667eea',
    backgroundColor: '#f8faff',
    boxShadow: '0 4px 20px rgba(102, 126, 234, 0.2)',
    borderRadius: 20,
  },
  liveTranscriptHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  liveIndicator: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  recordingDot: {
    color: '#ff4757',
    fontSize: 16,
    fontWeight: 'bold',
  },
  liveText: {
    fontSize: 12,
    color: '#667eea',
    fontWeight: 600,
    fontStyle: 'italic',
  },
  liveTranscriptText: {
    margin: '12px 0 0 0',
    fontSize: 15,
    lineHeight: 1.5,
    color: '#2c3e50',
    fontWeight: 500,
    backgroundColor: '#ffffff',
    padding: '12px',
    borderRadius: 12,
    border: '1px solid #e8ecff',
  },
  messageHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  timestamp: {
    fontSize: 11,
    color: '#95a5a6',
    fontWeight: 500,
  },
  messageText: {
    margin: '8px 0 0 0',
    fontSize: 14,
    lineHeight: 1.4,
    color: '#2c3e50',
  },
  controlsContainer: {
    position: 'fixed',
    left: 0,
    right: 0,
    bottom: 0,
    background: '#fff',
    padding: '16px',
    borderTop: '1px solid #eee',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 12,
  },
  statusText: {
    textAlign: 'center',
    margin: 0,
    fontSize: 14,
    color: '#666',
  },
  micButtonContainer: {
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
    transition: 'all 0.2s',
  },
  micButton: {
    width: 40,
    height: 40,
  },
  disabledText: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    margin: 0,
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