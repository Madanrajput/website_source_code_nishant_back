import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { FooterLinkService } from './footer_link.service';
import { CreateFooterLinkDto } from './dto/create-footer_link.dto';
import { UpdateFooterLinkDto } from './dto/update-footer_link.dto';


@Controller('footer-link')
export class FooterLinkController {
 constructor(private readonly footerLinkService: FooterLinkService) {}

  // ✅ Create a new entry
  @Post()
  create(@Body() CreateFooterLinkDto: CreateFooterLinkDto) {
    return this.footerLinkService.create(CreateFooterLinkDto);
  }

  // ✅ Get all records (optional status filter via query param)
  @Get()
  findAll(@Query('status') status?: string) {
    console.log('Fetching look_menu data with status:', status);
    return this.footerLinkService.findAll(status);
  }

  // ✅ Get single record by ID
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.footerLinkService.findOne(+id);
  }

  // ✅ Update a record
  @Patch(':id')
  update(@Param('id') id: string, @Body() UpdateFooterLinkDto: UpdateFooterLinkDto) {
    return this.footerLinkService.update(+id, UpdateFooterLinkDto);
  }

  // ✅ Delete a record
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.footerLinkService.remove(+id);
  }
}
