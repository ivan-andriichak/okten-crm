import * as process from 'node:process';

import * as dotenv from 'dotenv';

import { Config } from './config.type';
import configuration from './configuration';

class ConfigStatic {
  public get(): Config {
    return {
      ...configuration(),
      mailer: {
        ...configuration().mailer,
        auth: {
          user: configuration().mailer.user,
          pass: configuration().mailer.pass,
          from: configuration().mailer.from,
        },
      },
    };
  }
}

const env = process.env.ENVIROMENT || 'local';
dotenv.config({ path: `environments/${env}.env` });
const ConfigStaticService = new ConfigStatic();
export { ConfigStaticService };
