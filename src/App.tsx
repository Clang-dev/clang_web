import React from 'react';
// import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import {UserProvider} from './hooks/UserContext';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './app/Home';  
import Signup from './app/Signup';
import NoRoom from './app/NoRoom';
import CreateRoom from './app/CreateRoom';
import JoinRoom from './app/JoinRoom';
import AudioTranscription from './app/AudioTranscription';
import Login from './app/Login';

function App() {
  return (
    <Router>
      <UserProvider>
        <Routes>
          {/* Public route that everyone can access */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          {/* Wrap protected routes in a Route element with ProtectedRoute */}
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<Home />} />
            <Route path="/no-room" element={<NoRoom />} />
            <Route path="/create-room" element={<CreateRoom />} />
            <Route path="/join-room" element={<JoinRoom />} />
            <Route path="/transcription/:id" element={<AudioTranscription />} />
          </Route>
          
          {/* Redirect any other path to the login page */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </UserProvider>
    </Router>
  );
}

export default App;