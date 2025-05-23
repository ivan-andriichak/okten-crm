import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCreateAdminPass1745567779246 implements MigrationInterface {
  name = 'AddCreateAdminPass1745567779246';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE \`users\` ADD \`passwordResetToken\` text NULL`);
    await queryRunner.query(`ALTER TABLE \`users\` ADD \`passwordResetExpires\` datetime NULL`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE \`users\` DROP COLUMN \`passwordResetExpires\``);
    await queryRunner.query(`ALTER TABLE \`users\` DROP COLUMN \`passwordResetToken\``);
  }
}
