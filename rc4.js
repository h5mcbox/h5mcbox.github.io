//Must be array
rc4=function(datastream,keystream){
    var ra=0,rb=0,rc=0,rd=0,re=0,rf=0,rg=0, //registers
        length=keystream.length,
        Sbox=[],
        result=[];
    var swap=function(a,b,c){
        var d=a[b];
        a[b]=a[c];
        a[c]=d;
    }
    for(ra=0;ra<256;ra++){
        keystream[ra]=keystream[ra%length];
        Sbox[ra]=ra;
    } //Fill keystream to 256 bits and make a S-box
    for(rb=0;rb<256;rb++){
        rc=(rc+Sbox[rb]+keystream[rb])%256;
        swap(Sbox,rb,rc)
    } //Everything is changing
    for(rd=0;rd<datastream.length;rd++){
        re=rd%256;
        rf=(rf+Sbox[re])%256;
        swap(Sbox,re,rf);
        rg=Sbox[(Sbox[re]+Sbox[rf])%256];
        result.push(datastream[rd]^rg);
    }
    return result;
}
