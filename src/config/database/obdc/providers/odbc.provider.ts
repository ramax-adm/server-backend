import { Provider } from '@nestjs/common';
import { OdbcService } from '../odbc.service';

export const OdbcProvider: Provider = {
  provide: 'ODBC SERVICE',
  useFactory: () => {
    return new OdbcService({
      dsn: 'ramax',
      user: 'LSANTANA',
      password: 'lucas1.6rS',
    });
  },
};
