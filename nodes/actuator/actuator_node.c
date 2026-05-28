#include "contiki.h"
#include "coap-engine.h"
#include <stdio.h>
#include <string.h>
#include "sys/log.h"

#define LOG_MODULE "ActuatorNode"
#define LOG_LEVEL LOG_LEVEL_INFO

static void res_put_handler(coap_message_t *request, coap_message_t *response, uint8_t *buffer, uint16_t preferred_size, int32_t *offset);

RESOURCE(res_heater, "title=\"Heater\";rt=\"Control\"", NULL, NULL, res_put_handler, NULL);
RESOURCE(res_mist, "title=\"Misting System\";rt=\"Control\"", NULL, NULL, res_put_handler, NULL);
RESOURCE(res_uvlamp, "title=\"UV Lamp\";rt=\"Control\"", NULL, NULL, res_put_handler, NULL);

static void res_put_handler(coap_message_t *request, coap_message_t *response, uint8_t *buffer, uint16_t preferred_size, int32_t *offset) {
  size_t len = 0;
  const char *payload = NULL;
  len = coap_get_payload(request, (const uint8_t **)&payload);
  
  if (len > 0) {
    if (strncmp(payload, "ON", 2) == 0) {
      LOG_INFO("Actuator toggled ON\n");
    } else if (strncmp(payload, "OFF", 3) == 0) {
      LOG_INFO("Actuator toggled OFF\n");
    }
  }
}

PROCESS(actuator_process, "Actuator Process");
AUTOSTART_PROCESSES(&actuator_process);

PROCESS_THREAD(actuator_process, ev, data) {
  PROCESS_BEGIN();
  
  LOG_INFO("Starting Actuator Node\n");
  coap_engine_init();
  
  coap_activate_resource(&res_heater, "control/heater");
  coap_activate_resource(&res_mist, "control/mist");
  coap_activate_resource(&res_uvlamp, "control/uvlamp");

  while(1) {
    PROCESS_WAIT_EVENT();
  }

  PROCESS_END();
}
