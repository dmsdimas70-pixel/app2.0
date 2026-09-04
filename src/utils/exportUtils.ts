import { CustomerInteraction } from '../types';
import { STATUS_CONFIG } from './defaults';

export function exportInteractionsToCSV(
  interactions: CustomerInteraction[],
  filename: string = 'relatorio-atendimentos-moveis.csv'
): void {
  if (!interactions || interactions.length === 0) {
    alert('Não há dados para exportar no período selecionado.');
    return;
  }

  const headers = [
    'ID',
    'Data',
    'Horário',
    'Cliente',
    'Vendedora',
    'Origem do Atendimento',
    'Campanha',
    'Produto / Móvel de Interesse',
    'Status Atual',
    'Valor da Venda (R$)',
    'Produto Vendido',
    'Observações',
  ];

  const escapeCSV = (str: string | number | undefined | null): string => {
    if (str === undefined || str === null) return '""';
    const clean = String(str).replace(/"/g, '""');
    return `"${clean}"`;
  };

  const rows = interactions.map((i) => {
    const statusLabel = STATUS_CONFIG[i.status]?.label || i.status;
    const saleValFormatted = i.saleValue !== undefined ? i.saleValue.toFixed(2).replace('.', ',') : '';
    return [
      escapeCSV(i.id),
      escapeCSV(i.date),
      escapeCSV(i.time),
      escapeCSV(i.customerName || 'Cliente Balcão'),
      escapeCSV(i.sellerName || '-'),
      escapeCSV(i.origin),
      escapeCSV(i.campaign),
      escapeCSV(i.product),
      escapeCSV(statusLabel),
      escapeCSV(saleValFormatted),
      escapeCSV(i.productSold || ''),
      escapeCSV(i.notes || ''),
    ].join(';');
  });

  const csvContent = '\uFEFF' + [headers.join(';'), ...rows].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function printExecutiveReport(): void {
  window.print();
}
