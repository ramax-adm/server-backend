import { createWriteStream } from 'fs';
import { join } from 'path';
import { format } from 'fast-csv';
import { Writable } from 'stream';

export class FileUtils {
  static async toCsv<T>(data: T[]): Promise<Buffer> {
    // Cria o stream de saída em memória
    const chunks: Buffer[] = [];
    const writable = new Writable({
      write(chunk, _enc, callback) {
        chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
        callback();
      },
    });

    // Cria o CSV stream
    const csvStream = format({ headers: true, delimiter: ';' });
    csvStream.pipe(writable);

    // Escreve cada item
    for (const item of data) {
      csvStream.write(item);
    }
    csvStream.end();

    // Aguarda até o stream fechar para concatenar tudo
    await new Promise<void>((resolve, reject) => {
      writable.on('finish', () => resolve());
      writable.on('error', reject);
      csvStream.on('error', reject);
    });

    // Retorna o Buffer completo
    return Buffer.concat(chunks);
  }
}
