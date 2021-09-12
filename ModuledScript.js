class ModuledScript{
  #ModuleStorage={};
  loadedModules={};
  API={};
  #unwritable=["importModule"];
  #depends={};
  APIProxy=(depends,unwritable)=>new Proxy(this.API,{
    get(o,k){
      if(Reflect.has(depends,k)&&!o[k])return o[k]=o.importModule(depends[k]);
      return o[k];
    },
    set(o,k,v){
      if(unwritable.includes(k))return false;
      return Boolean(o[k]=v);
    }
  });
  Module=class{exports={}};
  importModule(name,args={},force=false){
    if(Reflect.has(this.loadedModules,name)&&!force)return(this.loadedModules[name]);
    if(!name)return(this.loadedModules.concat());
    if(!Reflect.has(this.#ModuleStorage,name)){
      console.error(`模块${name}不存在`);
      return(undefined);
    }
    let module=new this.Module(this.importModule);
    var argsKey=Object.keys(args),argsValue=Object.values(args);
    Function(
      "API",
      "module",
      "importModule",
      ...argsKey,
      this.#ModuleStorage[name]
    )(this.APIProxy,
      module,
      this.importModule,
      ...argsValue);
    return this.loadedModules[name]=module.exports;
  }
  constructor(_ModuleStorage={},_depends={}){
    this.#ModuleStorage=_ModuleStorage;
    this.#depends=_depends;
    this.API.importModule=this.importModule.bind(this);
    this.APIProxy=this.APIProxy(this.#depends,this.#unwritable);
    return this;
  }
}
