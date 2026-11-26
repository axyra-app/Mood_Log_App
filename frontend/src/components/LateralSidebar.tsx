import { BarChart3, BookOpen, FileText, Heart, X } from 'lucide-react';
import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { AI_FEATURES_ENABLED } from '../services/aiApi';
import Logo from './Logo';

interface LateralSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  isDarkMode?: boolean;
}

const LateralSidebar: React.FC<LateralSidebarProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const panel = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = panel.current;
    if (!dialog) return;
    if (isOpen && !dialog.open) dialog.showModal();
    if (!isOpen && dialog.open) dialog.close();
  }, [isOpen]);

  const menuItems = [
    {
      icon: BookOpen,
      label: 'Mi Diario',
      path: '/journal',
      description: 'Reflexiona sobre tu día',
      color: 'bg-gradient-to-r from-teal-500 to-blue-500',
    },
    {
      icon: Heart,
      label: 'Registrar Estado de Ánimo',
      path: '/mood-flow',
      description: 'Cómo te sientes hoy',
      color: 'bg-gradient-to-r from-purple-500 to-pink-500',
    },
    {
      icon: BarChart3,
      label: 'Ver Estadísticas',
      path: '/statistics',
      description: 'Tu progreso emocional',
      color: 'bg-gradient-to-r from-blue-500 to-cyan-500',
    },
    {
      icon: FileText,
      label: 'Reportes Avanzados',
      path: '/reports',
      description: 'Análisis detallados',
      color: 'bg-gradient-to-r from-orange-500 to-amber-500',
    },
  ].filter((item) => AI_FEATURES_ENABLED || item.path !== '/reports');

  return (
    <dialog
      ref={panel}
      aria-labelledby='tools-heading'
      onCancel={(event) => { event.preventDefault(); onClose(); }}
      onClick={(event) => { if (event.target === event.currentTarget) onClose(); }}
      className='fixed inset-y-0 left-0 right-auto m-0 h-dvh max-h-none w-[min(22rem,calc(100%-3rem))] max-w-none overflow-hidden border-r border-[var(--mood-border)] bg-transparent p-0 text-[var(--mood-text)] shadow-2xl backdrop:bg-slate-900/20 dark:backdrop:bg-black/25'
    >
      <div className='flex h-full flex-col bg-[color-mix(in_srgb,var(--mood-surface)_92%,transparent)] backdrop-blur-md'>
        <header className='flex shrink-0 items-center justify-between border-b border-[var(--mood-border)] px-4 py-3 sm:px-5'>
          <Logo size='md' />
          <button type='button' aria-label='Cerrar herramientas' autoFocus onClick={onClose} className='touch-target grid place-items-center rounded-xl hover:bg-[var(--mood-surface-muted)]'>
            <X className='size-5' aria-hidden='true' />
          </button>
        </header>
        <nav aria-labelledby='tools-heading' className='min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 pt-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:px-5'>
          <h2 id='tools-heading' className='mb-3 text-lg font-semibold'>Más herramientas</h2>
          <ul className='space-y-2'>
            {menuItems.map(({ icon: Icon, label, path, description, color }) => (
              <li key={path}>
                <button
                  type='button'
                  onClick={() => { onClose(); navigate(path); }}
                  className='flex min-h-16 w-full items-center gap-3 rounded-xl border border-[var(--mood-border)] bg-[var(--mood-surface)] px-3 py-2 text-left transition-colors hover:bg-[var(--mood-surface-muted)]'
                >
                  <span className={`grid size-9 shrink-0 place-items-center rounded-lg text-white ${color}`}>
                    <Icon className='size-5' aria-hidden='true' />
                  </span>
                  <span className='min-w-0'>
                    <span className='block text-sm font-semibold'>{label}</span>
                    <span className='block text-xs text-[var(--mood-text-muted)]'>{description}</span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </dialog>
  );
};

export default LateralSidebar;
