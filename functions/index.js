var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// boletin_sub.js
async function onRequestPost({ request, env }) {
  const formData = await request.formData().catch(() => null);
  if (!formData) return Response(JSON.stringify({ error: "Los datos introducidos inv\xE1lidos." }), { status: 400 });
  const nombre = String(formData.get("nombre") ?? "").trim();
  const correo = String(formData.get("email") ?? "").trim().toLowerCase();
  if (!nombre) {
    return new Response(JSON.stringify({ error: "Por favor, introduce el nombre" }), { status: 400 });
  }
  if (!correo) {
    return new Response(JSON.stringify({ error: "Por favor, introduce un correo v\xE1lido" }), { status: 400 });
  }
  try {
    await env.DB.prepare("INSERT INTO inscritos_boletin (nombre, correo) VALUES (?1, ?2)").bind(nombre, correo).run();
    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (err) {
    const msg = String(err?.message || "");
    if (msg.includes("UNIQUE")) {
      return new Response(JSON.stringify({ success: true }), { status: 200 });
    }
    return new Response(JSON.stringify({ error: "Se ha producido un error." }), { status: 500 });
  }
}
__name(onRequestPost, "onRequestPost");

// contact.js
async function onRequestPost2({ request, env }) {
  const url = new URL(request.url).origin;
  const formData = await request.formData();
  try {
    const response = await env.EMAIL.send({
      to: "carlosnacherabeledo@proton.me",
      from: { name: `Formulario de contacto de la web: ${formData.get("nombre")}`, email: "carlos@imprentanacher.es" },
      subject: `CONTACTO WEB: ${formData.get("asunto")}`,
      replyTo: formData.get("email"),
      text: formData.get("mensaje")
    });
    return new Response(
      JSON.stringify({
        success: true,
        emailId: response.messageId
      })
    );
  } catch (error) {
    if (error instanceof TypeError) {
      return new Response(
        JSON.stringify({
          success: false,
          error: error.message
        }),
        { status: 400 }
      );
    }
    console.error("Email sending failed:", error.code, error.message);
    switch (error.code) {
      case "E_SENDER_DOMAIN_NOT_AVAILABLE":
        return new Response(
          JSON.stringify({
            success: false,
            error: "Onboard your sender domain to Email Service first"
          }),
          { status: 400 }
        );
      case "E_RATE_LIMIT_EXCEEDED":
        return new Response(
          JSON.stringify({
            success: false,
            error: "Rate limit exceeded. Please try again later"
          }),
          { status: 429 }
        );
      default:
        return new Response(
          JSON.stringify({
            success: false,
            error: error.message
          }),
          { status: 500 }
        );
    }
  }
}
__name(onRequestPost2, "onRequestPost");

// contact_materiales.js
async function onRequestPost3({ request, env }) {
  const url = new URL(request.url).origin;
  const formData = await request.formData();
  try {
    const response = await env.EMAIL.send({
      to: "carlosnacherabeledo@proton.me",
      from: { name: `Formulario de donaci\xF3n de materiales de la web: ${formData.get("nombre")}`, email: "carlos@imprentanacher.es" },
      subject: `CONTACTO DONACI\xD3N DE MATERIALES: ${formData.get("asunto")}`,
      replyTo: formData.get("email"),
      text: `TEL\xC9FONO APORTADO: ${formData.get("telefono")}
MATERIAL QUE PUEDE DONAR:
${formData.get("mensaje")}`
    });
    return new Response(
      JSON.stringify({
        success: true,
        emailId: response.messageId
      })
    );
  } catch (error) {
    if (error instanceof TypeError) {
      return new Response(
        JSON.stringify({
          success: false,
          error: error.message
        }),
        { status: 400 }
      );
    }
    console.error("Email sending failed:", error.code, error.message);
    switch (error.code) {
      case "E_SENDER_DOMAIN_NOT_AVAILABLE":
        return new Response(
          JSON.stringify({
            success: false,
            error: "Onboard your sender domain to Email Service first"
          }),
          { status: 400 }
        );
      case "E_RATE_LIMIT_EXCEEDED":
        return new Response(
          JSON.stringify({
            success: false,
            error: "Rate limit exceeded. Please try again later"
          }),
          { status: 429 }
        );
      default:
        return new Response(
          JSON.stringify({
            success: false,
            error: error.message
          }),
          { status: 500 }
        );
    }
  }
}
__name(onRequestPost3, "onRequestPost");

// donate.js
async function onRequestPost4({ request, env }) {
  const url = new URL(request.url).origin;
  const params = new URLSearchParams({
    mode: "payment",
    success_url: `${url}/donaciones?success=true`,
    cancel_url: `${url}/donaciones?success=false`,
    locale: "auto",
    "adaptive_pricing[enabled]": true,
    "line_items[0][quantity]": 1,
    "line_items[0][price]": "price_1UYWTICNOpaMFlfC2vwyXCuc"
  });
  const res = await fetch("https://api.stripe.com/v1/checkout/sessions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${env.STRIPE_API_KEY}`
    },
    body: params
  });
  const session = await res.json();
  return Response.redirect(session.url, 303);
}
__name(onRequestPost4, "onRequestPost");

// donate_sub.js
async function onRequestPost5({ request, env }) {
  const url = new URL(request.url).origin;
  const formData = await request.formData();
  const params = new URLSearchParams({
    mode: "subscription",
    success_url: `${url}/donaciones?success=true`,
    cancel_url: `${url}/donaciones?success=false`,
    locale: "auto",
    "adaptive_pricing[enabled]": true,
    "line_items[0][quantity]": 1,
    "line_items[0][price]": formData.get("price")
  });
  const res = await fetch("https://api.stripe.com/v1/checkout/sessions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${env.STRIPE_API_KEY}`
    },
    body: params
  });
  const session = await res.json();
  console.log(session);
  return Response.redirect(session.url, 303);
}
__name(onRequestPost5, "onRequestPost");

// inscribir_musicasacra.js
var SEXOS = /* @__PURE__ */ new Set(["hombre", "mujer"]);
var NIVELES = /* @__PURE__ */ new Set(["poca", "media", "alta", "profesional", "nose"]);
var VOCES = /* @__PURE__ */ new Set(["soprano", "alto", "tenor", "bajo", "nose"]);
var CORO = /* @__PURE__ */ new Set(["si", "no"]);
async function onRequestPost6({ request, env }) {
  const url = new URL(request.url).origin;
  const formData = await request.formData().catch(() => null);
  if (!formData) {
    return new Response(JSON.stringify({ error: "Los datos introducidos son inv\xE1lidos." }), { status: 400 });
  }
  const nombre = String(formData.get("nombre") ?? "").trim();
  const apellidos = String(formData.get("apellidos") ?? "").trim();
  const correo = String(formData.get("email") ?? "").trim().toLowerCase();
  const telefono = String(formData.get("tel") ?? "").trim();
  const edad = Number(formData.get("edad"));
  const sexo = String(formData.get("sexo") ?? "").trim();
  const nivel = String(formData.get("nivel") ?? "").trim();
  const voz = String(formData.get("voz") ?? "").trim();
  const coro = String(formData.get("coro") ?? "").trim();
  const donacion = Number(String(formData.get("donacion") ?? "").trim());
  const intolerancia = String(formData.get("intolerancia") ?? "").trim() || null;
  if (!nombre) {
    return new Response(JSON.stringify({ error: "Por favor, introduce el nombre." }), { status: 400 });
  }
  if (!apellidos) {
    return new Response(JSON.stringify({ error: "Por favor, introduce los apellidos." }), { status: 400 });
  }
  if (!correo || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) {
    return new Response(JSON.stringify({ error: "Por favor, introduce un correo v\xE1lido." }), { status: 400 });
  }
  console.log(donacion);
  if (!Number.isFinite(donacion) || donacion < 0) {
    return new Response(JSON.stringify({ error: "La donaci\xF3n m\xEDnima es de 0 \u20AC." }), { status: 400 });
  }
  if (!telefono) {
    return new Response(JSON.stringify({ error: "Por favor, introduce un tel\xE9fono." }), { status: 400 });
  }
  if (!Number.isInteger(edad) || edad < 0 || edad > 120) {
    return new Response(JSON.stringify({ error: "Por favor, introduce una edad v\xE1lida." }), { status: 400 });
  }
  if (!SEXOS.has(sexo) || !NIVELES.has(nivel) || !VOCES.has(voz) || !CORO.has(coro)) {
    return new Response(JSON.stringify({ error: "Selecciona opciones v\xE1lidas en el formulario." }), { status: 400 });
  }
  try {
    const unitAmount = Math.round(85 + donacion * 100);
    const params = new URLSearchParams({
      mode: "payment",
      success_url: `${url}/musicasacra?success=true`,
      cancel_url: `${url}/musicasacra?success=false`,
      locale: "auto",
      "adaptive_pricing[enabled]": true,
      "line_items[0][quantity]": 1,
      "line_items[0][price_data][currency]": "eur",
      "line_items[0][price_data][unit_amount]": String(unitAmount),
      "line_items[0][price_data][product_data][name]": "Donaci\xF3n"
    });
    const res = await fetch("https://api.stripe.com/v1/checkout/sessions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${env.STRIPE_API_KEY}`
      },
      body: params
    });
    const session = await res.json();
    console.log(session);
    await env.DB.prepare("INSERT INTO inscritos_musicasacra (nombre, apellidos, correo, telefono, edad, sexo, nivel, voz, coro, intolerancia) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10)").bind(nombre, apellidos, correo, telefono, edad, sexo, nivel, voz, coro, intolerancia).run();
    return Response.redirect(session.url, 303);
  } catch (err) {
    const msg = String(err?.message || "");
    return new Response(JSON.stringify({ error: "Se ha producido un error." }), { status: 500 });
  }
}
__name(onRequestPost6, "onRequestPost");

// inscribir_retiros.js
async function onRequestPost7({ request, env }) {
  const url = new URL(request.url).origin;
  const formData = await request.formData().catch(() => null);
  if (!formData) {
    return new Response(JSON.stringify({ error: "Los datos introducidos son inv\xE1lidos." }), { status: 400 });
  }
  const nombre = String(formData.get("nombre") ?? "").trim();
  const apellidos = String(formData.get("apellidos") ?? "").trim();
  const correo = String(formData.get("email") ?? "").trim().toLowerCase();
  const edad = Number(formData.get("edad"));
  const intolerancia = String(formData.get("intolerancia") ?? "").trim() || null;
  const donacion = Number(formData.get("donacion"));
  const habitacion = String(formData.get("habitacion") ?? "").trim() || null;
  if (!nombre) {
    return new Response(JSON.stringify({ error: "Por favor, introduce el nombre." }), { status: 400 });
  }
  if (!apellidos) {
    return new Response(JSON.stringify({ error: "Por favor, introduce los apellidos." }), { status: 400 });
  }
  if (!correo || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) {
    return new Response(JSON.stringify({ error: "Por favor, introduce un correo v\xE1lido." }), { status: 400 });
  }
  if (!Number.isInteger(edad) || edad < 0 || edad > 120) {
    return new Response(JSON.stringify({ error: "Por favor, introduce una edad v\xE1lida." }), { status: 400 });
  }
  if (!Number.isFinite(donacion) || donacion < 1) {
    return new Response(JSON.stringify({ error: "La donaci\xF3n m\xEDnima es de 1 \u20AC." }), { status: 400 });
  }
  if (formData.get("casa") !== "1" || formData.get("checkin") !== "1" || formData.get("privacidad") !== "1") {
    return new Response(JSON.stringify({ error: "Debes confirmar el pago, el check-in y la pol\xEDtica de privacidad." }), { status: 400 });
  }
  try {
    const unitAmount = Math.round(donacion * 100);
    const params = new URLSearchParams({
      mode: "payment",
      success_url: `${url}/retiros?success=true`,
      cancel_url: `${url}/retiros?success=false`,
      locale: "auto",
      "adaptive_pricing[enabled]": true,
      "line_items[0][quantity]": 1,
      "line_items[0][price_data][currency]": "eur",
      "line_items[0][price_data][unit_amount]": String(unitAmount),
      "line_items[0][price_data][product_data][name]": "Donaci\xF3n"
    });
    const res = await fetch("https://api.stripe.com/v1/checkout/sessions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${env.STRIPE_API_KEY}`
      },
      body: params
    });
    const session = await res.json();
    await env.DB.prepare("INSERT INTO inscritos_retiros (nombre, apellidos, correo, edad, intolerancia, donacion, habitacion) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)").bind(nombre, apellidos, correo, edad, intolerancia, donacion, habitacion).run();
    return Response.redirect(session.url, 303);
  } catch (err) {
    const msg = String(err?.message || "");
    return new Response(JSON.stringify({ error: "Se ha producido un error." }), { status: 500 });
  }
}
__name(onRequestPost7, "onRequestPost");

// ../.wrangler/tmp/pages-SKrPlF/functionsRoutes-0.42002962635861396.mjs
var routes = [
  {
    routePath: "/boletin_sub",
    mountPath: "/",
    method: "POST",
    middlewares: [],
    modules: [onRequestPost]
  },
  {
    routePath: "/contact",
    mountPath: "/",
    method: "POST",
    middlewares: [],
    modules: [onRequestPost2]
  },
  {
    routePath: "/contact_materiales",
    mountPath: "/",
    method: "POST",
    middlewares: [],
    modules: [onRequestPost3]
  },
  {
    routePath: "/donate",
    mountPath: "/",
    method: "POST",
    middlewares: [],
    modules: [onRequestPost4]
  },
  {
    routePath: "/donate_sub",
    mountPath: "/",
    method: "POST",
    middlewares: [],
    modules: [onRequestPost5]
  },
  {
    routePath: "/inscribir_musicasacra",
    mountPath: "/",
    method: "POST",
    middlewares: [],
    modules: [onRequestPost6]
  },
  {
    routePath: "/inscribir_retiros",
    mountPath: "/",
    method: "POST",
    middlewares: [],
    modules: [onRequestPost7]
  }
];

// ../../../../../../../../usr/lib/node_modules/wrangler/node_modules/path-to-regexp/dist.es2015/index.js
function lexer(str) {
  var tokens = [];
  var i = 0;
  while (i < str.length) {
    var char = str[i];
    if (char === "*" || char === "+" || char === "?") {
      tokens.push({ type: "MODIFIER", index: i, value: str[i++] });
      continue;
    }
    if (char === "\\") {
      tokens.push({ type: "ESCAPED_CHAR", index: i++, value: str[i++] });
      continue;
    }
    if (char === "{") {
      tokens.push({ type: "OPEN", index: i, value: str[i++] });
      continue;
    }
    if (char === "}") {
      tokens.push({ type: "CLOSE", index: i, value: str[i++] });
      continue;
    }
    if (char === ":") {
      var name = "";
      var j = i + 1;
      while (j < str.length) {
        var code = str.charCodeAt(j);
        if (
          // `0-9`
          code >= 48 && code <= 57 || // `A-Z`
          code >= 65 && code <= 90 || // `a-z`
          code >= 97 && code <= 122 || // `_`
          code === 95
        ) {
          name += str[j++];
          continue;
        }
        break;
      }
      if (!name)
        throw new TypeError("Missing parameter name at ".concat(i));
      tokens.push({ type: "NAME", index: i, value: name });
      i = j;
      continue;
    }
    if (char === "(") {
      var count = 1;
      var pattern = "";
      var j = i + 1;
      if (str[j] === "?") {
        throw new TypeError('Pattern cannot start with "?" at '.concat(j));
      }
      while (j < str.length) {
        if (str[j] === "\\") {
          pattern += str[j++] + str[j++];
          continue;
        }
        if (str[j] === ")") {
          count--;
          if (count === 0) {
            j++;
            break;
          }
        } else if (str[j] === "(") {
          count++;
          if (str[j + 1] !== "?") {
            throw new TypeError("Capturing groups are not allowed at ".concat(j));
          }
        }
        pattern += str[j++];
      }
      if (count)
        throw new TypeError("Unbalanced pattern at ".concat(i));
      if (!pattern)
        throw new TypeError("Missing pattern at ".concat(i));
      tokens.push({ type: "PATTERN", index: i, value: pattern });
      i = j;
      continue;
    }
    tokens.push({ type: "CHAR", index: i, value: str[i++] });
  }
  tokens.push({ type: "END", index: i, value: "" });
  return tokens;
}
__name(lexer, "lexer");
function parse(str, options) {
  if (options === void 0) {
    options = {};
  }
  var tokens = lexer(str);
  var _a = options.prefixes, prefixes = _a === void 0 ? "./" : _a, _b = options.delimiter, delimiter = _b === void 0 ? "/#?" : _b;
  var result = [];
  var key = 0;
  var i = 0;
  var path = "";
  var tryConsume = /* @__PURE__ */ __name(function(type) {
    if (i < tokens.length && tokens[i].type === type)
      return tokens[i++].value;
  }, "tryConsume");
  var mustConsume = /* @__PURE__ */ __name(function(type) {
    var value2 = tryConsume(type);
    if (value2 !== void 0)
      return value2;
    var _a2 = tokens[i], nextType = _a2.type, index = _a2.index;
    throw new TypeError("Unexpected ".concat(nextType, " at ").concat(index, ", expected ").concat(type));
  }, "mustConsume");
  var consumeText = /* @__PURE__ */ __name(function() {
    var result2 = "";
    var value2;
    while (value2 = tryConsume("CHAR") || tryConsume("ESCAPED_CHAR")) {
      result2 += value2;
    }
    return result2;
  }, "consumeText");
  var isSafe = /* @__PURE__ */ __name(function(value2) {
    for (var _i = 0, delimiter_1 = delimiter; _i < delimiter_1.length; _i++) {
      var char2 = delimiter_1[_i];
      if (value2.indexOf(char2) > -1)
        return true;
    }
    return false;
  }, "isSafe");
  var safePattern = /* @__PURE__ */ __name(function(prefix2) {
    var prev = result[result.length - 1];
    var prevText = prefix2 || (prev && typeof prev === "string" ? prev : "");
    if (prev && !prevText) {
      throw new TypeError('Must have text between two parameters, missing text after "'.concat(prev.name, '"'));
    }
    if (!prevText || isSafe(prevText))
      return "[^".concat(escapeString(delimiter), "]+?");
    return "(?:(?!".concat(escapeString(prevText), ")[^").concat(escapeString(delimiter), "])+?");
  }, "safePattern");
  while (i < tokens.length) {
    var char = tryConsume("CHAR");
    var name = tryConsume("NAME");
    var pattern = tryConsume("PATTERN");
    if (name || pattern) {
      var prefix = char || "";
      if (prefixes.indexOf(prefix) === -1) {
        path += prefix;
        prefix = "";
      }
      if (path) {
        result.push(path);
        path = "";
      }
      result.push({
        name: name || key++,
        prefix,
        suffix: "",
        pattern: pattern || safePattern(prefix),
        modifier: tryConsume("MODIFIER") || ""
      });
      continue;
    }
    var value = char || tryConsume("ESCAPED_CHAR");
    if (value) {
      path += value;
      continue;
    }
    if (path) {
      result.push(path);
      path = "";
    }
    var open = tryConsume("OPEN");
    if (open) {
      var prefix = consumeText();
      var name_1 = tryConsume("NAME") || "";
      var pattern_1 = tryConsume("PATTERN") || "";
      var suffix = consumeText();
      mustConsume("CLOSE");
      result.push({
        name: name_1 || (pattern_1 ? key++ : ""),
        pattern: name_1 && !pattern_1 ? safePattern(prefix) : pattern_1,
        prefix,
        suffix,
        modifier: tryConsume("MODIFIER") || ""
      });
      continue;
    }
    mustConsume("END");
  }
  return result;
}
__name(parse, "parse");
function match(str, options) {
  var keys = [];
  var re = pathToRegexp(str, keys, options);
  return regexpToFunction(re, keys, options);
}
__name(match, "match");
function regexpToFunction(re, keys, options) {
  if (options === void 0) {
    options = {};
  }
  var _a = options.decode, decode = _a === void 0 ? function(x) {
    return x;
  } : _a;
  return function(pathname) {
    var m = re.exec(pathname);
    if (!m)
      return false;
    var path = m[0], index = m.index;
    var params = /* @__PURE__ */ Object.create(null);
    var _loop_1 = /* @__PURE__ */ __name(function(i2) {
      if (m[i2] === void 0)
        return "continue";
      var key = keys[i2 - 1];
      if (key.modifier === "*" || key.modifier === "+") {
        params[key.name] = m[i2].split(key.prefix + key.suffix).map(function(value) {
          return decode(value, key);
        });
      } else {
        params[key.name] = decode(m[i2], key);
      }
    }, "_loop_1");
    for (var i = 1; i < m.length; i++) {
      _loop_1(i);
    }
    return { path, index, params };
  };
}
__name(regexpToFunction, "regexpToFunction");
function escapeString(str) {
  return str.replace(/([.+*?=^!:${}()[\]|/\\])/g, "\\$1");
}
__name(escapeString, "escapeString");
function flags(options) {
  return options && options.sensitive ? "" : "i";
}
__name(flags, "flags");
function regexpToRegexp(path, keys) {
  if (!keys)
    return path;
  var groupsRegex = /\((?:\?<(.*?)>)?(?!\?)/g;
  var index = 0;
  var execResult = groupsRegex.exec(path.source);
  while (execResult) {
    keys.push({
      // Use parenthesized substring match if available, index otherwise
      name: execResult[1] || index++,
      prefix: "",
      suffix: "",
      modifier: "",
      pattern: ""
    });
    execResult = groupsRegex.exec(path.source);
  }
  return path;
}
__name(regexpToRegexp, "regexpToRegexp");
function arrayToRegexp(paths, keys, options) {
  var parts = paths.map(function(path) {
    return pathToRegexp(path, keys, options).source;
  });
  return new RegExp("(?:".concat(parts.join("|"), ")"), flags(options));
}
__name(arrayToRegexp, "arrayToRegexp");
function stringToRegexp(path, keys, options) {
  return tokensToRegexp(parse(path, options), keys, options);
}
__name(stringToRegexp, "stringToRegexp");
function tokensToRegexp(tokens, keys, options) {
  if (options === void 0) {
    options = {};
  }
  var _a = options.strict, strict = _a === void 0 ? false : _a, _b = options.start, start = _b === void 0 ? true : _b, _c = options.end, end = _c === void 0 ? true : _c, _d = options.encode, encode = _d === void 0 ? function(x) {
    return x;
  } : _d, _e = options.delimiter, delimiter = _e === void 0 ? "/#?" : _e, _f = options.endsWith, endsWith = _f === void 0 ? "" : _f;
  var endsWithRe = "[".concat(escapeString(endsWith), "]|$");
  var delimiterRe = "[".concat(escapeString(delimiter), "]");
  var route = start ? "^" : "";
  for (var _i = 0, tokens_1 = tokens; _i < tokens_1.length; _i++) {
    var token = tokens_1[_i];
    if (typeof token === "string") {
      route += escapeString(encode(token));
    } else {
      var prefix = escapeString(encode(token.prefix));
      var suffix = escapeString(encode(token.suffix));
      if (token.pattern) {
        if (keys)
          keys.push(token);
        if (prefix || suffix) {
          if (token.modifier === "+" || token.modifier === "*") {
            var mod = token.modifier === "*" ? "?" : "";
            route += "(?:".concat(prefix, "((?:").concat(token.pattern, ")(?:").concat(suffix).concat(prefix, "(?:").concat(token.pattern, "))*)").concat(suffix, ")").concat(mod);
          } else {
            route += "(?:".concat(prefix, "(").concat(token.pattern, ")").concat(suffix, ")").concat(token.modifier);
          }
        } else {
          if (token.modifier === "+" || token.modifier === "*") {
            throw new TypeError('Can not repeat "'.concat(token.name, '" without a prefix and suffix'));
          }
          route += "(".concat(token.pattern, ")").concat(token.modifier);
        }
      } else {
        route += "(?:".concat(prefix).concat(suffix, ")").concat(token.modifier);
      }
    }
  }
  if (end) {
    if (!strict)
      route += "".concat(delimiterRe, "?");
    route += !options.endsWith ? "$" : "(?=".concat(endsWithRe, ")");
  } else {
    var endToken = tokens[tokens.length - 1];
    var isEndDelimited = typeof endToken === "string" ? delimiterRe.indexOf(endToken[endToken.length - 1]) > -1 : endToken === void 0;
    if (!strict) {
      route += "(?:".concat(delimiterRe, "(?=").concat(endsWithRe, "))?");
    }
    if (!isEndDelimited) {
      route += "(?=".concat(delimiterRe, "|").concat(endsWithRe, ")");
    }
  }
  return new RegExp(route, flags(options));
}
__name(tokensToRegexp, "tokensToRegexp");
function pathToRegexp(path, keys, options) {
  if (path instanceof RegExp)
    return regexpToRegexp(path, keys);
  if (Array.isArray(path))
    return arrayToRegexp(path, keys, options);
  return stringToRegexp(path, keys, options);
}
__name(pathToRegexp, "pathToRegexp");

// ../../../../../../../../usr/lib/node_modules/wrangler/templates/pages-template-worker.ts
var escapeRegex = /[.+?^${}()|[\]\\]/g;
function* executeRequest(request) {
  const requestPath = new URL(request.url).pathname;
  for (const route of [...routes].reverse()) {
    if (route.method && route.method !== request.method) {
      continue;
    }
    const routeMatcher = match(route.routePath.replace(escapeRegex, "\\$&"), {
      end: false
    });
    const mountMatcher = match(route.mountPath.replace(escapeRegex, "\\$&"), {
      end: false
    });
    const matchResult = routeMatcher(requestPath);
    const mountMatchResult = mountMatcher(requestPath);
    if (matchResult && mountMatchResult) {
      for (const handler of route.middlewares.flat()) {
        yield {
          handler,
          params: matchResult.params,
          path: mountMatchResult.path
        };
      }
    }
  }
  for (const route of routes) {
    if (route.method && route.method !== request.method) {
      continue;
    }
    const routeMatcher = match(route.routePath.replace(escapeRegex, "\\$&"), {
      end: true
    });
    const mountMatcher = match(route.mountPath.replace(escapeRegex, "\\$&"), {
      end: false
    });
    const matchResult = routeMatcher(requestPath);
    const mountMatchResult = mountMatcher(requestPath);
    if (matchResult && mountMatchResult && route.modules.length) {
      for (const handler of route.modules.flat()) {
        yield {
          handler,
          params: matchResult.params,
          path: matchResult.path
        };
      }
      break;
    }
  }
}
__name(executeRequest, "executeRequest");
var pages_template_worker_default = {
  async fetch(originalRequest, env, workerContext) {
    let request = originalRequest;
    const handlerIterator = executeRequest(request);
    let data = {};
    let isFailOpen = false;
    const next = /* @__PURE__ */ __name(async (input, init) => {
      if (input !== void 0) {
        let url = input;
        if (typeof input === "string") {
          url = new URL(input, request.url).toString();
        }
        request = new Request(url, init);
      }
      const result = handlerIterator.next();
      if (result.done === false) {
        const { handler, params, path } = result.value;
        const context = {
          request: new Request(request.clone()),
          functionPath: path,
          next,
          params,
          get data() {
            return data;
          },
          set data(value) {
            if (typeof value !== "object" || value === null) {
              throw new Error("context.data must be an object");
            }
            data = value;
          },
          env,
          waitUntil: workerContext.waitUntil.bind(workerContext),
          passThroughOnException: /* @__PURE__ */ __name(() => {
            isFailOpen = true;
          }, "passThroughOnException")
        };
        const response = await handler(context);
        if (!(response instanceof Response)) {
          throw new Error("Your Pages function should return a Response");
        }
        return cloneResponse(response);
      } else if ("ASSETS") {
        const response = await env["ASSETS"].fetch(request);
        return cloneResponse(response);
      } else {
        const response = await fetch(request);
        return cloneResponse(response);
      }
    }, "next");
    try {
      return await next();
    } catch (error) {
      if (isFailOpen) {
        const response = await env["ASSETS"].fetch(request);
        return cloneResponse(response);
      }
      throw error;
    }
  }
};
var cloneResponse = /* @__PURE__ */ __name((response) => (
  // https://fetch.spec.whatwg.org/#null-body-status
  new Response(
    [101, 204, 205, 304].includes(response.status) ? null : response.body,
    response
  )
), "cloneResponse");
export {
  pages_template_worker_default as default
};
