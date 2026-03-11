import { Controller, Get } from '@nestjs/common';

// use an API prefix so that static files on `/` can be delivered
@Controller('api')
export class AppController {
  @Get()
  getRoot(): string {
    return 'Hello from Nest!';
  }
}
