import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HomeAboutVideo } from './entities/home-about-video.entity';

@Injectable()
export class HomeAboutVideoService {
  constructor(
    @InjectRepository(HomeAboutVideo)
    private repo: Repository<HomeAboutVideo>,
  ) {}

  async getSettings() {
    let settings = await this.repo.findOne({ where: {} });
    if (!settings) {
      settings = await this.repo.save(this.repo.create({}));
    }
    
    // Append Base URL so frontend can display them
    const baseUrl = `${process.env.BASE_URL || 'http://localhost:9999'}/uploads/about/`;
    if (settings.image && !settings.image.startsWith('http')) settings.image = baseUrl + settings.image;
    if (settings.video && !settings.video.startsWith('http')) settings.video = baseUrl + settings.video;
    
    return settings;
  }

  async updateSettings(dto: any, imagePath?: string, videoPath?: string) {
    let settings = await this.repo.findOne({ where: {} });
    if (!settings) settings = this.repo.create({});

    if (dto.title) settings.title = dto.title;
    if (dto.description) settings.description = dto.description;
    
    // Parse strings to booleans
    if (dto.show_video_desktop !== undefined) settings.show_video_desktop = String(dto.show_video_desktop) === 'true';
    if (dto.show_video_mobile !== undefined) settings.show_video_mobile = String(dto.show_video_mobile) === 'true';

    // Store filenames if uploaded
    if (imagePath) settings.image = require('path').basename(imagePath);
    if (videoPath) settings.video = require('path').basename(videoPath);

    return this.repo.save(settings);
  }
}