import { Injectable } from '@nestjs/common';

@Injectable()
export class ReportsService {
  async findAll() {
    return [];
  }

  async findOne(id: string) {
    return { id, name: 'Sample Report' };
  }

  async create(data: any) {
    return { id: '1', ...data };
  }
}
