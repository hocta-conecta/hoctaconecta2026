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
  "/assets/_authenticated-C3yWXxgL.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"1437-HpzLMKconVy0UNdUi5H3HrWlyX8"',
    "mtime": "2026-06-27T12:52:40.010Z",
    "size": 5175,
    "path": "../public/assets/_authenticated-C3yWXxgL.js"
  },
  "/assets/_authenticated.admin-BF5MVO-h.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"2fba-eiLoEYLicUhrrCR/eO+KBbRlZjA"',
    "mtime": "2026-06-27T12:52:40.010Z",
    "size": 12218,
    "path": "../public/assets/_authenticated.admin-BF5MVO-h.js"
  },
  "/assets/_authenticated.dashboard-8zonfb0J.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"65c44-4/1lIWOhDrBC5CVb4yNzpTCvU30"',
    "mtime": "2026-06-27T12:52:40.010Z",
    "size": 416836,
    "path": "../public/assets/_authenticated.dashboard-8zonfb0J.js"
  },
  "/assets/_authenticated.meu-perfil-DJCElrD-.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"3c5-Xwo1flCq+kKnkQ+7Hu/EXm4Z1yM"',
    "mtime": "2026-06-27T12:52:40.010Z",
    "size": 965,
    "path": "../public/assets/_authenticated.meu-perfil-DJCElrD-.js"
  },
  "/assets/_authenticated.prestadores-klybKnl-.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"2a4c-0IgxMrac69EoF0Dt5vy46FH5UCY"',
    "mtime": "2026-06-27T12:52:40.010Z",
    "size": 10828,
    "path": "../public/assets/_authenticated.prestadores-klybKnl-.js"
  },
  "/assets/_authenticated.projetos-CDfiegej.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"994f-GV9HmKmHV52d+DchtZAf480eNT8"',
    "mtime": "2026-06-27T12:52:40.010Z",
    "size": 39247,
    "path": "../public/assets/_authenticated.projetos-CDfiegej.js"
  },
  "/assets/_authenticated.prospeccao-CukrOv4s.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"5564-PvVRdJiWkV0KxRxPTttuV4ntaKs"',
    "mtime": "2026-06-27T12:52:40.010Z",
    "size": 21860,
    "path": "../public/assets/_authenticated.prospeccao-CukrOv4s.js"
  },
  "/assets/badge-EsgrqWkF.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"2513-F3F9QK7NjCZEHQTLU4WVO7KRvhc"',
    "mtime": "2026-06-27T12:52:40.010Z",
    "size": 9491,
    "path": "../public/assets/badge-EsgrqWkF.js"
  },
  "/assets/card-Dno8glrV.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"400-0cnqJrlJYC1Y0Sv+tZXneOq47tY"',
    "mtime": "2026-06-27T12:52:40.010Z",
    "size": 1024,
    "path": "../public/assets/card-Dno8glrV.js"
  },
  "/assets/circle-check-FOrxWwU-.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"ae-Y201U+QdOdyKbsoX6fCWAO6ELOU"',
    "mtime": "2026-06-27T12:52:40.010Z",
    "size": 174,
    "path": "../public/assets/circle-check-FOrxWwU-.js"
  },
  "/assets/core.esm-BpzLR_KN.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"a575-9PTEV5eMW9a7fWoR0QB1/UVgMkc"',
    "mtime": "2026-06-27T12:52:40.010Z",
    "size": 42357,
    "path": "../public/assets/core.esm-BpzLR_KN.js"
  },
  "/assets/domain-UwaQ2-3L.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"eae-AnAPD92A8qgcmndb/PPH8rZHnn8"',
    "mtime": "2026-06-27T12:52:40.010Z",
    "size": 3758,
    "path": "../public/assets/domain-UwaQ2-3L.js"
  },
  "/assets/especialidade-multiselect-rpW974qT.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"7184-/MXXvttXgmR0f/CcpgadDgnSFhY"',
    "mtime": "2026-06-27T12:52:40.010Z",
    "size": 29060,
    "path": "../public/assets/especialidade-multiselect-rpW974qT.js"
  },
  "/assets/index.esm-Cfp5DD0n.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"6940-KrU90rzwO6F+TNtePol8IlMJ5dw"',
    "mtime": "2026-06-27T12:52:40.010Z",
    "size": 26944,
    "path": "../public/assets/index.esm-Cfp5DD0n.js"
  },
  "/assets/inter-cyrillic-ext-wght-normal-BOeWTOD4.woff2": {
    "type": "font/woff2",
    "etag": '"6568-cF1iUGbboMFZ8TfnP5HiMgl9II0"',
    "mtime": "2026-06-27T12:52:40.010Z",
    "size": 25960,
    "path": "../public/assets/inter-cyrillic-ext-wght-normal-BOeWTOD4.woff2"
  },
  "/assets/inter-cyrillic-wght-normal-DqGufNeO.woff2": {
    "type": "font/woff2",
    "etag": '"493c-n3Oy9D6jvzfMjpClqox+Zo7ERQQ"',
    "mtime": "2026-06-27T12:52:40.010Z",
    "size": 18748,
    "path": "../public/assets/inter-cyrillic-wght-normal-DqGufNeO.woff2"
  },
  "/assets/inter-greek-ext-wght-normal-DlzME5K_.woff2": {
    "type": "font/woff2",
    "etag": '"2be0-BP5iTzJeB8nLqYAgKpWNi5o1Zm8"',
    "mtime": "2026-06-27T12:52:40.010Z",
    "size": 11232,
    "path": "../public/assets/inter-greek-ext-wght-normal-DlzME5K_.woff2"
  },
  "/assets/inter-greek-wght-normal-CkhJZR-_.woff2": {
    "type": "font/woff2",
    "etag": '"4a34-xor/hj4YNqI52zFecXnUbzQ4Xs4"',
    "mtime": "2026-06-27T12:52:40.010Z",
    "size": 18996,
    "path": "../public/assets/inter-greek-wght-normal-CkhJZR-_.woff2"
  },
  "/assets/inter-vietnamese-wght-normal-CBcvBZtf.woff2": {
    "type": "font/woff2",
    "etag": '"280c-nBythjoDQ0+5wVAendJ6wU7Xz2M"',
    "mtime": "2026-06-27T12:52:40.010Z",
    "size": 10252,
    "path": "../public/assets/inter-vietnamese-wght-normal-CBcvBZtf.woff2"
  },
  "/assets/inter-latin-wght-normal-Dx4kXJAl.woff2": {
    "type": "font/woff2",
    "etag": '"bc80-8R1ym7Ck2DUNLqPQ/AYs9u8tUpg"',
    "mtime": "2026-06-27T12:52:40.010Z",
    "size": 48256,
    "path": "../public/assets/inter-latin-wght-normal-Dx4kXJAl.woff2"
  },
  "/assets/inter-latin-ext-wght-normal-DO1Apj_S.woff2": {
    "type": "font/woff2",
    "etag": '"14c4c-zz61D7IQFMB9QxHvTAOk/Vh4ibQ"',
    "mtime": "2026-06-27T12:52:40.010Z",
    "size": 85068,
    "path": "../public/assets/inter-latin-ext-wght-normal-DO1Apj_S.woff2"
  },
  "/assets/label-L5iwS2a6.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"413-2iH3Bd65TgAVReVimdoa8tNanO0"',
    "mtime": "2026-06-27T12:52:40.010Z",
    "size": 1043,
    "path": "../public/assets/label-L5iwS2a6.js"
  },
  "/assets/link-9qmqeroD.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"fd-WU308PqEtvCeim2OUu0mZ4BOjpM"',
    "mtime": "2026-06-27T12:52:40.010Z",
    "size": 253,
    "path": "../public/assets/link-9qmqeroD.js"
  },
  "/assets/loader-circle-CRK3Lr-s.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"8c-2fr2enyvXBYODQTfiKnd24JjM4I"',
    "mtime": "2026-06-27T12:52:40.010Z",
    "size": 140,
    "path": "../public/assets/loader-circle-CRK3Lr-s.js"
  },
  "/assets/index-49BKK-yF.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"b8a4b-u/wGZdnhschLtG+x1ztvhgzkNtc"',
    "mtime": "2026-06-27T12:52:40.010Z",
    "size": 756299,
    "path": "../public/assets/index-49BKK-yF.js"
  },
  "/assets/login-BoY2c7nN.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"115c-YuaBO9ETiWYscYcy9SxP2ekdX8w"',
    "mtime": "2026-06-27T12:52:40.010Z",
    "size": 4444,
    "path": "../public/assets/login-BoY2c7nN.js"
  },
  "/assets/search-BXoHoB5n.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"a9-IZh8GqEPjQxhb6ETo1zS1PX5F38"',
    "mtime": "2026-06-27T12:52:40.010Z",
    "size": 169,
    "path": "../public/assets/search-BXoHoB5n.js"
  },
  "/assets/sparkles-Cf-2SSoV.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"1f9-lsjQc3Syu92Mf31XUfl8Jt6cjiA"',
    "mtime": "2026-06-27T12:52:40.010Z",
    "size": 505,
    "path": "../public/assets/sparkles-Cf-2SSoV.js"
  },
  "/assets/styles-BA0WNcnj.css": {
    "type": "text/css; charset=utf-8",
    "etag": '"fa97-YGVXcEzWyUJwcBKT+JIjfdKb9qc"',
    "mtime": "2026-06-27T12:52:40.010Z",
    "size": 64151,
    "path": "../public/assets/styles-BA0WNcnj.css"
  },
  "/assets/table-BNN4CL5i.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"479-aJ4ZjjyjyUGzVfh7WQoejvYvOlA"',
    "mtime": "2026-06-27T12:52:40.010Z",
    "size": 1145,
    "path": "../public/assets/table-BNN4CL5i.js"
  },
  "/assets/tabs-_4nHKShj.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"1a4f-eyX+bcIYGwZIrT8JErkeWetqNp0"',
    "mtime": "2026-06-27T12:52:40.010Z",
    "size": 6735,
    "path": "../public/assets/tabs-_4nHKShj.js"
  },
  "/assets/use-auth-Bm-zlLBu.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"2de-8RktlNzwQvVS49P35VBF30kHx3E"',
    "mtime": "2026-06-27T12:52:40.010Z",
    "size": 734,
    "path": "../public/assets/use-auth-Bm-zlLBu.js"
  },
  "/assets/users-Cw5ERV5f.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"12d-npE4d3cVivQc1P4FTSHjuAQo39k"',
    "mtime": "2026-06-27T12:52:40.010Z",
    "size": 301,
    "path": "../public/assets/users-Cw5ERV5f.js"
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
