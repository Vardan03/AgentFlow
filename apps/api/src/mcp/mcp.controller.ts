import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { CreateMcpServerDto } from './dto/create-mcp-server.dto'
import { UpdateMcpServerDto } from './dto/update-mcp-server.dto'
import { McpService } from './mcp.service'

@UseGuards(JwtAuthGuard)
@Controller('mcp')
export class McpController {
  constructor(private readonly mcpService: McpService) {}

  @Get()
  findAll() {
    return this.mcpService.findAll()
  }

  @Post()
  create(@Body() dto: CreateMcpServerDto) {
    return this.mcpService.create(dto)
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.mcpService.findOne(id)
  }

  @Get(':id/tools')
  listTools(@Param('id') id: string) {
    return this.mcpService.listTools(id)
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateMcpServerDto) {
    return this.mcpService.update(id, dto)
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.mcpService.remove(id)
  }
}
