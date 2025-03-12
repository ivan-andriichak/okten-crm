import { MigrationInterface, QueryRunner } from "typeorm";

export class ChangedIdOrderEntity1741781921919 implements MigrationInterface {
    name = 'ChangedIdOrderEntity1741781921919'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`comments\` DROP FOREIGN KEY \`FK_9bb41adf4431f6de42c79c4d305\``);
        await queryRunner.query(`ALTER TABLE \`orders\` DROP PRIMARY KEY`);
        await queryRunner.query(`ALTER TABLE \`orders\` DROP COLUMN \`id\``);
        await queryRunner.query(`ALTER TABLE \`orders\` ADD \`id\` int NOT NULL PRIMARY KEY AUTO_INCREMENT`);
        await queryRunner.query(`ALTER TABLE \`orders\` CHANGE \`phone\` \`phone\` varchar(13) NULL`);
        await queryRunner.query(`ALTER TABLE \`comments\` DROP COLUMN \`order_id\``);
        await queryRunner.query(`ALTER TABLE \`comments\` ADD \`order_id\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`comments\` ADD CONSTRAINT \`FK_9bb41adf4431f6de42c79c4d305\` FOREIGN KEY (\`order_id\`) REFERENCES \`orders\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`comments\` DROP FOREIGN KEY \`FK_9bb41adf4431f6de42c79c4d305\``);
        await queryRunner.query(`ALTER TABLE \`comments\` DROP COLUMN \`order_id\``);
        await queryRunner.query(`ALTER TABLE \`comments\` ADD \`order_id\` varchar(36) NULL`);
        await queryRunner.query(`ALTER TABLE \`orders\` CHANGE \`phone\` \`phone\` varchar(13) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`orders\` DROP COLUMN \`id\``);
        await queryRunner.query(`ALTER TABLE \`orders\` ADD \`id\` varchar(36) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`orders\` ADD PRIMARY KEY (\`id\`)`);
        await queryRunner.query(`ALTER TABLE \`comments\` ADD CONSTRAINT \`FK_9bb41adf4431f6de42c79c4d305\` FOREIGN KEY (\`order_id\`) REFERENCES \`orders\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
