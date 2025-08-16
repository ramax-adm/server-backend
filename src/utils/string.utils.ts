import * as iconv from 'iconv-lite';
export class StringUtils {
  /**
   * Corrige strings que foram mal interpretadas (ex: Latin1 lidas como UTF-8)
   */
  static fixEncoding(value: string): string {
    const buffer = Buffer.from(value, 'binary'); // ou 'latin1' se necessário
    return iconv.decode(buffer, 'latin1'); // ou 'latin1'
  }
  static normalize(v?: string) {
    if (!v) return '';
    return v
      .toString()
      .trim()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
  }
  static tryRecoverString(corrupted: string) {
    const bytes = Uint8Array.from([...corrupted].map((c) => c.charCodeAt(0)));
    return bytes; // ou 'latin1'
  }
}
