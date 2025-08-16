import { Provider } from '@nestjs/common';
import { OdbcService } from '../odbc.service';

export const ODBC_PROVIDER = 'ODBC SERVICE';
export const OdbcProvider: Provider = {
  provide: ODBC_PROVIDER,
  useFactory: () => {
    return new OdbcService({
      dsn: 'ramax',
      user: 'LSANTANA',
      password: 'lucas1.6rS',
      charset: 'WE8ISO8859P1',
    });
  },
};
