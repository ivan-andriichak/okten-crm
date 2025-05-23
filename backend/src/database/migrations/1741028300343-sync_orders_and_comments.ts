import { MigrationInterface, QueryRunner } from 'typeorm';

export class SyncOrdersAndComments1741028300343 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {}

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE orders ADD COLUMN utm VARCHAR(100) NULL`);
    await queryRunner.query(`ALTER TABLE orders ADD COLUMN msg TEXT NULL`);
    await queryRunner.query(`ALTER TABLE comments CHANGE COLUMN text message TEXT NOT NULL`);
    await queryRunner.query(`ALTER TABLE comments ADD COLUMN author TEXT NOT NULL`);
  }
}
