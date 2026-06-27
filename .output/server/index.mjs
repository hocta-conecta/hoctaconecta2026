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
  "/assets/_authenticated-BFTaPddZ.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"1437-WEDKj+1aOEjN6w1btrgmNVA61GY"',
    "mtime": "2026-06-27T16:30:13.938Z",
    "size": 5175,
    "path": "../public/assets/_authenticated-BFTaPddZ.js"
  },
  "/assets/_authenticated.admin-DOapV3JW.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"2fba-gWUh2cqBhqNB0WhCHBnv+YY6p9U"',
    "mtime": "2026-06-27T16:30:13.938Z",
    "size": 12218,
    "path": "../public/assets/_authenticated.admin-DOapV3JW.js"
  },
  "/assets/_authenticated.meu-perfil-CnxZ0Eb5.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"3c5-gWg89YHbn9+qSynARJxxILDAqLk"',
    "mtime": "2026-06-27T16:30:13.938Z",
    "size": 965,
    "path": "../public/assets/_authenticated.meu-perfil-CnxZ0Eb5.js"
  },
  "/assets/_authenticated.dashboard-CxbedLW_.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"65c44-5Xm/OyQO+QrhIyNxEeeaU0kYuNo"',
    "mtime": "2026-06-27T16:30:13.938Z",
    "size": 416836,
    "path": "../public/assets/_authenticated.dashboard-CxbedLW_.js"
  },
  "/assets/_authenticated.prestadores-DkHDZXDZ.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"2a4c-wm3OFSdGCAoeHwTKi1EJLmOqwy4"',
    "mtime": "2026-06-27T16:30:13.938Z",
    "size": 10828,
    "path": "../public/assets/_authenticated.prestadores-DkHDZXDZ.js"
  },
  "/assets/_authenticated.prospeccao-BKyID7JT.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"5564-DeDYzFE4rZl2AJ66Zf/LSvwFbwk"',
    "mtime": "2026-06-27T16:30:13.938Z",
    "size": 21860,
    "path": "../public/assets/_authenticated.prospeccao-BKyID7JT.js"
  },
  "/assets/_authenticated.projetos-DlcuDhTu.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"994f-bIFYiMYZhTqO5HvB3W7makma/L8"',
    "mtime": "2026-06-27T16:30:13.938Z",
    "size": 39247,
    "path": "../public/assets/_authenticated.projetos-DlcuDhTu.js"
  },
  "/assets/badge-DFLL-0Uh.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"2513-lPljDdOEAiTi00fxZcH9XiLI+IY"',
    "mtime": "2026-06-27T16:30:13.938Z",
    "size": 9491,
    "path": "../public/assets/badge-DFLL-0Uh.js"
  },
  "/assets/card-DUC20qa_.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"400-Z2sRnj2z+eoGPQchbNgHAcTV0mY"',
    "mtime": "2026-06-27T16:30:13.938Z",
    "size": 1024,
    "path": "../public/assets/card-DUC20qa_.js"
  },
  "/assets/circle-check-CmvCC_0q.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"ae-BCvc9GYVG0j72SSArCkFH80lEws"',
    "mtime": "2026-06-27T16:30:13.938Z",
    "size": 174,
    "path": "../public/assets/circle-check-CmvCC_0q.js"
  },
  "/assets/core.esm-DPf5Ry8W.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"a575-40OJ6h0MAsxz6L4h5l7Y+cK3ACE"',
    "mtime": "2026-06-27T16:30:13.938Z",
    "size": 42357,
    "path": "../public/assets/core.esm-DPf5Ry8W.js"
  },
  "/assets/domain-CW-s_PzB.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"eae-0l1069ggea9U7epRTmqhgPBC8PE"',
    "mtime": "2026-06-27T16:30:13.938Z",
    "size": 3758,
    "path": "../public/assets/domain-CW-s_PzB.js"
  },
  "/assets/especialidade-multiselect-Bf8zqDyg.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"7a05-Bz5qIdyNSo3Ak0TFAa5z+hF41vI"',
    "mtime": "2026-06-27T16:30:13.938Z",
    "size": 31237,
    "path": "../public/assets/especialidade-multiselect-Bf8zqDyg.js"
  },
  "/assets/index.esm-DpdFMGWb.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"6940-OoUbjHu5ch5MmPhw2hUCVcYpzKA"',
    "mtime": "2026-06-27T16:30:13.938Z",
    "size": 26944,
    "path": "../public/assets/index.esm-DpdFMGWb.js"
  },
  "/assets/inter-cyrillic-ext-wght-normal-BOeWTOD4.woff2": {
    "type": "font/woff2",
    "etag": '"6568-cF1iUGbboMFZ8TfnP5HiMgl9II0"',
    "mtime": "2026-06-27T16:30:13.934Z",
    "size": 25960,
    "path": "../public/assets/inter-cyrillic-ext-wght-normal-BOeWTOD4.woff2"
  },
  "/assets/inter-cyrillic-wght-normal-DqGufNeO.woff2": {
    "type": "font/woff2",
    "etag": '"493c-n3Oy9D6jvzfMjpClqox+Zo7ERQQ"',
    "mtime": "2026-06-27T16:30:13.938Z",
    "size": 18748,
    "path": "../public/assets/inter-cyrillic-wght-normal-DqGufNeO.woff2"
  },
  "/assets/inter-greek-ext-wght-normal-DlzME5K_.woff2": {
    "type": "font/woff2",
    "etag": '"2be0-BP5iTzJeB8nLqYAgKpWNi5o1Zm8"',
    "mtime": "2026-06-27T16:30:13.938Z",
    "size": 11232,
    "path": "../public/assets/inter-greek-ext-wght-normal-DlzME5K_.woff2"
  },
  "/assets/inter-greek-wght-normal-CkhJZR-_.woff2": {
    "type": "font/woff2",
    "etag": '"4a34-xor/hj4YNqI52zFecXnUbzQ4Xs4"',
    "mtime": "2026-06-27T16:30:13.938Z",
    "size": 18996,
    "path": "../public/assets/inter-greek-wght-normal-CkhJZR-_.woff2"
  },
  "/assets/inter-vietnamese-wght-normal-CBcvBZtf.woff2": {
    "type": "font/woff2",
    "etag": '"280c-nBythjoDQ0+5wVAendJ6wU7Xz2M"',
    "mtime": "2026-06-27T16:30:13.938Z",
    "size": 10252,
    "path": "../public/assets/inter-vietnamese-wght-normal-CBcvBZtf.woff2"
  },
  "/assets/inter-latin-wght-normal-Dx4kXJAl.woff2": {
    "type": "font/woff2",
    "etag": '"bc80-8R1ym7Ck2DUNLqPQ/AYs9u8tUpg"',
    "mtime": "2026-06-27T16:30:13.938Z",
    "size": 48256,
    "path": "../public/assets/inter-latin-wght-normal-Dx4kXJAl.woff2"
  },
  "/assets/label-B-rCcYFm.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"413-1pNo1LUI5aCnLSpnYisazGqkBRo"',
    "mtime": "2026-06-27T16:30:13.938Z",
    "size": 1043,
    "path": "../public/assets/label-B-rCcYFm.js"
  },
  "/assets/link-vnH1SIKw.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"fd-Mu0ygWHzYRxXPABIflzQ0UtrNYk"',
    "mtime": "2026-06-27T16:30:13.938Z",
    "size": 253,
    "path": "../public/assets/link-vnH1SIKw.js"
  },
  "/assets/inter-latin-ext-wght-normal-DO1Apj_S.woff2": {
    "type": "font/woff2",
    "etag": '"14c4c-zz61D7IQFMB9QxHvTAOk/Vh4ibQ"',
    "mtime": "2026-06-27T16:30:13.938Z",
    "size": 85068,
    "path": "../public/assets/inter-latin-ext-wght-normal-DO1Apj_S.woff2"
  },
  "/assets/loader-circle-Bu3EZh4S.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"8c-ot16DQAae4bGS2dICfzIpz/HM7I"',
    "mtime": "2026-06-27T16:30:13.938Z",
    "size": 140,
    "path": "../public/assets/loader-circle-Bu3EZh4S.js"
  },
  "/assets/index-Dinyd79-.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"b8a56-NhZnYNwPb9h8TyH/ppdHVwTdSZI"',
    "mtime": "2026-06-27T16:30:13.938Z",
    "size": 756310,
    "path": "../public/assets/index-Dinyd79-.js"
  },
  "/assets/search-DLDu-mUc.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"a9-X4b1h4SKzy4KzSwHWSqafJ0729k"',
    "mtime": "2026-06-27T16:30:13.938Z",
    "size": 169,
    "path": "../public/assets/search-DLDu-mUc.js"
  },
  "/assets/login-UxMxTDui.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"115c-qtGzL3GJ/Z2TywHrOXu1NcwGAF8"',
    "mtime": "2026-06-27T16:30:13.938Z",
    "size": 4444,
    "path": "../public/assets/login-UxMxTDui.js"
  },
  "/assets/sparkles-DpNUe7HS.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"1f9-i0esz0w33o8/HyddZ+FDKSiZkjk"',
    "mtime": "2026-06-27T16:30:13.938Z",
    "size": 505,
    "path": "../public/assets/sparkles-DpNUe7HS.js"
  },
  "/assets/styles-BJclclKy.css": {
    "type": "text/css; charset=utf-8",
    "etag": '"fc62-eSCDradJR2neUJ20ElTwD2kPHYI"',
    "mtime": "2026-06-27T16:30:13.938Z",
    "size": 64610,
    "path": "../public/assets/styles-BJclclKy.css"
  },
  "/assets/table-Dt0vzMyr.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"479-wpZcwwC68IGcUq66Vv30RTt2cAc"',
    "mtime": "2026-06-27T16:30:13.938Z",
    "size": 1145,
    "path": "../public/assets/table-Dt0vzMyr.js"
  },
  "/assets/use-auth-BQu0KLEu.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"2de-VbFHFpwaXo/88br9q+mkAbsyql4"',
    "mtime": "2026-06-27T16:30:13.938Z",
    "size": 734,
    "path": "../public/assets/use-auth-BQu0KLEu.js"
  },
  "/assets/tabs-BMW8ZXdZ.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"1a4f-iCUjeMkjZoUdFtGeIkW8ajn8mXs"',
    "mtime": "2026-06-27T16:30:13.938Z",
    "size": 6735,
    "path": "../public/assets/tabs-BMW8ZXdZ.js"
  },
  "/assets/users-Dw1M63Af.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"12d-ip2q6CGPiddmwVYSC/4XtPCjUSs"',
    "mtime": "2026-06-27T16:30:13.938Z",
    "size": 301,
    "path": "../public/assets/users-Dw1M63Af.js"
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
