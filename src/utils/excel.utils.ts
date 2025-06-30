import * as ExcelJS from 'exceljs';
import * as dateFns from 'date-fns';
export class ExcelUtils {
  static parseDate(value: ExcelJS.CellValue): Date {
    if (value instanceof Date) {
      return dateFns.add(value, {
        hours: 3,
      });
    }

    if (typeof value === 'object' && value && 'result' in value) {
      return dateFns.add(new Date(value.result as string | number), {
        hours: 3,
      });
    }

    if (typeof value === 'string') {
      const parts = value.split('/');
      if (parts.length === 3) {
        const [day, month, year] = parts.map(Number);
        return new Date(year, month - 1, day);
      }
      return new Date(value);
    }

    return new Date(); // fallback
  }

  static parseHours(number: ExcelJS.CellValue) {
    if (number?.toString().includes('-') && number?.toString().includes(':')) {
      return number.toString().concat(':00');
    }

    if (typeof number !== 'number') {
      return null;
    }

    const totalSeconds = Math.round(number * 24 * 3600);
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    return [h, m, s].map((u) => String(u).padStart(2, '0')).join(':');
  }
}
