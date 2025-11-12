import {
    ConflictException,
    Injectable,
    InternalServerErrorException,
    UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { LoginUserDto } from './dto/login.dto';
import { RegisterUserDto } from './dto/register.dto';
import { UserRepository } from 'src/repositories/user.repository';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
    constructor(
        private readonly userRepo: UserRepository,
        private readonly jwtService: JwtService, // Inject JwtService
    ) { }

    async login(loginDto: LoginUserDto) {
        const { email, username, password } = loginDto;

        // Find the user by email or username
        const user = await this.userRepo.findOne({
            where: [{ email }, { username }],
        });

        // Check if the user exists
        if (!user) {
            throw new UnauthorizedException('Invalid credentials');
        }

        // Validate the password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            throw new UnauthorizedException('Invalid credentials');
        }

        // Generate a JWT token
        const payload = { username: user.username, sub: user.id };
        const token = this.jwtService.sign(payload);

        return {
            message: 'Login successful',
            user,
            accessToken: token, // Include the token in the response
        };
    }

    async register(registerDto: RegisterUserDto) {
        try {
            const existingUser = await this.userRepo.findOne({
                where: [{ email: registerDto.email }, { username: registerDto.username }],
            });

            if (existingUser) {
                throw new ConflictException('User with this email or username already exists.');
            }

            const hashedPassword = await bcrypt.hash(registerDto.password, 10);
            const newUser = {
                ...registerDto,
                password: hashedPassword,
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            const user = this.userRepo.create(newUser);
            await this.userRepo.save(user);

            const { password, ...userWithoutPassword } = user;
            return {
                message: 'User registered successfully.',
                user: userWithoutPassword,
            };
        } catch (error) {
            if (error instanceof ConflictException) {
                throw error;
            }
            throw new InternalServerErrorException('An error occurred while creating the user.');
        }
    }
}
