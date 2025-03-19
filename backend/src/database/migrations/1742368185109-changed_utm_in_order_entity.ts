import { MigrationInterface, QueryRunner } from "typeorm";

export class ChangedUtmInOrderEntity1742368185109 implements MigrationInterface {
    name = 'ChangedUtmInOrderEntity1742368185109'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`comments\` DROP COLUMN \`utm\``);
        await queryRunner.query(`ALTER TABLE \`orders\` ADD \`utm\` varchar(100) NULL`);
        await queryRunner.query(`ALTER TABLE \`orders\` ADD \`msg\` varchar(100) NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`orders\` DROP COLUMN \`msg\``);
        await queryRunner.query(`ALTER TABLE \`orders\` DROP COLUMN \`utm\``);
        await queryRunner.query(`ALTER TABLE \`comments\` ADD \`utm\` text NULL`);
    }

}
