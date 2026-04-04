import { Controller, Get, Patch, Body } from '@nestjs/common';
import { SiteSettingsService } from './site-settings.service';

@Controller('site-settings')
export class SiteSettingsController {
  constructor(private readonly siteSettingsService: SiteSettingsService) {}

  @Get()
  getSettings() {
    return this.siteSettingsService.getSettings();
  }

  @Patch()
  updateSettings(@Body() data: any) {
    return this.siteSettingsService.updateSettings(data);
  }
}