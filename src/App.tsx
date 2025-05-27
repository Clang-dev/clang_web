import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './app/Home';
import LoginScreen from './app/LoginScreen';
import NoRoom from './app/NoRoom';
import CreateRoom from './app/CreateRoom';
import JoinRoom from './app/JoinRoom';
import AudioTranscription from './app/AudioTranscription';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<LoginScreen />} />
        <Route path="/no-room" element={<NoRoom />} />
        <Route path="/create-room" element={<CreateRoom />} />
        <Route path="/join-room" element={<JoinRoom />} />
        <Route path="/transcription/:id" element={<AudioTranscription />} />
      </Routes>
    </Router>
  );
}

export default App;