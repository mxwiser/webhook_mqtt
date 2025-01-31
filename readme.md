# MQTT Webhook Proxy System Documentation

## Overview  
This system enables HTTP request proxying via MQTT protocol, supporting multi-category request handling. The system consists of:  
1. **MQTT Broker**: Message broker (port 3001)  
2. **LAN Processors**: Subscribed to specific topics for business logic handling  
3. **WAN Web Service**: Express server (port 3000) receiving HTTP requests and forwarding via MQTT  
4. **Nginx Reverse Proxy**: Implements request categorization and load distribution  



---

## Quick Start  

### Prerequisites  
- Node.js v14+  
- Nginx  
- MQTT client libraries (included in dependencies)  

```bash  
# Install dependencies  
npm install aedes mqtt express async-mqtt uuid  
```  

---  

## Configuration Guide  

### 1. MQTT Broker Configuration  
File: `broker.js`  
```javascript  
const port = 3001; // Modify broker port  
```  
Start command:  
```bash  
node broker.js  
```  

---  

### 2. LAN Processor Configuration  
File: `webhook_mqtt_lan.js`  
```javascript  
// Business category identifier (matches Nginx config)  
const subtopic = "inventory";  

// MQTT Broker address  
const connectUrl = 'mqtt://mqtt-server:3001';   
```  
Start command:  
```bash  
node webhook_mqtt_lan.js  
```  

---  

### 3. WAN Web Service Configuration  
File: `webhook_mqtt_wan.js`  
```javascript  
// MQTT Broker address  
const mqttHost = 'mqtt://mqtt-server:3001';  
```  
Start command:  
```bash  
node webhook_mqtt_wan.js  
```  

---  

### 4. Nginx Reverse Proxy Configuration  
Example configuration:  
```nginx  
server {  
    listen 80;  
    server_name inventory.example.com;  

    location / {  
        proxy_pass http://localhost:3000;  
        proxy_set_header subtopic "inventory";  
    }  
}  

server {  
    listen 80;  
    server_name sales.example.com;  

    location / {  
        proxy_pass http://localhost:3000;  
        proxy_set_header subtopic "sales";  
    }  
}  
```  

---  

## Business Logic Extension  
Modify the `myrecv` function in `webhook_mqtt_lan.js`:  
```javascript  
function myrecv(req_data, responseData) {  
  // Example: Handle inventory query  
  if (req_data.originalUrl.includes("/api/inventory")) {  
    responseData.data.content = {  
      stock: 1500,  
      location: "WH-02"  
    };  
    return true; // Intercept handling  
  }  
  return false; // Continue default processing  
}  
```  

---  

## Request Flow Example  
1. Client request:  
```bash  
curl -H "Host: inventory.example.com" http://gateway/api/check  
```  

2. Nginx adds header:  
```http  
proxy_set_header subtopic "inventory"  
```  

3. WAN service publishes to topic:  
```  
request_topicinventory  
```  

4. Corresponding LAN processor handles the request  

---  

## Environment Configuration Recommendations  
| Component       | Key Configurations         | Example Values             |  
|-----------------|----------------------------|----------------------------|  
| LAN Processor   | subtopic                   | inventory/sales/finance    |  
|                 | connectUrl                 | mqtt://mqtt-cluster:3001   |  
| WAN Server      | mqttHost                   | mqtt://mqtt-cluster:3001   |  
| Nginx           | proxy_set_header subtopic  | Set per business category  |  

---  




## Security Recommendations  
1. Enable MQTT authentication:  
```javascript  
// broker.js  
const aedes = require('aedes')({  
  authenticate: (client, username, password, callback) => {  
    // Add authentication logic  
  }  
});  
```  

2. Configure SSL in Nginx:  
```nginx  
ssl_certificate     /path/to/cert.pem;  
ssl_certificate_key /path/to/key.pem;  
```  

---  

## Troubleshooting  
**Q: Requests receive no response**  
- Verify MQTT Broker connectivity  
- Check Nginx `subtopic` header configuration  
- Ensure LAN processor's subscription topic matches  

**Q: Message backlog occurs**  
```javascript  
// webhook_mqtt_wan.js  
const mqttClient = mqtt.connect(..., {  
  queueLimit: 1000 // Adjust message queue length  
});  
```  

---  

> By properly configuring `subtopic` and Nginx routing rules, isolated processing for multiple business categories can be achieved. We recommend deploying separate LAN processor instances for each business category.