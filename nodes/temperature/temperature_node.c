#include "contiki.h"
#include "coap-engine.h"
#include <stdio.h>
#include <string.h>
#include "sys/log.h"

#define LOG_MODULE "TempNode"
#define LOG_LEVEL LOG_LEVEL_INFO

static void res_get_handler(coap_message_t *request, coap_message_t *response, uint8_t *buffer, uint16_t preferred_size, int32_t *offset);

RESOURCE(res_temperature, "title=\"Temperature\";rt=\"Temperature\";obs", res_get_handler, NULL, NULL, NULL);

#include "lib/random.h"

static void res_get_handler(coap_message_t *request, coap_message_t *response, uint8_t *buffer, uint16_t preferred_size, int32_t *offset) {
  // Simülasyonun canlı hissettirmesi için 20 ile 35 arasında rastgele sıcaklık üret
  int temperature = 20 + (random_rand() % 16); 
  
  snprintf((char *)buffer, preferred_size, "{\"temp\": %d}", temperature);
  coap_set_header_content_format(response, APPLICATION_JSON);
  coap_set_payload(response, buffer, strlen((char *)buffer));
}

PROCESS(temp_sensor_process, "Temperature Process");
AUTOSTART_PROCESSES(&temp_sensor_process);

PROCESS_THREAD(temp_sensor_process, ev, data) {
  PROCESS_BEGIN();

  LOG_INFO("Starting Contiki-NG Temperature Node\n");
  coap_engine_init();
  coap_activate_resource(&res_temperature, "sensors/temperature");

  static struct etimer timer;
  etimer_set(&timer, CLOCK_SECOND * 5);

  while(1) {
    PROCESS_WAIT_EVENT_UNTIL(etimer_expired(&timer));
    // Sıcaklık değiştiğini varsayıp tüm dinleyicilere (Python) mesaj atıyoruz
    coap_notify_observers(&res_temperature);
    etimer_reset(&timer);
  }

  PROCESS_END();
}
