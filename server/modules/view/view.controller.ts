import { Controller, Get, Render } from '@nestjs/common';

/**
 * SPA 路由兜底:所有非 /api 请求返回 index.html,
 * 由前端路由接管。
 */
@Controller()
export class ViewController {
  @Get(['/', '*'])
  @Render('index')
  async render(): Promise<Record<string, never>> {
    return {};
  }
}
