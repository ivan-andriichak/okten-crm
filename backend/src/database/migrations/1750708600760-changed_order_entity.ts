import { MigrationInterface, QueryRunner } from "typeorm";

export class ChangedOrderEntity1750708600760 implements MigrationInterface {
    name = 'ChangedOrderEntity1750708600760'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`orders\` CHANGE \`course_format\` \`course_format\` enum ('static', 'online') NULL`);
        await queryRunner.query(`ALTER TABLE \`orders\` CHANGE \`course_type\` \`course_type\` enum ('minimal', 'pro', 'premium', 'incubator', 'vip') NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`orders\` CHANGE \`course_type\` \`course_type\` enum ('minimal', 'pro', 'premium', 'incubator', 'vip') NOT NULL DEFAULT 'minimal'`);
        await queryRunner.query(`ALTER TABLE \`orders\` CHANGE \`course_format\` \`course_format\` enum ('static', 'online') NOT NULL DEFAULT 'static'`);
    }

}
