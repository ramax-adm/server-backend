import * as dateFns from 'date-fns';
import { eachDayOfInterval, isWithinInterval } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { NumberUtils } from './number.utils';
import { format as formatDate, toZonedTime } from 'date-fns-tz';

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
}
