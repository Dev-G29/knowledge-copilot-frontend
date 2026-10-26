import { useEffect, useState } from 'react';
import { Outlet } from 'react-router';
import { AnimatePresence, motion } from 'motion/react';
import { Menu as MenuIcon, PanelLeft, SquarePen } from 'lucide-react';
import { ConversationsProvider } from '../../context/ConversationsContext';
import { cn } from '../../lib/cn';
import Logo from '../brand/Logo';
import Button from '../ui/Button';
import Sidebar from './Sidebar';

const COLLAPSE_KEY = 'kc-sidebar-collapsed';

function readCollapsed() {
  try {
    return localStorage.getItem(COLLAPSE_KEY) === '1';
  } catch {
    return false;
  }
}

export default function AppShell() {
  const [collapsed, setCollapsed] = useState(readCollapsed);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(COLLAPSE_KEY, collapsed ? '1' : '0');
    } catch {
      /* ignore */
    }
  }, [collapsed]);

  useEffect(() => {
    if (!mobileOpen) return;
    const onKey = (event) => event.key === 'Escape' && setMobileOpen(false);
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [mobileOpen]);

  return (
    <ConversationsProvider>
      <div className="flex h-dvh overflow-hidden bg-bg">
        {/* Desktop sidebar */}
        <aside
          className={cn(
            'hidden shrink-0 border-r border-border bg-bg-subtle/60 transition-[width,opacity] duration-200 md:block',
            collapsed ? 'w-0 overflow-hidden opacity-0' : 'w-72 opacity-100',
          )}
          aria-hidden={collapsed}
        >
          <div className="h-full w-72">
            <Sidebar onCollapse={() => setCollapsed(true)} />
          </div>
        </aside>

        {/* Mobile drawer */}
        <AnimatePresence>
          {mobileOpen ? (
            <>
              <motion.div
                className="fixed inset-0 z-40 bg-slate-950/50 backdrop-blur-[2px] md:hidden"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setMobileOpen(false)}
              />
              <motion.aside
                className="fixed inset-y-0 left-0 z-50 w-[85%] max-w-80 border-r border-border bg-bg shadow-lifted md:hidden"
                initial={{ x: '-100%' }}
                animate={{ x: 0 }}
                exit={{ x: '-100%' }}
                transition={{ type: 'spring', damping: 30, stiffness: 320 }}
              >
                <Sidebar onNavigate={() => setMobileOpen(false)} />
              </motion.aside>
            </>
          ) : null}
        </AnimatePresence>

        <div className="flex min-w-0 flex-1 flex-col">
          {/* Mobile top bar */}
          <header className="flex h-14 shrink-0 items-center justify-between border-b border-border px-2 md:hidden">
            <Button variant="ghost" size="icon" onClick={() => setMobileOpen(true)} aria-label="Open sidebar">
              <MenuIcon className="size-5" />
            </Button>
            <Logo to="/chat" />
            <Button variant="ghost" size="icon" to="/chat" aria-label="New chat">
              <SquarePen className="size-[18px]" />
            </Button>
          </header>

          {collapsed ? (
            <div className="absolute left-3 top-3 z-30 hidden md:block">
              <Button variant="secondary" size="icon" onClick={() => setCollapsed(false)} aria-label="Show sidebar" title="Show sidebar">
                <PanelLeft className="size-[18px]" />
              </Button>
            </div>
          ) : null}

          <main className="relative min-h-0 flex-1">
            <Outlet />
          </main>
        </div>
      </div>
    </ConversationsProvider>
  );
}
