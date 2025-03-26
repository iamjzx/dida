# Dida365 (TickTick) MCP Server

This is a Model Context Protocol (MCP) server that provides tools for interacting with the Dida365 (TickTick) API. It allows AI assistants to manage tasks and projects in Dida365 after user authorization.

## Features

- User authentication with Dida365
- Get all projects (lists)
- Get tasks from collection box
- Create new tasks with various parameters
- Update existing tasks in collection box
- Delete tasks in collection box
- Create new projects

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Dida365 (TickTick) account

## We recommend that you clone the repository and run it locally:

### Installation

1. Clone this repository
2. Install dependencies:

```bash
npm install
```

### Usage

#### Prerequisites

1. Open https://developer.dida365.com/manage and click "New App" to create your Dida365 (TickTick) app.
2. Click "Edit" app and configure the OAuth redirect URL (e.g., http://localhost:4000/oauth/callback)
   - The port in the URL should match the port you'll use when running the server(We use port 4000 by default)
3. Get your Client ID and Client Secret
4. Enter your Client ID and Client Secret in dida/.env file, you can also change the port of the server(4000 by default).

#### Setup for Different Clients

##### Cursor

1. Open Cursor and go to Settings > MCP
2. Click on "Add new global MCP server"
3. Add the follwing configuration to mcp.json:

```json
"dida365": {
  "command": "node",
  "args": [
    "your repository path/dida/src/tick.js"
  ]
}
```

4. Save the file and enable the mcp.

##### Claude Desktop

1. Open Claude Desktop and go to Settings > Developer
2. Enable Developer Mode
3. Click on "Edit Config" to open your claude_desktop_config.json
4. Add the following configuration to the "mcpServers" section:

```json
"dida365": {
  "command": "node",
  "args": [
    "your repository path/dida/src/tick.js"
  ]
}
```

5. Save the file and restart Claude Desktop

## Logs

You can view the service runtime logs in the `src/server.log` file.

## Unfinished

Due to the lack of api, we can't do the following:

1. Get tasks from a specific project
2. Update existing tasks in a specific project
3. Delete tasks in a specific project
4. Create new tasks in a specific project