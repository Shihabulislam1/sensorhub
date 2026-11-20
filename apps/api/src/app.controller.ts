import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  @Get('health')
  health(): { status: string; time: string } {
    return { status: 'ok', time: new Date().toISOString() };
  }
}
