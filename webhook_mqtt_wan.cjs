
const {aedes} = require('./broker.js')
// server.js
const express = require('express');
const mqtt = require('async-mqtt');
const uuid = require('uuid');
const app = express();
const port = 3000;
const fs = require('fs');
const {service} = require('./loc_axios.cjs')
// MQTT Broker 连接配置
const mqttHost = 'mqtt://localhost:3001'; // 根据实际情况修改
const clientId = `express_${uuid.v4()}`;
const connectUrl = `${mqttHost}`;

let mqttClient;

// 连接到 MQTT Broker
const connectMqtt = async () => {
    mqttClient = await mqtt.connect(connectUrl, {
        clientId,
        clean: true,
        connectTimeout: 4000,
        reconnectPeriod: 1000,
    });
    await mqttClient.subscribe('response_topic');
    //await mqttClient.subscribe('request_proxy_topic');
    console.log('Connected to MQTT Broker and subscribed to response_topic');
};

// 存储等待的响应
const pendingResponses = new Map();

const handleResponse = async (topic, message) => {
    if (topic === 'response_topic') {
        const payload = JSON.parse(message.toString());
        const correlationId = payload.correlationId;
        if (pendingResponses.has(correlationId)) {
            const resolver = pendingResponses.get(correlationId);

            resolver(payload.data);
            pendingResponses.delete(correlationId);
        }
    }
};



// const handleProxyRequest = async (topic, message) => {
//     const payload = JSON.parse(message.toString());
//     if (topic === 'request_proxy_topic') {
//            const  res = await service(payload.data)

//         try {
//             await mqttClient.publish('request_proxy_topic', JSON.stringify({
//                 correlationId:payload.correlationId,
//                 data:res.data
//             }), { qos: 1 });
//         } catch (err) {
//             console.error('Error publishing message:', err);
//         }
//     }
// }


// 连接到 MQTT Broker 并设置消息处理
connectMqtt()
    .then(() => {
        mqttClient.on('message', handleResponse);
        // mqttClient.on('message', handleProxyRequest);
    })
    .catch(err => {
        console.error('MQTT connection error:', err);
        process.exit(1);
    });

// 中间件，用于解析 JSON 请求体
app.use(express.json());

// 路由，处理 HTTP 请求
app.all('*', async (req, res) => {


    //console.log(req)


    const requestData = {
        body:req.body,
        query:req.query,
        method:req.method,
        cookies:req.cookies,
        originalUrl:req.originalUrl,
        hostname:req.hostname,
        headers:req.headers
    }


    const correlationId = uuid.v4();

    // 创建 Promise 并存储 resolver
    const responsePromise = new Promise((resolve, reject) => {
        pendingResponses.set(correlationId, resolve);

        // 设置超时
        const timeout = 5000; // 5秒
        const timeoutId = setTimeout(() => {
            if (pendingResponses.has(correlationId)) {
                pendingResponses.delete(correlationId);
                reject(new Error('Processing timeout'));
            }
        }, timeout);
    });

    // 发布消息到局域网服务器订阅的主题
    try {
        await mqttClient.publish('request_topic', JSON.stringify({
            correlationId,
            data:requestData
  
        }), { qos: 1 });
    } catch (err) {
        console.error('Error publishing message:', err);
        res.status(500).json({ error: 'Internal Server Error' });
        return;
    }

    // 等待响应
    try {
        const data = await responsePromise;
        if(data.res_type==1&&(!isNaN(data.status)))
        res.status(data.status).send(data.content);
        else if(data.res_type==2){
            //send file
            const buffer = Buffer.from(data.content);
            res.status(data.status).send(buffer);
        }else if(data.res_type==3){
            const buffer = Buffer.from(data.file);
            fs.writeFileSync(data.dir,buffer)
            res.status(data.status).send(data.content);
        }else{
            res.send(201);    
        }
        
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 启动服务器
app.listen(port, () => {
    console.log(`Express server listening at http://localhost:${port}`);
});