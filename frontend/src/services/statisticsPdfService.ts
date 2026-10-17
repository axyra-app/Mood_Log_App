import { jsPDF } from 'jspdf';
import type { MoodLog } from '../types';
import { toDate } from '../utils/moodMetrics.ts';

export interface StatisticsPdfAnalysis {
  summary?: string;
  patterns: string[];
  insights: string[];
  recommendations: string[];
}

export interface StatisticsPdfData {
  periodLabel: string;
  periodStart: Date;
  periodEnd: Date;
  generatedAt: Date;
  userName?: string;
  averageMood: number;
  streak: number;
  trend: string;
  journalEntries: number;
  logs: MoodLog[];
  analysis?: StatisticsPdfAnalysis | null;
}

const COLORS = {
  ink: [37, 38, 69] as const,
  muted: [105, 107, 132] as const,
  purple: [125, 58, 237] as const,
  purpleDark: [77, 36, 150] as const,
  lavender: [245, 240, 255] as const,
  line: [229, 226, 238] as const,
  green: [28, 142, 103] as const,
  orange: [217, 119, 6] as const,
  white: [255, 255, 255] as const,
  pale: [250, 249, 252] as const,
};

const PAGE = { width: 210, height: 297, margin: 17, footerY: 282 };

const formatDate = (date: Date, options: Intl.DateTimeFormatOptions = {}) =>
  date.toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric', ...options });

const moodLabel = (mood: number) => {
  if (mood >= 8) return 'Muy bien';
  if (mood >= 6) return 'Bien';
  if (mood >= 4) return 'Regular';
  if (mood >= 2) return 'Bajo';
  return 'Muy bajo';
};

const safeText = (value: unknown): string =>
  typeof value === 'string' ? value.trim() : '';

export const loadStatisticsPdfLogo = (logoUrl: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('No se pudo cargar el logo de Mood Log para el reporte.'));
    image.src = logoUrl;
  });

export const createStatisticsPdf = (
  data: StatisticsPdfData,
  logo: HTMLImageElement
): jsPDF => {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const contentWidth = PAGE.width - PAGE.margin * 2;
  let y = 0;

  const addPage = () => {
    doc.addPage();
    y = 20;
  };

  const ensureSpace = (height: number) => {
    if (y + height > PAGE.footerY - 5) addPage();
  };

  const addSectionTitle = (title: string, subtitle?: string) => {
    ensureSpace(subtitle ? 19 : 13);
    doc.setFillColor(...COLORS.purple);
    doc.roundedRect(PAGE.margin, y - 4, 1.5, 7, 0.7, 0.7, 'F');
    doc.setTextColor(...COLORS.ink);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text(title, PAGE.margin + 5, y + 1);
    y += 8;
    if (subtitle) {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(...COLORS.muted);
      doc.text(subtitle, PAGE.margin + 5, y);
      y += 7;
    }
  };

  const addParagraph = (text: string, options: { color?: readonly number[]; fontSize?: number; indent?: number } = {}) => {
    const cleanText = safeText(text);
    if (!cleanText) return;
    const fontSize = options.fontSize ?? 9.5;
    const indent = options.indent ?? 0;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(fontSize);
    const textColor = options.color ?? COLORS.ink;
    doc.setTextColor(textColor[0], textColor[1], textColor[2]);
    const lines = doc.splitTextToSize(cleanText, contentWidth - indent);
    for (const line of lines) {
      ensureSpace(5.2);
      doc.text(line, PAGE.margin + indent, y);
      y += 4.8;
    }
    y += 1.5;
  };

  const drawMetricCard = (x: number, top: number, width: number, label: string, value: string, hint: string, accent: readonly number[]) => {
    doc.setFillColor(COLORS.pale[0], COLORS.pale[1], COLORS.pale[2]);
    doc.setDrawColor(COLORS.line[0], COLORS.line[1], COLORS.line[2]);
    doc.roundedRect(x, top, width, 26, 3, 3, 'FD');
    doc.setFillColor(accent[0], accent[1], accent[2]);
    doc.roundedRect(x, top, 1.7, 26, 0.8, 0.8, 'F');
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(...COLORS.muted);
    doc.text(label.toUpperCase(), x + 6, top + 7);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(17);
    doc.setTextColor(...COLORS.ink);
    doc.text(value, x + 6, top + 16);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(...COLORS.muted);
    doc.text(hint, x + 6, top + 22);
  };

  const addMoodChart = () => {
    ensureSpace(65);
    const datedLogs = data.logs
      .map((log) => ({ log, date: toDate(log.createdAt) }))
      .filter((item): item is { log: MoodLog; date: Date } => item.date instanceof Date && !Number.isNaN(item.date.getTime()))
      .sort((a, b) => a.date.getTime() - b.date.getTime());
    if (datedLogs.length < 2) {
      addParagraph('Aún no hay suficientes registros en este período para mostrar una evolución. Sigue registrando cómo te sientes para descubrir tendencias con el tiempo.', { color: COLORS.muted });
      return;
    }

    const chartX = PAGE.margin + 12;
    const chartY = y + 3;
    const chartWidth = contentWidth - 23;
    const chartHeight = 42;
    doc.setDrawColor(...COLORS.line);
    doc.setLineWidth(0.25);
    for (let score = 2; score <= 10; score += 2) {
      const lineY = chartY + chartHeight - ((score - 1) / 9) * chartHeight;
      doc.line(chartX, lineY, chartX + chartWidth, lineY);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7);
      doc.setTextColor(...COLORS.muted);
      doc.text(String(score), chartX - 5, lineY + 1);
    }

    const plotted = datedLogs.length > 12
      ? Array.from({ length: 12 }, (_, index) => datedLogs[Math.round(index * (datedLogs.length - 1) / 11)])
      : datedLogs;
    const points = plotted.map(({ log }, index) => ({
      x: chartX + (index / (plotted.length - 1)) * chartWidth,
      y: chartY + chartHeight - ((log.mood - 1) / 9) * chartHeight,
    }));
    doc.setDrawColor(...COLORS.purple);
    doc.setLineWidth(1.1);
    points.slice(1).forEach((point, index) => {
      const previous = points[index];
      doc.line(previous.x, previous.y, point.x, point.y);
    });
    points.forEach((point) => {
      doc.setFillColor(...COLORS.white);
      doc.setDrawColor(...COLORS.purple);
      doc.setLineWidth(0.8);
      doc.circle(point.x, point.y, 1.2, 'FD');
    });
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(...COLORS.muted);
    doc.text(formatDate(datedLogs[0].date, { year: undefined }), chartX, chartY + chartHeight + 7);
    doc.text(formatDate(datedLogs[datedLogs.length - 1].date, { year: undefined }), chartX + chartWidth, chartY + chartHeight + 7, { align: 'right' });
    y = chartY + chartHeight + 14;
  };

  const addAnalysisList = (title: string, items: string[]) => {
    const cleanItems = items.map(safeText).filter(Boolean);
    if (cleanItems.length === 0) return;
    addSectionTitle(title);
    cleanItems.forEach((item) => {
      const lines = doc.splitTextToSize(item, contentWidth - 10);
      ensureSpace(lines.length * 4.8 + 3);
      doc.setFillColor(...COLORS.purple);
      doc.circle(PAGE.margin + 2, y - 1, 0.8, 'F');
      addParagraph(item, { indent: 7 });
    });
    y += 2;
  };

  const moodAverage = data.logs.length
    ? data.logs.reduce((sum, log) => sum + log.mood, 0) / data.logs.length
    : data.averageMood;
  const averageEnergy = data.logs.length
    ? data.logs.reduce((sum, log) => sum + log.energy, 0) / data.logs.length
    : null;
  const averageStress = data.logs.length
    ? data.logs.reduce((sum, log) => sum + log.stress, 0) / data.logs.length
    : null;
  const averageSleep = data.logs.length
    ? data.logs.reduce((sum, log) => sum + log.sleep, 0) / data.logs.length
    : null;

  doc.setProperties({
    title: `Mood Log | Reporte de bienestar - ${data.periodLabel}`,
    subject: 'Resumen personal de registros de bienestar',
    author: 'Mood Log',
    creator: 'Mood Log',
  });

  doc.setFillColor(...COLORS.purpleDark);
  doc.rect(0, 0, PAGE.width, 56, 'F');
  doc.setFillColor(...COLORS.purple);
  doc.circle(PAGE.width - 7, 5, 37, 'F');
  doc.setFillColor(...COLORS.purpleDark);
  doc.circle(PAGE.width + 2, 3, 30, 'F');
  doc.setFillColor(...COLORS.white);
  doc.roundedRect(PAGE.margin, 13, 24, 24, 5, 5, 'F');
  doc.addImage(logo, 'PNG', PAGE.margin + 2, 15, 20, 20);
  doc.setTextColor(...COLORS.white);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(21);
  doc.text('Tu bienestar,', PAGE.margin + 32, 23);
  doc.text('en perspectiva.', PAGE.margin + 32, 32);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text('REPORTE PERSONAL DE BIENESTAR', PAGE.margin + 32, 42);

  doc.setFillColor(...COLORS.white);
  doc.roundedRect(PAGE.margin, 48, contentWidth, 20, 3, 3, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(...COLORS.ink);
  doc.text(`PERÍODO - ${data.periodLabel.toUpperCase()}`, PAGE.margin + 7, 56);
  doc.text('GENERADO', PAGE.width - PAGE.margin - 7, 56, { align: 'right' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(...COLORS.muted);
  doc.text(`${formatDate(data.periodStart)} – ${formatDate(data.periodEnd)}`, PAGE.margin + 7, 62);
  doc.text(formatDate(data.generatedAt), PAGE.width - PAGE.margin - 7, 62, { align: 'right' });
  y = 80;

  const greeting = data.userName ? `Un resumen para ${data.userName}` : 'Un resumen de tu recorrido reciente';
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(15);
  doc.setTextColor(...COLORS.ink);
  doc.text(greeting, PAGE.margin, y);
  y += 6;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(...COLORS.muted);
  doc.text('Una mirada descriptiva a los datos que registraste en Mood Log.', PAGE.margin, y);
  y += 12;

  addSectionTitle('A primera vista', 'Indicadores del período seleccionado');
  const cardGap = 4;
  const cardWidth = (contentWidth - cardGap) / 2;
  const cardTop = y;
  drawMetricCard(
    PAGE.margin,
    cardTop,
    cardWidth,
    'Ánimo promedio',
    data.logs.length ? `${moodAverage.toFixed(1)} / 10` : '— / 10',
    data.logs.length ? moodLabel(moodAverage) : 'Sin registros en el período',
    COLORS.purple
  );
  drawMetricCard(PAGE.margin + cardWidth + cardGap, cardTop, cardWidth, 'Registros', String(data.logs.length), 'check-ins de ánimo', COLORS.green);
  drawMetricCard(PAGE.margin, cardTop + 30, cardWidth, 'Racha actual', `${data.streak} ${data.streak === 1 ? 'día' : 'días'}`, 'días consecutivos', COLORS.orange);
  drawMetricCard(PAGE.margin + cardWidth + cardGap, cardTop + 30, cardWidth, 'Diario', String(data.journalEntries), data.journalEntries === 1 ? 'entrada en el período' : 'entradas en el período', COLORS.purpleDark);
  y = cardTop + 66;

  ensureSpace(80);
  addSectionTitle('Tu evolución del ánimo', 'Cada punto representa un registro; la escala va de 1 a 10.');
  addMoodChart();

  ensureSpace(36);
  addSectionTitle('Otros indicadores registrados');
  const indicatorParts = [
    averageEnergy === null ? null : `Energía promedio: ${averageEnergy.toFixed(1)}/10`,
    averageStress === null ? null : `Estrés promedio: ${averageStress.toFixed(1)}/10`,
    averageSleep === null ? null : `Descanso promedio: ${averageSleep.toFixed(1)}/10`,
    `Tendencia general: ${data.trend}`,
  ].filter((item): item is string => Boolean(item));
  const indicatorGap = 3;
  const indicatorWidth = (contentWidth - indicatorGap * 3) / 4;
  indicatorParts.forEach((item, index) => {
    const x = PAGE.margin + index * (indicatorWidth + indicatorGap);
    doc.setFillColor(...COLORS.lavender);
    doc.roundedRect(x, y, indicatorWidth, 13, 2, 2, 'F');
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(...COLORS.ink);
    const lines = doc.splitTextToSize(item, indicatorWidth - 4);
    doc.text(lines.slice(0, 2), x + 2, y + 5);
  });
  y += 20;

  const sortedLogs = [...data.logs].sort((a, b) =>
    (toDate(b.createdAt)?.getTime() ?? 0) - (toDate(a.createdAt)?.getTime() ?? 0)
  );
  const recentLogs = sortedLogs.slice(0, 12);
  ensureSpace(recentLogs.length * 8 + 30);
  addSectionTitle('Registros recientes', 'Hasta 12 registros más recientes del período');
  const columns = [
    { title: 'FECHA', x: PAGE.margin + 3, width: 44 },
    { title: 'ÁNIMO', x: PAGE.margin + 48, width: 31 },
    { title: 'ENERGÍA', x: PAGE.margin + 82, width: 31 },
    { title: 'ESTRÉS', x: PAGE.margin + 116, width: 31 },
    { title: 'DESCANSO', x: PAGE.margin + 150, width: 29 },
  ];
  doc.setFillColor(...COLORS.lavender);
  doc.roundedRect(PAGE.margin, y - 4, contentWidth, 9, 2, 2, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(...COLORS.purpleDark);
  columns.forEach((column) => doc.text(column.title, column.x, y + 1));
  y += 9;
  if (recentLogs.length === 0) {
    addParagraph('No hay registros de ánimo en este período.', { color: COLORS.muted });
  }
  recentLogs.forEach((log, index) => {
    ensureSpace(9);
    if (index % 2 === 0) {
      doc.setFillColor(...COLORS.pale);
      doc.rect(PAGE.margin, y - 5, contentWidth, 8, 'F');
    }
    const date = toDate(log.createdAt);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(...COLORS.ink);
    doc.text(date ? formatDate(date, { year: undefined }) : 'Fecha no disponible', columns[0].x, y);
    doc.setFont('helvetica', 'bold');
    doc.text(`${log.mood}/10`, columns[1].x, y);
    doc.setFont('helvetica', 'normal');
    doc.text(`${log.energy}/10`, columns[2].x, y);
    doc.text(`${log.stress}/10`, columns[3].x, y);
    doc.text(`${log.sleep}/10`, columns[4].x, y);
    y += 8;
  });
  y += 7;

  if (data.analysis) {
    const summary = safeText(data.analysis.summary);
    if (summary) {
      addSectionTitle('Reflexión asistida por IA');
      addParagraph(summary);
    }
    addAnalysisList('Patrones observados', data.analysis.patterns);
    addAnalysisList('Observaciones clave', data.analysis.insights);
    addAnalysisList('Ideas para la autorreflexión', data.analysis.recommendations);
    ensureSpace(14);
    doc.setFillColor(...COLORS.lavender);
    doc.roundedRect(PAGE.margin, y, contentWidth, 12, 2, 2, 'F');
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(...COLORS.muted);
    doc.text('La reflexión de IA es informativa y no constituye diagnóstico ni atención profesional.', PAGE.margin + 4, y + 7);
    y += 19;
  }

  ensureSpace(20);
  doc.setDrawColor(...COLORS.line);
  doc.line(PAGE.margin, y, PAGE.width - PAGE.margin, y);
  y += 6;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(...COLORS.muted);
  doc.text('Este informe resume información que registraste; no es una evaluación clínica.', PAGE.margin, y);
  doc.text('Mood Log · Tu bienestar merece atención.', PAGE.width - PAGE.margin, y, { align: 'right' });

  const pageCount = doc.getNumberOfPages();
  for (let page = 1; page <= pageCount; page += 1) {
    doc.setPage(page);
    doc.setDrawColor(...COLORS.line);
    doc.line(PAGE.margin, PAGE.footerY, PAGE.width - PAGE.margin, PAGE.footerY);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(...COLORS.muted);
    doc.text('MOOD LOG  ·  REPORTE PERSONAL', PAGE.margin, PAGE.footerY + 5);
    doc.text(`Página ${page} de ${pageCount}`, PAGE.width - PAGE.margin, PAGE.footerY + 5, { align: 'right' });
  }

  return doc;
};
