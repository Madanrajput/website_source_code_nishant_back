import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, UploadedFile, BadRequestException, Req } from '@nestjs/common';
import { CmsParentChildService } from './cms_parent_child.service';
import { CreateCmsParentChildDto } from './dto/create-cms_parent_child.dto';
import { UpdateCmsParentChildDto } from './dto/update-cms_parent_child.dto';
import { PageType } from './entities/cms_parent_child.entity';
import { FileInterceptor } from '@nestjs/platform-express';
import { Request } from 'express';

@Controller('cms-parent-child')
export class CmsParentChildController {
  constructor(private readonly cmsParentChildService: CmsParentChildService) {}

  @Post('upload-image')
  @UseInterceptors(FileInterceptor('image'))
  uploadImageOnly(@UploadedFile() file: Express.Multer.File, @Req() req: Request) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }
  
    const imageUrl = `${req.protocol}://${req.get('host')}/uploads/parent-child/${file.filename}`;
    return { filename: file.filename, url: imageUrl };
  }

  //  @Get('clone-gurugram-to-faridabad')
  // cloneData() {
  //   return this.cmsParentChildService.duplicateGurugramToFaridabad();
  // }
  // --- NEW: Media Library Endpoint ---
  @Get('media-library')
  getMediaLibrary() {
    return this.cmsParentChildService.getAllMedia();
  }

  // --- NEW: Image Replacement Without URL Change ---
  @Post('replace-image/:filename')
  @UseInterceptors(FileInterceptor('image'))
  replaceImage(
    @Param('filename') targetFilename: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('No new file uploaded for replacement');
    }
    return this.cmsParentChildService.replaceExistingImage(targetFilename, file);
  }

  @Post()
  @UseInterceptors(FileInterceptor('image'))
  async create(
    @Body() createCmsParentChildDto: CreateCmsParentChildDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const imagePath = file ? file.path : null;
    const createData = {
      page_type: createCmsParentChildDto.page_type,
      title: createCmsParentChildDto.title,
      description: createCmsParentChildDto.description,
      image: imagePath,
    };
    return this.cmsParentChildService.create(createData);
  }

  @Get()
  findAll() {
    return this.cmsParentChildService.findAll();
  }

  @Get(':page_type')
  findOne(@Param('page_type') page_type: PageType) {
    return this.cmsParentChildService.findAllByPageType(page_type);
  }

  @Get('by-id/:id')
  findById(@Param('id') id: string) {
    return this.cmsParentChildService.findById(+id);
  }

  @Patch(':id')
  @UseInterceptors(FileInterceptor('image'))
  async update(
    @Param('id') id: string,
    @Body() updateCmsParentChildDto: UpdateCmsParentChildDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const imagePath = file ? file.path : null;
    const childContentIndex = updateCmsParentChildDto.childContentIndex;
    const updateData = {
      title: updateCmsParentChildDto.title,
      description: updateCmsParentChildDto.description,
      image: imagePath,
    };
    return this.cmsParentChildService.update(+id, updateData);
  }

  @Patch('update-child-image/:id')
  @UseInterceptors(FileInterceptor('image'))
  async updateChildImage(
    @Param('id') id: string,
    @Body('childImageIndex') childImageIndex: number,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const imagePath = file ? file.path : null;
    return this.cmsParentChildService.updateChildImage(+id, childImageIndex, imagePath);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.cmsParentChildService.remove(+id);
  }

  // --- MAGIC CLONE ENDPOINT ---
 
}