import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe } from '@nestjs/common';
import { CmsPagesService } from './cms-pages.service';
import { CreateCmsPageDto } from './dto/create-cms-page.dto';

@Controller('cms-pages')
export class CmsPagesController {
    constructor(private readonly cmsPagesService: CmsPagesService) {}

    @Post()
    create(@Body() createCmsPageDto: CreateCmsPageDto) {
        return this.cmsPagesService.create(createCmsPageDto);
    }

    @Get()
    findAll() {
        return this.cmsPagesService.findAll();
    }

    @Get('slug/:slug')
    findBySlug(@Param('slug') slug: string) {
        return this.cmsPagesService.findBySlug(slug);
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.cmsPagesService.findOne(+id);
    }

    @Patch(':id')
    update(
        @Param('id', ParseIntPipe) id: number,
        @Body() updateData: any,
    ) {
        return this.cmsPagesService.update(id, updateData);
    }

    @Patch('seo-content/:id')
    updateSeoContent(
        @Param('id', ParseIntPipe) id: number,
        @Body() seo_content: any
    ) {
        return this.cmsPagesService.updateSeoContent(id, seo_content);
    }

    // NEW ENDPOINT: Duplicate a page
    @Post(':id/duplicate')
    duplicate(@Param('id', ParseIntPipe) id: number) {
        return this.cmsPagesService.duplicate(id);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.cmsPagesService.remove(+id);
    }
}