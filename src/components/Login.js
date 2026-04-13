import { useState } from 'react';
import { login } from '../services/api';

const getAccessToken = (data) =>
  data?.accessToken ?? data?.data?.accessToken ?? null;

const getUsername = (data) => data?.username ?? data?.data?.username ?? '';

const getRoles = (data) => {
  const roles = data?.roles ?? data?.data?.roles ?? [];
  return Array.isArray(roles) ? roles : [];
};

function Login({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await login({ email, password });
      const responseData = response.data;
      const accessToken = getAccessToken(responseData);
      const username = getUsername(responseData);
      const roles = getRoles(responseData);

      if (!accessToken) {
        throw new Error('Missing access token');
      }

      localStorage.setItem('token', accessToken);
      localStorage.setItem('username', username);
      localStorage.setItem('roles', JSON.stringify(roles));

      onLogin({
        token: accessToken,
        username,
        roles,
      });
    } catch (requestError) {
      setError('Invalid credentials');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="chat-card login-card">
      <header className="chat-header">
        <p className="chat-eyebrow">AI Chat Application</p>
        <h1>Sign in</h1>
        <p className="chat-subtitle">
          Use your account to access the Knowledge Copilot frontend.
        </p>
      </header>

      <form className="login-form" onSubmit={handleSubmit}>
        <label className="form-field">
          <span>Email</span>
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@example.com"
            required
          />
        </label>

        <label className="form-field">
          <span>Password</span>
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Enter your password"
            required
          />
        </label>

        {error ? <p className="form-error">{error}</p> : null}

        <button className="primary-button" type="submit" disabled={isLoading}>
          {isLoading ? 'Logging in...' : 'Login'}
        </button>
      </form>
    </section>
  );
}

export default Login;
