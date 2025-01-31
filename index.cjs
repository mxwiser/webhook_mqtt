// index.js
const webhook_mqtt_wan = require('./webhook_mqtt_wan.cjs');
const logger = require('./logger.cjs');

/**
 * WAN-side MQTT proxy service handler
 * @class
 */
class Webhook_mqtt_wan {
  /**
   * @constructor
   * @param {string} webhookIp - Webhook listening IP address
   * @param {number} webhookPort - Webhook listening port
   * @param {number} [timeout=5000] - Operation timeout in milliseconds
   */
  constructor(webhookIp, webhookPort, timeout = 5000) {
    this.webhookIp = webhookIp;
    this.webhookPort = webhookPort;
    this.timeout = timeout;
  }

  /**
   * Connect to MQTT server
   * @param {string} mqttHost - MQTT server URL (format: mqtt://host:port)
   * @returns {void}
   */
  connectMqttServer(mqttHost) {
    webhook_mqtt_wan.init(this.webhookIp, this.webhookPort, mqttHost, this.timeout);
  }

  /**
   * Create MQTT broker instance
   * @param {string} mqttIp - Broker IP address
   * @param {number} mqttPort - Broker port number
   * @returns {void}
   */
  createBroker(mqttIp, mqttPort) {
    const { init } = require('./broker.cjs');
    init(mqttPort, mqttIp);
    this.connectMqttServer('mqtt://' + mqttIp + ':' + mqttPort);
  }
}

/**
 * LAN-side MQTT client service handler
 * @class
 */
class Webhook_mqtt_lan {
  /**
   * @constructor
   * @param {string} mqttIp - MQTT server IP address
   * @param {number} mqttPort - MQTT server port number
   */
  constructor(mqttIp, mqttPort) {
    this.mqttIp = mqttIp;
    this.mqttPort = mqttPort;
  }

  /**
   * Create webhook listener
   * @param {string} clientId - Unique MQTT client identifier
   * @param {(data: any) => void} callback - Message reception callback
   * @param {string} [subtopic=''] - Subscription subtopic filter
   * @returns {void}
   */
  createHook(clientId, callback, subtopic = '') {
    const webhook_mqtt_lan = require('./webhook_mqtt_lan.cjs');
    webhook_mqtt_lan.init('mqtt://' + this.mqttIp + ':' + this.mqttPort, clientId, subtopic);
    webhook_mqtt_lan.hookReceive = callback;
  }
}

/**
 * @callback LoggerFunction
 * @param {string} message - Log message content
 * @param {...any} args - Additional parameters
 */

/** 
 * Configure custom logger implementation
 * @param {LoggerFunction} log - Logger implementation function
 */
module.exports.setlogger = (log) => {
  logger.log = log;
};

module.exports.Webhook_mqtt_wan = Webhook_mqtt_wan;
module.exports.Webhook_mqtt_lan = Webhook_mqtt_lan;