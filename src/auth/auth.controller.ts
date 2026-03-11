import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('api/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() body: { username: string; password: string }) {
    const user = await this.authService.validateUser(
      body.username,
      body.password,
    );
    return { success: true, user };
  }

  @Post('signup')
  async signup(
    @Body() body: { username: string; password: string; role: string },
  ) {
    const user = await this.authService.signup(
      body.username,
      body.password,
      body.role,
    );
    const { password, ...rest } = user;
    return { success: true, user: rest };
  }
}
