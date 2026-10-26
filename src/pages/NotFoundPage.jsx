import { Compass } from 'lucide-react';
import Button from '../components/ui/Button';

export default function NotFoundPage() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <Compass className="size-10 text-fg-subtle" />
      <h1 className="mt-4 text-2xl font-semibold text-fg">Page not found</h1>
      <p className="mt-2 text-fg-muted">The page you’re looking for doesn’t exist or has moved.</p>
      <Button to="/" className="mt-6">
        Back to home
      </Button>
    </div>
  );
}
