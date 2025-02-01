import { saveAs } from 'file-saver';

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

export async function exportToCSV(keyword: string, data: PPAItem[]) {
  try {
    // Prepare CSV content
    const rows = [
      ['Level', 'Question', 'Parent Question', 'Answer', 'Source URL', 'Domain'],
    ];

    // Level 1 items
    const level1Items = data.filter(item => !item.seed_question);
    level1Items.forEach(item => {
      rows.push([
        '1',
        item.title,
        keyword,
        item.expanded_element[0]?.description || '',
        item.expanded_element[0]?.url || '',
        item.expanded_element[0]?.domain || ''
      ]);
    });

    // Level 2 items
    const level2Items = data.filter(item => item.seed_question);
    level2Items.forEach(item => {
      rows.push([
        '2',
        item.title,
        item.seed_question || '',
        item.expanded_element[0]?.description || '',
        item.expanded_element[0]?.url || '',
        item.expanded_element[0]?.domain || ''
      ]);
    });

    // Convert to CSV string
    const csvContent = rows
      .map(row => row.map(cell => `"${cell.replace(/"/g, '""')}"`).join(','))
      .join('\n');

    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
    saveAs(blob, `ppa-${keyword.toLowerCase().replace(/\s+/g, '-')}.csv`);
  } catch (error) {
    console.error('Error generating CSV:', error);
    throw new Error('Failed to generate CSV');
  }
}
