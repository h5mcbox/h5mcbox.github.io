//You need make a StringTools
//Must be array
rc4=function(data,key){
    var datastream=strtools.encode(data), //encode data to binary
        keystream=strtools.encode(key), //encode data to binary
        ra=0,rb=0,rc=0,rd=0,re=0,rf=0,rg=0, //registers
        Sbox=[],
        result=[];
    var swap=function(a,b,c){
        var d=a[b];
        a[b]=a[c];
        a[c]=d;
    }
    for(ra=0;ra<256;ra++){
        keystream[ra]=keystream[ra%key.length];
        Sbox[ra]=ra;
    } //Fill keystream to 256 bits and make a S-box
    for(rb=0;rb<256;rb++){
        rc=(rc+Sbox[rb]+keystream[rb])%256;
        swap(Sbox,rb,rc)
    } //Everything is changing
    for(rd=0;rd<data.length;rd++){
        re=rd%256;
        rf=(rf+Sbox[re])%256;
        swap(Sbox,re,rf);
        rg=Sbox[(Sbox[re]+Sbox[rf])%256];
        result.push(datastream[re]^rg);
    }
    return result;
}
