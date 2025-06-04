export type Config = {
  app: AppConfig;
  mysql: MysqlConfig;
  redis: RedisConfig;
  sentry: SentryConfig;
  jwt: JwtConfig;
  aws: AwsConfig;
  mailer: NodeMailerConfig;
};

export type AppConfig = {
  port: number;
  host: string;
  appUrl: string;
};

export type MysqlConfig = {
  port: number;
  host: string;
  user: string;
  rootPassword: string;
  password: string;
  dbName: string;
};

export type RedisConfig = {
  port: number;
  host: string;
};

export type SentryConfig = {
  dsn: string;
  env: string;
  debug: boolean;
};

export type JwtConfig = {
  accessSecret: string;
  refreshSecret: string;
  accessExpiresIn: number;
  refreshExpiresIn: number;
};

export type AwsConfig = {
  region: string;
  accessKeyId: string;
  secretAccessKey: string;
  bucketName: string;
  bucketUrl: string;
  endpoint: string;
};

export type NodeMailerConfig = {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  pass: string;
  from: string;
};
