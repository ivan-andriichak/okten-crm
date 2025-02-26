"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("node:path");
const dotenv = require("dotenv");
const typeorm_1 = require("typeorm");
const configuration_1 = require("./src/config/configuration");
dotenv.config({ path: './environments/local.env' });
const databaseConfig = (0, configuration_1.default)().mysql;
exports.default = new typeorm_1.DataSource({
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
console.log('Database config:', databaseConfig);
//# sourceMappingURL=config.js.map