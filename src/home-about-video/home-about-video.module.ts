import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HomeAboutVideoController } from './home-about-video.controller';
import { HomeAboutVideoService } from './home-about-video.service';
import { HomeAboutVideo } from './entities/home-about-video.entity';

@Module({
  imports: [TypeOrmModule.forFeature([HomeAboutVideo])],
  controllers: [HomeAboutVideoController],
  providers: [HomeAboutVideoService],
})
export class HomeAboutVideoModule {}