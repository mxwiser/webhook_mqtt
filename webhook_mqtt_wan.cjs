

// server.js
const express = require('express');
const mqtt = require('async-mqtt');
const uuid = require('uuid');
const app = express();

const fs = require('fs');
const logger = require('./logger.cjs')

let wh_timeout=5000
// MQTT Broker 连接配置
//const mqttHost = 'mqtt://localhost:3001'; // 根据实际情况修改
const clientId = `express_${uuid.v4()}`;
let mqttClient;

// 连接到 MQTT Broker
const connectMqtt = async (connectUrl) => {
    mqttClient =  mqtt.connect(connectUrl, {
        clientId,
        clean: true,
        connectTimeout: 4000,
        reconnectPeriod: 1000,
    });
    await mqttClient.subscribe('response_topic');
    //await mqttClient.subscribe('request_proxy_topic');
    logger.log('Connected to MQTT Broker and subscribed to response_topic');
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


module.exports.init= (webhookIp,webhookPort,mqttHost,timeout)=>{
    wh_timeout = timeout
    connectMqtt(mqttHost)
    .then(() => {
        mqttClient.on('message', handleResponse);
        // mqttClient.on('message', handleProxyRequest);
    })
    .catch(err => {
        logger.error('MQTT connection error:', err);
        process.exit(1);

    });
    app.listen(webhookPort,webhookIp, () => {
        logger.log(`Express server listening at http://${webhookIp}:${webhookPort}`);
    });
}





// 中间件，用于解析 JSON 请求体
app.use(express.json());

// 路由，处理 HTTP 请求
app.all('*', async (req, res) => {


    //logger.log(req)


    const requestData = {
        body:req.body,
        query:req.query,
        method:req.method,
        cookies:req.cookies,
        originalUrl:req.originalUrl,
        hostname:req.hostname,
        headers:req.headers
    }

    if(!req.headers.subtopic){
        req.headers.subtopic=''
    }


    //logger.log(req.headers)

    const correlationId = uuid.v4();

    // 创建 Promise 并存储 resolver
    const responsePromise = new Promise((resolve, reject) => {
        pendingResponses.set(correlationId, resolve);

        // 设置超时
       
        const timeoutId = setTimeout(() => {
            if (pendingResponses.has(correlationId)) {
                pendingResponses.delete(correlationId);
                reject(new Error('Processing timeout'));
            }
        }, wh_timeout);
    });

    // 发布消息到局域网服务器订阅的主题
    try {
        await mqttClient.publish('request_topic'+req.headers.subtopic, JSON.stringify({
            correlationId,
            data:requestData
  
        }), { qos: 1 });
    } catch (err) {
        logger.error('Error publishing message:', err);
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


