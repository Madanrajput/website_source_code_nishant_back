import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { SeoTagService } from './seo_tag.service';
import { CreateSeoTagDto } from './dto/create-seo_tag.dto';
import { UpdateSeoTagDto } from './dto/update-seo_tag.dto';

@Controller('seo-tag')
export class SeoTagController {
constructor(private readonly seoTagService: SeoTagService) {}
// ✅ Create a new entry
  @Post()
  create(@Body() CreateSeoTagDto: CreateSeoTagDto) {
    return this.seoTagService.create(CreateSeoTagDto);
  }

  // ✅ Get all records (optional status filter via query param)
  @Get()
  findAll(@Query('status') status?: string) {
    console.log('Fetching look_menu data with status:', status);
    return this.seoTagService.findAll(status);
  }

  // ✅ Get single record by ID
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.seoTagService.findOne(+id);
  }

  // ✅ Update a record
  @Patch(':id')
  update(@Param('id') id: string, @Body() UpdateSeoTagDto: UpdateSeoTagDto) {
    return this.seoTagService.update(+id, UpdateSeoTagDto);
  }

  // ✅ Delete a record
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.seoTagService.remove(+id);
  }


}
