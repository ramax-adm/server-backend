import * as dateFns from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { NumberUtils } from './number.utils';

type DateFormat = 'datetime' | 'date' | 'date-minified' | 'international-date';

export class DateUtils {
  static secondsToHours(seconds: number) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = NumberUtils.nb0(seconds % 60);

    return [
      hours.toString().padStart(2, '0'),
      minutes.toString().padStart(2, '0'),
      remainingSeconds.toString().padStart(2, '0'),
    ].join(':');
  }

  static parse(dateString: string, format: string) {
    if (!dateString) {
      return null;
    }
    const parsedDate = dateFns.parse(dateString, format, new Date(), {
      locale: ptBR,
    });
    return parsedDate;
  }

  static getFileDate(date: Date = new Date()) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  }
}
