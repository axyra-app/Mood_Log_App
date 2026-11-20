// Servicio para generar reportes PDF profesionales
import jsPDF from 'jspdf';
import logoUrl from '../assets/Logo_Mood_log_app.png';
import { moodAnalyzerAgent } from './specializedAgents';
import { getRealMoodData } from './realDataService';
import { prepareMoodAnalysis } from '../utils/moodAnalysisPayload';
import { analyzeJournalEntry, getJournalEntriesByDateRange } from './journalService';
import { logSanitizedClientError } from '../utils/safeClientLog';

interface ReportData {
  title: string;
  period: { start: Date; end: Date };
  userId: string;
  type: 'mood' | 'diary';
  aiConsentVersion: string;
}

export class PDFReportGenerator {
  private doc: jsPDF;
  private currentY: number = 20;
  private pageHeight: number = 280;
  private margin: number = 20;

  constructor() {
    this.doc = new jsPDF();
  }

  private async addHeader(title: string, subtitle: string) {
    try {
      // Intentar cargar el logo como imagen
      // Crear una imagen del logo
      const img = new Image();
      
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = logoUrl;
      });

      // Agregar el logo al PDF
      this.doc.addImage(img, 'PNG', this.margin, this.margin, 20, 20);
      
      // Title
      this.doc.setTextColor(0, 0, 0);
      this.doc.setFontSize(20);
      this.doc.setFont('helvetica', 'bold');
      this.doc.text(title, this.margin + 25, this.margin + 12);

      // Subtitle
      this.doc.setFontSize(12);
      this.doc.setFont('helvetica', 'normal');
      this.doc.text(subtitle, this.margin + 25, this.margin + 20);

      this.currentY = this.margin + 30;
    } catch (error) {
      logSanitizedClientError('PDF logo load failed; using placeholder', error);
      
      // Fallback: usar placeholder como antes
      this.doc.setFillColor(147, 51, 234); // Purple
      this.doc.rect(this.margin, this.margin, 15, 15, 'F');
      this.doc.setTextColor(255, 255, 255);
      this.doc.setFontSize(12);
      this.doc.text('ML', this.margin + 7, this.margin + 10, { align: 'center' });

      // Title
      this.doc.setTextColor(0, 0, 0);
      this.doc.setFontSize(20);
      this.doc.setFont('helvetica', 'bold');
      this.doc.text(title, this.margin + 20, this.margin + 10);

      // Subtitle
      this.doc.setFontSize(12);
      this.doc.setFont('helvetica', 'normal');
      this.doc.text(subtitle, this.margin + 20, this.margin + 18);

      this.currentY = this.margin + 30;
    }
  }

  private addSection(title: string, content: string[]) {
    // Check if we need a new page
    if (this.currentY > this.pageHeight - 50) {
      this.doc.addPage();
      this.currentY = this.margin;
    }

    // Section title
    this.doc.setFontSize(14);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(147, 51, 234); // Purple
    this.doc.text(title, this.margin, this.currentY);
    this.currentY += 8;

    // Section content
    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'normal');
    this.doc.setTextColor(0, 0, 0);

    content.forEach(item => {
      if (this.currentY > this.pageHeight - 20) {
        this.doc.addPage();
        this.currentY = this.margin;
      }
      
      // Dividir texto largo en líneas
      const maxWidth = 170; // Ancho máximo del texto
      const lines = this.doc.splitTextToSize(`• ${item}`, maxWidth);
      
      lines.forEach((line: string) => {
        if (this.currentY > this.pageHeight - 20) {
          this.doc.addPage();
          this.currentY = this.margin;
        }
        
        this.doc.text(line, this.margin + 5, this.currentY);
        this.currentY += 6;
      });
    });

    this.currentY += 10;
  }

  private analyzeDayOfWeekPatterns(moodLogs: any[]): any {
    const daysOfWeek = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    const dayMoods: { [key: string]: number[] } = {};
    
    // Agrupar por día de la semana
    moodLogs.forEach(log => {
      const dayOfWeek = daysOfWeek[log.date.getDay()];
      if (!dayMoods[dayOfWeek]) {
        dayMoods[dayOfWeek] = [];
      }
      dayMoods[dayOfWeek].push(log.mood);
    });
    
    // Calcular promedios por día
    const dayAverages: { [key: string]: number } = {};
    Object.keys(dayMoods).forEach(day => {
      dayAverages[day] = dayMoods[day].reduce((sum, mood) => sum + mood, 0) / dayMoods[day].length;
    });
    
    // Comparar promedios observados y conservar el tamaño de muestra por día.
    const sortedDays = Object.entries(dayAverages).sort((a, b) => b[1] - a[1]);
    const highestObservedDay = sortedDays[0][0];
    const lowestObservedDay = sortedDays[sortedDays.length - 1][0];
    
    // Calcular variabilidad
    const allAverages = Object.values(dayAverages);
    const avgOfAverages = allAverages.reduce((sum, avg) => sum + avg, 0) / allAverages.length;
    const variance = allAverages.reduce((sum, avg) => sum + Math.pow(avg - avgOfAverages, 2), 0) / allAverages.length;
    const variability = Math.sqrt(variance) < 1 ? 'Baja variabilidad entre días' : 
                       Math.sqrt(variance) < 2 ? 'Moderada variabilidad entre días' : 
                       'Alta variabilidad entre días';
    
    return {
      highestObservedDay,
      lowestObservedDay,
      highestObservedDayCount: dayMoods[highestObservedDay].length,
      lowestObservedDayCount: dayMoods[lowestObservedDay].length,
      highestObservedDayAverage: dayAverages[highestObservedDay],
      lowestObservedDayAverage: dayAverages[lowestObservedDay],
      variability
    };
  }

  private analyzeActivitiesAndEmotions(moodLogs: any[]): any {
    const activityCount: { [key: string]: number } = {};
    const emotionCount: { [key: string]: number } = {};
    const activityMoodObservations: { [key: string]: number[] } = {};
    
    moodLogs.forEach(log => {
      // Contar actividades
      if (log.activities) {
        log.activities.forEach((activity: string) => {
          activityCount[activity] = (activityCount[activity] || 0) + 1;
          if (!activityMoodObservations[activity]) {
            activityMoodObservations[activity] = [];
          }
          activityMoodObservations[activity].push(log.mood);
        });
      }
      
      // Contar emociones
      if (log.emotions) {
        log.emotions.forEach((emotion: string) => {
          emotionCount[emotion] = (emotionCount[emotion] || 0) + 1;
        });
      }
    });
    
    // Obtener actividades y emociones más frecuentes
    const topActivityNames = Object.entries(activityCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([activity]) => activity);
    const topActivities = topActivityNames.map(
      (activity) => `${activity} (n=${activityCount[activity]})`,
    );
    
    const topEmotions = Object.entries(emotionCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([emotion, count]) => `${emotion} (n=${count})`);
    
    // Mostrar estadísticas descriptivas por actividad, sin llamarlas correlación.
    const activityMoodSummaries = topActivityNames.map((activity: string) => {
      const moods = activityMoodObservations[activity] || [];
      const average = moods.length > 0
        ? moods.reduce((sum, mood) => sum + mood, 0) / moods.length
        : null;
      return average === null
        ? `${activity}: sin registros de ánimo asociados`
        : `${activity}: promedio autoinformado ${average.toFixed(1)}/10 en ${moods.length} registro${moods.length === 1 ? '' : 's'}`;
    });
    
    return {
      activities: topActivities,
      emotions: topEmotions,
      activityMoodSummaries
    };
  }

  private addFooter() {
    const pageCount = this.doc.getNumberOfPages();
    
    for (let i = 1; i <= pageCount; i++) {
      this.doc.setPage(i);
      
      // Footer line
      this.doc.setDrawColor(200, 200, 200);
      this.doc.line(this.margin, this.pageHeight + 5, 190, this.pageHeight + 5);
      
      // Page number
      this.doc.setFontSize(8);
      this.doc.setTextColor(100, 100, 100);
      this.doc.text(`Página ${i} de ${pageCount}`, 190, this.pageHeight + 10, { align: 'right' });
      
      // Generated date
      this.doc.text(`Generado el ${new Date().toLocaleDateString('es-CO')}`, this.margin, this.pageHeight + 10);
    }
  }

  async generateMoodReport(data: ReportData): Promise<void> {
    try {
      // Obtener datos reales
      const moodData = await getRealMoodData(data.userId, data.period.start, data.period.end);
      
      if (moodData.moodLogs.length === 0) {
        throw new Error('No hay datos de estado de ánimo para el período seleccionado');
      }

      // Analizar con IA
      const analysis = await moodAnalyzerAgent.analyzeMood(prepareMoodAnalysis(
        moodData.moodLogs,
        `${data.period.start.toLocaleDateString('es-CO')} - ${data.period.end.toLocaleDateString('es-CO')}`,
      ).moodData, data.aiConsentVersion);

      // Generar PDF
      await this.addHeader(
        'Reporte de Estado de Ánimo',
        `Período: ${data.period.start.toLocaleDateString('es-CO')} - ${data.period.end.toLocaleDateString('es-CO')}`
      );

      // Resumen ejecutivo
      this.addSection('Resumen Ejecutivo', [analysis.summary]);

      // Estadísticas detalladas
      const avgMood = moodData.moodLogs.reduce((sum, log) => sum + log.mood, 0) / moodData.moodLogs.length;
      const minMood = Math.min(...moodData.moodLogs.map(log => log.mood));
      const maxMood = Math.max(...moodData.moodLogs.map(log => log.mood));
      const moodVariance = moodData.moodLogs.reduce((sum, log) => sum + Math.pow(log.mood - avgMood, 2), 0) / moodData.moodLogs.length;
      const moodStdDev = Math.sqrt(moodVariance);
      
      // Comparación descriptiva en orden cronológico, independiente del orden de Firestore.
      const chronologicalLogs = [...moodData.moodLogs].sort((a, b) => a.date.getTime() - b.date.getTime());
      const splitIndex = Math.floor(chronologicalLogs.length / 2);
      const firstHalf = chronologicalLogs.slice(0, splitIndex);
      const secondHalf = chronologicalLogs.slice(splitIndex);
      const firstHalfAvg = firstHalf.reduce((sum, log) => sum + log.mood, 0) / firstHalf.length;
      const secondHalfAvg = secondHalf.reduce((sum, log) => sum + log.mood, 0) / secondHalf.length;
      const trendDirection = chronologicalLogs.length < 2
        ? 'No disponible: se requiere más de un registro'
        : secondHalfAvg - firstHalfAvg > 0.01
          ? 'Promedio mayor en la segunda parte'
          : secondHalfAvg - firstHalfAvg < -0.01
            ? 'Promedio menor en la segunda parte'
            : 'Promedios similares';

      this.addSection('Estadísticas del Período', [
        `Total de registros: ${moodData.moodLogs.length}`,
        `Estado de ánimo promedio: ${avgMood.toFixed(1)}/10`,
        `Estado de ánimo mínimo: ${minMood}/10`,
        `Estado de ánimo máximo: ${maxMood}/10`,
        `Rango emocional: ${maxMood - minMood} puntos`,
        `Variabilidad emocional: ${moodStdDev.toFixed(2)} (desviación estándar)`,
        `Comparación descriptiva entre primera y segunda parte de registros (no causal): ${trendDirection}`,
        `Dispersión de los autorreportes: ${moodStdDev.toFixed(2)} (desviación estándar)`
      ]);

      // Análisis de patrones temporales
      const dayOfWeekAnalysis = this.analyzeDayOfWeekPatterns(moodData.moodLogs);
      this.addSection('Análisis de Patrones Temporales', [
        `Mayor promedio observado: ${dayOfWeekAnalysis.highestObservedDay} (${dayOfWeekAnalysis.highestObservedDayAverage.toFixed(1)}/10, n=${dayOfWeekAnalysis.highestObservedDayCount})`,
        `Menor promedio observado: ${dayOfWeekAnalysis.lowestObservedDay} (${dayOfWeekAnalysis.lowestObservedDayAverage.toFixed(1)}/10, n=${dayOfWeekAnalysis.lowestObservedDayCount})`,
        'Los promedios son descriptivos y dependen del número de registros de cada día; no explican causas.',
        `Variabilidad por día: ${dayOfWeekAnalysis.variability}`
      ]);

      // Patrones identificados
      if (analysis.patterns.length > 0) {
        this.addSection('Patrones Identificados', analysis.patterns);
      }

      // Insights clave
      if (analysis.insights.length > 0) {
        this.addSection('Insights Clave', analysis.insights);
      }

      // Factores clave
      if (analysis.keyFactors.length > 0) {
        this.addSection('Factores Clave', analysis.keyFactors);
      }

      // Recomendaciones detalladas
      if (analysis.recommendations.length > 0) {
        this.addSection('Recomendaciones Personalizadas', analysis.recommendations);
      }

      // Próximos pasos
      if (analysis.nextSteps.length > 0) {
        this.addSection('Próximos Pasos Específicos', analysis.nextSteps);
      }

      // Análisis de actividades y emociones
      const activityAnalysis = this.analyzeActivitiesAndEmotions(moodData.moodLogs);
      if (activityAnalysis.activities.length > 0 || activityAnalysis.emotions.length > 0) {
        this.addSection('Análisis de Actividades y Emociones', [
          `Actividades más frecuentes: ${activityAnalysis.activities.join(', ')}`,
          `Emociones más reportadas: ${activityAnalysis.emotions.join(', ')}`,
          'Promedio de ánimo autoinformado en registros que incluyen cada actividad:',
          ...(activityAnalysis.activityMoodSummaries.length > 0
            ? activityAnalysis.activityMoodSummaries
            : ['No hay registros de ánimo asociados a actividades.']),
          'Estas coincidencias son descriptivas y no demuestran que una actividad cause un cambio de ánimo.'
        ]);
      }

      // Disclaimer
      this.addSection('Importante', [
        'Este reporte resume autorregistros con ayuda de inteligencia artificial y puede contener errores.',
        'Las observaciones no determinan causas ni describen tu salud mental.',
        'No reemplaza una evaluación profesional. Ante una emergencia, contacta los servicios de emergencia locales o a una persona de confianza.'
      ]);

      this.addFooter();

    } catch (error) {
      logSanitizedClientError('Mood PDF report generation failed', error);
      throw error;
    }
  }

  async generateDiaryReport(data: ReportData): Promise<void> {
    try {
      const entries = await getJournalEntriesByDateRange(
        data.userId,
        data.period.start,
        data.period.end,
      );
      if (entries.length === 0) {
        throw new Error('No hay entradas de diario en el período seleccionado.');
      }

      const journalContent = entries
        .map((entry) => `${entry.date.toLocaleDateString('es-CO')} - ${entry.title}\n${entry.content}`)
        .join('\n\n')
        .slice(0, 5_000);
      if (!journalContent.trim()) {
        throw new Error('Las entradas del período no contienen texto para analizar.');
      }
      const analysis = await analyzeJournalEntry(journalContent, data.aiConsentVersion);

      // Generar PDF
      await this.addHeader(
        'Reporte de Diario Personal',
        `Período: ${data.period.start.toLocaleDateString('es-CO')} - ${data.period.end.toLocaleDateString('es-CO')}`
      );

      // Resumen del diario
      this.addSection('Resumen del Diario', [
        `Total de entradas: ${entries.length}`,
        analysis.summary
      ]);

      // Análisis emocional
      this.addSection('Análisis Emocional', analysis.insights);

      // Patrones de escritura
      this.addSection('Temas identificados', analysis.themes);

      // Recomendaciones
      this.addSection('Recomendaciones', analysis.recommendations);

      // Disclaimer
      this.addSection('Importante', [
        'Este análisis es generado por inteligencia artificial.',
        'Refleja patrones generales basados en tus entradas.',
        'Este resumen es informativo y no sustituye la orientación de un profesional cualificado.'
      ]);

      this.addFooter();

    } catch (error) {
      logSanitizedClientError('Journal PDF report generation failed', error);
      throw error;
    }
  }

  download(filename: string): void {
    this.doc.save(filename);
  }

  getBlob(): Blob {
    return this.doc.output('blob');
  }
}

// Función helper para generar y descargar reportes
export const generateAndDownloadReport = async (
  type: 'mood' | 'diary',
  data: ReportData
): Promise<void> => {
  const generator = new PDFReportGenerator();
  
  try {
    if (type === 'mood') {
      await generator.generateMoodReport(data);
    } else {
      await generator.generateDiaryReport(data);
    }
    
    const filename = `reporte_${type}_${data.period.start.toISOString().split('T')[0]}_${data.period.end.toISOString().split('T')[0]}.pdf`;
    generator.download(filename);
  } catch (error) {
    logSanitizedClientError('PDF report generation failed', error);
    throw error;
  }
};
