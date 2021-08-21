function sandbox(sandboxParent=null){
  var context=Object.create(sandboxParent),errors=[];
  var FakedGlobal=new Proxy(context,{
    get(obj,key){
      if(typeof key!=="string"){
        return undefined;
      }
      if(!(key in context)){
        throw new ReferenceError(`${key} is not defined`);
      }
      return context[key];
    },
    set(obj,key,value){
      if(redirects.has(value)){
        obj[key]=redirects.get(value);
        return true;
      }else{
        obj[key]=value;
        return true;
      }
    },
    has(){
      return true;
    }
  });
  var redirects=new Map([
    [Function,(...args)=>Function(...args).bind(FakedGlobal)],
    [eval,(code)=>Function(code).bind(FakedGlobal)],
  ]);
  if(window){redirects.set(window,FakedGlobal)}
  var SandboxFunction=function(code=""){
    var key=code.replaceAll(" ","").replaceAll("\n","");
    if(key in context){
      return FakedGlobal[key];
    }
    try{
      Function(code);
    }catch(error){
      errors.push(error);
      throw error;
    }
    Function("errors","proxy",`try{with(proxy){;${code};}}catch(error){errors.push(error);throw error;}`).bind(FakedGlobal)(errors,FakedGlobal);
  };
  return [SandboxFunction,FakedGlobal,context,redirects,errors];
}
