import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CmsPage } from './entities/cms-page.entity';
import { CreateCmsPageDto } from './dto/create-cms-page.dto';

@Injectable()
export class CmsPagesService {
    constructor(
        @InjectRepository(CmsPage)
        private readonly cmsPageRepository: Repository<CmsPage>,
    ) {}

    async create(createCmsPageDto: CreateCmsPageDto) {
        const newPage = this.cmsPageRepository.create(createCmsPageDto);
        return await this.cmsPageRepository.save(newPage);
    }

    async findAll() {
        return await this.cmsPageRepository.find({
            order: { created_at: 'DESC' }
        });
    }

    async findOne(id: number) {
        const page = await this.cmsPageRepository.findOne({ where: { id } });
        if (!page) throw new NotFoundException(`Page with ID ${id} not found`);
        return page;
    }

    async update(id: number, updateData: any) {
        const page = await this.findOne(id);
        Object.assign(page, updateData);
        return await this.cmsPageRepository.save(page);
    }

    async updateSeoContent(id: number, seo_content: any) {
        const page = await this.findOne(id);
        page.seo_content = seo_content;
        return await this.cmsPageRepository.save(page);
    }

    async findBySlug(slug: string) {
        const pages = await this.cmsPageRepository.find({ 
            where: { status: 'Published' } 
        });
        
        const page = pages.find(p => p.seo_content && p.seo_content.slug === slug);
        
        if (!page) {
            throw new NotFoundException(`Published page with slug '${slug}' not found`);
        }
        
        return page;
    }

    // NEW FEATURE: Duplicate logic
    async duplicate(id: number) {
        const originalPage = await this.findOne(id);
        
        // Copy the properties but reset specific fields
        const duplicateData = {
            ...originalPage,
            title: `${originalPage.title} (Copy)`,
            status: 'Draft', // Duplicates should default to Draft
            id: undefined, // Let the database generate a new ID
            seo_content: null, // Clear SEO to prevent slug conflicts
            created_at: undefined,
            updated_at: undefined,
        };

        const newPage = this.cmsPageRepository.create(duplicateData);
        return await this.cmsPageRepository.save(newPage);
    }

    async remove(id: number) {
        const page = await this.findOne(id);
        return await this.cmsPageRepository.remove(page);
    }
}