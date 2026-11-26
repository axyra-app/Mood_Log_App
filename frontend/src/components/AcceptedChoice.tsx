export default function AcceptedChoice({ onUndo, label = 'Selección marcada' }: { onUndo: () => void; label?: string }) {
  return (
    <div className='flex flex-wrap items-center justify-between gap-x-3 rounded-lg bg-[var(--mood-surface-muted)] px-3 text-sm text-[var(--mood-text)]'>
      <span role='status'>{label}</span>
      <button type='button' aria-label={`Desmarcar: ${label}`} onClick={onUndo} className='min-h-11 font-semibold underline underline-offset-4'>Desmarcar</button>
    </div>
  );
}
