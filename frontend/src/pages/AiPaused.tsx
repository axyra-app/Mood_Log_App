import React from 'react';
import { Link } from 'react-router-dom';

const AiPaused: React.FC = () => (
  <main className='flex min-h-screen items-center justify-center bg-slate-950 px-5 py-12 text-slate-100'>
    <section className='w-full max-w-xl rounded-3xl border border-white/10 bg-white/[0.04] p-7 shadow-2xl sm:p-10'>
      <p className='mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-amber-300'>Prueba inicial</p>
      <h1 className='text-3xl font-bold'>Funciones de IA pausadas</h1>
      <p className='mt-4 leading-7 text-slate-300'>
        En esta primera prueba puedes registrar y revisar tu ánimo y diario. Las funciones de IA están desactivadas y tus registros no se enviarán a un modelo externo.
      </p>
      <Link
        to='/dashboard'
        className='mt-7 inline-flex min-h-11 items-center justify-center rounded-xl bg-amber-300 px-5 py-3 font-semibold text-slate-950 transition hover:bg-amber-200 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-amber-200/40'
      >
        Volver a Mood Log
      </Link>
    </section>
  </main>
);

export default AiPaused;
