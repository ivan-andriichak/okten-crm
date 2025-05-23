import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddGroupsTable1741272811373 implements MigrationInterface {
  name = 'AddGroupsTable1741272811373';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE \`orders\` CHANGE \`group\` \`groupEntity\` varchar(50) NULL`);
    await queryRunner.query(`ALTER TABLE \`comments\` CHANGE \`text\` \`text\` text NULL`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE \`comments\` CHANGE \`text\` \`text\` text NOT NULL`);
    await queryRunner.query(`ALTER TABLE \`orders\` CHANGE \`groupEntity\` \`group\` varchar(50) NULL`);
  }
}
