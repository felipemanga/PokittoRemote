#include <cstdint>
#include "USBHAL.h"
#include "direct.h"

typedef struct {
    uint8_t out[MAX_PACKET_SIZE_EP0];
    uint8_t in[MAX_PACKET_SIZE_EP0];
    uint8_t setup[SETUP_PACKET_SIZE];
} PACKED CONTROL_TRANSFER;

extern CONTROL_TRANSFER *ct;

void USBLCDCopy( uint32_t size ){
    uint8_t *ptr = ct->out;
    *DIRECT::SET_CD = DIRECT::CD_PIN;
    uint32_t w;// = ptr[0] | (uint32_t(ptr[1])<<8);
    while( size>=2 ){
	// DIRECT::write_data(w);
	// setup_data(data);
	w = ptr[0] | (uint32_t(ptr[1])<<8);
	*DIRECT::MPIN2 = w<<3; // write bits to port
	
	// toggle_data();
	*DIRECT::CLR_WR = DIRECT::WR_PIN;
	size -= 2;
	ptr += 2;
	*DIRECT::SET_WR = DIRECT::WR_PIN;

	/*
	// toggle_data();
	*DIRECT::CLR_WR = DIRECT::WR_PIN;
	w = ptr[0] | (uint32_t(ptr[1])<<8);
	*DIRECT::SET_WR = DIRECT::WR_PIN;
	*/
    }
}
