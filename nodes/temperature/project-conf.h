#ifndef PROJECT_CONF_H_
#define PROJECT_CONF_H_

/* Sky Mote / Z1 RAM optimizasyonu */
#undef REST_MAX_CHUNK_SIZE
#define REST_MAX_CHUNK_SIZE    64

/* IPv6 ve 6LoWPAN kullanım garantisi */
#undef UIP_CONF_IPV6
#define UIP_CONF_IPV6          1

/* Sensor düğümünde log seviyeleri */
#undef LOG_CONF_LEVEL_COAP
#define LOG_CONF_LEVEL_COAP LOG_LEVEL_DBG

#endif /* PROJECT_CONF_H_ */
