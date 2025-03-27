import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import axios from 'axios';
import {dirname} from 'path';
import { fileURLToPath } from 'url';
import path from 'node:path';
import fs from 'fs';



const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);


// Create a custom logger that writes to file instead of console
const logFilePath = path.join(__dirname, 'server.log');
const logger = {
  log: (message) => appendToLogFile(`[LOG] ${message}`),
  error: (message) => appendToLogFile(`[ERROR] ${message}`),
  debug: (message) => appendToLogFile(`[DEBUG] ${message}`),
  info: (message) => appendToLogFile(`[INFO] ${message}`)
};

function appendToLogFile(message) {
  const timestamp = new Date().toLocaleString();
  const logMessage = `${timestamp} - ${message}\n`;
  fs.appendFileSync(logFilePath, logMessage);
}


// Create an MCP server
const server = new McpServer({
  name: "ticktick-mcp",
  version: "1.0.0"
});


// 存储访问令牌
let access = {
  token: process.env.TOKEN,
  expireAt: null
};


   
function initializeClientInfo() {
  if (!access.token) {
    logger.error('TOKEN is not set');
    process.exit(1);
  }
}
   
// 调用初始化函数
initializeClientInfo();

function formatTime(time) {
  return time ? new Date(time).toISOString().replace('Z', '+0000') : null
}

server.tool('localTime',{},async() => {
  return {
    content: [{ type: "text", text: `Local time: ${new Date().toLocaleString()}` }]
  }
})

//创建任务
server.tool('createTask',{
  title: z.string(), 
  content: z.string(),
   dueDate: z.string().optional(),
   desc: z.string().optional(),
   isAllDay: z.boolean().optional(),
   startDate: z.string().optional(),
   timeZone: z.string().optional(),
   reminders: z.array().optional(),
   repeatFlag: z.string().optional(),
   priority: z.string().optional(),
   sortOrder: z.number().optional(),
   items: z.array(z.object({
    title: z.string(),
    startDate: z.string().optional(),
    sortOrder: z.number().optional(),
    isAllDay: z.boolean().optional(),
    timeZone: z.string().optional(),
    status:z.number().optional(),
    completedTime: z.string().optional(),
   })).optional(),
  },async({title, content, dueDate, desc, isAllDay, startDate, timeZone, reminders, repeatFlag, priority, sortOrder, items}) => {
  //await getAuthorization();
  try {
    const response = await axios.post(`${baseUrl}/task`, {
      title,
      content,
      dueDate:formatTime(dueDate),
      desc,
      isAllDay,
      startDate:formatTime(startDate),
      timeZone,
      reminders,
      repeatFlag,
      priority,
      sortOrder,
      items
    },{
      headers: {
        'Authorization': `Bearer ${access.token}`
      }
    });

    return {
      content: [{ type: "text", text: `Task created successfully: ${JSON.stringify(response.data)}` }]
    };
  } catch (error) {
    logger.error(`Error creating task: ${error.message}`);
    return {
      content: [{ type: "text", text: `Error creating task: ${error.message}` }],
      isError: true
    };
  }
})

//获取用户project
server.tool('getUserProject', {}, async() => {
  try {
    const response = await axios.get(`${baseUrl}/project`, {
      headers: {
        'Authorization': `Bearer ${access.token}`
      }
    })
  return {
      content: [{ type: "text", text: `Project: ${JSON.stringify(response.data)}` }]
    }
  } catch (error) {
    logger.error(`Error getting user projects: ${error.message}`);
    return {
      content: [{ type: "text", text: `Error getting user projects: ${error.message}` }],
      isError: true
    };
  }
})

//根据id查询project
server.tool('getProjectById', {id: z.string()}, async({id}) => {
  try {
    const response = await axios.get(`${baseUrl}/project/${id}`, {
      headers: {
        'Authorization': `Bearer ${access.token}` 
      }
    })
    return {
      content: [{ type: "text", text: `Project: ${JSON.stringify(response.data)}` }]
    }
  } catch (error) {
    logger.error(`Error getting project: ${error.message}`);
    return {
      content: [{ type: "text", text: `Error getting project: ${error.message}` }],
      isError: true
    };
  }
})

//根据project ID 查询 project 和 task 数据
server.tool('getProjectWithData', {id: z.string()}, async({id}) => {
  try {
    const response = await axios.get(`${baseUrl}/project/${id}/data`, {
      headers: {
        'Authorization': `Bearer ${access.token}`     
      }
    })
    return {
      content: [{ type: "text", text: `Project: ${JSON.stringify(response.data)}` }]
    }
  } catch (error) {
    logger.error(`Error getting project with tasks: ${error.message}`);
    return {
      content: [{ type: "text", text: `Error getting project with tasks: ${error.message}` }],
      isError: true
    };
  } 
})

//根据project ID 和 task ID查询 task
server.tool('getTaskById', {projectId: z.string(), taskId: z.string()}, async({id}) => {
  try {
    const response = await axios.get(`${baseUrl}/project/${projectId}/task/${taskId}`, {
      headers: {
        'Authorization': `Bearer ${access.token}` 
      }
    })
    return {
      content: [{ type: "text", text: `Task: ${JSON.stringify(response.data)}` }]
    }
  } catch (error) {
    logger.error(`Error getting task: ${error.message}`);
    return {
      content: [{ type: "text", text: `Error getting task: ${error.message}` }],
      isError: true
    };
  }
})  

//更新任务
server.tool('updateTask', {
  title: z.string().optional(), 
  content: z.string().optional(),
  projectId: z.string(),
  id: z.string(),
  taskId: z.string(),
   dueDate: z.string().optional(),
   desc: z.string().optional(),
   isAllDay: z.boolean().optional(),
   startDate: z.string().optional(),
   timeZone: z.string().optional(),
   reminders: z.array(z.object({
    type: z.string(),
    time: z.string(),
    title: z.string(),
    content: z.string(),
    isAllDay: z.boolean()
   })).optional(),
   repeatFlag: z.string().optional()  ,
   priority: z.string().optional(),
   sortOrder: z.number().optional(),
   items: z.array(z.object({
    title: z.string(),
    startDate: z.string().optional(),
    sortOrder: z.number().optional(),
    isAllDay: z.boolean().optional(),
    timeZone: z.string().optional(),
    status:z.number().optional(),
    completedTime: z.string().optional(),
   })).optional(),
}, async({ title, content, dueDate,taskId, id, projectId, desc, isAllDay, startDate, timeZone, reminders, repeatFlag, priority, sortOrder, items}) => {
  try {
    const response = await axios.post(`${baseUrl}/task/${taskId}`, {
      title,
      content,  
      id,
      projectId,
      dueDate: formatTime(dueDate),
      desc,
      isAllDay,
      startDate: formatTime(startDate),
      timeZone,
      reminders,
      repeatFlag,
      priority,
      sortOrder,
      items
    },{
      headers: {
        'Authorization': `Bearer ${access.token}`
      }
    })
    return {
      content: [{ type: "text", text: `Task updated successfully: ${JSON.stringify(response.data)}` }]
    }
  } catch (error) {
    logger.error(`Error updating task: ${error.message}`);
    return {  
      content: [{ type: "text", text: `Error updating task: ${error.message}` }],
      isError: true
    };
  }
})

//完成任务
server.tool('completeTask', {projectId: z.string(), taskId: z.string()}, async({projectId, taskId}) => {  
  try {
    const response = await axios.post(`${baseUrl}/project/${projectId}/task/${taskId}/complete`, {
      headers: {
        'Authorization': `Bearer ${access.token}`
      }
    })
    return {
      content: [{ type: "text", text: `Task completed successfully: ${JSON.stringify(response.data)}` }]
    }
  } catch (error) {
    logger.error(`Error completing task: ${error.message}`);
    return {
      content: [{ type: "text", text: `Error completing task: ${error.message}` }], 
      isError: true
    };
  }
})

//删除任务
server.tool('deleteTask', {projectId: z.string(), taskId: z.string()}, async({projectId, taskId}) => {
  try {
    const response = await axios.delete(`${baseUrl}/project/${projectId}/task/${taskId}`, {
      headers: {
        'Authorization': `Bearer ${access.token}`
      }
    })
    return {
      content: [{ type: "text", text: `Task deleted successfully: ${JSON.stringify(response.data)}` }]
    }
  } catch (error) {
    logger.error(`Error deleting task: ${error.message}`);
    return {
      content: [{ type: "text", text: `Error deleting task: ${error.message}` }],
      isError: true
    };
  }
})

//创建project
server.tool('createProject', {name: z.string(), color: z.string().optional(), sortOrder: z.number().optional(), kind: z.string().optional(), viewMode: z.string().optional()}, async({name, color, sortOrder, kind, viewMode}) => {
  try {
    const response = await axios.post(`${baseUrl}/project`, {
      name,
      color: color || '#F18181',
      sortOrder,
      kind: kind || 'TASK',
      viewMode: viewMode || 'list'
    },{
      headers: {
        'Authorization': `Bearer ${access.token}`
      }
    })
    return {
      content: [{ type: "text", text: `Project created successfully: ${JSON.stringify(response.data)}` }]
    }
  } catch (error) {
    logger.error(`Error creating project: ${error.message}`);
    return {
      content: [{ type: "text", text: `Error creating project: ${error.message}` }],
      isError: true
    };
  } 
})

//更新project 
server.tool('updateProject', {projectId: z.string().optional(), name: z.string().optional(), color: z.string().optional(), kind: z.string().optional(), viewMode: z.string().optional()}, async({projectId, name, color, kind, viewMode}) => {
  try {
    const response = await axios.put(`${baseUrl}/project/${projectId}`, {
      name,
      color: color || '#F18181',  
      kind: kind || 'TASK',
      viewMode: viewMode || 'list',
      sortOrder
    },{
      headers: {
        'Authorization': `Bearer ${access.token}`
      }
    })
    return {
      content: [{ type: "text", text: `Project updated successfully: ${JSON.stringify(response.data)}` }]
    }
  } catch (error) {
    logger.error(`Error updating project: ${error.message}`);
    return {
      content: [{ type: "text", text: `Error updating project: ${error.message}` }],
      isError: true
    };
  }
})

// Start receiving messages on stdin and sending messages on stdout
const transport = new StdioServerTransport();
await server.connect(transport);