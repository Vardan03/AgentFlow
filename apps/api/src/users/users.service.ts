import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { UpdateProfileDto } from './dto/update-profile.dto'

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  findByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } })
  }

  findById(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
      select: { id: true, email: true, name: true, createdAt: true, updatedAt: true },
    })
  }

  create(data: { email: string; password: string; name?: string }) {
    return this.prisma.user.create({ data })
  }

  setPasswordResetToken(id: string, token: string, expiry: Date) {
    return this.prisma.user.update({
      where: { id },
      data: { passwordResetToken: token, passwordResetExpiry: expiry },
    })
  }

  findByResetToken(token: string) {
    return this.prisma.user.findFirst({ where: { passwordResetToken: token } })
  }

  updatePassword(id: string, password: string) {
    return this.prisma.user.update({
      where: { id },
      data: { password, passwordResetToken: null, passwordResetExpiry: null },
    })
  }

  updateProfile(id: string, dto: UpdateProfileDto) {
    return this.prisma.user.update({
      where: { id },
      data: dto,
      select: { id: true, email: true, name: true, createdAt: true, updatedAt: true },
    })
  }
}
