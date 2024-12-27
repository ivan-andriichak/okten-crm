import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { DataSource } from 'typeorm';

import { AdminService } from '../services/admin.service';

@Injectable()
export class CreateDefaultAdminHook implements OnApplicationBootstrap {
  constructor(
    private readonly adminService: AdminService,
    private readonly dataSource: DataSource
  ) {}

  async onApplicationBootstrap(): Promise<void> {
    // Перевірка, чи база готова
    if (!this.dataSource.isInitialized) {
      await this.dataSource.initialize();
    }
    await this.adminService.createDefaultAdmin();
  }
}
