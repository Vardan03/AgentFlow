import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { UpdateSettingsDto } from './dto/update-settings.dto'

@Injectable()
export class SettingsService {
  constructor(private prisma: PrismaService) {}

  getSettings(userId: string) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        anthropicApiKey: true,
        createdAt: true,
      },
    })
  }

  updateSettings(userId: string, dto: UpdateSettingsDto) {
    return this.prisma.user.update({
      where: { id: userId },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.anthropicApiKey !== undefined && { anthropicApiKey: dto.anthropicApiKey }),
      },
      select: {
        id: true,
        name: true,
        email: true,
        anthropicApiKey: true,
      },
    })
  }
}
