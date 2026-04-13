import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { register } from '../services/api';

function Register() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    try {
      await register({ username, email, password });
      setSuccess('Registration successful! Redirecting to login...');
      setTimeout(() => navigate('/login'), 1300);
    } catch (requestError) {
      const responseMessage =
        requestError?.response?.data?.message ||
        requestError?.message ||
        'Registration failed. Please try again.';
      setError(responseMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="chat-card login-card">
      <header className="chat-header">
        <p className="chat-eyebrow">Create account</p>
        <h1>Register</h1>
        <p className="chat-subtitle">
          Create a new account to access Knowledge Copilot.
        </p>
      </header>

      <form className="login-form" onSubmit={handleSubmit}>
        <label className="form-field">
          <span>Username</span>
          <input
            type="text"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            placeholder="Your name"
            required
          />
        </label>

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
            placeholder="Enter a secure password"
            required
          />
        </label>

        {error ? <p className="form-error">{error}</p> : null}
        {success ? <p className="form-success">{success}</p> : null}

        <button className="primary-button" type="submit" disabled={isLoading}>
          {isLoading ? 'Registering...' : 'Register'}
        </button>

        <div className="auth-switch">
          <p>Already have an account?</p>
          <Link className="secondary-button" to="/login">
            Login
          </Link>
        </div>
      </form>
    </section>
  );
}

export default Register;
