// types/index.d.ts
declare module 'wh2mqt-proxy' {
    class Webhook_mqtt_wan {
      constructor(webhookIp: string, webhookPort: number, timeout?: number);
      createBroker(mqttIp: string, mqttPort: number): void;
    }
  
    class Webhook_mqtt_lan {
      constructor(mqttIp: string, mqttPort: number);
      createHook(clientId: string, callback: (req: any, res: any) => boolean): void;
    }
  

  }