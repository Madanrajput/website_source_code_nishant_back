import { IsString, IsOptional, IsEnum } from 'class-validator';

export class CreateSeoTagDto {
    @IsString()
    @IsOptional()
    title?: string;

    @IsString()
    @IsOptional()
    meta_description?: string;

    @IsString()
    @IsOptional()
    page_name?: string;

    @IsString()
    @IsOptional()
    meta_can_tag?: string;

    @IsString()
    @IsOptional()
    meta_image?: string;

    // --- NEW FIELDS ---
    @IsString()
    @IsOptional()
    meta_robots?: string;

    @IsString()
    @IsOptional()
    og_image?: string;
    // ------------------

    @IsEnum(['active', 'inactive'])
    @IsOptional()
    status?: string;
}