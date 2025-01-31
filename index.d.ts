// 
declare module 'wh2mqt-proxy' {
  export  class Webhook_mqtt_wan {
      constructor(webhookIp: string, webhookPort: number, timeout?: number);
      createBroker( mqttPort: number): void;
      connectMqttServer(mqttHost:string):void;
    }
  
  export  class Webhook_mqtt_lan {
      constructor(mqttIp: string, mqttPort: number);
      createHook(clientId: string, callback: (req: any, res: any) => boolean): void;
  }
  



  }