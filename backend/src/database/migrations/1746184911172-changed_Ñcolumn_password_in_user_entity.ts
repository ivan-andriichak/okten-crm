import { MigrationInterface, QueryRunner } from 'typeorm';

export class Changed_ÑcolumnPasswordInUserEntity1746184911172 implements MigrationInterface {
  name = 'Changed_ÑcolumnPasswordInUserEntity1746184911172';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE \`orders\` DROP COLUMN \`status\``);
    await queryRunner.query(
      `ALTER TABLE \`orders\` ADD \`status\` enum ('In work', 'New', 'Agreed', 'Disagreed', 'Dubbing') NOT NULL DEFAULT 'New'`,
    );
    await queryRunner.query(`ALTER TABLE \`users\` CHANGE \`password\` \`password\` text NULL`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE \`users\` CHANGE \`password\` \`password\` text NOT NULL`);
    await queryRunner.query(`ALTER TABLE \`orders\` DROP COLUMN \`status\``);
    await queryRunner.query(`ALTER TABLE \`orders\` ADD \`status\` varchar(15) NULL`);
  }
}
