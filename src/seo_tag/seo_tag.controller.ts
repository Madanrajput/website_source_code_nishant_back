import { Controller, Get, Post, Body, Patch, Param, Delete, Query, Request, UseGuards, BadRequestException } from '@nestjs/common';
import { SeoTagService } from './seo_tag.service';
import { CreateSeoTagDto } from './dto/create-seo_tag.dto';
import { UpdateSeoTagDto } from './dto/update-seo_tag.dto';
import { AuthGuard } from '@nestjs/passport';
import { ensureCmsDeletePermission } from '../auth/utils/cms-access.util';

@Controller('seo-tag')
export class SeoTagController {
  constructor(private readonly seoTagService: SeoTagService) {}

  @UseGuards(AuthGuard('jwt'))
  @Post()
  create(@Body() CreateSeoTagDto: CreateSeoTagDto, @Request() req) {
    return this.seoTagService.create(CreateSeoTagDto, req.user);
  }

  @Get()
  findAll(@Query('status') status?: string) {
    return this.seoTagService.findAll(status);
  }

  // 🌟 NEW: Endpoint to fetch by route path (Must be placed BEFORE ':id' so it doesn't get confused)
  @Get('route')
  findByRoute(@Query('path') path: string) {
    if (!path) throw new BadRequestException('Path query parameter is required');
    return this.seoTagService.findByPageName(path);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.seoTagService.findOne(+id);
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch(':id')
  update(@Param('id') id: string, @Body() UpdateSeoTagDto: UpdateSeoTagDto, @Request() req) {
    return this.seoTagService.update(+id, UpdateSeoTagDto, req.user);
  }

  @UseGuards(AuthGuard('jwt'))
  @Delete(':id')
  remove(@Param('id') id: string, @Request() req) {
    ensureCmsDeletePermission(req.user);
    return this.seoTagService.remove(+id);
  }
}