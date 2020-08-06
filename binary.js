function getBit(num, bit){
    return ((num>>bit) % 2 != 0)
}

function setBit(num, bit){
    return num | 1<<bit;
}

function clearBit(num, bit){
    return num & ~(1<<bit);
}

function toggleBit(num, bit){
    return bit_test(num, bit) ? bit_clear(num, bit) : bit_set(num, bit);
}
function littleEndianRepresentation(arr){
    if(arr==undefined){
        return 0;
    }
    if(arr.length < 1){
        return 0;
    }
    var out = 0;
    for(let i =arr.length-1; i > -1;i--){
        
        out+=arr[i]*Math.pow(2,i);
    }
    return out;
}
function bigEndianRepresentation(arr){
    if(arr==undefined){
        return 0;
    }
    if(arr.length < 1){
        return 0;
    }
    var out = 0;
    for(let i =0;i<arr.length;i++){
        
        out+=arr[i]*Math.pow(2,i);
    }
    return out;
}
function numToBEArray(val){
    var out = new Array(32);
    for(let i = 0; i < 32; i++){
        out[i] = getBit(val,i);
    }
    return out;
}
function numToLEArray(val){
    var out = new Array(32);
    for(let i = 31; i > -1; i--){
        out[i] = getBit(val,i);
    }
    return out;
}