// types/index.d.ts
declare module 'wh2mqt-proxy' {
    class Webhook_mqtt_wan {
      constructor(webhookIp: string, webhookPort: number, timeout?: number);
      createBroker( mqttPort: number): void;
      connectMqttServer(mqttHost:string):void;
    }
  
    class Webhook_mqtt_lan {
      constructor(mqttIp: string, mqttPort: number);
      createHook(clientId: string, callback: (req: any, res: any) => boolean): void;
    }
  
    export const Webhook_mqtt: {
      wan: typeof Webhook_mqtt_wan;
      lan: typeof Webhook_mqtt_lan;
    };

  }