// Servicio para generar reportes PDF profesionales
import jsPDF from 'jspdf';
import { moodAnalyzerAgent } from './specializedAgents';
import { getRealMoodData, getRealChatData } from './realDataService';

interface ReportData {
  title: string;
  period: { start: Date; end: Date };
  userId: string;
  type: 'mood' | 'diary';
}

export class PDFReportGenerator {
  private doc: jsPDF;
  private currentY: number = 20;
  private pageHeight: number = 280;
  private margin: number = 20;

  constructor() {
    this.doc = new jsPDF();
  }

  private addHeader(title: string, subtitle: string) {
    // Logo placeholder (se reemplazará con el logo real)
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
      
      this.doc.text(`• ${item}`, this.margin + 5, this.currentY);
      this.currentY += 6;
    });

    this.currentY += 10;
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
      const analysis = await moodAnalyzerAgent.analyzeMood(moodData);

      // Generar PDF
      this.addHeader(
        'Reporte de Estado de Ánimo',
        `Período: ${data.period.start.toLocaleDateString('es-CO')} - ${data.period.end.toLocaleDateString('es-CO')}`
      );

      // Resumen ejecutivo
      this.addSection('Resumen Ejecutivo', [analysis.summary]);

      // Estadísticas básicas
      const avgMood = moodData.moodLogs.reduce((sum, log) => sum + log.mood, 0) / moodData.moodLogs.length;
      const minMood = Math.min(...moodData.moodLogs.map(log => log.mood));
      const maxMood = Math.max(...moodData.moodLogs.map(log => log.mood));

      this.addSection('Estadísticas del Período', [
        `Total de registros: ${moodData.moodLogs.length}`,
        `Estado de ánimo promedio: ${avgMood.toFixed(1)}/10`,
        `Estado de ánimo mínimo: ${minMood}/10`,
        `Estado de ánimo máximo: ${maxMood}/10`,
        `Tendencia: ${analysis.moodTrend === 'improving' ? 'Mejorando' : 
                    analysis.moodTrend === 'declining' ? 'Declinando' : 'Estable'}`
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

      // Recomendaciones
      if (analysis.recommendations.length > 0) {
        this.addSection('Recomendaciones', analysis.recommendations);
      }

      // Próximos pasos
      if (analysis.nextSteps.length > 0) {
        this.addSection('Próximos Pasos', analysis.nextSteps);
      }

      // Evaluación de riesgo
      const riskLevel = analysis.riskLevel === 'high' ? 'Alto' : 
                       analysis.riskLevel === 'medium' ? 'Medio' : 'Bajo';
      this.addSection('Evaluación de Riesgo', [
        `Nivel de riesgo: ${riskLevel}`,
        'Recomendación: ' + (analysis.riskLevel === 'high' ? 
          'Se recomienda consulta profesional inmediata' :
          analysis.riskLevel === 'medium' ? 
          'Se recomienda seguimiento regular y consulta profesional' :
          'Continúa con el seguimiento regular de tu bienestar')
      ]);

      // Disclaimer
      this.addSection('Importante', [
        'Este reporte es generado por inteligencia artificial y tiene fines informativos únicamente.',
        'No reemplaza la consulta con un profesional de salud mental.',
        'Si experimentas crisis emocionales, contacta inmediatamente a un profesional.',
        'Para emergencias, contacta la línea de crisis de salud mental en Colombia: 106'
      ]);

      this.addFooter();

    } catch (error) {
      console.error('Error generando reporte PDF:', error);
      throw error;
    }
  }

  async generateDiaryReport(data: ReportData): Promise<void> {
    try {
      // Obtener datos del diario (simulados por ahora)
      const diaryData = {
        entries: [
          {
            date: new Date(),
            content: 'Hoy me siento bien, tuve un buen día en el trabajo.',
            mood: 8,
            tags: ['trabajo', 'positivo']
          }
        ],
        period: data.period
      };

      // Analizar con IA (usando el analizador de estado de ánimo)
      const analysis = await moodAnalyzerAgent.analyzeMood({
        moodLogs: diaryData.entries.map(entry => ({
          mood: entry.mood,
          date: entry.date,
          notes: entry.content
        })),
        period: data.period
      });

      // Generar PDF
      this.addHeader(
        'Reporte de Diario Personal',
        `Período: ${data.period.start.toLocaleDateString('es-CO')} - ${data.period.end.toLocaleDateString('es-CO')}`
      );

      // Resumen del diario
      this.addSection('Resumen del Diario', [
        `Total de entradas: ${diaryData.entries.length}`,
        analysis.summary
      ]);

      // Análisis emocional
      this.addSection('Análisis Emocional', analysis.insights);

      // Patrones de escritura
      this.addSection('Patrones Identificados', analysis.patterns);

      // Recomendaciones
      this.addSection('Recomendaciones', analysis.recommendations);

      // Disclaimer
      this.addSection('Importante', [
        'Este análisis es generado por inteligencia artificial.',
        'Refleja patrones generales basados en tus entradas.',
        'Para análisis más profundos, consulta con un psicólogo.'
      ]);

      this.addFooter();

    } catch (error) {
      console.error('Error generando reporte de diario PDF:', error);
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
    console.error('Error generando reporte:', error);
    throw error;
  }
};
