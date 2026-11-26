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
    const db_res = await env.DB.prepare("INSERT INTO inscritos_musicasacra (nombre, apellidos, correo, telefono, edad, sexo, nivel, voz, coro, intolerancia) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10)").bind(nombre, apellidos, correo, telefono, edad, sexo, nivel, voz, coro, intolerancia).run();
    const unitAmount = Math.round(8500 + donacion * 100);
    const inscritoId = db_res.meta.last_row_id;
    const expiresAt = Math.floor(Date.now() / 1e3) + 3600;
    const params = new URLSearchParams({
      mode: "payment",
      success_url: `${url}/musicasacra?success=true`,
      cancel_url: `${url}/musicasacra?success=false`,
      locale: "auto",
      expires_at: String(expiresAt),
      "adaptive_pricing[enabled]": true,
      "metadata[inscrito_id]": String(inscritoId),
      "metadata[tipo]": "retiros",
      "line_items[0][quantity]": 1,
      "line_items[0][price_data][currency]": "eur",
      "line_items[0][price_data][unit_amount]": String(unitAmount),
      "line_items[0][price_data][product_data][name]": "Donaci\xF3n"
    });
    const stripe_res = await fetch("https://api.stripe.com/v1/checkout/sessions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${env.STRIPE_API_KEY}`
      },
      body: params
    });
    console.log(stripe_res);
    const session = await stripe_res.json();
    if (!stripe_res.ok || !session.url) {
      throw new Error();
    }
    console.log(session);
    return Response.json({ url: session.url });
  } catch (err) {
    const msg = String(err?.message || "");
    return new Response(JSON.stringify({ error: msg }), { status: 500 });
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
    const db_res = await env.DB.prepare("INSERT INTO inscritos_retiros (nombre, apellidos, correo, edad, intolerancia, donacion, habitacion) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)").bind(nombre, apellidos, correo, edad, intolerancia, donacion, habitacion).run();
    const unitAmount = Math.round(donacion * 100);
    const inscritoId = db_res.meta.last_row_id;
    const expiresAt = Math.floor(Date.now() / 1e3) + 3600;
    const params = new URLSearchParams({
      mode: "payment",
      success_url: `${url}/retiros?success=true`,
      cancel_url: `${url}/retiros?success=false`,
      locale: "auto",
      expires_at: String(expiresAt),
      "adaptive_pricing[enabled]": true,
      "metadata[inscrito_id]": String(inscritoId),
      "metadata[tipo]": "retiros",
      "line_items[0][quantity]": 1,
      "line_items[0][price_data][currency]": "eur",
      "line_items[0][price_data][unit_amount]": String(unitAmount),
      "line_items[0][price_data][product_data][name]": "Donaci\xF3n"
    });
    const stripe_res = await fetch("https://api.stripe.com/v1/checkout/sessions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${env.STRIPE_API_KEY}`
      },
      body: params
    });
    const session = await stripe_res.json();
    if (!stripe_res.ok || !session.url) {
      throw new Error();
    }
    console.log(session);
    return Response.json({ url: session.url });
  } catch (err) {
    const msg = String(err?.message || "");
    return new Response(JSON.stringify({ error: msg }), { status: 500 });
  }
}
__name(onRequestPost7, "onRequestPost");

// ../node_modules/aws4fetch/dist/aws4fetch.esm.mjs
var encoder = new TextEncoder();
var HOST_SERVICES = {
  appstream2: "appstream",
  cloudhsmv2: "cloudhsm",
  email: "ses",
  marketplace: "aws-marketplace",
  mobile: "AWSMobileHubService",
  pinpoint: "mobiletargeting",
  queue: "sqs",
  "git-codecommit": "codecommit",
  "mturk-requester-sandbox": "mturk-requester",
  "personalize-runtime": "personalize"
};
var UNSIGNABLE_HEADERS = /* @__PURE__ */ new Set([
  "authorization",
  "content-type",
  "content-length",
  "user-agent",
  "presigned-expires",
  "expect",
  "x-amzn-trace-id",
  "range",
  "connection"
]);
var AwsClient = class {
  static {
    __name(this, "AwsClient");
  }
  constructor({ accessKeyId, secretAccessKey, sessionToken, service, region, cache, retries, initRetryMs }) {
    if (accessKeyId == null) throw new TypeError("accessKeyId is a required option");
    if (secretAccessKey == null) throw new TypeError("secretAccessKey is a required option");
    this.accessKeyId = accessKeyId;
    this.secretAccessKey = secretAccessKey;
    this.sessionToken = sessionToken;
    this.service = service;
    this.region = region;
    this.cache = cache || /* @__PURE__ */ new Map();
    this.retries = retries != null ? retries : 10;
    this.initRetryMs = initRetryMs || 50;
  }
  async sign(input, init) {
    if (input instanceof Request) {
      const { method, url, headers, body } = input;
      init = Object.assign({ method, url, headers }, init);
      if (init.body == null && headers.has("Content-Type")) {
        init.body = body != null && headers.has("X-Amz-Content-Sha256") ? body : await input.clone().arrayBuffer();
      }
      input = url;
    }
    const signer = new AwsV4Signer(Object.assign({ url: input.toString() }, init, this, init && init.aws));
    const signed = Object.assign({}, init, await signer.sign());
    delete signed.aws;
    try {
      return new Request(signed.url.toString(), signed);
    } catch (e) {
      if (e instanceof TypeError) {
        return new Request(signed.url.toString(), Object.assign({ duplex: "half" }, signed));
      }
      throw e;
    }
  }
  async fetch(input, init) {
    for (let i = 0; i <= this.retries; i++) {
      const fetched = fetch(await this.sign(input, init));
      if (i === this.retries) {
        return fetched;
      }
      const res = await fetched;
      if (res.status < 500 && res.status !== 429) {
        return res;
      }
      await new Promise((resolve) => setTimeout(resolve, Math.random() * this.initRetryMs * Math.pow(2, i)));
    }
    throw new Error("An unknown error occurred, ensure retries is not negative");
  }
};
var AwsV4Signer = class {
  static {
    __name(this, "AwsV4Signer");
  }
  constructor({ method, url, headers, body, accessKeyId, secretAccessKey, sessionToken, service, region, cache, datetime, signQuery, appendSessionToken, allHeaders, singleEncode }) {
    if (url == null) throw new TypeError("url is a required option");
    if (accessKeyId == null) throw new TypeError("accessKeyId is a required option");
    if (secretAccessKey == null) throw new TypeError("secretAccessKey is a required option");
    this.method = method || (body ? "POST" : "GET");
    this.url = new URL(url);
    this.headers = new Headers(headers || {});
    this.body = body;
    this.accessKeyId = accessKeyId;
    this.secretAccessKey = secretAccessKey;
    this.sessionToken = sessionToken;
    let guessedService, guessedRegion;
    if (!service || !region) {
      [guessedService, guessedRegion] = guessServiceRegion(this.url, this.headers);
    }
    this.service = service || guessedService || "";
    this.region = region || guessedRegion || "us-east-1";
    this.cache = cache || /* @__PURE__ */ new Map();
    this.datetime = datetime || (/* @__PURE__ */ new Date()).toISOString().replace(/[:-]|\.\d{3}/g, "");
    this.signQuery = signQuery;
    this.appendSessionToken = appendSessionToken || this.service === "iotdevicegateway";
    this.headers.delete("Host");
    if (this.service === "s3" && !this.signQuery && !this.headers.has("X-Amz-Content-Sha256")) {
      this.headers.set("X-Amz-Content-Sha256", "UNSIGNED-PAYLOAD");
    }
    const params = this.signQuery ? this.url.searchParams : this.headers;
    params.set("X-Amz-Date", this.datetime);
    if (this.sessionToken && !this.appendSessionToken) {
      params.set("X-Amz-Security-Token", this.sessionToken);
    }
    this.signableHeaders = ["host", ...this.headers.keys()].filter((header) => allHeaders || !UNSIGNABLE_HEADERS.has(header)).sort();
    this.signedHeaders = this.signableHeaders.join(";");
    this.canonicalHeaders = this.signableHeaders.map((header) => header + ":" + (header === "host" ? this.url.host : (this.headers.get(header) || "").replace(/\s+/g, " "))).join("\n");
    this.credentialString = [this.datetime.slice(0, 8), this.region, this.service, "aws4_request"].join("/");
    if (this.signQuery) {
      if (this.service === "s3" && !params.has("X-Amz-Expires")) {
        params.set("X-Amz-Expires", "86400");
      }
      params.set("X-Amz-Algorithm", "AWS4-HMAC-SHA256");
      params.set("X-Amz-Credential", this.accessKeyId + "/" + this.credentialString);
      params.set("X-Amz-SignedHeaders", this.signedHeaders);
    }
    if (this.service === "s3") {
      try {
        this.encodedPath = decodeURIComponent(this.url.pathname.replace(/\+/g, " "));
      } catch (e) {
        this.encodedPath = this.url.pathname;
      }
    } else {
      this.encodedPath = this.url.pathname.replace(/\/+/g, "/");
    }
    if (!singleEncode) {
      this.encodedPath = encodeURIComponent(this.encodedPath).replace(/%2F/g, "/");
    }
    this.encodedPath = encodeRfc3986(this.encodedPath);
    const seenKeys = /* @__PURE__ */ new Set();
    this.encodedSearch = [...this.url.searchParams].filter(([k]) => {
      if (!k) return false;
      if (this.service === "s3") {
        if (seenKeys.has(k)) return false;
        seenKeys.add(k);
      }
      return true;
    }).map((pair) => pair.map((p) => encodeRfc3986(encodeURIComponent(p)))).sort(([k1, v1], [k2, v2]) => k1 < k2 ? -1 : k1 > k2 ? 1 : v1 < v2 ? -1 : v1 > v2 ? 1 : 0).map((pair) => pair.join("=")).join("&");
  }
  async sign() {
    if (this.signQuery) {
      this.url.searchParams.set("X-Amz-Signature", await this.signature());
      if (this.sessionToken && this.appendSessionToken) {
        this.url.searchParams.set("X-Amz-Security-Token", this.sessionToken);
      }
    } else {
      this.headers.set("Authorization", await this.authHeader());
    }
    return {
      method: this.method,
      url: this.url,
      headers: this.headers,
      body: this.body
    };
  }
  async authHeader() {
    return [
      "AWS4-HMAC-SHA256 Credential=" + this.accessKeyId + "/" + this.credentialString,
      "SignedHeaders=" + this.signedHeaders,
      "Signature=" + await this.signature()
    ].join(", ");
  }
  async signature() {
    const date = this.datetime.slice(0, 8);
    const cacheKey = [this.secretAccessKey, date, this.region, this.service].join();
    let kCredentials = this.cache.get(cacheKey);
    if (!kCredentials) {
      const kDate = await hmac("AWS4" + this.secretAccessKey, date);
      const kRegion = await hmac(kDate, this.region);
      const kService = await hmac(kRegion, this.service);
      kCredentials = await hmac(kService, "aws4_request");
      this.cache.set(cacheKey, kCredentials);
    }
    return buf2hex(await hmac(kCredentials, await this.stringToSign()));
  }
  async stringToSign() {
    return [
      "AWS4-HMAC-SHA256",
      this.datetime,
      this.credentialString,
      buf2hex(await hash(await this.canonicalString()))
    ].join("\n");
  }
  async canonicalString() {
    return [
      this.method.toUpperCase(),
      this.encodedPath,
      this.encodedSearch,
      this.canonicalHeaders + "\n",
      this.signedHeaders,
      await this.hexBodyHash()
    ].join("\n");
  }
  async hexBodyHash() {
    let hashHeader = this.headers.get("X-Amz-Content-Sha256") || (this.service === "s3" && this.signQuery ? "UNSIGNED-PAYLOAD" : null);
    if (hashHeader == null) {
      if (this.body && typeof this.body !== "string" && !("byteLength" in this.body)) {
        throw new Error("body must be a string, ArrayBuffer or ArrayBufferView, unless you include the X-Amz-Content-Sha256 header");
      }
      hashHeader = buf2hex(await hash(this.body || ""));
    }
    return hashHeader;
  }
};
async function hmac(key, string) {
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    typeof key === "string" ? encoder.encode(key) : key,
    { name: "HMAC", hash: { name: "SHA-256" } },
    false,
    ["sign"]
  );
  return crypto.subtle.sign("HMAC", cryptoKey, encoder.encode(string));
}
__name(hmac, "hmac");
async function hash(content) {
  return crypto.subtle.digest("SHA-256", typeof content === "string" ? encoder.encode(content) : content);
}
__name(hash, "hash");
var HEX_CHARS = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "a", "b", "c", "d", "e", "f"];
function buf2hex(arrayBuffer) {
  const buffer = new Uint8Array(arrayBuffer);
  let out = "";
  for (let idx = 0; idx < buffer.length; idx++) {
    const n = buffer[idx];
    out += HEX_CHARS[n >>> 4 & 15];
    out += HEX_CHARS[n & 15];
  }
  return out;
}
__name(buf2hex, "buf2hex");
function encodeRfc3986(urlEncodedStr) {
  return urlEncodedStr.replace(/[!'()*]/g, (c) => "%" + c.charCodeAt(0).toString(16).toUpperCase());
}
__name(encodeRfc3986, "encodeRfc3986");
function guessServiceRegion(url, headers) {
  const { hostname, pathname } = url;
  if (hostname.endsWith(".on.aws")) {
    const match3 = hostname.match(/^[^.]{1,63}\.lambda-url\.([^.]{1,63})\.on\.aws$/);
    return match3 != null ? ["lambda", match3[1] || ""] : ["", ""];
  }
  if (hostname.endsWith(".r2.cloudflarestorage.com")) {
    return ["s3", "auto"];
  }
  if (hostname.endsWith(".backblazeb2.com")) {
    const match3 = hostname.match(/^(?:[^.]{1,63}\.)?s3\.([^.]{1,63})\.backblazeb2\.com$/);
    return match3 != null ? ["s3", match3[1] || ""] : ["", ""];
  }
  const match2 = hostname.replace("dualstack.", "").match(/([^.]{1,63})\.(?:([^.]{0,63})\.)?amazonaws\.com(?:\.cn)?$/);
  let service = match2 && match2[1] || "";
  let region = match2 && match2[2];
  if (region === "us-gov") {
    region = "us-gov-west-1";
  } else if (region === "s3" || region === "s3-accelerate") {
    region = "us-east-1";
    service = "s3";
  } else if (service === "iot") {
    if (hostname.startsWith("iot.")) {
      service = "execute-api";
    } else if (hostname.startsWith("data.jobs.iot.")) {
      service = "iot-jobs-data";
    } else {
      service = pathname === "/mqtt" ? "iotdevicegateway" : "iotdata";
    }
  } else if (service === "autoscaling") {
    const targetPrefix = (headers.get("X-Amz-Target") || "").split(".")[0];
    if (targetPrefix === "AnyScaleFrontendService") {
      service = "application-autoscaling";
    } else if (targetPrefix === "AnyScaleScalingPlannerFrontendService") {
      service = "autoscaling-plans";
    }
  } else if (region == null && service.startsWith("s3-")) {
    region = service.slice(3).replace(/^fips-|^external-1/, "");
    service = "s3";
  } else if (service.endsWith("-fips")) {
    service = service.slice(0, -5);
  } else if (region && /-\d$/.test(service) && !/-\d$/.test(region)) {
    [service, region] = [region, service];
  }
  return [HOST_SERVICES[service] || service, region || ""];
}
__name(guessServiceRegion, "guessServiceRegion");

// stripe_webhook.js
var encoder2 = new TextEncoder();
var enviarSes = /* @__PURE__ */ __name(async (aws, to, subject, text) => {
  await aws.fetch(`https://email.${aws.region}.amazonaws.com/v2/email/outbound-emails`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      FromEmailAddress: "carlos@imprentanacher.es",
      Destination: { ToAddresses: [to] },
      Content: { Simple: { Subject: { Data: subject }, Body: { Text: { Data: text } } } }
    })
  });
}, "enviarSes");
var correoAutomatico = /* @__PURE__ */ __name(async (aws, tipo, d) => {
  console.log("EYYYYYYYYYYY");
  switch (tipo) {
    case "retiros":
      await enviarSes(
        aws,
        d.correo,
        "Inscripci\xF3n recibida - Retiro de Adviento NSC-Espa\xF1a",
        `Estimado/a ${d.nombre}:

Hemos recibido su inscripci\xF3n para el Retiro de Adviento de Nuestra Se\xF1ora de la Cristiandad - Espa\xF1a que tendr\xE1 lugar del 11 al 13 de diciembre. 
Si todav\xEDa no ha realizado el pago del retiro a la casa de ejercicios, debe hacerlo lo antes posible mediante transferencia, as\xED como el check-in online.

IBAN: ES69 2100 1650 6602 0038 6605
Titular:  PROVINCIA ESPA\xD1A CONGREGACION RELIGIOSAS SAGRADO CORAZON DE JESUS
Concepto: Retiro NSC-Espa\xF1a
Cantidad: 120 \u20AC

Check-in: https://checkin.datahotel.net/casasantamariadehuerta.es/RegistroReserva/5f5c585b-851e-474f-97d8-ca18eed7aa70

Unos d\xEDas previos al Retiro recibir\xE1 un correo con informaci\xF3n pr\xE1ctica.

Reciba un cordial saludo en Cristo,
Asoc. Nuestra Se\xF1ora de la Cristiandad - Espa\xF1a`
      );
      break;
    case "musicasacra":
      await enviarSes(
        aws,
        d.correo,
        "Inscripci\xF3n recibida - M\xFAsica Sacra NSC-Espa\xF1a",
        `Estimado/a ${d.nombre}:

Hemos recibido su inscripci\xF3n para el encuentro de M\xFAsica Sacra de Nuestra Se\xF1ora de la Cristiandad - Espa\xF1a que tendr\xE1 lugar del 29 al 31 de enero en Aibar (Navarra).
Unos d\xEDa antes del encuentro recibir\xE1 informaci\xF3n sobre los horarios y otros detalles pr\xE1cticos.

Reciba un cordial saludo en Cristo,
Asoc. Nuestra Se\xF1ora de la Cristiandad - Espa\xF1a`
      );
      break;
  }
}, "correoAutomatico");
async function onRequestPost8({ request, env }) {
  const rawBody = await request.text();
  const sigHeader = request.headers.get("stripe-signature");
  const parts = Object.fromEntries(sigHeader.split(",").map((kv) => kv.split("=")));
  const key = await crypto.subtle.importKey(
    "raw",
    encoder2.encode(env.STRIPE_WEBHOOK_SECRET),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const mac = await crypto.subtle.sign("HMAC", key, encoder2.encode(`${parts.t}.${rawBody}`));
  const expected = [...new Uint8Array(mac)].map((b) => b.toString(16).padStart(2, "0")).join("");
  if (expected !== parts.v1) {
    return new Response("Firma inv\xE1lida", { status: 400 });
  }
  const evento = JSON.parse(rawBody);
  const session = evento.data?.object;
  if (!session?.metadata) {
    return new Response(JSON.stringify({ received: true }), { status: 200 });
  }
  const inscritoId = Number(session.metadata.inscrito_id);
  const tipo = session.metadata.tipo;
  const confirmado = evento.type === "checkout.session.completed" && session.payment_status === "paid" || evento.type === "checkout.session.async_payment_succeeded";
  if (confirmado) {
    const aws = new AwsClient({
      accessKeyId: env.AWS_ACCESS_KEY_ID,
      secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
      region: env.AWS_REGION,
      service: "ses"
    });
    switch (tipo) {
      case "retiros":
        await env.DB.prepare("UPDATE inscritos_retiros SET inscrito = 1 WHERE id = ?1").bind(inscritoId).run();
        await correoAutomatico(
          aws,
          tipo,
          await env.DB.prepare("SELECT * FROM inscritos_retiros WHERE id = ?1").bind(inscritoId).first()
        );
        break;
      case "musicasacra":
        await env.DB.prepare("UPDATE inscritos_musicasacra SET inscrito = 1 WHERE id = ?1").bind(inscritoId).run();
        await correoAutomatico(
          aws,
          tipo,
          await env.DB.prepare("SELECT * FROM inscritos_musicasacra WHERE id = ?1").bind(inscritoId).first()
        );
        break;
    }
  }
  if (evento.type === "checkout.session.expired") {
    switch (tipo) {
      case "retiros":
        await env.DB.prepare("DELETE FROM inscritos_retiros WHERE id = ?1 AND inscrito = 0").bind(inscritoId).run();
        break;
      case "musicasacra":
        await env.DB.prepare("DELETE FROM inscritos_musicasacra WHERE id = ?1 AND inscrito = 0").bind(inscritoId).run();
        break;
    }
  }
  if (evento.type === "checkout.session.async_payment_failed") {
    switch (tipo) {
      case "retiros":
        await env.DB.prepare("DELETE FROM inscritos_retiros WHERE id = ?1").bind(inscritoId).run();
        break;
      case "musicasacra":
        await env.DB.prepare("DELETE FROM inscritos_musicasacra WHERE id = ?1").bind(inscritoId).run();
        break;
    }
  }
  return new Response(JSON.stringify({ received: true }), { status: 200 });
}
__name(onRequestPost8, "onRequestPost");

// ../.wrangler/tmp/pages-GlZbZN/functionsRoutes-0.2545357674975528.mjs
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
  },
  {
    routePath: "/stripe_webhook",
    mountPath: "/",
    method: "POST",
    middlewares: [],
    modules: [onRequestPost8]
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
/*! Bundled license information:

aws4fetch/dist/aws4fetch.esm.mjs:
  (**
   * @license MIT <https://opensource.org/licenses/MIT>
   * @copyright Michael Hart 2024
   *)
*/
