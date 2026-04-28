import { BadRequestException, Body, Controller, HttpCode, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { AuthService } from './auth.service';
import { Multer } from 'multer';

const VALID_USERNAME_REGEX = /^[a-zA-Z0-9_.-]{3,30}$/;
const VALID_ROLES = ['security_guard', 'administrator', 'system_admin'];

function validateLoginBody(body: { username?: string; password?: string }) {
  if (!body.username || !body.password) {
    throw new BadRequestException('Username and password are required');
  }
}

function validateSignupBody(body: {
  username?: string;
  password?: string;
  role?: string;
}) {
  if (!body.username || !body.password || !body.role) {
    throw new BadRequestException('Username, password, and role are required');
  }
  if (!VALID_USERNAME_REGEX.test(body.username)) {
    throw new BadRequestException('Username contains invalid characters');
  }
  if (!VALID_ROLES.includes(body.role)) {
    throw new BadRequestException('Invalid role specified');
  }
}

@Controller('api/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(200)
  async login(@Body() body: { username?: string; password?: string }) {
    validateLoginBody(body);
    const user = await this.authService.validateUser(
      body.username!,
      body.password!,
    );
    return { success: true, user };
  }

  @Post('signup')
  async signup(
    @Body() body: { username?: string; password?: string; role?: string },
  ) {
    validateSignupBody(body);
    const user = await this.authService.signup(
      body.username!,
      body.password!,
      body.role!,
    );
    const { password, ...rest } = user;
    return { success: true, user: rest };
  }

  @Post('profile')
  @HttpCode(200)
  @UseInterceptors(FileInterceptor('profilePicture', {
    storage: diskStorage({
      destination: './uploads/profiles',
      filename: (req, file, callback) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = extname(file.originalname);
        callback(null, `profile-${uniqueSuffix}${ext}`);
      },
    }),
    fileFilter: (req, file, callback) => {
      if (!file.mimetype.match(/\/(jpg|jpeg|png|gif)$/)) {
        return callback(new BadRequestException('Only image files are allowed!'), false);
      }
      callback(null, true);
    },
    limits: {
      fileSize: 5 * 1024 * 1024, // 5MB limit
    },
  }))
  async updateProfile(
    @Body()
    body: {
      userId?: number;
      email?: string;
      phone?: string;
      bio?: string;
    },
    @UploadedFile() file?: Multer.File,
  ) {
    if (!body.userId) {
      throw new BadRequestException('User ID is required');
    }

    const profilePicturePath = file ? `/uploads/profiles/${file.filename}` : undefined;

    const user = await this.authService.updateProfile(
      body.userId,
      body.email,
      body.phone,
      body.bio,
      profilePicturePath,
    );
    return { success: true, user };
  }
}
