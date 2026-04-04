import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { RedirectsService } from './redirects.service';
import { CreateRedirectDto } from './dto/create-redirect.dto';

@Controller('redirects')
export class RedirectsController {
  constructor(private readonly redirectsService: RedirectsService) {}

  @Post()
  create(@Body() createRedirectDto: CreateRedirectDto) {
    return this.redirectsService.create(createRedirectDto);
  }

  // Endpoint for handling CSV Bulk Uploads
  @Post('bulk')
  createBulk(@Body() createRedirectDtos: CreateRedirectDto[]) {
    return this.redirectsService.createBulk(createRedirectDtos);
  }

  @Get()
  findAll() {
    return this.redirectsService.findAll();
  }

  @Get('active')
  findAllActive() {
    return this.redirectsService.findAllActive();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.redirectsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateData: any) {
    return this.redirectsService.update(+id, updateData);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.redirectsService.remove(+id);
  }
}