var busy = false;
const FPSCounter = document.getElementById("fps");
var time = performance.now();

const WIDTH=220, HEIGHT=176;

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
    if( idReadMap[info.connectionId] )
	idReadMap[info.connectionId]( info.data );
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
}

setInterval( update, 50 );

function update(){
    if( !streaming || !connected || busy )
        return;

    var now = performance.now();
    var delta = now - time;
    time = now;
    FPSCounter.textContent = Math.round(delta/100)/10;
    
    busy = true;
    ctx.drawImage( capture, 0, 0, WIDTH, HEIGHT );
    let img = ctx.getImageData(0, 0, WIDTH, HEIGHT);
    let out = new Uint16Array( WIDTH );
    let i = 0;
    next();

    function next(){
        for( let j=0; j<WIDTH; ++j ){
            let r = img.data[i++]/0xFF*0x1F<<11;
            let g = img.data[i++]/0xFF*0x3F<<5;
            let b = img.data[i++]/0xFF*0x1F;
            i++;
            out[j] = r | g | b;
        }
        
        serial.send( connected, out.buffer )
            .then( info => {
                if( info.error ){
                    busy = false;
                    serial.disconnect( connected );
                    connected = false;
                    return;
                }
                if( i >= img.data.length  ) busy = false;
                else next();
            });
    }

}

function reconnect(){
    
    if( connected )
        return;
    
    serial.getDevices().then( list => {
        let pokitto = list.find( dev => dev.productId == 10 && dev.vendorId == 1240 );
        if( pokitto )
            return connect( pokitto );
        return null;
    });

}
