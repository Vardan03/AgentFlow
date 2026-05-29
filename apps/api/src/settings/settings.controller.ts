import { Body, Controller, Get, Patch, Request, UseGuards } from '@nestjs/common'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { UpdateSettingsDto } from './dto/update-settings.dto'
import { SettingsService } from './settings.service'

@Controller('settings')
@UseGuards(JwtAuthGuard)
export class SettingsController {
  constructor(private settingsService: SettingsService) {}

  @Get()
  getSettings(@Request() req: any) {
    return this.settingsService.getSettings(req.user.id)
  }

  @Patch()
  updateSettings(@Request() req: any, @Body() dto: UpdateSettingsDto) {
    return this.settingsService.updateSettings(req.user.id, dto)
  }
}
