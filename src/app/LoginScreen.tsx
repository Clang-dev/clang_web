import React, {useEffect, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {signUp, login, sendCode, verifyCode, me} from '../service/fetchService';
import {useUser} from '../hooks/UserContext';

const LoginScreen = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [code, setCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [disabled, setDisabled] = useState(false);
  const [verificationButtonText, setVerificationButtonText] = useState(
    'Send Verification Code',
  );
  const navigate = useNavigate();
  const {setUser} = useUser();

  const validatePassword = (password: string): boolean => {
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,15}$/;
    return passwordRegex.test(password);
  };

  useEffect(() => {
    setDisabled(false);
    setVerificationButtonText('Send Verification Code');
    setIsVerifying(false);
    setIsVerified(false);
    setCode('');
  }, [email]);

  const handleLogin = async () => {
    if (!email.trim()) {
      alert('Error: Email is required.');
      return;
    }
    if (!validatePassword(password)) {
      alert(
        'Invalid Password: Password must be 6-15 characters long and contain letters and numbers.',
      );
      return;
    }
    try {
      const [response, data] = await login(email, password);
      if (response.ok) {
        const meResponse = await me();
        if (meResponse && meResponse.ok) {
          const userData = await meResponse.json();
          setUser(userData); // Set user in context
          alert('Success: Login successful!');
          navigate('/home'); // Navigate to protected route
        }
      } else {
        alert(`Error: ${data.detail}`);
      }
    } catch (error) {
      alert('Network Error: Failed to connect to the server.');
    }
  };

  const handleSignup = async () => {
    if (!username.trim() || !email.trim() || !isVerified || !password) {
      alert('Error: All fields are required and email must be verified.');
      return;
    }
    if (password !== confirmPassword) {
      alert('Error: Passwords do not match.');
      return;
    }
    try {
      const response = await signUp(username, email, password);
      const data = await response.json();
      if (response.ok) {
        alert('Success: Account created successfully! Logging in...');
        await handleLogin(); // Automatically log in after signup
      } else {
        alert(`Error: ${JSON.stringify(data.detail)}`);
      }
    } catch (error) {
      alert('Network Error: Failed to connect to the server.');
    }
  };

  const sendVerificationCode = async () => {
    if (!email.endsWith('@kaist.ac.kr')) {
      alert('Invalid Email: Only KAIST emails are allowed.');
      return;
    }
    setDisabled(true);
    setVerificationButtonText('Code Sent!');
    try {
      const response = await sendCode(email);
      if (response.ok) {
        setIsVerifying(true);
      } else {
        const data = await response.json();
        alert(`Error: ${data.detail}`);
      }
    } catch (error) {
      alert('Network Error: Failed to connect to the server.');
    }
  };

  const verify = async () => {
    if (!code) {
      alert('Error: Enter the code');
      return;
    }
    try {
      const response = await verifyCode(email, code);
      if (response.ok) {
        setIsVerified(true);
        setIsVerifying(false);
        setVerificationButtonText('Verified!');
      } else {
        const data = await response.json();
        alert(`Error: ${data.detail}`);
      }
    } catch (error) {
      alert('Network Error: Failed to connect to the server.');
    }
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Sign Up</h1>
      <input
        style={styles.input}
        placeholder="Full name"
        value={username}
        onChange={e => setUsername(e.target.value)}
      />
      <input
        style={styles.input}
        placeholder="Email"
        type="email"
        value={email}
        onChange={e => setEmail(e.target.value)}
      />
      {!isVerifying ? (
        <button
          style={{
            ...styles.button,
            ...(disabled ? styles.disabledButton : styles.primaryButton),
          }}
          disabled={disabled}
          onClick={sendVerificationCode}>
          {verificationButtonText}
        </button>
      ) : (
        <>
          <input
            style={styles.input}
            placeholder="Verification Code"
            type="number"
            value={code}
            onChange={e => setCode(e.target.value)}
          />
          <button
            style={{...styles.button, ...styles.primaryButton}}
            onClick={verify}>
            Verify Code
          </button>
        </>
      )}
      <input
        style={styles.input}
        placeholder="Password"
        type="password"
        value={password}
        onChange={e => setPassword(e.target.value)}
      />
      <input
        style={styles.input}
        placeholder="Confirm Password"
        type="password"
        value={confirmPassword}
        onChange={e => setConfirmPassword(e.target.value)}
      />
      <button
        style={{...styles.button, ...styles.primaryButton}}
        onClick={handleSignup}>
        Sign Up
      </button>
    </div>
  );
};

const styles: {[key: string]: React.CSSProperties} = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: '20px',
    minHeight: '100vh',
    boxSizing: 'border-box',
  },
  title: {
    fontSize: '24px',
    fontWeight: 'bold',
    marginBottom: '20px',
    color: '#1c1c1c',
  },
  input: {
    width: '100%',
    maxWidth: '400px',
    padding: '12px 15px',
    border: '1px solid #ccc',
    borderRadius: '8px',
    backgroundColor: '#fff',
    marginBottom: '15px',
    fontSize: '16px',
    color: 'black',
    boxSizing: 'border-box',
  },
  button: {
    width: '100%',
    maxWidth: '400px',
    padding: '14px',
    borderRadius: '8px',
    textAlign: 'center',
    marginBottom: '12px',
    border: 'none',
    color: '#FFFFFF',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer',
    boxSizing: 'border-box',
  },
  primaryButton: {
    backgroundColor: '#3680F7',
  },
  disabledButton: {
    backgroundColor: '#A7ACB6',
    cursor: 'not-allowed',
  },
};

export default LoginScreen;