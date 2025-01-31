const webhook_mqtt_wan = require('./webhook_mqtt_wan.cjs')

class Webhook_mqtt_wan{
    constructor(webhookIp,webhookPort,mqttHost){
        webhook_mqtt_wan.init(webhookIp,mqttHost)
    }
    constructor(webhookIp,webhookPort,mqttIp,mqttPort){
        const {init} =require('./broker.cjs')
        init(mqttPort,mqttIp)
        webhook_mqtt_wan.init(webhookIp,webhookPort,'mqtt://'+mqttIp+':'+mqttPort)
    }
}

module.exports.Webhook_mqtt_wan=Webhook_mqtt_wan


