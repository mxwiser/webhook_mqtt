const webhook_mqtt_wan = require('./webhook_mqtt_wan.cjs')


const logger = require('./logger.cjs')
class Webhook_mqtt_wan{
    constructor(webhookIp,webhookPort,timeout=5000){
        this.webhookIp=webhookIp
        this.webhookPort=webhookPort
        this.timeout=timeout
    }
     connectMqttServer(mqttHost){
        webhook_mqtt_wan.init(this.webhookIp,this.webhookPort,mqttHost,this.timeout)
    }

     createBroker(mqttIp,mqttPort){
       
        const {init} =require('./broker.cjs')
        init(mqttPort,mqttIp)
        this.connectMqttServer('mqtt://'+mqttIp+':'+mqttPort)
    }
}

class Webhook_mqtt_lan{
    constructor(mqttIp,mqttPort){
        this.mqttIp=mqttIp
        this.mqttPort=mqttPort
    }
    createHook(clientId,callback,subtopic=''){
        const webhook_mqtt_lan = require('./webhook_mqtt_lan.cjs')
        webhook_mqtt_lan.init('mqtt://'+this.mqttIp+':'+this.mqttPort,clientId,subtopic)
        webhook_mqtt_lan.hookReceive=callback
    }

}

module.exports.Webhook_mqtt_wan=Webhook_mqtt_wan
module.exports.Webhook_mqtt_lan=Webhook_mqtt_lan

module.exports.setlogger=(log)=>{
    logger.log=log
}


