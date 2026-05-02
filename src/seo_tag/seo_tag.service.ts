import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SeoTag } from './entities/seo_tag.entity';
import { CreateSeoTagDto } from './dto/create-seo_tag.dto';
import { UpdateSeoTagDto } from './dto/update-seo_tag.dto';
import { resolveActiveStatus } from '../auth/utils/cms-access.util';

@Injectable()
export class SeoTagService {
  constructor(
    @InjectRepository(SeoTag)
    private readonly seoTagRepository: Repository<SeoTag>,
  ) {}

  async create(createSeoTagDto: CreateSeoTagDto, user?: any): Promise<SeoTag> {
    const seoTag = this.seoTagRepository.create({
      ...createSeoTagDto,
      status: resolveActiveStatus(createSeoTagDto?.status || 'inactive', user),
    });
    return await this.seoTagRepository.save(seoTag);
  }

  async findAll(status?: string): Promise<SeoTag[]> {
    const whereCondition = status ? { status } : {};
    return await this.seoTagRepository.find({
      where: whereCondition,
      order: { id: 'DESC' },
    });
  }

  async findOne(id: number): Promise<SeoTag> {
    const record = await this.seoTagRepository.findOne({ where: { id } });
    if (!record) throw new NotFoundException(`SEO Tag with ID ${id} not found`);
    return record;
  }

  // 🌟 Smart matching to handle full URLs like "https://hcinterior.in"
  async findByPageName(page_name: string): Promise<SeoTag> {
    // Check if the requested route is the home page
    const isHome = page_name === '/' || page_name === '/home' || page_name === 'https://hcinterior.in' || page_name === 'https://hcinterior.in/';

    const queryBuilder = this.seoTagRepository.createQueryBuilder('seoTag')
      .where('seoTag.status = :status', { status: 'active' });

    if (isHome) {
      // For the home page, match any of these database variations
      queryBuilder.andWhere('(seoTag.page_name = :home1 OR seoTag.page_name = :home2 OR seoTag.page_name = :home3 OR seoTag.page_name = :home4)', {
        home1: '/',
        home2: '/home',
        home3: 'https://hcinterior.in',
        home4: 'https://hcinterior.in/'
      });
    } else {
      // For other pages, strip any domain just in case, and prepare variations
      const cleanPath = page_name.replace(/^https?:\/\/hcinterior\.in/, '');
      const withSlash = cleanPath.startsWith('/') ? cleanPath : `/${cleanPath}`;
      const withoutSlash = cleanPath.startsWith('/') ? cleanPath.substring(1) : cleanPath;
      const fullUrl = `https://hcinterior.in${withSlash}`;

      // Match /about-us OR about-us OR https://hcinterior.in/about-us
      queryBuilder.andWhere('(seoTag.page_name = :withSlash OR seoTag.page_name = :withoutSlash OR seoTag.page_name = :fullUrl)', {
        withSlash,
        withoutSlash,
        fullUrl
      });
    }

    const record = await queryBuilder.getOne();

    if (!record) throw new NotFoundException(`Active SEO Tag for page ${page_name} not found`);
    return record;
  }

  async update(id: number, updateSeoTagDto: UpdateSeoTagDto, user?: any): Promise<SeoTag> {
    const record = await this.findOne(id);
    Object.assign(record, {
      ...updateSeoTagDto,
      status:
        updateSeoTagDto?.status !== undefined
          ? resolveActiveStatus(updateSeoTagDto.status, user)
          : record.status,
    });
    return await this.seoTagRepository.save(record);
  }

  async remove(id: number): Promise<void> {
    const record = await this.findOne(id);
    await this.seoTagRepository.softDelete(id);
  }


  // Add this method anywhere inside the SeoTagService class
  async migrateLegacyData() {
    await this.seoTagRepository.query(`
      UPDATE seo_tag 
      SET meta_title = title 
      WHERE meta_title IS NULL AND title IS NOT NULL;
    `);
    
    await this.seoTagRepository.query(`
      UPDATE seo_tag 
      SET canonical_url = meta_can_tag 
      WHERE canonical_url IS NULL AND meta_can_tag IS NOT NULL;
    `);
    
    return { success: true, message: "All legacy SEO data successfully migrated!" };
  }
}