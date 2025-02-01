import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

interface PPAItem {
  title: string;
  seed_question: string | null;
  expanded_element: Array<{
    description: string;
    url: string;
    title: string;
    domain: string;
  }>;
}

export async function exportToPDF(
  keyword: string,
  data: PPAItem[],
  viewMode: 'tree' | 'org'
) {
  try {
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 20;
    let yPos = margin;

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
    pdf.text(`People Also Ask: ${keyword}`, margin, yPos);
    yPos += 10;

    pdf.setFontSize(10);
    pdf.setTextColor(107, 114, 128); // text-gray-500
    pdf.text(`Generated on ${new Date().toLocaleDateString()}`, margin, yPos);
    yPos += 15;

    // Add questions and answers
    pdf.setFontSize(12);
    pdf.setTextColor(31, 41, 55);

    // Level 1 questions
    const level1Items = data.filter(item => !item.seed_question);
    const level2Items = data.filter(item => item.seed_question);

    level1Items.forEach((item, index) => {
      checkNewPage(40);

      // Add question
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      const question = `${index + 1}. ${item.title}`;
      pdf.text(question, margin, yPos);
      yPos += 8;

      // Add answer
      if (item.expanded_element[0]?.description) {
        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'normal');
        const answer = pdf.splitTextToSize(
          item.expanded_element[0].description,
          pageWidth - (2 * margin)
        );
        
        if (checkNewPage(answer.length * 6)) {
          yPos += 8;
        }
        
        pdf.text(answer, margin, yPos);
        yPos += (answer.length * 6) + 4;

        // Add source
        if (item.expanded_element[0].domain) {
          pdf.setTextColor(59, 130, 246); // text-blue-600
          pdf.text(
            `Source: ${item.expanded_element[0].domain}`,
            margin,
            yPos
          );
          pdf.setTextColor(31, 41, 55);
          yPos += 8;
        }
      }

      // Add related questions (level 2)
      const relatedQuestions = level2Items.filter(
        l2 => l2.seed_question === item.title
      );

      if (relatedQuestions.length > 0) {
        yPos += 4;
        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Related Questions:', margin + 10, yPos);
        yPos += 6;

        relatedQuestions.forEach((relatedItem, relatedIndex) => {
          checkNewPage(30);

          // Add related question
          pdf.setFont('helvetica', 'normal');
          pdf.text(
            `${index + 1}.${relatedIndex + 1}. ${relatedItem.title}`,
            margin + 10,
            yPos
          );
          yPos += 6;

          // Add related answer
          if (relatedItem.expanded_element[0]?.description) {
            const relatedAnswer = pdf.splitTextToSize(
              relatedItem.expanded_element[0].description,
              pageWidth - (2 * margin) - 10
            );
            
            if (checkNewPage(relatedAnswer.length * 6)) {
              yPos += 6;
            }
            
            pdf.text(relatedAnswer, margin + 10, yPos);
            yPos += (relatedAnswer.length * 6) + 4;

            // Add source
            if (relatedItem.expanded_element[0].domain) {
              pdf.setTextColor(59, 130, 246);
              pdf.text(
                `Source: ${relatedItem.expanded_element[0].domain}`,
                margin + 10,
                yPos
              );
              pdf.setTextColor(31, 41, 55);
              yPos += 8;
            }
          }
        });
      }

      yPos += 10;
    });

    // Save the PDF
    pdf.save(`ppa-${keyword.toLowerCase().replace(/\s+/g, '-')}.pdf`);
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw new Error('Failed to generate PDF');
  }
}
