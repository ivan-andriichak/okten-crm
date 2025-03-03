import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddNotNecessarilyUserRole1736507635040
  implements MigrationInterface
{
  name = 'AddNotNecessarilyUserRole1736507635040';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE \`users\` DROP COLUMN \`last_login\``);
    await queryRunner.query(
      `ALTER TABLE \`users\` ADD \`last_login\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)`,
    );
    await queryRunner.query(
      `ALTER TABLE \`orders\` ADD CONSTRAINT \`FK_c23c7d2f3f13590a845802393d5\` FOREIGN KEY (\`manager_id\`) REFERENCES \`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`orders\` DROP FOREIGN KEY \`FK_c23c7d2f3f13590a845802393d5\``,
    );
    await queryRunner.query(`ALTER TABLE \`users\` DROP COLUMN \`last_login\``);
    await queryRunner.query(
      `ALTER TABLE \`users\` ADD \`last_login\` timestamp(0) NOT NULL DEFAULT CURRENT_TIMESTAMP`,
    );
  }
}
