import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { LookMenuService } from './look_menu.service';
import { CreateLookMenuDto } from './dto/create-look_menu.dto';
import { UpdateLookMenuDto } from './dto/update-look_menu.dto';

@Controller('look-menu')
export class LookMenuController {
  constructor(private readonly lookMenuService: LookMenuService) {}

  // ✅ Create a new entry
  @Post()
  create(@Body() createLookMenuDto: CreateLookMenuDto) {
    return this.lookMenuService.create(createLookMenuDto);
  }

  // ✅ Get all records (optional status filter via query param)
  @Get()
  findAll(@Query('status') status?: string) {
    console.log('Fetching look_menu data with status:', status);
    return this.lookMenuService.findAll(status);
  }

  // ✅ Get single record by ID
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.lookMenuService.findOne(+id);
  }

  // ✅ Update a record
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateLookMenuDto: UpdateLookMenuDto) {
    return this.lookMenuService.update(+id, updateLookMenuDto);
  }

  // ✅ Delete a record
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.lookMenuService.remove(+id);
  }
}
