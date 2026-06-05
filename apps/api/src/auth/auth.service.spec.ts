import { BadRequestException, UnauthorizedException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import * as bcrypt from 'bcrypt'
import { AuthService } from './auth.service'
import { UsersService } from '../users/users.service'

const mockUsersService = () => ({
  findByEmail: jest.fn(),
  create: jest.fn(),
  setPasswordResetToken: jest.fn(),
  findByResetToken: jest.fn(),
  updatePassword: jest.fn(),
})

const mockJwtService = () => ({
  sign: jest.fn().mockReturnValue('signed-token'),
})

const baseUser = {
  id: 'user-1',
  email: 'test@example.com',
  name: 'Test User',
  password: '',
  passwordResetToken: null,
  passwordResetExpiry: null,
  createdAt: new Date(),
  updatedAt: new Date(),
}

describe('AuthService', () => {
  let service: AuthService
  let users: ReturnType<typeof mockUsersService>
  let jwt: ReturnType<typeof mockJwtService>

  beforeEach(() => {
    users = mockUsersService()
    jwt = mockJwtService()
    service = new AuthService(users as unknown as UsersService, jwt as unknown as JwtService)
  })

  describe('register', () => {
    it('returns token and user on success', async () => {
      users.findByEmail.mockResolvedValue(null)
      users.create.mockResolvedValue({ ...baseUser })

      const result = await service.register({ email: 'test@example.com', password: 'pass123' })

      expect(result.token).toBe('signed-token')
      expect(result.user.email).toBe('test@example.com')
      expect(users.create).toHaveBeenCalledWith(
        expect.objectContaining({ email: 'test@example.com' }),
      )
    })

    it('hashes the password before storing', async () => {
      users.findByEmail.mockResolvedValue(null)
      users.create.mockResolvedValue({ ...baseUser })

      await service.register({ email: 'a@b.com', password: 'secret' })

      const storedPassword = users.create.mock.calls[0][0].password
      expect(storedPassword).not.toBe('secret')
      const valid = await bcrypt.compare('secret', storedPassword)
      expect(valid).toBe(true)
    })

    it('throws BadRequestException when email already exists', async () => {
      users.findByEmail.mockResolvedValue({ ...baseUser })

      await expect(service.register({ email: 'test@example.com', password: 'pass' })).rejects.toThrow(
        BadRequestException,
      )
    })
  })

  describe('login', () => {
    it('returns token and user with valid credentials', async () => {
      const hashed = await bcrypt.hash('correct', 10)
      users.findByEmail.mockResolvedValue({ ...baseUser, password: hashed })

      const result = await service.login({ email: 'test@example.com', password: 'correct' })

      expect(result.token).toBe('signed-token')
      expect(result.user.id).toBe('user-1')
    })

    it('throws UnauthorizedException when user not found', async () => {
      users.findByEmail.mockResolvedValue(null)

      await expect(service.login({ email: 'no@one.com', password: 'x' })).rejects.toThrow(
        UnauthorizedException,
      )
    })

    it('throws UnauthorizedException when password is wrong', async () => {
      const hashed = await bcrypt.hash('correct', 10)
      users.findByEmail.mockResolvedValue({ ...baseUser, password: hashed })

      await expect(service.login({ email: 'test@example.com', password: 'wrong' })).rejects.toThrow(
        UnauthorizedException,
      )
    })
  })

  describe('forgotPassword', () => {
    it('stores a reset token when user exists', async () => {
      users.findByEmail.mockResolvedValue({ ...baseUser })
      users.setPasswordResetToken.mockResolvedValue(undefined)

      const result = await service.forgotPassword('test@example.com')

      expect(users.setPasswordResetToken).toHaveBeenCalledWith(
        'user-1',
        expect.any(String),
        expect.any(Date),
      )
      expect(result.message).toContain('reset link')
    })

    it('returns generic message when user does not exist (no enumeration)', async () => {
      users.findByEmail.mockResolvedValue(null)

      const result = await service.forgotPassword('ghost@example.com')

      expect(users.setPasswordResetToken).not.toHaveBeenCalled()
      expect(result.message).toContain('reset link')
    })
  })

  describe('resetPassword', () => {
    it('resets password when token is valid and not expired', async () => {
      const future = new Date(Date.now() + 1_000_000)
      users.findByResetToken.mockResolvedValue({ ...baseUser, passwordResetExpiry: future })
      users.updatePassword.mockResolvedValue(undefined)

      const result = await service.resetPassword('valid-token', 'newpass')

      expect(users.updatePassword).toHaveBeenCalledWith('user-1', expect.any(String))
      const stored = users.updatePassword.mock.calls[0][1]
      expect(await bcrypt.compare('newpass', stored)).toBe(true)
      expect(result.message).toBe('Password reset successfully')
    })

    it('throws BadRequestException when token not found', async () => {
      users.findByResetToken.mockResolvedValue(null)

      await expect(service.resetPassword('bad-token', 'x')).rejects.toThrow(BadRequestException)
    })

    it('throws BadRequestException when token is expired', async () => {
      const past = new Date(Date.now() - 1_000)
      users.findByResetToken.mockResolvedValue({ ...baseUser, passwordResetExpiry: past })

      await expect(service.resetPassword('expired-token', 'x')).rejects.toThrow(BadRequestException)
    })
  })
})
