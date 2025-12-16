import { e as createError$1, g as global, l as withQuery, m as hasProtocol, n as isScriptProtocol, o as joinURL, s as sanitizeStatusCode, p as getContext, $ as $fetch, c as createHooks, t as toRouteMatcher, q as createRouter$1, r as defu } from '../nitro/nitro.mjs';
import { s as shallowRef, d as defineComponent, u as unref, a as shallowReactive, r as reactive, i as inject, c as computed, h, p as provide, b as ref, w as watch, n as nextTick, g as getActiveHead, e as baseURL, f as hasInjectionContext, j as getCurrentInstance, k as createApp, t as toRef, o as onErrorCaptured, l as ssrRenderSuspense, m as effectScope, q as isReadonly, v as isReactive, x as toRaw, y as isRef, z as isShallow, A as getCurrentScope, B as useSSRContext, C as onServerPrefetch, D as ssrRenderComponent, E as renderVNode, F as createVNode, G as resolveDynamicComponent, H as mergeProps, I as defineAsyncComponent, J as ssrRenderAttrs, S as Suspense, K as Fragment, T as Transition } from '../routes/renderer.mjs';

/*!
 * vue-router v4.6.4
 * (c) 2025 Eduardo San Martin Morote
 * @license MIT
 */

//#region src/utils/env.ts
const isBrowser = typeof document !== "undefined";
/**
* Allows differentiating lazy components from functional components and vue-class-component
* @internal
*
* @param component
*/
function isRouteComponent(component) {
	return typeof component === "object" || "displayName" in component || "props" in component || "__vccOpts" in component;
}
function isESModule(obj) {
	return obj.__esModule || obj[Symbol.toStringTag] === "Module" || obj.default && isRouteComponent(obj.default);
}
const assign = Object.assign;
function applyToParams(fn, params) {
	const newParams = {};
	for (const key in params) {
		const value = params[key];
		newParams[key] = isArray(value) ? value.map(fn) : fn(value);
	}
	return newParams;
}
const noop = () => {};
/**
* Typesafe alternative to Array.isArray
* https://github.com/microsoft/TypeScript/pull/48228
*
* @internal
*/
const isArray = Array.isArray;
function mergeOptions(defaults, partialOptions) {
	const options = {};
	for (const key in defaults) options[key] = key in partialOptions ? partialOptions[key] : defaults[key];
	return options;
}

//#endregion
//#region src/encoding.ts
/**
* Encoding Rules (␣ = Space)
* - Path: ␣ " < > # ? { }
* - Query: ␣ " < > # & =
* - Hash: ␣ " < > `
*
* On top of that, the RFC3986 (https://tools.ietf.org/html/rfc3986#section-2.2)
* defines some extra characters to be encoded. Most browsers do not encode them
* in encodeURI https://github.com/whatwg/url/issues/369, so it may be safer to
* also encode `!'()*`. Leaving un-encoded only ASCII alphanumeric(`a-zA-Z0-9`)
* plus `-._~`. This extra safety should be applied to query by patching the
* string returned by encodeURIComponent encodeURI also encodes `[\]^`. `\`
* should be encoded to avoid ambiguity. Browsers (IE, FF, C) transform a `\`
* into a `/` if directly typed in. The _backtick_ (`````) should also be
* encoded everywhere because some browsers like FF encode it when directly
* written while others don't. Safari and IE don't encode ``"<>{}``` in hash.
*/
const HASH_RE = /#/g;
const AMPERSAND_RE = /&/g;
const SLASH_RE = /\//g;
const EQUAL_RE = /=/g;
const IM_RE = /\?/g;
const PLUS_RE = /\+/g;
/**
* NOTE: It's not clear to me if we should encode the + symbol in queries, it
* seems to be less flexible than not doing so and I can't find out the legacy
* systems requiring this for regular requests like text/html. In the standard,
* the encoding of the plus character is only mentioned for
* application/x-www-form-urlencoded
* (https://url.spec.whatwg.org/#urlencoded-parsing) and most browsers seems lo
* leave the plus character as is in queries. To be more flexible, we allow the
* plus character on the query, but it can also be manually encoded by the user.
*
* Resources:
* - https://url.spec.whatwg.org/#urlencoded-parsing
* - https://stackoverflow.com/questions/1634271/url-encoding-the-space-character-or-20
*/
const ENC_BRACKET_OPEN_RE = /%5B/g;
const ENC_BRACKET_CLOSE_RE = /%5D/g;
const ENC_CARET_RE = /%5E/g;
const ENC_BACKTICK_RE = /%60/g;
const ENC_CURLY_OPEN_RE = /%7B/g;
const ENC_PIPE_RE = /%7C/g;
const ENC_CURLY_CLOSE_RE = /%7D/g;
const ENC_SPACE_RE = /%20/g;
/**
* Encode characters that need to be encoded on the path, search and hash
* sections of the URL.
*
* @internal
* @param text - string to encode
* @returns encoded string
*/
function commonEncode(text) {
	return text == null ? "" : encodeURI("" + text).replace(ENC_PIPE_RE, "|").replace(ENC_BRACKET_OPEN_RE, "[").replace(ENC_BRACKET_CLOSE_RE, "]");
}
/**
* Encode characters that need to be encoded on the hash section of the URL.
*
* @param text - string to encode
* @returns encoded string
*/
function encodeHash(text) {
	return commonEncode(text).replace(ENC_CURLY_OPEN_RE, "{").replace(ENC_CURLY_CLOSE_RE, "}").replace(ENC_CARET_RE, "^");
}
/**
* Encode characters that need to be encoded query values on the query
* section of the URL.
*
* @param text - string to encode
* @returns encoded string
*/
function encodeQueryValue(text) {
	return commonEncode(text).replace(PLUS_RE, "%2B").replace(ENC_SPACE_RE, "+").replace(HASH_RE, "%23").replace(AMPERSAND_RE, "%26").replace(ENC_BACKTICK_RE, "`").replace(ENC_CURLY_OPEN_RE, "{").replace(ENC_CURLY_CLOSE_RE, "}").replace(ENC_CARET_RE, "^");
}
/**
* Like `encodeQueryValue` but also encodes the `=` character.
*
* @param text - string to encode
*/
function encodeQueryKey(text) {
	return encodeQueryValue(text).replace(EQUAL_RE, "%3D");
}
/**
* Encode characters that need to be encoded on the path section of the URL.
*
* @param text - string to encode
* @returns encoded string
*/
function encodePath(text) {
	return commonEncode(text).replace(HASH_RE, "%23").replace(IM_RE, "%3F");
}
/**
* Encode characters that need to be encoded on the path section of the URL as a
* param. This function encodes everything {@link encodePath} does plus the
* slash (`/`) character. If `text` is `null` or `undefined`, returns an empty
* string instead.
*
* @param text - string to encode
* @returns encoded string
*/
function encodeParam(text) {
	return encodePath(text).replace(SLASH_RE, "%2F");
}
function decode(text) {
	if (text == null) return null;
	try {
		return decodeURIComponent("" + text);
	} catch (err) {
	}
	return "" + text;
}

//#endregion
//#region src/location.ts
const TRAILING_SLASH_RE = /\/$/;
const removeTrailingSlash = (path) => path.replace(TRAILING_SLASH_RE, "");
/**
* Transforms a URI into a normalized history location
*
* @param parseQuery
* @param location - URI to normalize
* @param currentLocation - current absolute location. Allows resolving relative
* paths. Must start with `/`. Defaults to `/`
* @returns a normalized history location
*/
function parseURL(parseQuery$1, location, currentLocation = "/") {
	let path, query = {}, searchString = "", hash = "";
	const hashPos = location.indexOf("#");
	let searchPos = location.indexOf("?");
	searchPos = hashPos >= 0 && searchPos > hashPos ? -1 : searchPos;
	if (searchPos >= 0) {
		path = location.slice(0, searchPos);
		searchString = location.slice(searchPos, hashPos > 0 ? hashPos : location.length);
		query = parseQuery$1(searchString.slice(1));
	}
	if (hashPos >= 0) {
		path = path || location.slice(0, hashPos);
		hash = location.slice(hashPos, location.length);
	}
	path = resolveRelativePath(path != null ? path : location, currentLocation);
	return {
		fullPath: path + searchString + hash,
		path,
		query,
		hash: decode(hash)
	};
}
/**
* Stringifies a URL object
*
* @param stringifyQuery
* @param location
*/
function stringifyURL(stringifyQuery$1, location) {
	const query = location.query ? stringifyQuery$1(location.query) : "";
	return location.path + (query && "?") + query + (location.hash || "");
}
/**
* Checks if two RouteLocation are equal. This means that both locations are
* pointing towards the same {@link RouteRecord} and that all `params`, `query`
* parameters and `hash` are the same
*
* @param stringifyQuery - A function that takes a query object of type LocationQueryRaw and returns a string representation of it.
* @param a - first {@link RouteLocation}
* @param b - second {@link RouteLocation}
*/
function isSameRouteLocation(stringifyQuery$1, a, b) {
	const aLastIndex = a.matched.length - 1;
	const bLastIndex = b.matched.length - 1;
	return aLastIndex > -1 && aLastIndex === bLastIndex && isSameRouteRecord(a.matched[aLastIndex], b.matched[bLastIndex]) && isSameRouteLocationParams(a.params, b.params) && stringifyQuery$1(a.query) === stringifyQuery$1(b.query) && a.hash === b.hash;
}
/**
* Check if two `RouteRecords` are equal. Takes into account aliases: they are
* considered equal to the `RouteRecord` they are aliasing.
*
* @param a - first {@link RouteRecord}
* @param b - second {@link RouteRecord}
*/
function isSameRouteRecord(a, b) {
	return (a.aliasOf || a) === (b.aliasOf || b);
}
function isSameRouteLocationParams(a, b) {
	if (Object.keys(a).length !== Object.keys(b).length) return false;
	for (var key in a) if (!isSameRouteLocationParamsValue(a[key], b[key])) return false;
	return true;
}
function isSameRouteLocationParamsValue(a, b) {
	return isArray(a) ? isEquivalentArray(a, b) : isArray(b) ? isEquivalentArray(b, a) : a?.valueOf() === b?.valueOf();
}
/**
* Check if two arrays are the same or if an array with one single entry is the
* same as another primitive value. Used to check query and parameters
*
* @param a - array of values
* @param b - array of values or a single value
*/
function isEquivalentArray(a, b) {
	return isArray(b) ? a.length === b.length && a.every((value, i) => value === b[i]) : a.length === 1 && a[0] === b;
}
/**
* Resolves a relative path that starts with `.`.
*
* @param to - path location we are resolving
* @param from - currentLocation.path, should start with `/`
*/
function resolveRelativePath(to, from) {
	if (to.startsWith("/")) return to;
	if (!to) return from;
	const fromSegments = from.split("/");
	const toSegments = to.split("/");
	const lastToSegment = toSegments[toSegments.length - 1];
	if (lastToSegment === ".." || lastToSegment === ".") toSegments.push("");
	let position = fromSegments.length - 1;
	let toPosition;
	let segment;
	for (toPosition = 0; toPosition < toSegments.length; toPosition++) {
		segment = toSegments[toPosition];
		if (segment === ".") continue;
		if (segment === "..") {
			if (position > 1) position--;
		} else break;
	}
	return fromSegments.slice(0, position).join("/") + "/" + toSegments.slice(toPosition).join("/");
}
/**
* Initial route location where the router is. Can be used in navigation guards
* to differentiate the initial navigation.
*
* @example
* ```js
* import { START_LOCATION } from 'vue-router'
*
* router.beforeEach((to, from) => {
*   if (from === START_LOCATION) {
*     // initial navigation
*   }
* })
* ```
*/
const START_LOCATION_NORMALIZED = {
	path: "/",
	name: void 0,
	params: {},
	query: {},
	hash: "",
	fullPath: "/",
	matched: [],
	meta: {},
	redirectedFrom: void 0
};

//#endregion
//#region src/history/common.ts
let NavigationType = /* @__PURE__ */ function(NavigationType$1) {
	NavigationType$1["pop"] = "pop";
	NavigationType$1["push"] = "push";
	return NavigationType$1;
}({});
let NavigationDirection = /* @__PURE__ */ function(NavigationDirection$1) {
	NavigationDirection$1["back"] = "back";
	NavigationDirection$1["forward"] = "forward";
	NavigationDirection$1["unknown"] = "";
	return NavigationDirection$1;
}({});
/**
* Starting location for Histories
*/
const START = "";
/**
* Normalizes a base by removing any trailing slash and reading the base tag if
* present.
*
* @param base - base to normalize
*/
function normalizeBase(base) {
	if (!base) if (isBrowser) {
		const baseEl = document.querySelector("base");
		base = baseEl && baseEl.getAttribute("href") || "/";
		base = base.replace(/^\w+:\/\/[^\/]+/, "");
	} else base = "/";
	if (base[0] !== "/" && base[0] !== "#") base = "/" + base;
	return removeTrailingSlash(base);
}
const BEFORE_HASH_RE = /^[^#]+#/;
function createHref(base, location) {
	return base.replace(BEFORE_HASH_RE, "#") + location;
}

//#endregion
//#region src/scrollBehavior.ts
function getElementPosition(el, offset) {
	const docRect = document.documentElement.getBoundingClientRect();
	const elRect = el.getBoundingClientRect();
	return {
		behavior: offset.behavior,
		left: elRect.left - docRect.left - (offset.left || 0),
		top: elRect.top - docRect.top - (offset.top || 0)
	};
}
const computeScrollPosition = () => ({
	left: window.scrollX,
	top: window.scrollY
});
function scrollToPosition(position) {
	let scrollToOptions;
	if ("el" in position) {
		const positionEl = position.el;
		const isIdSelector = typeof positionEl === "string" && positionEl.startsWith("#");
		const el = typeof positionEl === "string" ? isIdSelector ? document.getElementById(positionEl.slice(1)) : document.querySelector(positionEl) : positionEl;
		if (!el) {
			return;
		}
		scrollToOptions = getElementPosition(el, position);
	} else scrollToOptions = position;
	if ("scrollBehavior" in document.documentElement.style) window.scrollTo(scrollToOptions);
	else window.scrollTo(scrollToOptions.left != null ? scrollToOptions.left : window.scrollX, scrollToOptions.top != null ? scrollToOptions.top : window.scrollY);
}
function getScrollKey(path, delta) {
	return (history.state ? history.state.position - delta : -1) + path;
}
const scrollPositions = /* @__PURE__ */ new Map();
function saveScrollPosition(key, scrollPosition) {
	scrollPositions.set(key, scrollPosition);
}
function getSavedScrollPosition(key) {
	const scroll = scrollPositions.get(key);
	scrollPositions.delete(key);
	return scroll;
}
/**
* ScrollBehavior instance used by the router to compute and restore the scroll
* position when navigating.
*/

//#endregion
//#region src/types/typeGuards.ts
function isRouteLocation(route) {
	return typeof route === "string" || route && typeof route === "object";
}
function isRouteName(name) {
	return typeof name === "string" || typeof name === "symbol";
}

//#endregion
//#region src/errors.ts
/**
* Flags so we can combine them when checking for multiple errors. This is the internal version of
* {@link NavigationFailureType}.
*
* @internal
*/
let ErrorTypes = /* @__PURE__ */ function(ErrorTypes$1) {
	ErrorTypes$1[ErrorTypes$1["MATCHER_NOT_FOUND"] = 1] = "MATCHER_NOT_FOUND";
	ErrorTypes$1[ErrorTypes$1["NAVIGATION_GUARD_REDIRECT"] = 2] = "NAVIGATION_GUARD_REDIRECT";
	ErrorTypes$1[ErrorTypes$1["NAVIGATION_ABORTED"] = 4] = "NAVIGATION_ABORTED";
	ErrorTypes$1[ErrorTypes$1["NAVIGATION_CANCELLED"] = 8] = "NAVIGATION_CANCELLED";
	ErrorTypes$1[ErrorTypes$1["NAVIGATION_DUPLICATED"] = 16] = "NAVIGATION_DUPLICATED";
	return ErrorTypes$1;
}({});
const NavigationFailureSymbol = Symbol("");
({
	[ErrorTypes.MATCHER_NOT_FOUND]({ location, currentLocation }) {
		return `No match for\n ${JSON.stringify(location)}${currentLocation ? "\nwhile being at\n" + JSON.stringify(currentLocation) : ""}`;
	},
	[ErrorTypes.NAVIGATION_GUARD_REDIRECT]({ from, to }) {
		return `Redirected from "${from.fullPath}" to "${stringifyRoute(to)}" via a navigation guard.`;
	},
	[ErrorTypes.NAVIGATION_ABORTED]({ from, to }) {
		return `Navigation aborted from "${from.fullPath}" to "${to.fullPath}" via a navigation guard.`;
	},
	[ErrorTypes.NAVIGATION_CANCELLED]({ from, to }) {
		return `Navigation cancelled from "${from.fullPath}" to "${to.fullPath}" with a new navigation.`;
	},
	[ErrorTypes.NAVIGATION_DUPLICATED]({ from, to }) {
		return `Avoided redundant navigation to current location: "${from.fullPath}".`;
	}
});
/**
* Creates a typed NavigationFailure object.
* @internal
* @param type - NavigationFailureType
* @param params - { from, to }
*/
function createRouterError(type, params) {
	return assign(/* @__PURE__ */ new Error(), {
		type,
		[NavigationFailureSymbol]: true
	}, params);
}
function isNavigationFailure(error, type) {
	return error instanceof Error && NavigationFailureSymbol in error && (type == null || !!(error.type & type));
}
const propertiesToLog = [
	"params",
	"query",
	"hash"
];
function stringifyRoute(to) {
	if (typeof to === "string") return to;
	if (to.path != null) return to.path;
	const location = {};
	for (const key of propertiesToLog) if (key in to) location[key] = to[key];
	return JSON.stringify(location, null, 2);
}

//#endregion
//#region src/query.ts
/**
* Transforms a queryString into a {@link LocationQuery} object. Accept both, a
* version with the leading `?` and without Should work as URLSearchParams

* @internal
*
* @param search - search string to parse
* @returns a query object
*/
function parseQuery(search) {
	const query = {};
	if (search === "" || search === "?") return query;
	const searchParams = (search[0] === "?" ? search.slice(1) : search).split("&");
	for (let i = 0; i < searchParams.length; ++i) {
		const searchParam = searchParams[i].replace(PLUS_RE, " ");
		const eqPos = searchParam.indexOf("=");
		const key = decode(eqPos < 0 ? searchParam : searchParam.slice(0, eqPos));
		const value = eqPos < 0 ? null : decode(searchParam.slice(eqPos + 1));
		if (key in query) {
			let currentValue = query[key];
			if (!isArray(currentValue)) currentValue = query[key] = [currentValue];
			currentValue.push(value);
		} else query[key] = value;
	}
	return query;
}
/**
* Stringifies a {@link LocationQueryRaw} object. Like `URLSearchParams`, it
* doesn't prepend a `?`
*
* @internal
*
* @param query - query object to stringify
* @returns string version of the query without the leading `?`
*/
function stringifyQuery(query) {
	let search = "";
	for (let key in query) {
		const value = query[key];
		key = encodeQueryKey(key);
		if (value == null) {
			if (value !== void 0) search += (search.length ? "&" : "") + key;
			continue;
		}
		(isArray(value) ? value.map((v) => v && encodeQueryValue(v)) : [value && encodeQueryValue(value)]).forEach((value$1) => {
			if (value$1 !== void 0) {
				search += (search.length ? "&" : "") + key;
				if (value$1 != null) search += "=" + value$1;
			}
		});
	}
	return search;
}
/**
* Transforms a {@link LocationQueryRaw} into a {@link LocationQuery} by casting
* numbers into strings, removing keys with an undefined value and replacing
* undefined with null in arrays
*
* @param query - query object to normalize
* @returns a normalized query object
*/
function normalizeQuery(query) {
	const normalizedQuery = {};
	for (const key in query) {
		const value = query[key];
		if (value !== void 0) normalizedQuery[key] = isArray(value) ? value.map((v) => v == null ? null : "" + v) : value == null ? value : "" + value;
	}
	return normalizedQuery;
}

//#endregion
//#region src/injectionSymbols.ts
/**
* RouteRecord being rendered by the closest ancestor Router View. Used for
* `onBeforeRouteUpdate` and `onBeforeRouteLeave`. rvlm stands for Router View
* Location Matched
*
* @internal
*/
const matchedRouteKey = Symbol("");
/**
* Allows overriding the router view depth to control which component in
* `matched` is rendered. rvd stands for Router View Depth
*
* @internal
*/
const viewDepthKey = Symbol("");
/**
* Allows overriding the router instance returned by `useRouter` in tests. r
* stands for router
*
* @internal
*/
const routerKey = Symbol("");
/**
* Allows overriding the current route returned by `useRoute` in tests. rl
* stands for route location
*
* @internal
*/
const routeLocationKey = Symbol("");
/**
* Allows overriding the current route used by router-view. Internally this is
* used when the `route` prop is passed.
*
* @internal
*/
const routerViewLocationKey = Symbol("");

//#endregion
//#region src/utils/callbacks.ts
/**
* Create a list of callbacks that can be reset. Used to create before and after navigation guards list
*/
function useCallbacks() {
	let handlers = [];
	function add(handler) {
		handlers.push(handler);
		return () => {
			const i = handlers.indexOf(handler);
			if (i > -1) handlers.splice(i, 1);
		};
	}
	function reset() {
		handlers = [];
	}
	return {
		add,
		list: () => handlers.slice(),
		reset
	};
}
function guardToPromiseFn(guard, to, from, record, name, runWithContext = (fn) => fn()) {
	const enterCallbackArray = record && (record.enterCallbacks[name] = record.enterCallbacks[name] || []);
	return () => new Promise((resolve, reject) => {
		const next = (valid) => {
			if (valid === false) reject(createRouterError(ErrorTypes.NAVIGATION_ABORTED, {
				from,
				to
			}));
			else if (valid instanceof Error) reject(valid);
			else if (isRouteLocation(valid)) reject(createRouterError(ErrorTypes.NAVIGATION_GUARD_REDIRECT, {
				from: to,
				to: valid
			}));
			else {
				if (enterCallbackArray && record.enterCallbacks[name] === enterCallbackArray && typeof valid === "function") enterCallbackArray.push(valid);
				resolve();
			}
		};
		const guardReturn = runWithContext(() => guard.call(record && record.instances[name], to, from, next));
		let guardCall = Promise.resolve(guardReturn);
		if (guard.length < 3) guardCall = guardCall.then(next);
		guardCall.catch((err) => reject(err));
	});
}
function extractComponentsGuards(matched, guardType, to, from, runWithContext = (fn) => fn()) {
	const guards = [];
	for (const record of matched) {
		for (const name in record.components) {
			let rawComponent = record.components[name];
			if (guardType !== "beforeRouteEnter" && !record.instances[name]) continue;
			if (isRouteComponent(rawComponent)) {
				const guard = (rawComponent.__vccOpts || rawComponent)[guardType];
				guard && guards.push(guardToPromiseFn(guard, to, from, record, name, runWithContext));
			} else {
				let componentPromise = rawComponent();
				guards.push(() => componentPromise.then((resolved) => {
					if (!resolved) throw new Error(`Couldn't resolve component "${name}" at "${record.path}"`);
					const resolvedComponent = isESModule(resolved) ? resolved.default : resolved;
					record.mods[name] = resolved;
					record.components[name] = resolvedComponent;
					const guard = (resolvedComponent.__vccOpts || resolvedComponent)[guardType];
					return guard && guardToPromiseFn(guard, to, from, record, name, runWithContext)();
				}));
			}
		}
	}
	return guards;
}
/**
* Split the leaving, updating, and entering records.
* @internal
*
* @param  to - Location we are navigating to
* @param from - Location we are navigating from
*/
function extractChangingRecords(to, from) {
	const leavingRecords = [];
	const updatingRecords = [];
	const enteringRecords = [];
	const len = Math.max(from.matched.length, to.matched.length);
	for (let i = 0; i < len; i++) {
		const recordFrom = from.matched[i];
		if (recordFrom) if (to.matched.find((record) => isSameRouteRecord(record, recordFrom))) updatingRecords.push(recordFrom);
		else leavingRecords.push(recordFrom);
		const recordTo = to.matched[i];
		if (recordTo) {
			if (!from.matched.find((record) => isSameRouteRecord(record, recordTo))) enteringRecords.push(recordTo);
		}
	}
	return [
		leavingRecords,
		updatingRecords,
		enteringRecords
	];
}

/*!
 * vue-router v4.6.4
 * (c) 2025 Eduardo San Martin Morote
 * @license MIT
 */

//#endregion
//#region src/history/memory.ts
/**
* Creates an in-memory based history. The main purpose of this history is to handle SSR. It starts in a special location that is nowhere.
* It's up to the user to replace that location with the starter location by either calling `router.push` or `router.replace`.
*
* @param base - Base applied to all urls, defaults to '/'
* @returns a history object that can be passed to the router constructor
*/
function createMemoryHistory(base = "") {
	let listeners = [];
	let queue = [[START, {}]];
	let position = 0;
	base = normalizeBase(base);
	function setLocation(location$1, state = {}) {
		position++;
		if (position !== queue.length) queue.splice(position);
		queue.push([location$1, state]);
	}
	function triggerListeners(to, from, { direction, delta }) {
		const info = {
			direction,
			delta,
			type: NavigationType.pop
		};
		for (const callback of listeners) callback(to, from, info);
	}
	const routerHistory = {
		location: START,
		state: {},
		base,
		createHref: createHref.bind(null, base),
		replace(to, state) {
			queue.splice(position--, 1);
			setLocation(to, state);
		},
		push(to, state) {
			setLocation(to, state);
		},
		listen(callback) {
			listeners.push(callback);
			return () => {
				const index = listeners.indexOf(callback);
				if (index > -1) listeners.splice(index, 1);
			};
		},
		destroy() {
			listeners = [];
			queue = [[START, {}]];
			position = 0;
		},
		go(delta, shouldTrigger = true) {
			const from = this.location;
			const direction = delta < 0 ? NavigationDirection.back : NavigationDirection.forward;
			position = Math.max(0, Math.min(position + delta, queue.length - 1));
			if (shouldTrigger) triggerListeners(this.location, from, {
				direction,
				delta
			});
		}
	};
	Object.defineProperty(routerHistory, "location", {
		enumerable: true,
		get: () => queue[position][0]
	});
	Object.defineProperty(routerHistory, "state", {
		enumerable: true,
		get: () => queue[position][1]
	});
	return routerHistory;
}

//#endregion
//#region src/matcher/pathTokenizer.ts
let TokenType = /* @__PURE__ */ function(TokenType$1) {
	TokenType$1[TokenType$1["Static"] = 0] = "Static";
	TokenType$1[TokenType$1["Param"] = 1] = "Param";
	TokenType$1[TokenType$1["Group"] = 2] = "Group";
	return TokenType$1;
}({});
var TokenizerState = /* @__PURE__ */ function(TokenizerState$1) {
	TokenizerState$1[TokenizerState$1["Static"] = 0] = "Static";
	TokenizerState$1[TokenizerState$1["Param"] = 1] = "Param";
	TokenizerState$1[TokenizerState$1["ParamRegExp"] = 2] = "ParamRegExp";
	TokenizerState$1[TokenizerState$1["ParamRegExpEnd"] = 3] = "ParamRegExpEnd";
	TokenizerState$1[TokenizerState$1["EscapeNext"] = 4] = "EscapeNext";
	return TokenizerState$1;
}(TokenizerState || {});
const ROOT_TOKEN = {
	type: TokenType.Static,
	value: ""
};
const VALID_PARAM_RE = /[a-zA-Z0-9_]/;
function tokenizePath(path) {
	if (!path) return [[]];
	if (path === "/") return [[ROOT_TOKEN]];
	if (!path.startsWith("/")) throw new Error(`Invalid path "${path}"`);
	function crash(message) {
		throw new Error(`ERR (${state})/"${buffer}": ${message}`);
	}
	let state = TokenizerState.Static;
	let previousState = state;
	const tokens = [];
	let segment;
	function finalizeSegment() {
		if (segment) tokens.push(segment);
		segment = [];
	}
	let i = 0;
	let char;
	let buffer = "";
	let customRe = "";
	function consumeBuffer() {
		if (!buffer) return;
		if (state === TokenizerState.Static) segment.push({
			type: TokenType.Static,
			value: buffer
		});
		else if (state === TokenizerState.Param || state === TokenizerState.ParamRegExp || state === TokenizerState.ParamRegExpEnd) {
			if (segment.length > 1 && (char === "*" || char === "+")) crash(`A repeatable param (${buffer}) must be alone in its segment. eg: '/:ids+.`);
			segment.push({
				type: TokenType.Param,
				value: buffer,
				regexp: customRe,
				repeatable: char === "*" || char === "+",
				optional: char === "*" || char === "?"
			});
		} else crash("Invalid state to consume buffer");
		buffer = "";
	}
	function addCharToBuffer() {
		buffer += char;
	}
	while (i < path.length) {
		char = path[i++];
		if (char === "\\" && state !== TokenizerState.ParamRegExp) {
			previousState = state;
			state = TokenizerState.EscapeNext;
			continue;
		}
		switch (state) {
			case TokenizerState.Static:
				if (char === "/") {
					if (buffer) consumeBuffer();
					finalizeSegment();
				} else if (char === ":") {
					consumeBuffer();
					state = TokenizerState.Param;
				} else addCharToBuffer();
				break;
			case TokenizerState.EscapeNext:
				addCharToBuffer();
				state = previousState;
				break;
			case TokenizerState.Param:
				if (char === "(") state = TokenizerState.ParamRegExp;
				else if (VALID_PARAM_RE.test(char)) addCharToBuffer();
				else {
					consumeBuffer();
					state = TokenizerState.Static;
					if (char !== "*" && char !== "?" && char !== "+") i--;
				}
				break;
			case TokenizerState.ParamRegExp:
				if (char === ")") if (customRe[customRe.length - 1] == "\\") customRe = customRe.slice(0, -1) + char;
				else state = TokenizerState.ParamRegExpEnd;
				else customRe += char;
				break;
			case TokenizerState.ParamRegExpEnd:
				consumeBuffer();
				state = TokenizerState.Static;
				if (char !== "*" && char !== "?" && char !== "+") i--;
				customRe = "";
				break;
			default:
				crash("Unknown state");
				break;
		}
	}
	if (state === TokenizerState.ParamRegExp) crash(`Unfinished custom RegExp for param "${buffer}"`);
	consumeBuffer();
	finalizeSegment();
	return tokens;
}

//#endregion
//#region src/matcher/pathParserRanker.ts
const BASE_PARAM_PATTERN = "[^/]+?";
const BASE_PATH_PARSER_OPTIONS = {
	sensitive: false,
	strict: false,
	start: true,
	end: true
};
var PathScore = /* @__PURE__ */ function(PathScore$1) {
	PathScore$1[PathScore$1["_multiplier"] = 10] = "_multiplier";
	PathScore$1[PathScore$1["Root"] = 90] = "Root";
	PathScore$1[PathScore$1["Segment"] = 40] = "Segment";
	PathScore$1[PathScore$1["SubSegment"] = 30] = "SubSegment";
	PathScore$1[PathScore$1["Static"] = 40] = "Static";
	PathScore$1[PathScore$1["Dynamic"] = 20] = "Dynamic";
	PathScore$1[PathScore$1["BonusCustomRegExp"] = 10] = "BonusCustomRegExp";
	PathScore$1[PathScore$1["BonusWildcard"] = -50] = "BonusWildcard";
	PathScore$1[PathScore$1["BonusRepeatable"] = -20] = "BonusRepeatable";
	PathScore$1[PathScore$1["BonusOptional"] = -8] = "BonusOptional";
	PathScore$1[PathScore$1["BonusStrict"] = .7000000000000001] = "BonusStrict";
	PathScore$1[PathScore$1["BonusCaseSensitive"] = .25] = "BonusCaseSensitive";
	return PathScore$1;
}(PathScore || {});
const REGEX_CHARS_RE = /[.+*?^${}()[\]/\\]/g;
/**
* Creates a path parser from an array of Segments (a segment is an array of Tokens)
*
* @param segments - array of segments returned by tokenizePath
* @param extraOptions - optional options for the regexp
* @returns a PathParser
*/
function tokensToParser(segments, extraOptions) {
	const options = assign({}, BASE_PATH_PARSER_OPTIONS, extraOptions);
	const score = [];
	let pattern = options.start ? "^" : "";
	const keys = [];
	for (const segment of segments) {
		const segmentScores = segment.length ? [] : [PathScore.Root];
		if (options.strict && !segment.length) pattern += "/";
		for (let tokenIndex = 0; tokenIndex < segment.length; tokenIndex++) {
			const token = segment[tokenIndex];
			let subSegmentScore = PathScore.Segment + (options.sensitive ? PathScore.BonusCaseSensitive : 0);
			if (token.type === TokenType.Static) {
				if (!tokenIndex) pattern += "/";
				pattern += token.value.replace(REGEX_CHARS_RE, "\\$&");
				subSegmentScore += PathScore.Static;
			} else if (token.type === TokenType.Param) {
				const { value, repeatable, optional, regexp } = token;
				keys.push({
					name: value,
					repeatable,
					optional
				});
				const re$1 = regexp ? regexp : BASE_PARAM_PATTERN;
				if (re$1 !== BASE_PARAM_PATTERN) {
					subSegmentScore += PathScore.BonusCustomRegExp;
					try {
						`${re$1}`;
					} catch (err) {
						throw new Error(`Invalid custom RegExp for param "${value}" (${re$1}): ` + err.message);
					}
				}
				let subPattern = repeatable ? `((?:${re$1})(?:/(?:${re$1}))*)` : `(${re$1})`;
				if (!tokenIndex) subPattern = optional && segment.length < 2 ? `(?:/${subPattern})` : "/" + subPattern;
				if (optional) subPattern += "?";
				pattern += subPattern;
				subSegmentScore += PathScore.Dynamic;
				if (optional) subSegmentScore += PathScore.BonusOptional;
				if (repeatable) subSegmentScore += PathScore.BonusRepeatable;
				if (re$1 === ".*") subSegmentScore += PathScore.BonusWildcard;
			}
			segmentScores.push(subSegmentScore);
		}
		score.push(segmentScores);
	}
	if (options.strict && options.end) {
		const i = score.length - 1;
		score[i][score[i].length - 1] += PathScore.BonusStrict;
	}
	if (!options.strict) pattern += "/?";
	if (options.end) pattern += "$";
	else if (options.strict && !pattern.endsWith("/")) pattern += "(?:/|$)";
	const re = new RegExp(pattern, options.sensitive ? "" : "i");
	function parse(path) {
		const match = path.match(re);
		const params = {};
		if (!match) return null;
		for (let i = 1; i < match.length; i++) {
			const value = match[i] || "";
			const key = keys[i - 1];
			params[key.name] = value && key.repeatable ? value.split("/") : value;
		}
		return params;
	}
	function stringify(params) {
		let path = "";
		let avoidDuplicatedSlash = false;
		for (const segment of segments) {
			if (!avoidDuplicatedSlash || !path.endsWith("/")) path += "/";
			avoidDuplicatedSlash = false;
			for (const token of segment) if (token.type === TokenType.Static) path += token.value;
			else if (token.type === TokenType.Param) {
				const { value, repeatable, optional } = token;
				const param = value in params ? params[value] : "";
				if (isArray(param) && !repeatable) throw new Error(`Provided param "${value}" is an array but it is not repeatable (* or + modifiers)`);
				const text = isArray(param) ? param.join("/") : param;
				if (!text) if (optional) {
					if (segment.length < 2) if (path.endsWith("/")) path = path.slice(0, -1);
					else avoidDuplicatedSlash = true;
				} else throw new Error(`Missing required param "${value}"`);
				path += text;
			}
		}
		return path || "/";
	}
	return {
		re,
		score,
		keys,
		parse,
		stringify
	};
}
/**
* Compares an array of numbers as used in PathParser.score and returns a
* number. This function can be used to `sort` an array
*
* @param a - first array of numbers
* @param b - second array of numbers
* @returns 0 if both are equal, < 0 if a should be sorted first, > 0 if b
* should be sorted first
*/
function compareScoreArray(a, b) {
	let i = 0;
	while (i < a.length && i < b.length) {
		const diff = b[i] - a[i];
		if (diff) return diff;
		i++;
	}
	if (a.length < b.length) return a.length === 1 && a[0] === PathScore.Static + PathScore.Segment ? -1 : 1;
	else if (a.length > b.length) return b.length === 1 && b[0] === PathScore.Static + PathScore.Segment ? 1 : -1;
	return 0;
}
/**
* Compare function that can be used with `sort` to sort an array of PathParser
*
* @param a - first PathParser
* @param b - second PathParser
* @returns 0 if both are equal, < 0 if a should be sorted first, > 0 if b
*/
function comparePathParserScore(a, b) {
	let i = 0;
	const aScore = a.score;
	const bScore = b.score;
	while (i < aScore.length && i < bScore.length) {
		const comp = compareScoreArray(aScore[i], bScore[i]);
		if (comp) return comp;
		i++;
	}
	if (Math.abs(bScore.length - aScore.length) === 1) {
		if (isLastScoreNegative(aScore)) return 1;
		if (isLastScoreNegative(bScore)) return -1;
	}
	return bScore.length - aScore.length;
}
/**
* This allows detecting splats at the end of a path: /home/:id(.*)*
*
* @param score - score to check
* @returns true if the last entry is negative
*/
function isLastScoreNegative(score) {
	const last = score[score.length - 1];
	return score.length > 0 && last[last.length - 1] < 0;
}
const PATH_PARSER_OPTIONS_DEFAULTS = {
	strict: false,
	end: true,
	sensitive: false
};

//#endregion
//#region src/matcher/pathMatcher.ts
function createRouteRecordMatcher(record, parent, options) {
	const parser = tokensToParser(tokenizePath(record.path), options);
	const matcher = assign(parser, {
		record,
		parent,
		children: [],
		alias: []
	});
	if (parent) {
		if (!matcher.record.aliasOf === !parent.record.aliasOf) parent.children.push(matcher);
	}
	return matcher;
}

//#endregion
//#region src/matcher/index.ts
/**
* Creates a Router Matcher.
*
* @internal
* @param routes - array of initial routes
* @param globalOptions - global route options
*/
function createRouterMatcher(routes, globalOptions) {
	const matchers = [];
	const matcherMap = /* @__PURE__ */ new Map();
	globalOptions = mergeOptions(PATH_PARSER_OPTIONS_DEFAULTS, globalOptions);
	function getRecordMatcher(name) {
		return matcherMap.get(name);
	}
	function addRoute(record, parent, originalRecord) {
		const isRootAdd = !originalRecord;
		const mainNormalizedRecord = normalizeRouteRecord(record);
		mainNormalizedRecord.aliasOf = originalRecord && originalRecord.record;
		const options = mergeOptions(globalOptions, record);
		const normalizedRecords = [mainNormalizedRecord];
		if ("alias" in record) {
			const aliases = typeof record.alias === "string" ? [record.alias] : record.alias;
			for (const alias of aliases) normalizedRecords.push(normalizeRouteRecord(assign({}, mainNormalizedRecord, {
				components: originalRecord ? originalRecord.record.components : mainNormalizedRecord.components,
				path: alias,
				aliasOf: originalRecord ? originalRecord.record : mainNormalizedRecord
			})));
		}
		let matcher;
		let originalMatcher;
		for (const normalizedRecord of normalizedRecords) {
			const { path } = normalizedRecord;
			if (parent && path[0] !== "/") {
				const parentPath = parent.record.path;
				const connectingSlash = parentPath[parentPath.length - 1] === "/" ? "" : "/";
				normalizedRecord.path = parent.record.path + (path && connectingSlash + path);
			}
			matcher = createRouteRecordMatcher(normalizedRecord, parent, options);
			if (originalRecord) {
				originalRecord.alias.push(matcher);
			} else {
				originalMatcher = originalMatcher || matcher;
				if (originalMatcher !== matcher) originalMatcher.alias.push(matcher);
				if (isRootAdd && record.name && !isAliasRecord(matcher)) {
					removeRoute(record.name);
				}
			}
			if (isMatchable(matcher)) insertMatcher(matcher);
			if (mainNormalizedRecord.children) {
				const children = mainNormalizedRecord.children;
				for (let i = 0; i < children.length; i++) addRoute(children[i], matcher, originalRecord && originalRecord.children[i]);
			}
			originalRecord = originalRecord || matcher;
		}
		return originalMatcher ? () => {
			removeRoute(originalMatcher);
		} : noop;
	}
	function removeRoute(matcherRef) {
		if (isRouteName(matcherRef)) {
			const matcher = matcherMap.get(matcherRef);
			if (matcher) {
				matcherMap.delete(matcherRef);
				matchers.splice(matchers.indexOf(matcher), 1);
				matcher.children.forEach(removeRoute);
				matcher.alias.forEach(removeRoute);
			}
		} else {
			const index = matchers.indexOf(matcherRef);
			if (index > -1) {
				matchers.splice(index, 1);
				if (matcherRef.record.name) matcherMap.delete(matcherRef.record.name);
				matcherRef.children.forEach(removeRoute);
				matcherRef.alias.forEach(removeRoute);
			}
		}
	}
	function getRoutes() {
		return matchers;
	}
	function insertMatcher(matcher) {
		const index = findInsertionIndex(matcher, matchers);
		matchers.splice(index, 0, matcher);
		if (matcher.record.name && !isAliasRecord(matcher)) matcherMap.set(matcher.record.name, matcher);
	}
	function resolve(location$1, currentLocation) {
		let matcher;
		let params = {};
		let path;
		let name;
		if ("name" in location$1 && location$1.name) {
			matcher = matcherMap.get(location$1.name);
			if (!matcher) throw createRouterError(ErrorTypes.MATCHER_NOT_FOUND, { location: location$1 });
			name = matcher.record.name;
			params = assign(pickParams(currentLocation.params, matcher.keys.filter((k) => !k.optional).concat(matcher.parent ? matcher.parent.keys.filter((k) => k.optional) : []).map((k) => k.name)), location$1.params && pickParams(location$1.params, matcher.keys.map((k) => k.name)));
			path = matcher.stringify(params);
		} else if (location$1.path != null) {
			path = location$1.path;
			matcher = matchers.find((m) => m.re.test(path));
			if (matcher) {
				params = matcher.parse(path);
				name = matcher.record.name;
			}
		} else {
			matcher = currentLocation.name ? matcherMap.get(currentLocation.name) : matchers.find((m) => m.re.test(currentLocation.path));
			if (!matcher) throw createRouterError(ErrorTypes.MATCHER_NOT_FOUND, {
				location: location$1,
				currentLocation
			});
			name = matcher.record.name;
			params = assign({}, currentLocation.params, location$1.params);
			path = matcher.stringify(params);
		}
		const matched = [];
		let parentMatcher = matcher;
		while (parentMatcher) {
			matched.unshift(parentMatcher.record);
			parentMatcher = parentMatcher.parent;
		}
		return {
			name,
			path,
			params,
			matched,
			meta: mergeMetaFields(matched)
		};
	}
	routes.forEach((route) => addRoute(route));
	function clearRoutes() {
		matchers.length = 0;
		matcherMap.clear();
	}
	return {
		addRoute,
		resolve,
		removeRoute,
		clearRoutes,
		getRoutes,
		getRecordMatcher
	};
}
/**
* Picks an object param to contain only specified keys.
*
* @param params - params object to pick from
* @param keys - keys to pick
*/
function pickParams(params, keys) {
	const newParams = {};
	for (const key of keys) if (key in params) newParams[key] = params[key];
	return newParams;
}
/**
* Normalizes a RouteRecordRaw. Creates a copy
*
* @param record
* @returns the normalized version
*/
function normalizeRouteRecord(record) {
	const normalized = {
		path: record.path,
		redirect: record.redirect,
		name: record.name,
		meta: record.meta || {},
		aliasOf: record.aliasOf,
		beforeEnter: record.beforeEnter,
		props: normalizeRecordProps(record),
		children: record.children || [],
		instances: {},
		leaveGuards: /* @__PURE__ */ new Set(),
		updateGuards: /* @__PURE__ */ new Set(),
		enterCallbacks: {},
		components: "components" in record ? record.components || null : record.component && { default: record.component }
	};
	Object.defineProperty(normalized, "mods", { value: {} });
	return normalized;
}
/**
* Normalize the optional `props` in a record to always be an object similar to
* components. Also accept a boolean for components.
* @param record
*/
function normalizeRecordProps(record) {
	const propsObject = {};
	const props = record.props || false;
	if ("component" in record) propsObject.default = props;
	else for (const name in record.components) propsObject[name] = typeof props === "object" ? props[name] : props;
	return propsObject;
}
/**
* Checks if a record or any of its parent is an alias
* @param record
*/
function isAliasRecord(record) {
	while (record) {
		if (record.record.aliasOf) return true;
		record = record.parent;
	}
	return false;
}
/**
* Merge meta fields of an array of records
*
* @param matched - array of matched records
*/
function mergeMetaFields(matched) {
	return matched.reduce((meta, record) => assign(meta, record.meta), {});
}
/**
* Performs a binary search to find the correct insertion index for a new matcher.
*
* Matchers are primarily sorted by their score. If scores are tied then we also consider parent/child relationships,
* with descendants coming before ancestors. If there's still a tie, new routes are inserted after existing routes.
*
* @param matcher - new matcher to be inserted
* @param matchers - existing matchers
*/
function findInsertionIndex(matcher, matchers) {
	let lower = 0;
	let upper = matchers.length;
	while (lower !== upper) {
		const mid = lower + upper >> 1;
		if (comparePathParserScore(matcher, matchers[mid]) < 0) upper = mid;
		else lower = mid + 1;
	}
	const insertionAncestor = getInsertionAncestor(matcher);
	if (insertionAncestor) {
		upper = matchers.lastIndexOf(insertionAncestor, upper - 1);
	}
	return upper;
}
function getInsertionAncestor(matcher) {
	let ancestor = matcher;
	while (ancestor = ancestor.parent) if (isMatchable(ancestor) && comparePathParserScore(matcher, ancestor) === 0) return ancestor;
}
/**
* Checks if a matcher can be reachable. This means if it's possible to reach it as a route. For example, routes without
* a component, or name, or redirect, are just used to group other routes.
* @param matcher
* @param matcher.record record of the matcher
* @returns
*/
function isMatchable({ record }) {
	return !!(record.name || record.components && Object.keys(record.components).length || record.redirect);
}

//#endregion
//#region src/RouterLink.ts
/**
* Returns the internal behavior of a {@link RouterLink} without the rendering part.
*
* @param props - a `to` location and an optional `replace` flag
*/
function useLink(props) {
	const router = inject(routerKey);
	const currentRoute = inject(routeLocationKey);
	const route = computed(() => {
		const to = unref(props.to);
		return router.resolve(to);
	});
	const activeRecordIndex = computed(() => {
		const { matched } = route.value;
		const { length } = matched;
		const routeMatched = matched[length - 1];
		const currentMatched = currentRoute.matched;
		if (!routeMatched || !currentMatched.length) return -1;
		const index = currentMatched.findIndex(isSameRouteRecord.bind(null, routeMatched));
		if (index > -1) return index;
		const parentRecordPath = getOriginalPath(matched[length - 2]);
		return length > 1 && getOriginalPath(routeMatched) === parentRecordPath && currentMatched[currentMatched.length - 1].path !== parentRecordPath ? currentMatched.findIndex(isSameRouteRecord.bind(null, matched[length - 2])) : index;
	});
	const isActive = computed(() => activeRecordIndex.value > -1 && includesParams(currentRoute.params, route.value.params));
	const isExactActive = computed(() => activeRecordIndex.value > -1 && activeRecordIndex.value === currentRoute.matched.length - 1 && isSameRouteLocationParams(currentRoute.params, route.value.params));
	function navigate(e = {}) {
		if (guardEvent(e)) {
			const p = router[unref(props.replace) ? "replace" : "push"](unref(props.to)).catch(noop);
			if (props.viewTransition && typeof document !== "undefined" && "startViewTransition" in document) document.startViewTransition(() => p);
			return p;
		}
		return Promise.resolve();
	}
	/**
	* NOTE: update {@link _RouterLinkI}'s `$slots` type when updating this
	*/
	return {
		route,
		href: computed(() => route.value.href),
		isActive,
		isExactActive,
		navigate
	};
}
function preferSingleVNode(vnodes) {
	return vnodes.length === 1 ? vnodes[0] : vnodes;
}
const RouterLinkImpl = /* @__PURE__ */ defineComponent({
	name: "RouterLink",
	compatConfig: { MODE: 3 },
	props: {
		to: {
			type: [String, Object],
			required: true
		},
		replace: Boolean,
		activeClass: String,
		exactActiveClass: String,
		custom: Boolean,
		ariaCurrentValue: {
			type: String,
			default: "page"
		},
		viewTransition: Boolean
	},
	useLink,
	setup(props, { slots }) {
		const link = reactive(useLink(props));
		const { options } = inject(routerKey);
		const elClass = computed(() => ({
			[getLinkClass(props.activeClass, options.linkActiveClass, "router-link-active")]: link.isActive,
			[getLinkClass(props.exactActiveClass, options.linkExactActiveClass, "router-link-exact-active")]: link.isExactActive
		}));
		return () => {
			const children = slots.default && preferSingleVNode(slots.default(link));
			return props.custom ? children : h("a", {
				"aria-current": link.isExactActive ? props.ariaCurrentValue : null,
				href: link.href,
				onClick: link.navigate,
				class: elClass.value
			}, children);
		};
	}
});
/**
* Component to render a link that triggers a navigation on click.
*/
const RouterLink = RouterLinkImpl;
function guardEvent(e) {
	if (e.metaKey || e.altKey || e.ctrlKey || e.shiftKey) return;
	if (e.defaultPrevented) return;
	if (e.button !== void 0 && e.button !== 0) return;
	if (e.currentTarget && e.currentTarget.getAttribute) {
		const target = e.currentTarget.getAttribute("target");
		if (/\b_blank\b/i.test(target)) return;
	}
	if (e.preventDefault) e.preventDefault();
	return true;
}
function includesParams(outer, inner) {
	for (const key in inner) {
		const innerValue = inner[key];
		const outerValue = outer[key];
		if (typeof innerValue === "string") {
			if (innerValue !== outerValue) return false;
		} else if (!isArray(outerValue) || outerValue.length !== innerValue.length || innerValue.some((value, i) => value.valueOf() !== outerValue[i].valueOf())) return false;
	}
	return true;
}
/**
* Get the original path value of a record by following its aliasOf
* @param record
*/
function getOriginalPath(record) {
	return record ? record.aliasOf ? record.aliasOf.path : record.path : "";
}
/**
* Utility class to get the active class based on defaults.
* @param propClass
* @param globalClass
* @param defaultClass
*/
const getLinkClass = (propClass, globalClass, defaultClass) => propClass != null ? propClass : globalClass != null ? globalClass : defaultClass;

//#endregion
//#region src/RouterView.ts
const RouterViewImpl = /* @__PURE__ */ defineComponent({
	name: "RouterView",
	inheritAttrs: false,
	props: {
		name: {
			type: String,
			default: "default"
		},
		route: Object
	},
	compatConfig: { MODE: 3 },
	setup(props, { attrs, slots }) {
		const injectedRoute = inject(routerViewLocationKey);
		const routeToDisplay = computed(() => props.route || injectedRoute.value);
		const injectedDepth = inject(viewDepthKey, 0);
		const depth = computed(() => {
			let initialDepth = unref(injectedDepth);
			const { matched } = routeToDisplay.value;
			let matchedRoute;
			while ((matchedRoute = matched[initialDepth]) && !matchedRoute.components) initialDepth++;
			return initialDepth;
		});
		const matchedRouteRef = computed(() => routeToDisplay.value.matched[depth.value]);
		provide(viewDepthKey, computed(() => depth.value + 1));
		provide(matchedRouteKey, matchedRouteRef);
		provide(routerViewLocationKey, routeToDisplay);
		const viewRef = ref();
		watch(() => [
			viewRef.value,
			matchedRouteRef.value,
			props.name
		], ([instance, to, name], [oldInstance, from, oldName]) => {
			if (to) {
				to.instances[name] = instance;
				if (from && from !== to && instance && instance === oldInstance) {
					if (!to.leaveGuards.size) to.leaveGuards = from.leaveGuards;
					if (!to.updateGuards.size) to.updateGuards = from.updateGuards;
				}
			}
			if (instance && to && (!from || !isSameRouteRecord(to, from) || !oldInstance)) (to.enterCallbacks[name] || []).forEach((callback) => callback(instance));
		}, { flush: "post" });
		return () => {
			const route = routeToDisplay.value;
			const currentName = props.name;
			const matchedRoute = matchedRouteRef.value;
			const ViewComponent = matchedRoute && matchedRoute.components[currentName];
			if (!ViewComponent) return normalizeSlot(slots.default, {
				Component: ViewComponent,
				route
			});
			const routePropsOption = matchedRoute.props[currentName];
			const routeProps = routePropsOption ? routePropsOption === true ? route.params : typeof routePropsOption === "function" ? routePropsOption(route) : routePropsOption : null;
			const onVnodeUnmounted = (vnode) => {
				if (vnode.component.isUnmounted) matchedRoute.instances[currentName] = null;
			};
			const component = h(ViewComponent, assign({}, routeProps, attrs, {
				onVnodeUnmounted,
				ref: viewRef
			}));
			return normalizeSlot(slots.default, {
				Component: component,
				route
			}) || component;
		};
	}
});
function normalizeSlot(slot, data) {
	if (!slot) return null;
	const slotContent = slot(data);
	return slotContent.length === 1 ? slotContent[0] : slotContent;
}
/**
* Component to display the current route the user is at.
*/
const RouterView = RouterViewImpl;

//#endregion
//#region src/router.ts
/**
* Creates a Router instance that can be used by a Vue app.
*
* @param options - {@link RouterOptions}
*/
function createRouter(options) {
	const matcher = createRouterMatcher(options.routes, options);
	const parseQuery$1 = options.parseQuery || parseQuery;
	const stringifyQuery$1 = options.stringifyQuery || stringifyQuery;
	const routerHistory = options.history;
	const beforeGuards = useCallbacks();
	const beforeResolveGuards = useCallbacks();
	const afterGuards = useCallbacks();
	const currentRoute = shallowRef(START_LOCATION_NORMALIZED);
	let pendingLocation = START_LOCATION_NORMALIZED;
	if (isBrowser && options.scrollBehavior && "scrollRestoration" in history) history.scrollRestoration = "manual";
	const normalizeParams = applyToParams.bind(null, (paramValue) => "" + paramValue);
	const encodeParams = applyToParams.bind(null, encodeParam);
	const decodeParams = applyToParams.bind(null, decode);
	function addRoute(parentOrRoute, route) {
		let parent;
		let record;
		if (isRouteName(parentOrRoute)) {
			parent = matcher.getRecordMatcher(parentOrRoute);
			record = route;
		} else record = parentOrRoute;
		return matcher.addRoute(record, parent);
	}
	function removeRoute(name) {
		const recordMatcher = matcher.getRecordMatcher(name);
		if (recordMatcher) matcher.removeRoute(recordMatcher);
	}
	function getRoutes() {
		return matcher.getRoutes().map((routeMatcher) => routeMatcher.record);
	}
	function hasRoute(name) {
		return !!matcher.getRecordMatcher(name);
	}
	function resolve(rawLocation, currentLocation) {
		currentLocation = assign({}, currentLocation || currentRoute.value);
		if (typeof rawLocation === "string") {
			const locationNormalized = parseURL(parseQuery$1, rawLocation, currentLocation.path);
			const matchedRoute$1 = matcher.resolve({ path: locationNormalized.path }, currentLocation);
			const href$1 = routerHistory.createHref(locationNormalized.fullPath);
			return assign(locationNormalized, matchedRoute$1, {
				params: decodeParams(matchedRoute$1.params),
				hash: decode(locationNormalized.hash),
				redirectedFrom: void 0,
				href: href$1
			});
		}
		let matcherLocation;
		if (rawLocation.path != null) {
			matcherLocation = assign({}, rawLocation, { path: parseURL(parseQuery$1, rawLocation.path, currentLocation.path).path });
		} else {
			const targetParams = assign({}, rawLocation.params);
			for (const key in targetParams) if (targetParams[key] == null) delete targetParams[key];
			matcherLocation = assign({}, rawLocation, { params: encodeParams(targetParams) });
			currentLocation.params = encodeParams(currentLocation.params);
		}
		const matchedRoute = matcher.resolve(matcherLocation, currentLocation);
		const hash = rawLocation.hash || "";
		matchedRoute.params = normalizeParams(decodeParams(matchedRoute.params));
		const fullPath = stringifyURL(stringifyQuery$1, assign({}, rawLocation, {
			hash: encodeHash(hash),
			path: matchedRoute.path
		}));
		const href = routerHistory.createHref(fullPath);
		return assign({
			fullPath,
			hash,
			query: stringifyQuery$1 === stringifyQuery ? normalizeQuery(rawLocation.query) : rawLocation.query || {}
		}, matchedRoute, {
			redirectedFrom: void 0,
			href
		});
	}
	function locationAsObject(to) {
		return typeof to === "string" ? parseURL(parseQuery$1, to, currentRoute.value.path) : assign({}, to);
	}
	function checkCanceledNavigation(to, from) {
		if (pendingLocation !== to) return createRouterError(ErrorTypes.NAVIGATION_CANCELLED, {
			from,
			to
		});
	}
	function push(to) {
		return pushWithRedirect(to);
	}
	function replace(to) {
		return push(assign(locationAsObject(to), { replace: true }));
	}
	function handleRedirectRecord(to, from) {
		const lastMatched = to.matched[to.matched.length - 1];
		if (lastMatched && lastMatched.redirect) {
			const { redirect } = lastMatched;
			let newTargetLocation = typeof redirect === "function" ? redirect(to, from) : redirect;
			if (typeof newTargetLocation === "string") {
				newTargetLocation = newTargetLocation.includes("?") || newTargetLocation.includes("#") ? newTargetLocation = locationAsObject(newTargetLocation) : { path: newTargetLocation };
				newTargetLocation.params = {};
			}
			return assign({
				query: to.query,
				hash: to.hash,
				params: newTargetLocation.path != null ? {} : to.params
			}, newTargetLocation);
		}
	}
	function pushWithRedirect(to, redirectedFrom) {
		const targetLocation = pendingLocation = resolve(to);
		const from = currentRoute.value;
		const data = to.state;
		const force = to.force;
		const replace$1 = to.replace === true;
		const shouldRedirect = handleRedirectRecord(targetLocation, from);
		if (shouldRedirect) return pushWithRedirect(assign(locationAsObject(shouldRedirect), {
			state: typeof shouldRedirect === "object" ? assign({}, data, shouldRedirect.state) : data,
			force,
			replace: replace$1
		}), redirectedFrom || targetLocation);
		const toLocation = targetLocation;
		toLocation.redirectedFrom = redirectedFrom;
		let failure;
		if (!force && isSameRouteLocation(stringifyQuery$1, from, targetLocation)) {
			failure = createRouterError(ErrorTypes.NAVIGATION_DUPLICATED, {
				to: toLocation,
				from
			});
			handleScroll(from, from, true, false);
		}
		return (failure ? Promise.resolve(failure) : navigate(toLocation, from)).catch((error) => isNavigationFailure(error) ? isNavigationFailure(error, ErrorTypes.NAVIGATION_GUARD_REDIRECT) ? error : markAsReady(error) : triggerError(error, toLocation, from)).then((failure$1) => {
			if (failure$1) {
				if (isNavigationFailure(failure$1, ErrorTypes.NAVIGATION_GUARD_REDIRECT)) {
					return pushWithRedirect(assign({ replace: replace$1 }, locationAsObject(failure$1.to), {
						state: typeof failure$1.to === "object" ? assign({}, data, failure$1.to.state) : data,
						force
					}), redirectedFrom || toLocation);
				}
			} else failure$1 = finalizeNavigation(toLocation, from, true, replace$1, data);
			triggerAfterEach(toLocation, from, failure$1);
			return failure$1;
		});
	}
	/**
	* Helper to reject and skip all navigation guards if a new navigation happened
	* @param to
	* @param from
	*/
	function checkCanceledNavigationAndReject(to, from) {
		const error = checkCanceledNavigation(to, from);
		return error ? Promise.reject(error) : Promise.resolve();
	}
	function runWithContext(fn) {
		const app = installedApps.values().next().value;
		return app && typeof app.runWithContext === "function" ? app.runWithContext(fn) : fn();
	}
	function navigate(to, from) {
		let guards;
		const [leavingRecords, updatingRecords, enteringRecords] = extractChangingRecords(to, from);
		guards = extractComponentsGuards(leavingRecords.reverse(), "beforeRouteLeave", to, from);
		for (const record of leavingRecords) record.leaveGuards.forEach((guard) => {
			guards.push(guardToPromiseFn(guard, to, from));
		});
		const canceledNavigationCheck = checkCanceledNavigationAndReject.bind(null, to, from);
		guards.push(canceledNavigationCheck);
		return runGuardQueue(guards).then(() => {
			guards = [];
			for (const guard of beforeGuards.list()) guards.push(guardToPromiseFn(guard, to, from));
			guards.push(canceledNavigationCheck);
			return runGuardQueue(guards);
		}).then(() => {
			guards = extractComponentsGuards(updatingRecords, "beforeRouteUpdate", to, from);
			for (const record of updatingRecords) record.updateGuards.forEach((guard) => {
				guards.push(guardToPromiseFn(guard, to, from));
			});
			guards.push(canceledNavigationCheck);
			return runGuardQueue(guards);
		}).then(() => {
			guards = [];
			for (const record of enteringRecords) if (record.beforeEnter) if (isArray(record.beforeEnter)) for (const beforeEnter of record.beforeEnter) guards.push(guardToPromiseFn(beforeEnter, to, from));
			else guards.push(guardToPromiseFn(record.beforeEnter, to, from));
			guards.push(canceledNavigationCheck);
			return runGuardQueue(guards);
		}).then(() => {
			to.matched.forEach((record) => record.enterCallbacks = {});
			guards = extractComponentsGuards(enteringRecords, "beforeRouteEnter", to, from, runWithContext);
			guards.push(canceledNavigationCheck);
			return runGuardQueue(guards);
		}).then(() => {
			guards = [];
			for (const guard of beforeResolveGuards.list()) guards.push(guardToPromiseFn(guard, to, from));
			guards.push(canceledNavigationCheck);
			return runGuardQueue(guards);
		}).catch((err) => isNavigationFailure(err, ErrorTypes.NAVIGATION_CANCELLED) ? err : Promise.reject(err));
	}
	function triggerAfterEach(to, from, failure) {
		afterGuards.list().forEach((guard) => runWithContext(() => guard(to, from, failure)));
	}
	/**
	* - Cleans up any navigation guards
	* - Changes the url if necessary
	* - Calls the scrollBehavior
	*/
	function finalizeNavigation(toLocation, from, isPush, replace$1, data) {
		const error = checkCanceledNavigation(toLocation, from);
		if (error) return error;
		const isFirstNavigation = from === START_LOCATION_NORMALIZED;
		const state = !isBrowser ? {} : history.state;
		if (isPush) if (replace$1 || isFirstNavigation) routerHistory.replace(toLocation.fullPath, assign({ scroll: isFirstNavigation && state && state.scroll }, data));
		else routerHistory.push(toLocation.fullPath, data);
		currentRoute.value = toLocation;
		handleScroll(toLocation, from, isPush, isFirstNavigation);
		markAsReady();
	}
	let removeHistoryListener;
	function setupListeners() {
		if (removeHistoryListener) return;
		removeHistoryListener = routerHistory.listen((to, _from, info) => {
			if (!router.listening) return;
			const toLocation = resolve(to);
			const shouldRedirect = handleRedirectRecord(toLocation, router.currentRoute.value);
			if (shouldRedirect) {
				pushWithRedirect(assign(shouldRedirect, {
					replace: true,
					force: true
				}), toLocation).catch(noop);
				return;
			}
			pendingLocation = toLocation;
			const from = currentRoute.value;
			if (isBrowser) saveScrollPosition(getScrollKey(from.fullPath, info.delta), computeScrollPosition());
			navigate(toLocation, from).catch((error) => {
				if (isNavigationFailure(error, ErrorTypes.NAVIGATION_ABORTED | ErrorTypes.NAVIGATION_CANCELLED)) return error;
				if (isNavigationFailure(error, ErrorTypes.NAVIGATION_GUARD_REDIRECT)) {
					pushWithRedirect(assign(locationAsObject(error.to), { force: true }), toLocation).then((failure) => {
						if (isNavigationFailure(failure, ErrorTypes.NAVIGATION_ABORTED | ErrorTypes.NAVIGATION_DUPLICATED) && !info.delta && info.type === NavigationType.pop) routerHistory.go(-1, false);
					}).catch(noop);
					return Promise.reject();
				}
				if (info.delta) routerHistory.go(-info.delta, false);
				return triggerError(error, toLocation, from);
			}).then((failure) => {
				failure = failure || finalizeNavigation(toLocation, from, false);
				if (failure) {
					if (info.delta && !isNavigationFailure(failure, ErrorTypes.NAVIGATION_CANCELLED)) routerHistory.go(-info.delta, false);
					else if (info.type === NavigationType.pop && isNavigationFailure(failure, ErrorTypes.NAVIGATION_ABORTED | ErrorTypes.NAVIGATION_DUPLICATED)) routerHistory.go(-1, false);
				}
				triggerAfterEach(toLocation, from, failure);
			}).catch(noop);
		});
	}
	let readyHandlers = useCallbacks();
	let errorListeners = useCallbacks();
	let ready;
	/**
	* Trigger errorListeners added via onError and throws the error as well
	*
	* @param error - error to throw
	* @param to - location we were navigating to when the error happened
	* @param from - location we were navigating from when the error happened
	* @returns the error as a rejected promise
	*/
	function triggerError(error, to, from) {
		markAsReady(error);
		const list = errorListeners.list();
		if (list.length) list.forEach((handler) => handler(error, to, from));
		else {
			console.error(error);
		}
		return Promise.reject(error);
	}
	function isReady() {
		if (ready && currentRoute.value !== START_LOCATION_NORMALIZED) return Promise.resolve();
		return new Promise((resolve$1, reject) => {
			readyHandlers.add([resolve$1, reject]);
		});
	}
	function markAsReady(err) {
		if (!ready) {
			ready = !err;
			setupListeners();
			readyHandlers.list().forEach(([resolve$1, reject]) => err ? reject(err) : resolve$1());
			readyHandlers.reset();
		}
		return err;
	}
	function handleScroll(to, from, isPush, isFirstNavigation) {
		const { scrollBehavior } = options;
		if (!isBrowser || !scrollBehavior) return Promise.resolve();
		const scrollPosition = !isPush && getSavedScrollPosition(getScrollKey(to.fullPath, 0)) || (isFirstNavigation || !isPush) && history.state && history.state.scroll || null;
		return nextTick().then(() => scrollBehavior(to, from, scrollPosition)).then((position) => position && scrollToPosition(position)).catch((err) => triggerError(err, to, from));
	}
	const go = (delta) => routerHistory.go(delta);
	let started;
	const installedApps = /* @__PURE__ */ new Set();
	const router = {
		currentRoute,
		listening: true,
		addRoute,
		removeRoute,
		clearRoutes: matcher.clearRoutes,
		hasRoute,
		getRoutes,
		resolve,
		options,
		push,
		replace,
		go,
		back: () => go(-1),
		forward: () => go(1),
		beforeEach: beforeGuards.add,
		beforeResolve: beforeResolveGuards.add,
		afterEach: afterGuards.add,
		onError: errorListeners.add,
		isReady,
		install(app) {
			app.component("RouterLink", RouterLink);
			app.component("RouterView", RouterView);
			app.config.globalProperties.$router = router;
			Object.defineProperty(app.config.globalProperties, "$route", {
				enumerable: true,
				get: () => unref(currentRoute)
			});
			if (isBrowser && !started && currentRoute.value === START_LOCATION_NORMALIZED) {
				started = true;
				push(routerHistory.location).catch((err) => {
				});
			}
			const reactiveRoute = {};
			for (const key in START_LOCATION_NORMALIZED) Object.defineProperty(reactiveRoute, key, {
				get: () => currentRoute.value[key],
				enumerable: true
			});
			app.provide(routerKey, router);
			app.provide(routeLocationKey, shallowReactive(reactiveRoute));
			app.provide(routerViewLocationKey, currentRoute);
			const unmountApp = app.unmount;
			installedApps.add(app);
			app.unmount = function() {
				installedApps.delete(app);
				if (installedApps.size < 1) {
					pendingLocation = START_LOCATION_NORMALIZED;
					removeHistoryListener && removeHistoryListener();
					removeHistoryListener = null;
					currentRoute.value = START_LOCATION_NORMALIZED;
					started = false;
					ready = false;
				}
				unmountApp();
			};
		}
	};
	function runGuardQueue(guards) {
		return guards.reduce((promise, guard) => promise.then(() => runWithContext(guard)), Promise.resolve());
	}
	return router;
}

if (!globalThis.$fetch) {
  globalThis.$fetch = $fetch.create({
    baseURL: baseURL()
  });
}
const appPageTransition = false;
const appKeepalive = false;
const nuxtLinkDefaults = { "componentName": "NuxtLink" };
const asyncDataDefaults = { "value": null, "errorValue": null, "deep": true };
const fetchDefaults = {};
const appId = "nuxt-app";
function getNuxtAppCtx(appName = appId) {
  return getContext(appName, {
    asyncContext: false
  });
}
const NuxtPluginIndicator = "__nuxt_plugin";
function createNuxtApp(options) {
  let hydratingCount = 0;
  const nuxtApp = {
    _name: appId,
    _scope: effectScope(),
    provide: void 0,
    globalName: "nuxt",
    versions: {
      get nuxt() {
        return "3.12.0";
      },
      get vue() {
        return nuxtApp.vueApp.version;
      }
    },
    payload: shallowReactive({
      data: shallowReactive({}),
      state: reactive({}),
      once: /* @__PURE__ */ new Set(),
      _errors: shallowReactive({})
    }),
    static: {
      data: {}
    },
    runWithContext(fn) {
      if (nuxtApp._scope.active && !getCurrentScope()) {
        return nuxtApp._scope.run(() => callWithNuxt(nuxtApp, fn));
      }
      return callWithNuxt(nuxtApp, fn);
    },
    isHydrating: false,
    deferHydration() {
      if (!nuxtApp.isHydrating) {
        return () => {
        };
      }
      hydratingCount++;
      let called = false;
      return () => {
        if (called) {
          return;
        }
        called = true;
        hydratingCount--;
        if (hydratingCount === 0) {
          nuxtApp.isHydrating = false;
          return nuxtApp.callHook("app:suspense:resolve");
        }
      };
    },
    _asyncDataPromises: {},
    _asyncData: shallowReactive({}),
    _payloadRevivers: {},
    ...options
  };
  {
    nuxtApp.payload.serverRendered = true;
  }
  nuxtApp.hooks = createHooks();
  nuxtApp.hook = nuxtApp.hooks.hook;
  {
    const contextCaller = async function(hooks, args) {
      for (const hook of hooks) {
        await nuxtApp.runWithContext(() => hook(...args));
      }
    };
    nuxtApp.hooks.callHook = (name, ...args) => nuxtApp.hooks.callHookWith(contextCaller, name, ...args);
  }
  nuxtApp.callHook = nuxtApp.hooks.callHook;
  nuxtApp.provide = (name, value) => {
    const $name = "$" + name;
    defineGetter(nuxtApp, $name, value);
    defineGetter(nuxtApp.vueApp.config.globalProperties, $name, value);
  };
  defineGetter(nuxtApp.vueApp, "$nuxt", nuxtApp);
  defineGetter(nuxtApp.vueApp.config.globalProperties, "$nuxt", nuxtApp);
  {
    if (nuxtApp.ssrContext) {
      nuxtApp.ssrContext.nuxt = nuxtApp;
      nuxtApp.ssrContext._payloadReducers = {};
      nuxtApp.payload.path = nuxtApp.ssrContext.url;
    }
    nuxtApp.ssrContext = nuxtApp.ssrContext || {};
    if (nuxtApp.ssrContext.payload) {
      Object.assign(nuxtApp.payload, nuxtApp.ssrContext.payload);
    }
    nuxtApp.ssrContext.payload = nuxtApp.payload;
    nuxtApp.ssrContext.config = {
      public: options.ssrContext.runtimeConfig.public,
      app: options.ssrContext.runtimeConfig.app
    };
  }
  const runtimeConfig = options.ssrContext.runtimeConfig;
  nuxtApp.provide("config", runtimeConfig);
  return nuxtApp;
}
function registerPluginHooks(nuxtApp, plugin2) {
  if (plugin2.hooks) {
    nuxtApp.hooks.addHooks(plugin2.hooks);
  }
}
async function applyPlugin(nuxtApp, plugin2) {
  if (typeof plugin2 === "function") {
    const { provide: provide2 } = await nuxtApp.runWithContext(() => plugin2(nuxtApp)) || {};
    if (provide2 && typeof provide2 === "object") {
      for (const key in provide2) {
        nuxtApp.provide(key, provide2[key]);
      }
    }
  }
}
async function applyPlugins(nuxtApp, plugins2) {
  var _a, _b, _c, _d;
  const resolvedPlugins = [];
  const unresolvedPlugins = [];
  const parallels = [];
  const errors = [];
  let promiseDepth = 0;
  async function executePlugin(plugin2) {
    var _a2;
    const unresolvedPluginsForThisPlugin = ((_a2 = plugin2.dependsOn) == null ? void 0 : _a2.filter((name) => plugins2.some((p) => p._name === name) && !resolvedPlugins.includes(name))) ?? [];
    if (unresolvedPluginsForThisPlugin.length > 0) {
      unresolvedPlugins.push([new Set(unresolvedPluginsForThisPlugin), plugin2]);
    } else {
      const promise = applyPlugin(nuxtApp, plugin2).then(async () => {
        if (plugin2._name) {
          resolvedPlugins.push(plugin2._name);
          await Promise.all(unresolvedPlugins.map(async ([dependsOn, unexecutedPlugin]) => {
            if (dependsOn.has(plugin2._name)) {
              dependsOn.delete(plugin2._name);
              if (dependsOn.size === 0) {
                promiseDepth++;
                await executePlugin(unexecutedPlugin);
              }
            }
          }));
        }
      });
      if (plugin2.parallel) {
        parallels.push(promise.catch((e) => errors.push(e)));
      } else {
        await promise;
      }
    }
  }
  for (const plugin2 of plugins2) {
    if (((_a = nuxtApp.ssrContext) == null ? void 0 : _a.islandContext) && ((_b = plugin2.env) == null ? void 0 : _b.islands) === false) {
      continue;
    }
    registerPluginHooks(nuxtApp, plugin2);
  }
  for (const plugin2 of plugins2) {
    if (((_c = nuxtApp.ssrContext) == null ? void 0 : _c.islandContext) && ((_d = plugin2.env) == null ? void 0 : _d.islands) === false) {
      continue;
    }
    await executePlugin(plugin2);
  }
  await Promise.all(parallels);
  if (promiseDepth) {
    for (let i = 0; i < promiseDepth; i++) {
      await Promise.all(parallels);
    }
  }
  if (errors.length) {
    throw errors[0];
  }
}
// @__NO_SIDE_EFFECTS__
function defineNuxtPlugin(plugin2) {
  if (typeof plugin2 === "function") {
    return plugin2;
  }
  const _name = plugin2._name || plugin2.name;
  delete plugin2.name;
  return Object.assign(plugin2.setup || (() => {
  }), plugin2, { [NuxtPluginIndicator]: true, _name });
}
function callWithNuxt(nuxt, setup, args) {
  const fn = () => setup();
  const nuxtAppCtx = getNuxtAppCtx(nuxt._name);
  {
    return nuxt.vueApp.runWithContext(() => nuxtAppCtx.callAsync(nuxt, fn));
  }
}
function tryUseNuxtApp(appName) {
  var _a;
  let nuxtAppInstance;
  if (hasInjectionContext()) {
    nuxtAppInstance = (_a = getCurrentInstance()) == null ? void 0 : _a.appContext.app.$nuxt;
  }
  nuxtAppInstance = nuxtAppInstance || getNuxtAppCtx(appName).tryUse();
  return nuxtAppInstance || null;
}
function useNuxtApp(appName) {
  const nuxtAppInstance = tryUseNuxtApp(appName);
  if (!nuxtAppInstance) {
    {
      throw new Error("[nuxt] instance unavailable");
    }
  }
  return nuxtAppInstance;
}
// @__NO_SIDE_EFFECTS__
function useRuntimeConfig(_event) {
  return useNuxtApp().$config;
}
function defineGetter(obj, key, val) {
  Object.defineProperty(obj, key, { get: () => val });
}
const LayoutMetaSymbol = Symbol("layout-meta");
const PageRouteSymbol = Symbol("route");
const useRouter = () => {
  var _a;
  return (_a = useNuxtApp()) == null ? void 0 : _a.$router;
};
const useRoute = () => {
  if (hasInjectionContext()) {
    return inject(PageRouteSymbol, useNuxtApp()._route);
  }
  return useNuxtApp()._route;
};
// @__NO_SIDE_EFFECTS__
function defineNuxtRouteMiddleware(middleware) {
  return middleware;
}
const isProcessingMiddleware = () => {
  try {
    if (useNuxtApp()._processingMiddleware) {
      return true;
    }
  } catch {
    return false;
  }
  return false;
};
const navigateTo = (to, options) => {
  if (!to) {
    to = "/";
  }
  const toPath = typeof to === "string" ? to : withQuery(to.path || "/", to.query || {}) + (to.hash || "");
  const isExternal = (options == null ? void 0 : options.external) || hasProtocol(toPath, { acceptRelative: true });
  if (isExternal) {
    if (!(options == null ? void 0 : options.external)) {
      throw new Error("Navigating to an external URL is not allowed by default. Use `navigateTo(url, { external: true })`.");
    }
    const { protocol } = new URL(toPath, "http://localhost");
    if (protocol && isScriptProtocol(protocol)) {
      throw new Error(`Cannot navigate to a URL with '${protocol}' protocol.`);
    }
  }
  const inMiddleware = isProcessingMiddleware();
  const router = useRouter();
  const nuxtApp = useNuxtApp();
  {
    if (nuxtApp.ssrContext) {
      const fullPath = typeof to === "string" || isExternal ? toPath : router.resolve(to).fullPath || "/";
      const location2 = isExternal ? toPath : joinURL((/* @__PURE__ */ useRuntimeConfig()).app.baseURL, fullPath);
      const redirect = async function(response) {
        await nuxtApp.callHook("app:redirected");
        const encodedLoc = location2.replace(/"/g, "%22");
        nuxtApp.ssrContext._renderResponse = {
          statusCode: sanitizeStatusCode((options == null ? void 0 : options.redirectCode) || 302, 302),
          body: `<!DOCTYPE html><html><head><meta http-equiv="refresh" content="0; url=${encodedLoc}"></head></html>`,
          headers: { location: encodeURI(location2) }
        };
        return response;
      };
      if (!isExternal && inMiddleware) {
        router.afterEach((final) => final.fullPath === fullPath ? redirect(false) : void 0);
        return to;
      }
      return redirect(!inMiddleware ? void 0 : (
        /* abort route navigation */
        false
      ));
    }
  }
  if (isExternal) {
    nuxtApp._scope.stop();
    if (options == null ? void 0 : options.replace) {
      (void 0).replace(toPath);
    } else {
      (void 0).href = toPath;
    }
    if (inMiddleware) {
      if (!nuxtApp.isHydrating) {
        return false;
      }
      return new Promise(() => {
      });
    }
    return Promise.resolve();
  }
  return (options == null ? void 0 : options.replace) ? router.replace(to) : router.push(to);
};
const NUXT_ERROR_SIGNATURE = "__nuxt_error";
const useError = () => toRef(useNuxtApp().payload, "error");
const showError = (error) => {
  const nuxtError = createError(error);
  try {
    const nuxtApp = useNuxtApp();
    const error2 = useError();
    if (false) ;
    error2.value = error2.value || nuxtError;
  } catch {
    throw nuxtError;
  }
  return nuxtError;
};
const isNuxtError = (error) => !!error && typeof error === "object" && NUXT_ERROR_SIGNATURE in error;
const createError = (error) => {
  const nuxtError = createError$1(error);
  Object.defineProperty(nuxtError, NUXT_ERROR_SIGNATURE, {
    value: true,
    configurable: false,
    writable: false
  });
  return nuxtError;
};
function resolveUnref(r) {
  return typeof r === "function" ? r() : unref(r);
}
function resolveUnrefHeadInput(ref2) {
  if (ref2 instanceof Promise || ref2 instanceof Date || ref2 instanceof RegExp)
    return ref2;
  const root = resolveUnref(ref2);
  if (!ref2 || !root)
    return root;
  if (Array.isArray(root))
    return root.map((r) => resolveUnrefHeadInput(r));
  if (typeof root === "object") {
    const resolved = {};
    for (const k in root) {
      if (!Object.prototype.hasOwnProperty.call(root, k)) {
        continue;
      }
      if (k === "titleTemplate" || k[0] === "o" && k[1] === "n") {
        resolved[k] = unref(root[k]);
        continue;
      }
      resolved[k] = resolveUnrefHeadInput(root[k]);
    }
    return resolved;
  }
  return root;
}
const headSymbol = "usehead";
const _global = typeof globalThis !== "undefined" ? globalThis : typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : {};
const globalKey$1 = "__unhead_injection_handler__";
function setHeadInjectionHandler(handler) {
  _global[globalKey$1] = handler;
}
function injectHead() {
  if (globalKey$1 in _global) {
    return _global[globalKey$1]();
  }
  const head = inject(headSymbol);
  return head || getActiveHead();
}
const unhead_KgADcZ0jPj = /* @__PURE__ */ defineNuxtPlugin({
  name: "nuxt:head",
  enforce: "pre",
  setup(nuxtApp) {
    const head = nuxtApp.ssrContext.head;
    setHeadInjectionHandler(
      // need a fresh instance of the nuxt app to avoid parallel requests interfering with each other
      () => useNuxtApp().vueApp._context.provides.usehead
    );
    nuxtApp.vueApp.use(head);
  }
});
function createContext(opts = {}) {
  let currentInstance;
  let isSingleton = false;
  const checkConflict = (instance) => {
    if (currentInstance && currentInstance !== instance) {
      throw new Error("Context conflict");
    }
  };
  let als;
  if (opts.asyncContext) {
    const _AsyncLocalStorage = opts.AsyncLocalStorage || globalThis.AsyncLocalStorage;
    if (_AsyncLocalStorage) {
      als = new _AsyncLocalStorage();
    } else {
      console.warn("[unctx] `AsyncLocalStorage` is not provided.");
    }
  }
  const _getCurrentInstance = () => {
    if (als) {
      const instance = als.getStore();
      if (instance !== void 0) {
        return instance;
      }
    }
    return currentInstance;
  };
  return {
    use: () => {
      const _instance = _getCurrentInstance();
      if (_instance === void 0) {
        throw new Error("Context is not available");
      }
      return _instance;
    },
    tryUse: () => {
      return _getCurrentInstance();
    },
    set: (instance, replace) => {
      if (!replace) {
        checkConflict(instance);
      }
      currentInstance = instance;
      isSingleton = true;
    },
    unset: () => {
      currentInstance = void 0;
      isSingleton = false;
    },
    call: (instance, callback) => {
      checkConflict(instance);
      currentInstance = instance;
      try {
        return als ? als.run(instance, callback) : callback();
      } finally {
        if (!isSingleton) {
          currentInstance = void 0;
        }
      }
    },
    async callAsync(instance, callback) {
      currentInstance = instance;
      const onRestore = () => {
        currentInstance = instance;
      };
      const onLeave = () => currentInstance === instance ? onRestore : void 0;
      asyncHandlers.add(onLeave);
      try {
        const r = als ? als.run(instance, callback) : callback();
        if (!isSingleton) {
          currentInstance = void 0;
        }
        return await r;
      } finally {
        asyncHandlers.delete(onLeave);
      }
    }
  };
}
function createNamespace(defaultOpts = {}) {
  const contexts = {};
  return {
    get(key, opts = {}) {
      if (!contexts[key]) {
        contexts[key] = createContext({ ...defaultOpts, ...opts });
      }
      return contexts[key];
    }
  };
}
const _globalThis = typeof globalThis !== "undefined" ? globalThis : typeof self !== "undefined" ? self : typeof global !== "undefined" ? global : {};
const globalKey = "__unctx__";
_globalThis[globalKey] || (_globalThis[globalKey] = createNamespace());
const asyncHandlersKey = "__unctx_async_handlers__";
const asyncHandlers = _globalThis[asyncHandlersKey] || (_globalThis[asyncHandlersKey] = /* @__PURE__ */ new Set());
function executeAsync(function_) {
  const restores = [];
  for (const leaveHandler of asyncHandlers) {
    const restore2 = leaveHandler();
    if (restore2) {
      restores.push(restore2);
    }
  }
  const restore = () => {
    for (const restore2 of restores) {
      restore2();
    }
  };
  let awaitable = function_();
  if (awaitable && typeof awaitable === "object" && "catch" in awaitable) {
    awaitable = awaitable.catch((error) => {
      restore();
      throw error;
    });
  }
  return [awaitable, restore];
}
const interpolatePath = (route, match) => {
  return match.path.replace(/(:\w+)\([^)]+\)/g, "$1").replace(/(:\w+)[?+*]/g, "$1").replace(/:\w+/g, (r) => {
    var _a;
    return ((_a = route.params[r.slice(1)]) == null ? void 0 : _a.toString()) || "";
  });
};
const generateRouteKey$1 = (routeProps, override) => {
  const matchedRoute = routeProps.route.matched.find((m) => {
    var _a;
    return ((_a = m.components) == null ? void 0 : _a.default) === routeProps.Component.type;
  });
  const source = override ?? (matchedRoute == null ? void 0 : matchedRoute.meta.key) ?? (matchedRoute && interpolatePath(routeProps.route, matchedRoute));
  return typeof source === "function" ? source(routeProps.route) : source;
};
const wrapInKeepAlive = (props, children) => {
  return { default: () => children };
};
function toArray(value) {
  return Array.isArray(value) ? value : [value];
}
async function getRouteRules(url) {
  {
    const _routeRulesMatcher = toRouteMatcher(
      createRouter$1({ routes: (/* @__PURE__ */ useRuntimeConfig()).nitro.routeRules })
    );
    return defu({}, ..._routeRulesMatcher.matchAll(url).reverse());
  }
}
const _routes = [
  {
    name: "index",
    path: "/",
    component: () => import('./index-DP2mB2ux.mjs').then((m) => m.default || m)
  }
];
const _wrapIf = (component, props, slots) => {
  props = props === true ? {} : props;
  return { default: () => {
    var _a;
    return props ? h(component, props, slots) : (_a = slots.default) == null ? void 0 : _a.call(slots);
  } };
};
function generateRouteKey(route) {
  const source = (route == null ? void 0 : route.meta.key) ?? route.path.replace(/(:\w+)\([^)]+\)/g, "$1").replace(/(:\w+)[?+*]/g, "$1").replace(/:\w+/g, (r) => {
    var _a;
    return ((_a = route.params[r.slice(1)]) == null ? void 0 : _a.toString()) || "";
  });
  return typeof source === "function" ? source(route) : source;
}
function isChangingPage(to, from) {
  if (to === from || from === START_LOCATION_NORMALIZED) {
    return false;
  }
  if (generateRouteKey(to) !== generateRouteKey(from)) {
    return true;
  }
  const areComponentsSame = to.matched.every(
    (comp, index) => {
      var _a, _b;
      return comp.components && comp.components.default === ((_b = (_a = from.matched[index]) == null ? void 0 : _a.components) == null ? void 0 : _b.default);
    }
  );
  if (areComponentsSame) {
    return false;
  }
  return true;
}
const routerOptions0 = {
  scrollBehavior(to, from, savedPosition) {
    var _a;
    const nuxtApp = useNuxtApp();
    const behavior = ((_a = useRouter().options) == null ? void 0 : _a.scrollBehaviorType) ?? "auto";
    let position = savedPosition || void 0;
    const routeAllowsScrollToTop = typeof to.meta.scrollToTop === "function" ? to.meta.scrollToTop(to, from) : to.meta.scrollToTop;
    if (!position && from && to && routeAllowsScrollToTop !== false && isChangingPage(to, from)) {
      position = { left: 0, top: 0 };
    }
    if (to.path === from.path) {
      if (from.hash && !to.hash) {
        return { left: 0, top: 0 };
      }
      if (to.hash) {
        return { el: to.hash, top: _getHashElementScrollMarginTop(to.hash), behavior };
      }
      return false;
    }
    const hasTransition = (route) => !!(route.meta.pageTransition ?? appPageTransition);
    const hookToWait = hasTransition(from) && hasTransition(to) ? "page:transition:finish" : "page:finish";
    return new Promise((resolve) => {
      nuxtApp.hooks.hookOnce(hookToWait, async () => {
        await new Promise((resolve2) => setTimeout(resolve2, 0));
        if (to.hash) {
          position = { el: to.hash, top: _getHashElementScrollMarginTop(to.hash), behavior };
        }
        resolve(position);
      });
    });
  }
};
function _getHashElementScrollMarginTop(selector) {
  try {
    const elem = (void 0).querySelector(selector);
    if (elem) {
      return Number.parseFloat(getComputedStyle(elem).scrollMarginTop);
    }
  } catch {
  }
  return 0;
}
const configRouterOptions = {
  hashMode: false,
  scrollBehaviorType: "auto"
};
const routerOptions = {
  ...configRouterOptions,
  ...routerOptions0
};
const validate = /* @__PURE__ */ defineNuxtRouteMiddleware(async (to) => {
  var _a;
  let __temp, __restore;
  if (!((_a = to.meta) == null ? void 0 : _a.validate)) {
    return;
  }
  useNuxtApp();
  useRouter();
  const result = ([__temp, __restore] = executeAsync(() => Promise.resolve(to.meta.validate(to))), __temp = await __temp, __restore(), __temp);
  if (result === true) {
    return;
  }
  {
    return result;
  }
});
const manifest_45route_45rule = /* @__PURE__ */ defineNuxtRouteMiddleware(async (to) => {
  {
    return;
  }
});
const globalMiddleware = [
  validate,
  manifest_45route_45rule
];
const namedMiddleware = {};
const plugin = /* @__PURE__ */ defineNuxtPlugin({
  name: "nuxt:router",
  enforce: "pre",
  async setup(nuxtApp) {
    var _a, _b, _c, _d;
    let __temp, __restore;
    let routerBase = (/* @__PURE__ */ useRuntimeConfig()).app.baseURL;
    if (routerOptions.hashMode && !routerBase.includes("#")) {
      routerBase += "#";
    }
    const history = ((_a = routerOptions.history) == null ? void 0 : _a.call(routerOptions, routerBase)) ?? createMemoryHistory(routerBase);
    const routes = ((_b = routerOptions.routes) == null ? void 0 : _b.call(routerOptions, _routes)) ?? _routes;
    let startPosition;
    const router = createRouter({
      ...routerOptions,
      scrollBehavior: (to, from, savedPosition) => {
        if (from === START_LOCATION_NORMALIZED) {
          startPosition = savedPosition;
          return;
        }
        if (routerOptions.scrollBehavior) {
          router.options.scrollBehavior = routerOptions.scrollBehavior;
          if ("scrollRestoration" in (void 0).history) {
            const unsub = router.beforeEach(() => {
              unsub();
              (void 0).history.scrollRestoration = "manual";
            });
          }
          return routerOptions.scrollBehavior(to, START_LOCATION_NORMALIZED, startPosition || savedPosition);
        }
      },
      history,
      routes
    });
    nuxtApp.vueApp.use(router);
    const previousRoute = shallowRef(router.currentRoute.value);
    router.afterEach((_to, from) => {
      previousRoute.value = from;
    });
    Object.defineProperty(nuxtApp.vueApp.config.globalProperties, "previousRoute", {
      get: () => previousRoute.value
    });
    const initialURL = nuxtApp.ssrContext.url;
    const _route = shallowRef(router.currentRoute.value);
    const syncCurrentRoute = () => {
      _route.value = router.currentRoute.value;
    };
    nuxtApp.hook("page:finish", syncCurrentRoute);
    router.afterEach((to, from) => {
      var _a2, _b2, _c2, _d2;
      if (((_b2 = (_a2 = to.matched[0]) == null ? void 0 : _a2.components) == null ? void 0 : _b2.default) === ((_d2 = (_c2 = from.matched[0]) == null ? void 0 : _c2.components) == null ? void 0 : _d2.default)) {
        syncCurrentRoute();
      }
    });
    const route = {};
    for (const key in _route.value) {
      Object.defineProperty(route, key, {
        get: () => _route.value[key]
      });
    }
    nuxtApp._route = shallowReactive(route);
    nuxtApp._middleware = nuxtApp._middleware || {
      global: [],
      named: {}
    };
    useError();
    if (!((_c = nuxtApp.ssrContext) == null ? void 0 : _c.islandContext)) {
      router.afterEach(async (to, _from, failure) => {
        delete nuxtApp._processingMiddleware;
        if (failure) {
          await nuxtApp.callHook("page:loading:end");
        }
        if ((failure == null ? void 0 : failure.type) === 4) {
          return;
        }
        if (to.matched.length === 0) {
          await nuxtApp.runWithContext(() => showError(createError$1({
            statusCode: 404,
            fatal: false,
            statusMessage: `Page not found: ${to.fullPath}`,
            data: {
              path: to.fullPath
            }
          })));
        } else if (to.redirectedFrom && to.fullPath !== initialURL) {
          await nuxtApp.runWithContext(() => navigateTo(to.fullPath || "/"));
        }
      });
    }
    try {
      if (true) {
        ;
        [__temp, __restore] = executeAsync(() => router.push(initialURL)), await __temp, __restore();
        ;
      }
      ;
      [__temp, __restore] = executeAsync(() => router.isReady()), await __temp, __restore();
      ;
    } catch (error2) {
      [__temp, __restore] = executeAsync(() => nuxtApp.runWithContext(() => showError(error2))), await __temp, __restore();
    }
    const resolvedInitialRoute = router.currentRoute.value;
    syncCurrentRoute();
    if ((_d = nuxtApp.ssrContext) == null ? void 0 : _d.islandContext) {
      return { provide: { router } };
    }
    const initialLayout = nuxtApp.payload.state._layout;
    router.beforeEach(async (to, from) => {
      var _a2, _b2;
      await nuxtApp.callHook("page:loading:start");
      to.meta = reactive(to.meta);
      if (nuxtApp.isHydrating && initialLayout && !isReadonly(to.meta.layout)) {
        to.meta.layout = initialLayout;
      }
      nuxtApp._processingMiddleware = true;
      if (!((_a2 = nuxtApp.ssrContext) == null ? void 0 : _a2.islandContext)) {
        const middlewareEntries = /* @__PURE__ */ new Set([...globalMiddleware, ...nuxtApp._middleware.global]);
        for (const component of to.matched) {
          const componentMiddleware = component.meta.middleware;
          if (!componentMiddleware) {
            continue;
          }
          for (const entry2 of toArray(componentMiddleware)) {
            middlewareEntries.add(entry2);
          }
        }
        {
          const routeRules = await nuxtApp.runWithContext(() => getRouteRules(to.path));
          if (routeRules.appMiddleware) {
            for (const key in routeRules.appMiddleware) {
              if (routeRules.appMiddleware[key]) {
                middlewareEntries.add(key);
              } else {
                middlewareEntries.delete(key);
              }
            }
          }
        }
        for (const entry2 of middlewareEntries) {
          const middleware = typeof entry2 === "string" ? nuxtApp._middleware.named[entry2] || await ((_b2 = namedMiddleware[entry2]) == null ? void 0 : _b2.call(namedMiddleware).then((r) => r.default || r)) : entry2;
          if (!middleware) {
            throw new Error(`Unknown route middleware: '${entry2}'.`);
          }
          const result = await nuxtApp.runWithContext(() => middleware(to, from));
          {
            if (result === false || result instanceof Error) {
              const error2 = result || createError$1({
                statusCode: 404,
                statusMessage: `Page Not Found: ${initialURL}`
              });
              await nuxtApp.runWithContext(() => showError(error2));
              return false;
            }
          }
          if (result === true) {
            continue;
          }
          if (result || result === false) {
            return result;
          }
        }
      }
    });
    router.onError(async () => {
      delete nuxtApp._processingMiddleware;
      await nuxtApp.callHook("page:loading:end");
    });
    nuxtApp.hooks.hookOnce("app:created", async () => {
      try {
        if ("name" in resolvedInitialRoute) {
          resolvedInitialRoute.name = void 0;
        }
        await router.replace({
          ...resolvedInitialRoute,
          force: true
        });
        router.options.scrollBehavior = routerOptions.scrollBehavior;
      } catch (error2) {
        await nuxtApp.runWithContext(() => showError(error2));
      }
    });
    return { provide: { router } };
  }
});
function definePayloadReducer(name, reduce) {
  {
    useNuxtApp().ssrContext._payloadReducers[name] = reduce;
  }
}
const reducers = {
  NuxtError: (data) => isNuxtError(data) && data.toJSON(),
  EmptyShallowRef: (data) => isRef(data) && isShallow(data) && !data.value && (typeof data.value === "bigint" ? "0n" : JSON.stringify(data.value) || "_"),
  EmptyRef: (data) => isRef(data) && !data.value && (typeof data.value === "bigint" ? "0n" : JSON.stringify(data.value) || "_"),
  ShallowRef: (data) => isRef(data) && isShallow(data) && data.value,
  ShallowReactive: (data) => isReactive(data) && isShallow(data) && toRaw(data),
  Ref: (data) => isRef(data) && data.value,
  Reactive: (data) => isReactive(data) && toRaw(data)
};
const revive_payload_server_eJ33V7gbc6 = /* @__PURE__ */ defineNuxtPlugin({
  name: "nuxt:revive-payload:server",
  setup() {
    for (const reducer in reducers) {
      definePayloadReducer(reducer, reducers[reducer]);
    }
  }
});
const components_plugin_KR1HBZs4kY = /* @__PURE__ */ defineNuxtPlugin({
  name: "nuxt:global-components"
});
const plugins = [
  unhead_KgADcZ0jPj,
  plugin,
  revive_payload_server_eJ33V7gbc6,
  components_plugin_KR1HBZs4kY
];
const RouteProvider = defineComponent({
  props: {
    vnode: {
      type: Object,
      required: true
    },
    route: {
      type: Object,
      required: true
    },
    vnodeRef: Object,
    renderKey: String,
    trackRootNodes: Boolean
  },
  setup(props) {
    const previousKey = props.renderKey;
    const previousRoute = props.route;
    const route = {};
    for (const key in props.route) {
      Object.defineProperty(route, key, {
        get: () => previousKey === props.renderKey ? props.route[key] : previousRoute[key]
      });
    }
    provide(PageRouteSymbol, shallowReactive(route));
    return () => {
      return h(props.vnode, { ref: props.vnodeRef });
    };
  }
});
const __nuxt_component_0 = defineComponent({
  name: "NuxtPage",
  inheritAttrs: false,
  props: {
    name: {
      type: String
    },
    transition: {
      type: [Boolean, Object],
      default: void 0
    },
    keepalive: {
      type: [Boolean, Object],
      default: void 0
    },
    route: {
      type: Object
    },
    pageKey: {
      type: [Function, String],
      default: null
    }
  },
  setup(props, { attrs, slots, expose }) {
    const nuxtApp = useNuxtApp();
    const pageRef = ref();
    const forkRoute = inject(PageRouteSymbol, null);
    let previousPageKey;
    expose({ pageRef });
    inject(LayoutMetaSymbol, null);
    let vnode;
    const done = nuxtApp.deferHydration();
    if (props.pageKey) {
      watch(() => props.pageKey, (next, prev) => {
        if (next !== prev) {
          nuxtApp.callHook("page:loading:start");
        }
      });
    }
    return () => {
      return h(RouterView, { name: props.name, route: props.route, ...attrs }, {
        default: (routeProps) => {
          if (!routeProps.Component) {
            done();
            return;
          }
          const key = generateRouteKey$1(routeProps, props.pageKey);
          if (!nuxtApp.isHydrating && !hasChildrenRoutes(forkRoute, routeProps.route, routeProps.Component) && previousPageKey === key) {
            nuxtApp.callHook("page:loading:end");
          }
          previousPageKey = key;
          const hasTransition = !!(props.transition ?? routeProps.route.meta.pageTransition ?? appPageTransition);
          const transitionProps = hasTransition && _mergeTransitionProps([
            props.transition,
            routeProps.route.meta.pageTransition,
            appPageTransition,
            { onAfterLeave: () => {
              nuxtApp.callHook("page:transition:finish", routeProps.Component);
            } }
          ].filter(Boolean));
          const keepaliveConfig = props.keepalive ?? routeProps.route.meta.keepalive ?? appKeepalive;
          vnode = _wrapIf(
            Transition,
            hasTransition && transitionProps,
            wrapInKeepAlive(
              keepaliveConfig,
              h(Suspense, {
                suspensible: true,
                onPending: () => nuxtApp.callHook("page:start", routeProps.Component),
                onResolve: () => {
                  nextTick(() => nuxtApp.callHook("page:finish", routeProps.Component).then(() => nuxtApp.callHook("page:loading:end")).finally(done));
                }
              }, {
                default: () => {
                  const providerVNode = h(RouteProvider, {
                    key: key || void 0,
                    vnode: slots.default ? h(Fragment, void 0, slots.default(routeProps)) : routeProps.Component,
                    route: routeProps.route,
                    renderKey: key || void 0,
                    trackRootNodes: hasTransition,
                    vnodeRef: pageRef
                  });
                  return providerVNode;
                }
              })
            )
          ).default();
          return vnode;
        }
      });
    };
  }
});
function _mergeTransitionProps(routeProps) {
  const _props = routeProps.map((prop) => ({
    ...prop,
    onAfterLeave: prop.onAfterLeave ? toArray(prop.onAfterLeave) : void 0
  }));
  return defu(..._props);
}
function hasChildrenRoutes(fork, newRoute, Component) {
  if (!fork) {
    return false;
  }
  const index = newRoute.matched.findIndex((m) => {
    var _a;
    return ((_a = m.components) == null ? void 0 : _a.default) === (Component == null ? void 0 : Component.type);
  });
  return index < newRoute.matched.length - 1;
}
const _export_sfc = (sfc, props) => {
  const target = sfc.__vccOpts || sfc;
  for (const [key, val] of props) {
    target[key] = val;
  }
  return target;
};
const _sfc_main$2 = {};
function _sfc_ssrRender(_ctx, _push, _parent, _attrs) {
  const _component_NuxtPage = __nuxt_component_0;
  _push(`<div${ssrRenderAttrs(_attrs)}>`);
  _push(ssrRenderComponent(_component_NuxtPage, null, null, _parent));
  _push(`</div>`);
}
const _sfc_setup$2 = _sfc_main$2.setup;
_sfc_main$2.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("app.vue");
  return _sfc_setup$2 ? _sfc_setup$2(props, ctx) : void 0;
};
const AppComponent = /* @__PURE__ */ _export_sfc(_sfc_main$2, [["ssrRender", _sfc_ssrRender]]);
const _sfc_main$1 = {
  __name: "nuxt-error-page",
  __ssrInlineRender: true,
  props: {
    error: Object
  },
  setup(__props) {
    const props = __props;
    const _error = props.error;
    _error.stack ? _error.stack.split("\n").splice(1).map((line) => {
      const text = line.replace("webpack:/", "").replace(".vue", ".js").trim();
      return {
        text,
        internal: line.includes("node_modules") && !line.includes(".cache") || line.includes("internal") || line.includes("new Promise")
      };
    }).map((i) => `<span class="stack${i.internal ? " internal" : ""}">${i.text}</span>`).join("\n") : "";
    const statusCode = Number(_error.statusCode || 500);
    const is404 = statusCode === 404;
    const statusMessage = _error.statusMessage ?? (is404 ? "Page Not Found" : "Internal Server Error");
    const description = _error.message || _error.toString();
    const stack = void 0;
    const _Error404 = defineAsyncComponent(() => import('./error-404-DR0NGjh2.mjs').then((r) => r.default || r));
    const _Error = defineAsyncComponent(() => import('./error-500-D8m6BhqC.mjs').then((r) => r.default || r));
    const ErrorTemplate = is404 ? _Error404 : _Error;
    return (_ctx, _push, _parent, _attrs) => {
      _push(ssrRenderComponent(unref(ErrorTemplate), mergeProps({ statusCode: unref(statusCode), statusMessage: unref(statusMessage), description: unref(description), stack: unref(stack) }, _attrs), null, _parent));
    };
  }
};
const _sfc_setup$1 = _sfc_main$1.setup;
_sfc_main$1.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("node_modules/nuxt/dist/app/components/nuxt-error-page.vue");
  return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
const _sfc_main = {
  __name: "nuxt-root",
  __ssrInlineRender: true,
  setup(__props) {
    const IslandRenderer = () => null;
    const nuxtApp = useNuxtApp();
    nuxtApp.deferHydration();
    nuxtApp.ssrContext.url;
    const SingleRenderer = false;
    provide(PageRouteSymbol, useRoute());
    nuxtApp.hooks.callHookWith((hooks) => hooks.map((hook) => hook()), "vue:setup");
    const error = useError();
    const abortRender = error.value && !nuxtApp.ssrContext.error;
    onErrorCaptured((err, target, info) => {
      nuxtApp.hooks.callHook("vue:error", err, target, info).catch((hookError) => console.error("[nuxt] Error in `vue:error` hook", hookError));
      {
        const p = nuxtApp.runWithContext(() => showError(err));
        onServerPrefetch(() => p);
        return false;
      }
    });
    const islandContext = nuxtApp.ssrContext.islandContext;
    return (_ctx, _push, _parent, _attrs) => {
      ssrRenderSuspense(_push, {
        default: () => {
          if (unref(abortRender)) {
            _push(`<div></div>`);
          } else if (unref(error)) {
            _push(ssrRenderComponent(unref(_sfc_main$1), { error: unref(error) }, null, _parent));
          } else if (unref(islandContext)) {
            _push(ssrRenderComponent(unref(IslandRenderer), { context: unref(islandContext) }, null, _parent));
          } else if (unref(SingleRenderer)) {
            renderVNode(_push, createVNode(resolveDynamicComponent(unref(SingleRenderer)), null, null), _parent);
          } else {
            _push(ssrRenderComponent(unref(AppComponent), null, null, _parent));
          }
        }});
    };
  }
};
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("node_modules/nuxt/dist/app/components/nuxt-root.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
let entry;
{
  entry = async function createNuxtAppServer(ssrContext) {
    const vueApp = createApp(_sfc_main);
    const nuxt = createNuxtApp({ vueApp, ssrContext });
    try {
      await applyPlugins(nuxt, plugins);
      await nuxt.hooks.callHook("app:created", vueApp);
    } catch (error) {
      await nuxt.hooks.callHook("app:error", error);
      nuxt.payload.error = nuxt.payload.error || createError(error);
    }
    if (ssrContext == null ? void 0 : ssrContext._renderResponse) {
      throw new Error("skipping render");
    }
    return vueApp;
  };
}
const entry_default = (ssrContext) => entry(ssrContext);

export { _export_sfc as _, useRuntimeConfig as a, nuxtLinkDefaults as b, useNuxtApp as c, asyncDataDefaults as d, entry_default as default, createError as e, fetchDefaults as f, injectHead as i, navigateTo as n, resolveUnrefHeadInput as r, useRouter as u };
//# sourceMappingURL=server.mjs.map
