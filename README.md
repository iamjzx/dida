# Dida365 (TickTick) MCP Server

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

1. Clone this repository
2. Install dependencies:

```bash
npm install
```

## Usage

1. Start the server:

```bash
npm start
```

2. The server will run on port 3001 by default (or the port specified in the PORT environment variable)

## MCP Tools

The server provides the following MCP tools:

### Authorization

Before using any other tools, you must authenticate with Dida365:

```
dida365_authorize
```

Parameters:
- `username`: Your Dida365 username (email)
- `password`: Your Dida365 password

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