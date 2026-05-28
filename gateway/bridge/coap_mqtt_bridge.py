import asyncio
import logging
import paho.mqtt.client as mqtt
from aiocoap import *

logging.basicConfig(level=logging.WARNING)

MQTT_BROKER = "broker.emqx.io"
MQTT_PORT = 1883

# RPL Network Addresses
COAP_TEMP_URI = "coap://[fd00::202:2:2:2]/sensors/temperature"
COAP_HUMIDITY_URI = "coap://[fd00::203:3:3:3]/sensors/humidity"
COAP_LIGHT_URI = "coap://[fd00::203:3:3:3]/sensors/light"
COAP_ACTUATOR_IP = "fd00::204:4:4:4"

mqtt_client = mqtt.Client(mqtt.CallbackAPIVersion.VERSION2, "TerrariumBridge")

async def poll_sensors():
    protocol = await Context.create_client_context()
    
    while True:
        try:
            # Temperature
            res_temp = await protocol.request(Message(code=GET, uri=COAP_TEMP_URI)).response
            payload_temp = res_temp.payload.decode('utf-8')
            mqtt_client.publish("terrarium/sensors/temperature", payload_temp)
            
            # Humidity
            res_hum = await protocol.request(Message(code=GET, uri=COAP_HUMIDITY_URI)).response
            payload_hum = res_hum.payload.decode('utf-8')
            mqtt_client.publish("terrarium/sensors/humidity", payload_hum)
            
            # Light
            res_light = await protocol.request(Message(code=GET, uri=COAP_LIGHT_URI)).response
            payload_light = res_light.payload.decode('utf-8')
            mqtt_client.publish("terrarium/sensors/light", payload_light)
            
            print(f"Polled Sensors: {payload_temp} | {payload_hum} | {payload_light}")
        except Exception as e:
            print(f"Failed to fetch data: {e}")
        
        await asyncio.sleep(5)

async def send_coap_put(resource, payload):
    protocol = await Context.create_client_context()
    uri = f"coap://[{COAP_ACTUATOR_IP}]/control/{resource}"
    request = Message(code=PUT, uri=uri, payload=payload.encode('utf-8'))
    try:
        await protocol.request(request).response
        print(f"CoAP PUT sent to {uri} -> {payload}")
    except Exception as e:
        print(f"CoAP PUT failed: {e}")

def on_connect(client, userdata, flags, rc, properties):
    print("MQTT Connected. Subscribing to control topics...")
    client.subscribe("terrarium/control/heater")
    client.subscribe("terrarium/control/mist")

def on_message(client, userdata, msg):
    topic = msg.topic
    payload = msg.payload.decode()
    print(f"MQTT Message Received on {topic}: {payload}")
    
    # A CoAP PUT request is triggered asynchronously to the Actuator Node
    if topic == "terrarium/control/heater":
        asyncio.run(send_coap_put("heater", payload))
    elif topic == "terrarium/control/mist":
        asyncio.run(send_coap_put("mist", payload))
    elif topic == "terrarium/control/uvlamp":
        asyncio.run(send_coap_put("uvlamp", payload))

mqtt_client.on_connect = on_connect
mqtt_client.on_message = on_message
mqtt_client.connect(MQTT_BROKER, MQTT_PORT, 60)
mqtt_client.loop_start()

if __name__ == "__main__":
    print(f"Starting CoAP to MQTT Bridge. Polling all sensors...")
    try:
        asyncio.run(poll_sensors())
    except KeyboardInterrupt:
        print("Exiting...")
