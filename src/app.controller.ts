import { Controller, Get, Res } from '@nestjs/common';
import { join } from 'path';
import type { Response } from 'express';

// use an API prefix so that static files on `/` can be delivered
@Controller()
export class AppController {
  @Get()
  getHome(@Res() res: Response) {
    return res.sendFile(join(process.cwd(), 'src', 'index.html'));
  }

  @Get('api')
  getRoot(): string {
    return 'Hello from Nest!';
  }
}
