CONTIKI_PROJECT = humidity_light_node
all: $(CONTIKI_PROJECT)

MODULES += os/net/app-layer/coap
CFLAGS += -DPROJECT_CONF_H=\"project-conf.h\"

CONTIKI = /home/sila/contiki-ng
include $(CONTIKI)/Makefile.include
