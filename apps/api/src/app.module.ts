import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { AgentsModule } from './agents/agents.module'
import { AuthModule } from './auth/auth.module'
import { McpModule } from './mcp/mcp.module'
import { PrismaModule } from './prisma/prisma.module'
import { SettingsModule } from './settings/settings.module'
import { UsersModule } from './users/users.module'
import { WorkflowsModule } from './workflows/workflows.module'
import { ExecutionsModule } from './executions/executions.module'

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    UsersModule,
    AgentsModule,
    McpModule,
    SettingsModule,
    WorkflowsModule,
    ExecutionsModule,
  ],
})
export class AppModule {}
