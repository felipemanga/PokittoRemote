#include "./direct.h"

#include "Pokitto.h"
#include "USBEndpoints.h"
#include "USBDevice.h"
#include "USBDescriptor.h"
#include "./USBSerial.h"
#include "USBHAL.h"

Pokitto::Core game;

#undef write_data

#define MAX_CDC_REPORT_SIZE MAX_PACKET_SIZE_EPBULK
// Convert physical endpoint number to register bit
#define EP(endpoint) (1UL<<endpoint)
#define PHY_TO_LOG(endpoint)    ((endpoint)>>1)
#define BYTES_REMAINING(s)       (((s)>>16)&0x3ff)  // Bytes remaining after transfer

typedef struct {
    uint32_t    maxPacket;
    uint32_t    buffer[2];
    uint32_t    options;
} PACKED EP_STATE;

typedef struct {
    uint32_t out[2];
    uint32_t in[2];
} PACKED EP_COMMAND_STATUS;

extern volatile EP_STATE endpointState[NUMBER_OF_PHYSICAL_ENDPOINTS];
extern volatile int epComplete;
extern EP_COMMAND_STATUS *ep;
void USBLCDCopy( uint32_t size );

volatile uint32_t remaining;

bool USBSerial::EPBULK_OUT_callback() {
    uint32_t size = 0;

    //we read the packet received and put it on the circular buffer
    // readEP(c, &size);
    // EP_STATUS result;

    if(!configured()) {
        return false;
    }

    /* Wait for completion */
    while(true){
        // result = endpointReadResult(EPBULK_OUT, c, &size);

	uint8_t bf = 0;

	if (!(epComplete & EP(EPBULK_OUT))){
	    if( configured() ) continue;
	    else return false;
	}else {
	    epComplete &= ~EP(EPBULK_OUT);

	    //check which buffer has been filled
	    if (LPC_USB->EPBUFCFG & EP(EPBULK_OUT)) {
		// Double buffered (here we read the previous buffer which was used)
		if (LPC_USB->EPINUSE & EP(EPBULK_OUT)) {
		    bf = 0;
		} else {
		    bf = 1;
		}
	    }

	    // Find how many bytes were read
	    size = (uint32_t) (endpointState[EPBULK_OUT].maxPacket - BYTES_REMAINING(ep[PHY_TO_LOG(EPBULK_OUT)].out[bf]));

	    // Copy data
	    if( remaining ) USBLCDCopy(size);
	    return endpointRead(EPBULK_OUT, MAX_CDC_REPORT_SIZE) == EP_PENDING; 
	}

    }
    
    return true;
}

USBSerial pc( POK_VENDOR_ID, POK_PRODUCT_ID, 0x0001, false);

void update(){
    Pokitto::Buttons::pollButtons();
    uint8_t buf[] = {'u', Pokitto::Buttons::buttons_state };	    
    pc.send(buf, 2);
    remaining = 220*176;
}

int main () {
    game.begin();
    wait(1);
    Pokitto::Display::update(false);
    while(true){
	while( !pc.configured() ){
	    remaining = 0;
	}
	
	if( !remaining ){
	    update();
	}
    }

    return 1;
}

