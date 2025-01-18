const mqtt = require('mqtt');
const uuid = require('uuid');

const clientId = `lan_server_${uuid.v4()}`;
const connectUrl = 'mqtt://i.qvqol.com:3001'; // 根据实际情况修改

const client = mqtt.connect(connectUrl, {
    clientId,
    clean: true,
    connectTimeout: 4000,
    reconnectPeriod: 1000,
});

client.on('connect', () => {
    console.log('Connected to MQTT Broker');
    // 订阅用于接收请求的主题
    client.subscribe('request_topic', (err) => {
        if (!err) {
            console.log('Subscribed to request_topic');
        }
    });
});

// 处理来自公网服务器的请求
client.on('message', (topic, message) => {
    if (topic === 'request_topic') {
        const payload = JSON.parse(message.toString());
        const correlationId = payload.correlationId;
        const req_data = payload.data;

        console.log(req_data.headers)
        // 处理数据（这里以简单的回显为例）
        const responseData = {
            correlationId,
            data: {
                res_type:1,
                content:{},
                status:200
            }
        };
        // const requestData = {
        //     body:req.body,
        //     query:req.query,
        //     method:req.method,
        //     cookies:req.cookies,
        //     originalUrl:req.originalUrl,
        //     hostname:req.hostname,
        //     headers:req.headers
        // }

        myrecv(req_data,responseData)
        // 发布响应到公网服务器订阅的主题
        client.publish('response_topic', JSON.stringify(responseData), (err) => {
            if (err) {
                console.error('Error publishing response:', err);
            }
        });
    }
});



function myrecv(req_data,responseData){
    responseData.data.content={
        headers:req_data.headers,
        query:req_data.query,
        url:req_data.originalUrl
    }
}