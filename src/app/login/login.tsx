'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './login.module.css'; // Ensure you have styles defined in your CSS module

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Hardcoded credentials
  const validCredentials = {
    admin: { username: 'admin', password: 'admin' },
    user: { username: 'user', password: 'user' },
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setLoading(true);

    // Check hardcoded credentials
    if (username === validCredentials.admin.username && password === validCredentials.admin.password) {
      // Redirect admin to the admin page
      router.push('/admin'); 
    } else if (username === validCredentials.user.username && password === validCredentials.user.password) {
      // Redirect user to questionnaires page
      router.push('/questionnaires'); 
    } else {
      setError('Invalid username or password');
    }

    // Debugging information
    console.log('Username:', username);
    console.log('Password:', password);
    setLoading(false);
  };

  return (
    <div className={styles.container}>
      <div className={styles.loginBox}>
        <h2 className={styles.loginHeader}>Login</h2>
        <form onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label htmlFor="username" className={styles.label}>Username</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className={styles.input}
              required
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="password" className={styles.label}>Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={styles.input}
              required
            />
          </div>
          {error && <p className={styles.error}>{error}</p>}
          <div className={styles.buttonGroup}>
            <button type="submit" className={styles.loginButton} disabled={loading}>
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
