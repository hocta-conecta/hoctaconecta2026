globalThis.__nitro_main__ = import.meta.url;
import "./_libs/unenv.mjs";

import { H as HookableCore } from "./_libs/hookable.mjs";
import { d as defineLazyEventHandler, H as HTTPError, a as H3Core } from "./_libs/h3.mjs";
import { a as FastResponse } from "./_libs/srvx.mjs";


import "./_libs/rou3.mjs";





function lazyService(loader) {
  let promise, mod;
  return {
    fetch(req) {
      if (mod) {
        return mod.fetch(req);
      }
      if (!promise) {
        promise = loader().then((_mod) => mod = _mod.default || _mod);
      }
      return promise.then((mod2) => mod2.fetch(req));
    }
  };
}
const services = {
  ["ssr"]: lazyService(() => import("./_ssr/index.mjs"))
};
globalThis.__nitro_vite_envs__ = services;
const assets = {
  "/assets/_authenticated-D0E-RH1P.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"1437-wgFU+FEFgWI+kw7esb1aYT+t0Nk"',
    "mtime": "2026-06-27T12:20:10.649Z",
    "size": 5175,
    "path": "../public/assets/_authenticated-D0E-RH1P.js"
  },
  "/assets/_authenticated.admin-r9Pk1mMg.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"2fba-BunkYRN6MqlzU0BQQhlBioMLKAo"',
    "mtime": "2026-06-27T12:20:10.649Z",
    "size": 12218,
    "path": "../public/assets/_authenticated.admin-r9Pk1mMg.js"
  },
  "/assets/_authenticated.meu-perfil-A9VIL56K.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"3c5-osBBI38oyt1I2yAmfwhdLR7/pAs"',
    "mtime": "2026-06-27T12:20:10.649Z",
    "size": 965,
    "path": "../public/assets/_authenticated.meu-perfil-A9VIL56K.js"
  },
  "/assets/_authenticated.prestadores-CnqQhMe7.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"2a4c-JyhDibv0m6GKBiIh+RQEv33qqYQ"',
    "mtime": "2026-06-27T12:20:10.649Z",
    "size": 10828,
    "path": "../public/assets/_authenticated.prestadores-CnqQhMe7.js"
  },
  "/assets/_authenticated.projetos-gyHPq7uZ.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"994f-/RHAYsed/gNHIapuqKnLZraI2M8"',
    "mtime": "2026-06-27T12:20:10.649Z",
    "size": 39247,
    "path": "../public/assets/_authenticated.projetos-gyHPq7uZ.js"
  },
  "/assets/_authenticated.dashboard-Ci5VKhAv.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"646c0-u1dbHnv/vMbUGGSoT/1/x4k9vYU"',
    "mtime": "2026-06-27T12:20:10.649Z",
    "size": 411328,
    "path": "../public/assets/_authenticated.dashboard-Ci5VKhAv.js"
  },
  "/assets/_authenticated.prospeccao-CaCpEtDv.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"5564-jLSzxH5K2D3jD8egX1EzVmbyGxw"',
    "mtime": "2026-06-27T12:20:10.649Z",
    "size": 21860,
    "path": "../public/assets/_authenticated.prospeccao-CaCpEtDv.js"
  },
  "/assets/badge-D8P--coQ.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"2513-vmtq61mXLxCc0YKy6Wk4qFgR3V0"',
    "mtime": "2026-06-27T12:20:10.649Z",
    "size": 9491,
    "path": "../public/assets/badge-D8P--coQ.js"
  },
  "/assets/card-UlNDnBLl.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"400-/PWwRoFP0swCSD7sQzUc+hHjSTk"',
    "mtime": "2026-06-27T12:20:10.649Z",
    "size": 1024,
    "path": "../public/assets/card-UlNDnBLl.js"
  },
  "/assets/circle-check-B1ydInd5.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"ae-lfFkrJKNwEJP8YhTJDtjNtVOSGI"',
    "mtime": "2026-06-27T12:20:10.649Z",
    "size": 174,
    "path": "../public/assets/circle-check-B1ydInd5.js"
  },
  "/assets/core.esm-DwSWnpmW.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"a575-3QD2TJSc+ItkrypTaz/dZD9m2T4"',
    "mtime": "2026-06-27T12:20:10.649Z",
    "size": 42357,
    "path": "../public/assets/core.esm-DwSWnpmW.js"
  },
  "/assets/domain-DtWoLXRI.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"eae-y1QHDJu7YfEBVM3ZCLqoVvgr49U"',
    "mtime": "2026-06-27T12:20:10.649Z",
    "size": 3758,
    "path": "../public/assets/domain-DtWoLXRI.js"
  },
  "/assets/especialidade-multiselect-CxtayZUt.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"7184-UsJ1oGDLRH5r8ImpUrcmP3o/IyU"',
    "mtime": "2026-06-27T12:20:10.649Z",
    "size": 29060,
    "path": "../public/assets/especialidade-multiselect-CxtayZUt.js"
  },
  "/assets/index.esm-1_h2u8Zh.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"6940-/4hwvQzQAi/UE2mBucmgksa+cuU"',
    "mtime": "2026-06-27T12:20:10.649Z",
    "size": 26944,
    "path": "../public/assets/index.esm-1_h2u8Zh.js"
  },
  "/assets/inter-cyrillic-ext-wght-normal-BOeWTOD4.woff2": {
    "type": "font/woff2",
    "etag": '"6568-cF1iUGbboMFZ8TfnP5HiMgl9II0"',
    "mtime": "2026-06-27T12:20:10.649Z",
    "size": 25960,
    "path": "../public/assets/inter-cyrillic-ext-wght-normal-BOeWTOD4.woff2"
  },
  "/assets/inter-greek-ext-wght-normal-DlzME5K_.woff2": {
    "type": "font/woff2",
    "etag": '"2be0-BP5iTzJeB8nLqYAgKpWNi5o1Zm8"',
    "mtime": "2026-06-27T12:20:10.649Z",
    "size": 11232,
    "path": "../public/assets/inter-greek-ext-wght-normal-DlzME5K_.woff2"
  },
  "/assets/inter-cyrillic-wght-normal-DqGufNeO.woff2": {
    "type": "font/woff2",
    "etag": '"493c-n3Oy9D6jvzfMjpClqox+Zo7ERQQ"',
    "mtime": "2026-06-27T12:20:10.649Z",
    "size": 18748,
    "path": "../public/assets/inter-cyrillic-wght-normal-DqGufNeO.woff2"
  },
  "/assets/inter-greek-wght-normal-CkhJZR-_.woff2": {
    "type": "font/woff2",
    "etag": '"4a34-xor/hj4YNqI52zFecXnUbzQ4Xs4"',
    "mtime": "2026-06-27T12:20:10.649Z",
    "size": 18996,
    "path": "../public/assets/inter-greek-wght-normal-CkhJZR-_.woff2"
  },
  "/assets/inter-latin-ext-wght-normal-DO1Apj_S.woff2": {
    "type": "font/woff2",
    "etag": '"14c4c-zz61D7IQFMB9QxHvTAOk/Vh4ibQ"',
    "mtime": "2026-06-27T12:20:10.649Z",
    "size": 85068,
    "path": "../public/assets/inter-latin-ext-wght-normal-DO1Apj_S.woff2"
  },
  "/assets/inter-vietnamese-wght-normal-CBcvBZtf.woff2": {
    "type": "font/woff2",
    "etag": '"280c-nBythjoDQ0+5wVAendJ6wU7Xz2M"',
    "mtime": "2026-06-27T12:20:10.649Z",
    "size": 10252,
    "path": "../public/assets/inter-vietnamese-wght-normal-CBcvBZtf.woff2"
  },
  "/assets/label-BCbQX44x.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"413-0ODE+c1Z8DJjsTlRJfsAFZNsx/0"',
    "mtime": "2026-06-27T12:20:10.649Z",
    "size": 1043,
    "path": "../public/assets/label-BCbQX44x.js"
  },
  "/assets/inter-latin-wght-normal-Dx4kXJAl.woff2": {
    "type": "font/woff2",
    "etag": '"bc80-8R1ym7Ck2DUNLqPQ/AYs9u8tUpg"',
    "mtime": "2026-06-27T12:20:10.649Z",
    "size": 48256,
    "path": "../public/assets/inter-latin-wght-normal-Dx4kXJAl.woff2"
  },
  "/assets/link-BEksXub1.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"fd-wYVOrORt/mA54LVqAifhR7F0kT8"',
    "mtime": "2026-06-27T12:20:10.649Z",
    "size": 253,
    "path": "../public/assets/link-BEksXub1.js"
  },
  "/assets/loader-circle-Cp8ELb0I.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"8c-ts4alHXZuXc0imjPqdljb0hbzy8"',
    "mtime": "2026-06-27T12:20:10.649Z",
    "size": 140,
    "path": "../public/assets/loader-circle-Cp8ELb0I.js"
  },
  "/assets/index-qY_Dn_9O.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"b8a4b-Ei9B+7UDpXXBmKjeo6+k2QnnfD0"',
    "mtime": "2026-06-27T12:20:10.649Z",
    "size": 756299,
    "path": "../public/assets/index-qY_Dn_9O.js"
  },
  "/assets/login-BfMTAvty.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"115c-YwqVjPx5KEp/vVQp5lSq6V65cr8"',
    "mtime": "2026-06-27T12:20:10.649Z",
    "size": 4444,
    "path": "../public/assets/login-BfMTAvty.js"
  },
  "/assets/search-BWbU752A.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"a9-jsMdEmXIIR/8/YEHfOPmFl8ZaKE"',
    "mtime": "2026-06-27T12:20:10.649Z",
    "size": 169,
    "path": "../public/assets/search-BWbU752A.js"
  },
  "/assets/table-B9248YQB.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"479-rg8liZlL52G8khlesiEx5RBzB3o"',
    "mtime": "2026-06-27T12:20:10.649Z",
    "size": 1145,
    "path": "../public/assets/table-B9248YQB.js"
  },
  "/assets/sparkles-D89z0_il.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"1f9-phYFTNXlqlxS+j2u0BLQ/eag/vE"',
    "mtime": "2026-06-27T12:20:10.649Z",
    "size": 505,
    "path": "../public/assets/sparkles-D89z0_il.js"
  },
  "/assets/styles-DaerVxqn.css": {
    "type": "text/css; charset=utf-8",
    "etag": '"b746-XmEfPBJMghdTGgf2JHppDeuJg2U"',
    "mtime": "2026-06-27T12:20:10.649Z",
    "size": 46918,
    "path": "../public/assets/styles-DaerVxqn.css"
  },
  "/assets/tabs-B6Go-afW.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"1a4f-ZhH921O+ygvLw2w4fMheUbVdCcE"',
    "mtime": "2026-06-27T12:20:10.649Z",
    "size": 6735,
    "path": "../public/assets/tabs-B6Go-afW.js"
  },
  "/assets/use-auth-ClRxQzpN.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"2de-UhdJ5crFJA7WtrhmeSMzzONeOow"',
    "mtime": "2026-06-27T12:20:10.649Z",
    "size": 734,
    "path": "../public/assets/use-auth-ClRxQzpN.js"
  },
  "/assets/users-rp0k3pWd.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"12d-rubBqKcbnMYAe6S0agTyhiWI7BM"',
    "mtime": "2026-06-27T12:20:10.649Z",
    "size": 301,
    "path": "../public/assets/users-rp0k3pWd.js"
  }
};
const publicAssetBases = {};
function isPublicAssetURL(id = "") {
  if (assets[id]) {
    return true;
  }
  for (const base in publicAssetBases) {
    if (id.startsWith(base)) {
      return true;
    }
  }
  return false;
}
const headers = ((m) => function headersRouteRule(event) {
  for (const [key, value] of Object.entries(m.options || {})) {
    event.res.headers.set(key, value);
  }
});
const findRouteRules = /* @__PURE__ */ (() => {
  const $0 = [{ name: "headers", route: "/assets/**", handler: headers, options: { "cache-control": "public, max-age=31536000, immutable" } }];
  return (m, p) => {
    let r = [];
    if (p.charCodeAt(p.length - 1) === 47) p = p.slice(0, -1) || "/";
    let s = p.split("/"), l = s.length;
    if (l > 1) {
      if (s[1] === "assets") {
        r.unshift({ data: $0, params: { "_": s.slice(2).join("/") } });
      }
    }
    return r;
  };
})();
const _lazy_jV8nrf = defineLazyEventHandler(() => import("./_chunks/ssr-renderer.mjs"));
const findRoute = /* @__PURE__ */ (() => {
  const data = { route: "/**", handler: _lazy_jV8nrf };
  return ((_m, p) => {
    return { data, params: { "_": p.slice(1) } };
  });
})();
const errorHandler$1 = (error, event) => {
  const res = defaultHandler(error, event);
  return new FastResponse(typeof res.body === "string" ? res.body : JSON.stringify(res.body, null, 2), res);
};
function defaultHandler(error, event) {
  const unhandled = error.unhandled ?? !HTTPError.isError(error);
  const { status = 500, statusText = "" } = unhandled ? {} : error;
  if (status === 404) {
    const url = event.url || new URL(event.req.url);
    const baseURL = "/";
    if (/^\/[^/]/.test(baseURL) && !url.pathname.startsWith(baseURL)) {
      return {
        status: 302,
        headers: new Headers({ location: `${baseURL}${url.pathname.slice(1)}${url.search}` })
      };
    }
  }
  const headers2 = new Headers(unhandled ? {} : error.headers);
  headers2.set("content-type", "application/json; charset=utf-8");
  const jsonBody = unhandled ? {
    status,
    unhandled: true
  } : typeof error.toJSON === "function" ? error.toJSON() : {
    status,
    statusText,
    message: error.message
  };
  return {
    status,
    statusText,
    headers: headers2,
    body: {
      error: true,
      ...jsonBody
    }
  };
}
const errorHandlers = [errorHandler$1];
async function errorHandler(error, event) {
  for (const handler of errorHandlers) {
    try {
      const response = await handler(error, event, { defaultHandler });
      if (response) {
        return response;
      }
    } catch (error2) {
      console.error(error2);
    }
  }
}
function createNitroApp() {
  const captureError = (error, errorCtx) => {
    if (errorCtx?.event) {
      const errors = errorCtx.event.req.context?.nitro?.errors;
      if (errors) {
        errors.push({ error, context: errorCtx });
      }
    }
  };
  const h3App = createH3App({
    onError(error, event) {
      return errorHandler(error, event);
    }
  });
  let appHandler = (req) => {
    req.context ||= {};
    req.context.nitro = req.context.nitro || { errors: [] };
    return h3App.fetch(req);
  };
  return {
    fetch: appHandler,
    h3: h3App,
    hooks: void 0,
    captureError
  };
}
function createH3App(config) {
  const h3App = new H3Core(config);
  h3App["~findRoute"] = (event) => findRoute(event.req.method, event.url.pathname);
  h3App["~getMiddleware"] = (event, route) => {
    const pathname = event.url.pathname;
    const method = event.req.method;
    const middleware = [];
    const routeRules = getRouteRules(method, pathname);
    event.context.routeRules = routeRules?.routeRules;
    if (routeRules?.routeRuleMiddleware.length) {
      middleware.push(...routeRules.routeRuleMiddleware);
    }
    if (route?.data?.middleware?.length) {
      middleware.push(...route.data.middleware);
    }
    return middleware;
  };
  return h3App;
}
const APP_ID = "default";
function useNitroApp() {
  let instance = useNitroApp._instance;
  if (instance) {
    return instance;
  }
  instance = useNitroApp._instance = createNitroApp();
  globalThis.__nitro__ = globalThis.__nitro__ || {};
  globalThis.__nitro__[APP_ID] = instance;
  return instance;
}
function useNitroHooks() {
  const nitroApp = useNitroApp();
  const hooks = nitroApp.hooks;
  if (hooks) {
    return hooks;
  }
  return nitroApp.hooks = new HookableCore();
}
function getRouteRules(method, pathname) {
  const m = findRouteRules(method, pathname);
  if (!m?.length) {
    return { routeRuleMiddleware: [] };
  }
  const routeRules = {};
  for (const layer of m) {
    for (const rule of layer.data) {
      const currentRule = routeRules[rule.name];
      if (currentRule) {
        if (rule.options === false) {
          delete routeRules[rule.name];
          continue;
        }
        if (typeof currentRule.options === "object" && typeof rule.options === "object") {
          currentRule.options = {
            ...currentRule.options,
            ...rule.options
          };
        } else {
          currentRule.options = rule.options;
        }
        currentRule.route = rule.route;
        currentRule.params = {
          ...currentRule.params,
          ...layer.params
        };
      } else if (rule.options !== false) {
        routeRules[rule.name] = {
          ...rule,
          params: layer.params
        };
      }
    }
  }
  const middleware = [];
  const orderedRules = Object.values(routeRules).sort((a, b) => (a.handler?.order || 0) - (b.handler?.order || 0));
  for (const rule of orderedRules) {
    if (rule.options === false || !rule.handler) {
      continue;
    }
    middleware.push(rule.handler(rule));
  }
  return {
    routeRules,
    routeRuleMiddleware: middleware
  };
}
function createHandler(hooks) {
  const nitroApp = useNitroApp();
  const nitroHooks = useNitroHooks();
  return {
    async fetch(request, env, context) {
      globalThis.__env__ = env;
      augmentReq(request, {
        env,
        context
      });
      const ctxExt = {};
      const url = new URL(request.url);
      if (hooks.fetch) {
        const res = await hooks.fetch(request, env, context, url, ctxExt);
        if (res) {
          return res;
        }
      }
      return await nitroApp.fetch(request);
    },
    scheduled(controller, env, context) {
      globalThis.__env__ = env;
      context.waitUntil(nitroHooks.callHook("cloudflare:scheduled", {
        controller,
        env,
        context
      }) || Promise.resolve());
    },
    email(message, env, context) {
      globalThis.__env__ = env;
      context.waitUntil(nitroHooks.callHook("cloudflare:email", {
        message,
        event: message,
        env,
        context
      }) || Promise.resolve());
    },
    queue(batch, env, context) {
      globalThis.__env__ = env;
      context.waitUntil(nitroHooks.callHook("cloudflare:queue", {
        batch,
        event: batch,
        env,
        context
      }) || Promise.resolve());
    },
    tail(traces, env, context) {
      globalThis.__env__ = env;
      context.waitUntil(nitroHooks.callHook("cloudflare:tail", {
        traces,
        env,
        context
      }) || Promise.resolve());
    },
    trace(traces, env, context) {
      globalThis.__env__ = env;
      context.waitUntil(nitroHooks.callHook("cloudflare:trace", {
        traces,
        env,
        context
      }) || Promise.resolve());
    }
  };
}
function augmentReq(cfReq, ctx) {
  const req = cfReq;
  req.ip = cfReq.headers.get("cf-connecting-ip") || void 0;
  req.runtime ??= { name: "cloudflare" };
  req.runtime.cloudflare = {
    ...req.runtime.cloudflare,
    ...ctx
  };
  req.waitUntil = ctx.context?.waitUntil.bind(ctx.context);
}
const cloudflareModule = createHandler({ fetch(cfRequest, env, context, url) {
  if (env.ASSETS && isPublicAssetURL(url.pathname)) {
    return env.ASSETS.fetch(cfRequest);
  }
} });
export {
  cloudflareModule as default
};
