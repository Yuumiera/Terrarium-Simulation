CONTIKI_PROJECT = temperature_node
all: $(CONTIKI_PROJECT)

# CoAP katmanı entegrasyonu
MODULES += os/net/app-layer/coap

# Proje yapılandırma dosyası yolu
CFLAGS += -DPROJECT_CONF_H=\"project-conf.h\"

# Contiki-NG kaynak kodlarının bulunduğu yol
# Kullanıcı dilerse "make CONTIKI=..." şeklinde müdahale edebilir
CONTIKI = /home/sila/contiki-ng
include $(CONTIKI)/Makefile.include
