#include <cstdint>
#include "USBHAL.h"
#include "direct.h"

typedef struct {
    uint8_t out[MAX_PACKET_SIZE_EP0];
    uint8_t in[MAX_PACKET_SIZE_EP0];
    uint8_t setup[SETUP_PACKET_SIZE];
} PACKED CONTROL_TRANSFER;

extern CONTROL_TRANSFER *ct;

const uint16_t pal[] = {
/* */
    #include "./palette.h"
    /*/
    0x0, 0xa, 0x14, 0x1f, 0x120, 0x12a, 0x134, 0x13f, 0x240, 0x24a, 0x254, 0x25f, 0x360, 0x36a, 0x374, 0x37f, 0x480, 0x48a, 0x494, 0x49f, 0x5a0, 0x5aa, 0x5b4, 0x5bf, 0x6c0, 0x6ca, 0x6d4, 0x6df, 0x7e0, 0x7ea, 0x7f4, 0x7ff, 0x2000, 0x200a, 0x2014, 0x201f, 0x2120, 0x212a, 0x2134, 0x213f, 0x2240, 0x224a, 0x2254, 0x225f, 0x2360, 0x236a, 0x2374, 0x237f, 0x2480, 0x248a, 0x2494, 0x249f, 0x25a0, 0x25aa, 0x25b4, 0x25bf, 0x26c0, 0x26ca, 0x26d4, 0x26df, 0x27e0, 0x27ea, 0x27f4, 0x27ff, 0x4000, 0x400a, 0x4014, 0x401f, 0x4120, 0x412a, 0x4134, 0x413f, 0x4240, 0x424a, 0x4254, 0x425f, 0x4360, 0x436a, 0x4374, 0x437f, 0x4480, 0x448a, 0x4494, 0x449f, 0x45a0, 0x45aa, 0x45b4, 0x45bf, 0x46c0, 0x46ca, 0x46d4, 0x46df, 0x47e0, 0x47ea, 0x47f4, 0x47ff, 0x6800, 0x680a, 0x6814, 0x681f, 0x6920, 0x692a, 0x6934, 0x693f, 0x6a40, 0x6a4a, 0x6a54, 0x6a5f, 0x6b60, 0x6b6a, 0x6b74, 0x6b7f, 0x6c80, 0x6c8a, 0x6c94, 0x6c9f, 0x6da0, 0x6daa, 0x6db4, 0x6dbf, 0x6ec0, 0x6eca, 0x6ed4, 0x6edf, 0x6fe0, 0x6fea, 0x6ff4, 0x6fff, 0x8800, 0x880a, 0x8814, 0x881f, 0x8920, 0x892a, 0x8934, 0x893f, 0x8a40, 0x8a4a, 0x8a54, 0x8a5f, 0x8b60, 0x8b6a, 0x8b74, 0x8b7f, 0x8c80, 0x8c8a, 0x8c94, 0x8c9f, 0x8da0, 0x8daa, 0x8db4, 0x8dbf, 0x8ec0, 0x8eca, 0x8ed4, 0x8edf, 0x8fe0, 0x8fea, 0x8ff4, 0x8fff, 0xb000, 0xb00a, 0xb014, 0xb01f, 0xb120, 0xb12a, 0xb134, 0xb13f, 0xb240, 0xb24a, 0xb254, 0xb25f, 0xb360, 0xb36a, 0xb374, 0xb37f, 0xb480, 0xb48a, 0xb494, 0xb49f, 0xb5a0, 0xb5aa, 0xb5b4, 0xb5bf, 0xb6c0, 0xb6ca, 0xb6d4, 0xb6df, 0xb7e0, 0xb7ea, 0xb7f4, 0xb7ff, 0xd000, 0xd00a, 0xd014, 0xd01f, 0xd120, 0xd12a, 0xd134, 0xd13f, 0xd240, 0xd24a, 0xd254, 0xd25f, 0xd360, 0xd36a, 0xd374, 0xd37f, 0xd480, 0xd48a, 0xd494, 0xd49f, 0xd5a0, 0xd5aa, 0xd5b4, 0xd5bf, 0xd6c0, 0xd6ca, 0xd6d4, 0xd6df, 0xd7e0, 0xd7ea, 0xd7f4, 0xd7ff, 0xf800, 0xf80a, 0xf814, 0xf81f, 0xf920, 0xf92a, 0xf934, 0xf93f, 0xfa40, 0xfa4a, 0xfa54, 0xfa5f, 0xfb60, 0xfb6a, 0xfb74, 0xfb7f, 0xfc80, 0xfc8a, 0xfc94, 0xfc9f, 0xfda0, 0xfdaa, 0xfdb4, 0xfdbf, 0xfec0, 0xfeca, 0xfed4, 0xfedf, 0xffe0, 0xffea, 0xfff4, 0xffff 
/* */
};

const uint16_t pal16[] = {0x0, 0x1082, 0x2104, 0x31a6, 0x4228, 0x52aa, 0x632c, 0x73ae, 0x8c51, 0x9cd3, 0xad55, 0xbdd7, 0xce59, 0xdefb, 0xef7d, 0xffff};
extern volatile int32_t remaining;    

void USBLCDCopy_C( uint8_t *ptr, uint32_t size );
void update();

void USBLCDCopy_A( uint32_t size ){
    uint8_t *ptr = ct->out;
    *DIRECT::SET_CD = DIRECT::CD_PIN;
    uint32_t w=0, t=252;
    uint32_t rem = size&7;
    remaining -= size;
    if( remaining <= 0 ){
	remaining = 0;
	// update();
    }

    size &= ~7;
    
    asm volatile(
	".syntax unified \n"
	"ldrb %[w], [%[ptr]] \n"
	"next%=: \n"
	"lsls %[w], 1 \n"
	"ldrh %[w], [%[pal], %[w]] \n"
	"lsls %[w], 3 \n"
	"str %[w], [%[LCD]] \n"
	"movs %[w], 252 \n"
	"str %[offset], [%[LCD], %[w]] \n"
	"ldrb %[w], [%[ptr], 1] \n"
	"str %[offset], [%[LCD], 124] \n"

	"lsls %[w], 1 \n"
	"ldrh %[w], [%[pal], %[w]] \n"
	"lsls %[w], 3 \n"
	"str %[w], [%[LCD]] \n"
	"movs %[w], 252 \n"
	"str %[offset], [%[LCD], %[w]] \n"
	"ldrb %[w], [%[ptr], 2] \n"
	"str %[offset], [%[LCD], 124] \n"


	"lsls %[w], 1 \n"
	"ldrh %[w], [%[pal], %[w]] \n"
	"lsls %[w], 3 \n"
	"str %[w], [%[LCD]] \n"
	"movs %[w], 252 \n"
	"str %[offset], [%[LCD], %[w]] \n"
	"ldrb %[w], [%[ptr], 3] \n"
	"str %[offset], [%[LCD], 124] \n"


	"lsls %[w], 1 \n"
	"ldrh %[w], [%[pal], %[w]] \n"
	"lsls %[w], 3 \n"
	"str %[w], [%[LCD]] \n"
	"movs %[w], 252 \n"
	"str %[offset], [%[LCD], %[w]] \n"
	"ldrb %[w], [%[ptr], 4] \n"
	"adds %[ptr], 4 \n"
	"subs %[size], 4 \n"
	"str %[offset], [%[LCD], 124] \n"
	"bne next%= \n"
	:
	[w]"+l"(w),
	[t]"+l"(t),
	[ptr]"+l"(ptr),
	[size]"+l"(size)
	:
	[LCD]"l"(0xA0002188),
	[pal]"l"(pal),
	[offset]"l"(1<<12)
	);

    USBLCDCopy_C(ptr, rem);
}

void USBLCDCopy( /*uint8_t *ptr,*/ uint32_t size ){
     uint8_t *ptr = ct->out;
     *DIRECT::SET_CD = DIRECT::CD_PIN;
    uint32_t w;// = ptr[0] | (uint32_t(ptr[1])<<8);

    remaining -= size;
    if( remaining <= 0 ){
	 remaining = 0;
    	 update();
    }


    while( size ){
	/* */
	w = pal[ptr[0]];
	*DIRECT::MPIN2 = w<<3; // write bits to port
	// toggle_data();
	*DIRECT::CLR_WR = DIRECT::WR_PIN;
	size--;
	ptr++;
	*DIRECT::SET_WR = DIRECT::WR_PIN;

	/*/
	
	// DIRECT::write_data(w);
	// setup_data(data);
	w = pal16[ptr[0]&0xF];
	*DIRECT::MPIN2 = w<<3; // write bits to port
	
	// toggle_data();
	*DIRECT::CLR_WR = DIRECT::WR_PIN;
	w = pal16[ptr[0]>>4];
	*DIRECT::SET_WR = DIRECT::WR_PIN;

	*DIRECT::MPIN2 = w<<3; // write bits to port
	
	// toggle_data();
	*DIRECT::CLR_WR = DIRECT::WR_PIN;
	size--;
	ptr++;
	*DIRECT::SET_WR = DIRECT::WR_PIN;

	/* */
	
	/*
	// toggle_data();
	*DIRECT::CLR_WR = DIRECT::WR_PIN;
	w = ptr[0] | (uint32_t(ptr[1])<<8);
	*DIRECT::SET_WR = DIRECT::WR_PIN;
	*/
    }
}
