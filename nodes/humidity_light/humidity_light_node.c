#include "contiki.h"
#include "coap-engine.h"
#include <stdio.h>
#include <string.h>
#include "sys/log.h"

#define LOG_MODULE "HumLightNode"
#define LOG_LEVEL LOG_LEVEL_INFO

static void res_get_handler(coap_message_t *request, coap_message_t *response, uint8_t *buffer, uint16_t preferred_size, int32_t *offset);

RESOURCE(res_humidity, "title=\"Humidity Sensor\";rt=\"Humidity\"", res_get_handler, NULL, NULL, NULL);
RESOURCE(res_light, "title=\"Light Sensor\";rt=\"Light\"", res_get_handler, NULL, NULL, NULL);

#include "lib/random.h"

static void res_get_handler(coap_message_t *request, coap_message_t *response, uint8_t *buffer, uint16_t preferred_size, int32_t *offset) {
  const char *url = NULL;
  int len = coap_get_header_uri_path(request, &url);
  
  if(len > 0 && strncmp(url, "sensors/humidity", len) == 0) {
      int humidity = 40 + (random_rand() % 41); // 40 ile 80 arası nem
      snprintf((char *)buffer, preferred_size, "{\"humidity\": %d}", humidity);
  } else {
      int light = 500 + (random_rand() % 501); // 500 ile 1000 arası ışık
      snprintf((char *)buffer, preferred_size, "{\"light\": %d}", light);
  }
  
  coap_set_header_content_format(response, APPLICATION_JSON);
  coap_set_payload(response, buffer, strlen((char *)buffer));
}

PROCESS(hum_light_process, "Humidity and Light Node");
AUTOSTART_PROCESSES(&hum_light_process);

PROCESS_THREAD(hum_light_process, ev, data) {
  PROCESS_BEGIN();
  
  LOG_INFO("Starting Humidity & Light Node\n");
  coap_engine_init();
  
  coap_activate_resource(&res_humidity, "sensors/humidity");
  coap_activate_resource(&res_light, "sensors/light");
  
  while(1) {
    PROCESS_WAIT_EVENT();
  }
  
  PROCESS_END();
}
