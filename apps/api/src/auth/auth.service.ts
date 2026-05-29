import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import * as bcrypt from 'bcrypt'
import { randomBytes } from 'crypto'
import { UsersService } from '../users/users.service'
import { LoginDto } from './dto/login.dto'
import { RegisterDto } from './dto/register.dto'

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.usersService.findByEmail(dto.email)
    if (existing) throw new BadRequestException('Email already in use')

    const hashed = await bcrypt.hash(dto.password, 10)
    const user = await this.usersService.create({ ...dto, password: hashed })

    const token = this.jwtService.sign({ sub: user.id, email: user.email })
    return { token, user: { id: user.id, email: user.email, name: user.name } }
  }

  async login(dto: LoginDto) {
    const user = await this.usersService.findByEmail(dto.email)
    if (!user) throw new UnauthorizedException('Invalid credentials')

    const valid = await bcrypt.compare(dto.password, user.password)
    if (!valid) throw new UnauthorizedException('Invalid credentials')

    const token = this.jwtService.sign({ sub: user.id, email: user.email })
    return { token, user: { id: user.id, email: user.email, name: user.name } }
  }

  async forgotPassword(email: string) {
    const user = await this.usersService.findByEmail(email)
    if (!user) return { message: 'If that email exists, a reset link has been sent.' }

    const token = randomBytes(32).toString('hex')
    const expiry = new Date(Date.now() + 3_600_000) // 1 hour

    await this.usersService.setPasswordResetToken(user.id, token, expiry)

    // Replace with a real email provider in production
    console.log(`[DEV] Password reset link: http://localhost:3000/reset-password?token=${token}`)

    return { message: 'If that email exists, a reset link has been sent.' }
  }

  async resetPassword(token: string, newPassword: string) {
    const user = await this.usersService.findByResetToken(token)
    if (!user || !user.passwordResetExpiry || user.passwordResetExpiry < new Date()) {
      throw new BadRequestException('Invalid or expired reset token')
    }

    const hashed = await bcrypt.hash(newPassword, 10)
    await this.usersService.updatePassword(user.id, hashed)

    return { message: 'Password reset successfully' }
  }
}
