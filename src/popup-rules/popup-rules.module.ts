import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PopupRulesService } from './popup-rules.service';
import { PopupRulesController } from './popup-rules.controller';
import { PopupRule } from './entities/popup-rule.entity';
import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';

@Module({
  imports: [
    TypeOrmModule.forFeature([PopupRule]),
    MulterModule.register({
      storage: diskStorage({
        destination: './uploads/popups', // Saves to uploads/popups
        filename: (req, file, cb) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, `${file.fieldname}-${uniqueSuffix}${extname(file.originalname)}`);
        },
      }),
    }),
  ],
  controllers: [PopupRulesController],
  providers: [PopupRulesService],
})
export class PopupRulesModule {}