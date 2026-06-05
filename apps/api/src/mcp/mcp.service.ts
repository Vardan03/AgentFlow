import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import type { CreateMcpServerDto } from './dto/create-mcp-server.dto'
import type { UpdateMcpServerDto } from './dto/update-mcp-server.dto'

@Injectable()
export class McpService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.mcpServer.findMany({ orderBy: { createdAt: 'desc' } })
  }

  async findOne(id: string) {
    const server = await this.prisma.mcpServer.findUnique({ where: { id } })
    if (!server) throw new NotFoundException('MCP server not found')
    return server
  }

  create(dto: CreateMcpServerDto) {
    return this.prisma.mcpServer.create({ data: dto })
  }

  async update(id: string, dto: UpdateMcpServerDto) {
    await this.findOne(id)
    return this.prisma.mcpServer.update({ where: { id }, data: dto })
  }

  async remove(id: string) {
    await this.findOne(id)
    return this.prisma.mcpServer.delete({ where: { id } })
  }

  async listTools(id: string): Promise<any[]> {
    const server = await this.findOne(id)
    try {
      const result = await this.jsonRpc(server, 'tools/list', {})
      return result?.tools ?? []
    } catch {
      return []
    }
  }

  async callTool(serverId: string, toolName: string, argsJson: string): Promise<string> {
    const server = await this.findOne(serverId)
    let args: Record<string, any> = {}
    if (argsJson.trim() && argsJson.trim() !== '{}') {
      try {
        args = JSON.parse(argsJson)
      } catch {
        throw new Error('Tool arguments must be valid JSON')
      }
    }
    const result = await this.jsonRpc(server, 'tools/call', { name: toolName, arguments: args })
    return this.extractContent(result)
  }

  async readResource(serverId: string, uri: string): Promise<string> {
    const server = await this.findOne(serverId)
    const result = await this.jsonRpc(server, 'resources/read', { uri })
    if (Array.isArray(result?.contents)) {
      return result.contents.map((c: any) => c.text ?? c.blob ?? '').join('\n')
    }
    return typeof result === 'string' ? result : JSON.stringify(result, null, 2)
  }

  private buildHeaders(server: any): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json, text/event-stream',
    }
    const cfg = server.authConfig as Record<string, string> | null
    if (server.authType === 'bearer') {
      headers['Authorization'] = `Bearer ${cfg?.token ?? ''}`
    } else if (server.authType === 'basic') {
      const creds = Buffer.from(`${cfg?.username ?? ''}:${cfg?.password ?? ''}`).toString('base64')
      headers['Authorization'] = `Basic ${creds}`
    } else if (server.authType === 'api_key') {
      if (cfg?.header && cfg?.value) headers[cfg.header] = cfg.value
    }
    return headers
  }

  private async jsonRpc(server: any, method: string, params: any): Promise<any> {
    const headers = this.buildHeaders(server)
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), 30_000)

    try {
      const response = await fetch(server.endpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify({ jsonrpc: '2.0', id: 1, method, params }),
        signal: controller.signal,
      })
      clearTimeout(timer)

      if (!response.ok) {
        const text = await response.text()
        throw new Error(`MCP server responded with ${response.status}: ${text.slice(0, 200)}`)
      }

      const text = await response.text()
      // Handle SSE-wrapped single response (some MCP servers wrap in event: message)
      const jsonText = text.startsWith('event:') ? (text.match(/data: (.+)/)?.[1] ?? text) : text
      const json = JSON.parse(jsonText)

      if (json.error) {
        throw new Error(`MCP error ${json.error.code ?? ''}: ${json.error.message}`)
      }
      return json.result
    } catch (err: any) {
      clearTimeout(timer)
      if (err.name === 'AbortError') throw new Error('MCP request timed out after 30s')
      throw err
    }
  }

  private extractContent(result: any): string {
    if (!result) return ''
    if (result.isError) {
      const text = Array.isArray(result.content)
        ? result.content.filter((c: any) => c.type === 'text').map((c: any) => c.text).join('\n')
        : 'Tool execution returned an error'
      throw new Error(text)
    }
    if (Array.isArray(result.content)) {
      const parts = result.content.filter((c: any) => c.type === 'text').map((c: any) => c.text)
      if (parts.length) return parts.join('\n')
    }
    return typeof result === 'string' ? result : JSON.stringify(result, null, 2)
  }
}
