import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LookMenu } from './entities/look_menu.entity';
import { CreateLookMenuDto } from './dto/create-look_menu.dto';
import { UpdateLookMenuDto } from './dto/update-look_menu.dto';

@Injectable()
export class LookMenuService {
  constructor(
    @InjectRepository(LookMenu)
    private readonly lookMenuRepository: Repository<LookMenu>,
  ) {}

  // ✅ Create a new LookMenu record
  async create(createLookMenuDto: CreateLookMenuDto): Promise<LookMenu> {
    const lookMenu = this.lookMenuRepository.create(createLookMenuDto);
    return await this.lookMenuRepository.save(lookMenu);
  }

  // ✅ Find all records (optional filter by status)
  async findAll(status?: string): Promise<LookMenu[]> {
    const whereCondition = status ? { status } : {};
    return await this.lookMenuRepository.find({
      where: whereCondition,
      order: { id: 'DESC' },
    });
  }

  // ✅ Find a single record by ID
  async findOne(id: number): Promise<LookMenu> {
    const record = await this.lookMenuRepository.findOne({ where: { id } });
    if (!record) throw new NotFoundException(`LookMenu with ID ${id} not found`);
    return record;
  }

  // ✅ Update a record and return updated data
  async update(id: number, updateLookMenuDto: UpdateLookMenuDto): Promise<LookMenu> {
    const record = await this.findOne(id);
    Object.assign(record, updateLookMenuDto);
    return await this.lookMenuRepository.save(record);
  }

  // ✅ Soft delete a record (marks as deleted but keeps it in DB)
  async remove(id: number): Promise<void> {
    const record = await this.findOne(id);
    await this.lookMenuRepository.softDelete(id);
  }
}


