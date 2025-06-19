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
  const [language, setLanguage] = useState<'english' | 'korean'>('english');

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

  const handleLogin = async () => {
    if (!email.trim()) return alert('Error', 'Email is required.');
    if (!validatePassword(password)) {
      return alert('Invalid Password', 'Password must be 6–15 characters long and contain letters and numbers.');
    }

    try {
      const res = await fetch("https://clang-a3xo.onrender.com/0.1.0/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email,
          password: password,
          language: language,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        alert("Success", "Login successful!");
        localStorage.setItem("access_token", data.access_token); // Store token
        localStorage.setItem("user_uid", data.user.uid); // Store username
        window.location.href = "/"; // Navigate
      } else {
        alert("Login Failed", data.detail || "Unknown error");
      }
    } catch (error) {
      alert("Network Error", "Could not connect to the server.");
    }
  };

  const handleSignup = async () => {
    if (!username.trim()) return alert('Error', 'Full name is required.');
    if (!email.trim()) return alert('Error', 'Email is required.');
    if (!isVerified) return alert('Error', 'Please verify your email first.');
    if (!validatePassword(password)) {
      return alert('Invalid Password', 'Password must be 6–15 characters long and contain letters and numbers.');
    }
    if (password !== confirmPassword) return alert('Error', 'Passwords do not match.');

    try {
      // Log each data field before sending
      console.log("Signup Data:", {
      email: email,
      username: username,
      password: password,
      language: language,
      });

      const res = await fetch("https://clang-a3xo.onrender.com/0.1.0/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: email,
        username: username,
        password: password,
        language: language,
      }),
      });

      if (res.status === 201) {
        alert("Success", "Account created successfully!");
        handleLogin(); // Or redirect
      } else {
        const data = await res.json();
        alert("Signup Failed", data.detail || "Unknown error");
      }
    } catch (error) {
      alert("Network Error", "Could not connect to the server.");
    }
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
      <select
        style={{ ...styles.input, marginBottom: 15 }}
        value={language}
        onChange={e => setLanguage(e.target.value as 'english' | 'korean')}
      >
        <option value="english">English</option>
        <option value="korean">Korean</option>
      </select>
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