import { Controller, Get, Post, Body, Param, Delete, UseGuards, Query, UseInterceptors, UploadedFiles, Patch, ParseIntPipe } from '@nestjs/common';
import { PopupRulesService } from './popup-rules.service';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../auth/enums/role.enum';
import { FileFieldsInterceptor } from '@nestjs/platform-express';

@Controller('popup-rules')
export class PopupRulesController {
    constructor(private readonly popupRulesService: PopupRulesService) {}

    @Get('resolve')
    resolveForPath(@Query('path') path: string) {
        return this.popupRulesService.resolveForPath(path);
    }

    @Get()
    findAll() {
        return this.popupRulesService.findAll();
    }

    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles(Role.Admin)
    @Post()
    @UseInterceptors(FileFieldsInterceptor([
        { name: 'desktop_image', maxCount: 1 },
        { name: 'mobile_image', maxCount: 1 },
    ]))
    create(
      @Body() dto: any,
      @UploadedFiles() files: { desktop_image?: Express.Multer.File[], mobile_image?: Express.Multer.File[] }
    ) {
        const desktopPath = files?.desktop_image ? files.desktop_image[0].filename : null;
        const mobilePath = files?.mobile_image ? files.mobile_image[0].filename : null;
        return this.popupRulesService.createOrUpdate(dto, desktopPath, mobilePath);
    }

    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles(Role.Admin)
    @Patch(':id')
    @UseInterceptors(FileFieldsInterceptor([
        { name: 'desktop_image', maxCount: 1 },
        { name: 'mobile_image', maxCount: 1 },
    ]))
    update(
      @Param('id', ParseIntPipe) id: number,
      @Body() dto: any,
      @UploadedFiles() files: { desktop_image?: Express.Multer.File[], mobile_image?: Express.Multer.File[] }
    ) {
        const desktopPath = files?.desktop_image ? files.desktop_image[0].filename : null;
        const mobilePath = files?.mobile_image ? files.mobile_image[0].filename : null;
        return this.popupRulesService.createOrUpdate({ ...dto, id }, desktopPath, mobilePath);
    }

    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles(Role.Admin)
    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.popupRulesService.remove(+id);
    }
}