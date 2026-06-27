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
  "/assets/_authenticated-DSZIbeHk.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"1437-Wfyn+MNLWHWDBT1t6FIo5z/h/0M"',
    "mtime": "2026-06-27T16:02:01.525Z",
    "size": 5175,
    "path": "../public/assets/_authenticated-DSZIbeHk.js"
  },
  "/assets/_authenticated.admin-BXUY6OPJ.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"2fba-XiNFWn1+EloKZwlFDnL+4N8eBhQ"',
    "mtime": "2026-06-27T16:02:01.529Z",
    "size": 12218,
    "path": "../public/assets/_authenticated.admin-BXUY6OPJ.js"
  },
  "/assets/_authenticated.prestadores-Bwf_FEI6.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"2a4c-fJOJdkyCfMjifEDYjKhq8DFNFxU"',
    "mtime": "2026-06-27T16:02:01.525Z",
    "size": 10828,
    "path": "../public/assets/_authenticated.prestadores-Bwf_FEI6.js"
  },
  "/assets/_authenticated.meu-perfil-Dz-UaO28.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"3c5-Bq17WY7Uu52ktAc8UgaysSpiNos"',
    "mtime": "2026-06-27T16:02:01.525Z",
    "size": 965,
    "path": "../public/assets/_authenticated.meu-perfil-Dz-UaO28.js"
  },
  "/assets/_authenticated.projetos-CHaQDpKa.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"994f-DwAYwzzB+sOmimM03rPvmn4mYLA"',
    "mtime": "2026-06-27T16:02:01.525Z",
    "size": 39247,
    "path": "../public/assets/_authenticated.projetos-CHaQDpKa.js"
  },
  "/assets/_authenticated.dashboard-DQrI9ct_.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"65c44-CI6Vu7uF2jTMKYxdehtAblTthf0"',
    "mtime": "2026-06-27T16:02:01.525Z",
    "size": 416836,
    "path": "../public/assets/_authenticated.dashboard-DQrI9ct_.js"
  },
  "/assets/card-DjrlukJJ.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"400-tIphl+BBov0CcMoEirKWHt6yo88"',
    "mtime": "2026-06-27T16:02:01.529Z",
    "size": 1024,
    "path": "../public/assets/card-DjrlukJJ.js"
  },
  "/assets/_authenticated.prospeccao-DbojO3W-.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"5564-Iai5/Hz+rvIP1iCJV6XgYmypp6w"',
    "mtime": "2026-06-27T16:02:01.525Z",
    "size": 21860,
    "path": "../public/assets/_authenticated.prospeccao-DbojO3W-.js"
  },
  "/assets/badge-D9BklaEk.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"2513-8OQ3ptFB64ee1RF5HU8r/TcwcXM"',
    "mtime": "2026-06-27T16:02:01.529Z",
    "size": 9491,
    "path": "../public/assets/badge-D9BklaEk.js"
  },
  "/assets/especialidade-multiselect-ExBNSwiz.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"7a26-CmtIikZAvyHr6O4QyqujnUmD3PM"',
    "mtime": "2026-06-27T16:02:01.525Z",
    "size": 31270,
    "path": "../public/assets/especialidade-multiselect-ExBNSwiz.js"
  },
  "/assets/circle-check-BbfvwGGS.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"ae-zW2gOpH3UddhPpajhhJETK3Z14M"',
    "mtime": "2026-06-27T16:02:01.525Z",
    "size": 174,
    "path": "../public/assets/circle-check-BbfvwGGS.js"
  },
  "/assets/domain-Be1JidJO.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"eae-8Mf54hXqhjSrg79EznQlRe1e+uc"',
    "mtime": "2026-06-27T16:02:01.529Z",
    "size": 3758,
    "path": "../public/assets/domain-Be1JidJO.js"
  },
  "/assets/core.esm-D2k0stry.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"a575-DIIuFTDRDf7oCkwA0ET7rPFu7Hg"',
    "mtime": "2026-06-27T16:02:01.525Z",
    "size": 42357,
    "path": "../public/assets/core.esm-D2k0stry.js"
  },
  "/assets/index.esm-CL_6TlSL.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"6940-se7HXXumGMZ356NhcwYPJMsZ2pY"',
    "mtime": "2026-06-27T16:02:01.525Z",
    "size": 26944,
    "path": "../public/assets/index.esm-CL_6TlSL.js"
  },
  "/assets/inter-cyrillic-wght-normal-DqGufNeO.woff2": {
    "type": "font/woff2",
    "etag": '"493c-n3Oy9D6jvzfMjpClqox+Zo7ERQQ"',
    "mtime": "2026-06-27T16:02:01.525Z",
    "size": 18748,
    "path": "../public/assets/inter-cyrillic-wght-normal-DqGufNeO.woff2"
  },
  "/assets/inter-cyrillic-ext-wght-normal-BOeWTOD4.woff2": {
    "type": "font/woff2",
    "etag": '"6568-cF1iUGbboMFZ8TfnP5HiMgl9II0"',
    "mtime": "2026-06-27T16:02:01.521Z",
    "size": 25960,
    "path": "../public/assets/inter-cyrillic-ext-wght-normal-BOeWTOD4.woff2"
  },
  "/assets/inter-greek-ext-wght-normal-DlzME5K_.woff2": {
    "type": "font/woff2",
    "etag": '"2be0-BP5iTzJeB8nLqYAgKpWNi5o1Zm8"',
    "mtime": "2026-06-27T16:02:01.525Z",
    "size": 11232,
    "path": "../public/assets/inter-greek-ext-wght-normal-DlzME5K_.woff2"
  },
  "/assets/inter-greek-wght-normal-CkhJZR-_.woff2": {
    "type": "font/woff2",
    "etag": '"4a34-xor/hj4YNqI52zFecXnUbzQ4Xs4"',
    "mtime": "2026-06-27T16:02:01.525Z",
    "size": 18996,
    "path": "../public/assets/inter-greek-wght-normal-CkhJZR-_.woff2"
  },
  "/assets/inter-latin-ext-wght-normal-DO1Apj_S.woff2": {
    "type": "font/woff2",
    "etag": '"14c4c-zz61D7IQFMB9QxHvTAOk/Vh4ibQ"',
    "mtime": "2026-06-27T16:02:01.529Z",
    "size": 85068,
    "path": "../public/assets/inter-latin-ext-wght-normal-DO1Apj_S.woff2"
  },
  "/assets/inter-latin-wght-normal-Dx4kXJAl.woff2": {
    "type": "font/woff2",
    "etag": '"bc80-8R1ym7Ck2DUNLqPQ/AYs9u8tUpg"',
    "mtime": "2026-06-27T16:02:01.525Z",
    "size": 48256,
    "path": "../public/assets/inter-latin-wght-normal-Dx4kXJAl.woff2"
  },
  "/assets/label-biEzgvj7.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"413-Si4pkAquCv7fmFxXeB0WFouDMmc"',
    "mtime": "2026-06-27T16:02:01.529Z",
    "size": 1043,
    "path": "../public/assets/label-biEzgvj7.js"
  },
  "/assets/inter-vietnamese-wght-normal-CBcvBZtf.woff2": {
    "type": "font/woff2",
    "etag": '"280c-nBythjoDQ0+5wVAendJ6wU7Xz2M"',
    "mtime": "2026-06-27T16:02:01.525Z",
    "size": 10252,
    "path": "../public/assets/inter-vietnamese-wght-normal-CBcvBZtf.woff2"
  },
  "/assets/link-DJM1BHRp.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"fd-TDE9a8gShvpLXNATotPEu6XJL9A"',
    "mtime": "2026-06-27T16:02:01.525Z",
    "size": 253,
    "path": "../public/assets/link-DJM1BHRp.js"
  },
  "/assets/loader-circle-_KvnUKkb.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"8c-6eimTo5oDsmGmDWycFr+b4AtBak"',
    "mtime": "2026-06-27T16:02:01.529Z",
    "size": 140,
    "path": "../public/assets/loader-circle-_KvnUKkb.js"
  },
  "/assets/index-D0SxSk1B.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"b8a56-uPbhY1y2TTOetNOSUaKwsyDmupQ"',
    "mtime": "2026-06-27T16:02:01.529Z",
    "size": 756310,
    "path": "../public/assets/index-D0SxSk1B.js"
  },
  "/assets/login-BoBxfR2Y.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"115c-EXaXtlwyKj0Sj2FytiILFA8VTzk"',
    "mtime": "2026-06-27T16:02:01.525Z",
    "size": 4444,
    "path": "../public/assets/login-BoBxfR2Y.js"
  },
  "/assets/search-T1-W2i74.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"a9-V0oCPslPI2V6UxpNXInbyKxXlKI"',
    "mtime": "2026-06-27T16:02:01.529Z",
    "size": 169,
    "path": "../public/assets/search-T1-W2i74.js"
  },
  "/assets/sparkles-8fYX6q3s.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"1f9-2I2uJn9VFtSEVBQ55+HFKaBO77g"',
    "mtime": "2026-06-27T16:02:01.529Z",
    "size": 505,
    "path": "../public/assets/sparkles-8fYX6q3s.js"
  },
  "/assets/styles-BJclclKy.css": {
    "type": "text/css; charset=utf-8",
    "etag": '"fc62-eSCDradJR2neUJ20ElTwD2kPHYI"',
    "mtime": "2026-06-27T16:02:01.525Z",
    "size": 64610,
    "path": "../public/assets/styles-BJclclKy.css"
  },
  "/assets/table-CLgZtDsk.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"479-o2stJP2lmA/50JaKlGhRPhmz2CA"',
    "mtime": "2026-06-27T16:02:01.529Z",
    "size": 1145,
    "path": "../public/assets/table-CLgZtDsk.js"
  },
  "/assets/tabs-C4K_Twyk.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"1a4f-o9miLH5fE7tthKYRcnvdUyzyQVY"',
    "mtime": "2026-06-27T16:02:01.529Z",
    "size": 6735,
    "path": "../public/assets/tabs-C4K_Twyk.js"
  },
  "/assets/use-auth-CHFT-kM2.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"2de-sZ/VTH7EHYHJxcQIqcAEQumkEkA"',
    "mtime": "2026-06-27T16:02:01.529Z",
    "size": 734,
    "path": "../public/assets/use-auth-CHFT-kM2.js"
  },
  "/assets/users-DDQkF6q_.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"12d-gxaT8NWGGXcVxlOg8bAGmtFsgNE"',
    "mtime": "2026-06-27T16:02:01.529Z",
    "size": 301,
    "path": "../public/assets/users-DDQkF6q_.js"
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
