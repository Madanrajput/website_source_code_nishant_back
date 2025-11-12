import { Injectable } from '@nestjs/common';
import { CreatePortfolioProjectDto } from './dto/create-portfolio_project.dto';
import { UpdatePortfolioProjectDto } from './dto/update-portfolio_project.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { PortfolioPageType, PortfolioProject } from './entities/portfolio_project.entity';
import { Repository } from 'typeorm';
import { basename } from 'path';

@Injectable()
export class PortfolioProjectService {

  constructor(
    @InjectRepository(PortfolioProject)
    private readonly portfolioProjectRepository: Repository<PortfolioProject>,
  ) {}


  async create(createPortfolioProjectDto: CreatePortfolioProjectDto, imagePath: string | null): Promise<PortfolioProject> {
    let imageName: string | null = null;
    if (imagePath) {
      imageName = basename(imagePath); // Extract the filename from the path
    }
    if(createPortfolioProjectDto?.status == "true"){
      createPortfolioProjectDto.status = true;
    }
    const newRecord = this.portfolioProjectRepository.create({
      ...createPortfolioProjectDto,
      image: imageName,
      child_images: [
        { image: "default.png" },
        { image: "default.png" },
        { image: "default.png" },
        { image: "default.png" },
        { image: "default.png" },
        { image: "default.png" }
      ]
    });
    return await this.portfolioProjectRepository.save(newRecord);
  }

  async findAllPaginated(type: PortfolioPageType, page: number, limit: number) {
    const baseUrl = `${process.env.BASE_URL}/uploads/portfolio-projects/`;
    const projects = await this.portfolioProjectRepository.find({
      take: limit,
      skip: (page - 1) * limit,
      where: { type },
    });

    return projects.map(project => ({
      ...project,
      image: project.image ? `${baseUrl}${project.image}` : null,
      child_images: project.child_images.map(childImage => ({
        ...childImage,
        image: childImage.image ? `${baseUrl}${childImage.image}` : null,
      })),
    }));
  }

  async findAllPaginatedActiveStatus(type: PortfolioPageType, page: number, limit: number) {
    const baseUrl = `${process.env.BASE_URL}/uploads/portfolio-projects/`;
    const [projects, total] = await this.portfolioProjectRepository.findAndCount({
      take: limit,
      skip: (page - 1) * limit,
      where: { type, status: true },
    });

    const totalPages = Math.ceil(total / limit);

    const paginatedProjects = projects.map(project => ({
      ...project,
      image: project.image ? `${baseUrl}${project.image}` : null,
      child_images: project.child_images.map(childImage => ({
        ...childImage,
        image: childImage.image ? `${baseUrl}${childImage.image}` : null,
      })),
    }));

    return {
      data: paginatedProjects,
      meta: {
        totalItems: total,
        itemCount: paginatedProjects.length,
        itemsPerPage: limit,
        totalPages: totalPages,
        currentPage: page,
      },
    };
  }

  async findOne(id: number) {
    const project = await this.portfolioProjectRepository.findOne({ where: { id } });
    if (!project) {
      return null;
    }
    const baseUrl = `${process.env.BASE_URL}/uploads/portfolio-projects/`;
    return {
      ...project,
      image: project.image ? `${baseUrl}${project.image}` : null,
      child_images: project.child_images.map(childImage => ({
        ...childImage,
        image: childImage.image ? `${baseUrl}${childImage.image}` : null,
      })),
    };
  }

  async update(id: number, updatePortfolioProjectDto: UpdatePortfolioProjectDto, imagePath: string | null) {
    const existingRecord = await this.portfolioProjectRepository.findOne({ where: { id } });
    if (!existingRecord) {
      throw new Error('Record not found');
    }

    if(updatePortfolioProjectDto?.status == "true"){
      updatePortfolioProjectDto.status = true;
    }

    if (imagePath) {
      const imageName = basename(imagePath); // Extract the filename from the path
      updatePortfolioProjectDto.image = imageName;
    }

    await this.portfolioProjectRepository.update(id, updatePortfolioProjectDto);
    return this.portfolioProjectRepository.findOne({ where: { id } });
  }

  async updateChildImage(id: number, childImageIndex: number, imagePath: string | null) {
    const existingRecord = await this.portfolioProjectRepository.findOne({ where: { id } });
    if (!existingRecord) {
      throw new Error('Record not found');
    }

    if (childImageIndex < 0 || childImageIndex >= existingRecord.child_images.length) {
      throw new Error('Invalid child image index');
    }

    const childImages = existingRecord.child_images[childImageIndex];

    if (imagePath) {
      const imageName = basename(imagePath); // Extract the filename from the path
      childImages.image = imageName;
    }

    existingRecord.child_images[childImageIndex] = childImages;

    console.log('existingRecord', existingRecord);

    await this.portfolioProjectRepository.save(existingRecord);
    return this.portfolioProjectRepository.findOne({ where: { id } });
  }

  async remove(id: number): Promise<void> {
    const existingRecord = await this.portfolioProjectRepository.findOne({ where: { id } });
    if (!existingRecord) {
      throw new Error('Record not found');
    }
    await this.portfolioProjectRepository.remove(existingRecord);
  }
}
