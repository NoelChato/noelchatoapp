import { BadRequestException, Body, Controller, HttpCode, Post } from '@nestjs/common';
import { AuthService } from './auth.service';

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
      body.username,
      body.password,
    );
    return { success: true, user };
  }

  @Post('signup')
  async signup(
    @Body() body: { username?: string; password?: string; role?: string },
  ) {
    validateSignupBody(body);
    const user = await this.authService.signup(
      body.username,
      body.password,
      body.role,
    );
    const { password, ...rest } = user;
    return { success: true, user: rest };
  }
}
