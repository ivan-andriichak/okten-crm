import { MigrationInterface, QueryRunner } from "typeorm";

export class ChangedOrderEntity1750709479527 implements MigrationInterface {
    name = 'ChangedOrderEntity1750709479527'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`orders\` CHANGE \`course_format\` \`course_format\` enum ('static', 'online') NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`orders\` CHANGE \`course_type\` \`course_type\` enum ('minimal', 'pro', 'premium', 'incubator', 'vip') NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`orders\` CHANGE \`course_type\` \`course_type\` enum ('minimal', 'pro', 'premium', 'incubator', 'vip') NULL`);
        await queryRunner.query(`ALTER TABLE \`orders\` CHANGE \`course_format\` \`course_format\` enum ('static', 'online') NULL`);
    }

}
