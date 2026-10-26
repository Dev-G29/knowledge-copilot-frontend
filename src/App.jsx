import { lazy, Suspense } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router';
import { Toaster } from 'sonner';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import PublicLayout from './components/layout/PublicLayout';
import { GuestOnly, RequireAuth } from './components/layout/RouteGuards';
import Spinner from './components/ui/Spinner';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import LandingPage from './pages/LandingPage';
import NotFoundPage from './pages/NotFoundPage';

// The signed-in app (markdown, syntax highlighting, chat) loads on demand so the
// landing page stays light.
const AppShell = lazy(() => import('./components/layout/AppShell'));
const ChatPage = lazy(() => import('./features/chat/ChatPage'));
const DocumentsPage = lazy(() => import('./features/documents/DocumentsPage'));
const LoginPage = lazy(() => import('./features/auth/LoginPage'));
const RegisterPage = lazy(() => import('./features/auth/RegisterPage'));

function PageFallback() {
  return (
    <div className="flex h-dvh items-center justify-center text-fg-subtle">
      <Spinner />
    </div>
  );
}

function ThemedToaster() {
  const { resolved } = useTheme();
  return <Toaster theme={resolved} position="top-center" richColors closeButton />;
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Suspense fallback={<PageFallback />}>
            <Routes>
            <Route element={<PublicLayout />}>
              <Route index element={<LandingPage />} />
              <Route path="about" element={<AboutPage />} />
              <Route path="contact" element={<ContactPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Route>

            <Route element={<GuestOnly />}>
              <Route path="login" element={<LoginPage />} />
              <Route path="register" element={<RegisterPage />} />
            </Route>

            <Route element={<RequireAuth />}>
              <Route element={<AppShell />}>
                <Route path="chat" element={<ChatPage />} />
                <Route path="chat/:conversationId" element={<ChatPage />} />
                <Route path="documents" element={<DocumentsPage />} />
              </Route>
            </Route>
            </Routes>
          </Suspense>
        </BrowserRouter>
        <ThemedToaster />
      </AuthProvider>
    </ThemeProvider>
  );
}
