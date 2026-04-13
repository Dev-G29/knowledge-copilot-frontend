import { useState } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import About from './components/About';
import ChatContainer from './components/ChatContainer';
import Contact from './components/Contact';
import HowToUse from './components/HowToUse';
import Login from './components/Login';
import Navbar from './components/Navbar';
import Upload from './components/Upload';
import './styles/App.css';

const getStoredRoles = () => {
  const storedRoles = localStorage.getItem('roles');

  if (!storedRoles) {
    return [];
  }

  try {
    const parsedRoles = JSON.parse(storedRoles);
    return Array.isArray(parsedRoles) ? parsedRoles : [];
  } catch (error) {
    return [];
  }
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
    <BrowserRouter>
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
    </BrowserRouter>
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
    localStorage.removeItem('roles');
    localStorage.removeItem('username');
    setToken(null);
    setRoles([]);
    setUsername('');
  };

  if (!token) {
    return (
      <main className="app-shell">
        <Login onLogin={handleLogin} />
      </main>
    );
  }

  return (
    <AuthenticatedApp
      token={token}
      roles={roles}
      username={username}
      onLogout={handleLogout}
    />
  );
}

export default App;
