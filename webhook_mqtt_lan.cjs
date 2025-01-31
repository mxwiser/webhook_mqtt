const mqtt = require('mqtt');
const fs = require('fs');
const logger = require('./logger.cjs');
let subtopic




 module.exports.init=(mqttHost,clientId,isubtopic)=>{
      subtopic = isubtopic
      const client = mqtt.connect(mqttHost, {
        clientId,
        clean: true,
        connectTimeout: 4000,
        reconnectPeriod: 1000,
    });
    client.on('connect', () => {
        logger.log('Connected to MQTT Broker');
        // 订阅用于接收请求的主题
        client.subscribe('request_topic'+subtopic, (err) => {
            if (!err) {
                logger.log('Subscribed to request_topic');
            }
        });
    });
    // 处理来自公网服务器的请求
client.on('message', (topic, message) => {
    if (topic === 'request_topic'+subtopic) {
        const payload = JSON.parse(message.toString());
        const correlationId = payload.correlationId;
        const req_data = payload.data;
        // 处理数据（这里以简单的回显为例）
        const responseData = {
            correlationId,
            data: {
                res_type:1,
                content:{},
                status:200
            }
        };
        if(this.hookReceive(req_data,responseData)) 
            return
        client.publish('response_topic', JSON.stringify(responseData), (err) => {
            if (err) {
                logger.error('Error publishing response:', err);
            }
        });
    }
});
}










        //   req 
        //     body,
        //     query,
        //     method,
        //     cookies,
        //     req.originalUrl,
        //     hostname,
        //     headers
        //     
        //      res
        //     res_type  1 normal 2 send file 3 save file(dir,file,content)
        //     content
        //     status
        //     dir
        //     file 

module.exports.hookReceive=(requestData,responseData)=>{
    
    return true
}

