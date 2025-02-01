import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { formatNumber } from './format';

// Optimize image quality vs size
const CHART_SCALE = 1.5;  // Reduced from 2 to 1.5
const CHART_QUALITY = 0.8; // Added quality parameter

interface DomainMetrics {
  domainRank: number;
  organicTraffic: number;
  keywords: number;
  backlinks: number;
  referringDomains: number;
  brokenPages: number;
  brokenBacklinks: number;
  ips: number;
  subnets: number;
}

export async function exportDomainOverviewPDF(
  domain: string,
  metrics: DomainMetrics,
  chartsRef: React.RefObject<HTMLDivElement>
) {
  try {
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 20;
    let yPos = margin;

    // Optimize PDF settings
    pdf.setProperties({
      compress: true,
      optimization: true
    });

    // Helper function to check if we need a new page
    const checkNewPage = (height: number) => {
      if (yPos + height > pageHeight - margin) {
        pdf.addPage();
        yPos = margin;
        return true;
      }
      return false;
    };

    // Add title and date
    pdf.setFontSize(24);
    pdf.setTextColor(31, 41, 55); // text-gray-900
    pdf.text(`Domain Overview: ${domain}`, margin, yPos);
    yPos += 10;

    pdf.setFontSize(10);
    pdf.setTextColor(107, 114, 128); // text-gray-500
    pdf.text(`Generated on ${new Date().toLocaleDateString()}`, margin, yPos);
    yPos += 15;

    // Add metrics section with improved layout
    const metricsData = [
      { label: 'Domain Rank', value: metrics.domainRank },
      { label: 'Organic Traffic', value: formatNumber(metrics.organicTraffic) },
      { label: 'Keywords', value: formatNumber(metrics.keywords) },
      { label: 'Backlinks', value: formatNumber(metrics.backlinks) },
      { label: 'Referring Domains', value: formatNumber(metrics.referringDomains) },
      { label: 'Broken Pages', value: formatNumber(metrics.brokenPages) },
      { label: 'Broken Backlinks', value: formatNumber(metrics.brokenBacklinks) },
      { label: 'IPs', value: formatNumber(metrics.ips) },
      { label: 'Subnets', value: formatNumber(metrics.subnets) }
    ];

    // Create metrics grid (3 columns)
    const colWidth = (pageWidth - 2 * margin) / 3;
    const rowHeight = 20;
    
    metricsData.forEach((metric, index) => {
      const col = index % 3;
      const row = Math.floor(index / 3);
      const x = margin + (col * colWidth);
      const y = yPos + (row * rowHeight);

      // Draw box with improved styling
      pdf.setFillColor(249, 250, 251); // bg-gray-50
      pdf.setDrawColor(229, 231, 235); // border-gray-200
      pdf.roundedRect(x, y, colWidth - 5, rowHeight - 2, 2, 2, 'FD');

      // Add metric label
      pdf.setTextColor(107, 114, 128); // text-gray-500
      pdf.setFontSize(8);
      pdf.text(metric.label, x + 5, y + 6);

      // Add metric value with improved styling
      pdf.setTextColor(31, 41, 55); // text-gray-900
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.text(metric.value.toString(), x + 5, y + 15);
    });

    yPos += (Math.ceil(metricsData.length / 3) * rowHeight) + 15;

    // Add section divider
    const addSectionDivider = (text: string, color: string) => {
      pdf.setDrawColor(color);
      pdf.line(margin, yPos, pageWidth - margin, yPos);
      yPos += 5;
      pdf.setFontSize(10);
      pdf.setTextColor(107, 114, 128);
      pdf.text(text, margin, yPos);
      yPos += 10;
    };

    addSectionDivider('Organic Research', '#0281DF');

    // Add charts if available
    if (chartsRef.current) {
      // Helper function to capture chart
      const captureChart = async (element: Element) => {
        const canvas = await html2canvas(element as HTMLElement, {
          scale: CHART_SCALE,
          logging: false,
          useCORS: true,
          allowTaint: true,
          backgroundColor: '#ffffff'
        });

        return canvas.toDataURL('image/jpeg', CHART_QUALITY);
      };

      // Process charts in specific order
      const sections = [
        { selector: '.traffic-distribution', title: 'Traffic Distribution' },
        { selector: '.position-distribution', title: 'Position Distribution' },
        { selector: '.organic-keywords', title: 'Organic Keywords Distribution' },
        { selector: '.performance-metrics', title: 'Performance Metrics' },
        { selector: '.competitive-map', title: 'Competitive Positioning Map' }
      ];
      
      for (const section of sections) {
        const element = chartsRef.current.querySelector(section.selector);
        if (!element) continue;

        const imgData = await captureChart(element);
        const imgWidth = pageWidth - (2 * margin);
        const imgHeight = (element.clientHeight * imgWidth) / element.clientWidth;

        // Check if we need a new page
        if (checkNewPage(imgHeight + 20)) {
          yPos += 10;
        }

        // Add section title
        pdf.setFontSize(14);
        pdf.setTextColor(31, 41, 55);
        pdf.setFont('helvetica', 'bold');
        pdf.text(section.title, margin, yPos);
        yPos += 8;

        // Add chart image
        pdf.addImage(imgData, 'PNG', margin, yPos, imgWidth, imgHeight);
        yPos += imgHeight + 15;
      }

      // Add backlinks section divider
      addSectionDivider('Backlinks', '#AB6CFE');

      // Process backlinks charts
      const backlinkSections = [
        { selector: '.backlinks-history', title: 'Backlinks History' },
        { selector: '.referring-domains', title: 'Referring Domains' },
        { selector: '.backlinks-gains-losses', title: 'New and Lost Backlinks' },
        { selector: '.referring-domains-gains-losses', title: 'New and Lost Referring Domains' }
      ];

      for (const section of backlinkSections) {
        const element = chartsRef.current.querySelector(section.selector);
        if (!element) continue;

        const imgData = await captureChart(element);
        const imgWidth = pageWidth - (2 * margin);
        const imgHeight = (element.clientHeight * imgWidth) / element.clientWidth;

        if (checkNewPage(imgHeight + 20)) {
          yPos += 10;
        }

        pdf.setFontSize(14);
        pdf.setTextColor(31, 41, 55);
        pdf.setFont('helvetica', 'bold');
        pdf.text(section.title, margin, yPos);
        yPos += 8;

        pdf.addImage(imgData, 'PNG', margin, yPos, imgWidth, imgHeight);
        yPos += imgHeight + 15;
      }
    }

    // Add tables
    const tables = chartsRef.current?.querySelectorAll('table');
    if (tables) {
      for (const table of Array.from(tables)) {
        const canvas = await html2canvas(table as HTMLElement, {
          scale: CHART_SCALE,
          logging: false,
          useCORS: true,
          allowTaint: true,
          backgroundColor: '#ffffff'
        });

        const imgData = canvas.toDataURL('image/jpeg', CHART_QUALITY);
        const imgWidth = pageWidth - (2 * margin);
        const imgHeight = (canvas.height * imgWidth) / canvas.width;

        // Check if we need a new page
        if (checkNewPage(imgHeight + 20)) {
          yPos += 10;
        }

        // Add table title if available
        const tableContainer = table.closest('.bg-white');
        const title = tableContainer?.querySelector('h2')?.textContent;
        if (title) {
          pdf.setFontSize(14);
          pdf.setTextColor(31, 41, 55);
          pdf.setFont('helvetica', 'bold');
          pdf.text(title, margin, yPos);
          yPos += 8;
        }

        // Add table image
        pdf.addImage(imgData, 'PNG', margin, yPos, imgWidth, imgHeight);
        yPos += imgHeight + 15;
      }
    }

    // Add footer with page numbers
    const totalPages = pdf.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      pdf.setPage(i);
      pdf.setFontSize(8);
      pdf.setTextColor(156, 163, 175); // text-gray-400
      pdf.text(
        `Page ${i} of ${totalPages}`,
        pageWidth / 2,
        pageHeight - 10,
        { align: 'center' }
      );
    }

    // Save the PDF
    pdf.save(`${domain}-overview.pdf`);
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw new Error('Failed to generate PDF');
  }
}
