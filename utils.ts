export function formatMoney(amount: number): string {
  return amount.toLocaleString('ro-RO', {
    minimumFractionDigits: 2, 
    maximumFractionDigits: 2
  }) + ' RON';
}