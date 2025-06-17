import * as path from 'node:path';

import * as dotenv from 'dotenv';
import { DataSource } from 'typeorm';

import getter from './src/config/configuration';

const ENV_MODE = process.env.NODE_ENV || 'local'; // default: local
const envPath = path.resolve(__dirname, `./environments/${ENV_MODE}.env`);
dotenv.config({ path: envPath });

const databaseConfig = getter().mysql;

console.log(`ENV mode: ${ENV_MODE}`);
console.log('ENV:', {
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  pass: process.env.MYSQL_PASSWORD,
});

export default new DataSource({
  type: 'mysql',
  host: databaseConfig.host,
  port: databaseConfig.port,
  username: databaseConfig.user,
  password: databaseConfig.password,
  database: databaseConfig.dbName,
  entities: [path.join(process.cwd(), 'src', 'database', 'entities', '*.entity.ts')],
  migrations: [path.join(process.cwd(), 'src', 'database', 'migrations', '*.ts')],
  synchronize: false,
  dropSchema: false,
});
