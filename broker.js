// broker.js
const aedes = require('aedes')();
const server = require('net').createServer(aedes.handle);
const port = 3001;

// 启动 Aedes Broker
server.listen(port, function () {
    console.log(`Aedes MQTT Broker listening on port ${port}`);
});

// 处理订阅事件
aedes.on('subscribe', function (subscriptions, client) {
    console.log(`Client ${client.id} subscribed to topics: ${subscriptions.map(s => s.topic).join(', ')}`);
});

// 处理发布事件
aedes.on('publish', function (packet, client) {
    console.log(`Received message: ${packet.payload.toString()} on topic ${packet.topic}`);
});

module.exports.aedes=aedes