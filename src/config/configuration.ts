import * as process from 'node:process';

import { Config } from './config.type';

export default (): Config => ({
  app: {
    port: Number(process.env.APP_PORT) || 3001,
    host: process.env.APP_HOST || 'localhost',
  },
  mysql: {
    port: Number(process.env.MYSQL_PORT),
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    dbName: process.env.MYSQL_DATABASE,
  },
  redis: {
    port: Number(process.env.REDIS_PORT),
    host: process.env.REDIS_HOST,
    password: process.env.REDIS_PASSWORD,
  },
  sentry: {
    dsn: process.env.SENTRY_DSN,
    env: process.env.SENTRY_ENV,
    debug: process.env.SENTRY_DEBUG === 'true',
  },
  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET,
    accessExpiresIn: Number(process.env.JWT_ACCESS_EXPIRES_IN),
    refreshSecret: process.env.JWT_REFRESH_SECRET,
    refreshExpiresIn: Number(process.env.JWT_REFRESH_EXPIRES_IN),
  },
  aws: {
    region: process.env.AWS_S3_REGION,
    accessKeyId: process.env.AWS_S3_ACCESS_KEY,
    secretAccessKey: process.env.AWS_S3_SECRET_KEY,
    bucketName: process.env.AWS_S3_BUCKET_NAME,
    bucketUrl: process.env.AWS_S3_BUCKET_URL,
    endpoint: process.env.AWS_S3_ENDPOINT,
  },
});
