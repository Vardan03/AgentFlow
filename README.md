# AgentFlow

A visual AI agent and workflow automation platform. Create AI agents, wire them into workflows on a drag-and-drop canvas, and execute them with full run history and metrics.

---

## What It Does

- **Agents** — configure a named LLM instance (provider, model, system prompt, temperature). Supports Anthropic, OpenAI, Google Gemini, DeepSeek, Grok, and Qwen.
- **Workflows** — build automation pipelines visually using 19 node types: triggers, AI nodes, control flow, MCP tools, and utilities.
- **Execution** — run workflows manually, on a cron schedule, or via a webhook. Every run records per-node logs, inputs, outputs, and duration.
- **MCP Servers** — connect any Model Context Protocol server to give agents access to external tools and data.
- **Dashboard** — see execution counts, success rates, agent usage, and MCP call volume.

---

## Prerequisites

You need the following installed before starting:

| Tool | Minimum version | Check |
|------|----------------|-------|
| Node.js | 20 | `node --version` |
| pnpm | 9 | `pnpm --version` |
| PostgreSQL | 15 | `psql --version` |

### Installing Node.js (if needed)
Download from https://nodejs.org and install the LTS version (20+).

### Installing pnpm (if needed)
```bash
npm install -g pnpm@9
```

### Installing PostgreSQL (if needed)
- **Windows**: Download the installer from https://www.postgresql.org/download/windows/
- **macOS**: `brew install postgresql@15 && brew services start postgresql@15`
- **Linux (Ubuntu/Debian)**: `sudo apt install postgresql postgresql-contrib`

---

## Step-by-Step Setup

### Step 1 — Clone the repository

```bash
git clone <repo-url>
cd AgentFlow
```

### Step 2 — Install all dependencies

This installs packages for all apps and packages in the monorepo at once:

```bash
pnpm install
```

You should see pnpm create a `node_modules` directory at the root and inside each app. This may take a minute.

---

### Step 3 — Create a PostgreSQL database

Open a terminal and connect to PostgreSQL:

```bash
psql -U postgres
```

> If `postgres` user doesn't work, try `psql -U $USER` on macOS/Linux, or open pgAdmin on Windows.

Inside the psql prompt, create the database and a dedicated user:

```sql
CREATE DATABASE agentflow;
CREATE USER agentflow_user WITH PASSWORD 'your_password_here';
GRANT ALL PRIVILEGES ON DATABASE agentflow TO agentflow_user;
\q
```

> You can also use the default `postgres` user if you prefer — just use those credentials in Step 4.

**Verify** it worked:
```bash
psql -U agentflow_user -d agentflow -c "SELECT 1;"
```
You should see `?column? = 1`.

---

### Step 4 — Configure environment variables

Create the file `apps/api/.env` (this file is not committed to git):

```bash
# On macOS/Linux:
cp apps/api/.env.example apps/api/.env 2>/dev/null || touch apps/api/.env

# On Windows (PowerShell):
New-Item apps/api/.env -ItemType File -Force
```

Open `apps/api/.env` in any text editor and add:

```env
# Required — PostgreSQL connection string
# Format: postgresql://USER:PASSWORD@HOST:PORT/DATABASE
DATABASE_URL=postgresql://agentflow_user:your_password_here@localhost:5432/agentflow

# Required — a long random string used to sign JWT tokens
# Generate one with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
JWT_SECRET=paste-your-generated-secret-here
```

**Generate a secure JWT secret** by running:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```
Copy the output and paste it as the value for `JWT_SECRET`.

> **Note:** AI provider API keys (Anthropic, OpenAI, etc.) are NOT environment variables. Each user enters their own keys after registering, via the Settings page in the app.

---

### Step 5 — Run database migrations

This creates all the tables in your PostgreSQL database:

```bash
pnpm --filter db migrate:dev
```

When prompted for a migration name, type something like `init` and press Enter.

**Expected output:**
```
Your database is now in sync with your schema.
✔  Generated Prisma Client
```

**Verify** the tables were created:
```bash
psql -U agentflow_user -d agentflow -c "\dt"
```
You should see tables: `User`, `Agent`, `McpServer`, `Workflow`, `Execution`.

---

### Step 6 — Start the development servers

```bash
pnpm dev
```

This starts both the frontend and backend in parallel using Turborepo.

| Service | URL | Description |
|---------|-----|-------------|
| Frontend | http://localhost:5173 | React app (Vite dev server) |
| Backend API | http://localhost:3000 | NestJS REST API |

Wait until you see both:
- `VITE v5.x.x  ready in ...ms` (frontend)
- `Nest application successfully started` (backend)

**Verify** the backend is running:
```bash
curl http://localhost:3000/auth/me
# Should return: {"message":"Unauthorized","statusCode":401}
```

**Verify** the frontend is running: Open http://localhost:5173 in your browser. You should see the AgentFlow login page.

---

### Step 7 — Create your account

1. Open http://localhost:5173 in your browser.
2. Click **Register** and create an account with your email and password.
3. You'll be redirected to the Dashboard automatically.

---

### Step 8 — Add your AI API key

Before you can run any agents, you need to add at least one AI provider key:

1. Click **Settings** in the left sidebar.
2. Enter your API key for any provider you have access to:
   - **Anthropic** (Claude) — get one at https://console.anthropic.com
   - **OpenAI** (GPT) — get one at https://platform.openai.com
   - **Google Gemini** — get one at https://aistudio.google.com
   - **DeepSeek** — get one at https://platform.deepseek.com
   - **Grok (xAI)** — get one at https://console.x.ai
   - **Qwen (Alibaba)** — get one at https://dashscope.aliyuncs.com
3. Click **Save Settings**.

> API keys are stored securely in the database and are only used server-side when running agents.

---

## You're Ready

Here's a quick tour to verify everything works:

### Create your first agent

1. Click **Agents** → **New Agent**
2. Fill in:
   - **Name**: `My First Agent`
   - **Provider**: select the provider whose key you added
   - **Model**: select any model from the dropdown
   - **System Instructions**: e.g. `You are a helpful assistant.`
3. Click **Save Agent**
4. Click the **Test** button (beaker icon) and send a message to verify the agent responds

### Build your first workflow

1. Click **Workflows** → **New Workflow**, give it a name
2. From the node palette on the left, drag these onto the canvas:
   - **Manual Trigger**
   - **Run Agent**
   - **Response**
3. Connect them: Manual Trigger → Run Agent → Response
4. Click the **Run Agent** node and select your agent from the dropdown
5. Click **Save**, then click **Run**
6. The execution panel will appear showing the result and per-node logs

---

## Common Commands Reference

```bash
# Install dependencies
pnpm install

# Run everything in dev mode (frontend + backend)
pnpm dev

# Run only the frontend
pnpm --filter web dev

# Run only the backend
pnpm --filter api dev

# Run all tests
pnpm test

# Run only backend tests
pnpm --filter api test

# Run backend tests with coverage report
pnpm --filter api test:cov

# Apply a new database migration (after schema changes)
pnpm --filter db migrate:dev

# Open Prisma Studio (visual database browser)
pnpm --filter db studio

# Production build
pnpm build

# Lint all packages
pnpm lint
```

---

## Troubleshooting

### `pnpm install` fails
- Make sure you're running Node.js 20+: `node --version`
- Make sure pnpm is version 9+: `pnpm --version`
- Try deleting `node_modules` and `pnpm-lock.yaml` and running `pnpm install` again

### Database migration fails — connection refused
- PostgreSQL is not running. Start it:
  - **macOS**: `brew services start postgresql@15`
  - **Linux**: `sudo systemctl start postgresql`
  - **Windows**: Start the PostgreSQL service from Services or pgAdmin
- Double-check your `DATABASE_URL` in `apps/api/.env` — verify the username, password, host, port, and database name

### Backend starts but shows Prisma errors
- Run `pnpm --filter db migrate:dev` again
- If the database was already migrated, run `pnpm --filter db migrate:reset` to reset it (this deletes all data)

### "No Anthropic API key found" when running an agent
- You need to add your API key in the Settings page (not in `.env`)
- Make sure you selected the right provider when creating the agent

### Frontend shows blank page or can't connect to API
- Confirm the backend is running on port 3000 (`curl http://localhost:3000/auth/me`)
- Check that `apps/web/src/lib/api.ts` has the correct base URL pointing to `http://localhost:3000`

### Port already in use
- Kill the process on the port:
  - **macOS/Linux**: `lsof -ti:3000 | xargs kill` or `lsof -ti:5173 | xargs kill`
  - **Windows**: `netstat -ano | findstr :3000` then `taskkill /PID <pid> /F`

---

## Project Structure

```
AgentFlow/
├── apps/
│   ├── web/                  # React 18 + Vite + TypeScript frontend
│   │   └── src/
│   │       ├── pages/        # Route-level pages
│   │       │   ├── auth/     # Login, register, forgot/reset password
│   │       │   ├── agents/   # Agent list, create, edit, test
│   │       │   ├── workflows/# Workflow list, editor, history, templates
│   │       │   ├── mcp/      # MCP server management
│   │       │   ├── dashboard.tsx
│   │       │   └── settings.tsx
│   │       ├── hooks/        # React Query hooks (use-agents, use-workflows, ...)
│   │       ├── store/        # Zustand stores (auth token)
│   │       └── components/   # Shared UI components + layout
│   └── api/                  # NestJS 10 backend
│       └── src/
│           ├── auth/         # JWT authentication, guards, password reset
│           ├── users/        # User profile management
│           ├── agents/       # Agent CRUD + multi-provider LLM runner
│           ├── mcp/          # MCP server CRUD + JSON-RPC 2.0 client
│           ├── workflows/    # Workflow CRUD + AI graph generator
│           ├── executions/   # Execution engine + run history
│           ├── scheduler/    # Cron job management (@nestjs/schedule)
│           ├── webhooks/     # Public webhook trigger endpoint
│           └── settings/     # User API key storage
└── packages/
    ├── db/                   # Prisma schema + migrations
    └── shared/               # Shared TypeScript types
```

---

## Environment Variables

Only two variables are required to run the application:

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | **Yes** | PostgreSQL connection string |
| `JWT_SECRET` | **Yes** | Secret for signing JWT tokens — use a long random string |

AI provider API keys are **not** environment variables. Each user stores their own keys in the app via the Settings page. This means multiple users can use different AI providers simultaneously, and you don't need any API keys to start the server.

---

## Tech Stack

| Layer | Technologies |
|-------|-------------|
| Frontend | React 18, Vite, TypeScript, TailwindCSS, ShadCN UI |
| State | TanStack React Query (server state), Zustand (client state) |
| Canvas | React Flow (`@xyflow/react`) |
| Backend | NestJS 10, TypeScript |
| Database | PostgreSQL + Prisma ORM |
| Auth | JWT (passport-jwt), bcrypt |
| AI SDKs | `@anthropic-ai/sdk`, `openai`, `@google/generative-ai` |
| Scheduling | `@nestjs/schedule` + `cron` |
| Monorepo | Turborepo + pnpm workspaces |
| Testing | Jest + ts-jest |

---

## Workflow Node Types

| Category | Node | What it does |
|----------|------|-------------|
| Triggers | Manual Trigger | Starts a workflow run from the UI |
| | Schedule Trigger | Runs on a cron expression (e.g. `0 9 * * 1`) |
| | Webhook Trigger | Starts when an HTTP POST hits the workflow's unique URL |
| AI | Run Agent | Sends a message to a configured AI agent and returns the response |
| | Agent Decision | Agent answers yes/no to a question; routes to the matching branch |
| | Agent Review | Agent reviews content against criteria; routes approved/rejected |
| Control | Condition | Evaluates a JavaScript expression; routes yes or no |
| | Switch | Matches input against labeled cases; routes to the matching branch |
| | Merge | Collects parallel branch outputs (any = first wins, all = wait + combine) |
| | Delay | Pauses for up to 60 seconds |
| MCP | Execute Tool | Calls a tool on a connected MCP server |
| | Fetch Resource | Reads a resource from a connected MCP server |
| Utility | HTTP Request | Makes an outbound GET/POST/PUT/PATCH/DELETE request |
| | JSON Parser | Extracts a field from JSON by dot-notation path (e.g. `data.items.0.name`) |
| | Transform Data | Applies a template string — use `{{input}}` and `{{var.name}}` |
| | Set Variable | Stores a named variable for use in later nodes |
| | Log | Records a message to the execution log (pass-through) |
| | Notification | Sends a JSON payload to a webhook URL (e.g. Slack, Discord) |
| | Response | Marks the end of a workflow path |
