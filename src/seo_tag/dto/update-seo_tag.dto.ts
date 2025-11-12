import { PartialType } from '@nestjs/swagger';
import { CreateSeoTagDto } from './create-seo_tag.dto';

export class UpdateSeoTagDto extends PartialType(CreateSeoTagDto) {}
