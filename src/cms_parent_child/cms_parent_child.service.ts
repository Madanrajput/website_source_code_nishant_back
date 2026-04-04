import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateCmsParentChildDto } from './dto/create-cms_parent_child.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { CmsParentChild, PageType } from './entities/cms_parent_child.entity';
import { Repository } from 'typeorm';
import { basename } from 'path';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class CmsParentChildService {

  constructor(
    @InjectRepository(CmsParentChild)
    private readonly cmsParentChildRepository: Repository<CmsParentChild>,
  ) {}


  // --- MAGIC CLONING SCRIPT: Gurugram to Faridabad ---
  // async duplicateGurugramToFaridabad() {
  //   // 1. Fetch all existing Gurugram records (Pages and Videos)
  //   const gurugramPages = await this.cmsParentChildRepository.find({ 
  //     where: { page_type: PageType.EXPERIENCE_CENTER_GURUGRAM } 
  //   });
  //   const gurugramVideos = await this.cmsParentChildRepository.find({ 
  //     where: { page_type: PageType.EXPERIENCE_CENTER_GURUGRAM_VIDEO } 
  //   });

  //   if (gurugramPages.length === 0 && gurugramVideos.length === 0) {
  //     return { message: "No Gurugram records found to copy!" };
  //   }

  //   // 2. Clone the pages, stripping the old IDs and changing the page_type
  //   const newFaridabadPages = gurugramPages.map(record => {
  //     return this.cmsParentChildRepository.create({
  //       page_type: PageType.EXPERIENCE_CENTER_FARIDABAD,
  //       child_content: record.child_content,
  //       child_images: record.child_images
  //     });
  //   });

  //   // 3. Clone the videos
  //   const newFaridabadVideos = gurugramVideos.map(record => {
  //     return this.cmsParentChildRepository.create({
  //       page_type: PageType.EXPERIENCE_CENTER_FARIDABAD_VIDEO,
  //       child_content: record.child_content,
  //       child_images: record.child_images
  //     });
  //   });

  //   // 4. Save everything to the database as brand new Faridabad records
  //   await this.cmsParentChildRepository.save([...newFaridabadPages, ...newFaridabadVideos]);

  //   return { 
  //     message: "Success! Gurugram data has been fully cloned to Faridabad.",
  //     pagesCopied: newFaridabadPages.length,
  //     videosCopied: newFaridabadVideos.length
  //   };
  // }

  // --- FIXED: Retrieve all images for Media Library ---
  async getAllMedia() {
    // Attempt 1: Standard project root
    let uploadDir = path.join(process.cwd(), 'uploads', 'parent-child');
    
    // Attempt 2: If running from inside /dist, step back up to the root folder
    if (!fs.existsSync(uploadDir)) {
      uploadDir = path.resolve(__dirname, '..', '..', 'uploads', 'parent-child');
    }

    // Attempt 3: Absolute fallback (specifically for your local Windows machine)
    if (!fs.existsSync(uploadDir)) {
       uploadDir = 'C:\\Projects\\hcinterior_backend\\uploads\\parent-child';
    }

    // DEBUGGING: This will print in your NestJS terminal so you can see exactly what is happening
    console.log("Media Library is looking for images inside:", uploadDir);

    // If directory still doesn't exist, return empty array
    if (!fs.existsSync(uploadDir)) {
      console.warn("WARNING: Upload directory not found!");
      return [];
    }

    try {
      const files = fs.readdirSync(uploadDir);
      
      // Fallback to localhost if BASE_URL is not set in your .env file
      const baseUrl = process.env.BASE_URL 
        ? `${process.env.BASE_URL}/uploads/parent-child/`
        : `http://localhost:8000/uploads/parent-child/`; 
      
      return files
        .filter(file => file !== '.gitkeep' && !file.startsWith('.')) // Ignore hidden files
        .map(file => {
          const stats = fs.statSync(path.join(uploadDir, file));
          return {
            filename: file,
            url: `${baseUrl}${file}`,
            size_bytes: stats.size,
            created_at: stats.birthtime,
          };
        })
        .sort((a, b) => b.created_at.getTime() - a.created_at.getTime()); // Newest first

    } catch (err) {
      console.error("Error reading media directory:", err);
      return [];
    }
  }

  // --- Replace image without URL change ---
  async replaceExistingImage(targetFilename: string, newFile: Express.Multer.File) {
    let uploadDir = path.join(process.cwd(), 'uploads', 'parent-child');
    if (!fs.existsSync(uploadDir)) {
      uploadDir = path.resolve(__dirname, '..', '..', 'uploads', 'parent-child');
    }

    const targetPath = path.join(uploadDir, targetFilename);
    
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // Overwrite the existing file with the new file
    fs.renameSync(newFile.path, targetPath);

    const baseUrl = process.env.BASE_URL || `http://localhost:8000`;

    return { 
      message: 'Image successfully replaced. Existing URL remains active.',
      filename: targetFilename,
      url: `${baseUrl}/uploads/parent-child/${targetFilename}`
    };
  }
  
  async create(createCmsParentChildDto: CreateCmsParentChildDto): Promise<CmsParentChild> {
    const imagePath = createCmsParentChildDto.image ? basename(createCmsParentChildDto.image) : 'default.png';

    const defaultImageCount = 
      createCmsParentChildDto.page_type === 'experience_center' || 
      createCmsParentChildDto.page_type === 'experience_center_gurugram' 
        ? 3 
        : 10;

    const childImages = Array.from({ length: defaultImageCount }, () => ({ image: 'default.png' }));

    const createData = {
      page_type: createCmsParentChildDto.page_type,
      child_content: {
        title: createCmsParentChildDto.title,
        description: createCmsParentChildDto.description,
        image: imagePath,
      },
      child_images: childImages, 
    };

    try {
      const result = await this.cmsParentChildRepository.save(createData);
      return result;
    } catch (error) {
      console.error('Error Saving Data:', error);
      throw error;
    }
  }

  findAll() {
    return this.cmsParentChildRepository.find();
  }

  async findById(id: number) {
    const parentChild = await this.cmsParentChildRepository.findOne({ where: { id } });
    if (!parentChild) {
      return null;
    }
    const baseUrl = `${process.env.BASE_URL}/uploads/parent-child/`;

    const updatedChildContent = {
      title: parentChild.child_content.title,
      description: parentChild.child_content.description,
      image: parentChild.child_content.image ? `${baseUrl}${parentChild.child_content.image}` : null,
    };

    const updatedChildImages = parentChild.child_images.map(imageObj => ({
      ...imageObj,
      image: imageObj.image ? `${baseUrl}${imageObj.image}` : null,
    }));

    return {
      ...parentChild,
      child_content: updatedChildContent,
      child_images: updatedChildImages,
    };
  }

  async findAllByPageType(page_type: PageType) {
    const parentChildRecords = await this.cmsParentChildRepository.find({ where: { page_type }, order: { id: 'DESC' } });
    if (!parentChildRecords.length) {
      return [];
    }
    const baseUrl = `${process.env.BASE_URL}/uploads/parent-child/`;

    return parentChildRecords.map(parentChild => {
      const updatedChildContent = {
        ...parentChild.child_content,
        image: parentChild.child_content.image ? `${baseUrl}${parentChild.child_content.image}` : null,
      };

      const updatedChildImages = parentChild.child_images.map(imageObj => {
        const updatedImageObj = {};
        for (const key in imageObj) {
          if (imageObj.hasOwnProperty(key)) {
            updatedImageObj[key] = imageObj[key] ? `${baseUrl}${imageObj[key]}` : null;
          }
        }
        return updatedImageObj;
      });

      return {
        ...parentChild,
        child_content: updatedChildContent,
        child_images: updatedChildImages,
      };
    });
  }

  async update(id: number, updateData: { title: string; description: string; image?: string }) {
    const existingRecord = await this.cmsParentChildRepository.findOne({ where: { id } });
    if (!existingRecord) {
      throw new Error('Record not found');
    }

    const childContent = existingRecord.child_content;

    if (updateData.image) {
      const imageName = basename(updateData.image); 
      childContent.image = imageName;
    }

    childContent.title = updateData?.title;
    childContent.description = updateData.description;

    existingRecord.child_content = childContent;

    await this.cmsParentChildRepository.save(existingRecord);
    return this.cmsParentChildRepository.findOne({ where: { id } });
  }

  async updateChildImage(id: number, childImageIndex: number, imagePath: string | null) {
    const existingRecord = await this.cmsParentChildRepository.findOne({ where: { id } });
    if (!existingRecord) {
      throw new Error('Record not found');
    }

    if (childImageIndex < 0 || childImageIndex >= existingRecord.child_images.length) {
      throw new Error('Invalid child image index');
    }

    const childImages = existingRecord.child_images[childImageIndex];

    if (imagePath) {
      const imageName = basename(imagePath); 
      childImages.image = imageName;
    }

    existingRecord.child_images[childImageIndex] = childImages;

    await this.cmsParentChildRepository.save(existingRecord);
    return this.cmsParentChildRepository.findOne({ where: { id } });
  }

  remove(id: number) {
    return this.cmsParentChildRepository.delete(id);
  }
}