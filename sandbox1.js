function sandbox(sandboxParent = null) {
  var context = Object.create(sandboxParent), errors = [];
  var DetectedObjects = [], ObjectContext = new WeakMap();
  var TrapObject = function TrapObject(object) {
    return new Proxy(object, {
      get(obj, key) {
        if (redirects.has(obj[key])) {
          return redirects.get(obj[key]);
        } else if (Blacklist.has(obj[key])) {
          throw `The access to ${key} has blocked.`;
        } else if (typeof obj[key] === "object") {
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
    })
  }
  var FakedGlobal = new Proxy(context, {
    get(obj, key) {
      if (key === "undefined") { return undefined; }
      if (key === "null") { return null; }
      if (typeof key !== "string") {
        return undefined;
      }
      if (!(key in obj)) {
        throw new ReferenceError(`${key} is not defined`);
      }
      var result = obj[key];
      if (Blacklist.has(result)) {
        throw `The access to ${key} has blocked.`;
      }
      if (typeof result === "object") {
        return TrapObject(obj[key]);
      }
      return obj[key];
    },
    set: function _set(obj, key, value) {
      if (redirects.has(value)) {
        obj[key] = redirects.get(value);
        return true;
      } else {
        if (typeof value === "object") {
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
  var redirects = new Map([
    [Function, function (...args) {
      var code = args.pop();
      return Function("InternalRun", "code", ...args, "InternalRun(code)").bind(FakedGlobal, _InternalRun, code)
    }]
  ]);
  var Blacklist = new Set();
  if (window) { redirects.set(window, FakedGlobal) }
  var _InternalRun = function (code) {
    var BackupFunctionConstructor = Function.prototype.constructor;
    Function.prototype.constructor = redirects.get(Function);
    try {
      var result = Function("errors", "proxy", `try{with(proxy){;${code};}}catch(error){errors.push(error);throw error;}`).bind(FakedGlobal)(errors, FakedGlobal);
    } catch (e) {
      Function.prototype.constructor = BackupFunctionConstructor;
      throw e;
    }
    Function.prototype.constructor = BackupFunctionConstructor;
    return result;
  }
  var SandboxFunction = function (code = "") {
    try {
      Function(code);
    } catch (error) {
      errors.push(error);
      throw error;
    }
    try {
      var result = _InternalRun(`return ${code}`);
    } catch {
      var result = _InternalRun(code);
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
