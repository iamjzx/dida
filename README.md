# Dida365 (TickTick) MCP Server

[![smithery badge](https://smithery.ai/badge/@iamjzx/dida)](https://smithery.ai/server/@iamjzx/dida)

This is a Model Context Protocol (MCP) server that provides tools for interacting with the Dida365 (TickTick) API. It allows AI assistants to manage tasks and projects in Dida365 after user authorization.

## Features

- User authentication with Dida365
- Get all projects (lists)
- Get tasks from a specific project or all tasks
- Create new tasks with various parameters
- Update existing tasks
- Delete tasks
- Create new projects

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Dida365 (TickTick) account

## Installation

### Option 1: Using Smithery CLI (Recommended)

You can install the Dida365 MCP server using Smithery CLI:

```bash
npx -y @smithery/cli@latest install @iamjzx/dida
```

During installation, you'll be prompted to enter:
- Your Dida365 Client ID
- Your Dida365 Client Secret
- Server port (defaults to 4000)

### Option 2: Direct Installation

1. Clone this repository
2. Install dependencies:

```bash
npm install
```

## Usage

### Prerequisites

1. Create your Dida365 (TickTick) app in https://developer.dida365.com/manage
2. Click "Edit" app and configure the OAuth redirect URL (e.g., http://localhost:4000/oauth/callback)
   - The port in the URL should match the port you'll use when running the server
3. Get your Client ID and Client Secret

### Setup for Different Clients

#### Cursor

```bash
npx -y @smithery/cli@latest run @iamjzx/dida --client cursor --config '{"clientId":"YOUR_CLIENT_ID","clientSecret":"YOUR_CLIENT_SECRET","port":"4000"}'
```

#### Claude Desktop

1. Open Claude Desktop and go to Settings > Developer
2. Enable Developer Mode
3. Click on "Edit Config" to open your claude_desktop_config.json
4. Add the following configuration to the "mcpServers" section:

```json
"dida365": {
  "command": "npx",
  "args": ["-y", "@smithery/cli@latest", "run", "@iamjzx/dida"],
  "env": {
    "CLIENT_ID": "YOUR_CLIENT_ID",
    "CLIENT_SECRET": "YOUR_CLIENT_SECRET",
    "SERVER_PORT": "4000"
  }
}
```

5. Save the file and restart Claude Desktop

#### Running Directly (Advanced)

If you've cloned the repository and installed dependencies, you can run the server directly:

```bash
# Set required environment variables
export CLIENT_ID=YOUR_CLIENT_ID
export CLIENT_SECRET=YOUR_CLIENT_SECRET
export SERVER_PORT=4000 # Optional, defaults to 4000

# Start the server
npm start
```

Or on Windows:

```cmd
set CLIENT_ID=YOUR_CLIENT_ID
set CLIENT_SECRET=YOUR_CLIENT_SECRET
set SERVER_PORT=4000
npm start
```

The server will run on port 4000 by default (or the port specified in the SERVER_PORT environment variable).

## MCP Tools

The server provides the following MCP tools:


### Projects

Get all projects:

```
dida365_getProjects
```

Create a new project:

```
dida365_createProject
```

Parameters:
- `name`: Project name
- `color`: (Optional) Project color

### Tasks

Get all tasks:

```
dida365_getTasks
```

Parameters:
- `projectId`: (Optional) Get tasks from a specific project

Create a new task:

```
dida365_createTask
```

Parameters:
- `title`: Task title
- `content`: (Optional) Task content/description
- `projectId`: (Optional) Project ID
- `startDate`: (Optional) Start date in ISO format
- `dueDate`: (Optional) Due date in ISO format
- `priority`: (Optional) Priority level (0-5)
- `reminders`: (Optional) Array of reminder times

Update a task:

```
dida365_updateTask
```

Parameters:
- `taskId`: Task ID to update
- `title`: (Optional) New task title
- `content`: (Optional) New task content
- `projectId`: (Optional) New project ID
- `startDate`: (Optional) New start date
- `dueDate`: (Optional) New due date
- `priority`: (Optional) New priority level
- `status`: (Optional) Task status (0 for not completed, 2 for completed)
- `reminders`: (Optional) New array of reminder times

Delete a task:

```
dida365_deleteTask
```

Parameters:
- `taskId`: Task ID to delete

## Security Considerations

- This server stores authentication tokens in memory. For production use, consider implementing a more secure token storage solution.
- Always use HTTPS in production to protect user credentials.
- The server does not implement rate limiting, which might be necessary to prevent API abuse.

## License

MIT 