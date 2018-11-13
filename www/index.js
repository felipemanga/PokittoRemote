const robot = require("robotjs");
var busy = false;
const FPSCounter = document.getElementById("fps");
var time = performance.now();
const revpalette = new Uint8Array(0x10000);
const WIDTH=220, HEIGHT=176;

const keys = ["up", "down", "left", "right", "a", "b", "c", "d"];
let prevstate = 0;

const palette = [
    [0, 0, 0], [0, 0, 102], [0, 0, 204], [0, 23, 51], [0, 23, 153], [0, 23, 255], [0, 46, 0], [0, 46, 102], 
    [0, 46, 204], [0, 69, 51], [0, 69, 153], [0, 69, 255], [0, 92, 0], [0, 92, 102], [0, 92, 204], [0, 115, 51], 
    [0, 115, 153], [0, 115, 255], [0, 139, 0], [0, 139, 102], [0, 139, 204], [0, 162, 51], [0, 162, 153], [0, 162, 255], 
    [0, 185, 0], [0, 185, 102], [0, 185, 204], [0, 208, 51], [0, 208, 153], [0, 208, 255], [0, 231, 0], [0, 231, 102], 
    [0, 231, 204], [0, 255, 51], [0, 255, 153], [0, 255, 255], [42, 0, 51], [42, 0, 153], [42, 0, 255], [42, 23, 0], 
    [42, 23, 102], [42, 23, 204], [42, 46, 51], [42, 46, 153], [42, 46, 255], [42, 69, 0], [42, 69, 102], [42, 69, 204], 
    [42, 92, 51], [42, 92, 153], [42, 92, 255], [42, 115, 0], [42, 115, 102], [42, 115, 204], [42, 139, 51], [42, 139, 153], 
    [42, 139, 255], [42, 162, 0], [42, 162, 102], [42, 162, 204], [42, 185, 51], [42, 185, 153], [42, 185, 255], [42, 208, 0], 
    [42, 208, 102], [42, 208, 204], [42, 231, 51], [42, 231, 153], [42, 231, 255], [42, 255, 0], [42, 255, 102], [42, 255, 204], 
    [85, 0, 0], [85, 0, 102], [85, 0, 204], [85, 23, 51], [85, 23, 153], [85, 23, 255], [85, 46, 0], [85, 46, 102], 
    [85, 46, 204], [85, 69, 51], [85, 69, 153], [85, 69, 255], [85, 92, 0], [85, 92, 102], [85, 92, 204], [85, 115, 51], 
    [85, 115, 153], [85, 115, 255], [85, 139, 0], [85, 139, 102], [85, 139, 204], [85, 162, 51], [85, 162, 153], [85, 162, 255], 
    [85, 185, 0], [85, 185, 102], [85, 185, 204], [85, 208, 51], [85, 208, 153], [85, 208, 255], [85, 231, 0], [85, 231, 102], 
    [85, 231, 204], [85, 255, 51], [85, 255, 153], [85, 255, 255], [127, 0, 51], [127, 0, 153], [127, 0, 255], [127, 23, 0], 
    [127, 23, 102], [127, 23, 204], [127, 46, 51], [127, 46, 153], [127, 46, 255], [127, 69, 0], [127, 69, 102], [127, 69, 204], 
    [127, 92, 51], [127, 92, 153], [127, 92, 255], [127, 115, 0], [127, 115, 102], [127, 115, 204], [127, 139, 51], [127, 139, 153], 
    [127, 139, 255], [127, 162, 0], [127, 162, 102], [127, 162, 204], [127, 185, 51], [127, 185, 153], [127, 185, 255], [127, 208, 0], 
    [127, 208, 102], [127, 208, 204], [127, 231, 51], [127, 231, 153], [127, 231, 255], [127, 255, 0], [127, 255, 102], [127, 255, 204], 
    [170, 0, 0], [170, 0, 102], [170, 0, 204], [170, 23, 51], [170, 23, 153], [170, 23, 255], [170, 46, 0], [170, 46, 102], 
    [170, 46, 204], [170, 69, 51], [170, 69, 153], [170, 69, 255], [170, 92, 0], [170, 92, 102], [170, 92, 204], [170, 115, 51], 
    [170, 115, 153], [170, 115, 255], [170, 139, 0], [170, 139, 102], [170, 139, 204], [170, 162, 51], [170, 162, 153], [170, 162, 255], 
    [170, 185, 0], [170, 185, 102], [170, 185, 204], [170, 208, 51], [170, 208, 153], [170, 208, 255], [170, 231, 0], [170, 231, 102], 
    [170, 231, 204], [170, 255, 51], [170, 255, 153], [170, 255, 255], [212, 0, 51], [212, 0, 153], [212, 0, 255], [212, 23, 0], 
    [212, 23, 102], [212, 23, 204], [212, 46, 51], [212, 46, 153], [212, 46, 255], [212, 69, 0], [212, 69, 102], [212, 69, 204], 
    [212, 92, 51], [212, 92, 153], [212, 92, 255], [212, 115, 0], [212, 115, 102], [212, 115, 204], [212, 139, 51], [212, 139, 153], 
    [212, 139, 255], [212, 162, 0], [212, 162, 102], [212, 162, 204], [212, 185, 51], [212, 185, 153], [212, 185, 255], [212, 208, 0], 
    [212, 208, 102], [212, 208, 204], [212, 231, 51], [212, 231, 153], [212, 231, 255], [212, 255, 0], [212, 255, 102], [212, 255, 204], 
    [255, 0, 0], [255, 0, 102], [255, 0, 204], [255, 23, 51], [255, 23, 153], [255, 23, 255], [255, 46, 0], [255, 46, 102], 
    [255, 46, 204], [255, 69, 51], [255, 69, 153], [255, 69, 255], [255, 92, 0], [255, 92, 102], [255, 92, 204], [255, 115, 51], 
    [255, 115, 153], [255, 115, 255], [255, 139, 0], [255, 139, 102], [255, 139, 204], [255, 162, 51], [255, 162, 153], [255, 162, 255], 
    [255, 185, 0], [255, 185, 102], [255, 185, 204], [255, 208, 51], [255, 208, 153], [255, 208, 255], [255, 231, 0], [255, 231, 102], 
    [255, 231, 204], [255, 255, 51], [255, 255, 153], [255, 255, 255], 
    [204, 204, 204], [153, 153, 153], [102, 102, 102], [51, 51, 51]
];

for( let i=0; i<0x10000; ++i ){
    let R = (i>>>11)/0x1F*0xFF|0;
    let G = ((i>>>5)&0x3F)/0x3F*0xFF|0;
    let B = (i&0x1F)/0x1F*0xFF|0;
    let min = -1, mdelta = Number.MAX_VALUE;
    for( let j=0; j<0x100; ++j ){
        let delta = (palette[j][0]-R)*(palette[j][0]-R)
            +  (palette[j][1]-G)*(palette[j][1]-G)
            +  (palette[j][2]-B)*(palette[j][2]-B);
        if( delta < mdelta ){
            min = j;
            mdelta = delta;
        }
    }
    revpalette[i] = min;
}

function abtostr( buffer ){
    let str = '';
    let b = new Uint8Array( buffer );
    for( let i=0, l=b && b.length; i<l; ++i )
	str += String.fromCharCode( b[i] );
    return str;
}

function d(c){
    return (c+'').charCodeAt(0);
}

let idReadMap = {};
let serial = {
    wait:function( time ){
	return new Promise( (ok, nok) => {
	    setTimeout( _ => ok(true), time );
	});
    },

    read:function( id ){
	return new Promise( (ok, nok) => {
	    idReadMap[id] = data => {
		idReadMap[id] = null;
		ok(data);
	    };
	});
    },
    
    write:function( id, data ){
	
	return serial.send( id, data ).then( info => {
	    if( info.error )
		throw info.error;
	});
	    
    }
};

chrome.serial.onReceive.addListener( info => {
    let data = new Uint8Array(info.data);
    // console.log( String.fromCharCode( data[0] ) );
    if( data[0] == 117 ){
        // console.log( data[1].toString(2).padStart(8, '0') );
        let diff = prevstate ^ data[1];
        prevstate = data[1];
        for( let i=0; i<8; ++i ){
            if( diff&(1<<i) ){
                robot.keyToggle(
                    keys[i],
                    (data[1]&(1<<i))?"down":"up"
                );
            }
        }
        update();
    }
});

Object.keys(chrome.serial).forEach( k => {
    if( typeof chrome.serial[k] != "function" ) return;
    serial[k] = function( ...args ){
	return new Promise( (ok, nok) => {
	    let full = [...args, (arg) => {
		if( !arg || chrome.runtime.lastError ) nok( chrome.runtime.lastError );
		else ok( arg );
	    }];
	    try{
		chrome.serial[k].apply( chrome.serial, full );
	    }catch( ex ){
		nok(ex);
	    }
	});
    };
});

let connected = false, streaming = false;
let capture = document.getElementById("capture");
let canvas = document.getElementById("image"), ctx = canvas.getContext("2d");
canvas.width = WIDTH;
canvas.height = HEIGHT;

chrome.desktopCapture.chooseDesktopMedia(["screen"], null, (streamId) => {
    navigator.mediaDevices.getUserMedia({
        video: {
            mandatory: {
                chromeMediaSource: 'desktop',
                chromeMediaSourceId: streamId,
            }
        }
    }).then( stream => {
        capture.srcObject = (stream);
        streaming = true;
    });
});

setInterval( reconnect, 1000 );

async function connect( device ){
    let obj = await serial.connect( device.path, {bitrate: 115200} );
    connected = obj.connectionId;
    console.log("Connected ", connected);
}

// setInterval( update, 13 );
// requestAnimationFrame(update);

let hnd;

function update(){
    // requestAnimationFrame(update);
    /*
    if( busy ){
        console.log("Busy");
        if( hnd ) hnd = setTimeout( update, 10 );
        return;
    }
    */

    if( !streaming )
        setTimeout( update, 100 );
    
    hnd = 0;

    if( !streaming || !connected )
        return;

    var now = performance.now();
    var delta = now - time;
    time = now;
    FPSCounter.textContent = Math.round(1000 / delta);
    var vidsize = Math.floor( capture.videoWidth / capture.videoHeight * HEIGHT );
    busy = true;
//    ctx.drawImage( capture, (WIDTH/2 - vidsize/2)|0, 0, vidsize|0, HEIGHT );
    let img = ctx.getImageData(0, 0, WIDTH, HEIGHT);
    let out = new Uint8Array( WIDTH*(HEIGHT>>1) );
    let i = 0;
    next();

    function next(){
        let x = 0;
        for( let j=0; j<out.length; ++j, ++x ){
            if( x >= WIDTH ){
                x = 0;
            }
            /* */
            let r = img.data[i];
            let g = img.data[i+1];
            let b = img.data[i+2];
            
            out[j] = revpalette[
                ((r&0xF8)<<8)
                    | ((g&0xFC)<<3)
                    | (b>>>3)
            ];
            
            let nr = (r - palette[out[j]][0])>>4;
            let ng = (g - palette[out[j]][1])>>4;
            let nb = (b - palette[out[j]][2])>>4;
            if( x < WIDTH-2 ){
                img.data[i+4] += nr<<1;
                img.data[i+5] += ng<<1;
                img.data[i+6] += nb<<1;
                if( x < WIDTH-1 ){
                    img.data[i+8] += nr;
                    img.data[i+9] += ng;
                    img.data[i+10] += nb;
                }
            }
            
            let h = i + (WIDTH*4) - 4;
            if( x ){
                img.data[h+0] += nr;
                img.data[h+1] += ng;
                img.data[h+2] += nb;
            }
            img.data[h+4] += nr;
            img.data[h+5] += ng;
            img.data[h+6] += nb;
            img.data[h+8] += nr;
            img.data[h+9] += ng;
            img.data[h+10] += nb;
            /*
            img.data[h+(WIDTH*4)+4] += nr;
            img.data[h+(WIDTH*4)+5] += ng;
            img.data[h+(WIDTH*4)+6] += nb;
            */
            i+= 4;            
            
            /*/
            let b=img.data[i]/0xFF*15|0; // (img.data[i++]+img.data[i++]+img.data[i++])/48|0;
            i+=4;
            b|=img.data[i]/0xFF*15<<4|0; // ((img.data[i++]+img.data[i++]+img.data[i++])/48|0)<<4;
            i+=4;
            out[j] = b;
            /* */
        }

        if( !connected )
            return;
        
        chrome.serial.send( connected, out.buffer, info => {
            if( info.error ){
                busy = false;
                if( connected )
                    serial.disconnect( connected );
                connected = false;
                return;
            }
            if( i >= img.data.length  ){
                busy = false;
                ctx.drawImage( capture, (WIDTH/2 - vidsize/2)|0, 0, vidsize|0, HEIGHT );
            }else next();
        });
    }

}

function reconnect(){
    
    serial.getDevices().then( list => {
        let pokitto = list.find( dev => dev.productId == 10 && dev.vendorId == 1240 );
        if( pokitto ){
            if( connected ) return;
            connect( pokitto );
            return;
        }else if( connected ){
            serial.disconnect(connected);
            connected = false;
        }
        return;
    });

}
