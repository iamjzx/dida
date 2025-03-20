import { McpServer, ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import axios from 'axios';
import open from 'open';
import express from 'express';
import bodyParser from 'body-parser';
import sqlite3 from 'sqlite3';
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

sqlite3.verbose();
// 初始化SQLite数据库
const dbPath = path.join(__dirname, 'tokens.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
  logger.error(`数据库连接失败: ${err.message}`);
} else {
  logger.log('已连接到SQLite数据库');
  // 创建tokens表
  db.run(`CREATE TABLE IF NOT EXISTS tokens (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    client_id TEXT NOT NULL,
    access_token TEXT NOT NULL,
    token_type TEXT NOT NULL,
    expires_in INTEGER NOT NULL,
    scope TEXT NOT NULL,
    created_at TEXT DEFAULT (DATETIME('now', 'localtime'))
  )`, (err) => {
    if (err) {
      logger.error(`创建表失败: ${err.message}`);
    } else {
      logger.log('tokens表已创建或已存在');
    }
  });
}
})

const app = express();

// Create an MCP server
const server = new McpServer({
  name: "ticktick",
  version: "1.0.0"
});


const baseUrl =  "https://api.dida365.com/open/v1";


const clientInfo = {
    clientId: null,
    clientSecret: null,
    redirectUri: "",
    scope:"tasks:read tasks:write",
    grantType: 'authorization_code',
    scope: "tasks:read tasks:write",
}

let SEVER_PORT = parseInt(process.env.SERVER_PORT || '4000', 10);
   
   function initializeClientInfo() {
     if (!clientInfo.clientId || !clientInfo.clientSecret) {
       logger.error('CLIENT_ID or CLIENT_SECRET is not set');
       process.exit(1);
     }
     clientInfo.redirectUri = `http://localhost:${SEVER_PORT}/oauth/callback`;
   }
   
   // 调用初始化函数
   initializeClientInfo();

// 存储访问令牌
let access = {
  token: null,
  expireAt: null
};


// server.tool('didaOauth', {},async() => {
//   try {
//     await getAuthorization();
//     return {
//       content: [{ type: "text", text: "Authorization successful:" + access.token  }]
//     }
//   } catch (error) {
//     return {
//       content: [{ type: "text", text: `Authorization failed: ${error.message}` }]
//     }
//   }
// })

// server.tool('login',{},async() => {
//   const response = await axios.post('https://api.dida365.com/api/v2/user/signon?wc=true&remember=true', {
//     password:"zx8368545",
//     phone:"13751673721"
//   })
//   return {
//     content: [{ type: "text", text: `Login successful: ${JSON.stringify(response.data)}` }]
//   }
// })

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
  await getAuthorization();
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
  await getAuthorization();
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
  await getAuthorization();
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
  await getAuthorization();
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
  await getAuthorization();
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
  await getAuthorization();
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
  await getAuthorization();
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
  await getAuthorization();
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
  await getAuthorization();
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
  await getAuthorization();
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


async function getAuthorization() {
  logger.log('Checking access token');
  const authUrl = `https://dida365.com/oauth/authorize?client_id=${clientInfo.clientId}&redirect_uri=${encodeURIComponent(clientInfo.redirectUri)}&scope=${encodeURIComponent(clientInfo.scope)}&response_type=code`;
  let result = null;
  if(access.token == null){
    //如果没有token,则需要从数据库中获取token并查看token是否过期
  await getTokenFromDb().then(async tokenData => {
    const expireAt = new Date(new Date(tokenData.created_at).getTime() + tokenData.expires_in).getTime();
    //token过期，重新获取
    if(Date.now() > expireAt) {
      //删除记录
      db.run('delete from tokens where id = ?', [tokenData.id], (err) => {
        if(err) {
          logger.error(`Deleting token failed: ${err.message}`);
        } else {
          logger.log('Token deleted');
        }
      })
      logger.log('Token has expired.Starting OAuth authorization process');
      open(authUrl)
      result = await getTokenWithPolling();
    }else {
      logger.log('Token exists.Continue.');
      access.token = tokenData.access_token;
      access.expireAt = tokenData.expireAt;
      result = true;
  }
  }).catch(async err => {
    logger.error(`Getting token from db failed: ${err.message}`);
    logger.log('Starting OAuth authorization process');
    open(authUrl)
    result = await getTokenWithPolling();
  })
  }else {
    if(Date.now() > access.expireAt) {
      logger.log('Token has expired.Starting OAuth authorization process');
      open(authUrl)
      result = await getTokenWithPolling();
    }
  }
  return result;
}

async function getTokenWithPolling() {
  let token = null;
  let maxAttempts = 10; //最大尝试次数
  let attempts = 0;
  while(token == null && attempts < maxAttempts) {
    token = access.token;
    // 等待一段时间后重试
    await new Promise(resolve => setTimeout(resolve, 2000));
    attempts++;
  }
  if(token == null) {
    logger.error('Get token time out');
    return false;
  }
  return true;
}

//从数据库获取token
async function getTokenFromDb() {
  return new Promise((resolve, reject) => {
     db.all('select * from tokens where client_id = ?', [clientInfo.clientId], (err, rows) => {
      if(err || rows.length === 0) {
        reject(err ? err : { message: 'no token' })
      } else {
        resolve(rows[0])
      }
    })
  })
}

// OAuth回调路由
app.get('/oauth/callback', async (req, res) => {
  const { code } = req.query;
  
  if (!code) {
    return res.status(400).send('未收到授权码(code)');
  }
  
  try {
    // 准备请求参数
    const params = {
      client_id: clientInfo.clientId,//process.env.CLIENT_ID,
      client_secret: clientInfo.clientSecret,//process.env.CLIENT_SECRET,
      code: code,
      grant_type: clientInfo.grantType,
      scope: clientInfo.scope,//process.env.SCOPE,
      redirect_uri: clientInfo.redirectUri//process.env.REDIRECT_URI
    };
    
    // 发送POST请求到滴答清单获取access_token
    const response = await axios.post('https://dida365.com/oauth/token', params, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });
    
    // 获取token数据
    const tokenData = response.data;
    access.token = tokenData.access_token;
    access.expireAt = new Date(Date.now() + tokenData.expires_in).getTime()
    // // 将token数据存储到SQLite数据库
    const stmt = db.prepare(`
      INSERT INTO tokens (client_id, access_token, token_type, expires_in, scope)
      VALUES (?, ?, ?, ?, ?)
    `);
    
    stmt.run(
      clientInfo.clientId,
      tokenData.access_token,
      tokenData.token_type,
      tokenData.expires_in,
      tokenData.scope,
      function(err) {
        if (err) {
          logger.error(`存储token失败: ${err.message}`);
        } else {
          logger.log('token已存储到数据库');
        }
      }
    );
    
    stmt.finalize();

    // 显示获取到的token信息
    res.send(`
      <h1>授权成功</h1>
      <h2>Access Token信息：</h2>
      <pre>${JSON.stringify(tokenData, null, 2)}</pre>
      <p>Token已存储到数据库中</p>
      <script>
        // 将token信息存储到localStorage中，方便客户端使用
        localStorage.setItem('dida_token', JSON.stringify(${JSON.stringify(tokenData)}));
      </script>
    `);
    
  } catch (error) {
    logger.error(`获取token失败: ${error.response?.data || error.message}`);
    res.status(500).send(`
      <h1>获取Token失败</h1>
      <p>错误信息: ${error.response?.data ? JSON.stringify(error.response.data) : error.message}</p>
    `);
  }
});

// 中间件
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.listen(SEVER_PORT, () => {
  logger.info(`OAuth callback server listening on port ${SEVER_PORT}`);
});

// Start receiving messages on stdin and sending messages on stdout
const transport = new StdioServerTransport();
await server.connect(transport);