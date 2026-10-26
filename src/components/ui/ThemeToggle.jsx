import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import Button from './Button';

export default function ThemeToggle({ className }) {
  const { resolved, toggle } = useTheme();
  const next = resolved === 'dark' ? 'light' : 'dark';
  return (
    <Button variant="ghost" size="icon" onClick={toggle} className={className} aria-label={`Switch to ${next} theme`} title={`Switch to ${next} theme`}>
      {resolved === 'dark' ? <Sun className="size-[18px]" /> : <Moon className="size-[18px]" />}
    </Button>
  );
}
