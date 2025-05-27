import React, { useState, useEffect } from 'react';

const LoginScreen: React.FC = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [code, setCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [disabled, setDisabled] = useState(false);
  const [verificationButtonText, setVerificationButtonText] = useState('Send Verification Code');

  const validatePassword = (password: string) => {
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

  const alert = (title: string, message: string) => {
    window.alert(`${title}\n${message}`);
  };

  const handleLogin = () => {
    if (!email.trim()) return alert('Error', 'Email is required.');
    if (!validatePassword(password)) {
      return alert('Invalid Password', 'Password must be 6–15 characters long and contain letters and numbers.');
    }
    alert('Success', 'Login successful!');
    window.location.href = '/home'; // Simulate navigation
  };

  const handleSignup = () => {
    if (!username.trim()) return alert('Error', 'Full name is required.');
    if (!email.trim()) return alert('Error', 'Email is required.');
    if (!isVerified) return alert('Error', 'Please verify your email first.');
    if (!validatePassword(password)) {
      return alert('Invalid Password', 'Password must be 6–15 characters long and contain letters and numbers.');
    }
    if (password !== confirmPassword) return alert('Error', 'Passwords do not match.');
    alert('Success', 'Account created successfully!');
    handleLogin();
  };

  const sendVerificationCode = () => {
    if (!email.endsWith('@kaist.ac.kr')) {
      return alert('Invalid Email', 'Only KAIST emails are allowed.');
    }
    setDisabled(true);
    setVerificationButtonText('Code Sent!');
    setIsVerifying(true);
  };

  const verify = () => {
    if (code.length > 0) {
      setIsVerified(true);
      setIsVerifying(false);
      setVerificationButtonText('Verified!');
    } else {
      alert('Error', 'Enter the code');
    }
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Sign Up</h1>

      <input
        style={styles.input}
        placeholder="Full name"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <input
        style={styles.input}
        placeholder="Email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      {!isVerifying ? (
        <button
          style={{
            ...styles.button,
            ...(disabled ? styles.disabledButton : styles.primaryButton),
          }}
          disabled={disabled}
          onClick={sendVerificationCode}
        >
          {verificationButtonText}
        </button>
      ) : (
        <>
          <input
            style={styles.input}
            placeholder="Verification Code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
          />
          <button style={{ ...styles.button, ...styles.primaryButton }} onClick={verify}>
            Verify Code
          </button>
        </>
      )}

      <input
        style={styles.input}
        placeholder="Password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <input
        style={styles.input}
        placeholder="Confirm Password"
        type="password"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
      />
      <button style={{ ...styles.button, ...styles.primaryButton }} onClick={handleSignup}>
        Sign Up
      </button>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#1c1c1c',
  },
input: {
  width: '100%',
  maxWidth: 400,
  padding: '12px 15px',
  border: '1px solid #ccc',
  borderRadius: 8,
  backgroundColor: '#fff',
  marginBottom: 15,
  fontSize: 16,
  color: 'black',
  boxSizing: 'border-box',
  lineHeight: '20px',
},
button: {
  width: '100%',
  maxWidth: 400,
  padding: '12px 15px',
  borderRadius: 8,
  textAlign: 'center',
  fontWeight: 'bold',
  fontSize: 16,
  marginBottom: 12,
  border: 'none',
  cursor: 'pointer',
  lineHeight: '20px',
  boxSizing: 'border-box',
},
  primaryButton: {
    backgroundColor: '#3680F7',
    color: '#FFFFFF',
  },
  disabledButton: {
    backgroundColor: '#A7ACB6',
    color: '#FFFFFF',
  },
};

export default LoginScreen;