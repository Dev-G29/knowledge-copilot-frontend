import { useState } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import About from './components/About';
import ChatContainer from './components/ChatContainer';
import Contact from './components/Contact';
import HowToUse from './components/HowToUse';
import Login from './components/Login';
import Navbar from './components/Navbar';
import Register from './components/Register';
import Upload from './components/Upload';
import './styles/App.css';

const getStoredRoles = () => {
  const storedRoles = localStorage.getItem('roles');

  if (!storedRoles) {
    return [];
  }

  try {
    const parsedRoles = JSON.parse(storedRoles);
    if (Array.isArray(parsedRoles)) {
      return parsedRoles;
    }
    if (typeof parsedRoles === 'string') {
      return [parsedRoles];
    }
  } catch (error) {
    if (typeof storedRoles === 'string') {
      return [storedRoles];
    }
  }

  return [];
};

function Home({ token, roles }) {
  const isAdmin = roles.includes('ADMIN');

  return (
    <div className="page-stack">
      <section className="hero-panel">
        <div>
          <p className="chat-eyebrow">Copilot Workspace</p>
          <h1 className="hero-title">Ask better questions. Get grounded answers.</h1>
          <p className="hero-copy">
            Knowledge Copilot combines secure document upload with conversational
            search so your team can explore trusted information quickly.
          </p>
        </div>
      </section>

      {isAdmin ? <Upload token={token} roles={roles} /> : null}
      <ChatContainer token={token} />
    </div>
  );
}

function AuthenticatedApp({ token, roles, username, onLogout }) {
  return (
    <div className="app-shell authenticated-shell">
      <Navbar onLogout={onLogout} username={username} />
      <div className="app-body">
        <Routes>
          <Route path="/" element={<Home token={token} roles={roles} />} />
          <Route path="/about" element={<About />} />
          <Route path="/how-to-use" element={<HowToUse />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </div>
  );
}

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [roles, setRoles] = useState(getStoredRoles);
  const [username, setUsername] = useState(localStorage.getItem('username') || '');

  const handleLogin = ({ token: nextToken, username: nextUsername, roles: nextRoles }) => {
    setToken(nextToken);
    setUsername(nextUsername);
    setRoles(nextRoles);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('roles');
    localStorage.removeItem('role');
    localStorage.removeItem('username');
    setToken(null);
    setRoles([]);
    setUsername('');
  };

  return (
    <BrowserRouter>
      {token ? (
        <AuthenticatedApp
          token={token}
          roles={roles}
          username={username}
          onLogout={handleLogout}
        />
      ) : (
        <main className="app-shell">
          <Routes>
            <Route path="/login" element={<Login onLogin={handleLogin} />} />
            <Route path="/register" element={<Register />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </main>
      )}
    </BrowserRouter>
  );
}

export default App;
