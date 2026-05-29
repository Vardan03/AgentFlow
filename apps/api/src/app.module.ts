import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { AgentsModule } from './agents/agents.module'
import { AuthModule } from './auth/auth.module'
import { PrismaModule } from './prisma/prisma.module'
import { SettingsModule } from './settings/settings.module'
import { UsersModule } from './users/users.module'

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    UsersModule,
    AgentsModule,
    SettingsModule,
  ],
})
export class AppModule {}
