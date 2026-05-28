# AgentFlow

A production-quality web application for creating AI agents, connecting tools, defining workflows visually, and executing automations — built with AI-assisted development.

## Overview

AgentFlow lets you build and orchestrate AI-powered workflows through a visual editor. Create agents with custom instructions and models, connect them to tools via MCP servers, and wire everything together into automated pipelines with triggers, conditions, and execution history.

## Tech Stack

| Layer | Technologies |
|---|---|
| Frontend | React, Vite, TypeScript, TailwindCSS, ShadCN UI, React Query, Zustand |
| Backend | NestJS, TypeScript |
| Database | PostgreSQL, Prisma ORM |
| Monorepo | Turborepo |

## Features

### Agent Management
- Create, edit, and delete AI agents
- Configure name, description, system instructions, and personality
- Set temperature, model selection, enabled tools, and MCP servers

### MCP (Model Context Protocol) Management
- Predefined and dynamic MCP servers
- Endpoint and authentication configuration
- Available tool definitions per server

### Visual Workflow Builder
- **Triggers:** Manual, Schedule, Webhook
- **Control Flow:** Condition, Switch, Merge
- **AI Nodes:** Run Agent, Agent Decision, Agent Review
- **MCP Nodes:** Execute MCP Tool, Fetch MCP Resource
- **Utility Nodes:** Delay, Set Variable, Transform Data, JSON Parser, Response, Notification, Log

### Workflow Management
- Create, edit, duplicate, delete workflows
- Enable/disable workflows
- Version control for workflows

### Workflow Execution
- Manual and trigger-based execution
- Retry and cancel support
- Status tracking, logs, and per-node execution history

### Dashboard
- Workflow and execution metrics
- Agent usage statistics
- MCP usage statistics

## Roadmap

- [ ] Workflow templates and agent templates
- [ ] Workflow import/export
- [ ] MCP Marketplace
- [ ] Collaboration and workflow sharing
- [ ] AI-generated workflow creation

## Project Phases

| Phase | Scope |
|---|---|
| Phase 1 | Authentication, Database, Agent CRUD, MCP CRUD |
| Phase 2 | Workflow Builder and Persistence |
| Phase 3 | Execution Engine and Run History |
| Phase 4 | Dashboard, Templates, AI Workflow Generation |
| Phase 5 | Testing, Documentation, and Final Demo |

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL
- pnpm (recommended for Turborepo)

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/agentflow.git
cd agentflow

# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env
# Edit .env with your database and API credentials

# Run database migrations
pnpm db:migrate

# Start all apps in development mode
pnpm dev
```

### Environment Variables

```env
DATABASE_URL=postgresql://user:password@localhost:5432/agentflow
JWT_SECRET=your_jwt_secret
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/your-feature`)
3. Commit your changes (`git commit -m 'Add your feature'`)
4. Push to the branch (`git push origin feature/your-feature`)
5. Open a Pull Request

## License

MIT
