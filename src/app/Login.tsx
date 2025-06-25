import React, { useState } from 'react';
import { IoChevronBack } from 'react-icons/io5';
import type { IconBaseProps } from 'react-icons';
import { useNavigate } from 'react-router-dom';
import { login } from '../service/fetchService';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const BackIcon = IoChevronBack as React.ComponentType<IconBaseProps>;
  const navigate = useNavigate();

  const handleLogin = async () => {
    if (!canLogin) {
      alert('Please enter both email and password.');
      return;
    }

    try {
      const [response, data] = await login(email, password);

      if (response.ok) {
        alert('Successfully logged in');
        navigate('/');
      } else {
        alert(`Login failed: ${data.detail || 'Invalid credentials'}`);
      }
    } catch (error) {
      console.error('Login error:', error);
      alert('An error occurred during login. Please try again.');
    }
  };

  const canLogin = email.trim() !== '' && password.trim() !== '';

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.headerContainer}>
        <button style={styles.backButton} onClick={() => navigate(-1)}>
          <BackIcon size={24} color="#090a0a" />
        </button>
        <span style={styles.headerText}>Login</span>
      </div>

      {/* Main Form */}
      <div style={styles.formContainer}>
        {/* Email Row */}
        <div style={styles.inputRow}>
          <div style={styles.inputCol}>
            <label style={styles.inputLabel}>ID</label>
            <div style={styles.inputButtonRow}>
              <input
                type="email"
                placeholder="Please type KAIST e-mail"
                value={email}
                onChange={e => setEmail(e.target.value)}
                style={styles.input}
              />
            </div>
          </div>
        </div>
        {/* Password Row */}
        <div style={styles.inputRow}>
          <div style={styles.inputCol}>
            <label style={styles.inputLabel}>Password</label>
            <div style={styles.inputButtonRow}>
              <input
                type="password"
                placeholder="Please type your password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                style={styles.input}
              />
            </div>
          </div>
        </div>
        {/* Forgot password? */}
        <div
          style={{
            width: '100%',
            display: 'flex',
            justifyContent: 'center',
            padding: '0 64px',
          }}
        >
          <div style={styles.forgotLink} onClick={() => {}}>
            Forgot password?
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div style={styles.bottomBar}>
        <div
          style={{
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
            alignItems: 'center',
          }}
        >
          <div style={styles.forgotLink} onClick={() => {}}>
            Forgot ID?
          </div>
          <button
            style={{
              ...styles.nextButton,
              background: '#f4f5f6',
              color: '#3680f7',
              fontWeight: 700,
              marginBottom: 0,
            }}
            onClick={() => navigate('/signup')}
          >
            SignUp
          </button>
          <button
            style={{
              ...styles.nextButton,
              opacity: canLogin ? 1 : 0.4,
              cursor: canLogin ? 'pointer' : 'not-allowed',
            }}
            disabled={!canLogin}
            onClick={handleLogin}
          >
            Login
          </button>
        </div>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    minHeight: '100vh',
    background: '#fff',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    width: '100%',
    boxSizing: 'border-box',
  },
  headerContainer: {
    width: '100%',
    maxWidth: 420,
    margin: '0 auto',
    padding: '32px 20px 0 20px',
    display: 'flex',
    alignItems: 'center',
    gap: 19,
    boxSizing: 'border-box',
  },
  backButton: {
    background: 'none',
    border: 'none',
    padding: 0,
    marginRight: 8,
    cursor: 'pointer',
    width: 36,
    height: 36,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: {
    fontSize: 20,
    fontWeight: 600,
    color: '#1c1c1c',
    fontFamily: 'Pretendard, sans-serif',
    lineHeight: '18px',
    flex: 1,
  },
  formContainer: {
    width: '100%',
    maxWidth: 420,
    margin: '0 auto',
    padding: '32px 20px 0 20px',
    display: 'flex',
    flexDirection: 'column',
    gap: 24,
    boxSizing: 'border-box',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 600,
    color: '#1c1c1c',
    fontFamily: 'Pretendard, sans-serif',
    marginBottom: 8,
    alignSelf: 'flex-start',
  },
  inputRow: {
    display: 'flex',
    gap: 8,
    alignItems: 'flex-end',
    width: '100%',
    maxWidth: 420,
    boxSizing: 'border-box',
  },
  inputCol: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
  },
  inputButtonRow: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
    width: '100%',
  },
  input: {
    width: '100%',
    height: 40,
    border: '1.5px solid #d8dce0',
    borderRadius: 8,
    padding: '0 20px',
    fontSize: 14,
    fontWeight: 600,
    color: '#223047',
    background: '#fff',
    outline: 'none',
    fontFamily: 'Pretendard, sans-serif',
    boxSizing: 'border-box',
  },
  getCodeButton: {
    height: 40,
    minWidth: 100,
    background: '#3680f7',
    border: 'none',
    borderRadius: 8,
    color: '#fff',
    fontWeight: 600,
    fontSize: 14,
    fontFamily: 'Pretendard, sans-serif',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '0 12px',
    marginLeft: 0,
  },
  forgotLink: {
    color: '#2f80ed',
    fontSize: 14,
    fontWeight: 500,
    fontFamily: 'Pretendard, sans-serif',
    textAlign: 'center',
    cursor: 'pointer',
    margin: '8px 0',
  },
  bottomBar: {
    width: '100%',
    maxWidth: 420,
    padding: '0 20px 32px 20px',
    position: 'fixed',
    left: '50%',
    transform: 'translateX(-50%)',
    bottom: 0,
    background: 'rgba(255,255,255,0.97)',
    boxSizing: 'border-box',
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
    zIndex: 100,
    alignItems: 'center',
  },
  nextButton: {
    width: '100%',
    maxWidth: 420,
    height: 40,
    background: '#3680f7',
    border: 'none',
    borderRadius: 8,
    color: '#fff',
    fontWeight: 700,
    fontSize: 14,
    fontFamily: 'Pretendard, sans-serif',
  },
};

export default Login;