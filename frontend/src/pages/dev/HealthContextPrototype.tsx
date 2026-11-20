import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Activity, ArrowLeft, Heart, ShieldAlert } from 'lucide-react';
import {
  CartesianGrid,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  summarizeHealthContext,
  syntheticHealthContext,
} from '../../features/healthContext/healthContextTimeline';

const formatDateTime = (value: string) =>
  new Intl.DateTimeFormat('es-CO', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'America/Bogota',
  }).format(new Date(value));

const formatDateTick = (value: number) =>
  new Intl.DateTimeFormat('es-CO', {
    day: '2-digit',
    month: 'short',
    timeZone: 'America/Bogota',
  }).format(new Date(value));

const HealthContextPrototype = () => {
  const timeline = useMemo(() => syntheticHealthContext(), []);
  const summaries = useMemo(() => summarizeHealthContext(timeline), [timeline]);
  const pulseSeries = useMemo(() => timeline.flatMap((item) =>
    item.type === 'health' && item.metric === 'heart_rate'
      ? [{ timestamp: Date.parse(item.occurredAt), value: item.value }]
      : []
  ), [timeline]);
  const moodSeries = useMemo(() => timeline.flatMap((item) =>
    item.type === 'mood'
      ? [{ timestamp: Date.parse(item.occurredAt), value: item.score }]
      : []
  ), [timeline]);
  const timestamps = timeline.map((item) => Date.parse(item.occurredAt));
  const timeDomain: [number, number] = timestamps.length > 0
    ? [Math.min(...timestamps), Math.max(...timestamps)]
    : [0, 1];
  const dateRange = `${formatDateTick(timeDomain[0])}–${formatDateTick(timeDomain[1])} · hora de Colombia`;

  return (
    <main className='min-h-screen bg-slate-950 px-4 py-10 text-slate-100 sm:px-8'>
      <div className='mx-auto max-w-3xl'>
        <Link
          to='/'
          className='mb-8 inline-flex items-center gap-2 text-sm text-slate-300 hover:text-white'
        >
          <ArrowLeft size={16} aria-hidden='true' />
          Volver a Mood Log
        </Link>

        <header className='mb-8'>
          <p className='mb-3 inline-flex items-center gap-2 rounded-full border border-amber-300/40 bg-amber-300/10 px-3 py-1 text-sm font-semibold text-amber-200'>
            <ShieldAlert size={16} aria-hidden='true' />
            Prototipo interno · solo datos sintéticos
          </p>
          <h1 className='text-3xl font-bold sm:text-4xl'>Contexto de salud</h1>
          <p className='mt-3 max-w-2xl text-slate-300'>
            Vista de prueba para revisar cómo presentar mediciones y ánimo autoinformado en una línea de tiempo.
          </p>
        </header>

        <section
          aria-label='Límite de esta prueba'
          className='mb-8 rounded-2xl border border-amber-300/30 bg-amber-300/10 p-4 text-amber-100'
        >
          No se conecta a Wear OS o Health Connect, no solicita permisos, no lee sensores ni guarda datos.
          Estos valores son ficticios. La proximidad temporal no demuestra que una medida cause o determine
          un estado de ánimo. La demostración no calcula correlaciones, predice estados ni sugiere una
          relación entre observaciones.
        </section>

        <section aria-labelledby='patterns-title' className='mb-6 rounded-3xl border border-white/10 bg-white/5 p-5 sm:p-7'>
          <div className='mb-5'>
            <h2 id='patterns-title' className='text-xl font-semibold'>Patrones personales · ejemplo sintético</h2>
            <p className='mt-1 text-sm text-slate-400'>Pulso y ánimo autoinformado aparecen en gráficos separados sobre el mismo período. Cada punto es una observación; los puntos no se conectan ni se emparejan automáticamente.</p>
          </div>
          <p className='mb-5 rounded-xl border border-amber-300/20 bg-amber-300/5 p-3 text-sm text-amber-100'>
            Las escalas verticales son distintas. Se muestran observaciones puntuales, sin unir ni interpolar huecos. La vista permite inspeccionar cambios en el tiempo, pero no calcula asociación, causalidad ni estado emocional.
          </p>

          <div className='grid gap-6 lg:grid-cols-2'>
            <figure aria-label='Gráfico de puntos de frecuencia cardíaca sintética' className='min-w-0 rounded-2xl border border-white/10 bg-slate-900/70 p-4'>
              <figcaption className='mb-2 font-semibold text-rose-200'>Pulso · latidos por minuto</figcaption>
              <div role='img' aria-label={`Puntos sintéticos de pulso entre ${dateRange}. La lista de muestras detallada aparece más abajo.`}>
                <ResponsiveContainer width='100%' height={220}>
                  <ScatterChart margin={{ top: 8, right: 12, bottom: 8, left: 4 }}>
                    <CartesianGrid strokeDasharray='3 3' stroke='#334155' />
                    <XAxis
                      type='number'
                      dataKey='timestamp'
                      scale='time'
                      domain={timeDomain}
                      tickFormatter={formatDateTick}
                      tick={{ fill: '#94a3b8', fontSize: 11 }}
                      minTickGap={24}
                    />
                    <YAxis
                      type='number'
                      dataKey='value'
                      domain={[0, 'auto']}
                      tick={{ fill: '#94a3b8', fontSize: 11 }}
                      width={36}
                    />
                    <Tooltip
                      labelFormatter={(label) => formatDateTime(new Date(Number(label)).toISOString())}
                      formatter={(value) => [`${value} lpm`, 'Pulso']}
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#475569', color: '#f8fafc' }}
                    />
                    <Scatter data={pulseSeries} dataKey='value' fill='#fda4af' />
                  </ScatterChart>
                </ResponsiveContainer>
              </div>
            </figure>

            <figure aria-label='Gráfico de puntos de ánimo autoinformado sintético' className='min-w-0 rounded-2xl border border-white/10 bg-slate-900/70 p-4'>
              <figcaption className='mb-2 font-semibold text-violet-200'>Ánimo · autorreporte de 1 a 10</figcaption>
              <div role='img' aria-label={`Puntos sintéticos de ánimo entre ${dateRange}. La lista de muestras detallada aparece más abajo.`}>
                <ResponsiveContainer width='100%' height={220}>
                  <ScatterChart margin={{ top: 8, right: 12, bottom: 8, left: 4 }}>
                    <CartesianGrid strokeDasharray='3 3' stroke='#334155' />
                    <XAxis
                      type='number'
                      dataKey='timestamp'
                      scale='time'
                      domain={timeDomain}
                      tickFormatter={formatDateTick}
                      tick={{ fill: '#94a3b8', fontSize: 11 }}
                      minTickGap={24}
                    />
                    <YAxis
                      type='number'
                      dataKey='value'
                      domain={[0, 10]}
                      tick={{ fill: '#94a3b8', fontSize: 11 }}
                      width={36}
                    />
                    <Tooltip
                      labelFormatter={(label) => formatDateTime(new Date(Number(label)).toISOString())}
                      formatter={(value) => [`${value}/10`, 'Ánimo autoinformado']}
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#475569', color: '#f8fafc' }}
                    />
                    <Scatter data={moodSeries} dataKey='value' fill='#c4b5fd' />
                  </ScatterChart>
                </ResponsiveContainer>
              </div>
            </figure>
          </div>
        </section>

        <section aria-labelledby='summary-title' className='mb-6 rounded-3xl border border-white/10 bg-white/5 p-5 sm:p-7'>
          <div className='mb-5'>
            <h2 id='summary-title' className='text-xl font-semibold'>Resumen descriptivo</h2>
            <p className='mt-1 text-sm text-slate-400'>Mediana, rango y número de observaciones por métrica y fuente. No calcula una relación entre pulso y ánimo.</p>
          </div>
          <div className='grid gap-3 sm:grid-cols-2'>
            {summaries.map((summary) => (
              <article key={summary.id} className='rounded-2xl border border-white/10 bg-slate-900/70 p-4'>
                <h3 className='font-semibold'>{summary.title}</h3>
                <p className='mt-1 text-xs text-slate-400'>{summary.sourceLabel}</p>
                <p className='mt-3 text-lg font-semibold'>
                  Mediana: {summary.median}{summary.unit}
                </p>
                <p className='mt-1 text-sm text-slate-300'>
                  Rango: {summary.minimum}–{summary.maximum}{summary.unit} · {summary.count} {summary.count === 1 ? 'observación' : 'observaciones'}
                </p>
                <p className='mt-2 text-xs text-slate-400'>
                  {formatDateTime(summary.firstObservedAt)} – {formatDateTime(summary.lastObservedAt)}
                </p>
              </article>
            ))}
          </div>
        </section>

        <section aria-labelledby='timeline-title' className='rounded-3xl border border-white/10 bg-white/5 p-5 sm:p-7'>
          <div className='mb-6'>
            <h2 id='timeline-title' className='text-xl font-semibold'>Muestras de ejemplo</h2>
            <p className='mt-1 text-sm text-slate-400'>{dateRange}</p>
          </div>

          <ol className='space-y-3'>
            {timeline.map((item) => (
              <li key={item.id} className='rounded-2xl border border-white/10 bg-slate-900/70 p-4'>
                <div className='flex flex-wrap items-start justify-between gap-3'>
                  <div className='flex items-start gap-3'>
                    <span className={item.type === 'health'
                      ? 'mt-0.5 rounded-xl bg-rose-400/15 p-2 text-rose-200'
                      : 'mt-0.5 rounded-xl bg-violet-400/15 p-2 text-violet-200'}
                    >
                      {item.type === 'health'
                        ? <Heart size={18} aria-hidden='true' />
                        : <Activity size={18} aria-hidden='true' />}
                    </span>
                    <div>
                      <p className='font-semibold'>
                        {item.type === 'mood'
                          ? 'Ánimo autoinformado'
                          : 'Frecuencia cardíaca'}
                      </p>
                      <p className='mt-1 text-sm text-slate-400'>{item.sourceLabel}</p>
                    </div>
                  </div>
                  <div className='text-right'>
                    <p className='text-lg font-semibold'>
                      {item.type === 'mood'
                        ? item.score + '/10'
                        : item.value + ' ' + item.unit}
                    </p>
                    <time className='text-xs text-slate-400' dateTime={item.occurredAt}>
                      {formatDateTime(item.occurredAt)}
                    </time>
                  </div>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <p className='mt-5 text-sm text-slate-400'>
          Cada observación conserva su tipo, unidad, hora y fuente. Solo se ejemplifica pulso junto al
          autorreporte; la lectura no representa una medida de emoción ni produce conclusiones de salud.
        </p>
      </div>
    </main>
  );
};

export default HealthContextPrototype;
