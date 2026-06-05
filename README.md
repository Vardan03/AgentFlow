# AgentFlow

A visual AI agent and workflow automation platform. Create agents, wire them into workflows on a drag-and-drop canvas, and execute them with full run history and metrics.

## Tech Stack

| Layer | Technologies |
|-------|-------------|
| Frontend | React 18, Vite, TypeScript, TailwindCSS, ShadCN UI, React Query, Zustand, ReactFlow |
| Backend | NestJS, TypeScript, Prisma ORM |
| Database | PostgreSQL |
| Monorepo | Turborepo + pnpm workspaces |

---

## Features

### Agents
- Create agents with model, system prompt, personality, temperature, and enabled tools
- Assign MCP servers to extend agent capabilities
- Supported providers: OpenAI, Anthropic, Google, Groq, Mistral, Grok, Qwen

### MCP (Model Context Protocol)
- Connect predefined or custom MCP servers (JSON-RPC 2.0 over HTTP)
- Browse available tools and resources per server
- Per-server endpoint and authentication configuration

### Workflow Builder — 19 node types

| Category | Nodes |
|----------|-------|
| Triggers | Manual, Webhook, Schedule (cron) |
| AI | Run Agent, Agent Decision, Agent Review |
| Control | Condition, Switch, Merge, Delay |
| MCP | Execute Tool, Fetch Resource |
| Utility | HTTP Request, Transform, JSON Parser, Set Variable, Log, Notification, Response |

### Execution Engine
- Recursive graph walker with `{{input}}` / `{{var.name}}` substitution
- Branching nodes (Condition, Switch, Agent Decision, Agent Review) route to one matched branch
- Nodes with multiple outgoing edges trigger parallel execution; `Merge` collects branch outputs
- Merge supports **Any** (first branch wins) and **All** (wait + combine) modes

### Workflow Management
- Create, edit, duplicate, delete, enable / disable
- Import / Export as JSON
- Webhook triggers — auto-generated public URL with token
- Schedule triggers — standard 5-field cron with live scheduling
- Workflow templates gallery (6 built-in templates)
- AI workflow generation (describe in plain English)

### Execution History
- Per-node logs: input, output, status, duration
- Retry any past execution
- Execution timeline on the dashboard

### Dashboard
- Total agents, workflows, executions, success rate
- Agent usage breakdown (runs + success rate per agent node)
- MCP usage breakdown (call volume per tool/resource node)
- Recent execution feed with live 30s refresh

---

## Prerequisites

| Tool | Minimum version |
|------|----------------|
| Node.js | 20 |
| pnpm | 9 |
| PostgreSQL | 15 |

---

## Quick Start

### 1. Clone and install

```bash
git clone <repo-url>
cd AgentFlow
pnpm install
```

### 2. Configure environment

Create `apps/api/.env`:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/agentflow
JWT_SECRET=change-me-to-a-long-random-string

# Add whichever LLM providers you want:
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
GOOGLE_API_KEY=...
GROQ_API_KEY=...
MISTRAL_API_KEY=...
```

### 3. Set up the database

```bash
pnpm --filter db migrate:dev
# or, for a fresh database without migration history:
pnpm --filter db db:push
```

### 4. Start development servers

```bash
pnpm dev
```

| Service | URL |
|---------|-----|
| Frontend | http://localhost:5173 |
| Backend API | http://localhost:3000 |

---

## Environment Variables

### `apps/api/.env`

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `JWT_SECRET` | Yes | Secret used to sign JWT tokens |
| `OPENAI_API_KEY` | Optional | Enables GPT-4o and other OpenAI models |
| `ANTHROPIC_API_KEY` | Optional | Enables Claude models |
| `GOOGLE_API_KEY` | Optional | Enables Gemini models |
| `GROQ_API_KEY` | Optional | Enables Groq-hosted models |
| `MISTRAL_API_KEY` | Optional | Enables Mistral models |
| `GROK_API_KEY` | Optional | Enables xAI Grok models |
| `QWEN_API_KEY` | Optional | Enables Alibaba Qwen models |

---

## Project Structure

```
apps/
  web/              # React + Vite + TypeScript frontend
    src/
      pages/        # Route-level pages (dashboard, agents, workflows, mcp)
        workflows/
          nodes/    # One component per node type
      hooks/        # React Query hooks for all API calls
      store/        # Zustand global state
      components/
  api/              # NestJS backend
    src/
      auth/         # JWT authentication (register, login, guards)
      agents/       # Agent CRUD + LLM runner
      mcp/          # MCP server CRUD + JSON-RPC client
      workflows/    # Workflow CRUD + AI generator service
      executions/   # Execution runner + history service
      scheduler/    # Cron-based schedule trigger (NestJS schedule)
      webhooks/     # Public webhook trigger (no JWT)
      dashboard/    # Aggregate metrics queries
packages/
  db/               # Prisma schema and migrations
  shared/           # Shared TypeScript types
```

---

## Architecture

### Execution Engine

The `ExecutionRunnerService` walks the workflow graph recursively:

```
executeFrom(nodeId, input) → execute node → route to next node(s)
```

**Routing rules:**

| Node type | Outgoing behaviour |
|-----------|-------------------|
| `control.condition` | Follows `yes` or `no` handle based on a JS expression |
| `ai.agent_decision` | Agent answers yes/no; routes accordingly |
| `ai.agent_review` | Agent answers approved/rejected; routes accordingly |
| `control.switch` | Matches input against cases; falls back to `default` handle |
| Any node with 2+ outputs | Parallel `Promise.all` — all outgoing branches run concurrently |
| `control.merge` (Any) | First branch to arrive continues; others are dropped |
| `control.merge` (All) | Waits for every branch, then joins outputs with a separator |

Variable substitution is available in all text fields: `{{input}}` injects the previous node's output; `{{var.name}}` reads a stored variable.

---

## Common Commands

```bash
pnpm install                       # install all dependencies
pnpm dev                           # run frontend + backend together
pnpm --filter web dev              # frontend only
pnpm --filter api dev              # backend only
pnpm build                         # production build
pnpm lint                          # lint all packages
pnpm test                          # run all tests
pnpm --filter api test             # backend tests only
pnpm --filter db migrate:dev       # create and apply a new migration
pnpm --filter db studio            # open Prisma Studio
```

---

## Demo Script

1. **Register** at `http://localhost:5173` and log in.
2. **Create an agent** — Agents → New Agent — pick a model and write a system prompt.
3. **Build a workflow** — Workflows → New Workflow:
   - Drag **Manual Trigger** → **Run Agent** → **Response** onto the canvas
   - Configure the Run Agent node (select your agent, optionally set an input message)
   - Click **Save**, then **Run**
4. **View logs** — click the History icon (clock) in the editor toolbar.
5. **Add a condition branch**:
   - Add a **Condition** node between Run Agent and Response
   - Set condition to e.g. `output.length > 50`
   - Connect YES to a **Log** node and NO to another **Log** node; both lead to a **Merge** → **Response**
6. **Webhook trigger**:
   - Swap Manual Trigger for **Webhook Trigger** → click "Generate webhook URL" in the settings panel
   - `curl -X POST <url> -H "Content-Type: application/json" -d '{"text":"hello"}'`
7. **Dashboard** — return to the home page to see metrics update.

---

## License

MIT
