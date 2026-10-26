import { useEffect, useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router';
import { Menu as MenuIcon, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { cn } from '../../lib/cn';
import Logo from '../brand/Logo';
import Button from '../ui/Button';
import ThemeToggle from '../ui/ThemeToggle';

const links = [
  { to: '/#features', label: 'Features' },
  { to: '/#how-it-works', label: 'How it works' },
  { to: '/about', label: 'About' },
  { to: '/contact', label: 'Contact' },
];

export default function PublicLayout() {
  const { isAuthenticated } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Scroll to in-page anchors (/#features) or back to the top on navigation.
  useEffect(() => {
    if (location.hash) {
      document.getElementById(location.hash.slice(1))?.scrollIntoView({ behavior: 'smooth' });
    } else {
      window.scrollTo({ top: 0 });
    }
  }, [location.pathname, location.hash]);

  return (
    <div className="flex min-h-dvh flex-col">
      <header
        className={cn(
          'sticky top-0 z-40 transition-[background-color,border-color,backdrop-filter] duration-200',
          scrolled || mobileOpen ? 'border-b border-border bg-bg/80 backdrop-blur-xl' : 'border-b border-transparent',
        )}
      >
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
          <Logo />
          <nav className="hidden items-center gap-1 md:flex" aria-label="Main">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className="rounded-lg px-3 py-2 text-sm font-medium text-fg-muted transition-colors hover:text-fg"
              >
                {link.label}
              </NavLink>
            ))}
          </nav>
          <div className="flex items-center gap-1.5">
            <ThemeToggle />
            {isAuthenticated ? (
              <Button to="/chat" size="sm" className="hidden sm:inline-flex">
                Open app
              </Button>
            ) : (
              <>
                <Button to="/login" variant="ghost" size="sm" className="hidden sm:inline-flex">
                  Sign in
                </Button>
                <Button to="/register" size="sm" className="hidden sm:inline-flex">
                  Get started
                </Button>
              </>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileOpen((open) => !open)}
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? <X className="size-5" /> : <MenuIcon className="size-5" />}
            </Button>
          </div>
        </div>
        {mobileOpen ? (
          <nav
            className="border-t border-border px-4 pb-4 pt-2 md:hidden"
            aria-label="Mobile"
            onClick={(event) => event.target.closest('a') && setMobileOpen(false)}
          >
            {links.map((link) => (
              <NavLink key={link.to} to={link.to} className="block rounded-lg px-3 py-2.5 text-[15px] font-medium text-fg-muted hover:bg-bg-subtle hover:text-fg">
                {link.label}
              </NavLink>
            ))}
            <div className="mt-3 grid grid-cols-2 gap-2">
              {isAuthenticated ? (
                <Button to="/chat" className="col-span-2">
                  Open app
                </Button>
              ) : (
                <>
                  <Button to="/login" variant="secondary">
                    Sign in
                  </Button>
                  <Button to="/register">Get started</Button>
                </>
              )}
            </div>
          </nav>
        ) : null}
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 py-8 text-sm text-fg-subtle sm:flex-row sm:px-6">
          <div className="flex items-center gap-2.5">
            <Logo compact />
            <span>© {new Date().getFullYear()} Knowledge Copilot · Built by Dev Gangavkar</span>
          </div>
          <div className="flex gap-5">
            <NavLink to="/about" className="hover:text-fg">
              About
            </NavLink>
            <NavLink to="/contact" className="hover:text-fg">
              Contact
            </NavLink>
            <a href="https://github.com/Dev-G29" target="_blank" rel="noreferrer" className="hover:text-fg">
              GitHub
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
