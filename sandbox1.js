function sandbox(sandboxParent = null) {
  var context = Object.create(sandboxParent), errors = [];
  var DetectedObjects = [];
  var TrapObject = function TrapObject(object) {
    return new Proxy(object, {
      get(obj, key) {
        if (redirects.has(obj[key])) {
          return redirects.get(obj[key]);
        } else if (typeof obj[key] === "object") {
          return TrapObject(obj[key]);
        }
        return obj[key];
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
  if (window) { redirects.set(window, FakedGlobal) }
  var _InternalRun = function (code) {
    return Function("errors", "proxy", `try{with(proxy){;${code};}}catch(error){errors.push(error);throw error;}`).bind(FakedGlobal)(errors, FakedGlobal);
  }
  var SandboxFunction = function (code = "") {
    var key = code.replaceAll(" ", "").replaceAll("\n", ""), isIdentify = true;
    var invaildChars = "!@#$%^&*+\"\\\':;?/><,{}[]()".split("")
    invaildChars.forEach(e => { if (key.includes(e)) { isIdentify = false } });
    if (!isNaN(parseInt(key[0]))) { isIdentify = false }
    var keySplit = key.split("."), current = FakedGlobal;
    if (keySplit.length > 1 && isIdentify) {
      keySplit.forEach(e => {
        if (current[e] === undefined) throw "Read property based on undefined";
        current = current[e];
      })
      return current;
    } else {
      if (key in context) {
        return FakedGlobal[key];
      }
    }
    try {
      Function(code);
    } catch (error) {
      errors.push(error);
      throw error;
    }
    var result = _InternalRun(code);
    if (result !== undefined) { throw "The script in sandbox cannot return a value."; }
    return result;
  };
  return [SandboxFunction, FakedGlobal, context, redirects, errors];
}
