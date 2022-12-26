(function UMDLoader(createContainer) {
  const isNode = !("window" in globalThis);
  if (isNode) {
    module.exports = createContainer;
  } else {
    window.createContainer = createContainer;
  }
})(
  function createContainer(containerParent = null) {
    let GeneratorFunction = (function* () { }).constructor;
    let isTrapable = value => ((typeof value === "object" || typeof value === "function") && Boolean(value));
    let context = Object.create(containerParent), errors = [];
    let DetectedObjects = [],
      ObjectContext = new WeakMap(),
      WhiteOutMap = new WeakMap(),
      TrappedObjects = new WeakMap(),
      UntracedObjects = new WeakSet();
    let customOwnKeys = function ownKeys(o) {
      let result = Object.getOwnPropertyNames(o);
      if (typeof o === "function") {
        if (!result.includes("arguments")) result.push("arguments");
        if (!result.includes("caller")) result.push("caller");
      }
      result = result.filter(e => !(Blacklist.has(e)));
      if (ObjectContext.has(o)) {
        let resultSet = new Set(result);
        Object.keys(ObjectContext.get(o)).forEach(e => {
          resultSet.add(e);
        });
        result = [...resultSet];
      }
      return result;
    }
    function getBlankObject(object) {
      let blankObject;
      if (typeof object === "object") {
        blankObject = {};
      } else if (typeof object === "function") {
        if (!object.prototype) {
          blankObject = (class { static c() { } }).c;
        } else {
          blankObject = function () { };
        }
      }
      return blankObject;
    }
    let TrapObject = function TrapObject(object) {
      if (!isTrapable(object)) {
        throw "The target must be an object or an function.";
      }
      if (TrappedObjects.has(object)) return TrappedObjects.get(object)
      let blankObject = getBlankObject(object);
      let handlers = {
        get(obj, key) {
          arguments[0] = object;
          let r1;
          if (ObjectContext.has(obj)) {
            r1 = Reflect.get(ObjectContext.get(obj), key) || Reflect.get(obj, key);
          } else {
            r1 = Reflect.get(obj, key);
          }
          if (!WhiteOutMap.has(obj)) {
            WhiteOutMap.set(obj, new Set());
          }
          if (WhiteOutMap.get(obj).has(key)) {
            return undefined;
          }
          if (redirects.has(r1)) {
            return redirects.get(r1);
          } else if (Blacklist.has(r1)) {
            throw `The access to ${key} has blocked.`;
          } else if (isTrapable(r1) && (!UntracedObjects.has(r1))) {
            return TrapObject(r1);
          }
          return r1;
        },
        set(obj, key, value) {
          arguments[0] = object;
          if (!ObjectContext.has(obj)) {
            ObjectContext.set(obj, {});
          }
          if (!WhiteOutMap.has(obj)) {
            WhiteOutMap.set(obj, new Set());
          }
          if (redirects.has(value)) {
            return Reflect.set(obj, key, redirects.get(value));
          }
          WhiteOutMap.get(obj).delete(key);
          return Reflect.set(ObjectContext.get(obj), key, value);
        },
        defineProperty(o, p, a) {
          arguments[0] = object;
          if (!ObjectContext.has(o)) {
            ObjectContext.set(o, {});
          }
          if (!WhiteOutMap.has(o)) {
            WhiteOutMap.set(o, new Set());
          }
          WhiteOutMap.get(o).delete(p);
          return Reflect.defineProperty(ObjectContext.get(o), p, a);
        },
        getOwnPropertyDescriptor(o, p) {
          arguments[0] = object;
          let r1;
          if (ObjectContext.has(o)) {
            r1 = Reflect.getOwnPropertyDescriptor(ObjectContext.get(o), p) || Reflect.getOwnPropertyDescriptor(o, p);
          } else {
            r1 = Reflect.getOwnPropertyDescriptor(o, p);
          }
          if (!WhiteOutMap.has(o)) {
            WhiteOutMap.set(o, new Set());
          }
          if (WhiteOutMap.get(o).has(p)) {
            return undefined;
          }
          if (!r1) { return r1; }
          if ("value" in r1) {
            if (redirects.has(r1.value)) {
              r1.value = redirects.get(r1.value);
              return r1;
            } else if (Blacklist.has(r1.value)) {
              throw `The access to ${p} has blocked.`;
            } else if (isTrapable(r1.value) && (!UntracedObjects.has(r1.value))) {
              r1.value = TrapObject(Reflect.get(o, p));
              return r1;
            }
          }
          return r1;
        },
        deleteProperty(o, p) {
          arguments[0] = object;
          if (!ObjectContext.has(o)) {
            ObjectContext.set(o, {});
          }
          if (!WhiteOutMap.has(o)) {
            WhiteOutMap.set(o, new Set());
          }
          if (Reflect.has(ObjectContext.get(o), p)) {
            return Reflect.deleteProperty(ObjectContext.get(o), p);
          } else {
            let descriptor = Reflect.getOwnPropertyDescriptor(o, p) || {};
            if (descriptor.configurable) {
              WhiteOutMap.get(o).add(p);
              return true;
            } else {
              return false;
            }
          }
        },
        has(o, p) {
          arguments[0] = object;
          let r1, r2;
          if (ObjectContext.has(o)) {
            r1 = Reflect.has(ObjectContext.get(o), p) || Reflect.has(o, p);
            r2 = Reflect.get(ObjectContext.get(o), p) || Reflect.get(o, p);
          } else {
            r1 = Reflect.has(o, p);
            r2 = Reflect.get(o, p);
          }
          if (!WhiteOutMap.has(o)) {
            WhiteOutMap.set(o, new Set());
          }
          if (WhiteOutMap.get(o).has(p)) {
            return false;
          }
          if (redirects.has(r2)) {
            return true;
          } else if (Blacklist.has(r1)) {
            return false;
          } else if (isTrapable(r2) && (!UntracedObjects.has(r2))) {
            TrapObject(r2);
            return true;
          };
          return r1;
        },
        ownKeys: function () { arguments[0] = object; return customOwnKeys.apply(this, arguments); },
        preventExtensions: function () { arguments[0] = object; Reflect.preventExtensions.apply(this, arguments); return false; }
      };
      let result = new Proxy(blankObject, genFallbackHandler(handlers, object));
      TrappedObjects.set(object, result);
      return result;
    }
    function genFallbackHandler(originalHandler, object) {
      return new Proxy({}, {
        get: function (o, k) {
          function fallbackHandler() {
            arguments[0] = object;
            return Reflect[k].apply(this, arguments);
          }
          let handler = originalHandler[k] || fallbackHandler;
          return handler;
        }
      })
    }
    let ContainerGlobal;
    (function () {
      let blankObject = getBlankObject(context);
      let handlers = {
        get(obj, key) {
          arguments[0] = context;
          if (key === "undefined") { return undefined; }
          if (key === "null") { return null; }
          if ((typeof key !== "string") && (typeof key !== "symbol")) {
            return undefined;
          }
          if (key === Symbol.unscopables) {
            return undefined;
          }
          if (readOnce.has(key)) {
            let result = readOnce.get(key);
            readOnce.delete(key);
            return result;
          }
          if (!(key in obj)) {
            let errmsg;
            if (typeof key === "symbol") {
              errmsg = `Symbol(${key.description}) is not defined`;
            } else {
              errmsg = `${key} is not defined`;
            }
            throw new ReferenceError(errmsg);
          }
          let result = Reflect.get(obj, key);
          if (Blacklist.has(result)) {
            throw `The access to ${key} has blocked.`;
          }
          if (isTrapable(result) && (!UntracedObjects.has(result))) {
            return TrapObject(result);
          }
          return result;
        },
        set: function _set(obj, key, value, map, skipArgsReplacement) {
          if (!skipArgsReplacement) arguments[0] = context;
          if (TrappedObjects.has(value)) {
            return Reflect.set(obj, key, TrappedObjects.get(value));
          }
          if (redirects.has(value)) {
            return Reflect.set(obj, key, redirects.get(value));
          } else {
            if (isTrapable(value) && !UntracedObjects.has(value) && !skipArgsReplacement) {
              value = TrapObject(value);
            }
            if (isTrapable(value)) {
              Reflect.ownKeys(value).forEach(function (e) {
                let _value, skip = false;
                try {
                  _value = value[e];
                } catch {
                  skip = true;
                }
                if ((!DetectedObjects.includes(_value)) && (!skip)) {
                  DetectedObjects.push(_value);
                  return _set(value, e, _value, null, true);
                }
              });
            }
            return Reflect.set(obj, key, value);
          }
        },
        has() {
          return true;
        },
        defineProperty: function _defineProperty(o, p, a, m, sAR) {
          if (!sAR) arguments[0] = context;
          if ("value" in a) {
            if (TrappedObjects.has(value)) {
              a.value = TrappedObjects.get(value)
              return Reflect.defineProperty(o, p, a);
            }
            if (redirects.has(value)) {
              a.value = redirects.get(value);
              return Reflect.defineProperty(o, p, a);
            } else {
              if (isTrapable(a.value)) {
                Reflect.ownKeys(a.value).forEach(function (e) {
                  let _value = a.value[e];
                  if (!DetectedObjects.includes(_value)) {
                    DetectedObjects.push(_value);
                    return _defineProperty(a.value, e, Reflect.getOwnPropertyDescriptor(a.value, e), null, true);
                  }
                });
              }
              return Reflect.defineProperty(o, p, a);
            }
          } else {
            return Reflect.defineProperty(o, p, a);
          }
        },
        getOwnPropertyDescriptor(o, p) {
          arguments[0] = context;
          let r1;
          if (p === "undefined") { return { value: undefined, writable: false, enumerable: false, configurable: false } }
          if (p === "null") { return { value: null, writable: false, enumerable: false, configurable: false } }
          if ((typeof p !== "string") && (typeof p !== "symbol")) {
            return undefined;
          }
          if (readOnce.has(p)) {
            let result = readOnce.get(p);
            readOnce.delete(p);
            return { value: result, writable: false, enumerable: true, configurable: false };
          }
          r1 = Reflect.getOwnPropertyDescriptor(o, p);
          if (!r1) { return r1; }
          if ("value" in r1) {
            if (Blacklist.has(r1.value)) {
              throw `The access to ${p} has blocked.`;
            }
            if ((typeof r1.value === "object" || typeof r1.value === "function") && (!UntracedObjects.has(r1.value))) {
              r1.value = TrapObject(r1.value);
              return r1;
            }
          }
          return r1;
        },
        ownKeys: function () { arguments[0] = context; return customOwnKeys.apply(this, arguments); },
        preventExtensions: function () { arguments[0] = context; Reflect.preventExtensions.apply(this, arguments); return false; }
      };
      ContainerGlobal = new Proxy(blankObject, genFallbackHandler(handlers, context));
    })();
    UntracedObjects.add(ContainerGlobal);
    let _global = globalThis;
    let TimeoutTimer = new Map(), IntervalTimer = new Map();
    let TotalTimeoutTimers = 0, TotalIntervalTimers = 0;
    let redirects = new Map([
      [Function, function (...args) {
        let code = args.pop();
        return Function("InternalRun", "code", ...args, "return InternalRun(code)").bind(ContainerGlobal, _InternalRun, code)
      }],
      [setTimeout, function (code, delay, ...args) {
        let TimeoutID = setTimeout.call(_global, _InternalRun, delay, code, ...args);
        TimeoutTimer.set(++TotalTimeoutTimers, TimeoutID);
        return TotalTimeoutTimers;
      }],
      [setInterval, function (code, delay, ...args) {
        let IntervalID = setInterval.call(_global, _InternalRun, delay, code, ...args);
        IntervalTimer.set(++TotalIntervalTimers, IntervalID);
        return TotalIntervalTimers;
      }],
      [clearTimeout, function (_TimeoutID) {
        let TimeoutID = TimeoutTimer.get(_TimeoutID);
        TimeoutTimer.delete(_TimeoutID);
        return clearTimeout(TimeoutID);
      }],
      [clearInterval, function (_IntervalID) {
        let IntervalID = IntervalTimer.get(_IntervalID);
        IntervalTimer.delete(_IntervalID);
        return clearInterval(IntervalID);
      }],
      [Object.freeze, function () {
        try {
          return Object.freeze.apply(this, arguments);
        } catch (e) {
          if (!e.toString().includes("trap returned falsish")) {
            throw e;
          };
        }
      }],
      [Object.preventExtensions, function () {
        try {
          return Object.preventExtensions.apply(this, arguments);
        } catch (e) {
          if (!e.toString().includes("trap returned falsish")) {
            throw e;
          };
        }
      }]
    ]);
    function clearTimers() {
      TimeoutTimer.forEach((value, key) => { clearTimeout(value) });
      IntervalTimer.forEach((value, key) => { clearInterval(value) });
      TimeoutTimer.clear();
      IntervalTimer.clear();
    }
    let readOnce = new Map();
    redirects.get(Function).prototype = Function.prototype;
    redirects.set(_global, ContainerGlobal);
    let Blacklist = new Set();
    let BackupPrototypes = new Map();
    let backupBlacklist = ["caller", "callee", "arguments"];
    let OriginFunctionCall = Function.prototype.call;
    let OriginFunctionApply = Function.prototype.apply;
    let OriginArrayIncludes = addCallAndApply(Array.prototype.includes);
    let OriginArrayForEach = addCallAndApply(Array.prototype.forEach);
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
        //if (typeof obj.prototype[e] === "symbol") { return false; }
        Reflect.defineProperty(BackupPrototypes.get(obj), e, Object.getOwnPropertyDescriptor(obj.prototype, e));
      });
      BackupPrototypes.get(obj)[Symbol.iterator] = obj.prototype[Symbol.iterator];
    }
    function RestorePrototype(obj) {
      if (!BackupPrototypes.has(obj)) return false;
      let Prototype = BackupPrototypes.get(obj);
      let includesInBlacklist = (arg) => OriginArrayIncludes.call(backupBlacklist, arg);
      OriginArrayForEach.call(Reflect.ownKeys(obj.prototype), function (e) {
        if (includesInBlacklist(e)) return false;
        delete obj.prototype[e];
      });
      OriginArrayForEach.call(Reflect.ownKeys(Prototype), function (e) {
        if (includesInBlacklist(e)) return false;
        //if (typeof Prototype[e] === "symbol") { return false; }
        Reflect.defineProperty(obj.prototype, e, Object.getOwnPropertyDescriptor(BackupPrototypes.get(obj), e));
      });
      obj.prototype[Symbol.iterator] = BackupPrototypes.get(obj)[Symbol.iterator];
      BackupPrototypes.delete(obj);
    }
    let _InternalRun = function (code, ...funcargs) {
      BackupPrototype(Function);
      BackupPrototype(Array);
      BackupPrototype(GeneratorFunction);
      Function.prototype.constructor = redirects.get(Function);
      delete GeneratorFunction.prototype.constructor;
      GeneratorFunction.prototype.constructor = null;
      let result;
      try {
        if (typeof code === "string") {
          if (funcargs.length !== 0) throw "Eval string needn't arguments.";
          result = Function("errors", "proxy", `try{with(proxy){;${code};}}catch(error){errors.push(error);throw error;}`).bind(ContainerGlobal)(errors, ContainerGlobal);
        } else if (typeof code === "function") {
          readOnce.set("TempCode", code);
          readOnce.set("TempArgs", funcargs);
          result = Function("errors", "proxy", `try{with(proxy){;TempCode(...TempArgs);}}catch(error){errors.push(error);throw error;}`).bind(ContainerGlobal)(errors, ContainerGlobal);
        } else {
          throw EvalError("The target is not evalable.");
        }
      } catch (e) {
        RestorePrototype(Function);
        RestorePrototype(Array);
        RestorePrototype(GeneratorFunction);
        throw e;
      }
      RestorePrototype(Function);
      RestorePrototype(Array);
      RestorePrototype(GeneratorFunction);
      return result;
    }
    let ContainerFunction = function (code = "") {
      try {
        Function(code);
      } catch (error) {
        errors.push(error);
        throw error;
      }
      result = _InternalRun(code);
      return result;
    };
    return {
      runInContainer: ContainerFunction,
      ContainerGlobal,
      context,
      ObjectContext,
      redirects,
      Blacklist,
      UntracedObjects,
      errors,
      clearTimers
    };
  }
);
