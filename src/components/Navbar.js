import { useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import logo from "../images/logo.png";
function Navbar({ onLogout, username }) {
  const navigate = useNavigate();
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    let lastScrollY = window.scrollY;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const isScrollingDown = currentScrollY > lastScrollY;

      if (currentScrollY <= 20) {
        setVisible(true);
      } else if (isScrollingDown) {
        setVisible(false);
      } else {
        setVisible(true);
      }

      lastScrollY = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={`navbar ${visible ? '' : 'navbar-hidden'}`}>
      <div className="navbar-brand">
      <div className="brand-left">
        <img src={logo} alt="Knowledge Copilot" className="logo" />
        
      </div>
    </div>

      <nav className="navbar-links" aria-label="Primary">
        <NavLink
          to="/"
          className={({ isActive }) =>
            isActive ? 'nav-link nav-link-active' : 'nav-link'
          }
        >
          Copilot
        </NavLink>
        <NavLink
          to="/about"
          className={({ isActive }) =>
            isActive ? 'nav-link nav-link-active' : 'nav-link'
          }
        >
          About
        </NavLink>
        <NavLink
          to="/how-to-use"
          className={({ isActive }) =>
            isActive ? 'nav-link nav-link-active' : 'nav-link'
          }
        >
          How to Use
        </NavLink>
      </nav>

      <div className="navbar-actions">
        <button
          type="button"
          className="contact-button"
          onClick={() => navigate('/contact')}
        >
          Contact Me
        </button>
        <button type="button" className="secondary-button" onClick={onLogout}>
          Logout
        </button>
      </div>
    </header>
  );
}

export default Navbar;
