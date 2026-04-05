import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs'; 
import { User } from 'src/entities/user.entity';

@Injectable()
export class CmsUsersService {
    constructor(
        @InjectRepository(User)
        private readonly cmsUserRepo: Repository<User>,
    ) {}

    async create(userData: any): Promise<User> {
        // Check if email OR username already exists
        const existing = await this.cmsUserRepo.findOne({
            where: [{ email: userData.email }, { username: userData.username || userData.email }]
        });
        
        if (existing) {
            throw new BadRequestException('An internal user with this email or username already exists.');
        }

        const hashedPassword = await bcrypt.hash(userData.password, 10);

        // 🌟 THE FIX: Explicitly mapping the NOT NULL database columns
        const newUser = this.cmsUserRepo.create({
            ...userData,
            username: userData.username || userData.email, // Fallback to email if empty
            phoneNumber: userData.phoneNumber || '0000000000', 
            gender: userData.gender || 'Not Specified',
            dateOfBirth: userData.dateOfBirth || new Date(), 
            isVerified: true,
            status: 'Active',
            password: hashedPassword 
        } as Partial<User>);

        const savedUser = await this.cmsUserRepo.save(newUser as any);
        return savedUser as User;
    }

    async findAll(): Promise<User[]> {
        return await this.cmsUserRepo.find({ 
            where: [ { role: 'Admin' }, { role: 'Editor' } ],
            order: { createdAt: 'DESC' } 
        });
    }

    async updateRole(id: number, role: string): Promise<User> {
        const user = await this.cmsUserRepo.findOneBy({ id });
        if (!user) throw new NotFoundException('User not found');
        
        user.role = role;
        const savedUser = await this.cmsUserRepo.save(user as any);
        return savedUser as User;
    }

    async updateStatus(id: number, status: string): Promise<User> {
        const user = await this.cmsUserRepo.findOneBy({ id });
        if (!user) throw new NotFoundException('User not found');
        
        user.status = status;
        const savedUser = await this.cmsUserRepo.save(user as any);
        return savedUser as User;
    }

    async remove(id: number): Promise<void> {
        const user = await this.cmsUserRepo.findOneBy({ id });
        if (!user) throw new NotFoundException('User not found');
        
        await this.cmsUserRepo.remove(user);
    }
}