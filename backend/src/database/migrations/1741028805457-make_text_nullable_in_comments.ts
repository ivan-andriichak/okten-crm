import { MigrationInterface, QueryRunner } from 'typeorm';

export class MakeTextNullableInComments1741028805457 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {}

  public async down(queryRunner: QueryRunner): Promise<void> {}
}
