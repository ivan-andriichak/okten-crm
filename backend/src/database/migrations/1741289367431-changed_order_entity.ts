import { MigrationInterface, QueryRunner } from 'typeorm';

export class ChangedOrderEntity1741289367431 implements MigrationInterface {
  name = 'ChangedOrderEntity1741289367431';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE \`orders\` CHANGE \`groupEntity\` \`group\` varchar(50) NULL`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE \`orders\` CHANGE \`group\` \`groupEntity\` varchar(50) NULL`);
  }
}
