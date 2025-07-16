export class StringUtils {
  static normalize(v?: string) {
    if (!v) return '';
    return v
      .toString()
      .trim()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
  }
}
