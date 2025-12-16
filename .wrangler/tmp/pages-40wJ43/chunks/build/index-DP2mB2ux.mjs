import { v as hash } from '../nitro/nitro.mjs';
import { f as fetchDefaults, c as useNuxtApp, d as asyncDataDefaults, e as createError } from './server.mjs';
import { d as defineComponent, B as useSSRContext, b as ref, J as ssrRenderAttrs, H as mergeProps, D as ssrRenderComponent, L as ssrRenderList, M as withAsyncContext, u as unref, N as ssrRenderAttr, O as ssrInterpolate, P as ssrRenderStyle, c as computed, Q as toValue, r as reactive, s as shallowRef, t as toRef, j as getCurrentInstance, C as onServerPrefetch } from '../routes/renderer.mjs';

const _sfc_main$7 = /* @__PURE__ */ defineComponent({
  __name: "Navigation",
  __ssrInlineRender: true,
  setup(__props) {
    const scrolled = ref(false);
    const mobileMenuOpen = ref(false);
    const navLinks = [
      { id: "hero", label: "\u9996\u9875" },
      { id: "about", label: "\u5173\u4E8E" },
      { id: "skills", label: "\u6280\u80FD" },
      { id: "projects", label: "\u4F5C\u54C1" },
      { id: "experience", label: "\u7ECF\u5386" },
      { id: "contact", label: "\u8054\u7CFB" }
    ];
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<nav${ssrRenderAttrs(mergeProps({
        class: ["fixed top-0 left-0 right-0 z-50 glass backdrop-blur-lg transition-all duration-300", { "bg-slate-900/80": scrolled.value }]
      }, _attrs))}><div class="container mx-auto px-4 py-4"><div class="flex items-center justify-between"><div class="text-2xl font-bold text-gradient"> \u4E2A\u4EBA\u4F5C\u54C1\u96C6 </div><div class="hidden md:flex gap-6"><!--[-->`);
      ssrRenderList(navLinks, (link) => {
        _push(`<a${ssrRenderAttr("href", `#${link.id}`)} class="text-gray-300 hover:text-purple-400 transition-colors duration-300">${ssrInterpolate(link.label)}</a>`);
      });
      _push(`<!--]--></div><button class="md:hidden text-white"><svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path></svg></button></div>`);
      if (mobileMenuOpen.value) {
        _push(`<div class="md:hidden mt-4 space-y-2"><!--[-->`);
        ssrRenderList(navLinks, (link) => {
          _push(`<a${ssrRenderAttr("href", `#${link.id}`)} class="block py-2 text-gray-300 hover:text-purple-400 transition-colors">${ssrInterpolate(link.label)}</a>`);
        });
        _push(`<!--]--></div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div></nav>`);
    };
  }
});
const _sfc_setup$7 = _sfc_main$7.setup;
_sfc_main$7.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/Navigation.vue");
  return _sfc_setup$7 ? _sfc_setup$7(props, ctx) : void 0;
};
function useRequestEvent(nuxtApp = useNuxtApp()) {
  var _a;
  return (_a = nuxtApp.ssrContext) == null ? void 0 : _a.event;
}
function useRequestFetch() {
  var _a;
  return ((_a = useRequestEvent()) == null ? void 0 : _a.$fetch) || globalThis.$fetch;
}
const isDefer = (dedupe) => dedupe === "defer" || dedupe === false;
function useAsyncData(...args) {
  var _a2, _b2, _c, _d, _e, _f, _g, _h, _i;
  var _b;
  const autoKey = typeof args[args.length - 1] === "string" ? args.pop() : void 0;
  if (typeof args[0] !== "string") {
    args.unshift(autoKey);
  }
  let [key, _handler, options = {}] = args;
  if (typeof key !== "string") {
    throw new TypeError("[nuxt] [asyncData] key must be a string.");
  }
  if (typeof _handler !== "function") {
    throw new TypeError("[nuxt] [asyncData] handler must be a function.");
  }
  const nuxtApp = useNuxtApp();
  const handler = _handler ;
  const getDefault = () => asyncDataDefaults.value;
  const getDefaultCachedData = () => nuxtApp.isHydrating ? nuxtApp.payload.data[key] : nuxtApp.static.data[key];
  options.server = (_a2 = options.server) != null ? _a2 : true;
  options.default = (_b2 = options.default) != null ? _b2 : getDefault;
  options.getCachedData = (_c = options.getCachedData) != null ? _c : getDefaultCachedData;
  options.lazy = (_d = options.lazy) != null ? _d : false;
  options.immediate = (_e = options.immediate) != null ? _e : true;
  options.deep = (_f = options.deep) != null ? _f : asyncDataDefaults.deep;
  options.dedupe = (_g = options.dedupe) != null ? _g : "cancel";
  const hasCachedData = () => options.getCachedData(key, nuxtApp) != null;
  if (!nuxtApp._asyncData[key] || !options.immediate) {
    (_h = (_b = nuxtApp.payload._errors)[key]) != null ? _h : _b[key] = asyncDataDefaults.errorValue;
    const _ref = options.deep ? ref : shallowRef;
    nuxtApp._asyncData[key] = {
      data: _ref((_i = options.getCachedData(key, nuxtApp)) != null ? _i : options.default()),
      pending: ref(!hasCachedData()),
      error: toRef(nuxtApp.payload._errors, key),
      status: ref("idle"),
      _default: options.default
    };
  }
  const asyncData = { ...nuxtApp._asyncData[key] };
  delete asyncData._default;
  asyncData.refresh = asyncData.execute = (opts = {}) => {
    var _a3;
    if (nuxtApp._asyncDataPromises[key]) {
      if (isDefer((_a3 = opts.dedupe) != null ? _a3 : options.dedupe)) {
        return nuxtApp._asyncDataPromises[key];
      }
      nuxtApp._asyncDataPromises[key].cancelled = true;
    }
    if ((opts._initial || nuxtApp.isHydrating && opts._initial !== false) && hasCachedData()) {
      return Promise.resolve(options.getCachedData(key, nuxtApp));
    }
    asyncData.pending.value = true;
    asyncData.status.value = "pending";
    const promise = new Promise(
      (resolve, reject) => {
        try {
          resolve(handler(nuxtApp));
        } catch (err) {
          reject(err);
        }
      }
    ).then(async (_result) => {
      if (promise.cancelled) {
        return nuxtApp._asyncDataPromises[key];
      }
      let result = _result;
      if (options.transform) {
        result = await options.transform(_result);
      }
      if (options.pick) {
        result = pick(result, options.pick);
      }
      nuxtApp.payload.data[key] = result;
      asyncData.data.value = result;
      asyncData.error.value = asyncDataDefaults.errorValue;
      asyncData.status.value = "success";
    }).catch((error) => {
      if (promise.cancelled) {
        return nuxtApp._asyncDataPromises[key];
      }
      asyncData.error.value = createError(error);
      asyncData.data.value = unref(options.default());
      asyncData.status.value = "error";
    }).finally(() => {
      if (promise.cancelled) {
        return;
      }
      asyncData.pending.value = false;
      delete nuxtApp._asyncDataPromises[key];
    });
    nuxtApp._asyncDataPromises[key] = promise;
    return nuxtApp._asyncDataPromises[key];
  };
  asyncData.clear = () => clearNuxtDataByKey(nuxtApp, key);
  const initialFetch = () => asyncData.refresh({ _initial: true });
  const fetchOnServer = options.server !== false && nuxtApp.payload.serverRendered;
  if (fetchOnServer && options.immediate) {
    const promise = initialFetch();
    if (getCurrentInstance()) {
      onServerPrefetch(() => promise);
    } else {
      nuxtApp.hook("app:created", async () => {
        await promise;
      });
    }
  }
  const asyncDataPromise = Promise.resolve(nuxtApp._asyncDataPromises[key]).then(() => asyncData);
  Object.assign(asyncDataPromise, asyncData);
  return asyncDataPromise;
}
function clearNuxtDataByKey(nuxtApp, key) {
  if (key in nuxtApp.payload.data) {
    nuxtApp.payload.data[key] = void 0;
  }
  if (key in nuxtApp.payload._errors) {
    nuxtApp.payload._errors[key] = asyncDataDefaults.errorValue;
  }
  if (nuxtApp._asyncData[key]) {
    nuxtApp._asyncData[key].data.value = void 0;
    nuxtApp._asyncData[key].error.value = asyncDataDefaults.errorValue;
    nuxtApp._asyncData[key].pending.value = false;
    nuxtApp._asyncData[key].status.value = "idle";
  }
  if (key in nuxtApp._asyncDataPromises) {
    nuxtApp._asyncDataPromises[key].cancelled = true;
    nuxtApp._asyncDataPromises[key] = void 0;
  }
}
function pick(obj, keys) {
  const newObj = {};
  for (const key of keys) {
    newObj[key] = obj[key];
  }
  return newObj;
}
function useFetch(request, arg1, arg2) {
  const [opts = {}, autoKey] = typeof arg1 === "string" ? [{}, arg1] : [arg1, arg2];
  const _request = computed(() => toValue(request));
  const _key = opts.key || hash([autoKey, typeof _request.value === "string" ? _request.value : "", ...generateOptionSegments(opts)]);
  if (!_key || typeof _key !== "string") {
    throw new TypeError("[nuxt] [useFetch] key must be a string: " + _key);
  }
  if (!request) {
    throw new Error("[nuxt] [useFetch] request is missing.");
  }
  const key = _key === autoKey ? "$f" + _key : _key;
  if (!opts.baseURL && typeof _request.value === "string" && (_request.value[0] === "/" && _request.value[1] === "/")) {
    throw new Error('[nuxt] [useFetch] the request URL must not start with "//".');
  }
  const {
    server,
    lazy,
    default: defaultFn,
    transform,
    pick: pick2,
    watch,
    immediate,
    getCachedData,
    deep,
    dedupe,
    ...fetchOptions
  } = opts;
  const _fetchOptions = reactive({
    ...fetchDefaults,
    ...fetchOptions,
    cache: typeof opts.cache === "boolean" ? void 0 : opts.cache
  });
  const _asyncDataOptions = {
    server,
    lazy,
    default: defaultFn,
    transform,
    pick: pick2,
    immediate,
    getCachedData,
    deep,
    dedupe,
    watch: watch === false ? [] : [_fetchOptions, _request, ...watch || []]
  };
  let controller;
  const asyncData = useAsyncData(key, () => {
    var _a;
    (_a = controller == null ? void 0 : controller.abort) == null ? void 0 : _a.call(controller);
    controller = typeof AbortController !== "undefined" ? new AbortController() : {};
    const timeoutLength = toValue(opts.timeout);
    let timeoutId;
    if (timeoutLength) {
      timeoutId = setTimeout(() => controller.abort(), timeoutLength);
      controller.signal.onabort = () => clearTimeout(timeoutId);
    }
    let _$fetch = opts.$fetch || globalThis.$fetch;
    if (!opts.$fetch) {
      const isLocalFetch = typeof _request.value === "string" && _request.value[0] === "/" && (!toValue(opts.baseURL) || toValue(opts.baseURL)[0] === "/");
      if (isLocalFetch) {
        _$fetch = useRequestFetch();
      }
    }
    return _$fetch(_request.value, { signal: controller.signal, ..._fetchOptions }).finally(() => {
      clearTimeout(timeoutId);
    });
  }, _asyncDataOptions);
  return asyncData;
}
function generateOptionSegments(opts) {
  var _a;
  const segments = [
    ((_a = toValue(opts.method)) == null ? void 0 : _a.toUpperCase()) || "GET",
    toValue(opts.baseURL)
  ];
  for (const _obj of [opts.params || opts.query]) {
    const obj = toValue(_obj);
    if (!obj) {
      continue;
    }
    const unwrapped = {};
    for (const [key, value] of Object.entries(obj)) {
      unwrapped[toValue(key)] = toValue(value);
    }
    segments.push(unwrapped);
  }
  return segments;
}
const _sfc_main$6 = /* @__PURE__ */ defineComponent({
  __name: "HeroSection",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    const { data: profile } = ([__temp, __restore] = withAsyncContext(() => useFetch("/api/profile", "$YoxT358Xwn")), __temp = await __temp, __restore(), __temp);
    return (_ctx, _push, _parent, _attrs) => {
      if (unref(profile)) {
        _push(`<section${ssrRenderAttrs(mergeProps({
          class: "min-h-screen flex items-center justify-center relative overflow-hidden",
          id: "hero"
        }, _attrs))}><div class="container mx-auto px-4 text-center z-10"><div class="animate-fade-in"><div class="mb-6 animate-float"><img${ssrRenderAttr("src", unref(profile).avatar)}${ssrRenderAttr("alt", unref(profile).name)} class="w-32 h-32 rounded-full mx-auto border-4 border-purple-400/50 glow"></div><h1 class="text-6xl md:text-8xl font-bold mb-4 text-gradient animate-slide-up">${ssrInterpolate(unref(profile).name)}</h1><p class="text-2xl md:text-3xl text-purple-300 mb-8 animate-slide-up" style="${ssrRenderStyle({ "animation-delay": "0.2s" })}">${ssrInterpolate(unref(profile).title)}</p><p class="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto mb-12 animate-slide-up" style="${ssrRenderStyle({ "animation-delay": "0.4s" })}">${ssrInterpolate(unref(profile).bio)}</p><div class="flex gap-4 justify-center animate-slide-up" style="${ssrRenderStyle({ "animation-delay": "0.6s" })}"><!--[-->`);
        ssrRenderList(unref(profile).social, (url, platform) => {
          _push(`<a${ssrRenderAttr("href", url)} target="_blank" class="glass px-6 py-3 rounded-full hover:scale-110 transition-transform duration-300">${ssrInterpolate(platform)}</a>`);
        });
        _push(`<!--]--></div><div class="mt-16 animate-bounce"><a href="#about" class="text-4xl">\u2193</a></div></div></div></section>`);
      } else {
        _push(`<!---->`);
      }
    };
  }
});
const _sfc_setup$6 = _sfc_main$6.setup;
_sfc_main$6.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/HeroSection.vue");
  return _sfc_setup$6 ? _sfc_setup$6(props, ctx) : void 0;
};
const _sfc_main$5 = /* @__PURE__ */ defineComponent({
  __name: "AboutSection",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    const { data: profile } = ([__temp, __restore] = withAsyncContext(() => useFetch("/api/profile", "$1U7kbHVlZu")), __temp = await __temp, __restore(), __temp);
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<section${ssrRenderAttrs(mergeProps({
        class: "min-h-screen flex items-center justify-center py-20",
        id: "about",
        "data-animate": ""
      }, _attrs))}><div class="container mx-auto px-4"><div class="glass rounded-3xl p-12 max-w-4xl mx-auto"><h2 class="text-5xl font-bold mb-8 text-gradient text-center"> \u5173\u4E8E\u6211 </h2>`);
      if (unref(profile)) {
        _push(`<div class="space-y-6 text-lg text-gray-300"><p>${ssrInterpolate(unref(profile).bio)}</p><div class="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8"><div class="glass p-6 rounded-xl"><h3 class="text-xl font-semibold mb-2 text-purple-300">\u{1F4CD} \u4F4D\u7F6E</h3><p>${ssrInterpolate(unref(profile).location)}</p></div><div class="glass p-6 rounded-xl"><h3 class="text-xl font-semibold mb-2 text-purple-300">\u{1F4E7} \u90AE\u7BB1</h3><a${ssrRenderAttr("href", `mailto:${unref(profile).email}`)} class="hover:text-purple-400 transition-colors">${ssrInterpolate(unref(profile).email)}</a></div></div></div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div></div></section>`);
    };
  }
});
const _sfc_setup$5 = _sfc_main$5.setup;
_sfc_main$5.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/AboutSection.vue");
  return _sfc_setup$5 ? _sfc_setup$5(props, ctx) : void 0;
};
const _sfc_main$4 = /* @__PURE__ */ defineComponent({
  __name: "SkillsSection",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    const { data: skills } = ([__temp, __restore] = withAsyncContext(() => useFetch("/api/skills", "$K2IhSStwWO")), __temp = await __temp, __restore(), __temp);
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<section${ssrRenderAttrs(mergeProps({
        class: "min-h-screen flex items-center justify-center py-20",
        id: "skills",
        "data-animate": ""
      }, _attrs))}><div class="container mx-auto px-4"><h2 class="text-5xl font-bold mb-16 text-gradient text-center"> \u6280\u80FD\u4E13\u957F </h2>`);
      if (unref(skills)) {
        _push(`<div class="space-y-12"><!--[-->`);
        ssrRenderList(unref(skills), (category, index) => {
          _push(`<div class="glass rounded-2xl p-8"><h3 class="text-3xl font-semibold mb-6 text-purple-300">${ssrInterpolate(category.category)}</h3><div class="grid grid-cols-1 md:grid-cols-2 gap-6"><!--[-->`);
          ssrRenderList(category.items, (skill, skillIndex) => {
            _push(`<div class="space-y-2"><div class="flex items-center justify-between mb-2"><span class="text-lg flex items-center gap-2"><span>${ssrInterpolate(skill.icon)}</span> ${ssrInterpolate(skill.name)}</span><span class="text-purple-400">${ssrInterpolate(skill.level)}%</span></div><div class="h-3 bg-gray-700 rounded-full overflow-hidden"><div class="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-1000" style="${ssrRenderStyle({ width: `${skill.level}%`, animationDelay: `${skillIndex * 0.1}s` })}"></div></div></div>`);
          });
          _push(`<!--]--></div></div>`);
        });
        _push(`<!--]--></div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div></section>`);
    };
  }
});
const _sfc_setup$4 = _sfc_main$4.setup;
_sfc_main$4.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/SkillsSection.vue");
  return _sfc_setup$4 ? _sfc_setup$4(props, ctx) : void 0;
};
const _sfc_main$3 = /* @__PURE__ */ defineComponent({
  __name: "ProjectsSection",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    const { data: projects } = ([__temp, __restore] = withAsyncContext(() => useFetch("/api/projects", "$Vx2cXKUQEh")), __temp = await __temp, __restore(), __temp);
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<section${ssrRenderAttrs(mergeProps({
        class: "min-h-screen flex items-center justify-center py-20",
        id: "projects",
        "data-animate": ""
      }, _attrs))}><div class="container mx-auto px-4"><h2 class="text-5xl font-bold mb-16 text-gradient text-center"> \u4F5C\u54C1\u5C55\u793A </h2>`);
      if (unref(projects)) {
        _push(`<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"><!--[-->`);
        ssrRenderList(unref(projects), (project, index) => {
          _push(`<div class="glass rounded-2xl overflow-hidden group cursor-pointer transform transition-all duration-500 hover:scale-105 hover:glow" style="${ssrRenderStyle({ animationDelay: `${index * 0.1}s` })}"><div class="relative h-64 overflow-hidden"><img${ssrRenderAttr("src", project.image)}${ssrRenderAttr("alt", project.title)} class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110">`);
          if (project.featured) {
            _push(`<div class="absolute top-4 right-4 bg-purple-500 px-3 py-1 rounded-full text-sm font-semibold"> \u7CBE\u9009 </div>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</div><div class="p-6"><h3 class="text-2xl font-bold mb-3 text-purple-300">${ssrInterpolate(project.title)}</h3><p class="text-gray-300 mb-4 line-clamp-3">${ssrInterpolate(project.description)}</p><div class="flex flex-wrap gap-2 mb-4"><!--[-->`);
          ssrRenderList(project.tags, (tag) => {
            _push(`<span class="px-3 py-1 bg-purple-500/30 rounded-full text-sm">${ssrInterpolate(tag)}</span>`);
          });
          _push(`<!--]--></div><a${ssrRenderAttr("href", project.link)} target="_blank" class="inline-flex items-center gap-2 text-purple-400 hover:text-purple-300 transition-colors"> \u67E5\u770B\u9879\u76EE \u2192 </a></div></div>`);
        });
        _push(`<!--]--></div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div></section>`);
    };
  }
});
const _sfc_setup$3 = _sfc_main$3.setup;
_sfc_main$3.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/ProjectsSection.vue");
  return _sfc_setup$3 ? _sfc_setup$3(props, ctx) : void 0;
};
const _sfc_main$2 = /* @__PURE__ */ defineComponent({
  __name: "ExperienceSection",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    const { data: experiences } = ([__temp, __restore] = withAsyncContext(() => useFetch("/api/experience", "$kvAsHNXDBm")), __temp = await __temp, __restore(), __temp);
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<section${ssrRenderAttrs(mergeProps({
        class: "min-h-screen flex items-center justify-center py-20",
        id: "experience",
        "data-animate": ""
      }, _attrs))}><div class="container mx-auto px-4"><h2 class="text-5xl font-bold mb-16 text-gradient text-center"> \u5DE5\u4F5C\u7ECF\u5386 </h2>`);
      if (unref(experiences)) {
        _push(`<div class="max-w-4xl mx-auto space-y-8"><!--[-->`);
        ssrRenderList(unref(experiences), (exp, index) => {
          _push(`<div class="glass rounded-2xl p-8 relative transform transition-all duration-500 hover:scale-105 hover:glow"><div class="flex flex-col md:flex-row md:items-start md:justify-between mb-4"><div><h3 class="text-2xl font-bold text-purple-300 mb-2">${ssrInterpolate(exp.position)}</h3><p class="text-xl text-gray-300 mb-1">${ssrInterpolate(exp.company)}</p></div><span class="text-purple-400 font-semibold mt-2 md:mt-0">${ssrInterpolate(exp.period)}</span></div><p class="text-gray-300 mb-6">${ssrInterpolate(exp.description)}</p><div class="space-y-2"><h4 class="text-lg font-semibold text-purple-300 mb-3">\u4E3B\u8981\u6210\u5C31\uFF1A</h4><ul class="space-y-2"><!--[-->`);
          ssrRenderList(exp.achievements, (achievement, aIndex) => {
            _push(`<li class="flex items-start gap-2 text-gray-300"><span class="text-purple-400 mt-1">\u2713</span><span>${ssrInterpolate(achievement)}</span></li>`);
          });
          _push(`<!--]--></ul></div></div>`);
        });
        _push(`<!--]--></div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div></section>`);
    };
  }
});
const _sfc_setup$2 = _sfc_main$2.setup;
_sfc_main$2.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/ExperienceSection.vue");
  return _sfc_setup$2 ? _sfc_setup$2(props, ctx) : void 0;
};
const _sfc_main$1 = /* @__PURE__ */ defineComponent({
  __name: "ContactSection",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    const { data: profile } = ([__temp, __restore] = withAsyncContext(() => useFetch("/api/profile", "$VPNYE8E9Xt")), __temp = await __temp, __restore(), __temp);
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<section${ssrRenderAttrs(mergeProps({
        class: "min-h-screen flex items-center justify-center py-20",
        id: "contact",
        "data-animate": ""
      }, _attrs))}><div class="container mx-auto px-4"><div class="glass rounded-3xl p-12 max-w-2xl mx-auto text-center"><h2 class="text-5xl font-bold mb-8 text-gradient"> \u8054\u7CFB\u6211 </h2><p class="text-xl text-gray-300 mb-12"> \u6709\u9879\u76EE\u60F3\u6CD5\u6216\u5408\u4F5C\u673A\u4F1A\uFF1F\u6B22\u8FCE\u968F\u65F6\u8054\u7CFB\uFF01 </p>`);
      if (unref(profile)) {
        _push(`<div class="space-y-6"><a${ssrRenderAttr("href", `mailto:${unref(profile).email}`)} class="block glass px-8 py-4 rounded-full text-lg hover:scale-105 transition-transform duration-300"> \u{1F4E7} ${ssrInterpolate(unref(profile).email)}</a><div class="flex gap-4 justify-center mt-8"><!--[-->`);
        ssrRenderList(unref(profile).social, (url, platform) => {
          _push(`<a${ssrRenderAttr("href", url)} target="_blank" class="glass px-6 py-3 rounded-full hover:scale-110 transition-transform duration-300">${ssrInterpolate(platform)}</a>`);
        });
        _push(`<!--]--></div></div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div></div></section>`);
    };
  }
});
const _sfc_setup$1 = _sfc_main$1.setup;
_sfc_main$1.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/ContactSection.vue");
  return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "index",
  __ssrInlineRender: true,
  setup(__props) {
    ref();
    return (_ctx, _push, _parent, _attrs) => {
      const _component_Navigation = _sfc_main$7;
      const _component_HeroSection = _sfc_main$6;
      const _component_AboutSection = _sfc_main$5;
      const _component_SkillsSection = _sfc_main$4;
      const _component_ProjectsSection = _sfc_main$3;
      const _component_ExperienceSection = _sfc_main$2;
      const _component_ContactSection = _sfc_main$1;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "min-h-screen" }, _attrs))}>`);
      _push(ssrRenderComponent(_component_Navigation, null, null, _parent));
      _push(ssrRenderComponent(_component_HeroSection, null, null, _parent));
      _push(ssrRenderComponent(_component_AboutSection, null, null, _parent));
      _push(ssrRenderComponent(_component_SkillsSection, null, null, _parent));
      _push(ssrRenderComponent(_component_ProjectsSection, null, null, _parent));
      _push(ssrRenderComponent(_component_ExperienceSection, null, null, _parent));
      _push(ssrRenderComponent(_component_ContactSection, null, null, _parent));
      _push(`<div class="fixed inset-0 -z-10 opacity-30"></div></div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/index.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=index-DP2mB2ux.mjs.map
