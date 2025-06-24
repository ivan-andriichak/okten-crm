import { MigrationInterface, QueryRunner } from "typeorm";

export class ChangedOrderEntity1750750140600 implements MigrationInterface {
    name = 'ChangedOrderEntity1750750140600'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`orders\` DROP COLUMN \`course_format\``);
        await queryRunner.query(`ALTER TABLE \`orders\` ADD \`course_format\` enum ('static', 'online') NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`orders\` DROP COLUMN \`course_type\``);
        await queryRunner.query(`ALTER TABLE \`orders\` ADD \`course_type\` enum ('minimal', 'pro', 'premium', 'incubator', 'vip') NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`orders\` DROP COLUMN \`status\``);
        await queryRunner.query(`ALTER TABLE \`orders\` ADD \`status\` enum ('In work', 'New', 'Agree', 'Disagree', 'Dubbing') NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`orders\` DROP COLUMN \`status\``);
        await queryRunner.query(`ALTER TABLE \`orders\` ADD \`status\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`orders\` DROP COLUMN \`course_type\``);
        await queryRunner.query(`ALTER TABLE \`orders\` ADD \`course_type\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`orders\` DROP COLUMN \`course_format\``);
        await queryRunner.query(`ALTER TABLE \`orders\` ADD \`course_format\` varchar(255) NULL`);
    }

}
