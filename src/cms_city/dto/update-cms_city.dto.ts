import { PartialType } from '@nestjs/swagger';
import { CreateCmsCityDto } from './create-cms_city.dto';

export class UpdateCmsCityDto extends PartialType(CreateCmsCityDto) {}
