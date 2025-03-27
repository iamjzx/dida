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

#### Get your token

1. Open https://developer.dida365.com/manage and click "New App" to create your Dida365 (TickTick) app.
2. Click "Edit" app and configure the OAuth redirect URL "http://106.75.247.14:3999/oauth/callback"
3. Get your Client ID and Client Secret
4. Open "https://dida365.com/oauth/authorize?scope=tasks%3Aread%20tasks%3Awrite&client_id={client_id}&state=state&redirect_uri=http%3A%2F%2F106.75.247.14%3A3999%2Foauth%2Fcallback&response_type=code"

Don't forget to replace {client_id} with you client_id 

The server will return a form

5. Fill in your client_id and client_secret, then sumit to get your token.

#### Setup for Different Clients

##### Cursor

1. Open Cursor and go to Settings > MCP
2. Click on "Add new global MCP server"
3. Add the follwing configuration to mcp.json:

```json
"dida365": {
  "command": "node",
  "args": [
    "/k",
    "npx",
    "-y",
    "@smithery/cli@latest",
    "run",
    "@iamjzx/dida",
    "--config",
    "{\"token\":\"your token\"}"
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
    "/k",
    "npx",
    "-y",
    "@smithery/cli@latest",
    "run",
    "@iamjzx/dida",
    "--config",
    "{\"token\":\"your token\"}"
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