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
  "/assets/_authenticated-BYUhOKzl.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"1437-eCxkOPggT44+ggEMyGjeeg30ZKE"',
    "mtime": "2026-06-27T17:09:29.334Z",
    "size": 5175,
    "path": "../public/assets/_authenticated-BYUhOKzl.js"
  },
  "/assets/_authenticated.admin-xitwZJsr.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"2fba-42LtJLPP/7mKJ9/Fx6Mv5LbCPA0"',
    "mtime": "2026-06-27T17:09:29.334Z",
    "size": 12218,
    "path": "../public/assets/_authenticated.admin-xitwZJsr.js"
  },
  "/assets/_authenticated.meu-perfil-p-XPTaG2.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"3c5-LKxJQ3ewyR2/hLotle2YFLVCyU4"',
    "mtime": "2026-06-27T17:09:29.334Z",
    "size": 965,
    "path": "../public/assets/_authenticated.meu-perfil-p-XPTaG2.js"
  },
  "/assets/_authenticated.prestadores-B1WRhVYl.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"2a4c-8GGm3D2R9ZkPzfz3bkyxCfv7CSg"',
    "mtime": "2026-06-27T17:09:29.334Z",
    "size": 10828,
    "path": "../public/assets/_authenticated.prestadores-B1WRhVYl.js"
  },
  "/assets/_authenticated.dashboard-BHw5K-3-.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"65c44-WbGXDRgzcCfYLzJemZrEZ9FKA8Q"',
    "mtime": "2026-06-27T17:09:29.334Z",
    "size": 416836,
    "path": "../public/assets/_authenticated.dashboard-BHw5K-3-.js"
  },
  "/assets/_authenticated.prospeccao-DrtjPpcu.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"5564-HXST7YSplAuHRaUTPX/ErgHen5A"',
    "mtime": "2026-06-27T17:09:29.334Z",
    "size": 21860,
    "path": "../public/assets/_authenticated.prospeccao-DrtjPpcu.js"
  },
  "/assets/_authenticated.projetos-VKt1Nfvl.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"994f-YlKiEyNY1yucneATvHRVsltQulA"',
    "mtime": "2026-06-27T17:09:29.334Z",
    "size": 39247,
    "path": "../public/assets/_authenticated.projetos-VKt1Nfvl.js"
  },
  "/assets/badge-DNsNvs5J.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"2513-EDB28PSb1RCes/+XIp0YH3hrXHY"',
    "mtime": "2026-06-27T17:09:29.338Z",
    "size": 9491,
    "path": "../public/assets/badge-DNsNvs5J.js"
  },
  "/assets/card-e-7gBCjo.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"400-WSOQtqybSlS0wWn9RupHz6+zp38"',
    "mtime": "2026-06-27T17:09:29.338Z",
    "size": 1024,
    "path": "../public/assets/card-e-7gBCjo.js"
  },
  "/assets/circle-check-CNEefNxv.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"ae-r2gWiWhP7nYw6qROcenWnynEd4E"',
    "mtime": "2026-06-27T17:09:29.334Z",
    "size": 174,
    "path": "../public/assets/circle-check-CNEefNxv.js"
  },
  "/assets/core.esm-Dadan8pb.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"a575-FGysf2KmuvwdT6ngTsSXMp04cYM"',
    "mtime": "2026-06-27T17:09:29.334Z",
    "size": 42357,
    "path": "../public/assets/core.esm-Dadan8pb.js"
  },
  "/assets/domain-q23tffDe.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"eae-oSCQGS/hjMmT/GxfjxPiIgM9gz8"',
    "mtime": "2026-06-27T17:09:29.338Z",
    "size": 3758,
    "path": "../public/assets/domain-q23tffDe.js"
  },
  "/assets/especialidade-multiselect-D_6Bensl.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"772e-5DHV72a09HlX3LEk4giJVsZbWAk"',
    "mtime": "2026-06-27T17:09:29.334Z",
    "size": 30510,
    "path": "../public/assets/especialidade-multiselect-D_6Bensl.js"
  },
  "/assets/index.esm-CV8eKd30.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"6940-ccUymBDG9W0jKzKMNDb2tPgX46M"',
    "mtime": "2026-06-27T17:09:29.334Z",
    "size": 26944,
    "path": "../public/assets/index.esm-CV8eKd30.js"
  },
  "/assets/inter-cyrillic-ext-wght-normal-BOeWTOD4.woff2": {
    "type": "font/woff2",
    "etag": '"6568-cF1iUGbboMFZ8TfnP5HiMgl9II0"',
    "mtime": "2026-06-27T17:09:29.330Z",
    "size": 25960,
    "path": "../public/assets/inter-cyrillic-ext-wght-normal-BOeWTOD4.woff2"
  },
  "/assets/inter-cyrillic-wght-normal-DqGufNeO.woff2": {
    "type": "font/woff2",
    "etag": '"493c-n3Oy9D6jvzfMjpClqox+Zo7ERQQ"',
    "mtime": "2026-06-27T17:09:29.334Z",
    "size": 18748,
    "path": "../public/assets/inter-cyrillic-wght-normal-DqGufNeO.woff2"
  },
  "/assets/inter-greek-ext-wght-normal-DlzME5K_.woff2": {
    "type": "font/woff2",
    "etag": '"2be0-BP5iTzJeB8nLqYAgKpWNi5o1Zm8"',
    "mtime": "2026-06-27T17:09:29.334Z",
    "size": 11232,
    "path": "../public/assets/inter-greek-ext-wght-normal-DlzME5K_.woff2"
  },
  "/assets/inter-greek-wght-normal-CkhJZR-_.woff2": {
    "type": "font/woff2",
    "etag": '"4a34-xor/hj4YNqI52zFecXnUbzQ4Xs4"',
    "mtime": "2026-06-27T17:09:29.334Z",
    "size": 18996,
    "path": "../public/assets/inter-greek-wght-normal-CkhJZR-_.woff2"
  },
  "/assets/inter-vietnamese-wght-normal-CBcvBZtf.woff2": {
    "type": "font/woff2",
    "etag": '"280c-nBythjoDQ0+5wVAendJ6wU7Xz2M"',
    "mtime": "2026-06-27T17:09:29.334Z",
    "size": 10252,
    "path": "../public/assets/inter-vietnamese-wght-normal-CBcvBZtf.woff2"
  },
  "/assets/label-wYfYsiN6.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"413-0m0at31WPZcEhrqbIV+wQW4rXIM"',
    "mtime": "2026-06-27T17:09:29.338Z",
    "size": 1043,
    "path": "../public/assets/label-wYfYsiN6.js"
  },
  "/assets/link-vHaFSW4M.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"fd-TwdtTfghxCFyJ1XqPef+tN54kO4"',
    "mtime": "2026-06-27T17:09:29.334Z",
    "size": 253,
    "path": "../public/assets/link-vHaFSW4M.js"
  },
  "/assets/inter-latin-wght-normal-Dx4kXJAl.woff2": {
    "type": "font/woff2",
    "etag": '"bc80-8R1ym7Ck2DUNLqPQ/AYs9u8tUpg"',
    "mtime": "2026-06-27T17:09:29.334Z",
    "size": 48256,
    "path": "../public/assets/inter-latin-wght-normal-Dx4kXJAl.woff2"
  },
  "/assets/inter-latin-ext-wght-normal-DO1Apj_S.woff2": {
    "type": "font/woff2",
    "etag": '"14c4c-zz61D7IQFMB9QxHvTAOk/Vh4ibQ"',
    "mtime": "2026-06-27T17:09:29.334Z",
    "size": 85068,
    "path": "../public/assets/inter-latin-ext-wght-normal-DO1Apj_S.woff2"
  },
  "/assets/loader-circle-BJn2aiFH.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"8c-JkC/mOE7LreKjo2GbLsVZRbVLg0"',
    "mtime": "2026-06-27T17:09:29.338Z",
    "size": 140,
    "path": "../public/assets/loader-circle-BJn2aiFH.js"
  },
  "/assets/index-BDvo9VtE.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"b8a59-dGs3wzWdeGWFE2wNDsjpoCaakis"',
    "mtime": "2026-06-27T17:09:29.338Z",
    "size": 756313,
    "path": "../public/assets/index-BDvo9VtE.js"
  },
  "/assets/login-Dg9I56Un.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"115c-TTlOscuGT91lbF67yiNZ6BlJax8"',
    "mtime": "2026-06-27T17:09:29.334Z",
    "size": 4444,
    "path": "../public/assets/login-Dg9I56Un.js"
  },
  "/assets/search-DdIFLcMj.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"a9-315a6JC9RNcqlvt3Qvb7255+6fg"',
    "mtime": "2026-06-27T17:09:29.334Z",
    "size": 169,
    "path": "../public/assets/search-DdIFLcMj.js"
  },
  "/assets/styles-DXnBwkMK.css": {
    "type": "text/css; charset=utf-8",
    "etag": '"fb82-M66HFZb+WheTFshWV8HIgqa4F5I"',
    "mtime": "2026-06-27T17:09:29.334Z",
    "size": 64386,
    "path": "../public/assets/styles-DXnBwkMK.css"
  },
  "/assets/table-ERjwE06W.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"479-xIQIrSy1rICuAja5pd4W4jAZWXo"',
    "mtime": "2026-06-27T17:09:29.338Z",
    "size": 1145,
    "path": "../public/assets/table-ERjwE06W.js"
  },
  "/assets/sparkles-hVYOnLvL.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"1f9-1ZzY/3CWDh5OWgTIn3NCeaBO8PA"',
    "mtime": "2026-06-27T17:09:29.334Z",
    "size": 505,
    "path": "../public/assets/sparkles-hVYOnLvL.js"
  },
  "/assets/tabs-VOBYUmGX.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"1a4f-y+RDgu+SBO9FMcGzduaoqueQ3yw"',
    "mtime": "2026-06-27T17:09:29.334Z",
    "size": 6735,
    "path": "../public/assets/tabs-VOBYUmGX.js"
  },
  "/assets/use-auth-Bc9zmLD_.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"2de-xbjibpex98WpMi+A3bFXsC2o0IM"',
    "mtime": "2026-06-27T17:09:29.338Z",
    "size": 734,
    "path": "../public/assets/use-auth-Bc9zmLD_.js"
  },
  "/assets/users-DVgwlxh4.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"12d-Y8+oIGOEiIZZhJpAkzvmF4Stqqw"',
    "mtime": "2026-06-27T17:09:29.338Z",
    "size": 301,
    "path": "../public/assets/users-DVgwlxh4.js"
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
