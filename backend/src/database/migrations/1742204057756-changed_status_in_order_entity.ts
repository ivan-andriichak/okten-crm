import { MigrationInterface, QueryRunner } from 'typeorm';

export class ChangedStatusInOrderEntity1742204057756 implements MigrationInterface {
  name = 'ChangedStatusInOrderEntity1742204057756';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE \`orders\` DROP COLUMN \`status\``);
    await queryRunner.query(`ALTER TABLE \`orders\` ADD \`status\` varchar(15) NULL`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE \`orders\` DROP COLUMN \`status\``);
    await queryRunner.query(
      `ALTER TABLE \`orders\` ADD \`status\` enum ('In work', 'New', 'Agreed', 'Disagreed', 'Dubbing') NOT NULL DEFAULT 'New'`,
    );
  }
}
