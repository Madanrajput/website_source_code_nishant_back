import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateCmsBlogDto } from './dto/create-cms_blog.dto';
import { UpdateCmsBlogDto } from './dto/update-cms_blog.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { CmsBlog } from './entities/cms_blog.entity';
import { CmsBlogVersion } from './entities/cms_blog_version.entity';
import { Repository } from 'typeorm';
import { CmsStatus } from '../auth/enums/cms-status.enum';
import { canPublishCmsContent, resolvePublishStatus } from '../auth/utils/cms-access.util';

@Injectable()
export class CmsBlogService {
  constructor(
    @InjectRepository(CmsBlog)
    private readonly cmsBlogRepository: Repository<CmsBlog>,
    @InjectRepository(CmsBlogVersion)
    private readonly cmsBlogVersionRepository: Repository<CmsBlogVersion>,
  ) { }

  private formatBlog(blog: CmsBlog | null) {
    if (!blog) return null;
    const baseUrl = `${process.env.BASE_URL}/uploads/blog/`;
    const imagePath = blog.image && !blog.image.startsWith('http') 
        ? `${baseUrl}${blog.image}` 
        : blog.image;
    return { ...blog, image: imagePath };
  }

  // --- REUSABLE BACKUP FUNCTION ---
  private async createBackupVersion(blog: CmsBlog) {
    const backup = this.cmsBlogVersionRepository.create({
      blogId: blog.id,
      title: blog.title || 'Untitled',
      writer_name: blog.writer_name || '',
      description: blog.description || '',
      image: blog.image,
      image_alt: blog.image_alt,
      status: blog.status,
      seo_content: blog.seo_content,
      published_on: blog.published_on
    });
    await this.cmsBlogVersionRepository.save(backup);

    // Enforce Max 3 Backups
    const versions = await this.cmsBlogVersionRepository.find({
        where: { blogId: blog.id },
        order: { savedAt: 'ASC' } // Oldest first
    });
    
    if (versions.length > 3) {
        const versionsToDelete = versions.slice(0, versions.length - 3);
        await this.cmsBlogVersionRepository.remove(versionsToDelete);
    }
  }

  // --- SMART AUTO-SAVE LOGIC ---
  async autoSave(autoSaveDto: any, image: string, user?: any) {
    const { id, ...data } = autoSaveDto;
    let blogId = id ? Number(id) : null;
    let blog = null;

    if (blogId) {
        blog = await this.cmsBlogRepository.findOneBy({ id: blogId });
    }

    if (!blog) {
        // 1. Create a brand new draft so progress is NEVER lost on new blogs
        const seo_content = {
          slug: "", canonical_url: "", meta_title: "", meta_description: "",
          meta_keywords: "", custom_code: "", meta_robots_index: "index",
          meta_robots_follow: "follow", include_in_sitemap: true,
          sitemap_change_frequency: "weekly", sitemap_priority: "0.64"
        };

        blog = this.cmsBlogRepository.create({
            ...data,
            title: data.title || 'Untitled Draft',
            description: data.description || '',
            writer_name: data.writer_name || 'Admin',
            status: CmsStatus.Draft, // Hardcode as draft for unsaved new entries
            image: image || null,
            seo_content,
        });
        await this.cmsBlogRepository.save(blog);
        return this.formatBlog(blog);
    } else {
        // 2. Update existing blog draft
        const lastVersion = await this.cmsBlogVersionRepository.findOne({
            where: { blogId: blog.id },
            order: { savedAt: 'DESC' }
        });
        
        // Prevent background auto-saves from eating up all 3 backup slots instantly.
        // It will only create a new historic version if 5 minutes have passed.
        const FIVE_MINUTES = 5 * 60 * 1000;
        const now = new Date().getTime();
        const lastSavedAt = lastVersion ? new Date(lastVersion.savedAt).getTime() : 0;
        
        if (now - lastSavedAt > FIVE_MINUTES) {
            await this.createBackupVersion(blog);
        }

        const updateData: any = { ...data };
        if (image) updateData.image = image;

        await this.cmsBlogRepository.update(blog.id, updateData);
        const updatedBlog = await this.cmsBlogRepository.findOneBy({ id: blog.id });
        return this.formatBlog(updatedBlog);
    }
  }

  async create(createCmsBlogDto: CreateCmsBlogDto, image: string, user?: any) {
    if (image && !createCmsBlogDto?.image_alt?.trim()) {
      throw new BadRequestException('Featured image alt text is required');
    }

    const seo_content = {
      slug: "", canonical_url: "", meta_title: "", meta_description: "",
      meta_keywords: "", custom_code: "", meta_robots_index: "index",
      meta_robots_follow: "follow", include_in_sitemap: true,
      sitemap_change_frequency: "weekly", sitemap_priority: "0.64"
    };

    const newBlog = this.cmsBlogRepository.create({
      ...createCmsBlogDto,
      status: resolvePublishStatus(createCmsBlogDto.status || CmsStatus.Draft, user),
      image,
      image_alt: createCmsBlogDto?.image_alt?.trim() || null,
      seo_content,
    });

    await this.cmsBlogRepository.save(newBlog);
    return this.formatBlog(newBlog);
  }

  async findAll() {
    const blogs = await this.cmsBlogRepository.find({
      where: { status: CmsStatus.Published }, order: { id: 'DESC' },
    });
    return blogs.map((blog) => this.formatBlog(blog));
  }

  async findAllForCms() {
    const blogs = await this.cmsBlogRepository.find({ order: { id: 'DESC' } });
    return blogs.map((blog) => this.formatBlog(blog));
  }

  async findAllRouteList() {
    const blogs = await this.cmsBlogRepository.find({
      where: { status: CmsStatus.Published }, order: { id: 'DESC' },
      select: ['id', 'title', 'seo_content', 'status'],
    });

    return blogs.filter(blog => blog.seo_content && blog.seo_content.slug).map(blog => ({
      source: `/${blog.seo_content.slug}`, destination: `/blog-detail?id=${blog.id}`,
    }));
  }

  async findOne(id: number) {
    const blog = await this.cmsBlogRepository.findOne({
      where: { id, status: CmsStatus.Published },
    });
    if (!blog) throw new NotFoundException(`Blog with id ${id} not found`);
    return this.formatBlog(blog);
  }

  async findOneBySlug(slug: string) {
    const blog = await this.cmsBlogRepository.createQueryBuilder('blog')
      .where("JSON_EXTRACT(blog.seo_content, '$.slug') = :slug", { slug })
      .andWhere('blog.status = :status', { status: CmsStatus.Published }).getOne();

    if (!blog) throw new NotFoundException(`Blog with slug ${slug} not found`);
    return this.formatBlog(blog);
  }  

  async update(id: number, updateCmsBlogDto: UpdateCmsBlogDto, image: string, user?: any) {
    const existingBlog = await this.cmsBlogRepository.findOneBy({ id });
    if (!existingBlog) throw new NotFoundException(`Blog with id ${id} not found`);

    // Manual Updates ALWAYS trigger a strict backup history
    await this.createBackupVersion(existingBlog);

    const resolvedImageAlt = updateCmsBlogDto?.image_alt?.trim() || existingBlog.image_alt;

    if ((image || existingBlog.image) && !resolvedImageAlt) {
      throw new BadRequestException('Featured image alt text is required');
    }

    const updateData: Partial<UpdateCmsBlogDto & { image: string }> = {
      ...updateCmsBlogDto,
      image_alt: resolvedImageAlt,
      status: resolvePublishStatus(updateCmsBlogDto?.status ?? existingBlog.status, user),
    };

    if (image) updateData.image = image;

    await this.cmsBlogRepository.update(id, updateData);
    const updatedBlog = await this.cmsBlogRepository.findOneBy({ id });
    return this.formatBlog(updatedBlog);
  }

  async updateSeoContent(id: number, seo_content: any, user?: any) {
    const blog = await this.cmsBlogRepository.findOneBy({ id });
    if (!blog) throw new NotFoundException(`Blog with id ${id} not found`);
    
    const nextStatus = !canPublishCmsContent(user) && blog.status === CmsStatus.Published
        ? CmsStatus.Pending : blog.status;
        
    await this.cmsBlogRepository.update(id, { seo_content, status: nextStatus });
    return { message: `SEO content for blog with id ${id} has been updated`, status: nextStatus };
  }

  async remove(id: number) {
    const blog = await this.cmsBlogRepository.findOneBy({ id });
    if (!blog) throw new NotFoundException(`Blog with id ${id} not found`);
    await this.cmsBlogRepository.delete(id);
    return { message: `Blog with id ${id} has been removed` };
  }

  async getVersions(blogId: number) {
    return await this.cmsBlogVersionRepository.find({
      where: { blogId },
      order: { savedAt: 'DESC' }, 
    });
  }

  async restoreVersion(blogId: number, versionId: number, user?: any) {
    const version = await this.cmsBlogVersionRepository.findOne({
      where: { id: versionId, blogId },
    });

    if (!version) throw new NotFoundException(`Version ${versionId} not found`);

    const restoreData = {
        title: version.title,
        description: version.description,
        writer_name: version.writer_name,
        image_alt: version.image_alt,
        status: version.status,
        published_on: version.published_on
    };

    return await this.update(blogId, restoreData, version.image, user);
  }
}