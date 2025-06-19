import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { IoChevronBack, IoChevronDown } from 'react-icons/io5';
import type { IconBaseProps } from 'react-icons';
import type { ComponentType } from 'react';

const languages = [
  { id: '1', flag: '🇰🇷', label: ' korean' },
  { id: '2', flag: '🇺🇸', label: ' english' },
];

const CreateRoom = () => {
  const [roomName, setRoomName] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('Select');
  const [showLanguageOptions, setShowLanguageOptions] = useState(false);
  const [createRoomBtnName, setCreateRoomBtnName] = useState('Create');
  const navigate = useNavigate();

  const BackIcon = IoChevronBack as ComponentType<IconBaseProps>;
  const DownIcon = IoChevronDown as ComponentType<IconBaseProps>;
  const token = localStorage.getItem("access_token");

  const toggleLanguageDropdown = () => {
    setShowLanguageOptions(!showLanguageOptions);
  };

  const handleLanguageSelect = (language: string) => {
    setSelectedLanguage(language);
    setShowLanguageOptions(false);
  };

  const handleCreateRoom = async () => {
    setCreateRoomBtnName('Creating...');

    if (!roomName.trim()) {
      alert('Classroom name is required.');
      setCreateRoomBtnName('Create');
      return;
    }

    try {
      const res = await fetch("https://clang-a3xo.onrender.com/0.1.0/classroom/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`, // 🔐 Send token
        },
        body: JSON.stringify({
          name: roomName,
          language: selectedLanguage.trim() || "Unknown", // match `language` field
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to create classroom");
      }

      const data = await res.json();
      alert('Classroom created successfully!');
      localStorage.setItem("classroom_uid", data.uid);  // ← Store classroom_uid

      navigate(`/transcription/${data.uid}`);
    } catch (error) {
      console.error(error);
      alert("Error creating classroom");
    } finally {
      setCreateRoomBtnName('Create');
    }
  };



  return (
    <div style={styles.container}>
      <div style={styles.headerContainer}>
        <button 
          type="button"
          onClick={() => navigate(-1)} 
          style={{ background: 'none', border: 'none' }}
        >
          <BackIcon size={24} color="#000" />
        </button>
        <h2 style={styles.headerText}>Create Room</h2>
      </div>

      <div style={styles.languageContainer}>
        <label htmlFor="language-select" style={styles.label}>Original language</label>
        <button 
          type="button"
          id="language-select"
          style={styles.dropdown} 
          onClick={toggleLanguageDropdown}
        >
          <div style={styles.dropdownContent}>
            <span style={styles.dropdownText}>{selectedLanguage}</span>
            <DownIcon size={18} color="#a7acb6" />
          </div>
        </button>
        {showLanguageOptions && (
          <div style={styles.dropdownOptions}>
            {languages.map(item => (
              <button
                key={item.id}
                type="button"
                style={styles.dropdownOption}
                onClick={() => handleLanguageSelect(`${item.label}`)}
              >
                <span style={styles.dropdownOptionText}>
                  {item.flag} {item.label}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      <div style={styles.inputContainer}>
        <label htmlFor="room-name" style={styles.label}>
          Room Name <span style={styles.infoIcon}>ⓘ</span>
        </label>
        <input
          id="room-name"
          style={styles.input}
          placeholder="Please type room name"
          maxLength={30}
          value={roomName}
          onChange={e => setRoomName(e.target.value)}
        />
        <div style={styles.charCount}>{roomName.length}/30</div>
      </div>

      <button
        type="button"
        style={{
          ...styles.button,
          ...(roomName.length === 0 || createRoomBtnName === 'Creating...'
            ? styles.disabledButton
            : {}),
        }}
        disabled={roomName.length === 0 || createRoomBtnName === 'Creating...'}
        onClick={handleCreateRoom}
      >
        <span style={styles.buttonText}>{createRoomBtnName}</span>
      </button>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 20,
    minHeight: '100vh',
  },
  headerContainer: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    height: 56,
    marginBottom: 20,
    gap: 10,
  },
  headerText: {
    fontSize: 20,
    fontWeight: 600,
    color: '#000',
    margin: 0,
  },
  languageContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: 600,
    marginBottom: 10,
    color: '#223047',
    display: 'block',
  },
  dropdown: {
    height: 40,
    padding: '0 12px',
    borderRadius: 8,
    border: '1px solid #d8dce0',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    cursor: 'pointer',
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#fff',
    boxSizing: 'border-box',
  },
  dropdownContent: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  dropdownText: {
    color: '#a7acb6',
    fontSize: 14,
  },
  dropdownOptions: {
    backgroundColor: '#fff',
    borderRadius: 8,
    border: '1px solid #d8dce0',
    marginTop: 5,
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    width: '100%',
    maxWidth: 400,
    display: 'flex',
    flexDirection: 'column',
    padding: 0,
  },
  dropdownOption: {
    padding: '10px 12px',
    height: 40,
    textAlign: 'left',
    backgroundColor: '#fff',
    border: 'none',
    borderTop: '1px solid #eee',
    width: '100%',
    boxSizing: 'border-box',
    cursor: 'pointer',
  },
  dropdownOptionText: {
    fontSize: 14,
    color: '#223047',
  },
  inputContainer: {
    marginBottom: 20,
  },
  input: {
    border: '1px solid #d8dce0',
    borderRadius: 8,
    padding: '0 10px',
    height: 40,
    width: '100%',
    marginBottom: 10,
    boxSizing: 'border-box',
  },
  charCount: {
    fontSize: 12,
    color: '#a7acb6',
    textAlign: 'right',
  },
  button: {
    backgroundColor: '#3680F7',
    borderRadius: 10,
    padding: '14px 0',
    width: '100%',
    textAlign: 'center',
    marginBottom: 10,
    cursor: 'pointer',
    border: 'none',
  },
  disabledButton: {
    backgroundColor: '#a7acb6',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  infoIcon: {
    fontSize: 14,
    color: '#a7acb6',
  },
};

export default CreateRoom;
