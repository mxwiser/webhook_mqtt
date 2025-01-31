# wh2mqtt-proxy

## Overview
### HTTP requests are distributed to mqtt clients on the LAN for processing, just like P2P

## Example

``` JavaScript

const ip='127.0.0.1'
const webhookPort=3000
const mqttPort=3001
const wh2mqtt = require("wh2mqtt-proxy")

//Get server object.  Webhook_mqtt_wan(webhookIp,webhookPort,timeout=5000)
const wh2_server =new wh2mqtt.Webhook_mqtt_wan(ip,webhookPort)

//Start Proxy-Server createBroker(mqttIp,mqttPort) or connectMqttServer(mqttUrl='mqtt:://ip:port')
wh2_server.createBroker(mqttPort)

//Get client object. Webhook_mqtt_lan(mqttIp,mqttPort)
const wh2_client =new wh2mqtt.Webhook_mqtt_lan(ip,mqttPort)
//Start Proxy-Client  createHook(mqttClientID,callback,subtopic='')
wh2_client.createHook('client_a',(req,res)=>{
    res.data.content="Hi, I come from the MQTT client."    
    return false
})

//Then the browser to http://192.168.8.102:3000/, You will see the "Hi, I come from the MQTT client."  displayed on the page" .

```
---
#### One wan with multiple Lans needs to be used with nginx-proxy.No need to modify WAN related code.

nginx
```conf

location /A {

                proxy_pass http://localhost:3000;
                proxy_set_header SubTopic nameA;

}

location /B {

                proxy_pass http://localhost:3000;
                proxy_set_header SubTopic nameB;

}
location /C {
  
                proxy_pass http://localhost:3000;
                proxy_set_header SubTopic nameC;

}

```
lan
```JavaScript

wh2_clientA.createHook('client_1',(req,res)=>{
    res.data.content="Hi, I come from the MQTT client."    
    return false
},'nameA')

wh2_clientB.createHook('client_2',(req,res)=>{
    res.data.content="Hi, I come from the MQTT client."    
    return false
},'nameB')

wh2_clientC.createHook('client_3',(req,res)=>{
    res.data.content="Hi, I come from the MQTT client."    
    return false
},'nameC')

```

## Due to personal busy schedule, please refer to the source code for more details.