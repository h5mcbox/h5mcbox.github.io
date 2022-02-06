function sandbox(sandboxParent = null) {
  var GeneratorFunction=(function*(){}).constructor;
  var context = Object.create(sandboxParent), errors = [];
  var DetectedObjects = [], ObjectContext = new WeakMap(), TrapedObjects = new WeakMap();
  var TrapObject = function TrapObject(object) {
    if (TrapedObjects.has(object)) return TrapedObjects.get(object)
    if (!(typeof object === "object" || typeof object === "function")) throw "The target must be an object or an function.";
    var result = new Proxy(object, {
      get(obj, key) {
        if (redirects.has(obj[key])) {
          return redirects.get(obj[key]);
        } else if (Blacklist.has(obj[key])) {
          throw `The access to ${key} has blocked.`;
        } else if (typeof obj[key] === "object" || typeof obj[key] === "function") {
          return TrapObject(obj[key]);
        }
        if (ObjectContext.has(obj)) {
          return ObjectContext.get(obj)[key] || obj[key];
        } else {
          return obj[key];
        }
      },
      set(obj, key, value) {
        if (!ObjectContext.has(obj)) {
          ObjectContext.set(obj, {});
        }
        ObjectContext.get(obj)[key] = value;
        return true;
      }
    });
    TrapedObjects.set(object, result);
    return result;
  }
  var FakedGlobal = new Proxy(context, {
    get(obj, key) {
      if (key === "undefined") { return undefined; }
      if (key === "null") { return null; }
      if (typeof key !== "string") {
        return undefined;
      }
      if (readOnce.has(key)) {
        var result = readOnce.get(key);
        readOnce.delete(key);
        return result;
      }
      if (!(key in obj)) {
        throw new ReferenceError(`${key} is not defined`);
      }
      var result = obj[key];
      if (Blacklist.has(result)) {
        throw `The access to ${key} has blocked.`;
      }
      if (typeof result === "object" || typeof result === "function") {
        return TrapObject(obj[key]);
      }
      return obj[key];
    },
    set: function _set(obj, key, value) {
      if (TrapedObjects.has(value)) {
        obj[key] = value;
        return true;
      }
      if (redirects.has(value)) {
        obj[key] = redirects.get(value);
        return true;
      } else {
        if (typeof value === "object" || typeof value === "function") {
          Object.keys(value).forEach(function (e) {
            var _value = value[e];
            if (!DetectedObjects.includes(_value)) {
              DetectedObjects.push(_value);
              return _set(value, e, _value);
            }
          });
        }
        obj[key] = value;
        return true;
      }
    },
    has() {
      return true;
    }
  });
  var isNODEJS = Boolean(typeof module !== "undefined");
  var _global = isNODEJS ? global : window;
  var redirects = new Map([
    [Function, function (...args) {
      var code = args.pop();
      return Function("InternalRun", "code", ...args, "return InternalRun(code)").bind(FakedGlobal, _InternalRun, code)
    }],
    [setTimeout, function (code, delay, ...args) {
      var OriginSetTimeout = setTimeout.bind(_global);
      return OriginSetTimeout(_InternalRun, delay, code, ...args);
    }],
    [setInterval, function (code, delay, ...args) {
      var OriginSetInterval = setInterval.bind(_global);
      return OriginSetInterval(_InternalRun, delay, code, ...args);
    }]
  ]);
  var readOnce = new Map();
  redirects.get(Function).prototype = Function.prototype;
  if (typeof window !== "undefined") { redirects.set(window, FakedGlobal); }
  else if (isNODEJS) { redirects.set(global, FakedGlobal); }
  var Blacklist = new Set();
  var BackupPrototypes = new Map();
  var backupBlacklist = ["caller", "callee", "arguments"];
  var OriginFunctionCall = Function.prototype.call;
  var OriginFunctionApply = Function.prototype.apply;
  var OriginArrayIncludes = addCallAndApply(Array.prototype.includes);
  var OriginArrayForEach = addCallAndApply(Array.prototype.forEach);
  function addCallAndApply(target) {
    if (typeof target !== "function") { throw "The target is not a function"; }
    return new Proxy(target, {
      get(obj, key) {
        if (key === "call") return OriginFunctionCall;
        if (key === "apply") return OriginFunctionApply;
        return obj[key];
      }
    });
  }
  function BackupPrototype(obj) {
    BackupPrototypes.set(obj, {});
    OriginArrayForEach.call(Reflect.ownKeys(obj.prototype), function (e) {
      if (backupBlacklist.includes(e)) return false;
      if (typeof obj.prototype[e] === "symbol") { return false; }
      BackupPrototypes.get(obj)[e] = obj.prototype[e];
    });
    BackupPrototypes.get(obj)[Symbol.iterator] = obj.prototype[Symbol.iterator];
  }
  function RestorePrototype(obj) {
    if (!BackupPrototypes.has(obj)) return false;
    var Prototype = BackupPrototypes.get(obj);
    var includesInBlacklist = (arg) => OriginArrayIncludes.call(backupBlacklist, arg);
    OriginArrayForEach.call(Reflect.ownKeys(obj.prototype), function (e) {
      if (includesInBlacklist(e)) return false;
      delete obj.prototype[e]
    });
    OriginArrayForEach.call(Object.keys(Prototype), function (e) {
      if (includesInBlacklist(e)) return false;
      if (typeof Prototype[e] === "symbol") { return false; }
      obj.prototype[e] = Prototype[e];
    });
    obj.prototype[Symbol.iterator] = BackupPrototypes.get(obj)[Symbol.iterator];
    BackupPrototypes.delete(obj);
  }
  var _InternalRun = function (code, ...funcargs) {
    BackupPrototype(Function);
    BackupPrototype(Array);
    BackupPrototype(Function);
    BackupPrototype(GeneratorFunction);
    Function.prototype.constructor = redirects.get(Function);
    delete GeneratorFunction.prototype.constructor;
    GeneratorFunction.prototype.constructor = null;
    try {
      if (typeof code === "string") {
        if (funcargs.length !== 0) throw "Eval string needn't arguments.";
        var result = Function("errors", "proxy", `try{with(proxy){;${code};}}catch(error){errors.push(error);throw error;}`).bind(FakedGlobal)(errors, FakedGlobal);
      } else if (typeof code === "function") {
        readOnce.set("TempCode", code);
        readOnce.set("TempArgs", funcargs);
        var result = Function("errors", "proxy", `try{with(proxy){;TempCode(...TempArgs);}}catch(error){errors.push(error);throw error;}`).bind(FakedGlobal)(errors, FakedGlobal);
      } else {
        throw EvalError("The target is not evalable.");
      }
    } catch (e) {
      RestorePrototype(Function);
      RestorePrototype(Array);
      RestorePrototype(Function);
      RestorePrototype(GeneratorFunction);
      throw e;
    }
    RestorePrototype(Function);
    RestorePrototype(Array);
    RestorePrototype(Function);
    RestorePrototype(GeneratorFunction);
    return result;
  }
  var SandboxFunction = function (code = "", noReturn = false) {
    try {
      Function(code);
    } catch (error) {
      errors.push(error);
      throw error;
    }
    var result;
    try {
      if (noReturn) throw "";
      result = _InternalRun(`return ${code}`);
    } catch (error) {
      if (error instanceof SyntaxError) {
        if (error.message.startsWith("Unexpected token")) {
          throw error;
        }
      }
      if (!(typeof error === "string"||noReturn)) throw error;
      result = _InternalRun(code);
    }
    return result;
  };
  return {
    SandboxFunction,
    FakedGlobal,
    context,
    ObjectContext,
    redirects,
    Blacklist,
    errors
  };
}
