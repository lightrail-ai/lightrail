var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __require = /* @__PURE__ */ ((x) => typeof require !== "undefined" ? require : typeof Proxy !== "undefined" ? new Proxy(x, {
  get: (a, b) => (typeof require !== "undefined" ? require : a)[b]
}) : x)(function(x) {
  if (typeof require !== "undefined")
    return require.apply(this, arguments);
  throw Error('Dynamic require of "' + x + '" is not supported');
});
var __commonJS = (cb, mod) => function __require2() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// node_modules/mongodb-uri/mongodb-uri.js
var require_mongodb_uri = __commonJS({
  "node_modules/mongodb-uri/mongodb-uri.js"(exports) {
    function MongodbUriParser(options2) {
      if (options2 && options2.scheme) {
        this.scheme = options2.scheme;
      }
    }
    MongodbUriParser.prototype.parse = function parse3(uri) {
      var uriObject = {};
      var i = uri.indexOf("://");
      if (i < 0) {
        throw new Error("No scheme found in URI " + uri);
      }
      uriObject.scheme = uri.substring(0, i);
      if (this.scheme && this.scheme !== uriObject.scheme) {
        throw new Error("URI must begin with " + this.scheme + "://");
      }
      var rest = uri.substring(i + 3);
      i = rest.indexOf("@");
      if (i >= 0) {
        var credentials = rest.substring(0, i);
        rest = rest.substring(i + 1);
        i = credentials.indexOf(":");
        if (i >= 0) {
          uriObject.username = decodeURIComponent(credentials.substring(0, i));
          uriObject.password = decodeURIComponent(credentials.substring(i + 1));
        } else {
          uriObject.username = decodeURIComponent(credentials);
        }
      }
      i = rest.indexOf("?");
      if (i >= 0) {
        var options2 = rest.substring(i + 1);
        rest = rest.substring(0, i);
        uriObject.options = {};
        options2.split("&").forEach(function(o) {
          var iEquals = o.indexOf("=");
          uriObject.options[decodeURIComponent(o.substring(0, iEquals))] = decodeURIComponent(o.substring(iEquals + 1));
        });
      }
      i = rest.indexOf("/");
      if (i >= 0) {
        if (i < rest.length - 1) {
          uriObject.database = decodeURIComponent(rest.substring(i + 1));
        }
        rest = rest.substring(0, i);
      }
      this._parseAddress(rest, uriObject);
      return uriObject;
    };
    MongodbUriParser.prototype._parseAddress = function _parseAddress(address, uriObject) {
      uriObject.hosts = [];
      address.split(",").forEach(function(h) {
        var i = h.indexOf(":");
        if (i >= 0) {
          uriObject.hosts.push(
            {
              host: decodeURIComponent(h.substring(0, i)),
              port: parseInt(h.substring(i + 1))
            }
          );
        } else {
          uriObject.hosts.push({ host: decodeURIComponent(h) });
        }
      });
    };
    MongodbUriParser.prototype.format = function format(uriObject) {
      if (!uriObject) {
        return (this.scheme || "mongodb") + "://localhost";
      }
      if (this.scheme && uriObject.scheme && this.scheme !== uriObject.scheme) {
        throw new Error("Scheme not supported: " + uriObject.scheme);
      }
      var uri = (this.scheme || uriObject.scheme || "mongodb") + "://";
      if (uriObject.username) {
        uri += encodeURIComponent(uriObject.username);
        if (uriObject.password) {
          uri += ":" + encodeURIComponent(uriObject.password);
        }
        uri += "@";
      }
      uri += this._formatAddress(uriObject);
      if (uriObject.database) {
        uri += "/" + encodeURIComponent(uriObject.database);
      }
      if (uriObject.options) {
        Object.keys(uriObject.options).forEach(function(k, i) {
          uri += i === 0 ? "?" : "&";
          uri += encodeURIComponent(k) + "=" + encodeURIComponent(uriObject.options[k]);
        });
      }
      return uri;
    };
    MongodbUriParser.prototype._formatAddress = function _formatAddress(uriObject) {
      var address = "";
      uriObject.hosts.forEach(function(h, i) {
        if (i > 0) {
          address += ",";
        }
        address += encodeURIComponent(h.host);
        if (h.port) {
          address += ":" + encodeURIComponent(h.port);
        }
      });
      return address;
    };
    MongodbUriParser.prototype.formatMongoose = function formatMongoose(uri) {
      var parser2 = this;
      if (typeof uri === "string") {
        uri = parser2.parse(uri);
      }
      if (!uri) {
        return parser2.format(uri);
      }
      var connectionString = "";
      uri.hosts.forEach(function(h, i) {
        if (i > 0) {
          connectionString += ",";
        }
        var singleUriObject = Object.create(uri);
        singleUriObject.hosts = [h];
        connectionString += parser2.format(singleUriObject);
      });
      return connectionString;
    };
    exports.MongodbUriParser = MongodbUriParser;
    var defaultParser = new MongodbUriParser();
    ["parse", "format", "formatMongoose"].forEach(function(f) {
      exports[f] = defaultParser[f].bind(defaultParser);
    });
  }
});

// node_modules/decamelize/index.js
var require_decamelize = __commonJS({
  "node_modules/decamelize/index.js"(exports, module) {
    "use strict";
    module.exports = function(str, sep) {
      if (typeof str !== "string") {
        throw new TypeError("Expected a string");
      }
      sep = typeof sep === "undefined" ? "_" : sep;
      return str.replace(/([a-z\d])([A-Z])/g, "$1" + sep + "$2").replace(/([A-Z]+)([A-Z][a-z\d]+)/g, "$1" + sep + "$2").toLowerCase();
    };
  }
});

// node_modules/camelcase/index.js
var require_camelcase = __commonJS({
  "node_modules/camelcase/index.js"(exports, module) {
    "use strict";
    var UPPERCASE = /[\p{Lu}]/u;
    var LOWERCASE = /[\p{Ll}]/u;
    var LEADING_CAPITAL = /^[\p{Lu}](?![\p{Lu}])/gu;
    var IDENTIFIER = /([\p{Alpha}\p{N}_]|$)/u;
    var SEPARATORS = /[_.\- ]+/;
    var LEADING_SEPARATORS = new RegExp("^" + SEPARATORS.source);
    var SEPARATORS_AND_IDENTIFIER = new RegExp(SEPARATORS.source + IDENTIFIER.source, "gu");
    var NUMBERS_AND_IDENTIFIER = new RegExp("\\d+" + IDENTIFIER.source, "gu");
    var preserveCamelCase = (string, toLowerCase, toUpperCase) => {
      let isLastCharLower = false;
      let isLastCharUpper = false;
      let isLastLastCharUpper = false;
      for (let i = 0; i < string.length; i++) {
        const character = string[i];
        if (isLastCharLower && UPPERCASE.test(character)) {
          string = string.slice(0, i) + "-" + string.slice(i);
          isLastCharLower = false;
          isLastLastCharUpper = isLastCharUpper;
          isLastCharUpper = true;
          i++;
        } else if (isLastCharUpper && isLastLastCharUpper && LOWERCASE.test(character)) {
          string = string.slice(0, i - 1) + "-" + string.slice(i - 1);
          isLastLastCharUpper = isLastCharUpper;
          isLastCharUpper = false;
          isLastCharLower = true;
        } else {
          isLastCharLower = toLowerCase(character) === character && toUpperCase(character) !== character;
          isLastLastCharUpper = isLastCharUpper;
          isLastCharUpper = toUpperCase(character) === character && toLowerCase(character) !== character;
        }
      }
      return string;
    };
    var preserveConsecutiveUppercase = (input, toLowerCase) => {
      LEADING_CAPITAL.lastIndex = 0;
      return input.replace(LEADING_CAPITAL, (m1) => toLowerCase(m1));
    };
    var postProcess = (input, toUpperCase) => {
      SEPARATORS_AND_IDENTIFIER.lastIndex = 0;
      NUMBERS_AND_IDENTIFIER.lastIndex = 0;
      return input.replace(SEPARATORS_AND_IDENTIFIER, (_, identifier) => toUpperCase(identifier)).replace(NUMBERS_AND_IDENTIFIER, (m) => toUpperCase(m));
    };
    var camelCase2 = (input, options2) => {
      if (!(typeof input === "string" || Array.isArray(input))) {
        throw new TypeError("Expected the input to be `string | string[]`");
      }
      options2 = {
        pascalCase: false,
        preserveConsecutiveUppercase: false,
        ...options2
      };
      if (Array.isArray(input)) {
        input = input.map((x) => x.trim()).filter((x) => x.length).join("-");
      } else {
        input = input.trim();
      }
      if (input.length === 0) {
        return "";
      }
      const toLowerCase = options2.locale === false ? (string) => string.toLowerCase() : (string) => string.toLocaleLowerCase(options2.locale);
      const toUpperCase = options2.locale === false ? (string) => string.toUpperCase() : (string) => string.toLocaleUpperCase(options2.locale);
      if (input.length === 1) {
        return options2.pascalCase ? toUpperCase(input) : toLowerCase(input);
      }
      const hasUpperCase = input !== toLowerCase(input);
      if (hasUpperCase) {
        input = preserveCamelCase(input, toLowerCase, toUpperCase);
      }
      input = input.replace(LEADING_SEPARATORS, "");
      if (options2.preserveConsecutiveUppercase) {
        input = preserveConsecutiveUppercase(input, toLowerCase);
      } else {
        input = toLowerCase(input);
      }
      if (options2.pascalCase) {
        input = toUpperCase(input.charAt(0)) + input.slice(1);
      }
      return postProcess(input, toUpperCase);
    };
    module.exports = camelCase2;
    module.exports.default = camelCase2;
  }
});

// node_modules/postgres/cjs/src/query.js
var require_query = __commonJS({
  "node_modules/postgres/cjs/src/query.js"(exports, module) {
    var originCache = /* @__PURE__ */ new Map();
    var originStackCache = /* @__PURE__ */ new Map();
    var originError = Symbol("OriginError");
    var CLOSE = module.exports.CLOSE = {};
    var Query = module.exports.Query = class Query extends Promise {
      constructor(strings, args, handler, canceller, options2 = {}) {
        let resolve, reject;
        super((a, b) => {
          resolve = a;
          reject = b;
        });
        this.tagged = Array.isArray(strings.raw);
        this.strings = strings;
        this.args = args;
        this.handler = handler;
        this.canceller = canceller;
        this.options = options2;
        this.state = null;
        this.statement = null;
        this.resolve = (x) => (this.active = false, resolve(x));
        this.reject = (x) => (this.active = false, reject(x));
        this.active = false;
        this.cancelled = null;
        this.executed = false;
        this.signature = "";
        this[originError] = this.handler.debug ? new Error() : this.tagged && cachedError(this.strings);
      }
      get origin() {
        return this.handler.debug ? this[originError].stack : this.tagged ? originStackCache.has(this.strings) ? originStackCache.get(this.strings) : originStackCache.set(this.strings, this[originError].stack).get(this.strings) : "";
      }
      static get [Symbol.species]() {
        return Promise;
      }
      cancel() {
        return this.canceller && (this.canceller(this), this.canceller = null);
      }
      simple() {
        this.options.simple = true;
        this.options.prepare = false;
        return this;
      }
      async readable() {
        this.simple();
        this.streaming = true;
        return this;
      }
      async writable() {
        this.simple();
        this.streaming = true;
        return this;
      }
      cursor(rows = 1, fn) {
        this.options.simple = false;
        if (typeof rows === "function") {
          fn = rows;
          rows = 1;
        }
        this.cursorRows = rows;
        if (typeof fn === "function")
          return this.cursorFn = fn, this;
        let prev;
        return {
          [Symbol.asyncIterator]: () => ({
            next: () => {
              if (this.executed && !this.active)
                return { done: true };
              prev && prev();
              const promise = new Promise((resolve, reject) => {
                this.cursorFn = (value) => {
                  resolve({ value, done: false });
                  return new Promise((r) => prev = r);
                };
                this.resolve = () => (this.active = false, resolve({ done: true }));
                this.reject = (x) => (this.active = false, reject(x));
              });
              this.execute();
              return promise;
            },
            return() {
              prev && prev(CLOSE);
              return { done: true };
            }
          })
        };
      }
      describe() {
        this.options.simple = false;
        this.onlyDescribe = this.options.prepare = true;
        return this;
      }
      stream() {
        throw new Error(".stream has been renamed to .forEach");
      }
      forEach(fn) {
        this.forEachFn = fn;
        this.handle();
        return this;
      }
      raw() {
        this.isRaw = true;
        return this;
      }
      values() {
        this.isRaw = "values";
        return this;
      }
      async handle() {
        !this.executed && (this.executed = true) && await 1 && this.handler(this);
      }
      execute() {
        this.handle();
        return this;
      }
      then() {
        this.handle();
        return super.then.apply(this, arguments);
      }
      catch() {
        this.handle();
        return super.catch.apply(this, arguments);
      }
      finally() {
        this.handle();
        return super.finally.apply(this, arguments);
      }
    };
    function cachedError(xs) {
      if (originCache.has(xs))
        return originCache.get(xs);
      const x = Error.stackTraceLimit;
      Error.stackTraceLimit = 4;
      originCache.set(xs, new Error());
      Error.stackTraceLimit = x;
      return originCache.get(xs);
    }
  }
});

// node_modules/postgres/cjs/src/errors.js
var require_errors = __commonJS({
  "node_modules/postgres/cjs/src/errors.js"(exports, module) {
    var PostgresError = module.exports.PostgresError = class PostgresError extends Error {
      constructor(x) {
        super(x.message);
        this.name = this.constructor.name;
        Object.assign(this, x);
      }
    };
    var Errors = module.exports.Errors = {
      connection,
      postgres,
      generic,
      notSupported
    };
    function connection(x, options2, socket) {
      const { host, port } = socket || options2;
      const error = Object.assign(
        new Error("write " + x + " " + (options2.path || host + ":" + port)),
        {
          code: x,
          errno: x,
          address: options2.path || host
        },
        options2.path ? {} : { port }
      );
      Error.captureStackTrace(error, connection);
      return error;
    }
    function postgres(x) {
      const error = new PostgresError(x);
      Error.captureStackTrace(error, postgres);
      return error;
    }
    function generic(code, message) {
      const error = Object.assign(new Error(code + ": " + message), { code });
      Error.captureStackTrace(error, generic);
      return error;
    }
    function notSupported(x) {
      const error = Object.assign(
        new Error(x + " (B) is not supported"),
        {
          code: "MESSAGE_NOT_SUPPORTED",
          name: x
        }
      );
      Error.captureStackTrace(error, notSupported);
      return error;
    }
  }
});

// node_modules/postgres/cjs/src/types.js
var require_types = __commonJS({
  "node_modules/postgres/cjs/src/types.js"(exports, module) {
    var { Query } = require_query();
    var { Errors } = require_errors();
    var types = module.exports.types = {
      string: {
        to: 25,
        from: null,
        // defaults to string
        serialize: (x) => "" + x
      },
      number: {
        to: 0,
        from: [21, 23, 26, 700, 701],
        serialize: (x) => "" + x,
        parse: (x) => +x
      },
      json: {
        to: 114,
        from: [114, 3802],
        serialize: (x) => JSON.stringify(x),
        parse: (x) => JSON.parse(x)
      },
      boolean: {
        to: 16,
        from: 16,
        serialize: (x) => x === true ? "t" : "f",
        parse: (x) => x === "t"
      },
      date: {
        to: 1184,
        from: [1082, 1114, 1184],
        serialize: (x) => (x instanceof Date ? x : new Date(x)).toISOString(),
        parse: (x) => new Date(x)
      },
      bytea: {
        to: 17,
        from: 17,
        serialize: (x) => "\\x" + Buffer.from(x).toString("hex"),
        parse: (x) => Buffer.from(x.slice(2), "hex")
      }
    };
    var NotTagged = class {
      then() {
        notTagged();
      }
      catch() {
        notTagged();
      }
      finally() {
        notTagged();
      }
    };
    var Identifier = module.exports.Identifier = class Identifier extends NotTagged {
      constructor(value) {
        super();
        this.value = escapeIdentifier(value);
      }
    };
    var Parameter = module.exports.Parameter = class Parameter extends NotTagged {
      constructor(value, type, array) {
        super();
        this.value = value;
        this.type = type;
        this.array = array;
      }
    };
    var Builder = module.exports.Builder = class Builder extends NotTagged {
      constructor(first, rest) {
        super();
        this.first = first;
        this.rest = rest;
      }
      build(before, parameters, types2, options2) {
        const keyword = builders.map(([x, fn]) => ({ fn, i: before.search(x) })).sort((a, b) => a.i - b.i).pop();
        return keyword.i === -1 ? escapeIdentifiers(this.first, options2) : keyword.fn(this.first, this.rest, parameters, types2, options2);
      }
    };
    module.exports.handleValue = handleValue;
    function handleValue(x, parameters, types2, options2) {
      let value = x instanceof Parameter ? x.value : x;
      if (value === void 0) {
        x instanceof Parameter ? x.value = options2.transform.undefined : value = x = options2.transform.undefined;
        if (value === void 0)
          throw Errors.generic("UNDEFINED_VALUE", "Undefined values are not allowed");
      }
      return "$" + types2.push(
        x instanceof Parameter ? (parameters.push(x.value), x.array ? x.array[x.type || inferType(x.value)] || x.type || firstIsString(x.value) : x.type) : (parameters.push(x), inferType(x))
      );
    }
    var defaultHandlers = typeHandlers(types);
    module.exports.stringify = stringify2;
    function stringify2(q, string, value, parameters, types2, options2) {
      for (let i = 1; i < q.strings.length; i++) {
        string += stringifyValue(string, value, parameters, types2, options2) + q.strings[i];
        value = q.args[i];
      }
      return string;
    }
    function stringifyValue(string, value, parameters, types2, o) {
      return value instanceof Builder ? value.build(string, parameters, types2, o) : value instanceof Query ? fragment(value, parameters, types2, o) : value instanceof Identifier ? value.value : value && value[0] instanceof Query ? value.reduce((acc, x) => acc + " " + fragment(x, parameters, types2, o), "") : handleValue(value, parameters, types2, o);
    }
    function fragment(q, parameters, types2, options2) {
      q.fragment = true;
      return stringify2(q, q.strings[0], q.args[0], parameters, types2, options2);
    }
    function valuesBuilder(first, parameters, types2, columns, options2) {
      return first.map(
        (row) => "(" + columns.map(
          (column) => stringifyValue("values", row[column], parameters, types2, options2)
        ).join(",") + ")"
      ).join(",");
    }
    function values(first, rest, parameters, types2, options2) {
      const multi = Array.isArray(first[0]);
      const columns = rest.length ? rest.flat() : Object.keys(multi ? first[0] : first);
      return valuesBuilder(multi ? first : [first], parameters, types2, columns, options2);
    }
    function select(first, rest, parameters, types2, options2) {
      typeof first === "string" && (first = [first].concat(rest));
      if (Array.isArray(first))
        return escapeIdentifiers(first, options2);
      let value;
      const columns = rest.length ? rest.flat() : Object.keys(first);
      return columns.map((x) => {
        value = first[x];
        return (value instanceof Query ? fragment(value, parameters, types2, options2) : value instanceof Identifier ? value.value : handleValue(value, parameters, types2, options2)) + " as " + escapeIdentifier(options2.transform.column.to ? options2.transform.column.to(x) : x);
      }).join(",");
    }
    var builders = Object.entries({
      values,
      in: (...xs) => {
        const x = values(...xs);
        return x === "()" ? "(null)" : x;
      },
      select,
      as: select,
      returning: select,
      update(first, rest, parameters, types2, options2) {
        return (rest.length ? rest.flat() : Object.keys(first)).map(
          (x) => escapeIdentifier(options2.transform.column.to ? options2.transform.column.to(x) : x) + "=" + stringifyValue("values", first[x], parameters, types2, options2)
        );
      },
      insert(first, rest, parameters, types2, options2) {
        const columns = rest.length ? rest.flat() : Object.keys(Array.isArray(first) ? first[0] : first);
        return "(" + escapeIdentifiers(columns, options2) + ")values" + valuesBuilder(Array.isArray(first) ? first : [first], parameters, types2, columns, options2);
      }
    }).map(([x, fn]) => [new RegExp("((?:^|[\\s(])" + x + "(?:$|[\\s(]))(?![\\s\\S]*\\1)", "i"), fn]);
    function notTagged() {
      throw Errors.generic("NOT_TAGGED_CALL", "Query not called as a tagged template literal");
    }
    var serializers = module.exports.serializers = defaultHandlers.serializers;
    var parsers = module.exports.parsers = defaultHandlers.parsers;
    var END = module.exports.END = {};
    function firstIsString(x) {
      if (Array.isArray(x))
        return firstIsString(x[0]);
      return typeof x === "string" ? 1009 : 0;
    }
    var mergeUserTypes = module.exports.mergeUserTypes = function(types2) {
      const user = typeHandlers(types2 || {});
      return {
        serializers: Object.assign({}, serializers, user.serializers),
        parsers: Object.assign({}, parsers, user.parsers)
      };
    };
    function typeHandlers(types2) {
      return Object.keys(types2).reduce((acc, k) => {
        types2[k].from && [].concat(types2[k].from).forEach((x) => acc.parsers[x] = types2[k].parse);
        acc.serializers[types2[k].to] = types2[k].serialize;
        types2[k].from && [].concat(types2[k].from).forEach((x) => acc.serializers[x] = types2[k].serialize);
        return acc;
      }, { parsers: {}, serializers: {} });
    }
    function escapeIdentifiers(xs, { transform: { column } }) {
      return xs.map((x) => escapeIdentifier(column.to ? column.to(x) : x)).join(",");
    }
    var escapeIdentifier = module.exports.escapeIdentifier = function escape2(str) {
      return '"' + str.replace(/"/g, '""').replace(/\./g, '"."') + '"';
    };
    var inferType = module.exports.inferType = function inferType2(x) {
      return x instanceof Parameter ? x.type : x instanceof Date ? 1184 : x instanceof Uint8Array ? 17 : x === true || x === false ? 16 : typeof x === "bigint" ? 20 : Array.isArray(x) ? inferType2(x[0]) : 0;
    };
    var escapeBackslash = /\\/g;
    var escapeQuote = /"/g;
    function arrayEscape(x) {
      return x.replace(escapeBackslash, "\\\\").replace(escapeQuote, '\\"');
    }
    var arraySerializer = module.exports.arraySerializer = function arraySerializer2(xs, serializer, options2, typarray) {
      if (Array.isArray(xs) === false)
        return xs;
      if (!xs.length)
        return "{}";
      const first = xs[0];
      const delimiter = typarray === 1020 ? ";" : ",";
      if (Array.isArray(first) && !first.type)
        return "{" + xs.map((x) => arraySerializer2(x, serializer, options2, typarray)).join(delimiter) + "}";
      return "{" + xs.map((x) => {
        if (x === void 0) {
          x = options2.transform.undefined;
          if (x === void 0)
            throw Errors.generic("UNDEFINED_VALUE", "Undefined values are not allowed");
        }
        return x === null ? "null" : '"' + arrayEscape(serializer ? serializer(x.type ? x.value : x) : "" + x) + '"';
      }).join(delimiter) + "}";
    };
    var arrayParserState = {
      i: 0,
      char: null,
      str: "",
      quoted: false,
      last: 0
    };
    var arrayParser = module.exports.arrayParser = function arrayParser2(x, parser2, typarray) {
      arrayParserState.i = arrayParserState.last = 0;
      return arrayParserLoop(arrayParserState, x, parser2, typarray);
    };
    function arrayParserLoop(s, x, parser2, typarray) {
      const xs = [];
      const delimiter = typarray === 1020 ? ";" : ",";
      for (; s.i < x.length; s.i++) {
        s.char = x[s.i];
        if (s.quoted) {
          if (s.char === "\\") {
            s.str += x[++s.i];
          } else if (s.char === '"') {
            xs.push(parser2 ? parser2(s.str) : s.str);
            s.str = "";
            s.quoted = x[s.i + 1] === '"';
            s.last = s.i + 2;
          } else {
            s.str += s.char;
          }
        } else if (s.char === '"') {
          s.quoted = true;
        } else if (s.char === "{") {
          s.last = ++s.i;
          xs.push(arrayParserLoop(s, x, parser2, typarray));
        } else if (s.char === "}") {
          s.quoted = false;
          s.last < s.i && xs.push(parser2 ? parser2(x.slice(s.last, s.i)) : x.slice(s.last, s.i));
          s.last = s.i + 1;
          break;
        } else if (s.char === delimiter && s.p !== "}" && s.p !== '"') {
          xs.push(parser2 ? parser2(x.slice(s.last, s.i)) : x.slice(s.last, s.i));
          s.last = s.i + 1;
        }
        s.p = s.char;
      }
      s.last < s.i && xs.push(parser2 ? parser2(x.slice(s.last, s.i + 1)) : x.slice(s.last, s.i + 1));
      return xs;
    }
    var toCamel = module.exports.toCamel = (x) => {
      let str = x[0];
      for (let i = 1; i < x.length; i++)
        str += x[i] === "_" ? x[++i].toUpperCase() : x[i];
      return str;
    };
    var toPascal = module.exports.toPascal = (x) => {
      let str = x[0].toUpperCase();
      for (let i = 1; i < x.length; i++)
        str += x[i] === "_" ? x[++i].toUpperCase() : x[i];
      return str;
    };
    var toKebab = module.exports.toKebab = (x) => x.replace(/_/g, "-");
    var fromCamel = module.exports.fromCamel = (x) => x.replace(/([A-Z])/g, "_$1").toLowerCase();
    var fromPascal = module.exports.fromPascal = (x) => (x.slice(0, 1) + x.slice(1).replace(/([A-Z])/g, "_$1")).toLowerCase();
    var fromKebab = module.exports.fromKebab = (x) => x.replace(/-/g, "_");
    function createJsonTransform(fn) {
      return function jsonTransform(x, column) {
        return typeof x === "object" && x !== null && (column.type === 114 || column.type === 3802) ? Array.isArray(x) ? x.map((x2) => jsonTransform(x2, column)) : Object.entries(x).reduce((acc, [k, v]) => Object.assign(acc, { [fn(k)]: jsonTransform(v, column) }), {}) : x;
      };
    }
    toCamel.column = { from: toCamel };
    toCamel.value = { from: createJsonTransform(toCamel) };
    fromCamel.column = { to: fromCamel };
    var camel = module.exports.camel = { ...toCamel };
    camel.column.to = fromCamel;
    toPascal.column = { from: toPascal };
    toPascal.value = { from: createJsonTransform(toPascal) };
    fromPascal.column = { to: fromPascal };
    var pascal = module.exports.pascal = { ...toPascal };
    pascal.column.to = fromPascal;
    toKebab.column = { from: toKebab };
    toKebab.value = { from: createJsonTransform(toKebab) };
    fromKebab.column = { to: fromKebab };
    var kebab = module.exports.kebab = { ...toKebab };
    kebab.column.to = fromKebab;
  }
});

// node_modules/postgres/cjs/src/result.js
var require_result = __commonJS({
  "node_modules/postgres/cjs/src/result.js"(exports, module) {
    module.exports = class Result extends Array {
      constructor() {
        super();
        Object.defineProperties(this, {
          count: { value: null, writable: true },
          state: { value: null, writable: true },
          command: { value: null, writable: true },
          columns: { value: null, writable: true },
          statement: { value: null, writable: true }
        });
      }
      static get [Symbol.species]() {
        return Array;
      }
    };
  }
});

// node_modules/postgres/cjs/src/queue.js
var require_queue = __commonJS({
  "node_modules/postgres/cjs/src/queue.js"(exports, module) {
    module.exports = Queue;
    function Queue(initial = []) {
      let xs = initial.slice();
      let index = 0;
      return {
        get length() {
          return xs.length - index;
        },
        remove: (x) => {
          const index2 = xs.indexOf(x);
          return index2 === -1 ? null : (xs.splice(index2, 1), x);
        },
        push: (x) => (xs.push(x), x),
        shift: () => {
          const out = xs[index++];
          if (index === xs.length) {
            index = 0;
            xs = [];
          } else {
            xs[index - 1] = void 0;
          }
          return out;
        }
      };
    }
  }
});

// node_modules/postgres/cjs/src/bytes.js
var require_bytes = __commonJS({
  "node_modules/postgres/cjs/src/bytes.js"(exports, module) {
    var size = 256;
    var buffer = Buffer.allocUnsafe(size);
    var messages = "BCcDdEFfHPpQSX".split("").reduce((acc, x) => {
      const v = x.charCodeAt(0);
      acc[x] = () => {
        buffer[0] = v;
        b.i = 5;
        return b;
      };
      return acc;
    }, {});
    var b = Object.assign(reset, messages, {
      N: String.fromCharCode(0),
      i: 0,
      inc(x) {
        b.i += x;
        return b;
      },
      str(x) {
        const length = Buffer.byteLength(x);
        fit(length);
        b.i += buffer.write(x, b.i, length, "utf8");
        return b;
      },
      i16(x) {
        fit(2);
        buffer.writeUInt16BE(x, b.i);
        b.i += 2;
        return b;
      },
      i32(x, i) {
        if (i || i === 0) {
          buffer.writeUInt32BE(x, i);
          return b;
        }
        fit(4);
        buffer.writeUInt32BE(x, b.i);
        b.i += 4;
        return b;
      },
      z(x) {
        fit(x);
        buffer.fill(0, b.i, b.i + x);
        b.i += x;
        return b;
      },
      raw(x) {
        buffer = Buffer.concat([buffer.subarray(0, b.i), x]);
        b.i = buffer.length;
        return b;
      },
      end(at = 1) {
        buffer.writeUInt32BE(b.i - at, at);
        const out = buffer.subarray(0, b.i);
        b.i = 0;
        buffer = Buffer.allocUnsafe(size);
        return out;
      }
    });
    module.exports = b;
    function fit(x) {
      if (buffer.length - b.i < x) {
        const prev = buffer, length = prev.length;
        buffer = Buffer.allocUnsafe(length + (length >> 1) + x);
        prev.copy(buffer);
      }
    }
    function reset() {
      b.i = 0;
      return b;
    }
  }
});

// node_modules/postgres/cjs/src/connection.js
var require_connection = __commonJS({
  "node_modules/postgres/cjs/src/connection.js"(exports, module) {
    var net = __require("net");
    var tls = __require("tls");
    var crypto = __require("crypto");
    var Stream = __require("stream");
    var { stringify: stringify2, handleValue, arrayParser, arraySerializer } = require_types();
    var { Errors } = require_errors();
    var Result = require_result();
    var Queue = require_queue();
    var { Query, CLOSE } = require_query();
    var b = require_bytes();
    module.exports = Connection;
    var uid = 1;
    var Sync = b().S().end();
    var Flush = b().H().end();
    var SSLRequest = b().i32(8).i32(80877103).end(8);
    var ExecuteUnnamed = Buffer.concat([b().E().str(b.N).i32(0).end(), Sync]);
    var DescribeUnnamed = b().D().str("S").str(b.N).end();
    var noop = () => {
    };
    var retryRoutines = /* @__PURE__ */ new Set([
      "FetchPreparedStatement",
      "RevalidateCachedQuery",
      "transformAssignedExpr"
    ]);
    var errorFields = {
      83: "severity_local",
      // S
      86: "severity",
      // V
      67: "code",
      // C
      77: "message",
      // M
      68: "detail",
      // D
      72: "hint",
      // H
      80: "position",
      // P
      112: "internal_position",
      // p
      113: "internal_query",
      // q
      87: "where",
      // W
      115: "schema_name",
      // s
      116: "table_name",
      // t
      99: "column_name",
      // c
      100: "data type_name",
      // d
      110: "constraint_name",
      // n
      70: "file",
      // F
      76: "line",
      // L
      82: "routine"
      // R
    };
    function Connection(options2, queues = {}, { onopen = noop, onend = noop, onclose = noop } = {}) {
      const {
        ssl,
        max,
        user,
        host,
        port,
        database,
        parsers,
        transform,
        onnotice,
        onnotify,
        onparameter,
        max_pipeline,
        keep_alive,
        backoff,
        target_session_attrs
      } = options2;
      const sent = Queue(), id = uid++, backend = { pid: null, secret: null }, idleTimer = timer(end, options2.idle_timeout), lifeTimer = timer(end, options2.max_lifetime), connectTimer = timer(connectTimedOut, options2.connect_timeout);
      let socket = null, cancelMessage, result = new Result(), incoming = Buffer.alloc(0), needsTypes = options2.fetch_types, backendParameters = {}, statements = {}, statementId = Math.random().toString(36).slice(2), statementCount = 1, closedDate = 0, remaining = 0, hostIndex = 0, retries = 0, length = 0, delay = 0, rows = 0, serverSignature = null, nextWriteTimer = null, terminated = false, incomings = null, results = null, initial = null, ending = null, stream = null, chunk = null, ended = null, nonce = null, query = null, final = null;
      const connection = {
        queue: queues.closed,
        idleTimer,
        connect(query2) {
          initial = query2;
          reconnect();
        },
        terminate,
        execute,
        cancel,
        end,
        count: 0,
        id
      };
      queues.closed && queues.closed.push(connection);
      return connection;
      async function createSocket() {
        let x;
        try {
          x = options2.socket ? await Promise.resolve(options2.socket(options2)) : net.Socket();
        } catch (e) {
          error(e);
          return;
        }
        x.on("error", error);
        x.on("close", closed);
        x.on("drain", drain);
        return x;
      }
      async function cancel({ pid, secret }, resolve, reject) {
        try {
          cancelMessage = b().i32(16).i32(80877102).i32(pid).i32(secret).end(16);
          await connect();
          socket.once("error", reject);
          socket.once("close", resolve);
        } catch (error2) {
          reject(error2);
        }
      }
      function execute(q) {
        if (terminated)
          return queryError(q, Errors.connection("CONNECTION_DESTROYED", options2));
        if (q.cancelled)
          return;
        try {
          q.state = backend;
          query ? sent.push(q) : (query = q, query.active = true);
          build(q);
          return write(toBuffer(q)) && !q.describeFirst && !q.cursorFn && sent.length < max_pipeline && (!q.options.onexecute || q.options.onexecute(connection));
        } catch (error2) {
          sent.length === 0 && write(Sync);
          errored(error2);
          return true;
        }
      }
      function toBuffer(q) {
        if (q.parameters.length >= 65534)
          throw Errors.generic("MAX_PARAMETERS_EXCEEDED", "Max number of parameters (65534) exceeded");
        return q.options.simple ? b().Q().str(q.statement.string + b.N).end() : q.describeFirst ? Buffer.concat([describe(q), Flush]) : q.prepare ? q.prepared ? prepared(q) : Buffer.concat([describe(q), prepared(q)]) : unnamed(q);
      }
      function describe(q) {
        return Buffer.concat([
          Parse(q.statement.string, q.parameters, q.statement.types, q.statement.name),
          Describe("S", q.statement.name)
        ]);
      }
      function prepared(q) {
        return Buffer.concat([
          Bind(q.parameters, q.statement.types, q.statement.name, q.cursorName),
          q.cursorFn ? Execute("", q.cursorRows) : ExecuteUnnamed
        ]);
      }
      function unnamed(q) {
        return Buffer.concat([
          Parse(q.statement.string, q.parameters, q.statement.types),
          DescribeUnnamed,
          prepared(q)
        ]);
      }
      function build(q) {
        const parameters = [], types = [];
        const string = stringify2(q, q.strings[0], q.args[0], parameters, types, options2);
        !q.tagged && q.args.forEach((x) => handleValue(x, parameters, types, options2));
        q.prepare = options2.prepare && ("prepare" in q.options ? q.options.prepare : true);
        q.string = string;
        q.signature = q.prepare && types + string;
        q.onlyDescribe && delete statements[q.signature];
        q.parameters = q.parameters || parameters;
        q.prepared = q.prepare && q.signature in statements;
        q.describeFirst = q.onlyDescribe || parameters.length && !q.prepared;
        q.statement = q.prepared ? statements[q.signature] : { string, types, name: q.prepare ? statementId + statementCount++ : "" };
        typeof options2.debug === "function" && options2.debug(id, string, parameters, types);
      }
      function write(x, fn) {
        chunk = chunk ? Buffer.concat([chunk, x]) : Buffer.from(x);
        if (fn || chunk.length >= 1024)
          return nextWrite(fn);
        nextWriteTimer === null && (nextWriteTimer = setImmediate(nextWrite));
        return true;
      }
      function nextWrite(fn) {
        const x = socket.write(chunk, fn);
        nextWriteTimer !== null && clearImmediate(nextWriteTimer);
        chunk = nextWriteTimer = null;
        return x;
      }
      function connectTimedOut() {
        errored(Errors.connection("CONNECT_TIMEOUT", options2, socket));
        socket.destroy();
      }
      async function secure() {
        write(SSLRequest);
        const canSSL = await new Promise((r) => socket.once("data", (x) => r(x[0] === 83)));
        if (!canSSL && ssl === "prefer")
          return connected();
        socket.removeAllListeners();
        socket = tls.connect({
          socket,
          servername: net.isIP(socket.host) ? void 0 : socket.host,
          ...ssl === "require" || ssl === "allow" || ssl === "prefer" ? { rejectUnauthorized: false } : ssl === "verify-full" ? {} : typeof ssl === "object" ? ssl : {}
        });
        socket.on("secureConnect", connected);
        socket.on("error", error);
        socket.on("close", closed);
        socket.on("drain", drain);
      }
      function drain() {
        !query && onopen(connection);
      }
      function data(x) {
        if (incomings) {
          incomings.push(x);
          remaining -= x.length;
          if (remaining >= 0)
            return;
        }
        incoming = incomings ? Buffer.concat(incomings, length - remaining) : incoming.length === 0 ? x : Buffer.concat([incoming, x], incoming.length + x.length);
        while (incoming.length > 4) {
          length = incoming.readUInt32BE(1);
          if (length >= incoming.length) {
            remaining = length - incoming.length;
            incomings = [incoming];
            break;
          }
          try {
            handle(incoming.subarray(0, length + 1));
          } catch (e) {
            query && (query.cursorFn || query.describeFirst) && write(Sync);
            errored(e);
          }
          incoming = incoming.subarray(length + 1);
          remaining = 0;
          incomings = null;
        }
      }
      async function connect() {
        terminated = false;
        backendParameters = {};
        socket || (socket = await createSocket());
        if (!socket)
          return;
        connectTimer.start();
        if (options2.socket)
          return ssl ? secure() : connected();
        socket.on("connect", ssl ? secure : connected);
        if (options2.path)
          return socket.connect(options2.path);
        socket.connect(port[hostIndex], host[hostIndex]);
        socket.host = host[hostIndex];
        socket.port = port[hostIndex];
        hostIndex = (hostIndex + 1) % port.length;
      }
      function reconnect() {
        setTimeout(connect, closedDate ? closedDate + delay - Number(process.hrtime.bigint() / 1000000n) : 0);
      }
      function connected() {
        try {
          statements = {};
          needsTypes = options2.fetch_types;
          statementId = Math.random().toString(36).slice(2);
          statementCount = 1;
          lifeTimer.start();
          socket.on("data", data);
          keep_alive && socket.setKeepAlive && socket.setKeepAlive(true, 1e3 * keep_alive);
          const s = StartupMessage();
          write(s);
        } catch (err) {
          error(err);
        }
      }
      function error(err) {
        if (connection.queue === queues.connecting && options2.host[retries + 1])
          return;
        errored(err);
        while (sent.length)
          queryError(sent.shift(), err);
      }
      function errored(err) {
        stream && (stream.destroy(err), stream = null);
        query && queryError(query, err);
        initial && (queryError(initial, err), initial = null);
      }
      function queryError(query2, err) {
        query2.reject(Object.create(err, {
          stack: { value: err.stack + query2.origin.replace(/.*\n/, "\n"), enumerable: options2.debug },
          query: { value: query2.string, enumerable: options2.debug },
          parameters: { value: query2.parameters, enumerable: options2.debug },
          args: { value: query2.args, enumerable: options2.debug },
          types: { value: query2.statement && query2.statement.types, enumerable: options2.debug }
        }));
      }
      function end() {
        return ending || (!connection.reserved && onend(connection), !connection.reserved && !initial && !query && sent.length === 0 ? (terminate(), new Promise((r) => socket && socket.readyState !== "closed" ? socket.once("close", r) : r())) : ending = new Promise((r) => ended = r));
      }
      function terminate() {
        terminated = true;
        if (stream || query || initial || sent.length)
          error(Errors.connection("CONNECTION_DESTROYED", options2));
        clearImmediate(nextWriteTimer);
        if (socket) {
          socket.removeListener("data", data);
          socket.removeListener("connect", connected);
          socket.readyState === "open" && socket.end(b().X().end());
        }
        ended && (ended(), ending = ended = null);
      }
      async function closed(hadError) {
        incoming = Buffer.alloc(0);
        remaining = 0;
        incomings = null;
        clearImmediate(nextWriteTimer);
        socket.removeListener("data", data);
        socket.removeListener("connect", connected);
        idleTimer.cancel();
        lifeTimer.cancel();
        connectTimer.cancel();
        if (socket.encrypted) {
          socket.removeAllListeners();
          socket = null;
        }
        if (initial)
          return reconnect();
        !hadError && (query || sent.length) && error(Errors.connection("CONNECTION_CLOSED", options2, socket));
        closedDate = Number(process.hrtime.bigint() / 1000000n);
        hadError && options2.shared.retries++;
        delay = (typeof backoff === "function" ? backoff(options2.shared.retries) : backoff) * 1e3;
        onclose(connection);
      }
      function handle(xs, x = xs[0]) {
        (x === 68 ? DataRow : (
          // D
          x === 100 ? CopyData : (
            // d
            x === 65 ? NotificationResponse : (
              // A
              x === 83 ? ParameterStatus : (
                // S
                x === 90 ? ReadyForQuery : (
                  // Z
                  x === 67 ? CommandComplete : (
                    // C
                    x === 50 ? BindComplete : (
                      // 2
                      x === 49 ? ParseComplete : (
                        // 1
                        x === 116 ? ParameterDescription : (
                          // t
                          x === 84 ? RowDescription : (
                            // T
                            x === 82 ? Authentication : (
                              // R
                              x === 110 ? NoData : (
                                // n
                                x === 75 ? BackendKeyData : (
                                  // K
                                  x === 69 ? ErrorResponse : (
                                    // E
                                    x === 115 ? PortalSuspended : (
                                      // s
                                      x === 51 ? CloseComplete : (
                                        // 3
                                        x === 71 ? CopyInResponse : (
                                          // G
                                          x === 78 ? NoticeResponse : (
                                            // N
                                            x === 72 ? CopyOutResponse : (
                                              // H
                                              x === 99 ? CopyDone : (
                                                // c
                                                x === 73 ? EmptyQueryResponse : (
                                                  // I
                                                  x === 86 ? FunctionCallResponse : (
                                                    // V
                                                    x === 118 ? NegotiateProtocolVersion : (
                                                      // v
                                                      x === 87 ? CopyBothResponse : (
                                                        // W
                                                        /* c8 ignore next */
                                                        UnknownMessage
                                                      )
                                                    )
                                                  )
                                                )
                                              )
                                            )
                                          )
                                        )
                                      )
                                    )
                                  )
                                )
                              )
                            )
                          )
                        )
                      )
                    )
                  )
                )
              )
            )
          )
        ))(xs);
      }
      function DataRow(x) {
        let index = 7;
        let length2;
        let column;
        let value;
        const row = query.isRaw ? new Array(query.statement.columns.length) : {};
        for (let i = 0; i < query.statement.columns.length; i++) {
          column = query.statement.columns[i];
          length2 = x.readInt32BE(index);
          index += 4;
          value = length2 === -1 ? null : query.isRaw === true ? x.subarray(index, index += length2) : column.parser === void 0 ? x.toString("utf8", index, index += length2) : column.parser.array === true ? column.parser(x.toString("utf8", index + 1, index += length2)) : column.parser(x.toString("utf8", index, index += length2));
          query.isRaw ? row[i] = query.isRaw === true ? value : transform.value.from ? transform.value.from(value, column) : value : row[column.name] = transform.value.from ? transform.value.from(value, column) : value;
        }
        query.forEachFn ? query.forEachFn(transform.row.from ? transform.row.from(row) : row, result) : result[rows++] = transform.row.from ? transform.row.from(row) : row;
      }
      function ParameterStatus(x) {
        const [k, v] = x.toString("utf8", 5, x.length - 1).split(b.N);
        backendParameters[k] = v;
        if (options2.parameters[k] !== v) {
          options2.parameters[k] = v;
          onparameter && onparameter(k, v);
        }
      }
      function ReadyForQuery(x) {
        query && query.options.simple && query.resolve(results || result);
        query = results = null;
        result = new Result();
        connectTimer.cancel();
        if (initial) {
          if (target_session_attrs) {
            if (!backendParameters.in_hot_standby || !backendParameters.default_transaction_read_only)
              return fetchState();
            else if (tryNext(target_session_attrs, backendParameters))
              return terminate();
          }
          if (needsTypes)
            return fetchArrayTypes();
          execute(initial);
          options2.shared.retries = retries = initial = 0;
          return;
        }
        while (sent.length && (query = sent.shift()) && (query.active = true, query.cancelled))
          Connection(options2).cancel(query.state, query.cancelled.resolve, query.cancelled.reject);
        if (query)
          return;
        connection.reserved ? x[5] === 73 ? ending ? terminate() : (connection.reserved = null, onopen(connection)) : connection.reserved() : ending ? terminate() : onopen(connection);
      }
      function CommandComplete(x) {
        rows = 0;
        for (let i = x.length - 1; i > 0; i--) {
          if (x[i] === 32 && x[i + 1] < 58 && result.count === null)
            result.count = +x.toString("utf8", i + 1, x.length - 1);
          if (x[i - 1] >= 65) {
            result.command = x.toString("utf8", 5, i);
            result.state = backend;
            break;
          }
        }
        final && (final(), final = null);
        if (result.command === "BEGIN" && max !== 1 && !connection.reserved)
          return errored(Errors.generic("UNSAFE_TRANSACTION", "Only use sql.begin or max: 1"));
        if (query.options.simple)
          return BindComplete();
        if (query.cursorFn) {
          result.count && query.cursorFn(result);
          write(Sync);
        }
        query.resolve(result);
      }
      function ParseComplete() {
        query.parsing = false;
      }
      function BindComplete() {
        !result.statement && (result.statement = query.statement);
        result.columns = query.statement.columns;
      }
      function ParameterDescription(x) {
        const length2 = x.readUInt16BE(5);
        for (let i = 0; i < length2; ++i)
          !query.statement.types[i] && (query.statement.types[i] = x.readUInt32BE(7 + i * 4));
        query.prepare && (statements[query.signature] = query.statement);
        query.describeFirst && !query.onlyDescribe && (write(prepared(query)), query.describeFirst = false);
      }
      function RowDescription(x) {
        if (result.command) {
          results = results || [result];
          results.push(result = new Result());
          result.count = null;
          query.statement.columns = null;
        }
        const length2 = x.readUInt16BE(5);
        let index = 7;
        let start;
        query.statement.columns = Array(length2);
        for (let i = 0; i < length2; ++i) {
          start = index;
          while (x[index++] !== 0)
            ;
          const table = x.readUInt32BE(index);
          const number = x.readUInt16BE(index + 4);
          const type = x.readUInt32BE(index + 6);
          query.statement.columns[i] = {
            name: transform.column.from ? transform.column.from(x.toString("utf8", start, index - 1)) : x.toString("utf8", start, index - 1),
            parser: parsers[type],
            table,
            number,
            type
          };
          index += 18;
        }
        result.statement = query.statement;
        if (query.onlyDescribe)
          return query.resolve(query.statement), write(Sync);
      }
      async function Authentication(x, type = x.readUInt32BE(5)) {
        (type === 3 ? AuthenticationCleartextPassword : type === 5 ? AuthenticationMD5Password : type === 10 ? SASL : type === 11 ? SASLContinue : type === 12 ? SASLFinal : type !== 0 ? UnknownAuth : noop)(x, type);
      }
      async function AuthenticationCleartextPassword() {
        write(
          b().p().str(await Pass()).z(1).end()
        );
      }
      async function AuthenticationMD5Password(x) {
        write(
          b().p().str("md5" + md5(Buffer.concat([Buffer.from(md5(await Pass() + user)), x.subarray(9)]))).z(1).end()
        );
      }
      function SASL() {
        b().p().str("SCRAM-SHA-256" + b.N);
        const i = b.i;
        nonce = crypto.randomBytes(18).toString("base64");
        write(b.inc(4).str("n,,n=*,r=" + nonce).i32(b.i - i - 4, i).end());
      }
      async function SASLContinue(x) {
        const res = x.toString("utf8", 9).split(",").reduce((acc, x2) => (acc[x2[0]] = x2.slice(2), acc), {});
        const saltedPassword = crypto.pbkdf2Sync(
          await Pass(),
          Buffer.from(res.s, "base64"),
          parseInt(res.i),
          32,
          "sha256"
        );
        const clientKey = hmac(saltedPassword, "Client Key");
        const auth = "n=*,r=" + nonce + ",r=" + res.r + ",s=" + res.s + ",i=" + res.i + ",c=biws,r=" + res.r;
        serverSignature = hmac(hmac(saltedPassword, "Server Key"), auth).toString("base64");
        write(
          b().p().str("c=biws,r=" + res.r + ",p=" + xor(clientKey, hmac(sha256(clientKey), auth)).toString("base64")).end()
        );
      }
      function SASLFinal(x) {
        if (x.toString("utf8", 9).split(b.N, 1)[0].slice(2) === serverSignature)
          return;
        errored(Errors.generic("SASL_SIGNATURE_MISMATCH", "The server did not return the correct signature"));
        socket.destroy();
      }
      function Pass() {
        return Promise.resolve(
          typeof options2.pass === "function" ? options2.pass() : options2.pass
        );
      }
      function NoData() {
        result.statement = query.statement;
        result.statement.columns = [];
        if (query.onlyDescribe)
          return query.resolve(query.statement), write(Sync);
      }
      function BackendKeyData(x) {
        backend.pid = x.readUInt32BE(5);
        backend.secret = x.readUInt32BE(9);
      }
      async function fetchArrayTypes() {
        needsTypes = false;
        const types = await new Query([`
      select b.oid, b.typarray
      from pg_catalog.pg_type a
      left join pg_catalog.pg_type b on b.oid = a.typelem
      where a.typcategory = 'A'
      group by b.oid, b.typarray
      order by b.oid
    `], [], execute);
        types.forEach(({ oid, typarray }) => addArrayType(oid, typarray));
      }
      function addArrayType(oid, typarray) {
        if (!!options2.parsers[typarray] && !!options2.serializers[typarray])
          return;
        const parser2 = options2.parsers[oid];
        options2.shared.typeArrayMap[oid] = typarray;
        options2.parsers[typarray] = (xs) => arrayParser(xs, parser2, typarray);
        options2.parsers[typarray].array = true;
        options2.serializers[typarray] = (xs) => arraySerializer(xs, options2.serializers[oid], options2, typarray);
      }
      function tryNext(x, xs) {
        return x === "read-write" && xs.default_transaction_read_only === "on" || x === "read-only" && xs.default_transaction_read_only === "off" || x === "primary" && xs.in_hot_standby === "on" || x === "standby" && xs.in_hot_standby === "off" || x === "prefer-standby" && xs.in_hot_standby === "off" && options2.host[retries];
      }
      function fetchState() {
        const query2 = new Query([`
      show transaction_read_only;
      select pg_catalog.pg_is_in_recovery()
    `], [], execute, null, { simple: true });
        query2.resolve = ([[a], [b2]]) => {
          backendParameters.default_transaction_read_only = a.transaction_read_only;
          backendParameters.in_hot_standby = b2.pg_is_in_recovery ? "on" : "off";
        };
        query2.execute();
      }
      function ErrorResponse(x) {
        query && (query.cursorFn || query.describeFirst) && write(Sync);
        const error2 = Errors.postgres(parseError(x));
        query && query.retried ? errored(query.retried) : query && retryRoutines.has(error2.routine) ? retry(query, error2) : errored(error2);
      }
      function retry(q, error2) {
        delete statements[q.signature];
        q.retried = error2;
        execute(q);
      }
      function NotificationResponse(x) {
        if (!onnotify)
          return;
        let index = 9;
        while (x[index++] !== 0)
          ;
        onnotify(
          x.toString("utf8", 9, index - 1),
          x.toString("utf8", index, x.length - 1)
        );
      }
      async function PortalSuspended() {
        try {
          const x = await Promise.resolve(query.cursorFn(result));
          rows = 0;
          x === CLOSE ? write(Close(query.portal)) : (result = new Result(), write(Execute("", query.cursorRows)));
        } catch (err) {
          write(Sync);
          query.reject(err);
        }
      }
      function CloseComplete() {
        result.count && query.cursorFn(result);
        query.resolve(result);
      }
      function CopyInResponse() {
        stream = new Stream.Writable({
          autoDestroy: true,
          write(chunk2, encoding, callback) {
            socket.write(b().d().raw(chunk2).end(), callback);
          },
          destroy(error2, callback) {
            callback(error2);
            socket.write(b().f().str(error2 + b.N).end());
            stream = null;
          },
          final(callback) {
            socket.write(b().c().end());
            final = callback;
          }
        });
        query.resolve(stream);
      }
      function CopyOutResponse() {
        stream = new Stream.Readable({
          read() {
            socket.resume();
          }
        });
        query.resolve(stream);
      }
      function CopyBothResponse() {
        stream = new Stream.Duplex({
          autoDestroy: true,
          read() {
            socket.resume();
          },
          /* c8 ignore next 11 */
          write(chunk2, encoding, callback) {
            socket.write(b().d().raw(chunk2).end(), callback);
          },
          destroy(error2, callback) {
            callback(error2);
            socket.write(b().f().str(error2 + b.N).end());
            stream = null;
          },
          final(callback) {
            socket.write(b().c().end());
            final = callback;
          }
        });
        query.resolve(stream);
      }
      function CopyData(x) {
        stream && (stream.push(x.subarray(5)) || socket.pause());
      }
      function CopyDone() {
        stream && stream.push(null);
        stream = null;
      }
      function NoticeResponse(x) {
        onnotice ? onnotice(parseError(x)) : console.log(parseError(x));
      }
      function EmptyQueryResponse() {
      }
      function FunctionCallResponse() {
        errored(Errors.notSupported("FunctionCallResponse"));
      }
      function NegotiateProtocolVersion() {
        errored(Errors.notSupported("NegotiateProtocolVersion"));
      }
      function UnknownMessage(x) {
        console.error("Postgres.js : Unknown Message:", x[0]);
      }
      function UnknownAuth(x, type) {
        console.error("Postgres.js : Unknown Auth:", type);
      }
      function Bind(parameters, types, statement = "", portal = "") {
        let prev, type;
        b().B().str(portal + b.N).str(statement + b.N).i16(0).i16(parameters.length);
        parameters.forEach((x, i) => {
          if (x === null)
            return b.i32(4294967295);
          type = types[i];
          parameters[i] = x = type in options2.serializers ? options2.serializers[type](x) : "" + x;
          prev = b.i;
          b.inc(4).str(x).i32(b.i - prev - 4, prev);
        });
        b.i16(0);
        return b.end();
      }
      function Parse(str, parameters, types, name = "") {
        b().P().str(name + b.N).str(str + b.N).i16(parameters.length);
        parameters.forEach((x, i) => b.i32(types[i] || 0));
        return b.end();
      }
      function Describe(x, name = "") {
        return b().D().str(x).str(name + b.N).end();
      }
      function Execute(portal = "", rows2 = 0) {
        return Buffer.concat([
          b().E().str(portal + b.N).i32(rows2).end(),
          Flush
        ]);
      }
      function Close(portal = "") {
        return Buffer.concat([
          b().C().str("P").str(portal + b.N).end(),
          b().S().end()
        ]);
      }
      function StartupMessage() {
        return cancelMessage || b().inc(4).i16(3).z(2).str(
          Object.entries(Object.assign(
            {
              user,
              database,
              client_encoding: "UTF8"
            },
            options2.connection
          )).filter(([, v]) => v).map(([k, v]) => k + b.N + v).join(b.N)
        ).z(2).end(0);
      }
    }
    function parseError(x) {
      const error = {};
      let start = 5;
      for (let i = 5; i < x.length - 1; i++) {
        if (x[i] === 0) {
          error[errorFields[x[start]]] = x.toString("utf8", start + 1, i);
          start = i + 1;
        }
      }
      return error;
    }
    function md5(x) {
      return crypto.createHash("md5").update(x).digest("hex");
    }
    function hmac(key, x) {
      return crypto.createHmac("sha256", key).update(x).digest();
    }
    function sha256(x) {
      return crypto.createHash("sha256").update(x).digest();
    }
    function xor(a, b2) {
      const length = Math.max(a.length, b2.length);
      const buffer = Buffer.allocUnsafe(length);
      for (let i = 0; i < length; i++)
        buffer[i] = a[i] ^ b2[i];
      return buffer;
    }
    function timer(fn, seconds) {
      seconds = typeof seconds === "function" ? seconds() : seconds;
      if (!seconds)
        return { cancel: noop, start: noop };
      let timer2;
      return {
        cancel() {
          timer2 && (clearTimeout(timer2), timer2 = null);
        },
        start() {
          timer2 && clearTimeout(timer2);
          timer2 = setTimeout(done, seconds * 1e3, arguments);
        }
      };
      function done(args) {
        fn.apply(null, args);
        timer2 = null;
      }
    }
  }
});

// node_modules/postgres/cjs/src/subscribe.js
var require_subscribe = __commonJS({
  "node_modules/postgres/cjs/src/subscribe.js"(exports, module) {
    var noop = () => {
    };
    module.exports = Subscribe;
    function Subscribe(postgres, options2) {
      const subscribers = /* @__PURE__ */ new Map(), slot = "postgresjs_" + Math.random().toString(36).slice(2), state = {};
      let connection, stream, ended = false;
      const sql = subscribe.sql = postgres({
        ...options2,
        transform: { column: {}, value: {}, row: {} },
        max: 1,
        fetch_types: false,
        idle_timeout: null,
        max_lifetime: null,
        connection: {
          ...options2.connection,
          replication: "database"
        },
        onclose: async function() {
          if (ended)
            return;
          stream = null;
          state.pid = state.secret = void 0;
          connected(await init(sql, slot, options2.publications));
          subscribers.forEach((event) => event.forEach(({ onsubscribe }) => onsubscribe()));
        },
        no_subscribe: true
      });
      const end = sql.end, close = sql.close;
      sql.end = async () => {
        ended = true;
        stream && await new Promise((r) => (stream.once("close", r), stream.end()));
        return end();
      };
      sql.close = async () => {
        stream && await new Promise((r) => (stream.once("close", r), stream.end()));
        return close();
      };
      return subscribe;
      async function subscribe(event, fn, onsubscribe = noop) {
        event = parseEvent(event);
        if (!connection)
          connection = init(sql, slot, options2.publications);
        const subscriber = { fn, onsubscribe };
        const fns = subscribers.has(event) ? subscribers.get(event).add(subscriber) : subscribers.set(event, /* @__PURE__ */ new Set([subscriber])).get(event);
        const unsubscribe = () => {
          fns.delete(subscriber);
          fns.size === 0 && subscribers.delete(event);
        };
        return connection.then((x) => {
          connected(x);
          onsubscribe();
          return { unsubscribe, state, sql };
        });
      }
      function connected(x) {
        stream = x.stream;
        state.pid = x.state.pid;
        state.secret = x.state.secret;
      }
      async function init(sql2, slot2, publications) {
        if (!publications)
          throw new Error("Missing publication names");
        const xs = await sql2.unsafe(
          `CREATE_REPLICATION_SLOT ${slot2} TEMPORARY LOGICAL pgoutput NOEXPORT_SNAPSHOT`
        );
        const [x] = xs;
        const stream2 = await sql2.unsafe(
          `START_REPLICATION SLOT ${slot2} LOGICAL ${x.consistent_point} (proto_version '1', publication_names '${publications}')`
        ).writable();
        const state2 = {
          lsn: Buffer.concat(x.consistent_point.split("/").map((x2) => Buffer.from(("00000000" + x2).slice(-8), "hex")))
        };
        stream2.on("data", data);
        stream2.on("error", sql2.close);
        stream2.on("close", sql2.close);
        return { stream: stream2, state: xs.state };
        function data(x2) {
          if (x2[0] === 119)
            parse3(x2.subarray(25), state2, sql2.options.parsers, handle, options2.transform);
          else if (x2[0] === 107 && x2[17])
            pong();
        }
        function handle(a, b) {
          const path = b.relation.schema + "." + b.relation.table;
          call("*", a, b);
          call("*:" + path, a, b);
          b.relation.keys.length && call("*:" + path + "=" + b.relation.keys.map((x2) => a[x2.name]), a, b);
          call(b.command, a, b);
          call(b.command + ":" + path, a, b);
          b.relation.keys.length && call(b.command + ":" + path + "=" + b.relation.keys.map((x2) => a[x2.name]), a, b);
        }
        function pong() {
          const x2 = Buffer.alloc(34);
          x2[0] = "r".charCodeAt(0);
          x2.fill(state2.lsn, 1);
          x2.writeBigInt64BE(BigInt(Date.now() - Date.UTC(2e3, 0, 1)) * BigInt(1e3), 25);
          stream2.write(x2);
        }
      }
      function call(x, a, b) {
        subscribers.has(x) && subscribers.get(x).forEach(({ fn }) => fn(a, b, x));
      }
    }
    function Time(x) {
      return new Date(Date.UTC(2e3, 0, 1) + Number(x / BigInt(1e3)));
    }
    function parse3(x, state, parsers, handle, transform) {
      const char = (acc, [k, v]) => (acc[k.charCodeAt(0)] = v, acc);
      Object.entries({
        R: (x2) => {
          let i = 1;
          const r = state[x2.readUInt32BE(i)] = {
            schema: x2.toString("utf8", i += 4, i = x2.indexOf(0, i)) || "pg_catalog",
            table: x2.toString("utf8", i + 1, i = x2.indexOf(0, i + 1)),
            columns: Array(x2.readUInt16BE(i += 2)),
            keys: []
          };
          i += 2;
          let columnIndex = 0, column;
          while (i < x2.length) {
            column = r.columns[columnIndex++] = {
              key: x2[i++],
              name: transform.column.from ? transform.column.from(x2.toString("utf8", i, i = x2.indexOf(0, i))) : x2.toString("utf8", i, i = x2.indexOf(0, i)),
              type: x2.readUInt32BE(i += 1),
              parser: parsers[x2.readUInt32BE(i)],
              atttypmod: x2.readUInt32BE(i += 4)
            };
            column.key && r.keys.push(column);
            i += 4;
          }
        },
        Y: () => {
        },
        // Type
        O: () => {
        },
        // Origin
        B: (x2) => {
          state.date = Time(x2.readBigInt64BE(9));
          state.lsn = x2.subarray(1, 9);
        },
        I: (x2) => {
          let i = 1;
          const relation = state[x2.readUInt32BE(i)];
          const { row } = tuples(x2, relation.columns, i += 7, transform);
          handle(row, {
            command: "insert",
            relation
          });
        },
        D: (x2) => {
          let i = 1;
          const relation = state[x2.readUInt32BE(i)];
          i += 4;
          const key = x2[i] === 75;
          handle(
            key || x2[i] === 79 ? tuples(x2, key ? relation.keys : relation.columns, i += 3, transform).row : null,
            {
              command: "delete",
              relation,
              key
            }
          );
        },
        U: (x2) => {
          let i = 1;
          const relation = state[x2.readUInt32BE(i)];
          i += 4;
          const key = x2[i] === 75;
          const xs = key || x2[i] === 79 ? tuples(x2, key ? relation.keys : relation.columns, i += 3, transform) : null;
          xs && (i = xs.i);
          const { row } = tuples(x2, relation.columns, i + 3, transform);
          handle(row, {
            command: "update",
            relation,
            key,
            old: xs && xs.row
          });
        },
        T: () => {
        },
        // Truncate,
        C: () => {
        }
        // Commit
      }).reduce(char, {})[x[0]](x);
    }
    function tuples(x, columns, xi, transform) {
      let type, column, value;
      const row = transform.raw ? new Array(columns.length) : {};
      for (let i = 0; i < columns.length; i++) {
        type = x[xi++];
        column = columns[i];
        value = type === 110 ? null : type === 117 ? void 0 : column.parser === void 0 ? x.toString("utf8", xi + 4, xi += 4 + x.readUInt32BE(xi)) : column.parser.array === true ? column.parser(x.toString("utf8", xi + 5, xi += 4 + x.readUInt32BE(xi))) : column.parser(x.toString("utf8", xi + 4, xi += 4 + x.readUInt32BE(xi)));
        transform.raw ? row[i] = transform.raw === true ? value : transform.value.from ? transform.value.from(value, column) : value : row[column.name] = transform.value.from ? transform.value.from(value, column) : value;
      }
      return { i: xi, row: transform.row.from ? transform.row.from(row) : row };
    }
    function parseEvent(x) {
      const xs = x.match(/^(\*|insert|update|delete)?:?([^.]+?\.?[^=]+)?=?(.+)?/i) || [];
      if (!xs)
        throw new Error("Malformed subscribe pattern: " + x);
      const [, command, path, key] = xs;
      return (command || "*") + (path ? ":" + (path.indexOf(".") === -1 ? "public." + path : path) : "") + (key ? "=" + key : "");
    }
  }
});

// node_modules/postgres/cjs/src/large.js
var require_large = __commonJS({
  "node_modules/postgres/cjs/src/large.js"(exports, module) {
    var Stream = __require("stream");
    module.exports = largeObject;
    function largeObject(sql, oid, mode = 131072 | 262144) {
      return new Promise(async (resolve, reject) => {
        await sql.begin(async (sql2) => {
          let finish;
          !oid && ([{ oid }] = await sql2`select lo_creat(-1) as oid`);
          const [{ fd }] = await sql2`select lo_open(${oid}, ${mode}) as fd`;
          const lo = {
            writable,
            readable,
            close: () => sql2`select lo_close(${fd})`.then(finish),
            tell: () => sql2`select lo_tell64(${fd})`,
            read: (x) => sql2`select loread(${fd}, ${x}) as data`,
            write: (x) => sql2`select lowrite(${fd}, ${x})`,
            truncate: (x) => sql2`select lo_truncate64(${fd}, ${x})`,
            seek: (x, whence = 0) => sql2`select lo_lseek64(${fd}, ${x}, ${whence})`,
            size: () => sql2`
          select
            lo_lseek64(${fd}, location, 0) as position,
            seek.size
          from (
            select
              lo_lseek64($1, 0, 2) as size,
              tell.location
            from (select lo_tell64($1) as location) tell
          ) seek
        `
          };
          resolve(lo);
          return new Promise(async (r) => finish = r);
          async function readable({
            highWaterMark = 2048 * 8,
            start = 0,
            end = Infinity
          } = {}) {
            let max = end - start;
            start && await lo.seek(start);
            return new Stream.Readable({
              highWaterMark,
              async read(size) {
                const l = size > max ? size - max : size;
                max -= size;
                const [{ data }] = await lo.read(l);
                this.push(data);
                if (data.length < size)
                  this.push(null);
              }
            });
          }
          async function writable({
            highWaterMark = 2048 * 8,
            start = 0
          } = {}) {
            start && await lo.seek(start);
            return new Stream.Writable({
              highWaterMark,
              write(chunk, encoding, callback) {
                lo.write(chunk).then(() => callback(), callback);
              }
            });
          }
        }).catch(reject);
      });
    }
  }
});

// node_modules/postgres/cjs/src/index.js
var require_src = __commonJS({
  "node_modules/postgres/cjs/src/index.js"(exports, module) {
    var os = __require("os");
    var fs = __require("fs");
    var {
      mergeUserTypes,
      inferType,
      Parameter,
      Identifier,
      Builder,
      toPascal,
      pascal,
      toCamel,
      camel,
      toKebab,
      kebab,
      fromPascal,
      fromCamel,
      fromKebab
    } = require_types();
    var Connection = require_connection();
    var { Query, CLOSE } = require_query();
    var Queue = require_queue();
    var { Errors, PostgresError } = require_errors();
    var Subscribe = require_subscribe();
    var largeObject = require_large();
    Object.assign(Postgres, {
      PostgresError,
      toPascal,
      pascal,
      toCamel,
      camel,
      toKebab,
      kebab,
      fromPascal,
      fromCamel,
      fromKebab,
      BigInt: {
        to: 20,
        from: [20],
        parse: (x) => BigInt(x),
        // eslint-disable-line
        serialize: (x) => x.toString()
      }
    });
    module.exports = Postgres;
    function Postgres(a, b) {
      const options2 = parseOptions(a, b), subscribe = options2.no_subscribe || Subscribe(Postgres, { ...options2 });
      let ending = false;
      const queries = Queue(), connecting = Queue(), reserved = Queue(), closed = Queue(), ended = Queue(), open = Queue(), busy = Queue(), full = Queue(), queues = { connecting, reserved, closed, ended, open, busy, full };
      const connections = [...Array(options2.max)].map(() => Connection(options2, queues, { onopen, onend, onclose }));
      const sql = Sql(handler);
      Object.assign(sql, {
        get parameters() {
          return options2.parameters;
        },
        largeObject: largeObject.bind(null, sql),
        subscribe,
        CLOSE,
        END: CLOSE,
        PostgresError,
        options: options2,
        listen,
        notify,
        begin,
        close,
        end
      });
      return sql;
      function Sql(handler2, instant) {
        handler2.debug = options2.debug;
        Object.entries(options2.types).reduce((acc, [name, type]) => {
          acc[name] = (x) => new Parameter(x, type.to);
          return acc;
        }, typed);
        Object.assign(sql2, {
          types: typed,
          typed,
          unsafe,
          array,
          json,
          file
        });
        return sql2;
        function typed(value, type) {
          return new Parameter(value, type);
        }
        function sql2(strings, ...args) {
          const query = strings && Array.isArray(strings.raw) ? new Query(strings, args, handler2, cancel) : typeof strings === "string" && !args.length ? new Identifier(options2.transform.column.to ? options2.transform.column.to(strings) : strings) : new Builder(strings, args);
          instant && query instanceof Query && query.execute();
          return query;
        }
        function unsafe(string, args = [], options3 = {}) {
          arguments.length === 2 && !Array.isArray(args) && (options3 = args, args = []);
          const query = new Query([string], args, handler2, cancel, {
            prepare: false,
            ...options3,
            simple: "simple" in options3 ? options3.simple : args.length === 0
          });
          instant && query.execute();
          return query;
        }
        function file(path, args = [], options3 = {}) {
          arguments.length === 2 && !Array.isArray(args) && (options3 = args, args = []);
          const query = new Query([], args, (query2) => {
            fs.readFile(path, "utf8", (err, string) => {
              if (err)
                return query2.reject(err);
              query2.strings = [string];
              handler2(query2);
            });
          }, cancel, {
            ...options3,
            simple: "simple" in options3 ? options3.simple : args.length === 0
          });
          instant && query.execute();
          return query;
        }
      }
      async function listen(name, fn, onlisten) {
        const listener = { fn, onlisten };
        const sql2 = listen.sql || (listen.sql = Postgres({
          ...options2,
          max: 1,
          idle_timeout: null,
          max_lifetime: null,
          fetch_types: false,
          onclose() {
            Object.entries(listen.channels).forEach(([name2, { listeners }]) => {
              delete listen.channels[name2];
              Promise.all(listeners.map((l) => listen(name2, l.fn, l.onlisten).catch(() => {
              })));
            });
          },
          onnotify(c, x) {
            c in listen.channels && listen.channels[c].listeners.forEach((l) => l.fn(x));
          }
        }));
        const channels = listen.channels || (listen.channels = {}), exists = name in channels;
        if (exists) {
          channels[name].listeners.push(listener);
          const result2 = await channels[name].result;
          listener.onlisten && listener.onlisten();
          return { state: result2.state, unlisten };
        }
        channels[name] = { result: sql2`listen ${sql2.unsafe('"' + name.replace(/"/g, '""') + '"')}`, listeners: [listener] };
        const result = await channels[name].result;
        listener.onlisten && listener.onlisten();
        return { state: result.state, unlisten };
        async function unlisten() {
          if (name in channels === false)
            return;
          channels[name].listeners = channels[name].listeners.filter((x) => x !== listener);
          if (channels[name].listeners.length)
            return;
          delete channels[name];
          return sql2`unlisten ${sql2.unsafe('"' + name.replace(/"/g, '""') + '"')}`;
        }
      }
      async function notify(channel, payload) {
        return await sql`select pg_notify(${channel}, ${"" + payload})`;
      }
      async function begin(options3, fn) {
        !fn && (fn = options3, options3 = "");
        const queries2 = Queue();
        let savepoints = 0, connection;
        try {
          await sql.unsafe("begin " + options3.replace(/[^a-z ]/ig, ""), [], { onexecute }).execute();
          return await scope(connection, fn);
        } catch (error) {
          throw error;
        }
        async function scope(c, fn2, name) {
          const sql2 = Sql(handler2);
          sql2.savepoint = savepoint;
          let uncaughtError, result;
          name && await sql2`savepoint ${sql2(name)}`;
          try {
            result = await new Promise((resolve, reject) => {
              const x = fn2(sql2);
              Promise.resolve(Array.isArray(x) ? Promise.all(x) : x).then(resolve, reject);
            });
            if (uncaughtError)
              throw uncaughtError;
          } catch (e) {
            await (name ? sql2`rollback to ${sql2(name)}` : sql2`rollback`);
            throw e instanceof PostgresError && e.code === "25P02" && uncaughtError || e;
          }
          !name && await sql2`commit`;
          return result;
          function savepoint(name2, fn3) {
            if (name2 && Array.isArray(name2.raw))
              return savepoint((sql3) => sql3.apply(sql3, arguments));
            arguments.length === 1 && (fn3 = name2, name2 = null);
            return scope(c, fn3, "s" + savepoints++ + (name2 ? "_" + name2 : ""));
          }
          function handler2(q) {
            q.catch((e) => uncaughtError || (uncaughtError = e));
            c.queue === full ? queries2.push(q) : c.execute(q) || move(c, full);
          }
        }
        function onexecute(c) {
          connection = c;
          move(c, reserved);
          c.reserved = () => queries2.length ? c.execute(queries2.shift()) : move(c, reserved);
        }
      }
      function move(c, queue) {
        c.queue.remove(c);
        queue.push(c);
        c.queue = queue;
        queue === open ? c.idleTimer.start() : c.idleTimer.cancel();
      }
      function json(x) {
        return new Parameter(x, 3802);
      }
      function array(x, type) {
        if (!Array.isArray(x))
          return array(Array.from(arguments));
        return new Parameter(x, type || (x.length ? inferType(x) || 25 : 0), options2.shared.typeArrayMap);
      }
      function handler(query) {
        if (ending)
          return query.reject(Errors.connection("CONNECTION_ENDED", options2, options2));
        if (open.length)
          return go(open.shift(), query);
        if (closed.length)
          return connect(closed.shift(), query);
        busy.length ? go(busy.shift(), query) : queries.push(query);
      }
      function go(c, query) {
        return c.execute(query) ? move(c, busy) : move(c, full);
      }
      function cancel(query) {
        return new Promise((resolve, reject) => {
          query.state ? query.active ? Connection(options2).cancel(query.state, resolve, reject) : query.cancelled = { resolve, reject } : (queries.remove(query), query.cancelled = true, query.reject(Errors.generic("57014", "canceling statement due to user request")), resolve());
        });
      }
      async function end({ timeout = null } = {}) {
        if (ending)
          return ending;
        await 1;
        let timer;
        return ending = Promise.race([
          new Promise((r) => timeout !== null && (timer = setTimeout(destroy, timeout * 1e3, r))),
          Promise.all(connections.map((c) => c.end()).concat(
            listen.sql ? listen.sql.end({ timeout: 0 }) : [],
            subscribe.sql ? subscribe.sql.end({ timeout: 0 }) : []
          ))
        ]).then(() => clearTimeout(timer));
      }
      async function close() {
        await Promise.all(connections.map((c) => c.end()));
      }
      async function destroy(resolve) {
        await Promise.all(connections.map((c) => c.terminate()));
        while (queries.length)
          queries.shift().reject(Errors.connection("CONNECTION_DESTROYED", options2));
        resolve();
      }
      function connect(c, query) {
        move(c, connecting);
        c.connect(query);
      }
      function onend(c) {
        move(c, ended);
      }
      function onopen(c) {
        if (queries.length === 0)
          return move(c, open);
        let max = Math.ceil(queries.length / (connecting.length + 1)), ready = true;
        while (ready && queries.length && max-- > 0)
          ready = c.execute(queries.shift());
        ready ? move(c, busy) : move(c, full);
      }
      function onclose(c) {
        move(c, closed);
        c.reserved = null;
        options2.onclose && options2.onclose(c.id);
        queries.length && connect(c, queries.shift());
      }
    }
    function parseOptions(a, b) {
      if (a && a.shared)
        return a;
      const env = process.env, o = (typeof a === "string" ? b : a) || {}, { url, multihost } = parseUrl2(a), query = [...url.searchParams].reduce((a2, [b2, c]) => (a2[b2] = c, a2), {}), host = o.hostname || o.host || multihost || url.hostname || env.PGHOST || "localhost", port = o.port || url.port || env.PGPORT || 5432, user = o.user || o.username || url.username || env.PGUSERNAME || env.PGUSER || osUsername();
      o.no_prepare && (o.prepare = false);
      query.sslmode && (query.ssl = query.sslmode, delete query.sslmode);
      "timeout" in o && (console.log("The timeout option is deprecated, use idle_timeout instead"), o.idle_timeout = o.timeout);
      const defaults = {
        max: 10,
        ssl: false,
        idle_timeout: null,
        connect_timeout: 30,
        max_lifetime,
        max_pipeline: 100,
        backoff,
        keep_alive: 60,
        prepare: true,
        debug: false,
        fetch_types: true,
        publications: "alltables",
        target_session_attrs: null
      };
      return {
        host: Array.isArray(host) ? host : host.split(",").map((x) => x.split(":")[0]),
        port: Array.isArray(port) ? port : host.split(",").map((x) => parseInt(x.split(":")[1] || port)),
        path: o.path || host.indexOf("/") > -1 && host + "/.s.PGSQL." + port,
        database: o.database || o.db || (url.pathname || "").slice(1) || env.PGDATABASE || user,
        user,
        pass: o.pass || o.password || url.password || env.PGPASSWORD || "",
        ...Object.entries(defaults).reduce(
          (acc, [k, d]) => (acc[k] = k in o ? o[k] : k in query ? query[k] === "disable" || query[k] === "false" ? false : query[k] : env["PG" + k.toUpperCase()] || d, acc),
          {}
        ),
        connection: {
          application_name: "postgres.js",
          ...o.connection,
          ...Object.entries(query).reduce((acc, [k, v]) => (k in defaults || (acc[k] = v), acc), {})
        },
        types: o.types || {},
        target_session_attrs: tsa(o, url, env),
        onnotice: o.onnotice,
        onnotify: o.onnotify,
        onclose: o.onclose,
        onparameter: o.onparameter,
        socket: o.socket,
        transform: parseTransform(o.transform || { undefined: void 0 }),
        parameters: {},
        shared: { retries: 0, typeArrayMap: {} },
        ...mergeUserTypes(o.types)
      };
    }
    function tsa(o, url, env) {
      const x = o.target_session_attrs || url.searchParams.get("target_session_attrs") || env.PGTARGETSESSIONATTRS;
      if (!x || ["read-write", "read-only", "primary", "standby", "prefer-standby"].includes(x))
        return x;
      throw new Error("target_session_attrs " + x + " is not supported");
    }
    function backoff(retries) {
      return (0.5 + Math.random() / 2) * Math.min(3 ** retries / 100, 20);
    }
    function max_lifetime() {
      return 60 * (30 + Math.random() * 30);
    }
    function parseTransform(x) {
      return {
        undefined: x.undefined,
        column: {
          from: typeof x.column === "function" ? x.column : x.column && x.column.from,
          to: x.column && x.column.to
        },
        value: {
          from: typeof x.value === "function" ? x.value : x.value && x.value.from,
          to: x.value && x.value.to
        },
        row: {
          from: typeof x.row === "function" ? x.row : x.row && x.row.from,
          to: x.row && x.row.to
        }
      };
    }
    function parseUrl2(url) {
      if (typeof url !== "string")
        return { url: { searchParams: /* @__PURE__ */ new Map() } };
      let host = url;
      host = host.slice(host.indexOf("://") + 3).split(/[?/]/)[0];
      host = decodeURIComponent(host.slice(host.indexOf("@") + 1));
      const urlObj = new URL(url.replace(host, host.split(",")[0]));
      return {
        url: {
          username: decodeURIComponent(urlObj.username),
          password: decodeURIComponent(urlObj.password),
          host: urlObj.host,
          hostname: urlObj.hostname,
          port: urlObj.port,
          pathname: urlObj.pathname,
          searchParams: urlObj.searchParams
        },
        multihost: host.indexOf(",") > -1 && host
      };
    }
    function osUsername() {
      try {
        return os.userInfo().username;
      } catch (_) {
        return process.env.USERNAME || process.env.USER || process.env.LOGNAME;
      }
    }
  }
});

// parse-database-url.ts
var mUri = __toESM(require_mongodb_uri());

// node_modules/query-string/base.js
var base_exports = {};
__export(base_exports, {
  exclude: () => exclude,
  extract: () => extract,
  parse: () => parse,
  parseUrl: () => parseUrl,
  pick: () => pick,
  stringify: () => stringify,
  stringifyUrl: () => stringifyUrl
});

// node_modules/decode-uri-component/index.js
var token = "%[a-f0-9]{2}";
var singleMatcher = new RegExp("(" + token + ")|([^%]+?)", "gi");
var multiMatcher = new RegExp("(" + token + ")+", "gi");
function decodeComponents(components, split) {
  try {
    return [decodeURIComponent(components.join(""))];
  } catch {
  }
  if (components.length === 1) {
    return components;
  }
  split = split || 1;
  const left = components.slice(0, split);
  const right = components.slice(split);
  return Array.prototype.concat.call([], decodeComponents(left), decodeComponents(right));
}
function decode(input) {
  try {
    return decodeURIComponent(input);
  } catch {
    let tokens = input.match(singleMatcher) || [];
    for (let i = 1; i < tokens.length; i++) {
      input = decodeComponents(tokens, i).join("");
      tokens = input.match(singleMatcher) || [];
    }
    return input;
  }
}
function customDecodeURIComponent(input) {
  const replaceMap = {
    "%FE%FF": "\uFFFD\uFFFD",
    "%FF%FE": "\uFFFD\uFFFD"
  };
  let match = multiMatcher.exec(input);
  while (match) {
    try {
      replaceMap[match[0]] = decodeURIComponent(match[0]);
    } catch {
      const result = decode(match[0]);
      if (result !== match[0]) {
        replaceMap[match[0]] = result;
      }
    }
    match = multiMatcher.exec(input);
  }
  replaceMap["%C2"] = "\uFFFD";
  const entries = Object.keys(replaceMap);
  for (const key of entries) {
    input = input.replace(new RegExp(key, "g"), replaceMap[key]);
  }
  return input;
}
function decodeUriComponent(encodedURI) {
  if (typeof encodedURI !== "string") {
    throw new TypeError("Expected `encodedURI` to be of type `string`, got `" + typeof encodedURI + "`");
  }
  try {
    return decodeURIComponent(encodedURI);
  } catch {
    return customDecodeURIComponent(encodedURI);
  }
}

// node_modules/split-on-first/index.js
function splitOnFirst(string, separator) {
  if (!(typeof string === "string" && typeof separator === "string")) {
    throw new TypeError("Expected the arguments to be of type `string`");
  }
  if (string === "" || separator === "") {
    return [];
  }
  const separatorIndex = string.indexOf(separator);
  if (separatorIndex === -1) {
    return [];
  }
  return [
    string.slice(0, separatorIndex),
    string.slice(separatorIndex + separator.length)
  ];
}

// node_modules/filter-obj/index.js
function includeKeys(object, predicate) {
  const result = {};
  if (Array.isArray(predicate)) {
    for (const key of predicate) {
      const descriptor = Object.getOwnPropertyDescriptor(object, key);
      if (descriptor?.enumerable) {
        Object.defineProperty(result, key, descriptor);
      }
    }
  } else {
    for (const key of Reflect.ownKeys(object)) {
      const descriptor = Object.getOwnPropertyDescriptor(object, key);
      if (descriptor.enumerable) {
        const value = object[key];
        if (predicate(key, value, object)) {
          Object.defineProperty(result, key, descriptor);
        }
      }
    }
  }
  return result;
}

// node_modules/query-string/base.js
var isNullOrUndefined = (value) => value === null || value === void 0;
var strictUriEncode = (string) => encodeURIComponent(string).replace(/[!'()*]/g, (x) => `%${x.charCodeAt(0).toString(16).toUpperCase()}`);
var encodeFragmentIdentifier = Symbol("encodeFragmentIdentifier");
function encoderForArrayFormat(options2) {
  switch (options2.arrayFormat) {
    case "index": {
      return (key) => (result, value) => {
        const index = result.length;
        if (value === void 0 || options2.skipNull && value === null || options2.skipEmptyString && value === "") {
          return result;
        }
        if (value === null) {
          return [
            ...result,
            [encode(key, options2), "[", index, "]"].join("")
          ];
        }
        return [
          ...result,
          [encode(key, options2), "[", encode(index, options2), "]=", encode(value, options2)].join("")
        ];
      };
    }
    case "bracket": {
      return (key) => (result, value) => {
        if (value === void 0 || options2.skipNull && value === null || options2.skipEmptyString && value === "") {
          return result;
        }
        if (value === null) {
          return [
            ...result,
            [encode(key, options2), "[]"].join("")
          ];
        }
        return [
          ...result,
          [encode(key, options2), "[]=", encode(value, options2)].join("")
        ];
      };
    }
    case "colon-list-separator": {
      return (key) => (result, value) => {
        if (value === void 0 || options2.skipNull && value === null || options2.skipEmptyString && value === "") {
          return result;
        }
        if (value === null) {
          return [
            ...result,
            [encode(key, options2), ":list="].join("")
          ];
        }
        return [
          ...result,
          [encode(key, options2), ":list=", encode(value, options2)].join("")
        ];
      };
    }
    case "comma":
    case "separator":
    case "bracket-separator": {
      const keyValueSep = options2.arrayFormat === "bracket-separator" ? "[]=" : "=";
      return (key) => (result, value) => {
        if (value === void 0 || options2.skipNull && value === null || options2.skipEmptyString && value === "") {
          return result;
        }
        value = value === null ? "" : value;
        if (result.length === 0) {
          return [[encode(key, options2), keyValueSep, encode(value, options2)].join("")];
        }
        return [[result, encode(value, options2)].join(options2.arrayFormatSeparator)];
      };
    }
    default: {
      return (key) => (result, value) => {
        if (value === void 0 || options2.skipNull && value === null || options2.skipEmptyString && value === "") {
          return result;
        }
        if (value === null) {
          return [
            ...result,
            encode(key, options2)
          ];
        }
        return [
          ...result,
          [encode(key, options2), "=", encode(value, options2)].join("")
        ];
      };
    }
  }
}
function parserForArrayFormat(options2) {
  let result;
  switch (options2.arrayFormat) {
    case "index": {
      return (key, value, accumulator) => {
        result = /\[(\d*)]$/.exec(key);
        key = key.replace(/\[\d*]$/, "");
        if (!result) {
          accumulator[key] = value;
          return;
        }
        if (accumulator[key] === void 0) {
          accumulator[key] = {};
        }
        accumulator[key][result[1]] = value;
      };
    }
    case "bracket": {
      return (key, value, accumulator) => {
        result = /(\[])$/.exec(key);
        key = key.replace(/\[]$/, "");
        if (!result) {
          accumulator[key] = value;
          return;
        }
        if (accumulator[key] === void 0) {
          accumulator[key] = [value];
          return;
        }
        accumulator[key] = [...accumulator[key], value];
      };
    }
    case "colon-list-separator": {
      return (key, value, accumulator) => {
        result = /(:list)$/.exec(key);
        key = key.replace(/:list$/, "");
        if (!result) {
          accumulator[key] = value;
          return;
        }
        if (accumulator[key] === void 0) {
          accumulator[key] = [value];
          return;
        }
        accumulator[key] = [...accumulator[key], value];
      };
    }
    case "comma":
    case "separator": {
      return (key, value, accumulator) => {
        const isArray = typeof value === "string" && value.includes(options2.arrayFormatSeparator);
        const isEncodedArray = typeof value === "string" && !isArray && decode2(value, options2).includes(options2.arrayFormatSeparator);
        value = isEncodedArray ? decode2(value, options2) : value;
        const newValue = isArray || isEncodedArray ? value.split(options2.arrayFormatSeparator).map((item) => decode2(item, options2)) : value === null ? value : decode2(value, options2);
        accumulator[key] = newValue;
      };
    }
    case "bracket-separator": {
      return (key, value, accumulator) => {
        const isArray = /(\[])$/.test(key);
        key = key.replace(/\[]$/, "");
        if (!isArray) {
          accumulator[key] = value ? decode2(value, options2) : value;
          return;
        }
        const arrayValue = value === null ? [] : value.split(options2.arrayFormatSeparator).map((item) => decode2(item, options2));
        if (accumulator[key] === void 0) {
          accumulator[key] = arrayValue;
          return;
        }
        accumulator[key] = [...accumulator[key], ...arrayValue];
      };
    }
    default: {
      return (key, value, accumulator) => {
        if (accumulator[key] === void 0) {
          accumulator[key] = value;
          return;
        }
        accumulator[key] = [...[accumulator[key]].flat(), value];
      };
    }
  }
}
function validateArrayFormatSeparator(value) {
  if (typeof value !== "string" || value.length !== 1) {
    throw new TypeError("arrayFormatSeparator must be single character string");
  }
}
function encode(value, options2) {
  if (options2.encode) {
    return options2.strict ? strictUriEncode(value) : encodeURIComponent(value);
  }
  return value;
}
function decode2(value, options2) {
  if (options2.decode) {
    return decodeUriComponent(value);
  }
  return value;
}
function keysSorter(input) {
  if (Array.isArray(input)) {
    return input.sort();
  }
  if (typeof input === "object") {
    return keysSorter(Object.keys(input)).sort((a, b) => Number(a) - Number(b)).map((key) => input[key]);
  }
  return input;
}
function removeHash(input) {
  const hashStart = input.indexOf("#");
  if (hashStart !== -1) {
    input = input.slice(0, hashStart);
  }
  return input;
}
function getHash(url) {
  let hash = "";
  const hashStart = url.indexOf("#");
  if (hashStart !== -1) {
    hash = url.slice(hashStart);
  }
  return hash;
}
function parseValue(value, options2) {
  if (options2.parseNumbers && !Number.isNaN(Number(value)) && (typeof value === "string" && value.trim() !== "")) {
    value = Number(value);
  } else if (options2.parseBooleans && value !== null && (value.toLowerCase() === "true" || value.toLowerCase() === "false")) {
    value = value.toLowerCase() === "true";
  }
  return value;
}
function extract(input) {
  input = removeHash(input);
  const queryStart = input.indexOf("?");
  if (queryStart === -1) {
    return "";
  }
  return input.slice(queryStart + 1);
}
function parse(query, options2) {
  options2 = {
    decode: true,
    sort: true,
    arrayFormat: "none",
    arrayFormatSeparator: ",",
    parseNumbers: false,
    parseBooleans: false,
    ...options2
  };
  validateArrayFormatSeparator(options2.arrayFormatSeparator);
  const formatter = parserForArrayFormat(options2);
  const returnValue = /* @__PURE__ */ Object.create(null);
  if (typeof query !== "string") {
    return returnValue;
  }
  query = query.trim().replace(/^[?#&]/, "");
  if (!query) {
    return returnValue;
  }
  for (const parameter of query.split("&")) {
    if (parameter === "") {
      continue;
    }
    const parameter_ = options2.decode ? parameter.replace(/\+/g, " ") : parameter;
    let [key, value] = splitOnFirst(parameter_, "=");
    if (key === void 0) {
      key = parameter_;
    }
    value = value === void 0 ? null : ["comma", "separator", "bracket-separator"].includes(options2.arrayFormat) ? value : decode2(value, options2);
    formatter(decode2(key, options2), value, returnValue);
  }
  for (const [key, value] of Object.entries(returnValue)) {
    if (typeof value === "object" && value !== null) {
      for (const [key2, value2] of Object.entries(value)) {
        value[key2] = parseValue(value2, options2);
      }
    } else {
      returnValue[key] = parseValue(value, options2);
    }
  }
  if (options2.sort === false) {
    return returnValue;
  }
  return (options2.sort === true ? Object.keys(returnValue).sort() : Object.keys(returnValue).sort(options2.sort)).reduce((result, key) => {
    const value = returnValue[key];
    if (Boolean(value) && typeof value === "object" && !Array.isArray(value)) {
      result[key] = keysSorter(value);
    } else {
      result[key] = value;
    }
    return result;
  }, /* @__PURE__ */ Object.create(null));
}
function stringify(object, options2) {
  if (!object) {
    return "";
  }
  options2 = {
    encode: true,
    strict: true,
    arrayFormat: "none",
    arrayFormatSeparator: ",",
    ...options2
  };
  validateArrayFormatSeparator(options2.arrayFormatSeparator);
  const shouldFilter = (key) => options2.skipNull && isNullOrUndefined(object[key]) || options2.skipEmptyString && object[key] === "";
  const formatter = encoderForArrayFormat(options2);
  const objectCopy = {};
  for (const [key, value] of Object.entries(object)) {
    if (!shouldFilter(key)) {
      objectCopy[key] = value;
    }
  }
  const keys = Object.keys(objectCopy);
  if (options2.sort !== false) {
    keys.sort(options2.sort);
  }
  return keys.map((key) => {
    const value = object[key];
    if (value === void 0) {
      return "";
    }
    if (value === null) {
      return encode(key, options2);
    }
    if (Array.isArray(value)) {
      if (value.length === 0 && options2.arrayFormat === "bracket-separator") {
        return encode(key, options2) + "[]";
      }
      return value.reduce(formatter(key), []).join("&");
    }
    return encode(key, options2) + "=" + encode(value, options2);
  }).filter((x) => x.length > 0).join("&");
}
function parseUrl(url, options2) {
  options2 = {
    decode: true,
    ...options2
  };
  let [url_, hash] = splitOnFirst(url, "#");
  if (url_ === void 0) {
    url_ = url;
  }
  return {
    url: url_?.split("?")?.[0] ?? "",
    query: parse(extract(url), options2),
    ...options2 && options2.parseFragmentIdentifier && hash ? { fragmentIdentifier: decode2(hash, options2) } : {}
  };
}
function stringifyUrl(object, options2) {
  options2 = {
    encode: true,
    strict: true,
    [encodeFragmentIdentifier]: true,
    ...options2
  };
  const url = removeHash(object.url).split("?")[0] || "";
  const queryFromUrl = extract(object.url);
  const query = {
    ...parse(queryFromUrl, { sort: false }),
    ...object.query
  };
  let queryString = stringify(query, options2);
  if (queryString) {
    queryString = `?${queryString}`;
  }
  let hash = getHash(object.url);
  if (object.fragmentIdentifier) {
    const urlObjectForFragmentEncode = new URL(url);
    urlObjectForFragmentEncode.hash = object.fragmentIdentifier;
    hash = options2[encodeFragmentIdentifier] ? urlObjectForFragmentEncode.hash : `#${object.fragmentIdentifier}`;
  }
  return `${url}${queryString}${hash}`;
}
function pick(input, filter, options2) {
  options2 = {
    parseFragmentIdentifier: true,
    [encodeFragmentIdentifier]: false,
    ...options2
  };
  const { url, query, fragmentIdentifier } = parseUrl(input, options2);
  return stringifyUrl({
    url,
    query: includeKeys(query, filter),
    fragmentIdentifier
  }, options2);
}
function exclude(input, filter, options2) {
  const exclusionFilter = Array.isArray(filter) ? (key) => !filter.includes(key) : (key, value) => !filter(key, value);
  return pick(input, exclusionFilter, options2);
}

// node_modules/query-string/index.js
var query_string_default = base_exports;

// parse-database-url.ts
function parse_database_url_default(databaseUrl) {
  let parsedUrl = new URL(databaseUrl);
  const protocol = parsedUrl.protocol;
  console.log(protocol);
  const ftpStyleUrl = databaseUrl.replace(protocol, "ftp:");
  console.log(ftpStyleUrl);
  parsedUrl = new URL(ftpStyleUrl);
  console.log(parsedUrl);
  let config = query_string_default.parse(parsedUrl.search);
  config.driver = (protocol || "sqlite3:").replace(/\:$/, "");
  if (config.driver == "mysql2")
    config.driver = "mysql";
  if (parsedUrl.username) {
    config.user = parsedUrl.username;
  }
  if (parsedUrl.password) {
    config.password = parsedUrl.password;
  }
  if (config.driver === "sqlite3") {
    if (parsedUrl.hostname) {
      if (parsedUrl.pathname) {
        config.filename = parsedUrl.hostname + parsedUrl.pathname;
      } else {
        config.filename = parsedUrl.hostname;
      }
    } else {
      config.filename = parsedUrl.pathname;
    }
  } else {
    if (config.driver === "mongodb") {
      var mongoParsedUrl = mUri.parse(databaseUrl);
      let mongoUrl = {};
      if (mongoParsedUrl.hosts) {
        mongoUrl.hosts = mongoParsedUrl.hosts;
        for (var i = 0; i < mongoUrl.hosts.length; i += 1) {
          if (mongoUrl.hosts[i].port)
            mongoUrl.hosts[i].port = mongoUrl.hosts[i].port.toString();
        }
        if (mongoUrl.hosts.length === 1) {
          if (mongoUrl.hosts[0].host)
            mongoUrl.host = mongoUrl.hosts[0].host;
          if (mongoUrl.hosts[0].port)
            mongoUrl.port = mongoUrl.hosts[0].port.toString();
        }
      }
      if (mongoParsedUrl.database)
        mongoUrl.database = mongoParsedUrl.database;
      config = { ...config, ...mongoUrl };
    } else {
      if (parsedUrl.pathname) {
        config.database = parsedUrl.pathname.replace(/^\//, "").replace(/\/$/, "");
      }
    }
    if (parsedUrl.hostname)
      config.host = parsedUrl.hostname;
    if (parsedUrl.port)
      config.port = parsedUrl.port;
  }
  return config;
}

// node_modules/langchain/dist/load/map_keys.js
var import_decamelize = __toESM(require_decamelize(), 1);
var import_camelcase = __toESM(require_camelcase(), 1);
function keyToJson(key, map) {
  return map?.[key] || (0, import_decamelize.default)(key);
}
function mapKeys(fields, mapper, map) {
  const mapped = {};
  for (const key in fields) {
    if (Object.hasOwn(fields, key)) {
      mapped[mapper(key, map)] = fields[key];
    }
  }
  return mapped;
}

// node_modules/langchain/dist/load/serializable.js
function shallowCopy(obj) {
  return Array.isArray(obj) ? [...obj] : { ...obj };
}
function replaceSecrets(root, secretsMap) {
  const result = shallowCopy(root);
  for (const [path, secretId] of Object.entries(secretsMap)) {
    const [last, ...partsReverse] = path.split(".").reverse();
    let current = result;
    for (const part of partsReverse.reverse()) {
      if (current[part] === void 0) {
        break;
      }
      current[part] = shallowCopy(current[part]);
      current = current[part];
    }
    if (current[last] !== void 0) {
      current[last] = {
        lc: 1,
        type: "secret",
        id: [secretId]
      };
    }
  }
  return result;
}
function get_lc_unique_name(serializableClass) {
  const parentClass = Object.getPrototypeOf(serializableClass);
  const lcNameIsSubclassed = typeof serializableClass.lc_name === "function" && (typeof parentClass.lc_name !== "function" || serializableClass.lc_name() !== parentClass.lc_name());
  if (lcNameIsSubclassed) {
    return serializableClass.lc_name();
  } else {
    return serializableClass.name;
  }
}
var Serializable = class _Serializable {
  /**
   * The name of the serializable. Override to provide an alias or
   * to preserve the serialized module name in minified environments.
   *
   * Implemented as a static method to support loading logic.
   */
  static lc_name() {
    return this.name;
  }
  /**
   * The final serialized identifier for the module.
   */
  get lc_id() {
    return [
      ...this.lc_namespace,
      get_lc_unique_name(this.constructor)
    ];
  }
  /**
   * A map of secrets, which will be omitted from serialization.
   * Keys are paths to the secret in constructor args, e.g. "foo.bar.baz".
   * Values are the secret ids, which will be used when deserializing.
   */
  get lc_secrets() {
    return void 0;
  }
  /**
   * A map of additional attributes to merge with constructor args.
   * Keys are the attribute names, e.g. "foo".
   * Values are the attribute values, which will be serialized.
   * These attributes need to be accepted by the constructor as arguments.
   */
  get lc_attributes() {
    return void 0;
  }
  /**
   * A map of aliases for constructor args.
   * Keys are the attribute names, e.g. "foo".
   * Values are the alias that will replace the key in serialization.
   * This is used to eg. make argument names match Python.
   */
  get lc_aliases() {
    return void 0;
  }
  constructor(kwargs, ..._args) {
    Object.defineProperty(this, "lc_serializable", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: false
    });
    Object.defineProperty(this, "lc_kwargs", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: void 0
    });
    this.lc_kwargs = kwargs || {};
  }
  toJSON() {
    if (!this.lc_serializable) {
      return this.toJSONNotImplemented();
    }
    if (
      // eslint-disable-next-line no-instanceof/no-instanceof
      this.lc_kwargs instanceof _Serializable || typeof this.lc_kwargs !== "object" || Array.isArray(this.lc_kwargs)
    ) {
      return this.toJSONNotImplemented();
    }
    const aliases = {};
    const secrets = {};
    const kwargs = Object.keys(this.lc_kwargs).reduce((acc, key) => {
      acc[key] = key in this ? this[key] : this.lc_kwargs[key];
      return acc;
    }, {});
    for (let current = Object.getPrototypeOf(this); current; current = Object.getPrototypeOf(current)) {
      Object.assign(aliases, Reflect.get(current, "lc_aliases", this));
      Object.assign(secrets, Reflect.get(current, "lc_secrets", this));
      Object.assign(kwargs, Reflect.get(current, "lc_attributes", this));
    }
    for (const key in secrets) {
      if (key in this && this[key] !== void 0) {
        kwargs[key] = this[key] || kwargs[key];
      }
    }
    return {
      lc: 1,
      type: "constructor",
      id: this.lc_id,
      kwargs: mapKeys(Object.keys(secrets).length ? replaceSecrets(kwargs, secrets) : kwargs, keyToJson, aliases)
    };
  }
  toJSONNotImplemented() {
    return {
      lc: 1,
      type: "not_implemented",
      id: this.lc_id
    };
  }
};

// node_modules/langchain/dist/schema/index.js
var BaseMessage = class extends Serializable {
  /**
   * @deprecated
   * Use {@link BaseMessage.content} instead.
   */
  get text() {
    return this.content;
  }
  constructor(fields, kwargs) {
    if (typeof fields === "string") {
      fields = { content: fields, additional_kwargs: kwargs };
    }
    if (!fields.additional_kwargs) {
      fields.additional_kwargs = {};
    }
    super(fields);
    Object.defineProperty(this, "lc_namespace", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: ["langchain", "schema"]
    });
    Object.defineProperty(this, "lc_serializable", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: true
    });
    Object.defineProperty(this, "content", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: void 0
    });
    Object.defineProperty(this, "name", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: void 0
    });
    Object.defineProperty(this, "additional_kwargs", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: void 0
    });
    this.name = fields.name;
    this.content = fields.content;
    this.additional_kwargs = fields.additional_kwargs;
  }
  toDict() {
    return {
      type: this._getType(),
      data: this.toJSON().kwargs
    };
  }
};
var HumanMessage = class extends BaseMessage {
  static lc_name() {
    return "HumanMessage";
  }
  _getType() {
    return "human";
  }
};

// node_modules/marked/lib/marked.esm.js
function _getDefaults() {
  return {
    async: false,
    breaks: false,
    extensions: null,
    gfm: true,
    hooks: null,
    pedantic: false,
    renderer: null,
    silent: false,
    tokenizer: null,
    walkTokens: null
  };
}
var _defaults = _getDefaults();
function changeDefaults(newDefaults) {
  _defaults = newDefaults;
}
var escapeTest = /[&<>"']/;
var escapeReplace = new RegExp(escapeTest.source, "g");
var escapeTestNoEncode = /[<>"']|&(?!(#\d{1,7}|#[Xx][a-fA-F0-9]{1,6}|\w+);)/;
var escapeReplaceNoEncode = new RegExp(escapeTestNoEncode.source, "g");
var escapeReplacements = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;"
};
var getEscapeReplacement = (ch) => escapeReplacements[ch];
function escape(html, encode2) {
  if (encode2) {
    if (escapeTest.test(html)) {
      return html.replace(escapeReplace, getEscapeReplacement);
    }
  } else {
    if (escapeTestNoEncode.test(html)) {
      return html.replace(escapeReplaceNoEncode, getEscapeReplacement);
    }
  }
  return html;
}
var unescapeTest = /&(#(?:\d+)|(?:#x[0-9A-Fa-f]+)|(?:\w+));?/ig;
function unescape(html) {
  return html.replace(unescapeTest, (_, n) => {
    n = n.toLowerCase();
    if (n === "colon")
      return ":";
    if (n.charAt(0) === "#") {
      return n.charAt(1) === "x" ? String.fromCharCode(parseInt(n.substring(2), 16)) : String.fromCharCode(+n.substring(1));
    }
    return "";
  });
}
var caret = /(^|[^\[])\^/g;
function edit(regex, opt) {
  regex = typeof regex === "string" ? regex : regex.source;
  opt = opt || "";
  const obj = {
    replace: (name, val) => {
      val = typeof val === "object" && "source" in val ? val.source : val;
      val = val.replace(caret, "$1");
      regex = regex.replace(name, val);
      return obj;
    },
    getRegex: () => {
      return new RegExp(regex, opt);
    }
  };
  return obj;
}
function cleanUrl(href) {
  try {
    href = encodeURI(href).replace(/%25/g, "%");
  } catch (e) {
    return null;
  }
  return href;
}
var noopTest = { exec: () => null };
function splitCells(tableRow, count) {
  const row = tableRow.replace(/\|/g, (match, offset, str) => {
    let escaped = false;
    let curr = offset;
    while (--curr >= 0 && str[curr] === "\\")
      escaped = !escaped;
    if (escaped) {
      return "|";
    } else {
      return " |";
    }
  }), cells = row.split(/ \|/);
  let i = 0;
  if (!cells[0].trim()) {
    cells.shift();
  }
  if (cells.length > 0 && !cells[cells.length - 1].trim()) {
    cells.pop();
  }
  if (count) {
    if (cells.length > count) {
      cells.splice(count);
    } else {
      while (cells.length < count)
        cells.push("");
    }
  }
  for (; i < cells.length; i++) {
    cells[i] = cells[i].trim().replace(/\\\|/g, "|");
  }
  return cells;
}
function rtrim(str, c, invert) {
  const l = str.length;
  if (l === 0) {
    return "";
  }
  let suffLen = 0;
  while (suffLen < l) {
    const currChar = str.charAt(l - suffLen - 1);
    if (currChar === c && !invert) {
      suffLen++;
    } else if (currChar !== c && invert) {
      suffLen++;
    } else {
      break;
    }
  }
  return str.slice(0, l - suffLen);
}
function findClosingBracket(str, b) {
  if (str.indexOf(b[1]) === -1) {
    return -1;
  }
  let level = 0;
  for (let i = 0; i < str.length; i++) {
    if (str[i] === "\\") {
      i++;
    } else if (str[i] === b[0]) {
      level++;
    } else if (str[i] === b[1]) {
      level--;
      if (level < 0) {
        return i;
      }
    }
  }
  return -1;
}
function outputLink(cap, link, raw, lexer2) {
  const href = link.href;
  const title = link.title ? escape(link.title) : null;
  const text = cap[1].replace(/\\([\[\]])/g, "$1");
  if (cap[0].charAt(0) !== "!") {
    lexer2.state.inLink = true;
    const token2 = {
      type: "link",
      raw,
      href,
      title,
      text,
      tokens: lexer2.inlineTokens(text)
    };
    lexer2.state.inLink = false;
    return token2;
  }
  return {
    type: "image",
    raw,
    href,
    title,
    text: escape(text)
  };
}
function indentCodeCompensation(raw, text) {
  const matchIndentToCode = raw.match(/^(\s+)(?:```)/);
  if (matchIndentToCode === null) {
    return text;
  }
  const indentToCode = matchIndentToCode[1];
  return text.split("\n").map((node) => {
    const matchIndentInNode = node.match(/^\s+/);
    if (matchIndentInNode === null) {
      return node;
    }
    const [indentInNode] = matchIndentInNode;
    if (indentInNode.length >= indentToCode.length) {
      return node.slice(indentToCode.length);
    }
    return node;
  }).join("\n");
}
var _Tokenizer = class {
  options;
  // TODO: Fix this rules type
  rules;
  lexer;
  constructor(options2) {
    this.options = options2 || _defaults;
  }
  space(src) {
    const cap = this.rules.block.newline.exec(src);
    if (cap && cap[0].length > 0) {
      return {
        type: "space",
        raw: cap[0]
      };
    }
  }
  code(src) {
    const cap = this.rules.block.code.exec(src);
    if (cap) {
      const text = cap[0].replace(/^ {1,4}/gm, "");
      return {
        type: "code",
        raw: cap[0],
        codeBlockStyle: "indented",
        text: !this.options.pedantic ? rtrim(text, "\n") : text
      };
    }
  }
  fences(src) {
    const cap = this.rules.block.fences.exec(src);
    if (cap) {
      const raw = cap[0];
      const text = indentCodeCompensation(raw, cap[3] || "");
      return {
        type: "code",
        raw,
        lang: cap[2] ? cap[2].trim().replace(this.rules.inline._escapes, "$1") : cap[2],
        text
      };
    }
  }
  heading(src) {
    const cap = this.rules.block.heading.exec(src);
    if (cap) {
      let text = cap[2].trim();
      if (/#$/.test(text)) {
        const trimmed = rtrim(text, "#");
        if (this.options.pedantic) {
          text = trimmed.trim();
        } else if (!trimmed || / $/.test(trimmed)) {
          text = trimmed.trim();
        }
      }
      return {
        type: "heading",
        raw: cap[0],
        depth: cap[1].length,
        text,
        tokens: this.lexer.inline(text)
      };
    }
  }
  hr(src) {
    const cap = this.rules.block.hr.exec(src);
    if (cap) {
      return {
        type: "hr",
        raw: cap[0]
      };
    }
  }
  blockquote(src) {
    const cap = this.rules.block.blockquote.exec(src);
    if (cap) {
      const text = cap[0].replace(/^ *>[ \t]?/gm, "");
      const top = this.lexer.state.top;
      this.lexer.state.top = true;
      const tokens = this.lexer.blockTokens(text);
      this.lexer.state.top = top;
      return {
        type: "blockquote",
        raw: cap[0],
        tokens,
        text
      };
    }
  }
  list(src) {
    let cap = this.rules.block.list.exec(src);
    if (cap) {
      let bull = cap[1].trim();
      const isordered = bull.length > 1;
      const list = {
        type: "list",
        raw: "",
        ordered: isordered,
        start: isordered ? +bull.slice(0, -1) : "",
        loose: false,
        items: []
      };
      bull = isordered ? `\\d{1,9}\\${bull.slice(-1)}` : `\\${bull}`;
      if (this.options.pedantic) {
        bull = isordered ? bull : "[*+-]";
      }
      const itemRegex = new RegExp(`^( {0,3}${bull})((?:[	 ][^\\n]*)?(?:\\n|$))`);
      let raw = "";
      let itemContents = "";
      let endsWithBlankLine = false;
      while (src) {
        let endEarly = false;
        if (!(cap = itemRegex.exec(src))) {
          break;
        }
        if (this.rules.block.hr.test(src)) {
          break;
        }
        raw = cap[0];
        src = src.substring(raw.length);
        let line = cap[2].split("\n", 1)[0].replace(/^\t+/, (t) => " ".repeat(3 * t.length));
        let nextLine = src.split("\n", 1)[0];
        let indent = 0;
        if (this.options.pedantic) {
          indent = 2;
          itemContents = line.trimStart();
        } else {
          indent = cap[2].search(/[^ ]/);
          indent = indent > 4 ? 1 : indent;
          itemContents = line.slice(indent);
          indent += cap[1].length;
        }
        let blankLine = false;
        if (!line && /^ *$/.test(nextLine)) {
          raw += nextLine + "\n";
          src = src.substring(nextLine.length + 1);
          endEarly = true;
        }
        if (!endEarly) {
          const nextBulletRegex = new RegExp(`^ {0,${Math.min(3, indent - 1)}}(?:[*+-]|\\d{1,9}[.)])((?:[ 	][^\\n]*)?(?:\\n|$))`);
          const hrRegex = new RegExp(`^ {0,${Math.min(3, indent - 1)}}((?:- *){3,}|(?:_ *){3,}|(?:\\* *){3,})(?:\\n+|$)`);
          const fencesBeginRegex = new RegExp(`^ {0,${Math.min(3, indent - 1)}}(?:\`\`\`|~~~)`);
          const headingBeginRegex = new RegExp(`^ {0,${Math.min(3, indent - 1)}}#`);
          while (src) {
            const rawLine = src.split("\n", 1)[0];
            nextLine = rawLine;
            if (this.options.pedantic) {
              nextLine = nextLine.replace(/^ {1,4}(?=( {4})*[^ ])/g, "  ");
            }
            if (fencesBeginRegex.test(nextLine)) {
              break;
            }
            if (headingBeginRegex.test(nextLine)) {
              break;
            }
            if (nextBulletRegex.test(nextLine)) {
              break;
            }
            if (hrRegex.test(src)) {
              break;
            }
            if (nextLine.search(/[^ ]/) >= indent || !nextLine.trim()) {
              itemContents += "\n" + nextLine.slice(indent);
            } else {
              if (blankLine) {
                break;
              }
              if (line.search(/[^ ]/) >= 4) {
                break;
              }
              if (fencesBeginRegex.test(line)) {
                break;
              }
              if (headingBeginRegex.test(line)) {
                break;
              }
              if (hrRegex.test(line)) {
                break;
              }
              itemContents += "\n" + nextLine;
            }
            if (!blankLine && !nextLine.trim()) {
              blankLine = true;
            }
            raw += rawLine + "\n";
            src = src.substring(rawLine.length + 1);
            line = nextLine.slice(indent);
          }
        }
        if (!list.loose) {
          if (endsWithBlankLine) {
            list.loose = true;
          } else if (/\n *\n *$/.test(raw)) {
            endsWithBlankLine = true;
          }
        }
        let istask = null;
        let ischecked;
        if (this.options.gfm) {
          istask = /^\[[ xX]\] /.exec(itemContents);
          if (istask) {
            ischecked = istask[0] !== "[ ] ";
            itemContents = itemContents.replace(/^\[[ xX]\] +/, "");
          }
        }
        list.items.push({
          type: "list_item",
          raw,
          task: !!istask,
          checked: ischecked,
          loose: false,
          text: itemContents,
          tokens: []
        });
        list.raw += raw;
      }
      list.items[list.items.length - 1].raw = raw.trimEnd();
      list.items[list.items.length - 1].text = itemContents.trimEnd();
      list.raw = list.raw.trimEnd();
      for (let i = 0; i < list.items.length; i++) {
        this.lexer.state.top = false;
        list.items[i].tokens = this.lexer.blockTokens(list.items[i].text, []);
        if (!list.loose) {
          const spacers = list.items[i].tokens.filter((t) => t.type === "space");
          const hasMultipleLineBreaks = spacers.length > 0 && spacers.some((t) => /\n.*\n/.test(t.raw));
          list.loose = hasMultipleLineBreaks;
        }
      }
      if (list.loose) {
        for (let i = 0; i < list.items.length; i++) {
          list.items[i].loose = true;
        }
      }
      return list;
    }
  }
  html(src) {
    const cap = this.rules.block.html.exec(src);
    if (cap) {
      const token2 = {
        type: "html",
        block: true,
        raw: cap[0],
        pre: cap[1] === "pre" || cap[1] === "script" || cap[1] === "style",
        text: cap[0]
      };
      return token2;
    }
  }
  def(src) {
    const cap = this.rules.block.def.exec(src);
    if (cap) {
      const tag = cap[1].toLowerCase().replace(/\s+/g, " ");
      const href = cap[2] ? cap[2].replace(/^<(.*)>$/, "$1").replace(this.rules.inline._escapes, "$1") : "";
      const title = cap[3] ? cap[3].substring(1, cap[3].length - 1).replace(this.rules.inline._escapes, "$1") : cap[3];
      return {
        type: "def",
        tag,
        raw: cap[0],
        href,
        title
      };
    }
  }
  table(src) {
    const cap = this.rules.block.table.exec(src);
    if (cap) {
      const item = {
        type: "table",
        raw: cap[0],
        header: splitCells(cap[1]).map((c) => {
          return { text: c, tokens: [] };
        }),
        align: cap[2].replace(/^ *|\| *$/g, "").split(/ *\| */),
        rows: cap[3] && cap[3].trim() ? cap[3].replace(/\n[ \t]*$/, "").split("\n") : []
      };
      if (item.header.length === item.align.length) {
        let l = item.align.length;
        let i, j, k, row;
        for (i = 0; i < l; i++) {
          const align = item.align[i];
          if (align) {
            if (/^ *-+: *$/.test(align)) {
              item.align[i] = "right";
            } else if (/^ *:-+: *$/.test(align)) {
              item.align[i] = "center";
            } else if (/^ *:-+ *$/.test(align)) {
              item.align[i] = "left";
            } else {
              item.align[i] = null;
            }
          }
        }
        l = item.rows.length;
        for (i = 0; i < l; i++) {
          item.rows[i] = splitCells(item.rows[i], item.header.length).map((c) => {
            return { text: c, tokens: [] };
          });
        }
        l = item.header.length;
        for (j = 0; j < l; j++) {
          item.header[j].tokens = this.lexer.inline(item.header[j].text);
        }
        l = item.rows.length;
        for (j = 0; j < l; j++) {
          row = item.rows[j];
          for (k = 0; k < row.length; k++) {
            row[k].tokens = this.lexer.inline(row[k].text);
          }
        }
        return item;
      }
    }
  }
  lheading(src) {
    const cap = this.rules.block.lheading.exec(src);
    if (cap) {
      return {
        type: "heading",
        raw: cap[0],
        depth: cap[2].charAt(0) === "=" ? 1 : 2,
        text: cap[1],
        tokens: this.lexer.inline(cap[1])
      };
    }
  }
  paragraph(src) {
    const cap = this.rules.block.paragraph.exec(src);
    if (cap) {
      const text = cap[1].charAt(cap[1].length - 1) === "\n" ? cap[1].slice(0, -1) : cap[1];
      return {
        type: "paragraph",
        raw: cap[0],
        text,
        tokens: this.lexer.inline(text)
      };
    }
  }
  text(src) {
    const cap = this.rules.block.text.exec(src);
    if (cap) {
      return {
        type: "text",
        raw: cap[0],
        text: cap[0],
        tokens: this.lexer.inline(cap[0])
      };
    }
  }
  escape(src) {
    const cap = this.rules.inline.escape.exec(src);
    if (cap) {
      return {
        type: "escape",
        raw: cap[0],
        text: escape(cap[1])
      };
    }
  }
  tag(src) {
    const cap = this.rules.inline.tag.exec(src);
    if (cap) {
      if (!this.lexer.state.inLink && /^<a /i.test(cap[0])) {
        this.lexer.state.inLink = true;
      } else if (this.lexer.state.inLink && /^<\/a>/i.test(cap[0])) {
        this.lexer.state.inLink = false;
      }
      if (!this.lexer.state.inRawBlock && /^<(pre|code|kbd|script)(\s|>)/i.test(cap[0])) {
        this.lexer.state.inRawBlock = true;
      } else if (this.lexer.state.inRawBlock && /^<\/(pre|code|kbd|script)(\s|>)/i.test(cap[0])) {
        this.lexer.state.inRawBlock = false;
      }
      return {
        type: "html",
        raw: cap[0],
        inLink: this.lexer.state.inLink,
        inRawBlock: this.lexer.state.inRawBlock,
        block: false,
        text: cap[0]
      };
    }
  }
  link(src) {
    const cap = this.rules.inline.link.exec(src);
    if (cap) {
      const trimmedUrl = cap[2].trim();
      if (!this.options.pedantic && /^</.test(trimmedUrl)) {
        if (!/>$/.test(trimmedUrl)) {
          return;
        }
        const rtrimSlash = rtrim(trimmedUrl.slice(0, -1), "\\");
        if ((trimmedUrl.length - rtrimSlash.length) % 2 === 0) {
          return;
        }
      } else {
        const lastParenIndex = findClosingBracket(cap[2], "()");
        if (lastParenIndex > -1) {
          const start = cap[0].indexOf("!") === 0 ? 5 : 4;
          const linkLen = start + cap[1].length + lastParenIndex;
          cap[2] = cap[2].substring(0, lastParenIndex);
          cap[0] = cap[0].substring(0, linkLen).trim();
          cap[3] = "";
        }
      }
      let href = cap[2];
      let title = "";
      if (this.options.pedantic) {
        const link = /^([^'"]*[^\s])\s+(['"])(.*)\2/.exec(href);
        if (link) {
          href = link[1];
          title = link[3];
        }
      } else {
        title = cap[3] ? cap[3].slice(1, -1) : "";
      }
      href = href.trim();
      if (/^</.test(href)) {
        if (this.options.pedantic && !/>$/.test(trimmedUrl)) {
          href = href.slice(1);
        } else {
          href = href.slice(1, -1);
        }
      }
      return outputLink(cap, {
        href: href ? href.replace(this.rules.inline._escapes, "$1") : href,
        title: title ? title.replace(this.rules.inline._escapes, "$1") : title
      }, cap[0], this.lexer);
    }
  }
  reflink(src, links) {
    let cap;
    if ((cap = this.rules.inline.reflink.exec(src)) || (cap = this.rules.inline.nolink.exec(src))) {
      let link = (cap[2] || cap[1]).replace(/\s+/g, " ");
      link = links[link.toLowerCase()];
      if (!link) {
        const text = cap[0].charAt(0);
        return {
          type: "text",
          raw: text,
          text
        };
      }
      return outputLink(cap, link, cap[0], this.lexer);
    }
  }
  emStrong(src, maskedSrc, prevChar = "") {
    let match = this.rules.inline.emStrong.lDelim.exec(src);
    if (!match)
      return;
    if (match[3] && prevChar.match(/[\p{L}\p{N}]/u))
      return;
    const nextChar = match[1] || match[2] || "";
    if (!nextChar || !prevChar || this.rules.inline.punctuation.exec(prevChar)) {
      const lLength = [...match[0]].length - 1;
      let rDelim, rLength, delimTotal = lLength, midDelimTotal = 0;
      const endReg = match[0][0] === "*" ? this.rules.inline.emStrong.rDelimAst : this.rules.inline.emStrong.rDelimUnd;
      endReg.lastIndex = 0;
      maskedSrc = maskedSrc.slice(-1 * src.length + lLength);
      while ((match = endReg.exec(maskedSrc)) != null) {
        rDelim = match[1] || match[2] || match[3] || match[4] || match[5] || match[6];
        if (!rDelim)
          continue;
        rLength = [...rDelim].length;
        if (match[3] || match[4]) {
          delimTotal += rLength;
          continue;
        } else if (match[5] || match[6]) {
          if (lLength % 3 && !((lLength + rLength) % 3)) {
            midDelimTotal += rLength;
            continue;
          }
        }
        delimTotal -= rLength;
        if (delimTotal > 0)
          continue;
        rLength = Math.min(rLength, rLength + delimTotal + midDelimTotal);
        const raw = [...src].slice(0, lLength + match.index + rLength + 1).join("");
        if (Math.min(lLength, rLength) % 2) {
          const text2 = raw.slice(1, -1);
          return {
            type: "em",
            raw,
            text: text2,
            tokens: this.lexer.inlineTokens(text2)
          };
        }
        const text = raw.slice(2, -2);
        return {
          type: "strong",
          raw,
          text,
          tokens: this.lexer.inlineTokens(text)
        };
      }
    }
  }
  codespan(src) {
    const cap = this.rules.inline.code.exec(src);
    if (cap) {
      let text = cap[2].replace(/\n/g, " ");
      const hasNonSpaceChars = /[^ ]/.test(text);
      const hasSpaceCharsOnBothEnds = /^ /.test(text) && / $/.test(text);
      if (hasNonSpaceChars && hasSpaceCharsOnBothEnds) {
        text = text.substring(1, text.length - 1);
      }
      text = escape(text, true);
      return {
        type: "codespan",
        raw: cap[0],
        text
      };
    }
  }
  br(src) {
    const cap = this.rules.inline.br.exec(src);
    if (cap) {
      return {
        type: "br",
        raw: cap[0]
      };
    }
  }
  del(src) {
    const cap = this.rules.inline.del.exec(src);
    if (cap) {
      return {
        type: "del",
        raw: cap[0],
        text: cap[2],
        tokens: this.lexer.inlineTokens(cap[2])
      };
    }
  }
  autolink(src) {
    const cap = this.rules.inline.autolink.exec(src);
    if (cap) {
      let text, href;
      if (cap[2] === "@") {
        text = escape(cap[1]);
        href = "mailto:" + text;
      } else {
        text = escape(cap[1]);
        href = text;
      }
      return {
        type: "link",
        raw: cap[0],
        text,
        href,
        tokens: [
          {
            type: "text",
            raw: text,
            text
          }
        ]
      };
    }
  }
  url(src) {
    let cap;
    if (cap = this.rules.inline.url.exec(src)) {
      let text, href;
      if (cap[2] === "@") {
        text = escape(cap[0]);
        href = "mailto:" + text;
      } else {
        let prevCapZero;
        do {
          prevCapZero = cap[0];
          cap[0] = this.rules.inline._backpedal.exec(cap[0])[0];
        } while (prevCapZero !== cap[0]);
        text = escape(cap[0]);
        if (cap[1] === "www.") {
          href = "http://" + cap[0];
        } else {
          href = cap[0];
        }
      }
      return {
        type: "link",
        raw: cap[0],
        text,
        href,
        tokens: [
          {
            type: "text",
            raw: text,
            text
          }
        ]
      };
    }
  }
  inlineText(src) {
    const cap = this.rules.inline.text.exec(src);
    if (cap) {
      let text;
      if (this.lexer.state.inRawBlock) {
        text = cap[0];
      } else {
        text = escape(cap[0]);
      }
      return {
        type: "text",
        raw: cap[0],
        text
      };
    }
  }
};
var block = {
  newline: /^(?: *(?:\n|$))+/,
  code: /^( {4}[^\n]+(?:\n(?: *(?:\n|$))*)?)+/,
  fences: /^ {0,3}(`{3,}(?=[^`\n]*(?:\n|$))|~{3,})([^\n]*)(?:\n|$)(?:|([\s\S]*?)(?:\n|$))(?: {0,3}\1[~`]* *(?=\n|$)|$)/,
  hr: /^ {0,3}((?:-[\t ]*){3,}|(?:_[ \t]*){3,}|(?:\*[ \t]*){3,})(?:\n+|$)/,
  heading: /^ {0,3}(#{1,6})(?=\s|$)(.*)(?:\n+|$)/,
  blockquote: /^( {0,3}> ?(paragraph|[^\n]*)(?:\n|$))+/,
  list: /^( {0,3}bull)([ \t][^\n]+?)?(?:\n|$)/,
  html: "^ {0,3}(?:<(script|pre|style|textarea)[\\s>][\\s\\S]*?(?:</\\1>[^\\n]*\\n+|$)|comment[^\\n]*(\\n+|$)|<\\?[\\s\\S]*?(?:\\?>\\n*|$)|<![A-Z][\\s\\S]*?(?:>\\n*|$)|<!\\[CDATA\\[[\\s\\S]*?(?:\\]\\]>\\n*|$)|</?(tag)(?: +|\\n|/?>)[\\s\\S]*?(?:(?:\\n *)+\\n|$)|<(?!script|pre|style|textarea)([a-z][\\w-]*)(?:attribute)*? */?>(?=[ \\t]*(?:\\n|$))[\\s\\S]*?(?:(?:\\n *)+\\n|$)|</(?!script|pre|style|textarea)[a-z][\\w-]*\\s*>(?=[ \\t]*(?:\\n|$))[\\s\\S]*?(?:(?:\\n *)+\\n|$))",
  def: /^ {0,3}\[(label)\]: *(?:\n *)?([^<\s][^\s]*|<.*?>)(?:(?: +(?:\n *)?| *\n *)(title))? *(?:\n+|$)/,
  table: noopTest,
  lheading: /^((?:(?!^bull ).|\n(?!\n|bull ))+?)\n {0,3}(=+|-+) *(?:\n+|$)/,
  // regex template, placeholders will be replaced according to different paragraph
  // interruption rules of commonmark and the original markdown spec:
  _paragraph: /^([^\n]+(?:\n(?!hr|heading|lheading|blockquote|fences|list|html|table| +\n)[^\n]+)*)/,
  text: /^[^\n]+/
};
block._label = /(?!\s*\])(?:\\.|[^\[\]\\])+/;
block._title = /(?:"(?:\\"?|[^"\\])*"|'[^'\n]*(?:\n[^'\n]+)*\n?'|\([^()]*\))/;
block.def = edit(block.def).replace("label", block._label).replace("title", block._title).getRegex();
block.bullet = /(?:[*+-]|\d{1,9}[.)])/;
block.listItemStart = edit(/^( *)(bull) */).replace("bull", block.bullet).getRegex();
block.list = edit(block.list).replace(/bull/g, block.bullet).replace("hr", "\\n+(?=\\1?(?:(?:- *){3,}|(?:_ *){3,}|(?:\\* *){3,})(?:\\n+|$))").replace("def", "\\n+(?=" + block.def.source + ")").getRegex();
block._tag = "address|article|aside|base|basefont|blockquote|body|caption|center|col|colgroup|dd|details|dialog|dir|div|dl|dt|fieldset|figcaption|figure|footer|form|frame|frameset|h[1-6]|head|header|hr|html|iframe|legend|li|link|main|menu|menuitem|meta|nav|noframes|ol|optgroup|option|p|param|section|source|summary|table|tbody|td|tfoot|th|thead|title|tr|track|ul";
block._comment = /<!--(?!-?>)[\s\S]*?(?:-->|$)/;
block.html = edit(block.html, "i").replace("comment", block._comment).replace("tag", block._tag).replace("attribute", / +[a-zA-Z:_][\w.:-]*(?: *= *"[^"\n]*"| *= *'[^'\n]*'| *= *[^\s"'=<>`]+)?/).getRegex();
block.lheading = edit(block.lheading).replace(/bull/g, block.bullet).getRegex();
block.paragraph = edit(block._paragraph).replace("hr", block.hr).replace("heading", " {0,3}#{1,6} ").replace("|lheading", "").replace("|table", "").replace("blockquote", " {0,3}>").replace("fences", " {0,3}(?:`{3,}(?=[^`\\n]*\\n)|~{3,})[^\\n]*\\n").replace("list", " {0,3}(?:[*+-]|1[.)]) ").replace("html", "</?(?:tag)(?: +|\\n|/?>)|<(?:script|pre|style|textarea|!--)").replace("tag", block._tag).getRegex();
block.blockquote = edit(block.blockquote).replace("paragraph", block.paragraph).getRegex();
block.normal = { ...block };
block.gfm = {
  ...block.normal,
  table: "^ *([^\\n ].*\\|.*)\\n {0,3}(?:\\| *)?(:?-+:? *(?:\\| *:?-+:? *)*)(?:\\| *)?(?:\\n((?:(?! *\\n|hr|heading|blockquote|code|fences|list|html).*(?:\\n|$))*)\\n*|$)"
  // Cells
};
block.gfm.table = edit(block.gfm.table).replace("hr", block.hr).replace("heading", " {0,3}#{1,6} ").replace("blockquote", " {0,3}>").replace("code", " {4}[^\\n]").replace("fences", " {0,3}(?:`{3,}(?=[^`\\n]*\\n)|~{3,})[^\\n]*\\n").replace("list", " {0,3}(?:[*+-]|1[.)]) ").replace("html", "</?(?:tag)(?: +|\\n|/?>)|<(?:script|pre|style|textarea|!--)").replace("tag", block._tag).getRegex();
block.gfm.paragraph = edit(block._paragraph).replace("hr", block.hr).replace("heading", " {0,3}#{1,6} ").replace("|lheading", "").replace("table", block.gfm.table).replace("blockquote", " {0,3}>").replace("fences", " {0,3}(?:`{3,}(?=[^`\\n]*\\n)|~{3,})[^\\n]*\\n").replace("list", " {0,3}(?:[*+-]|1[.)]) ").replace("html", "</?(?:tag)(?: +|\\n|/?>)|<(?:script|pre|style|textarea|!--)").replace("tag", block._tag).getRegex();
block.pedantic = {
  ...block.normal,
  html: edit(`^ *(?:comment *(?:\\n|\\s*$)|<(tag)[\\s\\S]+?</\\1> *(?:\\n{2,}|\\s*$)|<tag(?:"[^"]*"|'[^']*'|\\s[^'"/>\\s]*)*?/?> *(?:\\n{2,}|\\s*$))`).replace("comment", block._comment).replace(/tag/g, "(?!(?:a|em|strong|small|s|cite|q|dfn|abbr|data|time|code|var|samp|kbd|sub|sup|i|b|u|mark|ruby|rt|rp|bdi|bdo|span|br|wbr|ins|del|img)\\b)\\w+(?!:|[^\\w\\s@]*@)\\b").getRegex(),
  def: /^ *\[([^\]]+)\]: *<?([^\s>]+)>?(?: +(["(][^\n]+[")]))? *(?:\n+|$)/,
  heading: /^(#{1,6})(.*)(?:\n+|$)/,
  fences: noopTest,
  lheading: /^(.+?)\n {0,3}(=+|-+) *(?:\n+|$)/,
  paragraph: edit(block.normal._paragraph).replace("hr", block.hr).replace("heading", " *#{1,6} *[^\n]").replace("lheading", block.lheading).replace("blockquote", " {0,3}>").replace("|fences", "").replace("|list", "").replace("|html", "").getRegex()
};
var inline = {
  escape: /^\\([!"#$%&'()*+,\-./:;<=>?@\[\]\\^_`{|}~])/,
  autolink: /^<(scheme:[^\s\x00-\x1f<>]*|email)>/,
  url: noopTest,
  tag: "^comment|^</[a-zA-Z][\\w:-]*\\s*>|^<[a-zA-Z][\\w-]*(?:attribute)*?\\s*/?>|^<\\?[\\s\\S]*?\\?>|^<![a-zA-Z]+\\s[\\s\\S]*?>|^<!\\[CDATA\\[[\\s\\S]*?\\]\\]>",
  link: /^!?\[(label)\]\(\s*(href)(?:\s+(title))?\s*\)/,
  reflink: /^!?\[(label)\]\[(ref)\]/,
  nolink: /^!?\[(ref)\](?:\[\])?/,
  reflinkSearch: "reflink|nolink(?!\\()",
  emStrong: {
    lDelim: /^(?:\*+(?:((?!\*)[punct])|[^\s*]))|^_+(?:((?!_)[punct])|([^\s_]))/,
    //         (1) and (2) can only be a Right Delimiter. (3) and (4) can only be Left.  (5) and (6) can be either Left or Right.
    //         | Skip orphan inside strong      | Consume to delim | (1) #***              | (2) a***#, a***                    | (3) #***a, ***a                  | (4) ***#                 | (5) #***#                         | (6) a***a
    rDelimAst: /^[^_*]*?__[^_*]*?\*[^_*]*?(?=__)|[^*]+(?=[^*])|(?!\*)[punct](\*+)(?=[\s]|$)|[^punct\s](\*+)(?!\*)(?=[punct\s]|$)|(?!\*)[punct\s](\*+)(?=[^punct\s])|[\s](\*+)(?!\*)(?=[punct])|(?!\*)[punct](\*+)(?!\*)(?=[punct])|[^punct\s](\*+)(?=[^punct\s])/,
    rDelimUnd: /^[^_*]*?\*\*[^_*]*?_[^_*]*?(?=\*\*)|[^_]+(?=[^_])|(?!_)[punct](_+)(?=[\s]|$)|[^punct\s](_+)(?!_)(?=[punct\s]|$)|(?!_)[punct\s](_+)(?=[^punct\s])|[\s](_+)(?!_)(?=[punct])|(?!_)[punct](_+)(?!_)(?=[punct])/
    // ^- Not allowed for _
  },
  code: /^(`+)([^`]|[^`][\s\S]*?[^`])\1(?!`)/,
  br: /^( {2,}|\\)\n(?!\s*$)/,
  del: noopTest,
  text: /^(`+|[^`])(?:(?= {2,}\n)|[\s\S]*?(?:(?=[\\<!\[`*_]|\b_|$)|[^ ](?= {2,}\n)))/,
  punctuation: /^((?![*_])[\spunctuation])/
};
inline._punctuation = "\\p{P}$+<=>`^|~";
inline.punctuation = edit(inline.punctuation, "u").replace(/punctuation/g, inline._punctuation).getRegex();
inline.blockSkip = /\[[^[\]]*?\]\([^\(\)]*?\)|`[^`]*?`|<[^<>]*?>/g;
inline.anyPunctuation = /\\[punct]/g;
inline._escapes = /\\([punct])/g;
inline._comment = edit(block._comment).replace("(?:-->|$)", "-->").getRegex();
inline.emStrong.lDelim = edit(inline.emStrong.lDelim, "u").replace(/punct/g, inline._punctuation).getRegex();
inline.emStrong.rDelimAst = edit(inline.emStrong.rDelimAst, "gu").replace(/punct/g, inline._punctuation).getRegex();
inline.emStrong.rDelimUnd = edit(inline.emStrong.rDelimUnd, "gu").replace(/punct/g, inline._punctuation).getRegex();
inline.anyPunctuation = edit(inline.anyPunctuation, "gu").replace(/punct/g, inline._punctuation).getRegex();
inline._escapes = edit(inline._escapes, "gu").replace(/punct/g, inline._punctuation).getRegex();
inline._scheme = /[a-zA-Z][a-zA-Z0-9+.-]{1,31}/;
inline._email = /[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+(@)[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+(?![-_])/;
inline.autolink = edit(inline.autolink).replace("scheme", inline._scheme).replace("email", inline._email).getRegex();
inline._attribute = /\s+[a-zA-Z:_][\w.:-]*(?:\s*=\s*"[^"]*"|\s*=\s*'[^']*'|\s*=\s*[^\s"'=<>`]+)?/;
inline.tag = edit(inline.tag).replace("comment", inline._comment).replace("attribute", inline._attribute).getRegex();
inline._label = /(?:\[(?:\\.|[^\[\]\\])*\]|\\.|`[^`]*`|[^\[\]\\`])*?/;
inline._href = /<(?:\\.|[^\n<>\\])+>|[^\s\x00-\x1f]*/;
inline._title = /"(?:\\"?|[^"\\])*"|'(?:\\'?|[^'\\])*'|\((?:\\\)?|[^)\\])*\)/;
inline.link = edit(inline.link).replace("label", inline._label).replace("href", inline._href).replace("title", inline._title).getRegex();
inline.reflink = edit(inline.reflink).replace("label", inline._label).replace("ref", block._label).getRegex();
inline.nolink = edit(inline.nolink).replace("ref", block._label).getRegex();
inline.reflinkSearch = edit(inline.reflinkSearch, "g").replace("reflink", inline.reflink).replace("nolink", inline.nolink).getRegex();
inline.normal = { ...inline };
inline.pedantic = {
  ...inline.normal,
  strong: {
    start: /^__|\*\*/,
    middle: /^__(?=\S)([\s\S]*?\S)__(?!_)|^\*\*(?=\S)([\s\S]*?\S)\*\*(?!\*)/,
    endAst: /\*\*(?!\*)/g,
    endUnd: /__(?!_)/g
  },
  em: {
    start: /^_|\*/,
    middle: /^()\*(?=\S)([\s\S]*?\S)\*(?!\*)|^_(?=\S)([\s\S]*?\S)_(?!_)/,
    endAst: /\*(?!\*)/g,
    endUnd: /_(?!_)/g
  },
  link: edit(/^!?\[(label)\]\((.*?)\)/).replace("label", inline._label).getRegex(),
  reflink: edit(/^!?\[(label)\]\s*\[([^\]]*)\]/).replace("label", inline._label).getRegex()
};
inline.gfm = {
  ...inline.normal,
  escape: edit(inline.escape).replace("])", "~|])").getRegex(),
  _extended_email: /[A-Za-z0-9._+-]+(@)[a-zA-Z0-9-_]+(?:\.[a-zA-Z0-9-_]*[a-zA-Z0-9])+(?![-_])/,
  url: /^((?:ftp|https?):\/\/|www\.)(?:[a-zA-Z0-9\-]+\.?)+[^\s<]*|^email/,
  _backpedal: /(?:[^?!.,:;*_'"~()&]+|\([^)]*\)|&(?![a-zA-Z0-9]+;$)|[?!.,:;*_'"~)]+(?!$))+/,
  del: /^(~~?)(?=[^\s~])([\s\S]*?[^\s~])\1(?=[^~]|$)/,
  text: /^([`~]+|[^`~])(?:(?= {2,}\n)|(?=[a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-]+@)|[\s\S]*?(?:(?=[\\<!\[`*~_]|\b_|https?:\/\/|ftp:\/\/|www\.|$)|[^ ](?= {2,}\n)|[^a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-](?=[a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-]+@)))/
};
inline.gfm.url = edit(inline.gfm.url, "i").replace("email", inline.gfm._extended_email).getRegex();
inline.breaks = {
  ...inline.gfm,
  br: edit(inline.br).replace("{2,}", "*").getRegex(),
  text: edit(inline.gfm.text).replace("\\b_", "\\b_| {2,}\\n").replace(/\{2,\}/g, "*").getRegex()
};
var _Lexer = class __Lexer {
  tokens;
  options;
  state;
  tokenizer;
  inlineQueue;
  constructor(options2) {
    this.tokens = [];
    this.tokens.links = /* @__PURE__ */ Object.create(null);
    this.options = options2 || _defaults;
    this.options.tokenizer = this.options.tokenizer || new _Tokenizer();
    this.tokenizer = this.options.tokenizer;
    this.tokenizer.options = this.options;
    this.tokenizer.lexer = this;
    this.inlineQueue = [];
    this.state = {
      inLink: false,
      inRawBlock: false,
      top: true
    };
    const rules = {
      block: block.normal,
      inline: inline.normal
    };
    if (this.options.pedantic) {
      rules.block = block.pedantic;
      rules.inline = inline.pedantic;
    } else if (this.options.gfm) {
      rules.block = block.gfm;
      if (this.options.breaks) {
        rules.inline = inline.breaks;
      } else {
        rules.inline = inline.gfm;
      }
    }
    this.tokenizer.rules = rules;
  }
  /**
   * Expose Rules
   */
  static get rules() {
    return {
      block,
      inline
    };
  }
  /**
   * Static Lex Method
   */
  static lex(src, options2) {
    const lexer2 = new __Lexer(options2);
    return lexer2.lex(src);
  }
  /**
   * Static Lex Inline Method
   */
  static lexInline(src, options2) {
    const lexer2 = new __Lexer(options2);
    return lexer2.inlineTokens(src);
  }
  /**
   * Preprocessing
   */
  lex(src) {
    src = src.replace(/\r\n|\r/g, "\n");
    this.blockTokens(src, this.tokens);
    let next;
    while (next = this.inlineQueue.shift()) {
      this.inlineTokens(next.src, next.tokens);
    }
    return this.tokens;
  }
  blockTokens(src, tokens = []) {
    if (this.options.pedantic) {
      src = src.replace(/\t/g, "    ").replace(/^ +$/gm, "");
    } else {
      src = src.replace(/^( *)(\t+)/gm, (_, leading, tabs) => {
        return leading + "    ".repeat(tabs.length);
      });
    }
    let token2;
    let lastToken;
    let cutSrc;
    let lastParagraphClipped;
    while (src) {
      if (this.options.extensions && this.options.extensions.block && this.options.extensions.block.some((extTokenizer) => {
        if (token2 = extTokenizer.call({ lexer: this }, src, tokens)) {
          src = src.substring(token2.raw.length);
          tokens.push(token2);
          return true;
        }
        return false;
      })) {
        continue;
      }
      if (token2 = this.tokenizer.space(src)) {
        src = src.substring(token2.raw.length);
        if (token2.raw.length === 1 && tokens.length > 0) {
          tokens[tokens.length - 1].raw += "\n";
        } else {
          tokens.push(token2);
        }
        continue;
      }
      if (token2 = this.tokenizer.code(src)) {
        src = src.substring(token2.raw.length);
        lastToken = tokens[tokens.length - 1];
        if (lastToken && (lastToken.type === "paragraph" || lastToken.type === "text")) {
          lastToken.raw += "\n" + token2.raw;
          lastToken.text += "\n" + token2.text;
          this.inlineQueue[this.inlineQueue.length - 1].src = lastToken.text;
        } else {
          tokens.push(token2);
        }
        continue;
      }
      if (token2 = this.tokenizer.fences(src)) {
        src = src.substring(token2.raw.length);
        tokens.push(token2);
        continue;
      }
      if (token2 = this.tokenizer.heading(src)) {
        src = src.substring(token2.raw.length);
        tokens.push(token2);
        continue;
      }
      if (token2 = this.tokenizer.hr(src)) {
        src = src.substring(token2.raw.length);
        tokens.push(token2);
        continue;
      }
      if (token2 = this.tokenizer.blockquote(src)) {
        src = src.substring(token2.raw.length);
        tokens.push(token2);
        continue;
      }
      if (token2 = this.tokenizer.list(src)) {
        src = src.substring(token2.raw.length);
        tokens.push(token2);
        continue;
      }
      if (token2 = this.tokenizer.html(src)) {
        src = src.substring(token2.raw.length);
        tokens.push(token2);
        continue;
      }
      if (token2 = this.tokenizer.def(src)) {
        src = src.substring(token2.raw.length);
        lastToken = tokens[tokens.length - 1];
        if (lastToken && (lastToken.type === "paragraph" || lastToken.type === "text")) {
          lastToken.raw += "\n" + token2.raw;
          lastToken.text += "\n" + token2.raw;
          this.inlineQueue[this.inlineQueue.length - 1].src = lastToken.text;
        } else if (!this.tokens.links[token2.tag]) {
          this.tokens.links[token2.tag] = {
            href: token2.href,
            title: token2.title
          };
        }
        continue;
      }
      if (token2 = this.tokenizer.table(src)) {
        src = src.substring(token2.raw.length);
        tokens.push(token2);
        continue;
      }
      if (token2 = this.tokenizer.lheading(src)) {
        src = src.substring(token2.raw.length);
        tokens.push(token2);
        continue;
      }
      cutSrc = src;
      if (this.options.extensions && this.options.extensions.startBlock) {
        let startIndex = Infinity;
        const tempSrc = src.slice(1);
        let tempStart;
        this.options.extensions.startBlock.forEach((getStartIndex) => {
          tempStart = getStartIndex.call({ lexer: this }, tempSrc);
          if (typeof tempStart === "number" && tempStart >= 0) {
            startIndex = Math.min(startIndex, tempStart);
          }
        });
        if (startIndex < Infinity && startIndex >= 0) {
          cutSrc = src.substring(0, startIndex + 1);
        }
      }
      if (this.state.top && (token2 = this.tokenizer.paragraph(cutSrc))) {
        lastToken = tokens[tokens.length - 1];
        if (lastParagraphClipped && lastToken.type === "paragraph") {
          lastToken.raw += "\n" + token2.raw;
          lastToken.text += "\n" + token2.text;
          this.inlineQueue.pop();
          this.inlineQueue[this.inlineQueue.length - 1].src = lastToken.text;
        } else {
          tokens.push(token2);
        }
        lastParagraphClipped = cutSrc.length !== src.length;
        src = src.substring(token2.raw.length);
        continue;
      }
      if (token2 = this.tokenizer.text(src)) {
        src = src.substring(token2.raw.length);
        lastToken = tokens[tokens.length - 1];
        if (lastToken && lastToken.type === "text") {
          lastToken.raw += "\n" + token2.raw;
          lastToken.text += "\n" + token2.text;
          this.inlineQueue.pop();
          this.inlineQueue[this.inlineQueue.length - 1].src = lastToken.text;
        } else {
          tokens.push(token2);
        }
        continue;
      }
      if (src) {
        const errMsg = "Infinite loop on byte: " + src.charCodeAt(0);
        if (this.options.silent) {
          console.error(errMsg);
          break;
        } else {
          throw new Error(errMsg);
        }
      }
    }
    this.state.top = true;
    return tokens;
  }
  inline(src, tokens = []) {
    this.inlineQueue.push({ src, tokens });
    return tokens;
  }
  /**
   * Lexing/Compiling
   */
  inlineTokens(src, tokens = []) {
    let token2, lastToken, cutSrc;
    let maskedSrc = src;
    let match;
    let keepPrevChar, prevChar;
    if (this.tokens.links) {
      const links = Object.keys(this.tokens.links);
      if (links.length > 0) {
        while ((match = this.tokenizer.rules.inline.reflinkSearch.exec(maskedSrc)) != null) {
          if (links.includes(match[0].slice(match[0].lastIndexOf("[") + 1, -1))) {
            maskedSrc = maskedSrc.slice(0, match.index) + "[" + "a".repeat(match[0].length - 2) + "]" + maskedSrc.slice(this.tokenizer.rules.inline.reflinkSearch.lastIndex);
          }
        }
      }
    }
    while ((match = this.tokenizer.rules.inline.blockSkip.exec(maskedSrc)) != null) {
      maskedSrc = maskedSrc.slice(0, match.index) + "[" + "a".repeat(match[0].length - 2) + "]" + maskedSrc.slice(this.tokenizer.rules.inline.blockSkip.lastIndex);
    }
    while ((match = this.tokenizer.rules.inline.anyPunctuation.exec(maskedSrc)) != null) {
      maskedSrc = maskedSrc.slice(0, match.index) + "++" + maskedSrc.slice(this.tokenizer.rules.inline.anyPunctuation.lastIndex);
    }
    while (src) {
      if (!keepPrevChar) {
        prevChar = "";
      }
      keepPrevChar = false;
      if (this.options.extensions && this.options.extensions.inline && this.options.extensions.inline.some((extTokenizer) => {
        if (token2 = extTokenizer.call({ lexer: this }, src, tokens)) {
          src = src.substring(token2.raw.length);
          tokens.push(token2);
          return true;
        }
        return false;
      })) {
        continue;
      }
      if (token2 = this.tokenizer.escape(src)) {
        src = src.substring(token2.raw.length);
        tokens.push(token2);
        continue;
      }
      if (token2 = this.tokenizer.tag(src)) {
        src = src.substring(token2.raw.length);
        lastToken = tokens[tokens.length - 1];
        if (lastToken && token2.type === "text" && lastToken.type === "text") {
          lastToken.raw += token2.raw;
          lastToken.text += token2.text;
        } else {
          tokens.push(token2);
        }
        continue;
      }
      if (token2 = this.tokenizer.link(src)) {
        src = src.substring(token2.raw.length);
        tokens.push(token2);
        continue;
      }
      if (token2 = this.tokenizer.reflink(src, this.tokens.links)) {
        src = src.substring(token2.raw.length);
        lastToken = tokens[tokens.length - 1];
        if (lastToken && token2.type === "text" && lastToken.type === "text") {
          lastToken.raw += token2.raw;
          lastToken.text += token2.text;
        } else {
          tokens.push(token2);
        }
        continue;
      }
      if (token2 = this.tokenizer.emStrong(src, maskedSrc, prevChar)) {
        src = src.substring(token2.raw.length);
        tokens.push(token2);
        continue;
      }
      if (token2 = this.tokenizer.codespan(src)) {
        src = src.substring(token2.raw.length);
        tokens.push(token2);
        continue;
      }
      if (token2 = this.tokenizer.br(src)) {
        src = src.substring(token2.raw.length);
        tokens.push(token2);
        continue;
      }
      if (token2 = this.tokenizer.del(src)) {
        src = src.substring(token2.raw.length);
        tokens.push(token2);
        continue;
      }
      if (token2 = this.tokenizer.autolink(src)) {
        src = src.substring(token2.raw.length);
        tokens.push(token2);
        continue;
      }
      if (!this.state.inLink && (token2 = this.tokenizer.url(src))) {
        src = src.substring(token2.raw.length);
        tokens.push(token2);
        continue;
      }
      cutSrc = src;
      if (this.options.extensions && this.options.extensions.startInline) {
        let startIndex = Infinity;
        const tempSrc = src.slice(1);
        let tempStart;
        this.options.extensions.startInline.forEach((getStartIndex) => {
          tempStart = getStartIndex.call({ lexer: this }, tempSrc);
          if (typeof tempStart === "number" && tempStart >= 0) {
            startIndex = Math.min(startIndex, tempStart);
          }
        });
        if (startIndex < Infinity && startIndex >= 0) {
          cutSrc = src.substring(0, startIndex + 1);
        }
      }
      if (token2 = this.tokenizer.inlineText(cutSrc)) {
        src = src.substring(token2.raw.length);
        if (token2.raw.slice(-1) !== "_") {
          prevChar = token2.raw.slice(-1);
        }
        keepPrevChar = true;
        lastToken = tokens[tokens.length - 1];
        if (lastToken && lastToken.type === "text") {
          lastToken.raw += token2.raw;
          lastToken.text += token2.text;
        } else {
          tokens.push(token2);
        }
        continue;
      }
      if (src) {
        const errMsg = "Infinite loop on byte: " + src.charCodeAt(0);
        if (this.options.silent) {
          console.error(errMsg);
          break;
        } else {
          throw new Error(errMsg);
        }
      }
    }
    return tokens;
  }
};
var _Renderer = class {
  options;
  constructor(options2) {
    this.options = options2 || _defaults;
  }
  code(code, infostring, escaped) {
    const lang = (infostring || "").match(/^\S*/)?.[0];
    code = code.replace(/\n$/, "") + "\n";
    if (!lang) {
      return "<pre><code>" + (escaped ? code : escape(code, true)) + "</code></pre>\n";
    }
    return '<pre><code class="language-' + escape(lang) + '">' + (escaped ? code : escape(code, true)) + "</code></pre>\n";
  }
  blockquote(quote) {
    return `<blockquote>
${quote}</blockquote>
`;
  }
  html(html, block2) {
    return html;
  }
  heading(text, level, raw) {
    return `<h${level}>${text}</h${level}>
`;
  }
  hr() {
    return "<hr>\n";
  }
  list(body, ordered, start) {
    const type = ordered ? "ol" : "ul";
    const startatt = ordered && start !== 1 ? ' start="' + start + '"' : "";
    return "<" + type + startatt + ">\n" + body + "</" + type + ">\n";
  }
  listitem(text, task, checked) {
    return `<li>${text}</li>
`;
  }
  checkbox(checked) {
    return "<input " + (checked ? 'checked="" ' : "") + 'disabled="" type="checkbox">';
  }
  paragraph(text) {
    return `<p>${text}</p>
`;
  }
  table(header, body) {
    if (body)
      body = `<tbody>${body}</tbody>`;
    return "<table>\n<thead>\n" + header + "</thead>\n" + body + "</table>\n";
  }
  tablerow(content) {
    return `<tr>
${content}</tr>
`;
  }
  tablecell(content, flags) {
    const type = flags.header ? "th" : "td";
    const tag = flags.align ? `<${type} align="${flags.align}">` : `<${type}>`;
    return tag + content + `</${type}>
`;
  }
  /**
   * span level renderer
   */
  strong(text) {
    return `<strong>${text}</strong>`;
  }
  em(text) {
    return `<em>${text}</em>`;
  }
  codespan(text) {
    return `<code>${text}</code>`;
  }
  br() {
    return "<br>";
  }
  del(text) {
    return `<del>${text}</del>`;
  }
  link(href, title, text) {
    const cleanHref = cleanUrl(href);
    if (cleanHref === null) {
      return text;
    }
    href = cleanHref;
    let out = '<a href="' + href + '"';
    if (title) {
      out += ' title="' + title + '"';
    }
    out += ">" + text + "</a>";
    return out;
  }
  image(href, title, text) {
    const cleanHref = cleanUrl(href);
    if (cleanHref === null) {
      return text;
    }
    href = cleanHref;
    let out = `<img src="${href}" alt="${text}"`;
    if (title) {
      out += ` title="${title}"`;
    }
    out += ">";
    return out;
  }
  text(text) {
    return text;
  }
};
var _TextRenderer = class {
  // no need for block level renderers
  strong(text) {
    return text;
  }
  em(text) {
    return text;
  }
  codespan(text) {
    return text;
  }
  del(text) {
    return text;
  }
  html(text) {
    return text;
  }
  text(text) {
    return text;
  }
  link(href, title, text) {
    return "" + text;
  }
  image(href, title, text) {
    return "" + text;
  }
  br() {
    return "";
  }
};
var _Parser = class __Parser {
  options;
  renderer;
  textRenderer;
  constructor(options2) {
    this.options = options2 || _defaults;
    this.options.renderer = this.options.renderer || new _Renderer();
    this.renderer = this.options.renderer;
    this.renderer.options = this.options;
    this.textRenderer = new _TextRenderer();
  }
  /**
   * Static Parse Method
   */
  static parse(tokens, options2) {
    const parser2 = new __Parser(options2);
    return parser2.parse(tokens);
  }
  /**
   * Static Parse Inline Method
   */
  static parseInline(tokens, options2) {
    const parser2 = new __Parser(options2);
    return parser2.parseInline(tokens);
  }
  /**
   * Parse Loop
   */
  parse(tokens, top = true) {
    let out = "";
    for (let i = 0; i < tokens.length; i++) {
      const token2 = tokens[i];
      if (this.options.extensions && this.options.extensions.renderers && this.options.extensions.renderers[token2.type]) {
        const genericToken = token2;
        const ret = this.options.extensions.renderers[genericToken.type].call({ parser: this }, genericToken);
        if (ret !== false || !["space", "hr", "heading", "code", "table", "blockquote", "list", "html", "paragraph", "text"].includes(genericToken.type)) {
          out += ret || "";
          continue;
        }
      }
      switch (token2.type) {
        case "space": {
          continue;
        }
        case "hr": {
          out += this.renderer.hr();
          continue;
        }
        case "heading": {
          const headingToken = token2;
          out += this.renderer.heading(this.parseInline(headingToken.tokens), headingToken.depth, unescape(this.parseInline(headingToken.tokens, this.textRenderer)));
          continue;
        }
        case "code": {
          const codeToken = token2;
          out += this.renderer.code(codeToken.text, codeToken.lang, !!codeToken.escaped);
          continue;
        }
        case "table": {
          const tableToken = token2;
          let header = "";
          let cell = "";
          for (let j = 0; j < tableToken.header.length; j++) {
            cell += this.renderer.tablecell(this.parseInline(tableToken.header[j].tokens), { header: true, align: tableToken.align[j] });
          }
          header += this.renderer.tablerow(cell);
          let body = "";
          for (let j = 0; j < tableToken.rows.length; j++) {
            const row = tableToken.rows[j];
            cell = "";
            for (let k = 0; k < row.length; k++) {
              cell += this.renderer.tablecell(this.parseInline(row[k].tokens), { header: false, align: tableToken.align[k] });
            }
            body += this.renderer.tablerow(cell);
          }
          out += this.renderer.table(header, body);
          continue;
        }
        case "blockquote": {
          const blockquoteToken = token2;
          const body = this.parse(blockquoteToken.tokens);
          out += this.renderer.blockquote(body);
          continue;
        }
        case "list": {
          const listToken = token2;
          const ordered = listToken.ordered;
          const start = listToken.start;
          const loose = listToken.loose;
          let body = "";
          for (let j = 0; j < listToken.items.length; j++) {
            const item = listToken.items[j];
            const checked = item.checked;
            const task = item.task;
            let itemBody = "";
            if (item.task) {
              const checkbox = this.renderer.checkbox(!!checked);
              if (loose) {
                if (item.tokens.length > 0 && item.tokens[0].type === "paragraph") {
                  item.tokens[0].text = checkbox + " " + item.tokens[0].text;
                  if (item.tokens[0].tokens && item.tokens[0].tokens.length > 0 && item.tokens[0].tokens[0].type === "text") {
                    item.tokens[0].tokens[0].text = checkbox + " " + item.tokens[0].tokens[0].text;
                  }
                } else {
                  item.tokens.unshift({
                    type: "text",
                    text: checkbox + " "
                  });
                }
              } else {
                itemBody += checkbox + " ";
              }
            }
            itemBody += this.parse(item.tokens, loose);
            body += this.renderer.listitem(itemBody, task, !!checked);
          }
          out += this.renderer.list(body, ordered, start);
          continue;
        }
        case "html": {
          const htmlToken = token2;
          out += this.renderer.html(htmlToken.text, htmlToken.block);
          continue;
        }
        case "paragraph": {
          const paragraphToken = token2;
          out += this.renderer.paragraph(this.parseInline(paragraphToken.tokens));
          continue;
        }
        case "text": {
          let textToken = token2;
          let body = textToken.tokens ? this.parseInline(textToken.tokens) : textToken.text;
          while (i + 1 < tokens.length && tokens[i + 1].type === "text") {
            textToken = tokens[++i];
            body += "\n" + (textToken.tokens ? this.parseInline(textToken.tokens) : textToken.text);
          }
          out += top ? this.renderer.paragraph(body) : body;
          continue;
        }
        default: {
          const errMsg = 'Token with "' + token2.type + '" type was not found.';
          if (this.options.silent) {
            console.error(errMsg);
            return "";
          } else {
            throw new Error(errMsg);
          }
        }
      }
    }
    return out;
  }
  /**
   * Parse Inline Tokens
   */
  parseInline(tokens, renderer) {
    renderer = renderer || this.renderer;
    let out = "";
    for (let i = 0; i < tokens.length; i++) {
      const token2 = tokens[i];
      if (this.options.extensions && this.options.extensions.renderers && this.options.extensions.renderers[token2.type]) {
        const ret = this.options.extensions.renderers[token2.type].call({ parser: this }, token2);
        if (ret !== false || !["escape", "html", "link", "image", "strong", "em", "codespan", "br", "del", "text"].includes(token2.type)) {
          out += ret || "";
          continue;
        }
      }
      switch (token2.type) {
        case "escape": {
          const escapeToken = token2;
          out += renderer.text(escapeToken.text);
          break;
        }
        case "html": {
          const tagToken = token2;
          out += renderer.html(tagToken.text);
          break;
        }
        case "link": {
          const linkToken = token2;
          out += renderer.link(linkToken.href, linkToken.title, this.parseInline(linkToken.tokens, renderer));
          break;
        }
        case "image": {
          const imageToken = token2;
          out += renderer.image(imageToken.href, imageToken.title, imageToken.text);
          break;
        }
        case "strong": {
          const strongToken = token2;
          out += renderer.strong(this.parseInline(strongToken.tokens, renderer));
          break;
        }
        case "em": {
          const emToken = token2;
          out += renderer.em(this.parseInline(emToken.tokens, renderer));
          break;
        }
        case "codespan": {
          const codespanToken = token2;
          out += renderer.codespan(codespanToken.text);
          break;
        }
        case "br": {
          out += renderer.br();
          break;
        }
        case "del": {
          const delToken = token2;
          out += renderer.del(this.parseInline(delToken.tokens, renderer));
          break;
        }
        case "text": {
          const textToken = token2;
          out += renderer.text(textToken.text);
          break;
        }
        default: {
          const errMsg = 'Token with "' + token2.type + '" type was not found.';
          if (this.options.silent) {
            console.error(errMsg);
            return "";
          } else {
            throw new Error(errMsg);
          }
        }
      }
    }
    return out;
  }
};
var _Hooks = class {
  options;
  constructor(options2) {
    this.options = options2 || _defaults;
  }
  static passThroughHooks = /* @__PURE__ */ new Set([
    "preprocess",
    "postprocess"
  ]);
  /**
   * Process markdown before marked
   */
  preprocess(markdown) {
    return markdown;
  }
  /**
   * Process HTML after marked is finished
   */
  postprocess(html) {
    return html;
  }
};
var Marked = class {
  defaults = _getDefaults();
  options = this.setOptions;
  parse = this.#parseMarkdown(_Lexer.lex, _Parser.parse);
  parseInline = this.#parseMarkdown(_Lexer.lexInline, _Parser.parseInline);
  Parser = _Parser;
  parser = _Parser.parse;
  Renderer = _Renderer;
  TextRenderer = _TextRenderer;
  Lexer = _Lexer;
  lexer = _Lexer.lex;
  Tokenizer = _Tokenizer;
  Hooks = _Hooks;
  constructor(...args) {
    this.use(...args);
  }
  /**
   * Run callback for every token
   */
  walkTokens(tokens, callback) {
    let values = [];
    for (const token2 of tokens) {
      values = values.concat(callback.call(this, token2));
      switch (token2.type) {
        case "table": {
          const tableToken = token2;
          for (const cell of tableToken.header) {
            values = values.concat(this.walkTokens(cell.tokens, callback));
          }
          for (const row of tableToken.rows) {
            for (const cell of row) {
              values = values.concat(this.walkTokens(cell.tokens, callback));
            }
          }
          break;
        }
        case "list": {
          const listToken = token2;
          values = values.concat(this.walkTokens(listToken.items, callback));
          break;
        }
        default: {
          const genericToken = token2;
          if (this.defaults.extensions?.childTokens?.[genericToken.type]) {
            this.defaults.extensions.childTokens[genericToken.type].forEach((childTokens) => {
              values = values.concat(this.walkTokens(genericToken[childTokens], callback));
            });
          } else if (genericToken.tokens) {
            values = values.concat(this.walkTokens(genericToken.tokens, callback));
          }
        }
      }
    }
    return values;
  }
  use(...args) {
    const extensions = this.defaults.extensions || { renderers: {}, childTokens: {} };
    args.forEach((pack) => {
      const opts = { ...pack };
      opts.async = this.defaults.async || opts.async || false;
      if (pack.extensions) {
        pack.extensions.forEach((ext) => {
          if (!ext.name) {
            throw new Error("extension name required");
          }
          if ("renderer" in ext) {
            const prevRenderer = extensions.renderers[ext.name];
            if (prevRenderer) {
              extensions.renderers[ext.name] = function(...args2) {
                let ret = ext.renderer.apply(this, args2);
                if (ret === false) {
                  ret = prevRenderer.apply(this, args2);
                }
                return ret;
              };
            } else {
              extensions.renderers[ext.name] = ext.renderer;
            }
          }
          if ("tokenizer" in ext) {
            if (!ext.level || ext.level !== "block" && ext.level !== "inline") {
              throw new Error("extension level must be 'block' or 'inline'");
            }
            const extLevel = extensions[ext.level];
            if (extLevel) {
              extLevel.unshift(ext.tokenizer);
            } else {
              extensions[ext.level] = [ext.tokenizer];
            }
            if (ext.start) {
              if (ext.level === "block") {
                if (extensions.startBlock) {
                  extensions.startBlock.push(ext.start);
                } else {
                  extensions.startBlock = [ext.start];
                }
              } else if (ext.level === "inline") {
                if (extensions.startInline) {
                  extensions.startInline.push(ext.start);
                } else {
                  extensions.startInline = [ext.start];
                }
              }
            }
          }
          if ("childTokens" in ext && ext.childTokens) {
            extensions.childTokens[ext.name] = ext.childTokens;
          }
        });
        opts.extensions = extensions;
      }
      if (pack.renderer) {
        const renderer = this.defaults.renderer || new _Renderer(this.defaults);
        for (const prop in pack.renderer) {
          const rendererFunc = pack.renderer[prop];
          const rendererKey = prop;
          const prevRenderer = renderer[rendererKey];
          renderer[rendererKey] = (...args2) => {
            let ret = rendererFunc.apply(renderer, args2);
            if (ret === false) {
              ret = prevRenderer.apply(renderer, args2);
            }
            return ret || "";
          };
        }
        opts.renderer = renderer;
      }
      if (pack.tokenizer) {
        const tokenizer = this.defaults.tokenizer || new _Tokenizer(this.defaults);
        for (const prop in pack.tokenizer) {
          const tokenizerFunc = pack.tokenizer[prop];
          const tokenizerKey = prop;
          const prevTokenizer = tokenizer[tokenizerKey];
          tokenizer[tokenizerKey] = (...args2) => {
            let ret = tokenizerFunc.apply(tokenizer, args2);
            if (ret === false) {
              ret = prevTokenizer.apply(tokenizer, args2);
            }
            return ret;
          };
        }
        opts.tokenizer = tokenizer;
      }
      if (pack.hooks) {
        const hooks = this.defaults.hooks || new _Hooks();
        for (const prop in pack.hooks) {
          const hooksFunc = pack.hooks[prop];
          const hooksKey = prop;
          const prevHook = hooks[hooksKey];
          if (_Hooks.passThroughHooks.has(prop)) {
            hooks[hooksKey] = (arg) => {
              if (this.defaults.async) {
                return Promise.resolve(hooksFunc.call(hooks, arg)).then((ret2) => {
                  return prevHook.call(hooks, ret2);
                });
              }
              const ret = hooksFunc.call(hooks, arg);
              return prevHook.call(hooks, ret);
            };
          } else {
            hooks[hooksKey] = (...args2) => {
              let ret = hooksFunc.apply(hooks, args2);
              if (ret === false) {
                ret = prevHook.apply(hooks, args2);
              }
              return ret;
            };
          }
        }
        opts.hooks = hooks;
      }
      if (pack.walkTokens) {
        const walkTokens2 = this.defaults.walkTokens;
        const packWalktokens = pack.walkTokens;
        opts.walkTokens = function(token2) {
          let values = [];
          values.push(packWalktokens.call(this, token2));
          if (walkTokens2) {
            values = values.concat(walkTokens2.call(this, token2));
          }
          return values;
        };
      }
      this.defaults = { ...this.defaults, ...opts };
    });
    return this;
  }
  setOptions(opt) {
    this.defaults = { ...this.defaults, ...opt };
    return this;
  }
  #parseMarkdown(lexer2, parser2) {
    return (src, options2) => {
      const origOpt = { ...options2 };
      const opt = { ...this.defaults, ...origOpt };
      if (this.defaults.async === true && origOpt.async === false) {
        if (!opt.silent) {
          console.warn("marked(): The async option was set to true by an extension. The async: false option sent to parse will be ignored.");
        }
        opt.async = true;
      }
      const throwError = this.#onError(!!opt.silent, !!opt.async);
      if (typeof src === "undefined" || src === null) {
        return throwError(new Error("marked(): input parameter is undefined or null"));
      }
      if (typeof src !== "string") {
        return throwError(new Error("marked(): input parameter is of type " + Object.prototype.toString.call(src) + ", string expected"));
      }
      if (opt.hooks) {
        opt.hooks.options = opt;
      }
      if (opt.async) {
        return Promise.resolve(opt.hooks ? opt.hooks.preprocess(src) : src).then((src2) => lexer2(src2, opt)).then((tokens) => opt.walkTokens ? Promise.all(this.walkTokens(tokens, opt.walkTokens)).then(() => tokens) : tokens).then((tokens) => parser2(tokens, opt)).then((html) => opt.hooks ? opt.hooks.postprocess(html) : html).catch(throwError);
      }
      try {
        if (opt.hooks) {
          src = opt.hooks.preprocess(src);
        }
        const tokens = lexer2(src, opt);
        if (opt.walkTokens) {
          this.walkTokens(tokens, opt.walkTokens);
        }
        let html = parser2(tokens, opt);
        if (opt.hooks) {
          html = opt.hooks.postprocess(html);
        }
        return html;
      } catch (e) {
        return throwError(e);
      }
    };
  }
  #onError(silent, async) {
    return (e) => {
      e.message += "\nPlease report this to https://github.com/markedjs/marked.";
      if (silent) {
        const msg = "<p>An error occurred:</p><pre>" + escape(e.message + "", true) + "</pre>";
        if (async) {
          return Promise.resolve(msg);
        }
        return msg;
      }
      if (async) {
        return Promise.reject(e);
      }
      throw e;
    };
  }
};
var markedInstance = new Marked();
function marked(src, opt) {
  return markedInstance.parse(src, opt);
}
marked.options = marked.setOptions = function(options2) {
  markedInstance.setOptions(options2);
  marked.defaults = markedInstance.defaults;
  changeDefaults(marked.defaults);
  return marked;
};
marked.getDefaults = _getDefaults;
marked.defaults = _defaults;
marked.use = function(...args) {
  markedInstance.use(...args);
  marked.defaults = markedInstance.defaults;
  changeDefaults(marked.defaults);
  return marked;
};
marked.walkTokens = function(tokens, callback) {
  return markedInstance.walkTokens(tokens, callback);
};
marked.parseInline = markedInstance.parseInline;
marked.Parser = _Parser;
marked.parser = _Parser.parse;
marked.Renderer = _Renderer;
marked.TextRenderer = _TextRenderer;
marked.Lexer = _Lexer;
marked.lexer = _Lexer.lex;
marked.Tokenizer = _Tokenizer;
marked.Hooks = _Hooks;
marked.parse = marked;
var options = marked.options;
var setOptions = marked.setOptions;
var use = marked.use;
var walkTokens = marked.walkTokens;
var parseInline = marked.parseInline;
var parser = _Parser.parse;
var lexer = _Lexer.lex;

// index.ts
var sql_default = {
  name: "sql",
  // Everything except name is optional
  tokens: [
    {
      name: "db",
      color: "#d47131",
      description: "A reference to a SQL database",
      args: [
        {
          type: "history",
          key: "dbConnectionUrl",
          name: "dbConnectionUrl",
          description: "The connection URL for the database"
        }
      ],
      async hydrate(_, args, prompt) {
        const postgres = require_src();
        const parsed = parse_database_url_default(args.dbConnectionUrl);
        const sql = postgres(args.dbConnectionUrl);
        const allColumns = await sql`
          SELECT table_schema, table_name, column_name, data_type
          FROM information_schema.columns
          WHERE table_schema != 'pg_catalog' AND table_schema != 'information_schema'
          ORDER BY table_name, column_name;
        `;
        const groupedColumns = allColumns.reduce((acc, col) => {
          if (!acc[col.table_name]) {
            acc[col.table_name] = [];
          }
          acc[col.table_name].push(col);
          return acc;
        }, {});
        const tableDescriptionString = Object.entries(groupedColumns).map(([tableName, _columns]) => {
          const columns = _columns;
          return `${columns[0].table_schema ? columns[0].table_schema + "." : ""}${tableName} (Columns: ${columns.map((c) => `${c.column_name} [${c.data_type}]`).join(", ")})`;
        }).join("\n");
        const dbIdentifier = "the database at " + parsed.host + "/" + parsed.database;
        prompt.appendContextItem({
          content: tableDescriptionString,
          title: dbIdentifier + " contains these tables:",
          type: "text",
          metadata: {
            type: "database",
            connection: args.dbConnectionUrl
          }
        });
        prompt.appendText(dbIdentifier);
      },
      render(args) {
        const parsed = parse_database_url_default(args.dbConnectionUrl);
        return [parsed.host + "/" + parsed.database];
      }
    },
    {
      name: "table",
      color: "#d47131",
      description: "A reference to a table in a SQL database",
      args: [
        {
          type: "history",
          key: "dbConnectionUrl",
          name: "dbConnectionUrl",
          description: "The connection URL for the database"
        },
        {
          type: "custom",
          name: "tableName",
          description: "The name of the table",
          async handler(handle, args) {
            const postgres = require_src();
            const sql = postgres(args.dbConnectionUrl);
            const part = args.tableName;
            const tables = await sql`
              SELECT tablename, schemaname
              FROM pg_catalog.pg_tables
              WHERE schemaname != 'pg_catalog' AND 
                  schemaname != 'information_schema'
              ORDER BY CASE WHEN schemaname = 'public' THEN 1 ELSE 2 END, tablename;
            `;
            return tables.filter(
              (t) => part ? `${t.schemaname}.${t.tablename}`.includes(part) : true
            ).map((t) => ({
              name: t.tablename,
              value: `${t.schemaname}.${t.tablename} `,
              description: t.schemaname
            }));
          }
        }
      ],
      async hydrate(mainHandle, args, prompt) {
        const postgres = require_src();
        const sql = postgres(args.dbConnectionUrl);
        const [schema, table, _] = args.tableName.split(/\.(.*)/s);
        const columns = await sql`
          SELECT column_name, data_type
          FROM information_schema.columns
          WHERE table_schema = ${schema} AND table_name = ${table}
        `;
        const tableIdentifier = `the database table \`${schema !== "public" ? schema + "." : ""}${table}\``;
        prompt.appendContextItem({
          content: columns.map((c) => `${c.column_name} [${c.data_type}]`).join("\n"),
          title: tableIdentifier + " contains these columns:",
          type: "text",
          metadata: {
            type: "database",
            connection: args.dbConnectionUrl
          }
        });
        prompt.appendText(tableIdentifier);
      },
      render(args) {
        return [args.tableName];
      }
    }
  ],
  actions: [
    {
      name: "Query DB",
      description: "Write (& optionally run) a SQL query against a DB",
      color: "#d47131",
      icon: "chart-bar",
      args: [],
      async handler(handle, userPrompt) {
        handle.sendMessageToRenderer("new-message", {
          message: {
            sender: "user",
            content: userPrompt._json
          }
        });
        await userPrompt.hydrate(handle);
        const connection = userPrompt._context.find(
          (c) => c.metadata?.type === "database" && c.metadata?.connection
        )?.metadata.connection;
        if (!connection) {
          throw new Error(
            "No database connection URL provided. Please use /sql.db or /sql.table to refer to the database you'd like to query in your prompt."
          );
        }
        userPrompt.appendText(
          "\n\nYour output should be a single SQL query. Output only the query, in a code-block. Do not output anything outside of the code block. The query must be runnable as-is, against the tables/databased specified in the prompt."
        );
        const response = await handle.llm.chat.converse(
          [new HumanMessage(userPrompt.toString())],
          {
            callbacks: [
              {
                handleLLMNewToken: (token2) => handle.sendMessageToRenderer("new-token", token2),
                handleLLMError: (error) => {
                  throw new Error(error.message);
                }
              }
            ]
          }
        );
        handle.sendMessageToRenderer("new-message", {
          message: {
            sender: "ai",
            content: response.content
          },
          connection
        });
      }
    }
  ],
  handlers: {
    main: {
      "run-query": async (handle, { query, connection }) => {
        const postgres = require_src();
        const sql = postgres(connection);
        const results = await sql.unsafe(query);
        handle.sendMessageToRenderer("query-results", results);
      }
    },
    renderer: {
      "query-results": async (rendererHandle, results) => {
        rendererHandle.ui?.controls.setControls([
          {
            type: "data-table",
            data: results
          }
        ]);
      },
      "new-token": async (rendererHandle, token2) => rendererHandle.ui?.chat.setPartialMessage(
        (prev) => prev ? prev + token2 : token2
      ),
      "new-message": async (rendererHandle, { message, connection }) => {
        rendererHandle.ui?.chat.setPartialMessage(null);
        rendererHandle.ui?.chat.setHistory((prev) => [...prev, message]);
        if (message.sender === "ai" && connection) {
          const tokens = marked.lexer(message.content);
          const query = tokens.find((token2) => token2.type === "code");
          if (query && query.type === "code") {
            rendererHandle.ui?.controls.setControls([
              {
                type: "buttons",
                buttons: [
                  {
                    label: "Discard",
                    onClick: () => {
                      rendererHandle.ui?.controls.setControls([]);
                    }
                  },
                  {
                    label: "Run",
                    color: "primary",
                    onClick: () => {
                      rendererHandle.sendMessageToMain("run-query", {
                        query: query.text,
                        connection
                      });
                    }
                  }
                ]
              }
            ]);
          }
        }
      }
    }
  }
};
export {
  sql_default as default
};
