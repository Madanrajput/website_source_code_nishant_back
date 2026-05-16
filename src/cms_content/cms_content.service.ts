import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateCmsContentDto } from './dto/create-cms_content.dto';
import { UpdateCmsContentDto, UpdateCmsContentHomepageBannerDto, UpdateJsonContentChildImageDto } from './dto/update-cms_content.dto';
import { CmsContent, PageType } from './entities/cms_content.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { basename } from 'path';

@Injectable()
export class CmsContentService {
  constructor(
    @InjectRepository(CmsContent)
    private readonly cmsContentRepository: Repository<CmsContent>,
  ) {}

  create(page_type: PageType, createCmsContentDto: CreateCmsContentDto, imagePath: string) {
    const newContent = this.cmsContentRepository.create({
      page_type,
      json_content: createCmsContentDto,
    });

    if (imagePath) {
      newContent.json_content.image = basename(imagePath);
    }

    return this.cmsContentRepository.save(newContent);
  }

  findAll() {
    return this.cmsContentRepository.find();
  }

  async findOne(page_type: PageType) {
    const contentDataArray = await this.cmsContentRepository.find({ where: { page_type }, order: { id: 'DESC' } });
    if (!contentDataArray || contentDataArray.length === 0) {
      return null;
    }

    const baseUrl = `${process.env.BASE_URL}/uploads/cms-content/`;
    if (contentDataArray.length > 1) {
      switch (page_type) {
        case PageType.TEAM:
        case PageType.HOME_PAGE_CONTENT:
        case PageType.HOME_PAGE_CONTENT_WHAT_WE_ARE:
        case PageType.HOME_PAGE_ESTIMATE_CARDS:
        case PageType.HOME_PAGE_CONTENT_HOW_WE_WORK:
          contentDataArray.forEach((contentData) => {
            const jsonContent = contentData.json_content;
            jsonContent.image = jsonContent.image ? `${baseUrl}${jsonContent.image}` : null;
            contentData.json_content = jsonContent;
          });
          return contentDataArray;
        default:
          return contentDataArray;
      }
    } else {
      const contentData = contentDataArray[0];
      const jsonContent = contentData.json_content;

      switch (contentData.page_type) {
        case PageType.ABOUT_US:
        case PageType.HOME_PAGE_CONTENT_EVERY_SPACE:
        case PageType.HOME_PAGE_CONTENT_MEET_US:
        case PageType.CREATING_THE_HOME_OF_YOUR_DREAMS:
        case PageType.CREATING_THE_HOME_OF_YOUR_DREAMS_2:
          jsonContent.mid_image = jsonContent.mid_image ? `${baseUrl}${jsonContent.mid_image}` : null;
          contentData.json_content = jsonContent;
          break;
        case PageType.ABOUT_US_SLIDER:
        case PageType.HOW_IT_WORKS:
        case PageType.REFER_AND_EARN:
        case PageType.HOME_PAGE_CONTENT_WHY_CHOOSE_US:
          jsonContent.forEach((content) => {
            content.image = content.image ? `${baseUrl}${content.image}` : null;
          });
          break;
        case PageType.HOMEPAGE_BANNER:
          jsonContent.forEach((content) => {
            content.top_icon = content.top_icon ? `${baseUrl}${content.top_icon}` : null;
            content.banner_image = content.banner_image ? `${baseUrl}${content.banner_image}` : null;
            content.mobile_banner_image = content.mobile_banner_image ? `${baseUrl}${content.mobile_banner_image}` : null;
          });
          break;
        case PageType.TEAM:
        case PageType.HOME_PAGE_CONTENT:
          contentData.json_content.image = contentData.json_content.image ? `${baseUrl}${contentData.json_content.image}` : null;
          if(contentData.page_type === PageType.HOME_PAGE_CONTENT) return [contentData];
          break;
        default:
      }
      return contentData;
    }
  }

  update(id: number, updateCmsContentDto: UpdateCmsContentDto) {
    const updateContent: Partial<CmsContent> = {
      json_content: updateCmsContentDto?.json_content,
    };
    return this.cmsContentRepository.update(id, updateContent);
  }

  async updateWithImage(id: number, updateCmsContentDto: UpdateCmsContentDto, imagePath: string) {
    const exitingContent = await this.cmsContentRepository.findOne({ where: { id } });

    switch (exitingContent.page_type) {
      case PageType.ABOUT_US:
      case PageType.HOME_PAGE_CONTENT_EVERY_SPACE:
      case PageType.HOME_PAGE_CONTENT_MEET_US:
      case PageType.CREATING_THE_HOME_OF_YOUR_DREAMS:
      case PageType.CREATING_THE_HOME_OF_YOUR_DREAMS_2:
        const updateContentText: Partial<CmsContent> = {
          json_content: {
            top_title: updateCmsContentDto?.json_content?.top_title || "",
            top_description: updateCmsContentDto?.json_content?.top_description || "",
            mid_sub_title: updateCmsContentDto?.json_content?.mid_sub_title || "",
            mid_sub_description: updateCmsContentDto?.json_content?.mid_sub_description || "",
            mid_image: imagePath ? basename(imagePath) : exitingContent.json_content.mid_image,
          },
        };
        return this.cmsContentRepository.update(id, updateContentText);

      case PageType.TEAM:
      case PageType.FAQS:
      case PageType.HOME_PAGE_CONTENT:
      case PageType.HOME_PAGE_CONTENT_WHAT_WE_ARE:
      case PageType.HOME_PAGE_CONTENT_HOW_WE_WORK:
        const updateContentStandard: Partial<CmsContent> = {
          json_content: {
            title: updateCmsContentDto?.title || "",
            description: updateCmsContentDto?.description || "",
            designation: updateCmsContentDto?.designation || "",
            image: imagePath ? basename(imagePath) : exitingContent.json_content.image,
          },
        };
        return this.cmsContentRepository.update(id, updateContentStandard);
       
      default:
        return this.update(id, updateCmsContentDto);
    }
  }

  async updateJsonContentChildImage(id: number, updateCmsContentDto: UpdateJsonContentChildImageDto, imagePath: string) {
    const existingContent = await this.cmsContentRepository.findOne({ where: { id } });
    if (!existingContent) return null;

    const jsonContent = existingContent.json_content;
    if (!jsonContent || !Array.isArray(jsonContent)) return null;

    const itemIndex = updateCmsContentDto?.item_index;
    if (itemIndex === undefined || itemIndex < 0 || itemIndex >= jsonContent.length) return null;

    jsonContent[itemIndex].title = updateCmsContentDto?.title || '';
    jsonContent[itemIndex].description = updateCmsContentDto?.description || '';

    if(jsonContent[itemIndex].designation) {
      jsonContent[itemIndex].designation = updateCmsContentDto?.designation || '';
    }

    if (imagePath) {
      jsonContent[itemIndex].image = basename(imagePath);
    }

    const updateContent: Partial<CmsContent> = { json_content: jsonContent };

    try {
      const result = await this.cmsContentRepository.update(id, updateContent);
      if (result.affected === 0) return null;
      return result;
    } catch (error) {
      throw error;
    }
  }

// 🌟 UPDATED: Accepting and saving mobileBannerImagePath
async updateJsonContentHomepageBanner(id: number, updateCmsContentDto: any, topIconPath: string, bannerImagePath: string, mobileBannerImagePath: string) {
  const existingContent = await this.cmsContentRepository.findOne({ where: { id } });
  if (!existingContent) {
    throw new BadRequestException(`Content not found for id: ${id}`);
  }

  let jsonContent = existingContent.json_content;
  if (!jsonContent || !Array.isArray(jsonContent)) {
    jsonContent = [];
  }

  const action = updateCmsContentDto?.action || 'update';
  const itemIndex = parseInt(updateCmsContentDto?.item_index, 10);

  if (action === 'reorder') {
    const fromIndex = parseInt(updateCmsContentDto?.from_index, 10);
    const toIndex = parseInt(updateCmsContentDto?.to_index, 10);
    if (fromIndex >= 0 && fromIndex < jsonContent.length && toIndex >= 0 && toIndex < jsonContent.length) {
      const [movedItem] = jsonContent.splice(fromIndex, 1);
      jsonContent.splice(toIndex, 0, movedItem);
    }
  } 
  else if (action === 'delete') {
    if (itemIndex >= 0 && itemIndex < jsonContent.length) {
      jsonContent.splice(itemIndex, 1);
    }
  } 
  else if (action === 'toggle_active') {
    if (itemIndex >= 0 && itemIndex < jsonContent.length) {
      jsonContent[itemIndex].is_active = updateCmsContentDto.is_active === 'true';
    }
  } 
  else if (action === 'add' || action === 'update') {
    const slideData: any = {};
    slideData.title = updateCmsContentDto?.title || '';
    slideData.sub_title = updateCmsContentDto?.sub_title || '';
    slideData.top_slogan = updateCmsContentDto?.top_slogan || '';
    slideData.description = updateCmsContentDto?.description || '';
    slideData.button_text = updateCmsContentDto?.button_text || '';
    slideData.button_link = updateCmsContentDto?.button_link || '';
    slideData.text_color = updateCmsContentDto?.text_color || '#ffffff';
    slideData.is_active = updateCmsContentDto?.is_active !== 'false';

    if (action === 'add') {
      if (topIconPath) slideData.top_icon = basename(topIconPath);
      if (bannerImagePath) slideData.banner_image = basename(bannerImagePath);
      if (mobileBannerImagePath) slideData.mobile_banner_image = basename(mobileBannerImagePath); // 🌟 Added
      jsonContent.push(slideData);
    } 
    else if (action === 'update') {
      if (itemIndex >= 0 && itemIndex < jsonContent.length) {
        jsonContent[itemIndex] = { ...jsonContent[itemIndex], ...slideData };
        if (topIconPath) jsonContent[itemIndex].top_icon = basename(topIconPath);
        if (bannerImagePath) jsonContent[itemIndex].banner_image = basename(bannerImagePath);
        if (mobileBannerImagePath) jsonContent[itemIndex].mobile_banner_image = basename(mobileBannerImagePath); // 🌟 Added
      } else {
        throw new BadRequestException(`Invalid item_index: ${itemIndex}`);
      }
    }
  }

  const updateContent: Partial<CmsContent> = {
    json_content: jsonContent,
  };

  try {
    const result = await this.cmsContentRepository.update(id, updateContent);
    if (result.affected === 0) {
      throw new BadRequestException('Update failed, no rows affected');
    }
    return result;
  } catch (error) {
    throw new BadRequestException('Error updating content:', error);
  }
}

async updateEstimateCards(id: number, dto: any, imagePath: string) {
  const existingContent = await this.cmsContentRepository.findOne({ where: { id } });
  if (!existingContent) throw new BadRequestException(`Content not found`);

  const jsonContent = Array.isArray(existingContent.json_content) ? existingContent.json_content : [];
  const action = dto?.action || 'update';
  const itemIndex = parseInt(dto?.item_index, 10);

  if (action === 'add') {
    jsonContent.push({
      title: dto?.title || '',
      link: dto?.link || '/estimator-for-home',
      image: imagePath ? basename(imagePath) : null,
      is_active: dto?.is_active !== 'false'
    });
  } else if (action === 'delete') {
    jsonContent.splice(itemIndex, 1);
  } else if (action === 'reorder') {
    const fromIndex = parseInt(dto?.from_index, 10);
    const toIndex = parseInt(dto?.to_index, 10);
    const [movedItem] = jsonContent.splice(fromIndex, 1);
    jsonContent.splice(toIndex, 0, movedItem);
  } else if (action === 'toggle_active') {
    jsonContent[itemIndex].is_active = dto?.is_active === 'true';
  } else {
    jsonContent[itemIndex].title = dto?.title || '';
    jsonContent[itemIndex].link = dto?.link || '/estimator-for-home';
    jsonContent[itemIndex].is_active = dto?.is_active !== 'false';
    if (imagePath) jsonContent[itemIndex].image = basename(imagePath);
  }

  return this.cmsContentRepository.update(id, { json_content: jsonContent });
}

  remove(id: number) {
    return this.cmsContentRepository.delete(id);
  }
}