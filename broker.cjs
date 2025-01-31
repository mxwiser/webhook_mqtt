// broker.js
const aedes = require('aedes')();
const server = require('net').createServer(aedes.handle);
module.exports.init=(port,host)=>{
    server.listen(port,host, function () {
        console.log(`Aedes MQTT Broker listening on port ${host}:${port}`);
    });
}

// 处理订阅事件
aedes.on('subscribe', function (subscriptions, client) {
    console.log(`Client ${client.id} subscribed to topics: ${subscriptions.map(s => s.topic).join(', ')}`);
});

// 处理发布事件
aedes.on('publish', function (packet, client) {
    console.log(`Received message:  on topic ${packet.topic}`);
});

module.exports.aedes=aedes