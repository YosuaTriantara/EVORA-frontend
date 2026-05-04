export interface CsvColumn<T> {
  key: keyof T | string;
  header: string;
  getValue?: (row: T) => string;
}

export function exportToCSV<T extends Record<string, unknown>>(
  data: T[],
  columns: CsvColumn<T>[],
  filename: string
): void {
  const escape = (val: unknown): string => {
    const str = String(val ?? '').replace(/"/g, '""');
    return `"${str}"`;
  };

  const header = columns.map(c => escape(c.header)).join(',');
  const rows = data.map(row =>
    columns.map(c => {
      const val = c.getValue ? c.getValue(row) : String(row[c.key as keyof T] ?? '');
      return escape(val);
    }).join(',')
  );

  const csv = [header, ...rows].join('\n');
  // BOM for correct UTF-8 encoding in Excel
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${filename}-${new Date().toISOString().split('T')[0]}.csv`;
  a.setAttribute('target', '_blank'); // Safari compatibility
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
