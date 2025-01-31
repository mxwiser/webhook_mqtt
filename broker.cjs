// broker.js
const aedes = require('aedes')();
const logger = require('./logger.cjs')
const server = require('net').createServer(aedes.handle);
module.exports.init=(port,host)=>{
    server.listen(port,host, function () {
        logger.log(`Aedes MQTT Broker listening on port ${host}:${port}`);
    });
}

// 处理订阅事件
aedes.on('subscribe', function (subscriptions, client) {
    logger.log(`Client ${client.id} subscribed to topics: ${subscriptions.map(s => s.topic).join(', ')}`);
});

// 处理发布事件
aedes.on('publish', function (packet, client) {
    logger.log(`Received message:  on topic ${packet.topic}`);
});

module.exports.aedes=aedes