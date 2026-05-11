import { Controller, Get, Patch, Body, UseGuards, UseInterceptors, UploadedFiles } from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { AuthGuard } from '@nestjs/passport';
import { HomeAboutVideoService } from './home-about-video.service';
import { diskStorage } from 'multer';
import { extname } from 'path';

@Controller('home-about-video')
export class HomeAboutVideoController {
  constructor(private readonly service: HomeAboutVideoService) {}

  @Get()
  getSettings() {
    return this.service.getSettings();
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch()
  @UseInterceptors(FileFieldsInterceptor([
    { name: 'image', maxCount: 1 },
    { name: 'video', maxCount: 1 }
  ], {
    storage: diskStorage({
      destination: './uploads/about',
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, `${file.fieldname}-${uniqueSuffix}${extname(file.originalname)}`);
      },
    }),
    limits: { fileSize: 100 * 1024 * 1024 } // 100MB Limit for Video
  }))
  updateSettings(
    @Body() dto: any,
    @UploadedFiles() files: { image?: Express.Multer.File[], video?: Express.Multer.File[] }
  ) {
    const imagePath = files?.image ? files.image[0].path : null;
    const videoPath = files?.video ? files.video[0].path : null;
    return this.service.updateSettings(dto, imagePath, videoPath);
  }
}