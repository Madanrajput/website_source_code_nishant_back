import { Injectable } from '@nestjs/common';
import { CreateCmsBlogDto } from './dto/create-cms_blog.dto';
import { UpdateCmsBlogDto } from './dto/update-cms_blog.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { CmsBlog } from './entities/cms_blog.entity';
import { Repository } from 'typeorm';
import { CmsCity } from 'src/cms_city/entities/cms_city.entity';

@Injectable()
export class CmsBlogService {
  constructor(
    @InjectRepository(CmsBlog)
    private readonly cmsBlogRepository: Repository<CmsBlog>,
  ) { }

  async create(createCmsBlogDto: CreateCmsBlogDto, image: string) {
    const seo_content = {
      slug: "",
      canonical_url: "",
      meta_title: "",
      meta_description: "",
      meta_keywords: "",
      custom_code: ""
    };
    const newBlog = this.cmsBlogRepository.create({
      ...createCmsBlogDto,
      image,
      seo_content,
    });

    await this.cmsBlogRepository.save(newBlog);
    const baseUrl = `${process.env.BASE_URL}/uploads/blog/`;
    return {
      ...newBlog,
      image: newBlog.image ? `${baseUrl}${newBlog.image}` : null,
    };
  }

  async findAll() {
    const blogs = await this.cmsBlogRepository.find({
      order: {
        id: 'DESC',
      },
    });
    const baseUrl = `${process.env.BASE_URL}/uploads/blog/`;

    return blogs.map(blog => ({
      ...blog,
      image: blog.image ? `${baseUrl}${blog.image}` : null,
    }));
  }

  async findAllRouteList() {
    const blogs = await this.cmsBlogRepository.find({
      order: {
        id: 'DESC',
      },
      select: ['id', 'title', 'seo_content'],
    });

    return blogs
    .filter(blog => blog.seo_content && blog.seo_content.slug)
    .map(blog => ({
      source: `/${blog.seo_content.slug}`,
      destination: `/blog-detail?id=${blog.id}`,
    }));
  }

  async findOne(id: number) {
    const blog = await this.cmsBlogRepository.findOneBy({ id });
    if (!blog) {
      throw new Error(`Blog with id ${id} not found`);
    }
    const baseUrl = `${process.env.BASE_URL}/uploads/blog/`;
    return {
      ...blog,
      image: blog.image ? `${baseUrl}${blog.image}` : null,
    };
  }

  async findOneBySlug(slug: string) {
    const blog = await this.cmsBlogRepository
      .createQueryBuilder('blog')
      .where("JSON_EXTRACT(blog.seo_content, '$.slug') = :slug", { slug })
      .getOne();

    if (!blog) {
      throw new Error(`Blog with slug ${slug} not found`);
    }

    const baseUrl = `${process.env.BASE_URL}/uploads/blog/`;
    return {
      ...blog,
      image: blog.image ? `${baseUrl}${blog.image}` : null,
    };
  }  

  async update(id: number, updateCmsBlogDto: UpdateCmsBlogDto, image: string) {
    const updateData: Partial<UpdateCmsBlogDto & { image: string }> = {
      ...updateCmsBlogDto,
    };

    if (image) {
      updateData.image = image;
    }

    await this.cmsBlogRepository.update(id, updateData);
    const updatedBlog = await this.cmsBlogRepository.findOneBy({ id });
    const baseUrl = `${process.env.BASE_URL}/uploads/blog/`;
    return {
      ...updatedBlog,
      image: updatedBlog.image ? `${baseUrl}${updatedBlog.image}` : null,
    };
  }

  async updateSeoContent(id: number, seo_content: any) {
    const blog = await this.cmsBlogRepository.findOneBy({ id });
    if (!blog) {
      throw new Error(`Blog with id ${id} not found`);
    }
    await this.cmsBlogRepository.update(id, { seo_content });
    return { message: `SEO content for blog with id ${id} has been updated` };
  }

  async remove(id: number) {
    const blog = await this.cmsBlogRepository.findOneBy({ id });
    if (!blog) {
      throw new Error(`Blog with id ${id} not found`);
    }
    await this.cmsBlogRepository.delete(id);
    return { message: `Blog with id ${id} has been removed` };
  }
}
