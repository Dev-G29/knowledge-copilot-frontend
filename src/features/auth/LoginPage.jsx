import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router';
import { CircleAlert } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getErrorMessage } from '../../lib/api';
import Button from '../../components/ui/Button';
import { Field } from '../../components/ui/Field';
import AuthLayout from './AuthLayout';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    document.title = 'Sign in · Knowledge Copilot';
  }, []);

  const onSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await login(form.email.trim(), form.password);
      navigate(location.state?.from || '/chat', { replace: true });
    } catch (requestError) {
      setError(
        requestError.response?.status === 401
          ? 'That email/username and password don’t match.'
          : getErrorMessage(requestError, 'Could not sign in. Please try again.'),
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to continue to your workspace."
      footer={
        <>
          New to Knowledge Copilot?{' '}
          <Link to="/register" className="font-medium text-primary hover:underline">
            Create an account
          </Link>
        </>
      }
    >
      <form onSubmit={onSubmit} className="space-y-4" noValidate>
        {error ? (
          <div role="alert" className="flex items-start gap-2 rounded-xl border border-danger/30 bg-danger-soft px-3.5 py-3 text-sm text-danger">
            <CircleAlert className="mt-0.5 size-4 shrink-0" />
            {error}
          </div>
        ) : null}
        <Field
          label="Email or username"
          name="email"
          autoComplete="username"
          placeholder="you@example.com"
          value={form.email}
          onChange={(event) => setForm({ ...form, email: event.target.value })}
          required
          autoFocus
        />
        <Field
          label="Password"
          name="password"
          type="password"
          autoComplete="current-password"
          placeholder="Your password"
          value={form.password}
          onChange={(event) => setForm({ ...form, password: event.target.value })}
          required
        />
        <Button type="submit" variant="brand" size="lg" className="w-full" loading={submitting} disabled={!form.email || !form.password}>
          Sign in
        </Button>
      </form>
    </AuthLayout>
  );
}
