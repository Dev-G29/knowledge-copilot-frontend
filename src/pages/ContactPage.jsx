import { useEffect } from 'react';
import { motion } from 'motion/react';
import { ArrowUpRight, Mail, Phone } from 'lucide-react';
import profilePhoto from '../assets/profile.jpg';

function LinkedInIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.34V9h3.42v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28ZM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13ZM7.12 20.45H3.56V9h3.56v11.45ZM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0Z" />
    </svg>
  );
}

const channels = [
  { icon: Mail, label: 'Email', value: 'devgangavkar@gmail.com', href: 'mailto:devgangavkar@gmail.com' },
  { icon: Phone, label: 'Phone', value: '+91 90751 15211', href: 'tel:+919075115211' },
  { icon: LinkedInIcon, label: 'LinkedIn', value: 'in/dev-gangavkar', href: 'https://www.linkedin.com/in/dev-gangavkar', external: true },
];

export default function ContactPage() {
  useEffect(() => {
    document.title = 'Contact · Knowledge Copilot';
  }, []);

  return (
    <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 md:py-20">
      <div className="grid items-center gap-12 md:grid-cols-[1.2fr_1fr]">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <p className="text-sm font-semibold text-primary">Contact</p>
          <h1 className="mt-2 text-4xl font-semibold tracking-tight text-fg">Let’s build your AI knowledge assistant.</h1>
          <p className="mt-5 text-lg leading-relaxed text-fg-muted">
            Reach out for collaboration, feedback or project opportunities. I design and build AI-driven products that turn raw documents into trusted,
            conversational answers.
          </p>
          <ul className="mt-8 space-y-3">
            {channels.map(({ icon: Icon, label, value, href, external }) => (
              <li key={label}>
                <a
                  href={href}
                  target={external ? '_blank' : undefined}
                  rel={external ? 'noreferrer' : undefined}
                  className="group flex items-center gap-4 rounded-2xl border border-border bg-surface p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-soft"
                >
                  <span className="flex size-11 items-center justify-center rounded-xl bg-primary-soft text-primary">
                    <Icon className="size-5" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-xs font-medium text-fg-subtle">{label}</span>
                    <span className="block truncate text-[15px] font-medium text-fg">{value}</span>
                  </span>
                  <ArrowUpRight className="size-4 text-fg-subtle transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-primary" />
                </a>
              </li>
            ))}
          </ul>
        </motion.div>

        <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }} className="relative mx-auto w-full max-w-sm">
          <div className="absolute -inset-4 -z-10 rounded-[2rem] bg-brand opacity-25 blur-2xl" />
          <img src={profilePhoto} alt="Dev Gangavkar" className="aspect-square w-full rounded-3xl border border-border object-cover shadow-lifted" />
        </motion.div>
      </div>
    </div>
  );
}
