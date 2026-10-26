import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { toast } from 'sonner';
import { CircleAlert } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getErrorMessage } from '../../lib/api';
import Button from '../../components/ui/Button';
import { Field } from '../../components/ui/Field';
import AuthLayout from './AuthLayout';

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Mirrors the backend's RegisterRequest validation so most mistakes are caught instantly.
function validate({ username, email, password }) {
  const errors = {};
  if (username.trim().length < 3) errors.username = 'Use at least 3 characters.';
  else if (username.trim().length > 100) errors.username = 'Use at most 100 characters.';
  if (!EMAIL.test(email.trim())) errors.email = 'Enter a valid email address.';
  if (password.length < 8) errors.password = 'Use at least 8 characters.';
  else if (password.length > 100) errors.password = 'Use at most 100 characters.';
  return errors;
}

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const [touched, setTouched] = useState({});
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    document.title = 'Create account · Knowledge Copilot';
  }, []);

  const errors = validate(form);
  const showError = (field) => (touched[field] ? errors[field] : undefined);
  const set = (field) => (event) => setForm({ ...form, [field]: event.target.value });
  const blur = (field) => () => setTouched((t) => ({ ...t, [field]: true }));

  const onSubmit = async (event) => {
    event.preventDefault();
    setTouched({ username: true, email: true, password: true });
    if (Object.keys(errors).length > 0) return;
    setError('');
    setSubmitting(true);
    try {
      const user = await register({ username: form.username.trim(), email: form.email.trim(), password: form.password });
      toast.success(`Welcome, ${user.username}!`);
      navigate('/chat', { replace: true });
    } catch (requestError) {
      setError(getErrorMessage(requestError, 'Could not create your account. Please try again.'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Start asking questions about your team's documents."
      footer={
        <>
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-primary hover:underline">
            Sign in
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
          label="Username"
          autoComplete="username"
          placeholder="jane"
          value={form.username}
          onChange={set('username')}
          onBlur={blur('username')}
          error={showError('username')}
          autoFocus
        />
        <Field
          label="Email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          value={form.email}
          onChange={set('email')}
          onBlur={blur('email')}
          error={showError('email')}
        />
        <Field
          label="Password"
          type="password"
          autoComplete="new-password"
          placeholder="At least 8 characters"
          value={form.password}
          onChange={set('password')}
          onBlur={blur('password')}
          error={showError('password')}
          hint="At least 8 characters."
        />
        <Button type="submit" variant="brand" size="lg" className="w-full" loading={submitting}>
          Create account
        </Button>
      </form>
    </AuthLayout>
  );
}
