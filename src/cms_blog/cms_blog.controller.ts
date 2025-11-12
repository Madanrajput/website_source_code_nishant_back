import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, ParseIntPipe, UploadedFile } from '@nestjs/common';
import { CmsBlogService } from './cms_blog.service';
import { CreateCmsBlogDto } from './dto/create-cms_blog.dto';
import { UpdateCmsBlogDto } from './dto/update-cms_blog.dto';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('cms-blog')
export class CmsBlogController {
  constructor(private readonly cmsBlogService: CmsBlogService) {}

  @Post()
  @UseInterceptors(FileInterceptor('image'))
  async create(
    @Body() createCmsBlogDto: CreateCmsBlogDto,
    @UploadedFile() file: Express.Multer.File
  ) {
    const image = file ? file.filename : null;

    return this.cmsBlogService.create(createCmsBlogDto, image);
  }

  @Get()
  findAll() {
    return this.cmsBlogService.findAll();
  }

  @Get('route-list')
  findAllRouteList() {
    return this.cmsBlogService.findAllRouteList();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.cmsBlogService.findOne(+id);
  }

  @Get('blog-slug/:slug')
  findOneBySlug(@Param('slug') slug: string) {
    return this.cmsBlogService.findOneBySlug(slug);
  }

  @Patch(':id')
  @UseInterceptors(FileInterceptor('image'))
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCmsBlogDto: UpdateCmsBlogDto,
    @UploadedFile() file: Express.Multer.File
  ) {
    const image = file ? file.filename : null;
  
    return this.cmsBlogService.update(id, updateCmsBlogDto, image);
  }

  @Patch('seo-content/:id')
  async updateSeoContent(
    @Param('id', ParseIntPipe) id: number,
    @Body() seo_content: any
  ) {
    return this.cmsBlogService.updateSeoContent(id, seo_content);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.cmsBlogService.remove(+id);
  }
}
