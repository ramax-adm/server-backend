import { Provider } from '@nestjs/common';
import { OracleService } from '../oracle-db.service';

export const ORACLE_DB_PROVIDER = 'ORACLE DB SERVICE';
export const OracleDbProvider: Provider = {
  provide: ORACLE_DB_PROVIDER,
  useFactory: () => {
    return new OracleService({
      user: 'LSANTANA',
      password: 'lucas1.6rS',
      connectString: 'RAMAX',
      tnsAdmin: 'C:\\oracle\\product\\10.2.0\\client_1\\NETWORK\\ADMIN',
      libDir: 'C:\\oracle\\instantclient_19_27',
    });
  },
};
