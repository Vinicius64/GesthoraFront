// Função para converter uma string de data (YYYY-MM-DD ou ISO) para GMT-3 (Brasília)
export function toGMT3DateString(dateInput: string | Date): string {
  let date: Date;
  if (typeof dateInput === 'string') {
    // Se vier só a data (YYYY-MM-DD), cria como local e ajusta para GMT-3
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateInput)) {
      const [ano, mes, dia] = dateInput.split('-').map(Number);
      date = new Date(Date.UTC(ano, mes - 1, dia, 3, 0, 0)); // 03:00 UTC = 00:00 GMT-3
    } else {
      date = new Date(dateInput);
    }
  } else {
    date = dateInput;
  }
  // Ajusta para GMT-3
  date.setHours(date.getHours() - 3);
  return date.toISOString().slice(0, 19) + 'Z';
} 