/* @__NO_SIDE_EFFECTS__ */
function createNotImplementedError(name) {
	return new Error(`[unenv] ${name} is not implemented yet!`);
}
/* @__NO_SIDE_EFFECTS__ */
function notImplemented(name) {
	const fn = () => {
		throw createNotImplementedError(name);
	};
	return Object.assign(fn, { __unenv__: true });
}

// @ts-nocheck
// Source: https://github.com/beatgammit/base64-js/blob/88957c9943c7e2a0f03cdf73e71d579e433627d3/index.js
const lookup$1 = [];
const revLookup = [];
const Arr = typeof Uint8Array === "undefined" ? Array : Uint8Array;
const code = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
for (let i = 0, len = code.length; i < len; ++i) {
	lookup$1[i] = code[i];
	revLookup[code.charCodeAt(i)] = i;
}
// Support decoding URL-safe base64 strings, as Node.js does.
// See: https://en.wikipedia.org/wiki/Base64#URL_applications
revLookup["-".charCodeAt(0)] = 62;
revLookup["_".charCodeAt(0)] = 63;
function getLens(b64) {
	const len = b64.length;
	if (len % 4 > 0) {
		throw new Error("Invalid string. Length must be a multiple of 4");
	}
	// Trim off extra bytes after placeholder bytes are found
	// See: https://github.com/beatgammit/base64-js/issues/42
	let validLen = b64.indexOf("=");
	if (validLen === -1) {
		validLen = len;
	}
	const placeHoldersLen = validLen === len ? 0 : 4 - validLen % 4;
	return [validLen, placeHoldersLen];
}
function _byteLength(b64, validLen, placeHoldersLen) {
	return (validLen + placeHoldersLen) * 3 / 4 - placeHoldersLen;
}
function toByteArray(b64) {
	let tmp;
	const lens = getLens(b64);
	const validLen = lens[0];
	const placeHoldersLen = lens[1];
	const arr = new Arr(_byteLength(b64, validLen, placeHoldersLen));
	let curByte = 0;
	// if there are placeholders, only get up to the last complete 4 chars
	const len = placeHoldersLen > 0 ? validLen - 4 : validLen;
	let i;
	for (i = 0; i < len; i += 4) {
		tmp = revLookup[b64.charCodeAt(i)] << 18 | revLookup[b64.charCodeAt(i + 1)] << 12 | revLookup[b64.charCodeAt(i + 2)] << 6 | revLookup[b64.charCodeAt(i + 3)];
		arr[curByte++] = tmp >> 16 & 255;
		arr[curByte++] = tmp >> 8 & 255;
		arr[curByte++] = tmp & 255;
	}
	if (placeHoldersLen === 2) {
		tmp = revLookup[b64.charCodeAt(i)] << 2 | revLookup[b64.charCodeAt(i + 1)] >> 4;
		arr[curByte++] = tmp & 255;
	}
	if (placeHoldersLen === 1) {
		tmp = revLookup[b64.charCodeAt(i)] << 10 | revLookup[b64.charCodeAt(i + 1)] << 4 | revLookup[b64.charCodeAt(i + 2)] >> 2;
		arr[curByte++] = tmp >> 8 & 255;
		arr[curByte++] = tmp & 255;
	}
	return arr;
}
function tripletToBase64(num) {
	return lookup$1[num >> 18 & 63] + lookup$1[num >> 12 & 63] + lookup$1[num >> 6 & 63] + lookup$1[num & 63];
}
function encodeChunk(uint8, start, end) {
	let tmp;
	const output = [];
	for (let i = start; i < end; i += 3) {
		tmp = (uint8[i] << 16 & 16711680) + (uint8[i + 1] << 8 & 65280) + (uint8[i + 2] & 255);
		output.push(tripletToBase64(tmp));
	}
	return output.join("");
}
function fromByteArray(uint8) {
	let tmp;
	const len = uint8.length;
	const extraBytes = len % 3;
	const parts = [];
	const maxChunkLength = 16383;
	// go through the array every three bytes, we'll deal with trailing stuff later
	for (let i = 0, len2 = len - extraBytes; i < len2; i += maxChunkLength) {
		parts.push(encodeChunk(uint8, i, i + maxChunkLength > len2 ? len2 : i + maxChunkLength));
	}
	// pad the end with zeros, but make sure to not forget the extra bytes
	if (extraBytes === 1) {
		tmp = uint8[len - 1];
		parts.push(lookup$1[tmp >> 2] + lookup$1[tmp << 4 & 63] + "==");
	} else if (extraBytes === 2) {
		tmp = (uint8[len - 2] << 8) + uint8[len - 1];
		parts.push(lookup$1[tmp >> 10] + lookup$1[tmp >> 4 & 63] + lookup$1[tmp << 2 & 63] + "=");
	}
	return parts.join("");
}

// Source: https://github.com/feross/ieee754/blob/8a0041f3d5e41b7cfcf0e0158fcf84b071709bda/index.js
/*! ieee754. BSD-3-Clause License. Feross Aboukhadijeh <https://feross.org/opensource> */
function read(buffer, offset, isLE, mLen, nBytes) {
	let e, m;
	const eLen = nBytes * 8 - mLen - 1;
	const eMax = (1 << eLen) - 1;
	const eBias = eMax >> 1;
	let nBits = -7;
	let i = isLE ? nBytes - 1 : 0;
	const d = isLE ? -1 : 1;
	let s = buffer[offset + i];
	i += d;
	e = s & (1 << -nBits) - 1;
	s >>= -nBits;
	nBits += eLen;
	while (nBits > 0) {
		e = e * 256 + buffer[offset + i];
		i += d;
		nBits -= 8;
	}
	m = e & (1 << -nBits) - 1;
	e >>= -nBits;
	nBits += mLen;
	while (nBits > 0) {
		m = m * 256 + buffer[offset + i];
		i += d;
		nBits -= 8;
	}
	if (e === 0) {
		e = 1 - eBias;
	} else if (e === eMax) {
		return m ? Number.NaN : (s ? -1 : 1) * Number.POSITIVE_INFINITY;
	} else {
		m = m + Math.pow(2, mLen);
		e = e - eBias;
	}
	return (s ? -1 : 1) * m * Math.pow(2, e - mLen);
}
function write(buffer, value, offset, isLE, mLen, nBytes) {
	let e, m, c;
	let eLen = nBytes * 8 - mLen - 1;
	const eMax = (1 << eLen) - 1;
	const eBias = eMax >> 1;
	const rt = mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0;
	let i = isLE ? 0 : nBytes - 1;
	const d = isLE ? 1 : -1;
	const s = value < 0 || value === 0 && 1 / value < 0 ? 1 : 0;
	value = Math.abs(value);
	if (Number.isNaN(value) || value === Number.POSITIVE_INFINITY) {
		m = Number.isNaN(value) ? 1 : 0;
		e = eMax;
	} else {
		e = Math.floor(Math.log2(value));
		if (value * (c = Math.pow(2, -e)) < 1) {
			e--;
			c *= 2;
		}
		value += e + eBias >= 1 ? rt / c : rt * Math.pow(2, 1 - eBias);
		if (value * c >= 2) {
			e++;
			c /= 2;
		}
		if (e + eBias >= eMax) {
			m = 0;
			e = eMax;
		} else if (e + eBias >= 1) {
			m = (value * c - 1) * Math.pow(2, mLen);
			e = e + eBias;
		} else {
			m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen);
			e = 0;
		}
	}
	while (mLen >= 8) {
		buffer[offset + i] = m & 255;
		i += d;
		m /= 256;
		mLen -= 8;
	}
	e = e << mLen | m;
	eLen += mLen;
	while (eLen > 0) {
		buffer[offset + i] = e & 255;
		i += d;
		e /= 256;
		eLen -= 8;
	}
	buffer[offset + i - d] |= s * 128;
}

// @ts-nocheck
// Source: https://github.com/feross/buffer/blob/795bbb5bda1b39f1370ebd784bea6107b087e3a7/index.js
/*!
* The buffer module from node.js, for the browser.
*
* @author   Feross Aboukhadijeh <https://feross.org>
* @license  MIT
*/
const customInspectSymbol = typeof Symbol === "function" && typeof Symbol["for"] === "function" ? Symbol["for"]("nodejs.util.inspect.custom") : null;
const INSPECT_MAX_BYTES = 50;
const K_MAX_LENGTH = 2147483647;
/**
* If `Buffer.TYPED_ARRAY_SUPPORT`:
*   === true    Use Uint8Array implementation (fastest)
*   === false   Print warning and recommend using `buffer` v4.x which has an Object
*               implementation (most compatible, even IE6)
*
* Browsers that support typed arrays are IE 10+, Firefox 4+, Chrome 7+, Safari 5.1+,
* Opera 11.6+, iOS 4.2+.
*
* We report that the browser does not support typed arrays if the are not subclassable
* using __proto__. Firefox 4-29 lacks support for adding new properties to `Uint8Array`
* (See: https://bugzilla.mozilla.org/show_bug.cgi?id=695438). IE 10 lacks support
* for __proto__ and has a buggy typed array implementation.
*/
Buffer$1.TYPED_ARRAY_SUPPORT = typedArraySupport();
if (!Buffer$1.TYPED_ARRAY_SUPPORT && typeof console !== "undefined" && typeof console.error === "function") {
	console.error("This environment lacks typed array (Uint8Array) support which is required by " + "`buffer` v5.x. Use `buffer` v4.x if you require old browser support.");
}
function typedArraySupport() {
	// Can typed array instances can be augmented?
	try {
		const arr = new Uint8Array(1);
		const proto = { foo: function() {
			return 42;
		} };
		Object.setPrototypeOf(proto, Uint8Array.prototype);
		Object.setPrototypeOf(arr, proto);
		return arr.foo() === 42;
	} catch {
		return false;
	}
}
Object.defineProperty(Buffer$1.prototype, "parent", {
	enumerable: true,
	get: function() {
		if (!Buffer$1.isBuffer(this)) {
			return;
		}
		return this.buffer;
	}
});
Object.defineProperty(Buffer$1.prototype, "offset", {
	enumerable: true,
	get: function() {
		if (!Buffer$1.isBuffer(this)) {
			return;
		}
		return this.byteOffset;
	}
});
function createBuffer(length) {
	if (length > K_MAX_LENGTH) {
		throw new RangeError("The value \"" + length + "\" is invalid for option \"size\"");
	}
	// Return an augmented `Uint8Array` instance
	const buf = new Uint8Array(length);
	Object.setPrototypeOf(buf, Buffer$1.prototype);
	return buf;
}
/**
* The Buffer constructor returns instances of `Uint8Array` that have their
* prototype changed to `Buffer.prototype`. Furthermore, `Buffer` is a subclass of
* `Uint8Array`, so the returned instances will have all the node `Buffer` methods
* and the `Uint8Array` methods. Square bracket notation works as expected -- it
* returns a single octet.
*
* The `Uint8Array` prototype remains unmodified.
*/
function Buffer$1(arg, encodingOrOffset, length) {
	// Common case.
	if (typeof arg === "number") {
		if (typeof encodingOrOffset === "string") {
			throw new TypeError("The \"string\" argument must be of type string. Received type number");
		}
		return allocUnsafe(arg);
	}
	return from(arg, encodingOrOffset, length);
}
Buffer$1.poolSize = 8192;
function from(value, encodingOrOffset, length) {
	if (typeof value === "string") {
		return fromString(value, encodingOrOffset);
	}
	if (ArrayBuffer.isView(value)) {
		return fromArrayView(value);
	}
	if (value == null) {
		throw new TypeError("The first argument must be one of type string, Buffer, ArrayBuffer, Array, " + "or Array-like Object. Received type " + typeof value);
	}
	if (isInstance(value, ArrayBuffer) || value && isInstance(value.buffer, ArrayBuffer)) {
		return fromArrayBuffer(value, encodingOrOffset, length);
	}
	if (typeof SharedArrayBuffer !== "undefined" && (isInstance(value, SharedArrayBuffer) || value && isInstance(value.buffer, SharedArrayBuffer))) {
		return fromArrayBuffer(value, encodingOrOffset, length);
	}
	if (typeof value === "number") {
		throw new TypeError("The \"value\" argument must not be of type number. Received type number");
	}
	const valueOf = value.valueOf && value.valueOf();
	if (valueOf != null && valueOf !== value) {
		return Buffer$1.from(valueOf, encodingOrOffset, length);
	}
	const b = fromObject(value);
	if (b) {
		return b;
	}
	if (typeof Symbol !== "undefined" && Symbol.toPrimitive != null && typeof value[Symbol.toPrimitive] === "function") {
		return Buffer$1.from(value[Symbol.toPrimitive]("string"), encodingOrOffset, length);
	}
	throw new TypeError("The first argument must be one of type string, Buffer, ArrayBuffer, Array, " + "or Array-like Object. Received type " + typeof value);
}
/**
* Functionally equivalent to Buffer(arg, encoding) but throws a TypeError
* if value is a number.
* Buffer.from(str[, encoding])
* Buffer.from(array)
* Buffer.from(buffer)
* Buffer.from(arrayBuffer[, byteOffset[, length]])
**/
Buffer$1.from = function(value, encodingOrOffset, length) {
	return from(value, encodingOrOffset, length);
};
// Note: Change prototype *after* Buffer.from is defined to workaround Chrome bug:
// https://github.com/feross/buffer/pull/148
Object.setPrototypeOf(Buffer$1.prototype, Uint8Array.prototype);
Object.setPrototypeOf(Buffer$1, Uint8Array);
function assertSize(size) {
	if (typeof size !== "number") {
		throw new TypeError("\"size\" argument must be of type number");
	} else if (size < 0) {
		throw new RangeError("The value \"" + size + "\" is invalid for option \"size\"");
	}
}
function alloc(size, fill, encoding) {
	assertSize(size);
	if (size <= 0) {
		return createBuffer(size);
	}
	if (fill !== undefined) {
		// Only pay attention to encoding if it's a string. This
		// prevents accidentally sending in a number that would
		// be interpreted as a start offset.
		return typeof encoding === "string" ? createBuffer(size).fill(fill, encoding) : createBuffer(size).fill(fill);
	}
	return createBuffer(size);
}
/**
* Creates a new filled Buffer instance.
* alloc(size[, fill[, encoding]])
**/
Buffer$1.alloc = function(size, fill, encoding) {
	return alloc(size, fill, encoding);
};
function allocUnsafe(size) {
	assertSize(size);
	return createBuffer(size < 0 ? 0 : checked(size) | 0);
}
/**
* Equivalent to Buffer(num), by default creates a non-zero-filled Buffer instance.
* */
Buffer$1.allocUnsafe = function(size) {
	return allocUnsafe(size);
};
/**
* Equivalent to SlowBuffer(num), by default creates a non-zero-filled Buffer instance.
*/
Buffer$1.allocUnsafeSlow = function(size) {
	return allocUnsafe(size);
};
function fromString(string, encoding) {
	if (typeof encoding !== "string" || encoding === "") {
		encoding = "utf8";
	}
	if (!Buffer$1.isEncoding(encoding)) {
		throw new TypeError("Unknown encoding: " + encoding);
	}
	const length = byteLength(string, encoding) | 0;
	let buf = createBuffer(length);
	const actual = buf.write(string, encoding);
	if (actual !== length) {
		// Writing a hex string, for example, that contains invalid characters will
		// cause everything after the first invalid character to be ignored. (e.g.
		// 'abxxcd' will be treated as 'ab')
		buf = buf.slice(0, actual);
	}
	return buf;
}
function fromArrayLike(array) {
	const length = array.length < 0 ? 0 : checked(array.length) | 0;
	const buf = createBuffer(length);
	for (let i = 0; i < length; i += 1) {
		buf[i] = array[i] & 255;
	}
	return buf;
}
function fromArrayView(arrayView) {
	if (isInstance(arrayView, Uint8Array)) {
		const copy = new Uint8Array(arrayView);
		return fromArrayBuffer(copy.buffer, copy.byteOffset, copy.byteLength);
	}
	return fromArrayLike(arrayView);
}
function fromArrayBuffer(array, byteOffset, length) {
	if (byteOffset < 0 || array.byteLength < byteOffset) {
		throw new RangeError("\"offset\" is outside of buffer bounds");
	}
	if (array.byteLength < byteOffset + (length || 0)) {
		throw new RangeError("\"length\" is outside of buffer bounds");
	}
	let buf;
	if (byteOffset === undefined && length === undefined) {
		buf = new Uint8Array(array);
	} else if (length === undefined) {
		buf = new Uint8Array(array, byteOffset);
	} else {
		buf = new Uint8Array(array, byteOffset, length);
	}
	// Return an augmented `Uint8Array` instance
	Object.setPrototypeOf(buf, Buffer$1.prototype);
	return buf;
}
function fromObject(obj) {
	if (Buffer$1.isBuffer(obj)) {
		const len = checked(obj.length) | 0;
		const buf = createBuffer(len);
		if (buf.length === 0) {
			return buf;
		}
		obj.copy(buf, 0, 0, len);
		return buf;
	}
	if (obj.length !== undefined) {
		if (typeof obj.length !== "number" || numberIsNaN(obj.length)) {
			return createBuffer(0);
		}
		return fromArrayLike(obj);
	}
	if (obj.type === "Buffer" && Array.isArray(obj.data)) {
		return fromArrayLike(obj.data);
	}
}
function checked(length) {
	// Note: cannot use `length < K_MAX_LENGTH` here because that fails when
	// length is NaN (which is otherwise coerced to zero.)
	if (length >= K_MAX_LENGTH) {
		throw new RangeError("Attempt to allocate Buffer larger than maximum " + "size: 0x" + K_MAX_LENGTH.toString(16) + " bytes");
	}
	return length | 0;
}
Buffer$1.isBuffer = function isBuffer(b) {
	return b != null && b._isBuffer === true && b !== Buffer$1.prototype;
};
Buffer$1.compare = function compare(a, b) {
	if (isInstance(a, Uint8Array)) {
		a = Buffer$1.from(a, a.offset, a.byteLength);
	}
	if (isInstance(b, Uint8Array)) {
		b = Buffer$1.from(b, b.offset, b.byteLength);
	}
	if (!Buffer$1.isBuffer(a) || !Buffer$1.isBuffer(b)) {
		throw new TypeError("The \"buf1\", \"buf2\" arguments must be one of type Buffer or Uint8Array");
	}
	if (a === b) {
		return 0;
	}
	let x = a.length;
	let y = b.length;
	for (let i = 0, len = Math.min(x, y); i < len; ++i) {
		if (a[i] !== b[i]) {
			x = a[i];
			y = b[i];
			break;
		}
	}
	if (x < y) {
		return -1;
	}
	if (y < x) {
		return 1;
	}
	return 0;
};
Buffer$1.isEncoding = function isEncoding(encoding) {
	switch (String(encoding).toLowerCase()) {
		case "hex":
		case "utf8":
		case "utf-8":
		case "ascii":
		case "latin1":
		case "binary":
		case "base64":
		case "ucs2":
		case "ucs-2":
		case "utf16le":
		case "utf-16le": return true;
		default: return false;
	}
};
Buffer$1.concat = function concat(list, length) {
	if (!Array.isArray(list)) {
		throw new TypeError("\"list\" argument must be an Array of Buffers");
	}
	if (list.length === 0) {
		return Buffer$1.alloc(0);
	}
	let i;
	if (length === undefined) {
		length = 0;
		for (i = 0; i < list.length; ++i) {
			length += list[i].length;
		}
	}
	const buffer = Buffer$1.allocUnsafe(length);
	let pos = 0;
	for (i = 0; i < list.length; ++i) {
		let buf = list[i];
		if (isInstance(buf, Uint8Array)) {
			if (pos + buf.length > buffer.length) {
				if (!Buffer$1.isBuffer(buf)) {
					buf = Buffer$1.from(buf.buffer, buf.byteOffset, buf.byteLength);
				}
				buf.copy(buffer, pos);
			} else {
				Uint8Array.prototype.set.call(buffer, buf, pos);
			}
		} else if (Buffer$1.isBuffer(buf)) {
			buf.copy(buffer, pos);
		} else {
			throw new TypeError("\"list\" argument must be an Array of Buffers");
		}
		pos += buf.length;
	}
	return buffer;
};
function byteLength(string, encoding) {
	if (Buffer$1.isBuffer(string)) {
		return string.length;
	}
	if (ArrayBuffer.isView(string) || isInstance(string, ArrayBuffer)) {
		return string.byteLength;
	}
	if (typeof string !== "string") {
		throw new TypeError("The \"string\" argument must be one of type string, Buffer, or ArrayBuffer. " + "Received type " + typeof string);
	}
	const len = string.length;
	const mustMatch = arguments.length > 2 && arguments[2] === true;
	if (!mustMatch && len === 0) {
		return 0;
	}
	// Use a for loop to avoid recursion
	let loweredCase = false;
	for (;;) {
		switch (encoding) {
			case "ascii":
			case "latin1":
			case "binary": return len;
			case "utf8":
			case "utf-8": return utf8ToBytes(string).length;
			case "ucs2":
			case "ucs-2":
			case "utf16le":
			case "utf-16le": return len * 2;
			case "hex": return len >>> 1;
			case "base64": return base64ToBytes(string).length;
			default:
				if (loweredCase) {
					return mustMatch ? -1 : utf8ToBytes(string).length;
				}
				encoding = ("" + encoding).toLowerCase();
				loweredCase = true;
		}
	}
}
Buffer$1.byteLength = byteLength;
function slowToString(encoding, start, end) {
	let loweredCase = false;
	// No need to verify that "this.length <= MAX_UINT32" since it's a read-only
	// property of a typed array.
	// This behaves neither like String nor Uint8Array in that we set start/end
	// to their upper/lower bounds if the value passed is out of range.
	// undefined is handled specially as per ECMA-262 6th Edition,
	// Section 13.3.3.7 Runtime Semantics: KeyedBindingInitialization.
	if (start === undefined || start < 0) {
		start = 0;
	}
	// Return early if start > this.length. Done here to prevent potential uint32
	// coercion fail below.
	if (start > this.length) {
		return "";
	}
	if (end === undefined || end > this.length) {
		end = this.length;
	}
	if (end <= 0) {
		return "";
	}
	// Force coercion to uint32. This will also coerce falsey/NaN values to 0.
	end >>>= 0;
	start >>>= 0;
	if (end <= start) {
		return "";
	}
	if (!encoding) {
		encoding = "utf8";
	}
	while (true) {
		switch (encoding) {
			case "hex": return hexSlice(this, start, end);
			case "utf8":
			case "utf-8": return utf8Slice(this, start, end);
			case "ascii": return asciiSlice(this, start, end);
			case "latin1":
			case "binary": return latin1Slice(this, start, end);
			case "base64": return base64Slice(this, start, end);
			case "ucs2":
			case "ucs-2":
			case "utf16le":
			case "utf-16le": return utf16leSlice(this, start, end);
			default:
				if (loweredCase) {
					throw new TypeError("Unknown encoding: " + encoding);
				}
				encoding = (encoding + "").toLowerCase();
				loweredCase = true;
		}
	}
}
// This property is used by `Buffer.isBuffer` (and the `is-buffer` npm package)
// to detect a Buffer instance. It's not possible to use `instanceof Buffer`
// reliably in a browserify context because there could be multiple different
// copies of the 'buffer' package in use. This method works even for Buffer
// instances that were created from another copy of the `buffer` package.
// See: https://github.com/feross/buffer/issues/154
Buffer$1.prototype._isBuffer = true;
function swap(b, n, m) {
	const i = b[n];
	b[n] = b[m];
	b[m] = i;
}
Buffer$1.prototype.swap16 = function swap16() {
	const len = this.length;
	if (len % 2 !== 0) {
		throw new RangeError("Buffer size must be a multiple of 16-bits");
	}
	for (let i = 0; i < len; i += 2) {
		swap(this, i, i + 1);
	}
	return this;
};
Buffer$1.prototype.swap32 = function swap32() {
	const len = this.length;
	if (len % 4 !== 0) {
		throw new RangeError("Buffer size must be a multiple of 32-bits");
	}
	for (let i = 0; i < len; i += 4) {
		swap(this, i, i + 3);
		swap(this, i + 1, i + 2);
	}
	return this;
};
Buffer$1.prototype.swap64 = function swap64() {
	const len = this.length;
	if (len % 8 !== 0) {
		throw new RangeError("Buffer size must be a multiple of 64-bits");
	}
	for (let i = 0; i < len; i += 8) {
		swap(this, i, i + 7);
		swap(this, i + 1, i + 6);
		swap(this, i + 2, i + 5);
		swap(this, i + 3, i + 4);
	}
	return this;
};
Buffer$1.prototype.toString = function toString() {
	const length = this.length;
	if (length === 0) {
		return "";
	}
	if (arguments.length === 0) {
		return utf8Slice(this, 0, length);
	}
	return Reflect.apply(slowToString, this, arguments);
};
Buffer$1.prototype.toLocaleString = Buffer$1.prototype.toString;
Buffer$1.prototype.equals = function equals(b) {
	if (!Buffer$1.isBuffer(b)) {
		throw new TypeError("Argument must be a Buffer");
	}
	if (this === b) {
		return true;
	}
	return Buffer$1.compare(this, b) === 0;
};
Buffer$1.prototype.inspect = function inspect() {
	let str = "";
	const max = INSPECT_MAX_BYTES;
	str = this.toString("hex", 0, max).replace(/(.{2})/g, "$1 ").trim();
	if (this.length > max) {
		str += " ... ";
	}
	return "<Buffer " + str + ">";
};
if (customInspectSymbol) {
	Buffer$1.prototype[customInspectSymbol] = Buffer$1.prototype.inspect;
}
Buffer$1.prototype.compare = function compare(target, start, end, thisStart, thisEnd) {
	if (isInstance(target, Uint8Array)) {
		target = Buffer$1.from(target, target.offset, target.byteLength);
	}
	if (!Buffer$1.isBuffer(target)) {
		throw new TypeError("The \"target\" argument must be one of type Buffer or Uint8Array. " + "Received type " + typeof target);
	}
	if (start === undefined) {
		start = 0;
	}
	if (end === undefined) {
		end = target ? target.length : 0;
	}
	if (thisStart === undefined) {
		thisStart = 0;
	}
	if (thisEnd === undefined) {
		thisEnd = this.length;
	}
	if (start < 0 || end > target.length || thisStart < 0 || thisEnd > this.length) {
		throw new RangeError("out of range index");
	}
	if (thisStart >= thisEnd && start >= end) {
		return 0;
	}
	if (thisStart >= thisEnd) {
		return -1;
	}
	if (start >= end) {
		return 1;
	}
	start >>>= 0;
	end >>>= 0;
	thisStart >>>= 0;
	thisEnd >>>= 0;
	if (this === target) {
		return 0;
	}
	let x = thisEnd - thisStart;
	let y = end - start;
	const len = Math.min(x, y);
	const thisCopy = this.slice(thisStart, thisEnd);
	const targetCopy = target.slice(start, end);
	for (let i = 0; i < len; ++i) {
		if (thisCopy[i] !== targetCopy[i]) {
			x = thisCopy[i];
			y = targetCopy[i];
			break;
		}
	}
	if (x < y) {
		return -1;
	}
	if (y < x) {
		return 1;
	}
	return 0;
};
// Finds either the first index of `val` in `buffer` at offset >= `byteOffset`,
// OR the last index of `val` in `buffer` at offset <= `byteOffset`.
//
// Arguments:
// - buffer - a Buffer to search
// - val - a string, Buffer, or number
// - byteOffset - an index into `buffer`; will be clamped to an int32
// - encoding - an optional encoding, relevant is val is a string
// - dir - true for indexOf, false for lastIndexOf
function bidirectionalIndexOf(buffer, val, byteOffset, encoding, dir) {
	// Empty buffer means no match
	if (buffer.length === 0) {
		return -1;
	}
	// Normalize byteOffset
	if (typeof byteOffset === "string") {
		encoding = byteOffset;
		byteOffset = 0;
	} else if (byteOffset > 2147483647) {
		byteOffset = 2147483647;
	} else if (byteOffset < -2147483648) {
		byteOffset = -2147483648;
	}
	byteOffset = +byteOffset;
	if (numberIsNaN(byteOffset)) {
		// byteOffset: it it's undefined, null, NaN, "foo", etc, search whole buffer
		byteOffset = dir ? 0 : buffer.length - 1;
	}
	// Normalize byteOffset: negative offsets start from the end of the buffer
	if (byteOffset < 0) {
		byteOffset = buffer.length + byteOffset;
	}
	if (byteOffset >= buffer.length) {
		if (dir) {
			return -1;
		} else {
			byteOffset = buffer.length - 1;
		}
	} else if (byteOffset < 0) {
		if (dir) {
			byteOffset = 0;
		} else {
			return -1;
		}
	}
	// Normalize val
	if (typeof val === "string") {
		val = Buffer$1.from(val, encoding);
	}
	// Finally, search either indexOf (if dir is true) or lastIndexOf
	if (Buffer$1.isBuffer(val)) {
		// Special case: looking for empty string/buffer always fails
		if (val.length === 0) {
			return -1;
		}
		return arrayIndexOf(buffer, val, byteOffset, encoding, dir);
	} else if (typeof val === "number") {
		val = val & 255;
		if (typeof Uint8Array.prototype.indexOf === "function") {
			return dir ? Uint8Array.prototype.indexOf.call(buffer, val, byteOffset) : Uint8Array.prototype.lastIndexOf.call(buffer, val, byteOffset);
		}
		return arrayIndexOf(buffer, [val], byteOffset, encoding, dir);
	}
	throw new TypeError("val must be string, number or Buffer");
}
function arrayIndexOf(arr, val, byteOffset, encoding, dir) {
	let indexSize = 1;
	let arrLength = arr.length;
	let valLength = val.length;
	if (encoding !== undefined) {
		encoding = String(encoding).toLowerCase();
		if (encoding === "ucs2" || encoding === "ucs-2" || encoding === "utf16le" || encoding === "utf-16le") {
			if (arr.length < 2 || val.length < 2) {
				return -1;
			}
			indexSize = 2;
			arrLength /= 2;
			valLength /= 2;
			byteOffset /= 2;
		}
	}
	function read(buf, i) {
		return indexSize === 1 ? buf[i] : buf.readUInt16BE(i * indexSize);
	}
	let i;
	if (dir) {
		let foundIndex = -1;
		for (i = byteOffset; i < arrLength; i++) {
			if (read(arr, i) === read(val, foundIndex === -1 ? 0 : i - foundIndex)) {
				if (foundIndex === -1) {
					foundIndex = i;
				}
				if (i - foundIndex + 1 === valLength) {
					return foundIndex * indexSize;
				}
			} else {
				if (foundIndex !== -1) {
					i -= i - foundIndex;
				}
				foundIndex = -1;
			}
		}
	} else {
		if (byteOffset + valLength > arrLength) {
			byteOffset = arrLength - valLength;
		}
		for (i = byteOffset; i >= 0; i--) {
			let found = true;
			for (let j = 0; j < valLength; j++) {
				if (read(arr, i + j) !== read(val, j)) {
					found = false;
					break;
				}
			}
			if (found) {
				return i;
			}
		}
	}
	return -1;
}
Buffer$1.prototype.includes = function includes(val, byteOffset, encoding) {
	return this.indexOf(val, byteOffset, encoding) !== -1;
};
Buffer$1.prototype.indexOf = function indexOf(val, byteOffset, encoding) {
	return bidirectionalIndexOf(this, val, byteOffset, encoding, true);
};
Buffer$1.prototype.lastIndexOf = function lastIndexOf(val, byteOffset, encoding) {
	return bidirectionalIndexOf(this, val, byteOffset, encoding, false);
};
function hexWrite(buf, string, offset, length) {
	offset = Number(offset) || 0;
	const remaining = buf.length - offset;
	if (length) {
		length = Number(length);
		if (length > remaining) {
			length = remaining;
		}
	} else {
		length = remaining;
	}
	const strLen = string.length;
	if (length > strLen / 2) {
		length = strLen / 2;
	}
	let i;
	for (i = 0; i < length; ++i) {
		const parsed = Number.parseInt(string.slice(i * 2, i * 2 + 2), 16);
		if (numberIsNaN(parsed)) {
			return i;
		}
		buf[offset + i] = parsed;
	}
	return i;
}
function utf8Write(buf, string, offset, length) {
	return blitBuffer(utf8ToBytes(string, buf.length - offset), buf, offset, length);
}
function asciiWrite(buf, string, offset, length) {
	return blitBuffer(asciiToBytes(string), buf, offset, length);
}
function base64Write(buf, string, offset, length) {
	return blitBuffer(base64ToBytes(string), buf, offset, length);
}
function ucs2Write(buf, string, offset, length) {
	return blitBuffer(utf16leToBytes(string, buf.length - offset), buf, offset, length);
}
Buffer$1.prototype.write = function write(string, offset, length, encoding) {
	// Buffer#write(string)
	if (offset === undefined) {
		encoding = "utf8";
		length = this.length;
		offset = 0;
	} else if (length === undefined && typeof offset === "string") {
		encoding = offset;
		length = this.length;
		offset = 0;
	} else if (Number.isFinite(offset)) {
		offset = offset >>> 0;
		if (Number.isFinite(length)) {
			length = length >>> 0;
			if (encoding === undefined) {
				encoding = "utf8";
			}
		} else {
			encoding = length;
			length = undefined;
		}
	} else {
		throw new TypeError("Buffer.write(string, encoding, offset[, length]) is no longer supported");
	}
	const remaining = this.length - offset;
	if (length === undefined || length > remaining) {
		length = remaining;
	}
	if (string.length > 0 && (length < 0 || offset < 0) || offset > this.length) {
		throw new RangeError("Attempt to write outside buffer bounds");
	}
	if (!encoding) {
		encoding = "utf8";
	}
	let loweredCase = false;
	for (;;) {
		switch (encoding) {
			case "hex": return hexWrite(this, string, offset, length);
			case "utf8":
			case "utf-8": return utf8Write(this, string, offset, length);
			case "ascii":
			case "latin1":
			case "binary": return asciiWrite(this, string, offset, length);
			case "base64":
 // Warning: maxLength not taken into account in base64Write
			return base64Write(this, string, offset, length);
			case "ucs2":
			case "ucs-2":
			case "utf16le":
			case "utf-16le": return ucs2Write(this, string, offset, length);
			default:
				if (loweredCase) {
					throw new TypeError("Unknown encoding: " + encoding);
				}
				encoding = ("" + encoding).toLowerCase();
				loweredCase = true;
		}
	}
};
Buffer$1.prototype.toJSON = function toJSON() {
	return {
		type: "Buffer",
		data: Array.prototype.slice.call(this._arr || this, 0)
	};
};
function base64Slice(buf, start, end) {
	return start === 0 && end === buf.length ? fromByteArray(buf) : fromByteArray(buf.slice(start, end));
}
function utf8Slice(buf, start, end) {
	end = Math.min(buf.length, end);
	const res = [];
	let i = start;
	while (i < end) {
		const firstByte = buf[i];
		let codePoint = null;
		let bytesPerSequence = firstByte > 239 ? 4 : firstByte > 223 ? 3 : firstByte > 191 ? 2 : 1;
		if (i + bytesPerSequence <= end) {
			let secondByte, thirdByte, fourthByte, tempCodePoint;
			switch (bytesPerSequence) {
				case 1:
					if (firstByte < 128) {
						codePoint = firstByte;
					}
					break;
				case 2:
					secondByte = buf[i + 1];
					if ((secondByte & 192) === 128) {
						tempCodePoint = (firstByte & 31) << 6 | secondByte & 63;
						if (tempCodePoint > 127) {
							codePoint = tempCodePoint;
						}
					}
					break;
				case 3:
					secondByte = buf[i + 1];
					thirdByte = buf[i + 2];
					if ((secondByte & 192) === 128 && (thirdByte & 192) === 128) {
						tempCodePoint = (firstByte & 15) << 12 | (secondByte & 63) << 6 | thirdByte & 63;
						if (tempCodePoint > 2047 && (tempCodePoint < 55296 || tempCodePoint > 57343)) {
							codePoint = tempCodePoint;
						}
					}
					break;
				case 4:
					secondByte = buf[i + 1];
					thirdByte = buf[i + 2];
					fourthByte = buf[i + 3];
					if ((secondByte & 192) === 128 && (thirdByte & 192) === 128 && (fourthByte & 192) === 128) {
						tempCodePoint = (firstByte & 15) << 18 | (secondByte & 63) << 12 | (thirdByte & 63) << 6 | fourthByte & 63;
						if (tempCodePoint > 65535 && tempCodePoint < 1114112) {
							codePoint = tempCodePoint;
						}
					}
			}
		}
		if (codePoint === null) {
			// we did not generate a valid codePoint so insert a
			// replacement char (U+FFFD) and advance only 1 byte
			codePoint = 65533;
			bytesPerSequence = 1;
		} else if (codePoint > 65535) {
			// encode to utf16 (surrogate pair dance)
			codePoint -= 65536;
			res.push(codePoint >>> 10 & 1023 | 55296);
			codePoint = 56320 | codePoint & 1023;
		}
		res.push(codePoint);
		i += bytesPerSequence;
	}
	return decodeCodePointsArray(res);
}
// Based on http://stackoverflow.com/a/22747272/680742, the browser with
// the lowest limit is Chrome, with 0x10000 args.
// We go 1 magnitude less, for safety
const MAX_ARGUMENTS_LENGTH = 4096;
function decodeCodePointsArray(codePoints) {
	const len = codePoints.length;
	if (len <= MAX_ARGUMENTS_LENGTH) {
		return String.fromCharCode.apply(String, codePoints);
	}
	// Decode in chunks to avoid "call stack size exceeded".
	let res = "";
	let i = 0;
	while (i < len) {
		res += String.fromCharCode.apply(String, codePoints.slice(i, i += MAX_ARGUMENTS_LENGTH));
	}
	return res;
}
function asciiSlice(buf, start, end) {
	let ret = "";
	end = Math.min(buf.length, end);
	for (let i = start; i < end; ++i) {
		ret += String.fromCharCode(buf[i] & 127);
	}
	return ret;
}
function latin1Slice(buf, start, end) {
	let ret = "";
	end = Math.min(buf.length, end);
	for (let i = start; i < end; ++i) {
		ret += String.fromCharCode(buf[i]);
	}
	return ret;
}
function hexSlice(buf, start, end) {
	const len = buf.length;
	if (!start || start < 0) {
		start = 0;
	}
	if (!end || end < 0 || end > len) {
		end = len;
	}
	let out = "";
	for (let i = start; i < end; ++i) {
		out += hexSliceLookupTable[buf[i]];
	}
	return out;
}
function utf16leSlice(buf, start, end) {
	const bytes = buf.slice(start, end);
	let res = "";
	// If bytes.length is odd, the last 8 bits must be ignored (same as node.js)
	for (let i = 0; i < bytes.length - 1; i += 2) {
		res += String.fromCharCode(bytes[i] + bytes[i + 1] * 256);
	}
	return res;
}
Buffer$1.prototype.slice = function slice(start, end) {
	const len = this.length;
	start = Math.trunc(start);
	end = end === undefined ? len : Math.trunc(end);
	if (start < 0) {
		start += len;
		if (start < 0) {
			start = 0;
		}
	} else if (start > len) {
		start = len;
	}
	if (end < 0) {
		end += len;
		if (end < 0) {
			end = 0;
		}
	} else if (end > len) {
		end = len;
	}
	if (end < start) {
		end = start;
	}
	const newBuf = this.subarray(start, end);
	// Return an augmented `Uint8Array` instance
	Object.setPrototypeOf(newBuf, Buffer$1.prototype);
	return newBuf;
};
/*
* Need to make sure that buffer isn't trying to write out of bounds.
*/
function checkOffset(offset, ext, length) {
	if (offset % 1 !== 0 || offset < 0) {
		throw new RangeError("offset is not uint");
	}
	if (offset + ext > length) {
		throw new RangeError("Trying to access beyond buffer length");
	}
}
Buffer$1.prototype.readUintLE = Buffer$1.prototype.readUIntLE = function readUIntLE(offset, byteLength, noAssert) {
	offset = offset >>> 0;
	byteLength = byteLength >>> 0;
	if (!noAssert) {
		checkOffset(offset, byteLength, this.length);
	}
	let val = this[offset];
	let mul = 1;
	let i = 0;
	while (++i < byteLength && (mul *= 256)) {
		val += this[offset + i] * mul;
	}
	return val;
};
Buffer$1.prototype.readUintBE = Buffer$1.prototype.readUIntBE = function readUIntBE(offset, byteLength, noAssert) {
	offset = offset >>> 0;
	byteLength = byteLength >>> 0;
	if (!noAssert) {
		checkOffset(offset, byteLength, this.length);
	}
	let val = this[offset + --byteLength];
	let mul = 1;
	while (byteLength > 0 && (mul *= 256)) {
		val += this[offset + --byteLength] * mul;
	}
	return val;
};
Buffer$1.prototype.readUint8 = Buffer$1.prototype.readUInt8 = function readUInt8(offset, noAssert) {
	offset = offset >>> 0;
	if (!noAssert) {
		checkOffset(offset, 1, this.length);
	}
	return this[offset];
};
Buffer$1.prototype.readUint16LE = Buffer$1.prototype.readUInt16LE = function readUInt16LE(offset, noAssert) {
	offset = offset >>> 0;
	if (!noAssert) {
		checkOffset(offset, 2, this.length);
	}
	return this[offset] | this[offset + 1] << 8;
};
Buffer$1.prototype.readUint16BE = Buffer$1.prototype.readUInt16BE = function readUInt16BE(offset, noAssert) {
	offset = offset >>> 0;
	if (!noAssert) {
		checkOffset(offset, 2, this.length);
	}
	return this[offset] << 8 | this[offset + 1];
};
Buffer$1.prototype.readUint32LE = Buffer$1.prototype.readUInt32LE = function readUInt32LE(offset, noAssert) {
	offset = offset >>> 0;
	if (!noAssert) {
		checkOffset(offset, 4, this.length);
	}
	return (this[offset] | this[offset + 1] << 8 | this[offset + 2] << 16) + this[offset + 3] * 16777216;
};
Buffer$1.prototype.readUint32BE = Buffer$1.prototype.readUInt32BE = function readUInt32BE(offset, noAssert) {
	offset = offset >>> 0;
	if (!noAssert) {
		checkOffset(offset, 4, this.length);
	}
	return this[offset] * 16777216 + (this[offset + 1] << 16 | this[offset + 2] << 8 | this[offset + 3]);
};
Buffer$1.prototype.readBigUInt64LE = defineBigIntMethod(function readBigUInt64LE(offset) {
	offset = offset >>> 0;
	validateNumber(offset, "offset");
	const first = this[offset];
	const last = this[offset + 7];
	if (first === undefined || last === undefined) {
		boundsError(offset, this.length - 8);
	}
	const lo = first + this[++offset] * 2 ** 8 + this[++offset] * 2 ** 16 + this[++offset] * 2 ** 24;
	const hi = this[++offset] + this[++offset] * 2 ** 8 + this[++offset] * 2 ** 16 + last * 2 ** 24;
	return BigInt(lo) + (BigInt(hi) << BigInt(32));
});
Buffer$1.prototype.readBigUInt64BE = defineBigIntMethod(function readBigUInt64BE(offset) {
	offset = offset >>> 0;
	validateNumber(offset, "offset");
	const first = this[offset];
	const last = this[offset + 7];
	if (first === undefined || last === undefined) {
		boundsError(offset, this.length - 8);
	}
	const hi = first * 2 ** 24 + this[++offset] * 2 ** 16 + this[++offset] * 2 ** 8 + this[++offset];
	const lo = this[++offset] * 2 ** 24 + this[++offset] * 2 ** 16 + this[++offset] * 2 ** 8 + last;
	return (BigInt(hi) << BigInt(32)) + BigInt(lo);
});
Buffer$1.prototype.readIntLE = function readIntLE(offset, byteLength, noAssert) {
	offset = offset >>> 0;
	byteLength = byteLength >>> 0;
	if (!noAssert) {
		checkOffset(offset, byteLength, this.length);
	}
	let val = this[offset];
	let mul = 1;
	let i = 0;
	while (++i < byteLength && (mul *= 256)) {
		val += this[offset + i] * mul;
	}
	mul *= 128;
	if (val >= mul) {
		val -= Math.pow(2, 8 * byteLength);
	}
	return val;
};
Buffer$1.prototype.readIntBE = function readIntBE(offset, byteLength, noAssert) {
	offset = offset >>> 0;
	byteLength = byteLength >>> 0;
	if (!noAssert) {
		checkOffset(offset, byteLength, this.length);
	}
	let i = byteLength;
	let mul = 1;
	let val = this[offset + --i];
	while (i > 0 && (mul *= 256)) {
		val += this[offset + --i] * mul;
	}
	mul *= 128;
	if (val >= mul) {
		val -= Math.pow(2, 8 * byteLength);
	}
	return val;
};
Buffer$1.prototype.readInt8 = function readInt8(offset, noAssert) {
	offset = offset >>> 0;
	if (!noAssert) {
		checkOffset(offset, 1, this.length);
	}
	if (!(this[offset] & 128)) {
		return this[offset];
	}
	return (255 - this[offset] + 1) * -1;
};
Buffer$1.prototype.readInt16LE = function readInt16LE(offset, noAssert) {
	offset = offset >>> 0;
	if (!noAssert) {
		checkOffset(offset, 2, this.length);
	}
	const val = this[offset] | this[offset + 1] << 8;
	return val & 32768 ? val | 4294901760 : val;
};
Buffer$1.prototype.readInt16BE = function readInt16BE(offset, noAssert) {
	offset = offset >>> 0;
	if (!noAssert) {
		checkOffset(offset, 2, this.length);
	}
	const val = this[offset + 1] | this[offset] << 8;
	return val & 32768 ? val | 4294901760 : val;
};
Buffer$1.prototype.readInt32LE = function readInt32LE(offset, noAssert) {
	offset = offset >>> 0;
	if (!noAssert) {
		checkOffset(offset, 4, this.length);
	}
	return this[offset] | this[offset + 1] << 8 | this[offset + 2] << 16 | this[offset + 3] << 24;
};
Buffer$1.prototype.readInt32BE = function readInt32BE(offset, noAssert) {
	offset = offset >>> 0;
	if (!noAssert) {
		checkOffset(offset, 4, this.length);
	}
	return this[offset] << 24 | this[offset + 1] << 16 | this[offset + 2] << 8 | this[offset + 3];
};
Buffer$1.prototype.readBigInt64LE = defineBigIntMethod(function readBigInt64LE(offset) {
	offset = offset >>> 0;
	validateNumber(offset, "offset");
	const first = this[offset];
	const last = this[offset + 7];
	if (first === undefined || last === undefined) {
		boundsError(offset, this.length - 8);
	}
	const val = this[offset + 4] + this[offset + 5] * 2 ** 8 + this[offset + 6] * 2 ** 16 + (last << 24);
	return (BigInt(val) << BigInt(32)) + BigInt(first + this[++offset] * 2 ** 8 + this[++offset] * 2 ** 16 + this[++offset] * 2 ** 24);
});
Buffer$1.prototype.readBigInt64BE = defineBigIntMethod(function readBigInt64BE(offset) {
	offset = offset >>> 0;
	validateNumber(offset, "offset");
	const first = this[offset];
	const last = this[offset + 7];
	if (first === undefined || last === undefined) {
		boundsError(offset, this.length - 8);
	}
	const val = (first << 24) + this[++offset] * 2 ** 16 + this[++offset] * 2 ** 8 + this[++offset];
	return (BigInt(val) << BigInt(32)) + BigInt(this[++offset] * 2 ** 24 + this[++offset] * 2 ** 16 + this[++offset] * 2 ** 8 + last);
});
Buffer$1.prototype.readFloatLE = function readFloatLE(offset, noAssert) {
	offset = offset >>> 0;
	if (!noAssert) {
		checkOffset(offset, 4, this.length);
	}
	return read(this, offset, true, 23, 4);
};
Buffer$1.prototype.readFloatBE = function readFloatBE(offset, noAssert) {
	offset = offset >>> 0;
	if (!noAssert) {
		checkOffset(offset, 4, this.length);
	}
	return read(this, offset, false, 23, 4);
};
Buffer$1.prototype.readDoubleLE = function readDoubleLE(offset, noAssert) {
	offset = offset >>> 0;
	if (!noAssert) {
		checkOffset(offset, 8, this.length);
	}
	return read(this, offset, true, 52, 8);
};
Buffer$1.prototype.readDoubleBE = function readDoubleBE(offset, noAssert) {
	offset = offset >>> 0;
	if (!noAssert) {
		checkOffset(offset, 8, this.length);
	}
	return read(this, offset, false, 52, 8);
};
function checkInt(buf, value, offset, ext, max, min) {
	if (!Buffer$1.isBuffer(buf)) {
		throw new TypeError("\"buffer\" argument must be a Buffer instance");
	}
	if (value > max || value < min) {
		throw new RangeError("\"value\" argument is out of bounds");
	}
	if (offset + ext > buf.length) {
		throw new RangeError("Index out of range");
	}
}
Buffer$1.prototype.writeUintLE = Buffer$1.prototype.writeUIntLE = function writeUIntLE(value, offset, byteLength, noAssert) {
	value = +value;
	offset = offset >>> 0;
	byteLength = byteLength >>> 0;
	if (!noAssert) {
		const maxBytes = Math.pow(2, 8 * byteLength) - 1;
		checkInt(this, value, offset, byteLength, maxBytes, 0);
	}
	let mul = 1;
	let i = 0;
	this[offset] = value & 255;
	while (++i < byteLength && (mul *= 256)) {
		this[offset + i] = value / mul & 255;
	}
	return offset + byteLength;
};
Buffer$1.prototype.writeUintBE = Buffer$1.prototype.writeUIntBE = function writeUIntBE(value, offset, byteLength, noAssert) {
	value = +value;
	offset = offset >>> 0;
	byteLength = byteLength >>> 0;
	if (!noAssert) {
		const maxBytes = Math.pow(2, 8 * byteLength) - 1;
		checkInt(this, value, offset, byteLength, maxBytes, 0);
	}
	let i = byteLength - 1;
	let mul = 1;
	this[offset + i] = value & 255;
	while (--i >= 0 && (mul *= 256)) {
		this[offset + i] = value / mul & 255;
	}
	return offset + byteLength;
};
Buffer$1.prototype.writeUint8 = Buffer$1.prototype.writeUInt8 = function writeUInt8(value, offset, noAssert) {
	value = +value;
	offset = offset >>> 0;
	if (!noAssert) {
		checkInt(this, value, offset, 1, 255, 0);
	}
	this[offset] = value & 255;
	return offset + 1;
};
Buffer$1.prototype.writeUint16LE = Buffer$1.prototype.writeUInt16LE = function writeUInt16LE(value, offset, noAssert) {
	value = +value;
	offset = offset >>> 0;
	if (!noAssert) {
		checkInt(this, value, offset, 2, 65535, 0);
	}
	this[offset] = value & 255;
	this[offset + 1] = value >>> 8;
	return offset + 2;
};
Buffer$1.prototype.writeUint16BE = Buffer$1.prototype.writeUInt16BE = function writeUInt16BE(value, offset, noAssert) {
	value = +value;
	offset = offset >>> 0;
	if (!noAssert) {
		checkInt(this, value, offset, 2, 65535, 0);
	}
	this[offset] = value >>> 8;
	this[offset + 1] = value & 255;
	return offset + 2;
};
Buffer$1.prototype.writeUint32LE = Buffer$1.prototype.writeUInt32LE = function writeUInt32LE(value, offset, noAssert) {
	value = +value;
	offset = offset >>> 0;
	if (!noAssert) {
		checkInt(this, value, offset, 4, 4294967295, 0);
	}
	this[offset + 3] = value >>> 24;
	this[offset + 2] = value >>> 16;
	this[offset + 1] = value >>> 8;
	this[offset] = value & 255;
	return offset + 4;
};
Buffer$1.prototype.writeUint32BE = Buffer$1.prototype.writeUInt32BE = function writeUInt32BE(value, offset, noAssert) {
	value = +value;
	offset = offset >>> 0;
	if (!noAssert) {
		checkInt(this, value, offset, 4, 4294967295, 0);
	}
	this[offset] = value >>> 24;
	this[offset + 1] = value >>> 16;
	this[offset + 2] = value >>> 8;
	this[offset + 3] = value & 255;
	return offset + 4;
};
function wrtBigUInt64LE(buf, value, offset, min, max) {
	checkIntBI(value, min, max, buf, offset, 7);
	let lo = Number(value & BigInt(4294967295));
	buf[offset++] = lo;
	lo = lo >> 8;
	buf[offset++] = lo;
	lo = lo >> 8;
	buf[offset++] = lo;
	lo = lo >> 8;
	buf[offset++] = lo;
	let hi = Number(value >> BigInt(32) & BigInt(4294967295));
	buf[offset++] = hi;
	hi = hi >> 8;
	buf[offset++] = hi;
	hi = hi >> 8;
	buf[offset++] = hi;
	hi = hi >> 8;
	buf[offset++] = hi;
	return offset;
}
function wrtBigUInt64BE(buf, value, offset, min, max) {
	checkIntBI(value, min, max, buf, offset, 7);
	let lo = Number(value & BigInt(4294967295));
	buf[offset + 7] = lo;
	lo = lo >> 8;
	buf[offset + 6] = lo;
	lo = lo >> 8;
	buf[offset + 5] = lo;
	lo = lo >> 8;
	buf[offset + 4] = lo;
	let hi = Number(value >> BigInt(32) & BigInt(4294967295));
	buf[offset + 3] = hi;
	hi = hi >> 8;
	buf[offset + 2] = hi;
	hi = hi >> 8;
	buf[offset + 1] = hi;
	hi = hi >> 8;
	buf[offset] = hi;
	return offset + 8;
}
Buffer$1.prototype.writeBigUInt64LE = defineBigIntMethod(function writeBigUInt64LE(value, offset = 0) {
	return wrtBigUInt64LE(this, value, offset, BigInt(0), BigInt("0xffffffffffffffff"));
});
Buffer$1.prototype.writeBigUInt64BE = defineBigIntMethod(function writeBigUInt64BE(value, offset = 0) {
	return wrtBigUInt64BE(this, value, offset, BigInt(0), BigInt("0xffffffffffffffff"));
});
Buffer$1.prototype.writeIntLE = function writeIntLE(value, offset, byteLength, noAssert) {
	value = +value;
	offset = offset >>> 0;
	if (!noAssert) {
		const limit = Math.pow(2, 8 * byteLength - 1);
		checkInt(this, value, offset, byteLength, limit - 1, -limit);
	}
	let i = 0;
	let mul = 1;
	let sub = 0;
	this[offset] = value & 255;
	while (++i < byteLength && (mul *= 256)) {
		if (value < 0 && sub === 0 && this[offset + i - 1] !== 0) {
			sub = 1;
		}
		this[offset + i] = Math.trunc(value / mul) - sub & 255;
	}
	return offset + byteLength;
};
Buffer$1.prototype.writeIntBE = function writeIntBE(value, offset, byteLength, noAssert) {
	value = +value;
	offset = offset >>> 0;
	if (!noAssert) {
		const limit = Math.pow(2, 8 * byteLength - 1);
		checkInt(this, value, offset, byteLength, limit - 1, -limit);
	}
	let i = byteLength - 1;
	let mul = 1;
	let sub = 0;
	this[offset + i] = value & 255;
	while (--i >= 0 && (mul *= 256)) {
		if (value < 0 && sub === 0 && this[offset + i + 1] !== 0) {
			sub = 1;
		}
		this[offset + i] = Math.trunc(value / mul) - sub & 255;
	}
	return offset + byteLength;
};
Buffer$1.prototype.writeInt8 = function writeInt8(value, offset, noAssert) {
	value = +value;
	offset = offset >>> 0;
	if (!noAssert) {
		checkInt(this, value, offset, 1, 127, -128);
	}
	if (value < 0) {
		value = 255 + value + 1;
	}
	this[offset] = value & 255;
	return offset + 1;
};
Buffer$1.prototype.writeInt16LE = function writeInt16LE(value, offset, noAssert) {
	value = +value;
	offset = offset >>> 0;
	if (!noAssert) {
		checkInt(this, value, offset, 2, 32767, -32768);
	}
	this[offset] = value & 255;
	this[offset + 1] = value >>> 8;
	return offset + 2;
};
Buffer$1.prototype.writeInt16BE = function writeInt16BE(value, offset, noAssert) {
	value = +value;
	offset = offset >>> 0;
	if (!noAssert) {
		checkInt(this, value, offset, 2, 32767, -32768);
	}
	this[offset] = value >>> 8;
	this[offset + 1] = value & 255;
	return offset + 2;
};
Buffer$1.prototype.writeInt32LE = function writeInt32LE(value, offset, noAssert) {
	value = +value;
	offset = offset >>> 0;
	if (!noAssert) {
		checkInt(this, value, offset, 4, 2147483647, -2147483648);
	}
	this[offset] = value & 255;
	this[offset + 1] = value >>> 8;
	this[offset + 2] = value >>> 16;
	this[offset + 3] = value >>> 24;
	return offset + 4;
};
Buffer$1.prototype.writeInt32BE = function writeInt32BE(value, offset, noAssert) {
	value = +value;
	offset = offset >>> 0;
	if (!noAssert) {
		checkInt(this, value, offset, 4, 2147483647, -2147483648);
	}
	if (value < 0) {
		value = 4294967295 + value + 1;
	}
	this[offset] = value >>> 24;
	this[offset + 1] = value >>> 16;
	this[offset + 2] = value >>> 8;
	this[offset + 3] = value & 255;
	return offset + 4;
};
Buffer$1.prototype.writeBigInt64LE = defineBigIntMethod(function writeBigInt64LE(value, offset = 0) {
	return wrtBigUInt64LE(this, value, offset, -BigInt("0x8000000000000000"), BigInt("0x7fffffffffffffff"));
});
Buffer$1.prototype.writeBigInt64BE = defineBigIntMethod(function writeBigInt64BE(value, offset = 0) {
	return wrtBigUInt64BE(this, value, offset, -BigInt("0x8000000000000000"), BigInt("0x7fffffffffffffff"));
});
function checkIEEE754(buf, value, offset, ext, max, min) {
	if (offset + ext > buf.length) {
		throw new RangeError("Index out of range");
	}
	if (offset < 0) {
		throw new RangeError("Index out of range");
	}
}
function writeFloat(buf, value, offset, littleEndian, noAssert) {
	value = +value;
	offset = offset >>> 0;
	if (!noAssert) {
		checkIEEE754(buf, value, offset, 4);
	}
	write(buf, value, offset, littleEndian, 23, 4);
	return offset + 4;
}
Buffer$1.prototype.writeFloatLE = function writeFloatLE(value, offset, noAssert) {
	return writeFloat(this, value, offset, true, noAssert);
};
Buffer$1.prototype.writeFloatBE = function writeFloatBE(value, offset, noAssert) {
	return writeFloat(this, value, offset, false, noAssert);
};
function writeDouble(buf, value, offset, littleEndian, noAssert) {
	value = +value;
	offset = offset >>> 0;
	if (!noAssert) {
		checkIEEE754(buf, value, offset, 8);
	}
	write(buf, value, offset, littleEndian, 52, 8);
	return offset + 8;
}
Buffer$1.prototype.writeDoubleLE = function writeDoubleLE(value, offset, noAssert) {
	return writeDouble(this, value, offset, true, noAssert);
};
Buffer$1.prototype.writeDoubleBE = function writeDoubleBE(value, offset, noAssert) {
	return writeDouble(this, value, offset, false, noAssert);
};
// copy(targetBuffer, targetStart=0, sourceStart=0, sourceEnd=buffer.length)
Buffer$1.prototype.copy = function copy(target, targetStart, start, end) {
	if (!Buffer$1.isBuffer(target)) {
		throw new TypeError("argument should be a Buffer");
	}
	if (!start) {
		start = 0;
	}
	if (!end && end !== 0) {
		end = this.length;
	}
	if (targetStart >= target.length) {
		targetStart = target.length;
	}
	if (!targetStart) {
		targetStart = 0;
	}
	if (end > 0 && end < start) {
		end = start;
	}
	// Copy 0 bytes; we're done
	if (end === start) {
		return 0;
	}
	if (target.length === 0 || this.length === 0) {
		return 0;
	}
	// Fatal error conditions
	if (targetStart < 0) {
		throw new RangeError("targetStart out of bounds");
	}
	if (start < 0 || start >= this.length) {
		throw new RangeError("Index out of range");
	}
	if (end < 0) {
		throw new RangeError("sourceEnd out of bounds");
	}
	// Are we oob?
	if (end > this.length) {
		end = this.length;
	}
	if (target.length - targetStart < end - start) {
		end = target.length - targetStart + start;
	}
	const len = end - start;
	if (this === target && typeof Uint8Array.prototype.copyWithin === "function") {
		// Use built-in when available, missing from IE11
		this.copyWithin(targetStart, start, end);
	} else {
		Uint8Array.prototype.set.call(target, this.subarray(start, end), targetStart);
	}
	return len;
};
// Usage:
//    buffer.fill(number[, offset[, end]])
//    buffer.fill(buffer[, offset[, end]])
//    buffer.fill(string[, offset[, end]][, encoding])
Buffer$1.prototype.fill = function fill(val, start, end, encoding) {
	// Handle string cases:
	if (typeof val === "string") {
		if (typeof start === "string") {
			encoding = start;
			start = 0;
			end = this.length;
		} else if (typeof end === "string") {
			encoding = end;
			end = this.length;
		}
		if (encoding !== undefined && typeof encoding !== "string") {
			throw new TypeError("encoding must be a string");
		}
		if (typeof encoding === "string" && !Buffer$1.isEncoding(encoding)) {
			throw new TypeError("Unknown encoding: " + encoding);
		}
		if (val.length === 1) {
			const code = val.charCodeAt(0);
			if (encoding === "utf8" && code < 128 || encoding === "latin1") {
				// Fast path: If `val` fits into a single byte, use that numeric value.
				val = code;
			}
		}
	} else if (typeof val === "number") {
		val = val & 255;
	} else if (typeof val === "boolean") {
		val = Number(val);
	}
	// Invalid ranges are not set to a default, so can range check early.
	if (start < 0 || this.length < start || this.length < end) {
		throw new RangeError("Out of range index");
	}
	if (end <= start) {
		return this;
	}
	start = start >>> 0;
	end = end === undefined ? this.length : end >>> 0;
	if (!val) {
		val = 0;
	}
	let i;
	if (typeof val === "number") {
		for (i = start; i < end; ++i) {
			this[i] = val;
		}
	} else {
		const bytes = Buffer$1.isBuffer(val) ? val : Buffer$1.from(val, encoding);
		const len = bytes.length;
		if (len === 0) {
			throw new TypeError("The value \"" + val + "\" is invalid for argument \"value\"");
		}
		for (i = 0; i < end - start; ++i) {
			this[i + start] = bytes[i % len];
		}
	}
	return this;
};
// CUSTOM ERRORS
// =============
// Simplified versions from Node, changed for Buffer-only usage
const errors = {};
function E$1(sym, getMessage, Base) {
	errors[sym] = class NodeError extends Base {
		constructor() {
			super();
			Object.defineProperty(this, "message", {
				value: Reflect.apply(getMessage, this, arguments),
				writable: true,
				configurable: true
			});
			// Add the error code to the name to include it in the stack trace.
			this.name = `${this.name} [${sym}]`;
			// Access the stack to generate the error message including the error code
			// from the name.
			this.stack;
			// Reset the name to the actual name.
			delete this.name;
		}
		get code() {
			return sym;
		}
		set code(value) {
			Object.defineProperty(this, "code", {
				configurable: true,
				enumerable: true,
				value,
				writable: true
			});
		}
		toString() {
			return `${this.name} [${sym}]: ${this.message}`;
		}
	};
}
E$1("ERR_BUFFER_OUT_OF_BOUNDS", function(name) {
	if (name) {
		return `${name} is outside of buffer bounds`;
	}
	return "Attempt to access memory outside buffer bounds";
}, RangeError);
E$1("ERR_INVALID_ARG_TYPE", function(name, actual) {
	return `The "${name}" argument must be of type number. Received type ${typeof actual}`;
}, TypeError);
E$1("ERR_OUT_OF_RANGE", function(str, range, input) {
	let msg = `The value of "${str}" is out of range.`;
	let received = input;
	if (Number.isInteger(input) && Math.abs(input) > 2 ** 32) {
		received = addNumericalSeparator(String(input));
	} else if (typeof input === "bigint") {
		received = String(input);
		if (input > BigInt(2) ** BigInt(32) || input < -(BigInt(2) ** BigInt(32))) {
			received = addNumericalSeparator(received);
		}
		received += "n";
	}
	msg += ` It must be ${range}. Received ${received}`;
	return msg;
}, RangeError);
function addNumericalSeparator(val) {
	let res = "";
	let i = val.length;
	const start = val[0] === "-" ? 1 : 0;
	for (; i >= start + 4; i -= 3) {
		res = `_${val.slice(i - 3, i)}${res}`;
	}
	return `${val.slice(0, i)}${res}`;
}
// CHECK FUNCTIONS
// ===============
function checkBounds(buf, offset, byteLength) {
	validateNumber(offset, "offset");
	if (buf[offset] === undefined || buf[offset + byteLength] === undefined) {
		boundsError(offset, buf.length - (byteLength + 1));
	}
}
function checkIntBI(value, min, max, buf, offset, byteLength) {
	if (value > max || value < min) {
		const n = typeof min === "bigint" ? "n" : "";
		let range;
		{
			range = min === 0 || min === BigInt(0) ? `>= 0${n} and < 2${n} ** ${(byteLength + 1) * 8}${n}` : `>= -(2${n} ** ${(byteLength + 1) * 8 - 1}${n}) and < 2 ** ` + `${(byteLength + 1) * 8 - 1}${n}`;
		}
		throw new errors.ERR_OUT_OF_RANGE("value", range, value);
	}
	checkBounds(buf, offset, byteLength);
}
function validateNumber(value, name) {
	if (typeof value !== "number") {
		throw new errors.ERR_INVALID_ARG_TYPE(name, "number", value);
	}
}
function boundsError(value, length, type) {
	if (Math.floor(value) !== value) {
		validateNumber(value, type);
		throw new errors.ERR_OUT_OF_RANGE("offset", "an integer", value);
	}
	if (length < 0) {
		throw new errors.ERR_BUFFER_OUT_OF_BOUNDS();
	}
	throw new errors.ERR_OUT_OF_RANGE("offset", `>= ${0} and <= ${length}`, value);
}
// HELPER FUNCTIONS
// ================
const INVALID_BASE64_RE = /[^\w+/-]/g;
function base64clean(str) {
	// Node takes equal signs as end of the Base64 encoding
	str = str.split("=")[0];
	// Node strips out invalid characters like \n and \t from the string, base64-js does not
	str = str.trim().replace(INVALID_BASE64_RE, "");
	// Node converts strings with length < 2 to ''
	if (str.length < 2) {
		return "";
	}
	// Node allows for non-padded base64 strings (missing trailing ===), base64-js does not
	while (str.length % 4 !== 0) {
		str = str + "=";
	}
	return str;
}
function utf8ToBytes(string, units) {
	units = units || Number.POSITIVE_INFINITY;
	let codePoint;
	const length = string.length;
	let leadSurrogate = null;
	const bytes = [];
	for (let i = 0; i < length; ++i) {
		codePoint = string.charCodeAt(i);
		// is surrogate component
		if (codePoint > 55295 && codePoint < 57344) {
			// last char was a lead
			if (!leadSurrogate) {
				// no lead yet
				if (codePoint > 56319) {
					// unexpected trail
					if ((units -= 3) > -1) {
						bytes.push(239, 191, 189);
					}
					continue;
				} else if (i + 1 === length) {
					// unpaired lead
					if ((units -= 3) > -1) {
						bytes.push(239, 191, 189);
					}
					continue;
				}
				// valid lead
				leadSurrogate = codePoint;
				continue;
			}
			// 2 leads in a row
			if (codePoint < 56320) {
				if ((units -= 3) > -1) {
					bytes.push(239, 191, 189);
				}
				leadSurrogate = codePoint;
				continue;
			}
			// valid surrogate pair
			codePoint = (leadSurrogate - 55296 << 10 | codePoint - 56320) + 65536;
		} else if (leadSurrogate && (units -= 3) > -1) {
			bytes.push(239, 191, 189);
		}
		leadSurrogate = null;
		// encode utf8
		if (codePoint < 128) {
			if ((units -= 1) < 0) {
				break;
			}
			bytes.push(codePoint);
		} else if (codePoint < 2048) {
			if ((units -= 2) < 0) {
				break;
			}
			bytes.push(codePoint >> 6 | 192, codePoint & 63 | 128);
		} else if (codePoint < 65536) {
			if ((units -= 3) < 0) {
				break;
			}
			bytes.push(codePoint >> 12 | 224, codePoint >> 6 & 63 | 128, codePoint & 63 | 128);
		} else if (codePoint < 1114112) {
			if ((units -= 4) < 0) {
				break;
			}
			bytes.push(codePoint >> 18 | 240, codePoint >> 12 & 63 | 128, codePoint >> 6 & 63 | 128, codePoint & 63 | 128);
		} else {
			throw new Error("Invalid code point");
		}
	}
	return bytes;
}
function asciiToBytes(str) {
	const byteArray = [];
	for (let i = 0; i < str.length; ++i) {
		// Node's code seems to be doing this and not & 0x7F..
		byteArray.push(str.charCodeAt(i) & 255);
	}
	return byteArray;
}
function utf16leToBytes(str, units) {
	let c, hi, lo;
	const byteArray = [];
	for (let i = 0; i < str.length; ++i) {
		if ((units -= 2) < 0) {
			break;
		}
		c = str.charCodeAt(i);
		hi = c >> 8;
		lo = c % 256;
		byteArray.push(lo, hi);
	}
	return byteArray;
}
function base64ToBytes(str) {
	return toByteArray(base64clean(str));
}
function blitBuffer(src, dst, offset, length) {
	let i;
	for (i = 0; i < length; ++i) {
		if (i + offset >= dst.length || i >= src.length) {
			break;
		}
		dst[i + offset] = src[i];
	}
	return i;
}
// ArrayBuffer or Uint8Array objects from other contexts (i.e. iframes) do not pass
// the `instanceof` check but they should be treated as of that type.
// See: https://github.com/feross/buffer/issues/166
function isInstance(obj, type) {
	return obj instanceof type || obj != null && obj.constructor != null && obj.constructor.name != null && obj.constructor.name === type.name;
}
function numberIsNaN(obj) {
	// For IE11 support
	return obj !== obj;
}
// Create lookup table for `toString('hex')`
// See: https://github.com/feross/buffer/issues/219
const hexSliceLookupTable = (function() {
	const alphabet = "0123456789abcdef";
	const table = Array.from({ length: 256 });
	for (let i = 0; i < 16; ++i) {
		const i16 = i * 16;
		for (let j = 0; j < 16; ++j) {
			table[i16 + j] = alphabet[i] + alphabet[j];
		}
	}
	return table;
})();
// Return not function with Error if BigInt not supported
function defineBigIntMethod(fn) {
	return typeof BigInt === "undefined" ? BufferBigIntNotDefined : fn;
}
function BufferBigIntNotDefined() {
	throw new Error("BigInt not supported");
}

const Buffer = globalThis.Buffer || Buffer$1;
globalThis.btoa.bind(globalThis);
globalThis.atob.bind(globalThis);

// Node.js compatibility
if (!("global" in globalThis)) {
	globalThis.global = globalThis;
}

const executionAsyncId = function executionAsyncId() {
	return 0;
};
// @ts-expect-error @types/node is missing this one - this is a bug in typings
Object.assign(Object.create(null), {
	NONE: 0,
	DIRHANDLE: 1,
	DNSCHANNEL: 2,
	ELDHISTOGRAM: 3,
	FILEHANDLE: 4,
	FILEHANDLECLOSEREQ: 5,
	BLOBREADER: 6,
	FSEVENTWRAP: 7,
	FSREQCALLBACK: 8,
	FSREQPROMISE: 9,
	GETADDRINFOREQWRAP: 10,
	GETNAMEINFOREQWRAP: 11,
	HEAPSNAPSHOT: 12,
	HTTP2SESSION: 13,
	HTTP2STREAM: 14,
	HTTP2PING: 15,
	HTTP2SETTINGS: 16,
	HTTPINCOMINGMESSAGE: 17,
	HTTPCLIENTREQUEST: 18,
	JSSTREAM: 19,
	JSUDPWRAP: 20,
	MESSAGEPORT: 21,
	PIPECONNECTWRAP: 22,
	PIPESERVERWRAP: 23,
	PIPEWRAP: 24,
	PROCESSWRAP: 25,
	PROMISE: 26,
	QUERYWRAP: 27,
	QUIC_ENDPOINT: 28,
	QUIC_LOGSTREAM: 29,
	QUIC_PACKET: 30,
	QUIC_SESSION: 31,
	QUIC_STREAM: 32,
	QUIC_UDP: 33,
	SHUTDOWNWRAP: 34,
	SIGNALWRAP: 35,
	STATWATCHER: 36,
	STREAMPIPE: 37,
	TCPCONNECTWRAP: 38,
	TCPSERVERWRAP: 39,
	TCPWRAP: 40,
	TTYWRAP: 41,
	UDPSENDWRAP: 42,
	UDPWRAP: 43,
	SIGINTWATCHDOG: 44,
	WORKER: 45,
	WORKERHEAPSNAPSHOT: 46,
	WRITEWRAP: 47,
	ZLIB: 48,
	CHECKPRIMEREQUEST: 49,
	PBKDF2REQUEST: 50,
	KEYPAIRGENREQUEST: 51,
	KEYGENREQUEST: 52,
	KEYEXPORTREQUEST: 53,
	CIPHERREQUEST: 54,
	DERIVEBITSREQUEST: 55,
	HASHREQUEST: 56,
	RANDOMBYTESREQUEST: 57,
	RANDOMPRIMEREQUEST: 58,
	SCRYPTREQUEST: 59,
	SIGNREQUEST: 60,
	TLSWRAP: 61,
	VERIFYREQUEST: 62
});

// https://nodejs.org/api/async_context.html#class-asyncresource
let _asyncIdCounter = 100;
class _AsyncResource {
	__unenv__ = true;
	type;
	_asyncId;
	_triggerAsyncId;
	constructor(type, triggerAsyncId = executionAsyncId()) {
		this.type = type;
		this._asyncId = -1 * _asyncIdCounter++;
		this._triggerAsyncId = typeof triggerAsyncId === "number" ? triggerAsyncId : triggerAsyncId?.triggerAsyncId;
	}
	static bind(fn, type, thisArg) {
		const resource = new AsyncResource(type ?? "anonymous");
		return resource.bind(fn);
	}
	bind(fn, thisArg) {
		const binded = (...args) => this.runInAsyncScope(fn, thisArg, ...args);
		binded.asyncResource = this;
		return binded;
	}
	runInAsyncScope(fn, thisArg, ...args) {
		const result = fn.apply(thisArg, args);
		return result;
	}
	emitDestroy() {
		return this;
	}
	asyncId() {
		return this._asyncId;
	}
	triggerAsyncId() {
		return this._triggerAsyncId;
	}
}
const AsyncResource = globalThis.AsyncResource || _AsyncResource;

// By default EventEmitters will print a warning if more than 10 listeners are
// added to it. This is a useful default which helps finding memory leaks.
let defaultMaxListeners = 10;
const AsyncIteratorPrototype = Object.getPrototypeOf(Object.getPrototypeOf(async function* () {}).prototype);
// Inspect (mocked)
const inspect = (value, _opts) => value;
// Errors
const ERR_INVALID_THIS = Error;
const ERR_UNHANDLED_ERROR = Error;
const ERR_INVALID_ARG_TYPE = Error;
const AbortError = Error;
const genericNodeError = Error;
// Symbols
const kRejection = /* @__PURE__ */ Symbol.for("nodejs.rejection");
const kCapture = /* @__PURE__ */ Symbol.for("kCapture");
const kErrorMonitor = /* @__PURE__ */ Symbol.for("events.errorMonitor");
const kShapeMode = /* @__PURE__ */ Symbol.for("shapeMode");
const kMaxEventTargetListeners = /* @__PURE__ */ Symbol.for("events.maxEventTargetListeners");
const kEnhanceStackBeforeInspector = /* @__PURE__ */ Symbol.for("kEnhanceStackBeforeInspector");
const kWatermarkData = /* @__PURE__ */ Symbol.for("nodejs.watermarkData");
const kEventEmitter = /* @__PURE__ */ Symbol.for("kEventEmitter");
const kAsyncResource = /* @__PURE__ */ Symbol.for("kAsyncResource");
const kFirstEventParam = /* @__PURE__ */ Symbol.for("kFirstEventParam");
const kResistStopPropagation = /* @__PURE__ */ Symbol.for("kResistStopPropagation");
const kMaxEventTargetListenersWarned = /* @__PURE__ */ Symbol.for("events.maxEventTargetListenersWarned");
// ----------------------------------------------------------------------------
// EventEmitter
// ----------------------------------------------------------------------------
class _EventEmitter {
	// Internal state
	_events = undefined;
	_eventsCount = 0;
	_maxListeners = defaultMaxListeners;
	[kCapture] = false;
	[kShapeMode] = false;
	// Symbols
	static captureRejectionSymbol = kRejection;
	static errorMonitor = kErrorMonitor;
	static kMaxEventTargetListeners = kMaxEventTargetListeners;
	static kMaxEventTargetListenersWarned = kMaxEventTargetListenersWarned;
	// Static utils
	static usingDomains = false;
	static get on() {
		return on$1;
	}
	static get once() {
		return once$1;
	}
	static get getEventListeners() {
		return getEventListeners;
	}
	static get getMaxListeners() {
		return getMaxListeners$1;
	}
	static get addAbortListener() {
		return addAbortListener;
	}
	static get EventEmitterAsyncResource() {
		return EventEmitterAsyncResource;
	}
	static get EventEmitter() {
		return _EventEmitter;
	}
	static setMaxListeners(n = defaultMaxListeners, ...eventTargets) {
		// validateNumber(n, "setMaxListeners", 0);
		if (eventTargets.length === 0) {
			defaultMaxListeners = n;
		} else {
			for (const target of eventTargets) {
				if (isEventTarget(target)) {
					// @ts-expect-error
					target[kMaxEventTargetListeners] = n;
					// @ts-expect-error
					target[kMaxEventTargetListenersWarned] = false;
				} else if (typeof target.setMaxListeners === "function") {
					target.setMaxListeners(n);
				} else {
					throw new ERR_INVALID_ARG_TYPE(
						"eventTargets",
						["EventEmitter", "EventTarget"],
						// @ts-expect-error
						target
					);
				}
			}
		}
	}
	static listenerCount(emitter, type) {
		if (typeof emitter.listenerCount === "function") {
			return emitter.listenerCount(type);
		}
		_EventEmitter.prototype.listenerCount.call(emitter, type);
	}
	static init() {
		throw new Error("EventEmitter.init() is not implemented.");
	}
	static get captureRejections() {
		// @ts-expect-error
		return this[kCapture];
	}
	static set captureRejections(value) {
		// validateBoolean(value, "captureRejections");
		// @ts-expect-error
		this[kCapture] = value;
	}
	static get defaultMaxListeners() {
		return defaultMaxListeners;
	}
	static set defaultMaxListeners(arg) {
		// validateNumber(arg, "defaultMaxListeners", 0);
		defaultMaxListeners = arg;
	}
	// Constructor
	constructor(opts) {
		if (this._events === undefined || this._events === Object.getPrototypeOf(this)._events) {
			this._events = { __proto__: null };
			this._eventsCount = 0;
			this[kShapeMode] = false;
		} else {
			this[kShapeMode] = true;
		}
		this._maxListeners = this._maxListeners || undefined;
		if (opts?.captureRejections) {
			// validateBoolean(opts.captureRejections, "options.captureRejections");
			this[kCapture] = Boolean(opts.captureRejections);
		} else {
			// Assigning the kCapture property directly saves an expensive
			// prototype lookup in a very sensitive hot path.
			this[kCapture] = _EventEmitter.prototype[kCapture];
		}
	}
	/**
	* Increases the max listeners of the event emitter.
	* @param {number} n
	* @returns {EventEmitter}
	*/
	setMaxListeners(n) {
		// validateNumber(n, "setMaxListeners", 0);
		this._maxListeners = n;
		return this;
	}
	/**
	* Returns the current max listener value for the event emitter.
	* @returns {number}
	*/
	getMaxListeners() {
		return _getMaxListeners(this);
	}
	/**
	* Synchronously calls each of the listeners registered
	* for the event.
	* @param {...any} [args]
	* @returns {boolean}
	*/
	emit(type, ...args) {
		let doError = type === "error";
		const events = this._events;
		if (events !== undefined) {
			if (doError && events[kErrorMonitor] !== undefined) this.emit(kErrorMonitor, ...args);
			doError = doError && events.error === undefined;
		} else if (!doError) return false;
		// If there is no 'error' event listener then throw.
		if (doError) {
			let er;
			if (args.length > 0) er = args[0];
			if (er instanceof Error) {
				try {
					const capture = {};
					Error.captureStackTrace?.(capture, _EventEmitter.prototype.emit);
					Object.defineProperty(er, kEnhanceStackBeforeInspector, {
						__proto__: null,
						value: Function.prototype.bind(enhanceStackTrace, this, er, capture),
						configurable: true
					});
				} catch {}
				// Note: The comments on the `throw` lines are intentional, they show
				// up in Node's output if this results in an unhandled exception.
				throw er;
			}
			let stringifiedEr;
			try {
				stringifiedEr = inspect(er);
			} catch {
				stringifiedEr = er;
			}
			// At least give some kind of context to the user
			const err = new ERR_UNHANDLED_ERROR(stringifiedEr);
			// @ts-expect-error
			err.context = er;
			throw err;
		}
		const handler = events[type];
		if (handler === undefined) return false;
		if (typeof handler === "function") {
			const result = handler.apply(this, args);
			// We check if result is undefined first because that
			// is the most common case so we do not pay any perf
			// penalty
			if (result !== undefined && result !== null) {
				addCatch(this, result, type, args);
			}
		} else {
			const len = handler.length;
			const listeners = arrayClone(handler);
			for (let i = 0; i < len; ++i) {
				const result = listeners[i].apply(this, args);
				// We check if result is undefined first because that
				// is the most common case so we do not pay any perf
				// penalty.
				// This code is duplicated because extracting it away
				// would make it non-inlineable.
				if (result !== undefined && result !== null) {
					addCatch(this, result, type, args);
				}
			}
		}
		return true;
	}
	/**
	* Adds a listener to the event emitter.
	* @returns {EventEmitter}
	*/
	addListener(type, listener) {
		_addListener(this, type, listener, false);
		return this;
	}
	on(type, listener) {
		return this.addListener(type, listener);
	}
	/**
	* Adds the `listener` function to the beginning of
	* the listeners array.
	*/
	prependListener(type, listener) {
		_addListener(this, type, listener, true);
		return this;
	}
	/**
	* Adds a one-time `listener` function to the event emitter.
	*/
	once(type, listener) {
		this.on(type, _onceWrap(this, type, listener));
		return this;
	}
	/**
	* Adds a one-time `listener` function to the beginning of
	* the listeners array.
	*/
	prependOnceListener(type, listener) {
		this.prependListener(type, _onceWrap(this, type, listener));
		return this;
	}
	/**
	* Removes the specified `listener` from the listeners array.
	* @param {string | symbol} type
	* @param {Function} listener
	* @returns {EventEmitter}
	*/
	removeListener(type, listener) {
		const events = this._events;
		if (events === undefined) return this;
		const list = events[type];
		if (list === undefined) return this;
		if (list === listener || list.listener === listener) {
			this._eventsCount -= 1;
			if (this[kShapeMode]) {
				events[type] = undefined;
			} else if (this._eventsCount === 0) {
				this._events = { __proto__: null };
			} else {
				delete events[type];
				if (events.removeListener) this.emit("removeListener", type, list.listener || listener);
			}
		} else if (typeof list !== "function") {
			let position = -1;
			for (let i = list.length - 1; i >= 0; i--) {
				if (list[i] === listener || list[i].listener === listener) {
					position = i;
					break;
				}
			}
			if (position < 0) return this;
			if (position === 0) list.shift();
			else {
				spliceOne(list, position);
			}
			if (list.length === 1) events[type] = list[0];
			if (events.removeListener !== undefined) this.emit("removeListener", type, listener);
		}
		return this;
	}
	off(type, listener) {
		return this.removeListener(type, listener);
	}
	/**
	* Removes all listeners from the event emitter. (Only
	* removes listeners for a specific event name if specified
	* as `type`).
	*/
	removeAllListeners(type) {
		const events = this._events;
		if (events === undefined) return this;
		// Not listening for removeListener, no need to emit
		if (events.removeListener === undefined) {
			if (arguments.length === 0) {
				this._events = { __proto__: null };
				this._eventsCount = 0;
			} else if (events[type] !== undefined) {
				if (--this._eventsCount === 0) this._events = { __proto__: null };
				else delete events[type];
			}
			this[kShapeMode] = false;
			return this;
		}
		// Emit removeListener for all listeners on all events
		if (arguments.length === 0) {
			for (const key of Reflect.ownKeys(events)) {
				if (key === "removeListener") continue;
				this.removeAllListeners(key);
			}
			this.removeAllListeners("removeListener");
			this._events = { __proto__: null };
			this._eventsCount = 0;
			this[kShapeMode] = false;
			return this;
		}
		const listeners = events[type];
		if (typeof listeners === "function") {
			this.removeListener(type, listeners);
		} else if (listeners !== undefined) {
			// LIFO order
			for (let i = listeners.length - 1; i >= 0; i--) {
				this.removeListener(type, listeners[i]);
			}
		}
		return this;
	}
	/**
	* Returns a copy of the array of listeners for the event name
	* specified as `type`.
	* @param {string | symbol} type
	* @returns {Function[]}
	*/
	listeners(type) {
		return _listeners(this, type, true);
	}
	/**
	* Returns a copy of the array of listeners and wrappers for
	* the event name specified as `type`.
	* @returns {Function[]}
	*/
	rawListeners(type) {
		return _listeners(this, type, false);
	}
	/**
	* Returns an array listing the events for which
	* the emitter has registered listeners.
	* @returns {any[]}
	*/
	eventNames() {
		return this._eventsCount > 0 ? Reflect.ownKeys(this._events) : [];
	}
	/**
	* Returns the number of listeners listening to event name
	*/
	listenerCount(eventName, listener) {
		const events = this._events;
		if (events !== undefined) {
			const evlistener = events[eventName];
			if (typeof evlistener === "function") {
				if (listener != null) {
					return listener === evlistener || listener === evlistener.listener ? 1 : 0;
				}
				return 1;
			} else if (evlistener !== undefined) {
				if (listener != null) {
					let matching = 0;
					for (let i = 0, l = evlistener.length; i < l; i++) {
						if (evlistener[i] === listener || evlistener[i].listener === listener) {
							matching++;
						}
					}
					return matching;
				}
				return evlistener.length;
			}
		}
		return 0;
	}
}
// ----------------------------------------------------------------------------
// EventEmitterAsyncResource
// ----------------------------------------------------------------------------
class EventEmitterAsyncResource extends _EventEmitter {
	/**
	* @param {{
	*   name?: string,
	*   triggerAsyncId?: number,
	*   requireManualDestroy?: boolean,
	* }} [options]
	*/
	constructor(options) {
		let name;
		if (typeof options === "string") {
			name = options;
			options = undefined;
		} else {
			// if (new.target === EventEmitterAsyncResource) {
			// validateString(options?.name, "options.name");
			// }
			name = options?.name || new.target.name;
		}
		super(options);
		// @ts-expect-error
		this[kAsyncResource] = new EventEmitterReferencingAsyncResource(this, name, options);
	}
	/**
	* @param {symbol,string} event
	* @param  {...any} args
	* @returns {boolean}
	*/
	emit(event, ...args) {
		// @ts-expect-error
		if (this[kAsyncResource] === undefined) throw new ERR_INVALID_THIS("EventEmitterAsyncResource");
		const { asyncResource } = this;
		Array.prototype.unshift(args, super.emit, this, event);
		return Reflect.apply(asyncResource.runInAsyncScope, asyncResource, args);
	}
	/**
	* @returns {void}
	*/
	emitDestroy() {
		// @ts-expect-error
		if (this[kAsyncResource] === undefined) throw new ERR_INVALID_THIS("EventEmitterAsyncResource");
		this.asyncResource.emitDestroy();
	}
	/**
	* @type {number}
	*/
	get asyncId() {
		// @ts-expect-error
		if (this[kAsyncResource] === undefined) throw new ERR_INVALID_THIS("EventEmitterAsyncResource");
		return this.asyncResource.asyncId();
	}
	/**
	* @type {number}
	*/
	get triggerAsyncId() {
		// @ts-expect-error
		if (this[kAsyncResource] === undefined) throw new ERR_INVALID_THIS("EventEmitterAsyncResource");
		return this.asyncResource.triggerAsyncId();
	}
	/**
	* @type {EventEmitterReferencingAsyncResource}
	*/
	get asyncResource() {
		// @ts-expect-error
		if (this[kAsyncResource] === undefined) throw new ERR_INVALID_THIS("EventEmitterAsyncResource");
		// @ts-expect-error
		return this[kAsyncResource];
	}
}
// This implementation was adapted straight from addaleax's
// eventemitter-asyncresource MIT-licensed userland module.
// https://github.com/addaleax/eventemitter-asyncresource
class EventEmitterReferencingAsyncResource extends AsyncResource {
	/**
	* @param {EventEmitter} ee
	* @param {string} [type]
	* @param {{
	*   triggerAsyncId?: number,
	*   requireManualDestroy?: boolean,
	* }} [options]
	*/
	constructor(ee, type, options) {
		super(type, options);
		// @ts-expect-error
		this[kEventEmitter] = ee;
	}
	/**
	* @type {EventEmitter}
	*/
	get eventEmitter() {
		// @ts-expect-error
		if (this[kEventEmitter] === undefined) throw new ERR_INVALID_THIS("EventEmitterReferencingAsyncResource");
		// @ts-expect-error
		return this[kEventEmitter];
	}
}
// ----------------------------------------------------------------------------
// Exported utils
// ----------------------------------------------------------------------------
/**
* Returns an `AsyncIterator` that iterates `event` events.
* @param {EventEmitter} emitter
* @param {string | symbol} event
* @param {{
*    signal: AbortSignal;
*    close?: string[];
*    highWaterMark?: number,
*    lowWaterMark?: number
*   }} [options]
* @returns {AsyncIterator}
*/
const on$1 = function on(emitter, event, options = {}) {
	// Parameters validation
	// validateObject(options, "options");
	const signal = options.signal;
	// validateAbortSignal(signal, "options.signal");
	if (signal?.aborted) {
		throw new AbortError(undefined, { cause: signal?.reason });
	}
	// Support both highWaterMark and highWatermark for backward compatibility
	const highWatermark = options.highWaterMark ?? options.highWatermark ?? Number.MAX_SAFE_INTEGER;
	// validateInteger(highWatermark, "options.highWaterMark", 1);
	// Support both lowWaterMark and lowWatermark for backward compatibility
	const lowWatermark = options.lowWaterMark ?? options.lowWatermark ?? 1;
	// validateInteger(lowWatermark, "options.lowWaterMark", 1);
	// Preparing controlling queues and variables
	const unconsumedEvents = new FixedQueue();
	const unconsumedPromises = new FixedQueue();
	let paused = false;
	let error = null;
	let finished = false;
	let size = 0;
	const iterator = Object.setPrototypeOf({
		next() {
			// First, we consume all unread events
			if (size) {
				const value = unconsumedEvents.shift();
				size--;
				if (paused && size < lowWatermark) {
					// @ts-expect-error
					emitter.resume?.();
					paused = false;
				}
				return Promise.resolve(createIterResult(value, false));
			}
			// Then we error, if an error happened
			// This happens one time if at all, because after 'error'
			// we stop listening
			if (error) {
				const p = Promise.reject(error);
				// Only the first element errors
				error = null;
				return p;
			}
			// If the iterator is finished, resolve to done
			if (finished) return closeHandler();
			// Wait until an event happens
			return new Promise(function(resolve, reject) {
				unconsumedPromises.push({
					resolve,
					reject
				});
			});
		},
		return() {
			return closeHandler();
		},
		throw(err) {
			if (!err || !(err instanceof Error)) {
				throw new ERR_INVALID_ARG_TYPE(
					"EventEmitter.AsyncIterator",
					"Error",
					// @ts-expect-error
					err
				);
			}
			errorHandler(err);
		},
		[Symbol.asyncIterator]() {
			return this;
		},
		[kWatermarkData]: {
			get size() {
				return size;
			},
			get low() {
				return lowWatermark;
			},
			get high() {
				return highWatermark;
			},
			get isPaused() {
				return paused;
			}
		}
	}, AsyncIteratorPrototype);
	// Adding event handlers
	const { addEventListener, removeAll } = listenersController();
	addEventListener(emitter, event, options[kFirstEventParam] ? eventHandler : function(...args) {
		return eventHandler(args);
	});
	if (event !== "error" && typeof emitter.on === "function") {
		addEventListener(emitter, "error", errorHandler);
	}
	const closeEvents = options?.close;
	if (closeEvents?.length) {
		for (const closeEvent of closeEvents) {
			addEventListener(emitter, closeEvent, closeHandler);
		}
	}
	const abortListenerDisposable = signal ? addAbortListener(signal, abortListener) : null;
	return iterator;
	function abortListener() {
		errorHandler(new AbortError(undefined, { cause: signal?.reason }));
	}
	function eventHandler(value) {
		if (unconsumedPromises.isEmpty()) {
			size++;
			if (!paused && size > highWatermark) {
				paused = true;
				// @ts-expect-error
				emitter.pause?.();
			}
			unconsumedEvents.push(value);
		} else unconsumedPromises.shift().resolve(createIterResult(value, false));
	}
	function errorHandler(err) {
		if (unconsumedPromises.isEmpty()) error = err;
		else unconsumedPromises.shift().reject(err);
		closeHandler();
	}
	function closeHandler() {
		abortListenerDisposable?.[Symbol.dispose]();
		removeAll();
		finished = true;
		const doneResult = createIterResult(undefined, true);
		while (!unconsumedPromises.isEmpty()) {
			unconsumedPromises.shift().resolve(doneResult);
		}
		return Promise.resolve(doneResult);
	}
};
/**
* Creates a `Promise` that is fulfilled when the emitter
* emits the given event.
* @param {EventEmitter} emitter
* @param {string} name
* @param {{ signal: AbortSignal; }} [options]
* @returns {Promise}
*/
const once$1 = async function once(emitter, name, options = {}) {
	// validateObject(options, "options");
	const signal = options?.signal;
	// validateAbortSignal(signal, "options.signal");
	if (signal?.aborted) {
		throw new AbortError(undefined, { cause: signal?.reason });
	}
	return new Promise((resolve, reject) => {
		const errorListener = (err) => {
			if (typeof emitter.removeListener === "function") {
				emitter.removeListener(name, resolver);
			}
			if (signal != null) {
				eventTargetAgnosticRemoveListener(signal, "abort", abortListener);
			}
			reject(err);
		};
		const resolver = (...args) => {
			if (typeof emitter.removeListener === "function") {
				emitter.removeListener("error", errorListener);
			}
			if (signal != null) {
				eventTargetAgnosticRemoveListener(signal, "abort", abortListener);
			}
			resolve(args);
		};
		const opts = {
			__proto__: null,
			once: true,
			[kResistStopPropagation]: true
		};
		eventTargetAgnosticAddListener(emitter, name, resolver, opts);
		if (name !== "error" && typeof emitter.once === "function") {
			// EventTarget does not have `error` event semantics like Node
			// EventEmitters, we listen to `error` events only on EventEmitters.
			emitter.once("error", errorListener);
		}
		function abortListener() {
			eventTargetAgnosticRemoveListener(emitter, name, resolver);
			eventTargetAgnosticRemoveListener(emitter, "error", errorListener);
			reject(new AbortError(undefined, { cause: signal?.reason }));
		}
		if (signal != null) {
			eventTargetAgnosticAddListener(signal, "abort", abortListener, {
				__proto__: null,
				once: true,
				[kResistStopPropagation]: true
			});
		}
	});
};
const addAbortListener = function addAbortListener(signal, listener) {
	if (signal === undefined) {
		// @ts-expect-error
		throw new ERR_INVALID_ARG_TYPE("signal", "AbortSignal", signal);
	}
	// validateAbortSignal(signal, 'signal');
	// validateFunction(listener, 'listener');
	let removeEventListener;
	if (signal.aborted) {
		// @ts-expect-error
		queueMicrotask(() => listener());
	} else {
		// TODO(atlowChemi) add { subscription: true } and return directly
		signal.addEventListener("abort", listener, {
			__proto__: null,
			once: true,
			[kResistStopPropagation]: true
		});
		removeEventListener = () => {
			signal.removeEventListener("abort", listener);
		};
	}
	return {
		__proto__: null,
		[Symbol.dispose]() {
			removeEventListener?.();
		}
	};
};
/**
* Returns a copy of the array of listeners for the event name
* specified as `type`.
* @returns {Function[]}
*/
const getEventListeners = function getEventListeners(emitterOrTarget, type) {
	// First check if EventEmitter
	if (typeof emitterOrTarget.listeners === "function") {
		return emitterOrTarget.listeners(type);
	}
	// Require event target lazily to avoid always loading it
	if (isEventTarget(emitterOrTarget)) {
		// @ts-expect-error
		const root = emitterOrTarget[kEvents].get(type);
		const listeners = [];
		let handler = root?.next;
		while (handler?.listener !== undefined) {
			const listener = handler.listener?.deref ? handler.listener.deref() : handler.listener;
			listeners.push(listener);
			handler = handler.next;
		}
		return listeners;
	}
	throw new ERR_INVALID_ARG_TYPE(
		"emitter",
		["EventEmitter", "EventTarget"],
		// @ts-expect-error
		emitterOrTarget
	);
};
/**
* Returns the max listeners set.
* @param {EventEmitter | EventTarget} emitterOrTarget
* @returns {number}
*/
const getMaxListeners$1 = function getMaxListeners(emitterOrTarget) {
	if (typeof emitterOrTarget?.getMaxListeners === "function") {
		return _getMaxListeners(emitterOrTarget);
	} else if (emitterOrTarget?.[kMaxEventTargetListeners]) {
		// @ts-expect-error
		return emitterOrTarget[kMaxEventTargetListeners];
	}
	throw new ERR_INVALID_ARG_TYPE(
		"emitter",
		["EventEmitter", "EventTarget"],
		// @ts-expect-error
		emitterOrTarget
	);
};
// ----------------------------------------------------------------------------
// FixedQueue (internal)
// ----------------------------------------------------------------------------
// Currently optimal queue size, tested on V8 6.0 - 6.6. Must be power of two.
const kSize = 2048;
const kMask = kSize - 1;
class FixedCircularBuffer {
	bottom;
	top;
	list;
	next;
	constructor() {
		this.bottom = 0;
		this.top = 0;
		this.list = new Array(kSize);
		this.next = null;
	}
	isEmpty() {
		return this.top === this.bottom;
	}
	isFull() {
		return (this.top + 1 & kMask) === this.bottom;
	}
	push(data) {
		this.list[this.top] = data;
		this.top = this.top + 1 & kMask;
	}
	shift() {
		const nextItem = this.list[this.bottom];
		if (nextItem === undefined) return null;
		this.list[this.bottom] = undefined;
		this.bottom = this.bottom + 1 & kMask;
		return nextItem;
	}
}
class FixedQueue {
	head;
	tail;
	constructor() {
		this.head = this.tail = new FixedCircularBuffer();
	}
	isEmpty() {
		return this.head.isEmpty();
	}
	push(data) {
		if (this.head.isFull()) {
			// Head is full: Creates a new queue, sets the old queue's `.next` to it,
			// and sets it as the new main queue.
			this.head = this.head.next = new FixedCircularBuffer();
		}
		this.head.push(data);
	}
	shift() {
		const tail = this.tail;
		const next = tail.shift();
		if (tail.isEmpty() && tail.next !== null) {
			// If there is another queue, it forms the new tail.
			this.tail = tail.next;
			tail.next = null;
		}
		return next;
	}
}
// ----------------------------------------------------------------------------
// Internal utils
// ----------------------------------------------------------------------------
function isEventTarget(emitter) {
	return typeof emitter?.addEventListener === "function";
}
function addCatch(that, promise, type, args) {
	if (!that[kCapture]) {
		return;
	}
	// Handle Promises/A+ spec, then could be a getter
	// that throws on second use.
	try {
		const then = promise.then;
		if (typeof then === "function") {
			then.call(promise, undefined, function(err) {
				// The callback is called with nextTick to avoid a follow-up
				// rejection from this promise.
				// Avoid using process. from events to avoid circular dependency
				// process.nextTick(emitUnhandledRejectionOrErr, that, err, type, args);
				setTimeout(emitUnhandledRejectionOrErr, 0, that, err, type, args);
			});
		}
	} catch (error_) {
		that.emit("error", error_);
	}
}
function emitUnhandledRejectionOrErr(ee, err, type, args) {
	// @ts-expect-error
	if (typeof ee[kRejection] === "function") {
		// @ts-expect-error
		ee[kRejection](err, type, ...args);
	} else {
		// We have to disable the capture rejections mechanism, otherwise
		// we might end up in an infinite loop.
		const prev = ee[kCapture];
		// If the error handler throws, it is not catchable and it
		// will end up in 'uncaughtException'. We restore the previous
		// value of kCapture in case the uncaughtException is present
		// and the exception is handled.
		try {
			ee[kCapture] = false;
			ee.emit("error", err);
		} finally {
			ee[kCapture] = prev;
		}
	}
}
function _getMaxListeners(that) {
	if (that._maxListeners === undefined) return defaultMaxListeners;
	return that._maxListeners;
}
function enhanceStackTrace(err, own) {
	let ctorInfo = "";
	try {
		// @ts-expect-error
		const { name } = this.constructor;
		if (name !== "EventEmitter") ctorInfo = ` on ${name} instance`;
	} catch {}
	const sep = `\nEmitted 'error' event${ctorInfo} at:\n`;
	// const errStack = (err.stack || "").split("\n").slice(1);
	const ownStack = (own.stack || "").split("\n").slice(1);
	// const { len, offset } = identicalSequenceRange(ownStack, errStack);
	// if (len > 0) {
	//   Array.prototype.splice(
	//     ownStack,
	//     offset + 1,
	//     len - 2,
	//     "    [... lines matching original stack trace ...]",
	//   );
	// }
	return err.stack + sep + ownStack.join("\n");
}
function _addListener(target, type, listener, prepend) {
	let m;
	let events;
	let existing;
	events = target._events;
	if (events === undefined) {
		events = target._events = { __proto__: null };
		target._eventsCount = 0;
	} else {
		// To avoid recursion in the case that type === "newListener"! Before
		// adding it to the listeners, first emit "newListener".
		if (events.newListener !== undefined) {
			// @ts-expect-error
			target.emit("newListener", type, listener.listener ?? listener);
			// Re-assign `events` because a newListener handler could have caused the
			// this._events to be assigned to a new object
			events = target._events;
		}
		existing = events[type];
	}
	if (existing === undefined) {
		// Optimize the case of one listener. Don't need the extra array object.
		events[type] = listener;
		++target._eventsCount;
	} else {
		if (typeof existing === "function") {
			// Adding the second element, need to change to array.
			existing = events[type] = prepend ? [listener, existing] : [existing, listener];
		} else if (prepend) {
			existing.unshift(listener);
		} else {
			existing.push(listener);
		}
		// Check for listener leak
		m = _getMaxListeners(target);
		if (m > 0 && existing.length > m && !existing.warned) {
			existing.warned = true;
			// No error code for this since it is a Warning
			const w = new genericNodeError(`Possible EventEmitter memory leak detected. ${existing.length} ${String(type)} listeners ` + `added to ${inspect(target)}. MaxListeners is ${m}. Use emitter.setMaxListeners() to increase limit`, {
				name: "MaxListenersExceededWarning",
				emitter: target,
				type,
				count: existing.length
			});
			// Avoid using process from events to avoid circular dependency
			console.warn(w);
		}
	}
	return target;
}
function onceWrapper() {
	// @ts-expect-error
	if (!this.fired) {
		// @ts-expect-error
		this.target.removeListener(this.type, this.wrapFn);
		// @ts-expect-error
		this.fired = true;
		// @ts-expect-error
		if (arguments.length === 0) return this.listener.call(this.target);
		// @ts-expect-error
		return this.listener.apply(this.target, arguments);
	}
}
function _onceWrap(target, type, listener) {
	const state = {
		fired: false,
		wrapFn: undefined,
		target,
		type,
		listener
	};
	const wrapped = onceWrapper.bind(state);
	wrapped.listener = listener;
	state.wrapFn = wrapped;
	return wrapped;
}
function _listeners(target, type, unwrap) {
	const events = target._events;
	if (events === undefined) return [];
	const evlistener = events[type];
	if (evlistener === undefined) return [];
	if (typeof evlistener === "function") return unwrap ? [evlistener.listener || evlistener] : [evlistener];
	return unwrap ? unwrapListeners(evlistener) : arrayClone(evlistener);
}
function arrayClone(arr) {
	// At least since V8 8.3, this implementation is faster than the previous
	// which always used a simple for-loop
	switch (arr.length) {
		case 2: return [arr[0], arr[1]];
		case 3: return [
			arr[0],
			arr[1],
			arr[2]
		];
		case 4: return [
			arr[0],
			arr[1],
			arr[2],
			arr[3]
		];
		case 5: return [
			arr[0],
			arr[1],
			arr[2],
			arr[3],
			arr[4]
		];
		case 6: return [
			arr[0],
			arr[1],
			arr[2],
			arr[3],
			arr[4],
			arr[5]
		];
	}
	return Array.prototype.slice.call(arr);
}
function unwrapListeners(arr) {
	const ret = arrayClone(arr);
	for (let i = 0; i < ret.length; ++i) {
		const orig = ret[i].listener;
		if (typeof orig === "function") ret[i] = orig;
	}
	return ret;
}
function createIterResult(value, done) {
	return {
		value,
		done
	};
}
function eventTargetAgnosticRemoveListener(emitter, name, listener, flags) {
	if (typeof emitter.removeListener === "function") {
		emitter.removeListener(name, listener);
	} else if (typeof emitter.removeEventListener === "function") {
		emitter.removeEventListener(name, listener, flags);
	} else {
		// @ts-expect-error
		throw new ERR_INVALID_ARG_TYPE("emitter", "EventEmitter", emitter);
	}
}
function eventTargetAgnosticAddListener(emitter, name, listener, flags) {
	if (typeof emitter.on === "function") {
		if (flags?.once) {
			emitter.once(name, listener);
		} else {
			emitter.on(name, listener);
		}
	} else if (typeof emitter.addEventListener === "function") {
		emitter.addEventListener(name, listener, flags);
	} else {
		// @ts-expect-error
		throw new ERR_INVALID_ARG_TYPE("emitter", "EventEmitter", emitter);
	}
}
function listenersController() {
	const listeners = [];
	return {
		addEventListener(emitter, event, handler, flags) {
			eventTargetAgnosticAddListener(emitter, event, handler, flags);
			Array.prototype.push(listeners, [
				emitter,
				event,
				handler,
				flags
			]);
		},
		removeAll() {
			while (listeners.length > 0) {
				Reflect.apply(eventTargetAgnosticRemoveListener, undefined, listeners.pop());
			}
		}
	};
}
// As of V8 6.6, depending on the size of the array, this is anywhere
// between 1.5-10x faster than the two-arg version of Array#splice()
function spliceOne(list, index) {
	for (; index + 1 < list.length; index++) list[index] = list[index + 1];
	list.pop();
}

class ReadStream {
	fd;
	isRaw = false;
	isTTY = false;
	constructor(fd) {
		this.fd = fd;
	}
	setRawMode(mode) {
		this.isRaw = mode;
		return this;
	}
}

class WriteStream {
	fd;
	columns = 80;
	rows = 24;
	isTTY = false;
	constructor(fd) {
		this.fd = fd;
	}
	clearLine(dir, callback) {
		callback && callback();
		return false;
	}
	clearScreenDown(callback) {
		callback && callback();
		return false;
	}
	cursorTo(x, y, callback) {
		callback && typeof callback === "function" && callback();
		return false;
	}
	moveCursor(dx, dy, callback) {
		callback && callback();
		return false;
	}
	getColorDepth(env) {
		return 1;
	}
	hasColors(count, env) {
		return false;
	}
	getWindowSize() {
		return [this.columns, this.rows];
	}
	write(str, encoding, cb) {
		if (str instanceof Uint8Array) {
			str = new TextDecoder().decode(str);
		}
		try {
			console.log(str);
		} catch {}
		cb && typeof cb === "function" && cb();
		return false;
	}
}

// Extracted from .nvmrc
const NODE_VERSION = "22.14.0";

class Process extends _EventEmitter {
	env;
	hrtime;
	nextTick;
	constructor(impl) {
		super();
		this.env = impl.env;
		this.hrtime = impl.hrtime;
		this.nextTick = impl.nextTick;
		for (const prop of [...Object.getOwnPropertyNames(Process.prototype), ...Object.getOwnPropertyNames(_EventEmitter.prototype)]) {
			const value = this[prop];
			if (typeof value === "function") {
				this[prop] = value.bind(this);
			}
		}
	}
	// --- event emitter ---
	emitWarning(warning, type, code) {
		console.warn(`${code ? `[${code}] ` : ""}${type ? `${type}: ` : ""}${warning}`);
	}
	emit(...args) {
		// @ts-ignore
		return super.emit(...args);
	}
	listeners(eventName) {
		return super.listeners(eventName);
	}
	// --- stdio (lazy initializers) ---
	#stdin;
	#stdout;
	#stderr;
	get stdin() {
		return this.#stdin ??= new ReadStream(0);
	}
	get stdout() {
		return this.#stdout ??= new WriteStream(1);
	}
	get stderr() {
		return this.#stderr ??= new WriteStream(2);
	}
	// --- cwd ---
	#cwd = "/";
	chdir(cwd) {
		this.#cwd = cwd;
	}
	cwd() {
		return this.#cwd;
	}
	// --- dummy props and getters ---
	arch = "";
	platform = "";
	argv = [];
	argv0 = "";
	execArgv = [];
	execPath = "";
	title = "";
	pid = 200;
	ppid = 100;
	get version() {
		return `v${NODE_VERSION}`;
	}
	get versions() {
		return { node: NODE_VERSION };
	}
	get allowedNodeEnvironmentFlags() {
		return new Set();
	}
	get sourceMapsEnabled() {
		return false;
	}
	get debugPort() {
		return 0;
	}
	get throwDeprecation() {
		return false;
	}
	get traceDeprecation() {
		return false;
	}
	get features() {
		return {};
	}
	get release() {
		return {};
	}
	get connected() {
		return false;
	}
	get config() {
		return {};
	}
	get moduleLoadList() {
		return [];
	}
	constrainedMemory() {
		return 0;
	}
	availableMemory() {
		return 0;
	}
	uptime() {
		return 0;
	}
	resourceUsage() {
		return {};
	}
	// --- noop methods ---
	ref() {
		// noop
	}
	unref() {
		// noop
	}
	// --- unimplemented methods ---
	umask() {
		throw createNotImplementedError("process.umask");
	}
	getBuiltinModule() {
		return undefined;
	}
	getActiveResourcesInfo() {
		throw createNotImplementedError("process.getActiveResourcesInfo");
	}
	exit() {
		throw createNotImplementedError("process.exit");
	}
	reallyExit() {
		throw createNotImplementedError("process.reallyExit");
	}
	kill() {
		throw createNotImplementedError("process.kill");
	}
	abort() {
		throw createNotImplementedError("process.abort");
	}
	dlopen() {
		throw createNotImplementedError("process.dlopen");
	}
	setSourceMapsEnabled() {
		throw createNotImplementedError("process.setSourceMapsEnabled");
	}
	loadEnvFile() {
		throw createNotImplementedError("process.loadEnvFile");
	}
	disconnect() {
		throw createNotImplementedError("process.disconnect");
	}
	cpuUsage() {
		throw createNotImplementedError("process.cpuUsage");
	}
	setUncaughtExceptionCaptureCallback() {
		throw createNotImplementedError("process.setUncaughtExceptionCaptureCallback");
	}
	hasUncaughtExceptionCaptureCallback() {
		throw createNotImplementedError("process.hasUncaughtExceptionCaptureCallback");
	}
	initgroups() {
		throw createNotImplementedError("process.initgroups");
	}
	openStdin() {
		throw createNotImplementedError("process.openStdin");
	}
	assert() {
		throw createNotImplementedError("process.assert");
	}
	binding() {
		throw createNotImplementedError("process.binding");
	}
	// --- attached interfaces ---
	permission = { has: /* @__PURE__ */ notImplemented("process.permission.has") };
	report = {
		directory: "",
		filename: "",
		signal: "SIGUSR2",
		compact: false,
		reportOnFatalError: false,
		reportOnSignal: false,
		reportOnUncaughtException: false,
		getReport: /* @__PURE__ */ notImplemented("process.report.getReport"),
		writeReport: /* @__PURE__ */ notImplemented("process.report.writeReport")
	};
	finalization = {
		register: /* @__PURE__ */ notImplemented("process.finalization.register"),
		unregister: /* @__PURE__ */ notImplemented("process.finalization.unregister"),
		registerBeforeExit: /* @__PURE__ */ notImplemented("process.finalization.registerBeforeExit")
	};
	memoryUsage = Object.assign(() => ({
		arrayBuffers: 0,
		rss: 0,
		external: 0,
		heapTotal: 0,
		heapUsed: 0
	}), { rss: () => 0 });
	// --- undefined props ---
	mainModule = undefined;
	domain = undefined;
	// optional
	send = undefined;
	exitCode = undefined;
	channel = undefined;
	getegid = undefined;
	geteuid = undefined;
	getgid = undefined;
	getgroups = undefined;
	getuid = undefined;
	setegid = undefined;
	seteuid = undefined;
	setgid = undefined;
	setgroups = undefined;
	setuid = undefined;
	// internals
	_events = undefined;
	_eventsCount = undefined;
	_exiting = undefined;
	_maxListeners = undefined;
	_debugEnd = undefined;
	_debugProcess = undefined;
	_fatalException = undefined;
	_getActiveHandles = undefined;
	_getActiveRequests = undefined;
	_kill = undefined;
	_preload_modules = undefined;
	_rawDebug = undefined;
	_startProfilerIdleNotifier = undefined;
	_stopProfilerIdleNotifier = undefined;
	_tickCallback = undefined;
	_disconnect = undefined;
	_handleQueue = undefined;
	_pendingMessage = undefined;
	_channel = undefined;
	_send = undefined;
	_linkedBinding = undefined;
}

const _envShim = Object.create(null);
// Keep a reference to the original process to avoid circular references after polyfilling
const originalProcess$1 = globalThis["process"];
const _getEnv = (useShim) => globalThis.__env__ || originalProcess$1?.env || (useShim ? _envShim : globalThis);
const env$1 = /* @__PURE__ */ new Proxy(_envShim, {
	get(_, prop) {
		const env = _getEnv();
		return env[prop] ?? _envShim[prop];
	},
	has(_, prop) {
		const env = _getEnv();
		return prop in env || prop in _envShim;
	},
	set(_, prop, value) {
		const env = _getEnv(true);
		env[prop] = value;
		return true;
	},
	deleteProperty(_, prop) {
		const env = _getEnv(true);
		delete env[prop];
		return true;
	},
	ownKeys() {
		const env = _getEnv();
		return Object.keys(env);
	},
	getOwnPropertyDescriptor(_, prop) {
		const env = _getEnv();
		if (prop in env) {
			return {
				value: env[prop],
				writable: true,
				enumerable: true,
				configurable: true
			};
		}
		return undefined;
	}
});

// https://nodejs.org/api/process.html#processhrtime
const hrtime$1 = /* @__PURE__ */ Object.assign(function hrtime(startTime) {
	const now = Date.now();
	// millis to seconds
	const seconds = Math.trunc(now / 1e3);
	// convert millis to nanos
	const nanos = now % 1e3 * 1e6;
	if (startTime) {
		let diffSeconds = seconds - startTime[0];
		let diffNanos = nanos - startTime[0];
		if (diffNanos < 0) {
			diffSeconds = diffSeconds - 1;
			diffNanos = 1e9 + diffNanos;
		}
		return [diffSeconds, diffNanos];
	}
	return [seconds, nanos];
}, { bigint: function bigint() {
	// Convert milliseconds to nanoseconds
	return BigInt(Date.now() * 1e6);
} });

// https://developer.mozilla.org/en-US/docs/Web/API/queueMicrotask
// https://nodejs.org/api/process.html#when-to-use-queuemicrotask-vs-processnexttick
const nextTick$1 = globalThis.queueMicrotask ? (cb, ...args) => {
	globalThis.queueMicrotask(cb.bind(undefined, ...args));
} : /* @__PURE__ */ createNextTickWithTimeout();
// Fallback for runtimes not implementing queueMicrotask
function createNextTickWithTimeout() {
	let queue = [];
	let draining = false;
	let currentQueue;
	let queueIndex = -1;
	function cleanUpNextTick() {
		if (!draining || !currentQueue) {
			return;
		}
		draining = false;
		if (currentQueue.length > 0) {
			queue = [...currentQueue, ...queue];
		} else {
			queueIndex = -1;
		}
		if (queue.length > 0) {
			drainQueue();
		}
	}
	function drainQueue() {
		if (draining) {
			return;
		}
		const timeout = setTimeout(cleanUpNextTick);
		draining = true;
		let len = queue.length;
		while (len) {
			currentQueue = queue;
			queue = [];
			while (++queueIndex < len) {
				if (currentQueue) {
					currentQueue[queueIndex]();
				}
			}
			queueIndex = -1;
			len = queue.length;
		}
		currentQueue = undefined;
		draining = false;
		clearTimeout(timeout);
	}
	const nextTick = (cb, ...args) => {
		queue.push(cb.bind(undefined, ...args));
		if (queue.length === 1 && !draining) {
			setTimeout(drainQueue);
		}
	};
	return nextTick;
}

// https://nodejs.org/api/process.html
const unenvProcess = new Process({
	env: env$1,
	hrtime: hrtime$1,
	nextTick: nextTick$1
});
const { abort, addListener, allowedNodeEnvironmentFlags, hasUncaughtExceptionCaptureCallback, setUncaughtExceptionCaptureCallback, loadEnvFile, sourceMapsEnabled, arch, argv, argv0, chdir, config: config$1, connected, constrainedMemory, availableMemory, cpuUsage, cwd, debugPort, dlopen, disconnect, emit, emitWarning, env, eventNames, execArgv, execPath, exit, finalization, features, getBuiltinModule, getActiveResourcesInfo, getMaxListeners, hrtime, kill, listeners, listenerCount, memoryUsage, nextTick, on, off, once, pid, platform, ppid, prependListener, prependOnceListener, rawListeners, release, removeAllListeners, removeListener, report, resourceUsage, setMaxListeners, setSourceMapsEnabled, stderr, stdin, stdout, title, umask, uptime, version, versions, domain, initgroups, moduleLoadList, reallyExit, openStdin, assert, binding, send: send$1, exitCode, channel, getegid, geteuid, getgid, getgroups, getuid, setegid, seteuid, setgid, setgroups, setuid, permission, mainModule, ref, unref, _events, _eventsCount, _exiting, _maxListeners, _debugEnd, _debugProcess, _fatalException, _getActiveHandles, _getActiveRequests, _kill, _preload_modules, _rawDebug, _startProfilerIdleNotifier, _stopProfilerIdleNotifier, _tickCallback, _disconnect, _handleQueue, _pendingMessage, _channel, _send, _linkedBinding } = unenvProcess;

// Keep a reference to the original process to avoid circular references after polyfilling
const originalProcess = globalThis["process"];
globalThis.process = originalProcess ? new Proxy(originalProcess, { get(target, prop, receiver) {
	if (Reflect.has(target, prop)) {
		return Reflect.get(target, prop, receiver);
	}
	return Reflect.get(unenvProcess, prop, receiver);
} }) : unenvProcess;

if (!globalThis.Buffer) {
	globalThis.Buffer = Buffer;
}

const noop = Object.assign(() => {}, { __unenv__: true });

class Timeout {
	constructor(callback, args) {
		if (typeof callback === "function") {
			callback(...args);
		}
	}
	close() {
		throw createNotImplementedError("node.timers.timeout.close");
	}
	_onTimeout(...args) {
		throw createNotImplementedError("node.timers.timeout._onTimeout");
	}
	ref() {
		return this;
	}
	unref() {
		return this;
	}
	hasRef() {
		return false;
	}
	refresh() {
		return this;
	}
	[Symbol.dispose]() {}
	[Symbol.toPrimitive]() {
		return 0;
	}
}

function setTimeoutFallbackPromises(delay, value, options) {
	return new Promise((res) => {
		// NOTE: we are ignoring options?.signal? as promise is immediately resolved
		res(value);
	});
}
function setTimeoutFallback(callback, ms, ...args) {
	return new Timeout(callback, args);
}
setTimeoutFallback.__promisify__ = setTimeoutFallbackPromises;

class Immediate {
	_onImmediate;
	_timeout;
	constructor(callback, args) {
		this._onImmediate = callback;
		if ("setTimeout" in globalThis) {
			this._timeout = setTimeout(callback, 0, ...args);
		} else {
			callback(...args);
		}
	}
	ref() {
		this._timeout?.ref();
		return this;
	}
	unref() {
		this._timeout?.unref();
		return this;
	}
	hasRef() {
		return this._timeout?.hasRef() ?? false;
	}
	[Symbol.dispose]() {
		if ("clearTimeout" in globalThis) {
			clearTimeout(this._timeout);
		}
	}
}

function setImmediateFallbackPromises(value) {
	return new Promise((res) => {
		res(value);
	});
}
function setImmediateFallback(callback, ...args) {
	return new Immediate(callback, args);
}
setImmediateFallback.__promisify__ = setImmediateFallbackPromises;
function clearImmediateFallback(immediate) {
	immediate?.[Symbol.dispose]();
}

async function* setIntervalFallbackPromises(delay, value) {
	yield value;
}
function setIntervalFallback(callback, ms, ...args) {
	return new Timeout(callback, args);
}
setIntervalFallback.__promisify__ = setIntervalFallbackPromises;

const clearImmediate = globalThis.clearImmediate?.bind(globalThis) || clearImmediateFallback;
globalThis.clearInterval?.bind(globalThis) || noop;
globalThis.clearTimeout?.bind(globalThis) || noop;
const setImmediate = globalThis.setImmediate?.bind(globalThis) || setImmediateFallback;
globalThis.setTimeout?.bind(globalThis) || setTimeoutFallback;
globalThis.setInterval?.bind(globalThis) || setIntervalFallback;

if (!globalThis.setImmediate) {
	globalThis.setImmediate = setImmediate;
}
if (!globalThis.clearImmediate) {
	globalThis.clearImmediate = clearImmediate;
}

const suspectProtoRx = /"(?:_|\\u0{2}5[Ff]){2}(?:p|\\u0{2}70)(?:r|\\u0{2}72)(?:o|\\u0{2}6[Ff])(?:t|\\u0{2}74)(?:o|\\u0{2}6[Ff])(?:_|\\u0{2}5[Ff]){2}"\s*:/;
const suspectConstructorRx = /"(?:c|\\u0063)(?:o|\\u006[Ff])(?:n|\\u006[Ee])(?:s|\\u0073)(?:t|\\u0074)(?:r|\\u0072)(?:u|\\u0075)(?:c|\\u0063)(?:t|\\u0074)(?:o|\\u006[Ff])(?:r|\\u0072)"\s*:/;
const JsonSigRx = /^\s*["[{]|^\s*-?\d{1,16}(\.\d{1,17})?([Ee][+-]?\d+)?\s*$/;
function jsonParseTransform(key, value) {
  if (key === "__proto__" || key === "constructor" && value && typeof value === "object" && "prototype" in value) {
    warnKeyDropped(key);
    return;
  }
  return value;
}
function warnKeyDropped(key) {
  console.warn(`[destr] Dropping "${key}" key to prevent prototype pollution.`);
}
function destr(value, options = {}) {
  if (typeof value !== "string") {
    return value;
  }
  if (value[0] === '"' && value[value.length - 1] === '"' && value.indexOf("\\") === -1) {
    return value.slice(1, -1);
  }
  const _value = value.trim();
  if (_value.length <= 9) {
    switch (_value.toLowerCase()) {
      case "true": {
        return true;
      }
      case "false": {
        return false;
      }
      case "undefined": {
        return void 0;
      }
      case "null": {
        return null;
      }
      case "nan": {
        return Number.NaN;
      }
      case "infinity": {
        return Number.POSITIVE_INFINITY;
      }
      case "-infinity": {
        return Number.NEGATIVE_INFINITY;
      }
    }
  }
  if (!JsonSigRx.test(value)) {
    if (options.strict) {
      throw new SyntaxError("[destr] Invalid JSON");
    }
    return value;
  }
  try {
    if (suspectProtoRx.test(value) || suspectConstructorRx.test(value)) {
      if (options.strict) {
        throw new Error("[destr] Possible prototype pollution");
      }
      return JSON.parse(value, jsonParseTransform);
    }
    return JSON.parse(value);
  } catch (error) {
    if (options.strict) {
      throw error;
    }
    return value;
  }
}

const HASH_RE = /#/g;
const AMPERSAND_RE = /&/g;
const SLASH_RE = /\//g;
const EQUAL_RE = /=/g;
const PLUS_RE = /\+/g;
const ENC_CARET_RE = /%5e/gi;
const ENC_BACKTICK_RE = /%60/gi;
const ENC_PIPE_RE = /%7c/gi;
const ENC_SPACE_RE = /%20/gi;
function encode(text) {
  return encodeURI("" + text).replace(ENC_PIPE_RE, "|");
}
function encodeQueryValue(input) {
  return encode(typeof input === "string" ? input : JSON.stringify(input)).replace(PLUS_RE, "%2B").replace(ENC_SPACE_RE, "+").replace(HASH_RE, "%23").replace(AMPERSAND_RE, "%26").replace(ENC_BACKTICK_RE, "`").replace(ENC_CARET_RE, "^").replace(SLASH_RE, "%2F");
}
function encodeQueryKey(text) {
  return encodeQueryValue(text).replace(EQUAL_RE, "%3D");
}
function decode(text = "") {
  try {
    return decodeURIComponent("" + text);
  } catch {
    return "" + text;
  }
}
function decodeQueryKey(text) {
  return decode(text.replace(PLUS_RE, " "));
}
function decodeQueryValue(text) {
  return decode(text.replace(PLUS_RE, " "));
}

function parseQuery(parametersString = "") {
  const object = /* @__PURE__ */ Object.create(null);
  if (parametersString[0] === "?") {
    parametersString = parametersString.slice(1);
  }
  for (const parameter of parametersString.split("&")) {
    const s = parameter.match(/([^=]+)=?(.*)/) || [];
    if (s.length < 2) {
      continue;
    }
    const key = decodeQueryKey(s[1]);
    if (key === "__proto__" || key === "constructor") {
      continue;
    }
    const value = decodeQueryValue(s[2] || "");
    if (object[key] === void 0) {
      object[key] = value;
    } else if (Array.isArray(object[key])) {
      object[key].push(value);
    } else {
      object[key] = [object[key], value];
    }
  }
  return object;
}
function encodeQueryItem(key, value) {
  if (typeof value === "number" || typeof value === "boolean") {
    value = String(value);
  }
  if (!value) {
    return encodeQueryKey(key);
  }
  if (Array.isArray(value)) {
    return value.map(
      (_value) => `${encodeQueryKey(key)}=${encodeQueryValue(_value)}`
    ).join("&");
  }
  return `${encodeQueryKey(key)}=${encodeQueryValue(value)}`;
}
function stringifyQuery(query) {
  return Object.keys(query).filter((k) => query[k] !== void 0).map((k) => encodeQueryItem(k, query[k])).filter(Boolean).join("&");
}

const PROTOCOL_STRICT_REGEX = /^[\s\w\0+.-]{2,}:([/\\]{1,2})/;
const PROTOCOL_REGEX = /^[\s\w\0+.-]{2,}:([/\\]{2})?/;
const PROTOCOL_RELATIVE_REGEX = /^([/\\]\s*){2,}[^/\\]/;
const PROTOCOL_SCRIPT_RE = /^[\s\0]*(blob|data|javascript|vbscript):$/i;
const TRAILING_SLASH_RE = /\/$|\/\?|\/#/;
const JOIN_LEADING_SLASH_RE = /^\.?\//;
function hasProtocol(inputString, opts = {}) {
  if (typeof opts === "boolean") {
    opts = { acceptRelative: opts };
  }
  if (opts.strict) {
    return PROTOCOL_STRICT_REGEX.test(inputString);
  }
  return PROTOCOL_REGEX.test(inputString) || (opts.acceptRelative ? PROTOCOL_RELATIVE_REGEX.test(inputString) : false);
}
function isScriptProtocol(protocol) {
  return !!protocol && PROTOCOL_SCRIPT_RE.test(protocol);
}
function hasTrailingSlash(input = "", respectQueryAndFragment) {
  if (!respectQueryAndFragment) {
    return input.endsWith("/");
  }
  return TRAILING_SLASH_RE.test(input);
}
function withoutTrailingSlash(input = "", respectQueryAndFragment) {
  if (!respectQueryAndFragment) {
    return (hasTrailingSlash(input) ? input.slice(0, -1) : input) || "/";
  }
  if (!hasTrailingSlash(input, true)) {
    return input || "/";
  }
  let path = input;
  let fragment = "";
  const fragmentIndex = input.indexOf("#");
  if (fragmentIndex !== -1) {
    path = input.slice(0, fragmentIndex);
    fragment = input.slice(fragmentIndex);
  }
  const [s0, ...s] = path.split("?");
  const cleanPath = s0.endsWith("/") ? s0.slice(0, -1) : s0;
  return (cleanPath || "/") + (s.length > 0 ? `?${s.join("?")}` : "") + fragment;
}
function withTrailingSlash(input = "", respectQueryAndFragment) {
  if (!respectQueryAndFragment) {
    return input.endsWith("/") ? input : input + "/";
  }
  if (hasTrailingSlash(input, true)) {
    return input || "/";
  }
  let path = input;
  let fragment = "";
  const fragmentIndex = input.indexOf("#");
  if (fragmentIndex !== -1) {
    path = input.slice(0, fragmentIndex);
    fragment = input.slice(fragmentIndex);
    if (!path) {
      return fragment;
    }
  }
  const [s0, ...s] = path.split("?");
  return s0 + "/" + (s.length > 0 ? `?${s.join("?")}` : "") + fragment;
}
function hasLeadingSlash(input = "") {
  return input.startsWith("/");
}
function withLeadingSlash(input = "") {
  return hasLeadingSlash(input) ? input : "/" + input;
}
function withBase(input, base) {
  if (isEmptyURL(base) || hasProtocol(input)) {
    return input;
  }
  const _base = withoutTrailingSlash(base);
  if (input.startsWith(_base)) {
    return input;
  }
  return joinURL(_base, input);
}
function withoutBase(input, base) {
  if (isEmptyURL(base)) {
    return input;
  }
  const _base = withoutTrailingSlash(base);
  if (!input.startsWith(_base)) {
    return input;
  }
  const trimmed = input.slice(_base.length);
  return trimmed[0] === "/" ? trimmed : "/" + trimmed;
}
function withQuery(input, query) {
  const parsed = parseURL(input);
  const mergedQuery = { ...parseQuery(parsed.search), ...query };
  parsed.search = stringifyQuery(mergedQuery);
  return stringifyParsedURL(parsed);
}
function getQuery$1(input) {
  return parseQuery(parseURL(input).search);
}
function isEmptyURL(url) {
  return !url || url === "/";
}
function isNonEmptyURL(url) {
  return url && url !== "/";
}
function joinURL(base, ...input) {
  let url = base || "";
  for (const segment of input.filter((url2) => isNonEmptyURL(url2))) {
    if (url) {
      const _segment = segment.replace(JOIN_LEADING_SLASH_RE, "");
      url = withTrailingSlash(url) + _segment;
    } else {
      url = segment;
    }
  }
  return url;
}
function joinRelativeURL(..._input) {
  const JOIN_SEGMENT_SPLIT_RE = /\/(?!\/)/;
  const input = _input.filter(Boolean);
  const segments = [];
  let segmentsDepth = 0;
  for (const i of input) {
    if (!i || i === "/") {
      continue;
    }
    for (const [sindex, s] of i.split(JOIN_SEGMENT_SPLIT_RE).entries()) {
      if (!s || s === ".") {
        continue;
      }
      if (s === "..") {
        if (segments.length === 1 && hasProtocol(segments[0])) {
          continue;
        }
        segments.pop();
        segmentsDepth--;
        continue;
      }
      if (sindex === 1 && segments[segments.length - 1]?.endsWith(":/")) {
        segments[segments.length - 1] += "/" + s;
        continue;
      }
      segments.push(s);
      segmentsDepth++;
    }
  }
  let url = segments.join("/");
  if (segmentsDepth >= 0) {
    if (input[0]?.startsWith("/") && !url.startsWith("/")) {
      url = "/" + url;
    } else if (input[0]?.startsWith("./") && !url.startsWith("./")) {
      url = "./" + url;
    }
  } else {
    url = "../".repeat(-1 * segmentsDepth) + url;
  }
  if (input[input.length - 1]?.endsWith("/") && !url.endsWith("/")) {
    url += "/";
  }
  return url;
}

const protocolRelative = Symbol.for("ufo:protocolRelative");
function parseURL(input = "", defaultProto) {
  const _specialProtoMatch = input.match(
    /^[\s\0]*(blob:|data:|javascript:|vbscript:)(.*)/i
  );
  if (_specialProtoMatch) {
    const [, _proto, _pathname = ""] = _specialProtoMatch;
    return {
      protocol: _proto.toLowerCase(),
      pathname: _pathname,
      href: _proto + _pathname,
      auth: "",
      host: "",
      search: "",
      hash: ""
    };
  }
  if (!hasProtocol(input, { acceptRelative: true })) {
    return parsePath(input);
  }
  const [, protocol = "", auth, hostAndPath = ""] = input.replace(/\\/g, "/").match(/^[\s\0]*([\w+.-]{2,}:)?\/\/([^/@]+@)?(.*)/) || [];
  let [, host = "", path = ""] = hostAndPath.match(/([^#/?]*)(.*)?/) || [];
  if (protocol === "file:") {
    path = path.replace(/\/(?=[A-Za-z]:)/, "");
  }
  const { pathname, search, hash } = parsePath(path);
  return {
    protocol: protocol.toLowerCase(),
    auth: auth ? auth.slice(0, Math.max(0, auth.length - 1)) : "",
    host,
    pathname,
    search,
    hash,
    [protocolRelative]: !protocol
  };
}
function parsePath(input = "") {
  const [pathname = "", search = "", hash = ""] = (input.match(/([^#?]*)(\?[^#]*)?(#.*)?/) || []).splice(1);
  return {
    pathname,
    search,
    hash
  };
}
function stringifyParsedURL(parsed) {
  const pathname = parsed.pathname || "";
  const search = parsed.search ? (parsed.search.startsWith("?") ? "" : "?") + parsed.search : "";
  const hash = parsed.hash || "";
  const auth = parsed.auth ? parsed.auth + "@" : "";
  const host = parsed.host || "";
  const proto = parsed.protocol || parsed[protocolRelative] ? (parsed.protocol || "") + "//" : "";
  return proto + auth + host + pathname + search + hash;
}

const NODE_TYPES = {
  NORMAL: 0,
  WILDCARD: 1,
  PLACEHOLDER: 2
};

function createRouter$1(options = {}) {
  const ctx = {
    options,
    rootNode: createRadixNode(),
    staticRoutesMap: {}
  };
  const normalizeTrailingSlash = (p) => options.strictTrailingSlash ? p : p.replace(/\/$/, "") || "/";
  if (options.routes) {
    for (const path in options.routes) {
      insert(ctx, normalizeTrailingSlash(path), options.routes[path]);
    }
  }
  return {
    ctx,
    lookup: (path) => lookup(ctx, normalizeTrailingSlash(path)),
    insert: (path, data) => insert(ctx, normalizeTrailingSlash(path), data),
    remove: (path) => remove(ctx, normalizeTrailingSlash(path))
  };
}
function lookup(ctx, path) {
  const staticPathNode = ctx.staticRoutesMap[path];
  if (staticPathNode) {
    return staticPathNode.data;
  }
  const sections = path.split("/");
  const params = {};
  let paramsFound = false;
  let wildcardNode = null;
  let node = ctx.rootNode;
  let wildCardParam = null;
  for (let i = 0; i < sections.length; i++) {
    const section = sections[i];
    if (node.wildcardChildNode !== null) {
      wildcardNode = node.wildcardChildNode;
      wildCardParam = sections.slice(i).join("/");
    }
    const nextNode = node.children.get(section);
    if (nextNode === void 0) {
      if (node && node.placeholderChildren.length > 1) {
        const remaining = sections.length - i;
        node = node.placeholderChildren.find((c) => c.maxDepth === remaining) || null;
      } else {
        node = node.placeholderChildren[0] || null;
      }
      if (!node) {
        break;
      }
      if (node.paramName) {
        params[node.paramName] = section;
      }
      paramsFound = true;
    } else {
      node = nextNode;
    }
  }
  if ((node === null || node.data === null) && wildcardNode !== null) {
    node = wildcardNode;
    params[node.paramName || "_"] = wildCardParam;
    paramsFound = true;
  }
  if (!node) {
    return null;
  }
  if (paramsFound) {
    return {
      ...node.data,
      params: paramsFound ? params : void 0
    };
  }
  return node.data;
}
function insert(ctx, path, data) {
  let isStaticRoute = true;
  const sections = path.split("/");
  let node = ctx.rootNode;
  let _unnamedPlaceholderCtr = 0;
  const matchedNodes = [node];
  for (const section of sections) {
    let childNode;
    if (childNode = node.children.get(section)) {
      node = childNode;
    } else {
      const type = getNodeType(section);
      childNode = createRadixNode({ type, parent: node });
      node.children.set(section, childNode);
      if (type === NODE_TYPES.PLACEHOLDER) {
        childNode.paramName = section === "*" ? `_${_unnamedPlaceholderCtr++}` : section.slice(1);
        node.placeholderChildren.push(childNode);
        isStaticRoute = false;
      } else if (type === NODE_TYPES.WILDCARD) {
        node.wildcardChildNode = childNode;
        childNode.paramName = section.slice(
          3
          /* "**:" */
        ) || "_";
        isStaticRoute = false;
      }
      matchedNodes.push(childNode);
      node = childNode;
    }
  }
  for (const [depth, node2] of matchedNodes.entries()) {
    node2.maxDepth = Math.max(matchedNodes.length - depth, node2.maxDepth || 0);
  }
  node.data = data;
  if (isStaticRoute === true) {
    ctx.staticRoutesMap[path] = node;
  }
  return node;
}
function remove(ctx, path) {
  let success = false;
  const sections = path.split("/");
  let node = ctx.rootNode;
  for (const section of sections) {
    node = node.children.get(section);
    if (!node) {
      return success;
    }
  }
  if (node.data) {
    const lastSection = sections.at(-1) || "";
    node.data = null;
    if (Object.keys(node.children).length === 0 && node.parent) {
      node.parent.children.delete(lastSection);
      node.parent.wildcardChildNode = null;
      node.parent.placeholderChildren = [];
    }
    success = true;
  }
  return success;
}
function createRadixNode(options = {}) {
  return {
    type: options.type || NODE_TYPES.NORMAL,
    maxDepth: 0,
    parent: options.parent || null,
    children: /* @__PURE__ */ new Map(),
    data: options.data || null,
    paramName: options.paramName || null,
    wildcardChildNode: null,
    placeholderChildren: []
  };
}
function getNodeType(str) {
  if (str.startsWith("**")) {
    return NODE_TYPES.WILDCARD;
  }
  if (str[0] === ":" || str === "*") {
    return NODE_TYPES.PLACEHOLDER;
  }
  return NODE_TYPES.NORMAL;
}

function toRouteMatcher(router) {
  const table = _routerNodeToTable("", router.ctx.rootNode);
  return _createMatcher(table, router.ctx.options.strictTrailingSlash);
}
function _createMatcher(table, strictTrailingSlash) {
  return {
    ctx: { table },
    matchAll: (path) => _matchRoutes(path, table, strictTrailingSlash)
  };
}
function _createRouteTable() {
  return {
    static: /* @__PURE__ */ new Map(),
    wildcard: /* @__PURE__ */ new Map(),
    dynamic: /* @__PURE__ */ new Map()
  };
}
function _matchRoutes(path, table, strictTrailingSlash) {
  if (strictTrailingSlash !== true && path.endsWith("/")) {
    path = path.slice(0, -1) || "/";
  }
  const matches = [];
  for (const [key, value] of _sortRoutesMap(table.wildcard)) {
    if (path === key || path.startsWith(key + "/")) {
      matches.push(value);
    }
  }
  for (const [key, value] of _sortRoutesMap(table.dynamic)) {
    if (path.startsWith(key + "/")) {
      const subPath = "/" + path.slice(key.length).split("/").splice(2).join("/");
      matches.push(..._matchRoutes(subPath, value));
    }
  }
  const staticMatch = table.static.get(path);
  if (staticMatch) {
    matches.push(staticMatch);
  }
  return matches.filter(Boolean);
}
function _sortRoutesMap(m) {
  return [...m.entries()].sort((a, b) => a[0].length - b[0].length);
}
function _routerNodeToTable(initialPath, initialNode) {
  const table = _createRouteTable();
  function _addNode(path, node) {
    if (path) {
      if (node.type === NODE_TYPES.NORMAL && !(path.includes("*") || path.includes(":"))) {
        if (node.data) {
          table.static.set(path, node.data);
        }
      } else if (node.type === NODE_TYPES.WILDCARD) {
        table.wildcard.set(path.replace("/**", ""), node.data);
      } else if (node.type === NODE_TYPES.PLACEHOLDER) {
        const subTable = _routerNodeToTable("", node);
        if (node.data) {
          subTable.static.set("/", node.data);
        }
        table.dynamic.set(path.replace(/\/\*|\/:\w+/, ""), subTable);
        return;
      }
    }
    for (const [childPath, child] of node.children.entries()) {
      _addNode(`${path}/${childPath}`.replace("//", "/"), child);
    }
  }
  _addNode(initialPath, initialNode);
  return table;
}

function isPlainObject(value) {
  if (value === null || typeof value !== "object") {
    return false;
  }
  const prototype = Object.getPrototypeOf(value);
  if (prototype !== null && prototype !== Object.prototype && Object.getPrototypeOf(prototype) !== null) {
    return false;
  }
  if (Symbol.iterator in value) {
    return false;
  }
  if (Symbol.toStringTag in value) {
    return Object.prototype.toString.call(value) === "[object Module]";
  }
  return true;
}

function _defu(baseObject, defaults, namespace = ".", merger) {
  if (!isPlainObject(defaults)) {
    return _defu(baseObject, {}, namespace, merger);
  }
  const object = Object.assign({}, defaults);
  for (const key in baseObject) {
    if (key === "__proto__" || key === "constructor") {
      continue;
    }
    const value = baseObject[key];
    if (value === null || value === void 0) {
      continue;
    }
    if (merger && merger(object, key, value, namespace)) {
      continue;
    }
    if (Array.isArray(value) && Array.isArray(object[key])) {
      object[key] = [...value, ...object[key]];
    } else if (isPlainObject(value) && isPlainObject(object[key])) {
      object[key] = _defu(
        value,
        object[key],
        (namespace ? `${namespace}.` : "") + key.toString(),
        merger
      );
    } else {
      object[key] = value;
    }
  }
  return object;
}
function createDefu(merger) {
  return (...arguments_) => (
    // eslint-disable-next-line unicorn/no-array-reduce
    arguments_.reduce((p, c) => _defu(p, c, "", merger), {})
  );
}
const defu = createDefu();
const defuFn = createDefu((object, key, currentValue) => {
  if (object[key] !== void 0 && typeof currentValue === "function") {
    object[key] = currentValue(object[key]);
    return true;
  }
});

function o(n){throw new Error(`${n} is not implemented yet!`)}class i extends _EventEmitter{__unenv__={};readableEncoding=null;readableEnded=true;readableFlowing=false;readableHighWaterMark=0;readableLength=0;readableObjectMode=false;readableAborted=false;readableDidRead=false;closed=false;errored=null;readable=false;destroyed=false;static from(e,t){return new i(t)}constructor(e){super();}_read(e){}read(e){}setEncoding(e){return this}pause(){return this}resume(){return this}isPaused(){return  true}unpipe(e){return this}unshift(e,t){}wrap(e){return this}push(e,t){return  false}_destroy(e,t){this.removeAllListeners();}destroy(e){return this.destroyed=true,this._destroy(e),this}pipe(e,t){return {}}compose(e,t){throw new Error("Method not implemented.")}[Symbol.asyncDispose](){return this.destroy(),Promise.resolve()}async*[Symbol.asyncIterator](){throw o("Readable.asyncIterator")}iterator(e){throw o("Readable.iterator")}map(e,t){throw o("Readable.map")}filter(e,t){throw o("Readable.filter")}forEach(e,t){throw o("Readable.forEach")}reduce(e,t,r){throw o("Readable.reduce")}find(e,t){throw o("Readable.find")}findIndex(e,t){throw o("Readable.findIndex")}some(e,t){throw o("Readable.some")}toArray(e){throw o("Readable.toArray")}every(e,t){throw o("Readable.every")}flatMap(e,t){throw o("Readable.flatMap")}drop(e,t){throw o("Readable.drop")}take(e,t){throw o("Readable.take")}asIndexedPairs(e){throw o("Readable.asIndexedPairs")}}let l$1 = class l extends _EventEmitter{__unenv__={};writable=true;writableEnded=false;writableFinished=false;writableHighWaterMark=0;writableLength=0;writableObjectMode=false;writableCorked=0;closed=false;errored=null;writableNeedDrain=false;writableAborted=false;destroyed=false;_data;_encoding="utf8";constructor(e){super();}pipe(e,t){return {}}_write(e,t,r){if(this.writableEnded){r&&r();return}if(this._data===void 0)this._data=e;else {const s=typeof this._data=="string"?Buffer.from(this._data,this._encoding||t||"utf8"):this._data,a=typeof e=="string"?Buffer.from(e,t||this._encoding||"utf8"):e;this._data=Buffer.concat([s,a]);}this._encoding=t,r&&r();}_writev(e,t){}_destroy(e,t){}_final(e){}write(e,t,r){const s=typeof t=="string"?this._encoding:"utf8",a=typeof t=="function"?t:typeof r=="function"?r:void 0;return this._write(e,s,a),true}setDefaultEncoding(e){return this}end(e,t,r){const s=typeof e=="function"?e:typeof t=="function"?t:typeof r=="function"?r:void 0;if(this.writableEnded)return s&&s(),this;const a=e===s?void 0:e;if(a){const u=t===s?void 0:t;this.write(a,u,s);}return this.writableEnded=true,this.writableFinished=true,this.emit("close"),this.emit("finish"),this}cork(){}uncork(){}destroy(e){return this.destroyed=true,delete this._data,this.removeAllListeners(),this}compose(e,t){throw new Error("Method not implemented.")}[Symbol.asyncDispose](){return Promise.resolve()}};const c$1=class c{allowHalfOpen=true;_destroy;constructor(e=new i,t=new l$1){Object.assign(this,e),Object.assign(this,t),this._destroy=m(e._destroy,t._destroy);}};function _(){return Object.assign(c$1.prototype,i.prototype),Object.assign(c$1.prototype,l$1.prototype),c$1}function m(...n){return function(...e){for(const t of n)t(...e);}}const g=_();class A extends g{__unenv__={};bufferSize=0;bytesRead=0;bytesWritten=0;connecting=false;destroyed=false;pending=false;localAddress="";localPort=0;remoteAddress="";remoteFamily="";remotePort=0;autoSelectFamilyAttemptedAddresses=[];readyState="readOnly";constructor(e){super();}write(e,t,r){return  false}connect(e,t,r){return this}end(e,t,r){return this}setEncoding(e){return this}pause(){return this}resume(){return this}setTimeout(e,t){return this}setNoDelay(e){return this}setKeepAlive(e,t){return this}address(){return {}}unref(){return this}ref(){return this}destroySoon(){this.destroy();}resetAndDestroy(){const e=new Error("ERR_SOCKET_CLOSED");return e.code="ERR_SOCKET_CLOSED",this.destroy(e),this}}class y extends i{aborted=false;httpVersion="1.1";httpVersionMajor=1;httpVersionMinor=1;complete=true;connection;socket;headers={};trailers={};method="GET";url="/";statusCode=200;statusMessage="";closed=false;errored=null;readable=false;constructor(e){super(),this.socket=this.connection=e||new A;}get rawHeaders(){const e=this.headers,t=[];for(const r in e)if(Array.isArray(e[r]))for(const s of e[r])t.push(r,s);else t.push(r,e[r]);return t}get rawTrailers(){return []}setTimeout(e,t){return this}get headersDistinct(){return p(this.headers)}get trailersDistinct(){return p(this.trailers)}}function p(n){const e={};for(const[t,r]of Object.entries(n))t&&(e[t]=(Array.isArray(r)?r:[r]).filter(Boolean));return e}class w extends l$1{statusCode=200;statusMessage="";upgrading=false;chunkedEncoding=false;shouldKeepAlive=false;useChunkedEncodingByDefault=false;sendDate=false;finished=false;headersSent=false;strictContentLength=false;connection=null;socket=null;req;_headers={};constructor(e){super(),this.req=e;}assignSocket(e){e._httpMessage=this,this.socket=e,this.connection=e,this.emit("socket",e),this._flush();}_flush(){this.flushHeaders();}detachSocket(e){}writeContinue(e){}writeHead(e,t,r){e&&(this.statusCode=e),typeof t=="string"&&(this.statusMessage=t,t=void 0);const s=r||t;if(s&&!Array.isArray(s))for(const a in s)this.setHeader(a,s[a]);return this.headersSent=true,this}writeProcessing(){}setTimeout(e,t){return this}appendHeader(e,t){e=e.toLowerCase();const r=this._headers[e],s=[...Array.isArray(r)?r:[r],...Array.isArray(t)?t:[t]].filter(Boolean);return this._headers[e]=s.length>1?s:s[0],this}setHeader(e,t){return this._headers[e.toLowerCase()]=t,this}setHeaders(e){for(const[t,r]of Object.entries(e))this.setHeader(t,r);return this}getHeader(e){return this._headers[e.toLowerCase()]}getHeaders(){return this._headers}getHeaderNames(){return Object.keys(this._headers)}hasHeader(e){return e.toLowerCase()in this._headers}removeHeader(e){delete this._headers[e.toLowerCase()];}addTrailers(e){}flushHeaders(){}writeEarlyHints(e,t){typeof t=="function"&&t();}}const E=(()=>{const n=function(){};return n.prototype=Object.create(null),n})();function R$1(n={}){const e=new E,t=Array.isArray(n)||H(n)?n:Object.entries(n);for(const[r,s]of t)if(s){if(e[r]===void 0){e[r]=s;continue}e[r]=[...Array.isArray(e[r])?e[r]:[e[r]],...Array.isArray(s)?s:[s]];}return e}function H(n){return typeof n?.entries=="function"}function v(n={}){if(n instanceof Headers)return n;const e=new Headers;for(const[t,r]of Object.entries(n))if(r!==void 0){if(Array.isArray(r)){for(const s of r)e.append(t,String(s));continue}e.set(t,String(r));}return e}const S$1=new Set([101,204,205,304]);async function b(n,e){const t=new y,r=new w(t);t.url=e.url?.toString()||"/";let s;if(!t.url.startsWith("/")){const d=new URL(t.url);s=d.host,t.url=d.pathname+d.search+d.hash;}t.method=e.method||"GET",t.headers=R$1(e.headers||{}),t.headers.host||(t.headers.host=e.host||s||"localhost"),t.connection.encrypted=t.connection.encrypted||e.protocol==="https",t.body=e.body||null,t.__unenv__=e.context,await n(t,r);let a=r._data;(S$1.has(r.statusCode)||t.method.toUpperCase()==="HEAD")&&(a=null,delete r._headers["content-length"]);const u={status:r.statusCode,statusText:r.statusMessage,headers:r._headers,body:a};return t.destroy(),r.destroy(),u}async function C(n,e,t={}){try{const r=await b(n,{url:e,...t});return new Response(r.body,{status:r.status,statusText:r.statusText,headers:v(r.headers)})}catch(r){return new Response(r.toString(),{status:Number.parseInt(r.statusCode||r.code)||500,statusText:r.statusText})}}

function hasProp(obj, prop) {
  try {
    return prop in obj;
  } catch {
    return false;
  }
}

class H3Error extends Error {
  static __h3_error__ = true;
  statusCode = 500;
  fatal = false;
  unhandled = false;
  statusMessage;
  data;
  cause;
  constructor(message, opts = {}) {
    super(message, opts);
    if (opts.cause && !this.cause) {
      this.cause = opts.cause;
    }
  }
  toJSON() {
    const obj = {
      message: this.message,
      statusCode: sanitizeStatusCode(this.statusCode, 500)
    };
    if (this.statusMessage) {
      obj.statusMessage = sanitizeStatusMessage(this.statusMessage);
    }
    if (this.data !== void 0) {
      obj.data = this.data;
    }
    return obj;
  }
}
function createError(input) {
  if (typeof input === "string") {
    return new H3Error(input);
  }
  if (isError(input)) {
    return input;
  }
  const err = new H3Error(input.message ?? input.statusMessage ?? "", {
    cause: input.cause || input
  });
  if (hasProp(input, "stack")) {
    try {
      Object.defineProperty(err, "stack", {
        get() {
          return input.stack;
        }
      });
    } catch {
      try {
        err.stack = input.stack;
      } catch {
      }
    }
  }
  if (input.data) {
    err.data = input.data;
  }
  if (input.statusCode) {
    err.statusCode = sanitizeStatusCode(input.statusCode, err.statusCode);
  } else if (input.status) {
    err.statusCode = sanitizeStatusCode(input.status, err.statusCode);
  }
  if (input.statusMessage) {
    err.statusMessage = input.statusMessage;
  } else if (input.statusText) {
    err.statusMessage = input.statusText;
  }
  if (err.statusMessage) {
    const originalMessage = err.statusMessage;
    const sanitizedMessage = sanitizeStatusMessage(err.statusMessage);
    if (sanitizedMessage !== originalMessage) {
      console.warn(
        "[h3] Please prefer using `message` for longer error messages instead of `statusMessage`. In the future, `statusMessage` will be sanitized by default."
      );
    }
  }
  if (input.fatal !== void 0) {
    err.fatal = input.fatal;
  }
  if (input.unhandled !== void 0) {
    err.unhandled = input.unhandled;
  }
  return err;
}
function sendError(event, error, debug) {
  if (event.handled) {
    return;
  }
  const h3Error = isError(error) ? error : createError(error);
  const responseBody = {
    statusCode: h3Error.statusCode,
    statusMessage: h3Error.statusMessage,
    stack: [],
    data: h3Error.data
  };
  if (debug) {
    responseBody.stack = (h3Error.stack || "").split("\n").map((l) => l.trim());
  }
  if (event.handled) {
    return;
  }
  const _code = Number.parseInt(h3Error.statusCode);
  setResponseStatus(event, _code, h3Error.statusMessage);
  event.node.res.setHeader("content-type", MIMES.json);
  event.node.res.end(JSON.stringify(responseBody, void 0, 2));
}
function isError(input) {
  return input?.constructor?.__h3_error__ === true;
}

function getQuery(event) {
  return getQuery$1(event.path || "");
}
function isMethod(event, expected, allowHead) {
  if (typeof expected === "string") {
    if (event.method === expected) {
      return true;
    }
  } else if (expected.includes(event.method)) {
    return true;
  }
  return false;
}
function assertMethod(event, expected, allowHead) {
  if (!isMethod(event, expected)) {
    throw createError({
      statusCode: 405,
      statusMessage: "HTTP method is not allowed."
    });
  }
}
function getRequestHeaders(event) {
  const _headers = {};
  for (const key in event.node.req.headers) {
    const val = event.node.req.headers[key];
    _headers[key] = Array.isArray(val) ? val.filter(Boolean).join(", ") : val;
  }
  return _headers;
}
function getRequestHeader(event, name) {
  const headers = getRequestHeaders(event);
  const value = headers[name.toLowerCase()];
  return value;
}
function getRequestHost(event, opts = {}) {
  if (opts.xForwardedHost) {
    const _header = event.node.req.headers["x-forwarded-host"];
    const xForwardedHost = (_header || "").split(",").shift()?.trim();
    if (xForwardedHost) {
      return xForwardedHost;
    }
  }
  return event.node.req.headers.host || "localhost";
}
function getRequestProtocol(event, opts = {}) {
  if (opts.xForwardedProto !== false && event.node.req.headers["x-forwarded-proto"] === "https") {
    return "https";
  }
  return event.node.req.connection?.encrypted ? "https" : "http";
}
function getRequestURL(event, opts = {}) {
  const host = getRequestHost(event, opts);
  const protocol = getRequestProtocol(event, opts);
  const path = (event.node.req.originalUrl || event.path).replace(
    /^[/\\]+/g,
    "/"
  );
  return new URL(path, `${protocol}://${host}`);
}

const RawBodySymbol = Symbol.for("h3RawBody");
const PayloadMethods$1 = ["PATCH", "POST", "PUT", "DELETE"];
function readRawBody(event, encoding = "utf8") {
  assertMethod(event, PayloadMethods$1);
  const _rawBody = event._requestBody || event.web?.request?.body || event.node.req[RawBodySymbol] || event.node.req.rawBody || event.node.req.body;
  if (_rawBody) {
    const promise2 = Promise.resolve(_rawBody).then((_resolved) => {
      if (Buffer.isBuffer(_resolved)) {
        return _resolved;
      }
      if (typeof _resolved.pipeTo === "function") {
        return new Promise((resolve, reject) => {
          const chunks = [];
          _resolved.pipeTo(
            new WritableStream({
              write(chunk) {
                chunks.push(chunk);
              },
              close() {
                resolve(Buffer.concat(chunks));
              },
              abort(reason) {
                reject(reason);
              }
            })
          ).catch(reject);
        });
      } else if (typeof _resolved.pipe === "function") {
        return new Promise((resolve, reject) => {
          const chunks = [];
          _resolved.on("data", (chunk) => {
            chunks.push(chunk);
          }).on("end", () => {
            resolve(Buffer.concat(chunks));
          }).on("error", reject);
        });
      }
      if (_resolved.constructor === Object) {
        return Buffer.from(JSON.stringify(_resolved));
      }
      if (_resolved instanceof URLSearchParams) {
        return Buffer.from(_resolved.toString());
      }
      if (_resolved instanceof FormData) {
        return new Response(_resolved).bytes().then((uint8arr) => Buffer.from(uint8arr));
      }
      return Buffer.from(_resolved);
    });
    return encoding ? promise2.then((buff) => buff.toString(encoding)) : promise2;
  }
  if (!Number.parseInt(event.node.req.headers["content-length"] || "") && !String(event.node.req.headers["transfer-encoding"] ?? "").split(",").map((e) => e.trim()).filter(Boolean).includes("chunked")) {
    return Promise.resolve(void 0);
  }
  const promise = event.node.req[RawBodySymbol] = new Promise(
    (resolve, reject) => {
      const bodyData = [];
      event.node.req.on("error", (err) => {
        reject(err);
      }).on("data", (chunk) => {
        bodyData.push(chunk);
      }).on("end", () => {
        resolve(Buffer.concat(bodyData));
      });
    }
  );
  const result = encoding ? promise.then((buff) => buff.toString(encoding)) : promise;
  return result;
}
function getRequestWebStream(event) {
  if (!PayloadMethods$1.includes(event.method)) {
    return;
  }
  const bodyStream = event.web?.request?.body || event._requestBody;
  if (bodyStream) {
    return bodyStream;
  }
  const _hasRawBody = RawBodySymbol in event.node.req || "rawBody" in event.node.req || "body" in event.node.req || "__unenv__" in event.node.req;
  if (_hasRawBody) {
    return new ReadableStream({
      async start(controller) {
        const _rawBody = await readRawBody(event, false);
        if (_rawBody) {
          controller.enqueue(_rawBody);
        }
        controller.close();
      }
    });
  }
  return new ReadableStream({
    start: (controller) => {
      event.node.req.on("data", (chunk) => {
        controller.enqueue(chunk);
      });
      event.node.req.on("end", () => {
        controller.close();
      });
      event.node.req.on("error", (err) => {
        controller.error(err);
      });
    }
  });
}

function handleCacheHeaders(event, opts) {
  const cacheControls = ["public", ...opts.cacheControls || []];
  let cacheMatched = false;
  if (opts.maxAge !== void 0) {
    cacheControls.push(`max-age=${+opts.maxAge}`, `s-maxage=${+opts.maxAge}`);
  }
  if (opts.modifiedTime) {
    const modifiedTime = new Date(opts.modifiedTime);
    const ifModifiedSince = event.node.req.headers["if-modified-since"];
    event.node.res.setHeader("last-modified", modifiedTime.toUTCString());
    if (ifModifiedSince && new Date(ifModifiedSince) >= modifiedTime) {
      cacheMatched = true;
    }
  }
  if (opts.etag) {
    event.node.res.setHeader("etag", opts.etag);
    const ifNonMatch = event.node.req.headers["if-none-match"];
    if (ifNonMatch === opts.etag) {
      cacheMatched = true;
    }
  }
  event.node.res.setHeader("cache-control", cacheControls.join(", "));
  if (cacheMatched) {
    event.node.res.statusCode = 304;
    if (!event.handled) {
      event.node.res.end();
    }
    return true;
  }
  return false;
}

const MIMES = {
  html: "text/html",
  json: "application/json"
};

const DISALLOWED_STATUS_CHARS = /[^\u0009\u0020-\u007E]/g;
function sanitizeStatusMessage(statusMessage = "") {
  return statusMessage.replace(DISALLOWED_STATUS_CHARS, "");
}
function sanitizeStatusCode(statusCode, defaultStatusCode = 200) {
  if (!statusCode) {
    return defaultStatusCode;
  }
  if (typeof statusCode === "string") {
    statusCode = Number.parseInt(statusCode, 10);
  }
  if (statusCode < 100 || statusCode > 999) {
    return defaultStatusCode;
  }
  return statusCode;
}
function splitCookiesString(cookiesString) {
  if (Array.isArray(cookiesString)) {
    return cookiesString.flatMap((c) => splitCookiesString(c));
  }
  if (typeof cookiesString !== "string") {
    return [];
  }
  const cookiesStrings = [];
  let pos = 0;
  let start;
  let ch;
  let lastComma;
  let nextStart;
  let cookiesSeparatorFound;
  const skipWhitespace = () => {
    while (pos < cookiesString.length && /\s/.test(cookiesString.charAt(pos))) {
      pos += 1;
    }
    return pos < cookiesString.length;
  };
  const notSpecialChar = () => {
    ch = cookiesString.charAt(pos);
    return ch !== "=" && ch !== ";" && ch !== ",";
  };
  while (pos < cookiesString.length) {
    start = pos;
    cookiesSeparatorFound = false;
    while (skipWhitespace()) {
      ch = cookiesString.charAt(pos);
      if (ch === ",") {
        lastComma = pos;
        pos += 1;
        skipWhitespace();
        nextStart = pos;
        while (pos < cookiesString.length && notSpecialChar()) {
          pos += 1;
        }
        if (pos < cookiesString.length && cookiesString.charAt(pos) === "=") {
          cookiesSeparatorFound = true;
          pos = nextStart;
          cookiesStrings.push(cookiesString.slice(start, lastComma));
          start = pos;
        } else {
          pos = lastComma + 1;
        }
      } else {
        pos += 1;
      }
    }
    if (!cookiesSeparatorFound || pos >= cookiesString.length) {
      cookiesStrings.push(cookiesString.slice(start));
    }
  }
  return cookiesStrings;
}

const defer = typeof setImmediate === "undefined" ? (fn) => fn() : setImmediate;
function send(event, data, type) {
  if (type) {
    defaultContentType(event, type);
  }
  return new Promise((resolve) => {
    defer(() => {
      if (!event.handled) {
        event.node.res.end(data);
      }
      resolve();
    });
  });
}
function sendNoContent(event, code) {
  if (event.handled) {
    return;
  }
  if (!code && event.node.res.statusCode !== 200) {
    code = event.node.res.statusCode;
  }
  const _code = sanitizeStatusCode(code, 204);
  if (_code === 204) {
    event.node.res.removeHeader("content-length");
  }
  event.node.res.writeHead(_code);
  event.node.res.end();
}
function setResponseStatus(event, code, text) {
  if (code) {
    event.node.res.statusCode = sanitizeStatusCode(
      code,
      event.node.res.statusCode
    );
  }
  if (text) {
    event.node.res.statusMessage = sanitizeStatusMessage(text);
  }
}
function getResponseStatus(event) {
  return event.node.res.statusCode;
}
function getResponseStatusText(event) {
  return event.node.res.statusMessage;
}
function defaultContentType(event, type) {
  if (type && event.node.res.statusCode !== 304 && !event.node.res.getHeader("content-type")) {
    event.node.res.setHeader("content-type", type);
  }
}
function sendRedirect(event, location, code = 302) {
  event.node.res.statusCode = sanitizeStatusCode(
    code,
    event.node.res.statusCode
  );
  event.node.res.setHeader("location", location);
  const encodedLoc = location.replace(/"/g, "%22");
  const html = `<!DOCTYPE html><html><head><meta http-equiv="refresh" content="0; url=${encodedLoc}"></head></html>`;
  return send(event, html, MIMES.html);
}
function getResponseHeader(event, name) {
  return event.node.res.getHeader(name);
}
function setResponseHeaders(event, headers) {
  for (const [name, value] of Object.entries(headers)) {
    event.node.res.setHeader(
      name,
      value
    );
  }
}
const setHeaders = setResponseHeaders;
function setResponseHeader(event, name, value) {
  event.node.res.setHeader(name, value);
}
function isStream(data) {
  if (!data || typeof data !== "object") {
    return false;
  }
  if (typeof data.pipe === "function") {
    if (typeof data._read === "function") {
      return true;
    }
    if (typeof data.abort === "function") {
      return true;
    }
  }
  if (typeof data.pipeTo === "function") {
    return true;
  }
  return false;
}
function isWebResponse(data) {
  return typeof Response !== "undefined" && data instanceof Response;
}
function sendStream(event, stream) {
  if (!stream || typeof stream !== "object") {
    throw new Error("[h3] Invalid stream provided.");
  }
  event.node.res._data = stream;
  if (!event.node.res.socket) {
    event._handled = true;
    return Promise.resolve();
  }
  if (hasProp(stream, "pipeTo") && typeof stream.pipeTo === "function") {
    return stream.pipeTo(
      new WritableStream({
        write(chunk) {
          event.node.res.write(chunk);
        }
      })
    ).then(() => {
      event.node.res.end();
    });
  }
  if (hasProp(stream, "pipe") && typeof stream.pipe === "function") {
    return new Promise((resolve, reject) => {
      stream.pipe(event.node.res);
      if (stream.on) {
        stream.on("end", () => {
          event.node.res.end();
          resolve();
        });
        stream.on("error", (error) => {
          reject(error);
        });
      }
      event.node.res.on("close", () => {
        if (stream.abort) {
          stream.abort();
        }
      });
    });
  }
  throw new Error("[h3] Invalid or incompatible stream provided.");
}
function sendWebResponse(event, response) {
  for (const [key, value] of response.headers) {
    if (key === "set-cookie") {
      event.node.res.appendHeader(key, splitCookiesString(value));
    } else {
      event.node.res.setHeader(key, value);
    }
  }
  if (response.status) {
    event.node.res.statusCode = sanitizeStatusCode(
      response.status,
      event.node.res.statusCode
    );
  }
  if (response.statusText) {
    event.node.res.statusMessage = sanitizeStatusMessage(response.statusText);
  }
  if (response.redirected) {
    event.node.res.setHeader("location", response.url);
  }
  if (!response.body) {
    event.node.res.end();
    return;
  }
  return sendStream(event, response.body);
}

const PayloadMethods = /* @__PURE__ */ new Set(["PATCH", "POST", "PUT", "DELETE"]);
const ignoredHeaders = /* @__PURE__ */ new Set([
  "transfer-encoding",
  "accept-encoding",
  "connection",
  "keep-alive",
  "upgrade",
  "expect",
  "host",
  "accept"
]);
async function proxyRequest(event, target, opts = {}) {
  let body;
  let duplex;
  if (PayloadMethods.has(event.method)) {
    if (opts.streamRequest) {
      body = getRequestWebStream(event);
      duplex = "half";
    } else {
      body = await readRawBody(event, false).catch(() => void 0);
    }
  }
  const method = opts.fetchOptions?.method || event.method;
  const fetchHeaders = mergeHeaders$1(
    getProxyRequestHeaders(event, { host: target.startsWith("/") }),
    opts.fetchOptions?.headers,
    opts.headers
  );
  return sendProxy(event, target, {
    ...opts,
    fetchOptions: {
      method,
      body,
      duplex,
      ...opts.fetchOptions,
      headers: fetchHeaders
    }
  });
}
async function sendProxy(event, target, opts = {}) {
  let response;
  try {
    response = await _getFetch(opts.fetch)(target, {
      headers: opts.headers,
      ignoreResponseError: true,
      // make $ofetch.raw transparent
      ...opts.fetchOptions
    });
  } catch (error) {
    throw createError({
      status: 502,
      statusMessage: "Bad Gateway",
      cause: error
    });
  }
  event.node.res.statusCode = sanitizeStatusCode(
    response.status,
    event.node.res.statusCode
  );
  event.node.res.statusMessage = sanitizeStatusMessage(response.statusText);
  const cookies = [];
  for (const [key, value] of response.headers.entries()) {
    if (key === "content-encoding") {
      continue;
    }
    if (key === "content-length") {
      continue;
    }
    if (key === "set-cookie") {
      cookies.push(...splitCookiesString(value));
      continue;
    }
    event.node.res.setHeader(key, value);
  }
  if (cookies.length > 0) {
    event.node.res.setHeader(
      "set-cookie",
      cookies.map((cookie) => {
        if (opts.cookieDomainRewrite) {
          cookie = rewriteCookieProperty(
            cookie,
            opts.cookieDomainRewrite,
            "domain"
          );
        }
        if (opts.cookiePathRewrite) {
          cookie = rewriteCookieProperty(
            cookie,
            opts.cookiePathRewrite,
            "path"
          );
        }
        return cookie;
      })
    );
  }
  if (opts.onResponse) {
    await opts.onResponse(event, response);
  }
  if (response._data !== void 0) {
    return response._data;
  }
  if (event.handled) {
    return;
  }
  if (opts.sendStream === false) {
    const data = new Uint8Array(await response.arrayBuffer());
    return event.node.res.end(data);
  }
  if (response.body) {
    for await (const chunk of response.body) {
      event.node.res.write(chunk);
    }
  }
  return event.node.res.end();
}
function getProxyRequestHeaders(event, opts) {
  const headers = /* @__PURE__ */ Object.create(null);
  const reqHeaders = getRequestHeaders(event);
  for (const name in reqHeaders) {
    if (!ignoredHeaders.has(name) || name === "host" && opts?.host) {
      headers[name] = reqHeaders[name];
    }
  }
  return headers;
}
function fetchWithEvent(event, req, init, options) {
  return _getFetch(options?.fetch)(req, {
    ...init,
    context: init?.context || event.context,
    headers: {
      ...getProxyRequestHeaders(event, {
        host: typeof req === "string" && req.startsWith("/")
      }),
      ...init?.headers
    }
  });
}
function _getFetch(_fetch) {
  if (_fetch) {
    return _fetch;
  }
  if (globalThis.fetch) {
    return globalThis.fetch;
  }
  throw new Error(
    "fetch is not available. Try importing `node-fetch-native/polyfill` for Node.js."
  );
}
function rewriteCookieProperty(header, map, property) {
  const _map = typeof map === "string" ? { "*": map } : map;
  return header.replace(
    new RegExp(`(;\\s*${property}=)([^;]+)`, "gi"),
    (match, prefix, previousValue) => {
      let newValue;
      if (previousValue in _map) {
        newValue = _map[previousValue];
      } else if ("*" in _map) {
        newValue = _map["*"];
      } else {
        return match;
      }
      return newValue ? prefix + newValue : "";
    }
  );
}
function mergeHeaders$1(defaults, ...inputs) {
  const _inputs = inputs.filter(Boolean);
  if (_inputs.length === 0) {
    return defaults;
  }
  const merged = new Headers(defaults);
  for (const input of _inputs) {
    const entries = Array.isArray(input) ? input : typeof input.entries === "function" ? input.entries() : Object.entries(input);
    for (const [key, value] of entries) {
      if (value !== void 0) {
        merged.set(key, value);
      }
    }
  }
  return merged;
}

class H3Event {
  "__is_event__" = true;
  // Context
  node;
  // Node
  web;
  // Web
  context = {};
  // Shared
  // Request
  _method;
  _path;
  _headers;
  _requestBody;
  // Response
  _handled = false;
  // Hooks
  _onBeforeResponseCalled;
  _onAfterResponseCalled;
  constructor(req, res) {
    this.node = { req, res };
  }
  // --- Request ---
  get method() {
    if (!this._method) {
      this._method = (this.node.req.method || "GET").toUpperCase();
    }
    return this._method;
  }
  get path() {
    return this._path || this.node.req.url || "/";
  }
  get headers() {
    if (!this._headers) {
      this._headers = _normalizeNodeHeaders(this.node.req.headers);
    }
    return this._headers;
  }
  // --- Respoonse ---
  get handled() {
    return this._handled || this.node.res.writableEnded || this.node.res.headersSent;
  }
  respondWith(response) {
    return Promise.resolve(response).then(
      (_response) => sendWebResponse(this, _response)
    );
  }
  // --- Utils ---
  toString() {
    return `[${this.method}] ${this.path}`;
  }
  toJSON() {
    return this.toString();
  }
  // --- Deprecated ---
  /** @deprecated Please use `event.node.req` instead. */
  get req() {
    return this.node.req;
  }
  /** @deprecated Please use `event.node.res` instead. */
  get res() {
    return this.node.res;
  }
}
function isEvent(input) {
  return hasProp(input, "__is_event__");
}
function createEvent(req, res) {
  return new H3Event(req, res);
}
function _normalizeNodeHeaders(nodeHeaders) {
  const headers = new Headers();
  for (const [name, value] of Object.entries(nodeHeaders)) {
    if (Array.isArray(value)) {
      for (const item of value) {
        headers.append(name, item);
      }
    } else if (value) {
      headers.set(name, value);
    }
  }
  return headers;
}

function defineEventHandler(handler) {
  if (typeof handler === "function") {
    handler.__is_handler__ = true;
    return handler;
  }
  const _hooks = {
    onRequest: _normalizeArray(handler.onRequest),
    onBeforeResponse: _normalizeArray(handler.onBeforeResponse)
  };
  const _handler = (event) => {
    return _callHandler(event, handler.handler, _hooks);
  };
  _handler.__is_handler__ = true;
  _handler.__resolve__ = handler.handler.__resolve__;
  _handler.__websocket__ = handler.websocket;
  return _handler;
}
function _normalizeArray(input) {
  return input ? Array.isArray(input) ? input : [input] : void 0;
}
async function _callHandler(event, handler, hooks) {
  if (hooks.onRequest) {
    for (const hook of hooks.onRequest) {
      await hook(event);
      if (event.handled) {
        return;
      }
    }
  }
  const body = await handler(event);
  const response = { body };
  if (hooks.onBeforeResponse) {
    for (const hook of hooks.onBeforeResponse) {
      await hook(event, response);
    }
  }
  return response.body;
}
const eventHandler = defineEventHandler;
function isEventHandler(input) {
  return hasProp(input, "__is_handler__");
}
function toEventHandler(input, _, _route) {
  if (!isEventHandler(input)) {
    console.warn(
      "[h3] Implicit event handler conversion is deprecated. Use `eventHandler()` or `fromNodeMiddleware()` to define event handlers.",
      _route && _route !== "/" ? `
     Route: ${_route}` : "",
      `
     Handler: ${input}`
    );
  }
  return input;
}
function defineLazyEventHandler(factory) {
  let _promise;
  let _resolved;
  const resolveHandler = () => {
    if (_resolved) {
      return Promise.resolve(_resolved);
    }
    if (!_promise) {
      _promise = Promise.resolve(factory()).then((r) => {
        const handler2 = r.default || r;
        if (typeof handler2 !== "function") {
          throw new TypeError(
            "Invalid lazy handler result. It should be a function:",
            handler2
          );
        }
        _resolved = { handler: toEventHandler(r.default || r) };
        return _resolved;
      });
    }
    return _promise;
  };
  const handler = eventHandler((event) => {
    if (_resolved) {
      return _resolved.handler(event);
    }
    return resolveHandler().then((r) => r.handler(event));
  });
  handler.__resolve__ = resolveHandler;
  return handler;
}
const lazyEventHandler = defineLazyEventHandler;

function createApp(options = {}) {
  const stack = [];
  const handler = createAppEventHandler(stack, options);
  const resolve = createResolver(stack);
  handler.__resolve__ = resolve;
  const getWebsocket = cachedFn(() => websocketOptions(resolve, options));
  const app = {
    // @ts-expect-error
    use: (arg1, arg2, arg3) => use(app, arg1, arg2, arg3),
    resolve,
    handler,
    stack,
    options,
    get websocket() {
      return getWebsocket();
    }
  };
  return app;
}
function use(app, arg1, arg2, arg3) {
  if (Array.isArray(arg1)) {
    for (const i of arg1) {
      use(app, i, arg2, arg3);
    }
  } else if (Array.isArray(arg2)) {
    for (const i of arg2) {
      use(app, arg1, i, arg3);
    }
  } else if (typeof arg1 === "string") {
    app.stack.push(
      normalizeLayer({ ...arg3, route: arg1, handler: arg2 })
    );
  } else if (typeof arg1 === "function") {
    app.stack.push(normalizeLayer({ ...arg2, handler: arg1 }));
  } else {
    app.stack.push(normalizeLayer({ ...arg1 }));
  }
  return app;
}
function createAppEventHandler(stack, options) {
  const spacing = options.debug ? 2 : void 0;
  return eventHandler(async (event) => {
    event.node.req.originalUrl = event.node.req.originalUrl || event.node.req.url || "/";
    const _reqPath = event._path || event.node.req.url || "/";
    let _layerPath;
    if (options.onRequest) {
      await options.onRequest(event);
    }
    for (const layer of stack) {
      if (layer.route.length > 1) {
        if (!_reqPath.startsWith(layer.route)) {
          continue;
        }
        _layerPath = _reqPath.slice(layer.route.length) || "/";
      } else {
        _layerPath = _reqPath;
      }
      if (layer.match && !layer.match(_layerPath, event)) {
        continue;
      }
      event._path = _layerPath;
      event.node.req.url = _layerPath;
      const val = await layer.handler(event);
      const _body = val === void 0 ? void 0 : await val;
      if (_body !== void 0) {
        const _response = { body: _body };
        if (options.onBeforeResponse) {
          event._onBeforeResponseCalled = true;
          await options.onBeforeResponse(event, _response);
        }
        await handleHandlerResponse(event, _response.body, spacing);
        if (options.onAfterResponse) {
          event._onAfterResponseCalled = true;
          await options.onAfterResponse(event, _response);
        }
        return;
      }
      if (event.handled) {
        if (options.onAfterResponse) {
          event._onAfterResponseCalled = true;
          await options.onAfterResponse(event, void 0);
        }
        return;
      }
    }
    if (!event.handled) {
      throw createError({
        statusCode: 404,
        statusMessage: `Cannot find any path matching ${event.path || "/"}.`
      });
    }
    if (options.onAfterResponse) {
      event._onAfterResponseCalled = true;
      await options.onAfterResponse(event, void 0);
    }
  });
}
function createResolver(stack) {
  return async (path) => {
    let _layerPath;
    for (const layer of stack) {
      if (layer.route === "/" && !layer.handler.__resolve__) {
        continue;
      }
      if (!path.startsWith(layer.route)) {
        continue;
      }
      _layerPath = path.slice(layer.route.length) || "/";
      if (layer.match && !layer.match(_layerPath, void 0)) {
        continue;
      }
      let res = { route: layer.route, handler: layer.handler };
      if (res.handler.__resolve__) {
        const _res = await res.handler.__resolve__(_layerPath);
        if (!_res) {
          continue;
        }
        res = {
          ...res,
          ..._res,
          route: joinURL(res.route || "/", _res.route || "/")
        };
      }
      return res;
    }
  };
}
function normalizeLayer(input) {
  let handler = input.handler;
  if (handler.handler) {
    handler = handler.handler;
  }
  if (input.lazy) {
    handler = lazyEventHandler(handler);
  } else if (!isEventHandler(handler)) {
    handler = toEventHandler(handler, void 0, input.route);
  }
  return {
    route: withoutTrailingSlash(input.route),
    match: input.match,
    handler
  };
}
function handleHandlerResponse(event, val, jsonSpace) {
  if (val === null) {
    return sendNoContent(event);
  }
  if (val) {
    if (isWebResponse(val)) {
      return sendWebResponse(event, val);
    }
    if (isStream(val)) {
      return sendStream(event, val);
    }
    if (val.buffer) {
      return send(event, val);
    }
    if (val.arrayBuffer && typeof val.arrayBuffer === "function") {
      return val.arrayBuffer().then((arrayBuffer) => {
        return send(event, Buffer.from(arrayBuffer), val.type);
      });
    }
    if (val instanceof Error) {
      throw createError(val);
    }
    if (typeof val.end === "function") {
      return true;
    }
  }
  const valType = typeof val;
  if (valType === "string") {
    return send(event, val, MIMES.html);
  }
  if (valType === "object" || valType === "boolean" || valType === "number") {
    return send(event, JSON.stringify(val, void 0, jsonSpace), MIMES.json);
  }
  if (valType === "bigint") {
    return send(event, val.toString(), MIMES.json);
  }
  throw createError({
    statusCode: 500,
    statusMessage: `[h3] Cannot send ${valType} as response.`
  });
}
function cachedFn(fn) {
  let cache;
  return () => {
    if (!cache) {
      cache = fn();
    }
    return cache;
  };
}
function websocketOptions(evResolver, appOptions) {
  return {
    ...appOptions.websocket,
    async resolve(info) {
      const url = info.request?.url || info.url || "/";
      const { pathname } = typeof url === "string" ? parseURL(url) : url;
      const resolved = await evResolver(pathname);
      return resolved?.handler?.__websocket__ || {};
    }
  };
}

const RouterMethods = [
  "connect",
  "delete",
  "get",
  "head",
  "options",
  "post",
  "put",
  "trace",
  "patch"
];
function createRouter(opts = {}) {
  const _router = createRouter$1({});
  const routes = {};
  let _matcher;
  const router = {};
  const addRoute = (path, handler, method) => {
    let route = routes[path];
    if (!route) {
      routes[path] = route = { path, handlers: {} };
      _router.insert(path, route);
    }
    if (Array.isArray(method)) {
      for (const m of method) {
        addRoute(path, handler, m);
      }
    } else {
      route.handlers[method] = toEventHandler(handler, void 0, path);
    }
    return router;
  };
  router.use = router.add = (path, handler, method) => addRoute(path, handler, method || "all");
  for (const method of RouterMethods) {
    router[method] = (path, handle) => router.add(path, handle, method);
  }
  const matchHandler = (path = "/", method = "get") => {
    const qIndex = path.indexOf("?");
    if (qIndex !== -1) {
      path = path.slice(0, Math.max(0, qIndex));
    }
    const matched = _router.lookup(path);
    if (!matched || !matched.handlers) {
      return {
        error: createError({
          statusCode: 404,
          name: "Not Found",
          statusMessage: `Cannot find any route matching ${path || "/"}.`
        })
      };
    }
    let handler = matched.handlers[method] || matched.handlers.all;
    if (!handler) {
      if (!_matcher) {
        _matcher = toRouteMatcher(_router);
      }
      const _matches = _matcher.matchAll(path).reverse();
      for (const _match of _matches) {
        if (_match.handlers[method]) {
          handler = _match.handlers[method];
          matched.handlers[method] = matched.handlers[method] || handler;
          break;
        }
        if (_match.handlers.all) {
          handler = _match.handlers.all;
          matched.handlers.all = matched.handlers.all || handler;
          break;
        }
      }
    }
    if (!handler) {
      return {
        error: createError({
          statusCode: 405,
          name: "Method Not Allowed",
          statusMessage: `Method ${method} is not allowed on this route.`
        })
      };
    }
    return { matched, handler };
  };
  const isPreemptive = opts.preemptive || opts.preemtive;
  router.handler = eventHandler((event) => {
    const match = matchHandler(
      event.path,
      event.method.toLowerCase()
    );
    if ("error" in match) {
      if (isPreemptive) {
        throw match.error;
      } else {
        return;
      }
    }
    event.context.matchedRoute = match.matched;
    const params = match.matched.params || {};
    event.context.params = params;
    return Promise.resolve(match.handler(event)).then((res) => {
      if (res === void 0 && isPreemptive) {
        return null;
      }
      return res;
    });
  });
  router.handler.__resolve__ = async (path) => {
    path = withLeadingSlash(path);
    const match = matchHandler(path);
    if ("error" in match) {
      return;
    }
    let res = {
      route: match.matched.path,
      handler: match.handler
    };
    if (match.handler.__resolve__) {
      const _res = await match.handler.__resolve__(path);
      if (!_res) {
        return;
      }
      res = { ...res, ..._res };
    }
    return res;
  };
  return router;
}
function toNodeListener(app) {
  const toNodeHandle = async function(req, res) {
    const event = createEvent(req, res);
    try {
      await app.handler(event);
    } catch (_error) {
      const error = createError(_error);
      if (!isError(_error)) {
        error.unhandled = true;
      }
      setResponseStatus(event, error.statusCode, error.statusMessage);
      if (app.options.onError) {
        await app.options.onError(error, event);
      }
      if (event.handled) {
        return;
      }
      if (error.unhandled || error.fatal) {
        console.error("[h3]", error.fatal ? "[fatal]" : "[unhandled]", error);
      }
      if (app.options.onBeforeResponse && !event._onBeforeResponseCalled) {
        await app.options.onBeforeResponse(event, { body: error });
      }
      await sendError(event, error, !!app.options.debug);
      if (app.options.onAfterResponse && !event._onAfterResponseCalled) {
        await app.options.onAfterResponse(event, { body: error });
      }
    }
  };
  return toNodeHandle;
}

function flatHooks(configHooks, hooks = {}, parentName) {
  for (const key in configHooks) {
    const subHook = configHooks[key];
    const name = parentName ? `${parentName}:${key}` : key;
    if (typeof subHook === "object" && subHook !== null) {
      flatHooks(subHook, hooks, name);
    } else if (typeof subHook === "function") {
      hooks[name] = subHook;
    }
  }
  return hooks;
}
const defaultTask = { run: (function_) => function_() };
const _createTask = () => defaultTask;
const createTask = typeof console.createTask !== "undefined" ? console.createTask : _createTask;
function serialTaskCaller(hooks, args) {
  const name = args.shift();
  const task = createTask(name);
  return hooks.reduce(
    (promise, hookFunction) => promise.then(() => task.run(() => hookFunction(...args))),
    Promise.resolve()
  );
}
function parallelTaskCaller(hooks, args) {
  const name = args.shift();
  const task = createTask(name);
  return Promise.all(hooks.map((hook) => task.run(() => hook(...args))));
}
function callEachWith(callbacks, arg0) {
  for (const callback of [...callbacks]) {
    callback(arg0);
  }
}

class Hookable {
  constructor() {
    this._hooks = {};
    this._before = void 0;
    this._after = void 0;
    this._deprecatedMessages = void 0;
    this._deprecatedHooks = {};
    this.hook = this.hook.bind(this);
    this.callHook = this.callHook.bind(this);
    this.callHookWith = this.callHookWith.bind(this);
  }
  hook(name, function_, options = {}) {
    if (!name || typeof function_ !== "function") {
      return () => {
      };
    }
    const originalName = name;
    let dep;
    while (this._deprecatedHooks[name]) {
      dep = this._deprecatedHooks[name];
      name = dep.to;
    }
    if (dep && !options.allowDeprecated) {
      let message = dep.message;
      if (!message) {
        message = `${originalName} hook has been deprecated` + (dep.to ? `, please use ${dep.to}` : "");
      }
      if (!this._deprecatedMessages) {
        this._deprecatedMessages = /* @__PURE__ */ new Set();
      }
      if (!this._deprecatedMessages.has(message)) {
        console.warn(message);
        this._deprecatedMessages.add(message);
      }
    }
    if (!function_.name) {
      try {
        Object.defineProperty(function_, "name", {
          get: () => "_" + name.replace(/\W+/g, "_") + "_hook_cb",
          configurable: true
        });
      } catch {
      }
    }
    this._hooks[name] = this._hooks[name] || [];
    this._hooks[name].push(function_);
    return () => {
      if (function_) {
        this.removeHook(name, function_);
        function_ = void 0;
      }
    };
  }
  hookOnce(name, function_) {
    let _unreg;
    let _function = (...arguments_) => {
      if (typeof _unreg === "function") {
        _unreg();
      }
      _unreg = void 0;
      _function = void 0;
      return function_(...arguments_);
    };
    _unreg = this.hook(name, _function);
    return _unreg;
  }
  removeHook(name, function_) {
    if (this._hooks[name]) {
      const index = this._hooks[name].indexOf(function_);
      if (index !== -1) {
        this._hooks[name].splice(index, 1);
      }
      if (this._hooks[name].length === 0) {
        delete this._hooks[name];
      }
    }
  }
  deprecateHook(name, deprecated) {
    this._deprecatedHooks[name] = typeof deprecated === "string" ? { to: deprecated } : deprecated;
    const _hooks = this._hooks[name] || [];
    delete this._hooks[name];
    for (const hook of _hooks) {
      this.hook(name, hook);
    }
  }
  deprecateHooks(deprecatedHooks) {
    Object.assign(this._deprecatedHooks, deprecatedHooks);
    for (const name in deprecatedHooks) {
      this.deprecateHook(name, deprecatedHooks[name]);
    }
  }
  addHooks(configHooks) {
    const hooks = flatHooks(configHooks);
    const removeFns = Object.keys(hooks).map(
      (key) => this.hook(key, hooks[key])
    );
    return () => {
      for (const unreg of removeFns.splice(0, removeFns.length)) {
        unreg();
      }
    };
  }
  removeHooks(configHooks) {
    const hooks = flatHooks(configHooks);
    for (const key in hooks) {
      this.removeHook(key, hooks[key]);
    }
  }
  removeAllHooks() {
    for (const key in this._hooks) {
      delete this._hooks[key];
    }
  }
  callHook(name, ...arguments_) {
    arguments_.unshift(name);
    return this.callHookWith(serialTaskCaller, name, ...arguments_);
  }
  callHookParallel(name, ...arguments_) {
    arguments_.unshift(name);
    return this.callHookWith(parallelTaskCaller, name, ...arguments_);
  }
  callHookWith(caller, name, ...arguments_) {
    const event = this._before || this._after ? { name, args: arguments_, context: {} } : void 0;
    if (this._before) {
      callEachWith(this._before, event);
    }
    const result = caller(
      name in this._hooks ? [...this._hooks[name]] : [],
      arguments_
    );
    if (result instanceof Promise) {
      return result.finally(() => {
        if (this._after && event) {
          callEachWith(this._after, event);
        }
      });
    }
    if (this._after && event) {
      callEachWith(this._after, event);
    }
    return result;
  }
  beforeEach(function_) {
    this._before = this._before || [];
    this._before.push(function_);
    return () => {
      if (this._before !== void 0) {
        const index = this._before.indexOf(function_);
        if (index !== -1) {
          this._before.splice(index, 1);
        }
      }
    };
  }
  afterEach(function_) {
    this._after = this._after || [];
    this._after.push(function_);
    return () => {
      if (this._after !== void 0) {
        const index = this._after.indexOf(function_);
        if (index !== -1) {
          this._after.splice(index, 1);
        }
      }
    };
  }
}
function createHooks() {
  return new Hookable();
}

// Injectable version of `globalThis.global` (without side effects)
const global = globalThis;

class FetchError extends Error {
  constructor(message, opts) {
    super(message, opts);
    this.name = "FetchError";
    if (opts?.cause && !this.cause) {
      this.cause = opts.cause;
    }
  }
}
function createFetchError(ctx) {
  const errorMessage = ctx.error?.message || ctx.error?.toString() || "";
  const method = ctx.request?.method || ctx.options?.method || "GET";
  const url = ctx.request?.url || String(ctx.request) || "/";
  const requestStr = `[${method}] ${JSON.stringify(url)}`;
  const statusStr = ctx.response ? `${ctx.response.status} ${ctx.response.statusText}` : "<no response>";
  const message = `${requestStr}: ${statusStr}${errorMessage ? ` ${errorMessage}` : ""}`;
  const fetchError = new FetchError(
    message,
    ctx.error ? { cause: ctx.error } : void 0
  );
  for (const key of ["request", "options", "response"]) {
    Object.defineProperty(fetchError, key, {
      get() {
        return ctx[key];
      }
    });
  }
  for (const [key, refKey] of [
    ["data", "_data"],
    ["status", "status"],
    ["statusCode", "status"],
    ["statusText", "statusText"],
    ["statusMessage", "statusText"]
  ]) {
    Object.defineProperty(fetchError, key, {
      get() {
        return ctx.response && ctx.response[refKey];
      }
    });
  }
  return fetchError;
}

const payloadMethods = new Set(
  Object.freeze(["PATCH", "POST", "PUT", "DELETE"])
);
function isPayloadMethod(method = "GET") {
  return payloadMethods.has(method.toUpperCase());
}
function isJSONSerializable(value) {
  if (value === void 0) {
    return false;
  }
  const t = typeof value;
  if (t === "string" || t === "number" || t === "boolean" || t === null) {
    return true;
  }
  if (t !== "object") {
    return false;
  }
  if (Array.isArray(value)) {
    return true;
  }
  if (value.buffer) {
    return false;
  }
  if (value instanceof FormData || value instanceof URLSearchParams) {
    return false;
  }
  return value.constructor && value.constructor.name === "Object" || typeof value.toJSON === "function";
}
const textTypes = /* @__PURE__ */ new Set([
  "image/svg",
  "application/xml",
  "application/xhtml",
  "application/html"
]);
const JSON_RE = /^application\/(?:[\w!#$%&*.^`~-]*\+)?json(;.+)?$/i;
function detectResponseType(_contentType = "") {
  if (!_contentType) {
    return "json";
  }
  const contentType = _contentType.split(";").shift() || "";
  if (JSON_RE.test(contentType)) {
    return "json";
  }
  if (contentType === "text/event-stream") {
    return "stream";
  }
  if (textTypes.has(contentType) || contentType.startsWith("text/")) {
    return "text";
  }
  return "blob";
}
function resolveFetchOptions(request, input, defaults, Headers) {
  const headers = mergeHeaders(
    input?.headers ?? request?.headers,
    defaults?.headers,
    Headers
  );
  let query;
  if (defaults?.query || defaults?.params || input?.params || input?.query) {
    query = {
      ...defaults?.params,
      ...defaults?.query,
      ...input?.params,
      ...input?.query
    };
  }
  return {
    ...defaults,
    ...input,
    query,
    params: query,
    headers
  };
}
function mergeHeaders(input, defaults, Headers) {
  if (!defaults) {
    return new Headers(input);
  }
  const headers = new Headers(defaults);
  if (input) {
    for (const [key, value] of Symbol.iterator in input || Array.isArray(input) ? input : new Headers(input)) {
      headers.set(key, value);
    }
  }
  return headers;
}
async function callHooks(context, hooks) {
  if (hooks) {
    if (Array.isArray(hooks)) {
      for (const hook of hooks) {
        await hook(context);
      }
    } else {
      await hooks(context);
    }
  }
}

const retryStatusCodes = /* @__PURE__ */ new Set([
  408,
  // Request Timeout
  409,
  // Conflict
  425,
  // Too Early (Experimental)
  429,
  // Too Many Requests
  500,
  // Internal Server Error
  502,
  // Bad Gateway
  503,
  // Service Unavailable
  504
  // Gateway Timeout
]);
const nullBodyResponses = /* @__PURE__ */ new Set([101, 204, 205, 304]);
function createFetch(globalOptions = {}) {
  const {
    fetch = globalThis.fetch,
    Headers = globalThis.Headers,
    AbortController = globalThis.AbortController
  } = globalOptions;
  async function onError(context) {
    const isAbort = context.error && context.error.name === "AbortError" && !context.options.timeout || false;
    if (context.options.retry !== false && !isAbort) {
      let retries;
      if (typeof context.options.retry === "number") {
        retries = context.options.retry;
      } else {
        retries = isPayloadMethod(context.options.method) ? 0 : 1;
      }
      const responseCode = context.response && context.response.status || 500;
      if (retries > 0 && (Array.isArray(context.options.retryStatusCodes) ? context.options.retryStatusCodes.includes(responseCode) : retryStatusCodes.has(responseCode))) {
        const retryDelay = typeof context.options.retryDelay === "function" ? context.options.retryDelay(context) : context.options.retryDelay || 0;
        if (retryDelay > 0) {
          await new Promise((resolve) => setTimeout(resolve, retryDelay));
        }
        return $fetchRaw(context.request, {
          ...context.options,
          retry: retries - 1
        });
      }
    }
    const error = createFetchError(context);
    if (Error.captureStackTrace) {
      Error.captureStackTrace(error, $fetchRaw);
    }
    throw error;
  }
  const $fetchRaw = async function $fetchRaw2(_request, _options = {}) {
    const context = {
      request: _request,
      options: resolveFetchOptions(
        _request,
        _options,
        globalOptions.defaults,
        Headers
      ),
      response: void 0,
      error: void 0
    };
    if (context.options.method) {
      context.options.method = context.options.method.toUpperCase();
    }
    if (context.options.onRequest) {
      await callHooks(context, context.options.onRequest);
      if (!(context.options.headers instanceof Headers)) {
        context.options.headers = new Headers(
          context.options.headers || {}
          /* compat */
        );
      }
    }
    if (typeof context.request === "string") {
      if (context.options.baseURL) {
        context.request = withBase(context.request, context.options.baseURL);
      }
      if (context.options.query) {
        context.request = withQuery(context.request, context.options.query);
        delete context.options.query;
      }
      if ("query" in context.options) {
        delete context.options.query;
      }
      if ("params" in context.options) {
        delete context.options.params;
      }
    }
    if (context.options.body && isPayloadMethod(context.options.method)) {
      if (isJSONSerializable(context.options.body)) {
        const contentType = context.options.headers.get("content-type");
        if (typeof context.options.body !== "string") {
          context.options.body = contentType === "application/x-www-form-urlencoded" ? new URLSearchParams(
            context.options.body
          ).toString() : JSON.stringify(context.options.body);
        }
        if (!contentType) {
          context.options.headers.set("content-type", "application/json");
        }
        if (!context.options.headers.has("accept")) {
          context.options.headers.set("accept", "application/json");
        }
      } else if (
        // ReadableStream Body
        "pipeTo" in context.options.body && typeof context.options.body.pipeTo === "function" || // Node.js Stream Body
        typeof context.options.body.pipe === "function"
      ) {
        if (!("duplex" in context.options)) {
          context.options.duplex = "half";
        }
      }
    }
    let abortTimeout;
    if (!context.options.signal && context.options.timeout) {
      const controller = new AbortController();
      abortTimeout = setTimeout(() => {
        const error = new Error(
          "[TimeoutError]: The operation was aborted due to timeout"
        );
        error.name = "TimeoutError";
        error.code = 23;
        controller.abort(error);
      }, context.options.timeout);
      context.options.signal = controller.signal;
    }
    try {
      context.response = await fetch(
        context.request,
        context.options
      );
    } catch (error) {
      context.error = error;
      if (context.options.onRequestError) {
        await callHooks(
          context,
          context.options.onRequestError
        );
      }
      return await onError(context);
    } finally {
      if (abortTimeout) {
        clearTimeout(abortTimeout);
      }
    }
    const hasBody = (context.response.body || // https://github.com/unjs/ofetch/issues/324
    // https://github.com/unjs/ofetch/issues/294
    // https://github.com/JakeChampion/fetch/issues/1454
    context.response._bodyInit) && !nullBodyResponses.has(context.response.status) && context.options.method !== "HEAD";
    if (hasBody) {
      const responseType = (context.options.parseResponse ? "json" : context.options.responseType) || detectResponseType(context.response.headers.get("content-type") || "");
      switch (responseType) {
        case "json": {
          const data = await context.response.text();
          const parseFunction = context.options.parseResponse || destr;
          context.response._data = parseFunction(data);
          break;
        }
        case "stream": {
          context.response._data = context.response.body || context.response._bodyInit;
          break;
        }
        default: {
          context.response._data = await context.response[responseType]();
        }
      }
    }
    if (context.options.onResponse) {
      await callHooks(
        context,
        context.options.onResponse
      );
    }
    if (!context.options.ignoreResponseError && context.response.status >= 400 && context.response.status < 600) {
      if (context.options.onResponseError) {
        await callHooks(
          context,
          context.options.onResponseError
        );
      }
      return await onError(context);
    }
    return context.response;
  };
  const $fetch = async function $fetch2(request, options) {
    const r = await $fetchRaw(request, options);
    return r._data;
  };
  $fetch.raw = $fetchRaw;
  $fetch.native = (...args) => fetch(...args);
  $fetch.create = (defaultOptions = {}, customGlobalOptions = {}) => createFetch({
    ...globalOptions,
    ...customGlobalOptions,
    defaults: {
      ...globalOptions.defaults,
      ...customGlobalOptions.defaults,
      ...defaultOptions
    }
  });
  return $fetch;
}

const _globalThis$1 = (function() {
  if (typeof globalThis !== "undefined") {
    return globalThis;
  }
  if (typeof self !== "undefined") {
    return self;
  }
  if (typeof global !== "undefined") {
    return global;
  }
  throw new Error("unable to locate global object");
})();
const fetch = _globalThis$1.fetch ? (...args) => _globalThis$1.fetch(...args) : () => Promise.reject(new Error("[ofetch] global.fetch is not supported!"));
const Headers$1 = _globalThis$1.Headers;
const AbortController = _globalThis$1.AbortController;
const ofetch = createFetch({ fetch, Headers: Headers$1, AbortController });
const $fetch = ofetch;

function wrapToPromise(value) {
  if (!value || typeof value.then !== "function") {
    return Promise.resolve(value);
  }
  return value;
}
function asyncCall(function_, ...arguments_) {
  try {
    return wrapToPromise(function_(...arguments_));
  } catch (error) {
    return Promise.reject(error);
  }
}
function isPrimitive(value) {
  const type = typeof value;
  return value === null || type !== "object" && type !== "function";
}
function isPureObject(value) {
  const proto = Object.getPrototypeOf(value);
  return !proto || proto.isPrototypeOf(Object);
}
function stringify(value) {
  if (isPrimitive(value)) {
    return String(value);
  }
  if (isPureObject(value) || Array.isArray(value)) {
    return JSON.stringify(value);
  }
  if (typeof value.toJSON === "function") {
    return stringify(value.toJSON());
  }
  throw new Error("[unstorage] Cannot stringify value!");
}
const BASE64_PREFIX = "base64:";
function serializeRaw(value) {
  if (typeof value === "string") {
    return value;
  }
  return BASE64_PREFIX + base64Encode(value);
}
function deserializeRaw(value) {
  if (typeof value !== "string") {
    return value;
  }
  if (!value.startsWith(BASE64_PREFIX)) {
    return value;
  }
  return base64Decode(value.slice(BASE64_PREFIX.length));
}
function base64Decode(input) {
  if (globalThis.Buffer) {
    return Buffer.from(input, "base64");
  }
  return Uint8Array.from(
    globalThis.atob(input),
    (c) => c.codePointAt(0)
  );
}
function base64Encode(input) {
  if (globalThis.Buffer) {
    return Buffer.from(input).toString("base64");
  }
  return globalThis.btoa(String.fromCodePoint(...input));
}

const storageKeyProperties = [
  "has",
  "hasItem",
  "get",
  "getItem",
  "getItemRaw",
  "set",
  "setItem",
  "setItemRaw",
  "del",
  "remove",
  "removeItem",
  "getMeta",
  "setMeta",
  "removeMeta",
  "getKeys",
  "clear",
  "mount",
  "unmount"
];
function prefixStorage(storage, base) {
  base = normalizeBaseKey(base);
  if (!base) {
    return storage;
  }
  const nsStorage = { ...storage };
  for (const property of storageKeyProperties) {
    nsStorage[property] = (key = "", ...args) => (
      // @ts-ignore
      storage[property](base + key, ...args)
    );
  }
  nsStorage.getKeys = (key = "", ...arguments_) => storage.getKeys(base + key, ...arguments_).then((keys) => keys.map((key2) => key2.slice(base.length)));
  nsStorage.keys = nsStorage.getKeys;
  nsStorage.getItems = async (items, commonOptions) => {
    const prefixedItems = items.map(
      (item) => typeof item === "string" ? base + item : { ...item, key: base + item.key }
    );
    const results = await storage.getItems(prefixedItems, commonOptions);
    return results.map((entry) => ({
      key: entry.key.slice(base.length),
      value: entry.value
    }));
  };
  nsStorage.setItems = async (items, commonOptions) => {
    const prefixedItems = items.map((item) => ({
      key: base + item.key,
      value: item.value,
      options: item.options
    }));
    return storage.setItems(prefixedItems, commonOptions);
  };
  return nsStorage;
}
function normalizeKey$1(key) {
  if (!key) {
    return "";
  }
  return key.split("?")[0]?.replace(/[/\\]/g, ":").replace(/:+/g, ":").replace(/^:|:$/g, "") || "";
}
function joinKeys(...keys) {
  return normalizeKey$1(keys.join(":"));
}
function normalizeBaseKey(base) {
  base = normalizeKey$1(base);
  return base ? base + ":" : "";
}
function filterKeyByDepth(key, depth) {
  if (depth === void 0) {
    return true;
  }
  let substrCount = 0;
  let index = key.indexOf(":");
  while (index > -1) {
    substrCount++;
    index = key.indexOf(":", index + 1);
  }
  return substrCount <= depth;
}
function filterKeyByBase(key, base) {
  if (base) {
    return key.startsWith(base) && key[key.length - 1] !== "$";
  }
  return key[key.length - 1] !== "$";
}

function defineDriver(factory) {
  return factory;
}

const DRIVER_NAME = "memory";
const memory = defineDriver(() => {
  const data = /* @__PURE__ */ new Map();
  return {
    name: DRIVER_NAME,
    getInstance: () => data,
    hasItem(key) {
      return data.has(key);
    },
    getItem(key) {
      return data.get(key) ?? null;
    },
    getItemRaw(key) {
      return data.get(key) ?? null;
    },
    setItem(key, value) {
      data.set(key, value);
    },
    setItemRaw(key, value) {
      data.set(key, value);
    },
    removeItem(key) {
      data.delete(key);
    },
    getKeys() {
      return [...data.keys()];
    },
    clear() {
      data.clear();
    },
    dispose() {
      data.clear();
    }
  };
});

function createStorage(options = {}) {
  const context = {
    mounts: { "": options.driver || memory() },
    mountpoints: [""],
    watching: false,
    watchListeners: [],
    unwatch: {}
  };
  const getMount = (key) => {
    for (const base of context.mountpoints) {
      if (key.startsWith(base)) {
        return {
          base,
          relativeKey: key.slice(base.length),
          driver: context.mounts[base]
        };
      }
    }
    return {
      base: "",
      relativeKey: key,
      driver: context.mounts[""]
    };
  };
  const getMounts = (base, includeParent) => {
    return context.mountpoints.filter(
      (mountpoint) => mountpoint.startsWith(base) || includeParent && base.startsWith(mountpoint)
    ).map((mountpoint) => ({
      relativeBase: base.length > mountpoint.length ? base.slice(mountpoint.length) : void 0,
      mountpoint,
      driver: context.mounts[mountpoint]
    }));
  };
  const onChange = (event, key) => {
    if (!context.watching) {
      return;
    }
    key = normalizeKey$1(key);
    for (const listener of context.watchListeners) {
      listener(event, key);
    }
  };
  const startWatch = async () => {
    if (context.watching) {
      return;
    }
    context.watching = true;
    for (const mountpoint in context.mounts) {
      context.unwatch[mountpoint] = await watch(
        context.mounts[mountpoint],
        onChange,
        mountpoint
      );
    }
  };
  const stopWatch = async () => {
    if (!context.watching) {
      return;
    }
    for (const mountpoint in context.unwatch) {
      await context.unwatch[mountpoint]();
    }
    context.unwatch = {};
    context.watching = false;
  };
  const runBatch = (items, commonOptions, cb) => {
    const batches = /* @__PURE__ */ new Map();
    const getBatch = (mount) => {
      let batch = batches.get(mount.base);
      if (!batch) {
        batch = {
          driver: mount.driver,
          base: mount.base,
          items: []
        };
        batches.set(mount.base, batch);
      }
      return batch;
    };
    for (const item of items) {
      const isStringItem = typeof item === "string";
      const key = normalizeKey$1(isStringItem ? item : item.key);
      const value = isStringItem ? void 0 : item.value;
      const options2 = isStringItem || !item.options ? commonOptions : { ...commonOptions, ...item.options };
      const mount = getMount(key);
      getBatch(mount).items.push({
        key,
        value,
        relativeKey: mount.relativeKey,
        options: options2
      });
    }
    return Promise.all([...batches.values()].map((batch) => cb(batch))).then(
      (r) => r.flat()
    );
  };
  const storage = {
    // Item
    hasItem(key, opts = {}) {
      key = normalizeKey$1(key);
      const { relativeKey, driver } = getMount(key);
      return asyncCall(driver.hasItem, relativeKey, opts);
    },
    getItem(key, opts = {}) {
      key = normalizeKey$1(key);
      const { relativeKey, driver } = getMount(key);
      return asyncCall(driver.getItem, relativeKey, opts).then(
        (value) => destr(value)
      );
    },
    getItems(items, commonOptions = {}) {
      return runBatch(items, commonOptions, (batch) => {
        if (batch.driver.getItems) {
          return asyncCall(
            batch.driver.getItems,
            batch.items.map((item) => ({
              key: item.relativeKey,
              options: item.options
            })),
            commonOptions
          ).then(
            (r) => r.map((item) => ({
              key: joinKeys(batch.base, item.key),
              value: destr(item.value)
            }))
          );
        }
        return Promise.all(
          batch.items.map((item) => {
            return asyncCall(
              batch.driver.getItem,
              item.relativeKey,
              item.options
            ).then((value) => ({
              key: item.key,
              value: destr(value)
            }));
          })
        );
      });
    },
    getItemRaw(key, opts = {}) {
      key = normalizeKey$1(key);
      const { relativeKey, driver } = getMount(key);
      if (driver.getItemRaw) {
        return asyncCall(driver.getItemRaw, relativeKey, opts);
      }
      return asyncCall(driver.getItem, relativeKey, opts).then(
        (value) => deserializeRaw(value)
      );
    },
    async setItem(key, value, opts = {}) {
      if (value === void 0) {
        return storage.removeItem(key);
      }
      key = normalizeKey$1(key);
      const { relativeKey, driver } = getMount(key);
      if (!driver.setItem) {
        return;
      }
      await asyncCall(driver.setItem, relativeKey, stringify(value), opts);
      if (!driver.watch) {
        onChange("update", key);
      }
    },
    async setItems(items, commonOptions) {
      await runBatch(items, commonOptions, async (batch) => {
        if (batch.driver.setItems) {
          return asyncCall(
            batch.driver.setItems,
            batch.items.map((item) => ({
              key: item.relativeKey,
              value: stringify(item.value),
              options: item.options
            })),
            commonOptions
          );
        }
        if (!batch.driver.setItem) {
          return;
        }
        await Promise.all(
          batch.items.map((item) => {
            return asyncCall(
              batch.driver.setItem,
              item.relativeKey,
              stringify(item.value),
              item.options
            );
          })
        );
      });
    },
    async setItemRaw(key, value, opts = {}) {
      if (value === void 0) {
        return storage.removeItem(key, opts);
      }
      key = normalizeKey$1(key);
      const { relativeKey, driver } = getMount(key);
      if (driver.setItemRaw) {
        await asyncCall(driver.setItemRaw, relativeKey, value, opts);
      } else if (driver.setItem) {
        await asyncCall(driver.setItem, relativeKey, serializeRaw(value), opts);
      } else {
        return;
      }
      if (!driver.watch) {
        onChange("update", key);
      }
    },
    async removeItem(key, opts = {}) {
      if (typeof opts === "boolean") {
        opts = { removeMeta: opts };
      }
      key = normalizeKey$1(key);
      const { relativeKey, driver } = getMount(key);
      if (!driver.removeItem) {
        return;
      }
      await asyncCall(driver.removeItem, relativeKey, opts);
      if (opts.removeMeta || opts.removeMata) {
        await asyncCall(driver.removeItem, relativeKey + "$", opts);
      }
      if (!driver.watch) {
        onChange("remove", key);
      }
    },
    // Meta
    async getMeta(key, opts = {}) {
      if (typeof opts === "boolean") {
        opts = { nativeOnly: opts };
      }
      key = normalizeKey$1(key);
      const { relativeKey, driver } = getMount(key);
      const meta = /* @__PURE__ */ Object.create(null);
      if (driver.getMeta) {
        Object.assign(meta, await asyncCall(driver.getMeta, relativeKey, opts));
      }
      if (!opts.nativeOnly) {
        const value = await asyncCall(
          driver.getItem,
          relativeKey + "$",
          opts
        ).then((value_) => destr(value_));
        if (value && typeof value === "object") {
          if (typeof value.atime === "string") {
            value.atime = new Date(value.atime);
          }
          if (typeof value.mtime === "string") {
            value.mtime = new Date(value.mtime);
          }
          Object.assign(meta, value);
        }
      }
      return meta;
    },
    setMeta(key, value, opts = {}) {
      return this.setItem(key + "$", value, opts);
    },
    removeMeta(key, opts = {}) {
      return this.removeItem(key + "$", opts);
    },
    // Keys
    async getKeys(base, opts = {}) {
      base = normalizeBaseKey(base);
      const mounts = getMounts(base, true);
      let maskedMounts = [];
      const allKeys = [];
      let allMountsSupportMaxDepth = true;
      for (const mount of mounts) {
        if (!mount.driver.flags?.maxDepth) {
          allMountsSupportMaxDepth = false;
        }
        const rawKeys = await asyncCall(
          mount.driver.getKeys,
          mount.relativeBase,
          opts
        );
        for (const key of rawKeys) {
          const fullKey = mount.mountpoint + normalizeKey$1(key);
          if (!maskedMounts.some((p) => fullKey.startsWith(p))) {
            allKeys.push(fullKey);
          }
        }
        maskedMounts = [
          mount.mountpoint,
          ...maskedMounts.filter((p) => !p.startsWith(mount.mountpoint))
        ];
      }
      const shouldFilterByDepth = opts.maxDepth !== void 0 && !allMountsSupportMaxDepth;
      return allKeys.filter(
        (key) => (!shouldFilterByDepth || filterKeyByDepth(key, opts.maxDepth)) && filterKeyByBase(key, base)
      );
    },
    // Utils
    async clear(base, opts = {}) {
      base = normalizeBaseKey(base);
      await Promise.all(
        getMounts(base, false).map(async (m) => {
          if (m.driver.clear) {
            return asyncCall(m.driver.clear, m.relativeBase, opts);
          }
          if (m.driver.removeItem) {
            const keys = await m.driver.getKeys(m.relativeBase || "", opts);
            return Promise.all(
              keys.map((key) => m.driver.removeItem(key, opts))
            );
          }
        })
      );
    },
    async dispose() {
      await Promise.all(
        Object.values(context.mounts).map((driver) => dispose(driver))
      );
    },
    async watch(callback) {
      await startWatch();
      context.watchListeners.push(callback);
      return async () => {
        context.watchListeners = context.watchListeners.filter(
          (listener) => listener !== callback
        );
        if (context.watchListeners.length === 0) {
          await stopWatch();
        }
      };
    },
    async unwatch() {
      context.watchListeners = [];
      await stopWatch();
    },
    // Mount
    mount(base, driver) {
      base = normalizeBaseKey(base);
      if (base && context.mounts[base]) {
        throw new Error(`already mounted at ${base}`);
      }
      if (base) {
        context.mountpoints.push(base);
        context.mountpoints.sort((a, b) => b.length - a.length);
      }
      context.mounts[base] = driver;
      if (context.watching) {
        Promise.resolve(watch(driver, onChange, base)).then((unwatcher) => {
          context.unwatch[base] = unwatcher;
        }).catch(console.error);
      }
      return storage;
    },
    async unmount(base, _dispose = true) {
      base = normalizeBaseKey(base);
      if (!base || !context.mounts[base]) {
        return;
      }
      if (context.watching && base in context.unwatch) {
        context.unwatch[base]?.();
        delete context.unwatch[base];
      }
      if (_dispose) {
        await dispose(context.mounts[base]);
      }
      context.mountpoints = context.mountpoints.filter((key) => key !== base);
      delete context.mounts[base];
    },
    getMount(key = "") {
      key = normalizeKey$1(key) + ":";
      const m = getMount(key);
      return {
        driver: m.driver,
        base: m.base
      };
    },
    getMounts(base = "", opts = {}) {
      base = normalizeKey$1(base);
      const mounts = getMounts(base, opts.parents);
      return mounts.map((m) => ({
        driver: m.driver,
        base: m.mountpoint
      }));
    },
    // Aliases
    keys: (base, opts = {}) => storage.getKeys(base, opts),
    get: (key, opts = {}) => storage.getItem(key, opts),
    set: (key, value, opts = {}) => storage.setItem(key, value, opts),
    has: (key, opts = {}) => storage.hasItem(key, opts),
    del: (key, opts = {}) => storage.removeItem(key, opts),
    remove: (key, opts = {}) => storage.removeItem(key, opts)
  };
  return storage;
}
function watch(driver, onChange, base) {
  return driver.watch ? driver.watch((event, key) => onChange(event, base + key)) : () => {
  };
}
async function dispose(driver) {
  if (typeof driver.dispose === "function") {
    await asyncCall(driver.dispose);
  }
}

const _assets = {

};

const normalizeKey = function normalizeKey(key) {
  if (!key) {
    return "";
  }
  return key.split("?")[0]?.replace(/[/\\]/g, ":").replace(/:+/g, ":").replace(/^:|:$/g, "") || "";
};

const assets$1 = {
  getKeys() {
    return Promise.resolve(Object.keys(_assets))
  },
  hasItem (id) {
    id = normalizeKey(id);
    return Promise.resolve(id in _assets)
  },
  getItem (id) {
    id = normalizeKey(id);
    return Promise.resolve(_assets[id] ? _assets[id].import() : null)
  },
  getMeta (id) {
    id = normalizeKey(id);
    return Promise.resolve(_assets[id] ? _assets[id].meta : {})
  }
};

const storage = createStorage({});

storage.mount('/assets', assets$1);

function useStorage(base = "") {
  return base ? prefixStorage(storage, base) : storage;
}

function serialize$1(o){return typeof o=="string"?`'${o}'`:new c().serialize(o)}const c=/*@__PURE__*/function(){class o{#t=new Map;compare(t,r){const e=typeof t,n=typeof r;return e==="string"&&n==="string"?t.localeCompare(r):e==="number"&&n==="number"?t-r:String.prototype.localeCompare.call(this.serialize(t,true),this.serialize(r,true))}serialize(t,r){if(t===null)return "null";switch(typeof t){case "string":return r?t:`'${t}'`;case "bigint":return `${t}n`;case "object":return this.$object(t);case "function":return this.$function(t)}return String(t)}serializeObject(t){const r=Object.prototype.toString.call(t);if(r!=="[object Object]")return this.serializeBuiltInType(r.length<10?`unknown:${r}`:r.slice(8,-1),t);const e=t.constructor,n=e===Object||e===void 0?"":e.name;if(n!==""&&globalThis[n]===e)return this.serializeBuiltInType(n,t);if(typeof t.toJSON=="function"){const i=t.toJSON();return n+(i!==null&&typeof i=="object"?this.$object(i):`(${this.serialize(i)})`)}return this.serializeObjectEntries(n,Object.entries(t))}serializeBuiltInType(t,r){const e=this["$"+t];if(e)return e.call(this,r);if(typeof r?.entries=="function")return this.serializeObjectEntries(t,r.entries());throw new Error(`Cannot serialize ${t}`)}serializeObjectEntries(t,r){const e=Array.from(r).sort((i,a)=>this.compare(i[0],a[0]));let n=`${t}{`;for(let i=0;i<e.length;i++){const[a,l]=e[i];n+=`${this.serialize(a,true)}:${this.serialize(l)}`,i<e.length-1&&(n+=",");}return n+"}"}$object(t){let r=this.#t.get(t);return r===void 0&&(this.#t.set(t,`#${this.#t.size}`),r=this.serializeObject(t),this.#t.set(t,r)),r}$function(t){const r=Function.prototype.toString.call(t);return r.slice(-15)==="[native code] }"?`${t.name||""}()[native]`:`${t.name}(${t.length})${r.replace(/\s*\n\s*/g,"")}`}$Array(t){let r="[";for(let e=0;e<t.length;e++)r+=this.serialize(t[e]),e<t.length-1&&(r+=",");return r+"]"}$Date(t){try{return `Date(${t.toISOString()})`}catch{return "Date(null)"}}$ArrayBuffer(t){return `ArrayBuffer[${new Uint8Array(t).join(",")}]`}$Set(t){return `Set${this.$Array(Array.from(t).sort((r,e)=>this.compare(r,e)))}`}$Map(t){return this.serializeObjectEntries("Map",t.entries())}}for(const s of ["Error","RegExp","URL"])o.prototype["$"+s]=function(t){return `${s}(${t})`};for(const s of ["Int8Array","Uint8Array","Uint8ClampedArray","Int16Array","Uint16Array","Int32Array","Uint32Array","Float32Array","Float64Array"])o.prototype["$"+s]=function(t){return `${s}[${t.join(",")}]`};for(const s of ["BigInt64Array","BigUint64Array"])o.prototype["$"+s]=function(t){return `${s}[${t.join("n,")}${t.length>0?"n":""}]`};return o}();

const z=[1779033703,-1150833019,1013904242,-1521486534,1359893119,-1694144372,528734635,1541459225],R=[1116352408,1899447441,-1245643825,-373957723,961987163,1508970993,-1841331548,-1424204075,-670586216,310598401,607225278,1426881987,1925078388,-2132889090,-1680079193,-1046744716,-459576895,-272742522,264347078,604807628,770255983,1249150122,1555081692,1996064986,-1740746414,-1473132947,-1341970488,-1084653625,-958395405,-710438585,113926993,338241895,666307205,773529912,1294757372,1396182291,1695183700,1986661051,-2117940946,-1838011259,-1564481375,-1474664885,-1035236496,-949202525,-778901479,-694614492,-200395387,275423344,430227734,506948616,659060556,883997877,958139571,1322822218,1537002063,1747873779,1955562222,2024104815,-2067236844,-1933114872,-1866530822,-1538233109,-1090935817,-965641998],S="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_",r=[];class k{_data=new l;_hash=new l([...z]);_nDataBytes=0;_minBufferSize=0;finalize(e){e&&this._append(e);const s=this._nDataBytes*8,t=this._data.sigBytes*8;return this._data.words[t>>>5]|=128<<24-t%32,this._data.words[(t+64>>>9<<4)+14]=Math.floor(s/4294967296),this._data.words[(t+64>>>9<<4)+15]=s,this._data.sigBytes=this._data.words.length*4,this._process(),this._hash}_doProcessBlock(e,s){const t=this._hash.words;let i=t[0],o=t[1],a=t[2],c=t[3],h=t[4],g=t[5],f=t[6],y=t[7];for(let n=0;n<64;n++){if(n<16)r[n]=e[s+n]|0;else {const d=r[n-15],j=(d<<25|d>>>7)^(d<<14|d>>>18)^d>>>3,B=r[n-2],x=(B<<15|B>>>17)^(B<<13|B>>>19)^B>>>10;r[n]=j+r[n-7]+x+r[n-16];}const m=h&g^~h&f,p=i&o^i&a^o&a,u=(i<<30|i>>>2)^(i<<19|i>>>13)^(i<<10|i>>>22),b=(h<<26|h>>>6)^(h<<21|h>>>11)^(h<<7|h>>>25),w=y+b+m+R[n]+r[n],M=u+p;y=f,f=g,g=h,h=c+w|0,c=a,a=o,o=i,i=w+M|0;}t[0]=t[0]+i|0,t[1]=t[1]+o|0,t[2]=t[2]+a|0,t[3]=t[3]+c|0,t[4]=t[4]+h|0,t[5]=t[5]+g|0,t[6]=t[6]+f|0,t[7]=t[7]+y|0;}_append(e){typeof e=="string"&&(e=l.fromUtf8(e)),this._data.concat(e),this._nDataBytes+=e.sigBytes;}_process(e){let s,t=this._data.sigBytes/64;e?t=Math.ceil(t):t=Math.max((t|0)-this._minBufferSize,0);const i=t*16,o=Math.min(i*4,this._data.sigBytes);if(i){for(let a=0;a<i;a+=16)this._doProcessBlock(this._data.words,a);s=this._data.words.splice(0,i),this._data.sigBytes-=o;}return new l(s,o)}}class l{words;sigBytes;constructor(e,s){e=this.words=e||[],this.sigBytes=s===void 0?e.length*4:s;}static fromUtf8(e){const s=unescape(encodeURIComponent(e)),t=s.length,i=[];for(let o=0;o<t;o++)i[o>>>2]|=(s.charCodeAt(o)&255)<<24-o%4*8;return new l(i,t)}toBase64(){const e=[];for(let s=0;s<this.sigBytes;s+=3){const t=this.words[s>>>2]>>>24-s%4*8&255,i=this.words[s+1>>>2]>>>24-(s+1)%4*8&255,o=this.words[s+2>>>2]>>>24-(s+2)%4*8&255,a=t<<16|i<<8|o;for(let c=0;c<4&&s*8+c*6<this.sigBytes*8;c++)e.push(S.charAt(a>>>6*(3-c)&63));}return e.join("")}concat(e){if(this.words[this.sigBytes>>>2]&=4294967295<<32-this.sigBytes%4*8,this.words.length=Math.ceil(this.sigBytes/4),this.sigBytes%4)for(let s=0;s<e.sigBytes;s++){const t=e.words[s>>>2]>>>24-s%4*8&255;this.words[this.sigBytes+s>>>2]|=t<<24-(this.sigBytes+s)%4*8;}else for(let s=0;s<e.sigBytes;s+=4)this.words[this.sigBytes+s>>>2]=e.words[s>>>2];this.sigBytes+=e.sigBytes;}}function digest(_){return new k().finalize(_).toBase64()}

function hash$1(input) {
  return digest(serialize$1(input));
}

const Hasher = /* @__PURE__ */ (() => {
  class Hasher2 {
    buff = "";
    #context = /* @__PURE__ */ new Map();
    write(str) {
      this.buff += str;
    }
    dispatch(value) {
      const type = value === null ? "null" : typeof value;
      return this[type](value);
    }
    object(object) {
      if (object && typeof object.toJSON === "function") {
        return this.object(object.toJSON());
      }
      const objString = Object.prototype.toString.call(object);
      let objType = "";
      const objectLength = objString.length;
      objType = objectLength < 10 ? "unknown:[" + objString + "]" : objString.slice(8, objectLength - 1);
      objType = objType.toLowerCase();
      let objectNumber = null;
      if ((objectNumber = this.#context.get(object)) === void 0) {
        this.#context.set(object, this.#context.size);
      } else {
        return this.dispatch("[CIRCULAR:" + objectNumber + "]");
      }
      if (typeof Buffer !== "undefined" && Buffer.isBuffer && Buffer.isBuffer(object)) {
        this.write("buffer:");
        return this.write(object.toString("utf8"));
      }
      if (objType !== "object" && objType !== "function" && objType !== "asyncfunction") {
        if (this[objType]) {
          this[objType](object);
        } else {
          this.unknown(object, objType);
        }
      } else {
        const keys = Object.keys(object).sort();
        const extraKeys = [];
        this.write("object:" + (keys.length + extraKeys.length) + ":");
        const dispatchForKey = (key) => {
          this.dispatch(key);
          this.write(":");
          this.dispatch(object[key]);
          this.write(",");
        };
        for (const key of keys) {
          dispatchForKey(key);
        }
        for (const key of extraKeys) {
          dispatchForKey(key);
        }
      }
    }
    array(arr, unordered) {
      unordered = unordered === void 0 ? false : unordered;
      this.write("array:" + arr.length + ":");
      if (!unordered || arr.length <= 1) {
        for (const entry of arr) {
          this.dispatch(entry);
        }
        return;
      }
      const contextAdditions = /* @__PURE__ */ new Map();
      const entries = arr.map((entry) => {
        const hasher = new Hasher2();
        hasher.dispatch(entry);
        for (const [key, value] of hasher.#context) {
          contextAdditions.set(key, value);
        }
        return hasher.toString();
      });
      this.#context = contextAdditions;
      entries.sort();
      return this.array(entries, false);
    }
    date(date) {
      return this.write("date:" + date.toJSON());
    }
    symbol(sym) {
      return this.write("symbol:" + sym.toString());
    }
    unknown(value, type) {
      this.write(type);
      if (!value) {
        return;
      }
      this.write(":");
      if (value && typeof value.entries === "function") {
        return this.array(
          [...value.entries()],
          true
          /* ordered */
        );
      }
    }
    error(err) {
      return this.write("error:" + err.toString());
    }
    boolean(bool) {
      return this.write("bool:" + bool);
    }
    string(string) {
      this.write("string:" + string.length + ":");
      this.write(string);
    }
    function(fn) {
      this.write("fn:");
      if (isNativeFunction(fn)) {
        this.dispatch("[native]");
      } else {
        this.dispatch(fn.toString());
      }
    }
    number(number) {
      return this.write("number:" + number);
    }
    null() {
      return this.write("Null");
    }
    undefined() {
      return this.write("Undefined");
    }
    regexp(regex) {
      return this.write("regex:" + regex.toString());
    }
    arraybuffer(arr) {
      this.write("arraybuffer:");
      return this.dispatch(new Uint8Array(arr));
    }
    url(url) {
      return this.write("url:" + url.toString());
    }
    map(map) {
      this.write("map:");
      const arr = [...map];
      return this.array(arr, false);
    }
    set(set) {
      this.write("set:");
      const arr = [...set];
      return this.array(arr, false);
    }
    bigint(number) {
      return this.write("bigint:" + number.toString());
    }
  }
  for (const type of [
    "uint8array",
    "uint8clampedarray",
    "unt8array",
    "uint16array",
    "unt16array",
    "uint32array",
    "unt32array",
    "float32array",
    "float64array"
  ]) {
    Hasher2.prototype[type] = function(arr) {
      this.write(type + ":");
      return this.array([...arr], false);
    };
  }
  function isNativeFunction(f) {
    if (typeof f !== "function") {
      return false;
    }
    return Function.prototype.toString.call(f).slice(
      -15
      /* "[native code] }".length */
    ) === "[native code] }";
  }
  return Hasher2;
})();
function serialize(object) {
  const hasher = new Hasher();
  hasher.dispatch(object);
  return hasher.buff;
}
function hash(value) {
  return digest(typeof value === "string" ? value : serialize(value)).replace(/[-_]/g, "").slice(0, 10);
}

function defaultCacheOptions() {
  return {
    name: "_",
    base: "/cache",
    swr: true,
    maxAge: 1
  };
}
function defineCachedFunction(fn, opts = {}) {
  opts = { ...defaultCacheOptions(), ...opts };
  const pending = {};
  const group = opts.group || "nitro/functions";
  const name = opts.name || fn.name || "_";
  const integrity = opts.integrity || hash([fn, opts]);
  const validate = opts.validate || ((entry) => entry.value !== void 0);
  async function get(key, resolver, shouldInvalidateCache, event) {
    const cacheKey = [opts.base, group, name, key + ".json"].filter(Boolean).join(":").replace(/:\/$/, ":index");
    let entry = await useStorage().getItem(cacheKey).catch((error) => {
      console.error(`[cache] Cache read error.`, error);
      useNitroApp().captureError(error, { event, tags: ["cache"] });
    }) || {};
    if (typeof entry !== "object") {
      entry = {};
      const error = new Error("Malformed data read from cache.");
      console.error("[cache]", error);
      useNitroApp().captureError(error, { event, tags: ["cache"] });
    }
    const ttl = (opts.maxAge ?? 0) * 1e3;
    if (ttl) {
      entry.expires = Date.now() + ttl;
    }
    const expired = shouldInvalidateCache || entry.integrity !== integrity || ttl && Date.now() - (entry.mtime || 0) > ttl || validate(entry) === false;
    const _resolve = async () => {
      const isPending = pending[key];
      if (!isPending) {
        if (entry.value !== void 0 && (opts.staleMaxAge || 0) >= 0 && opts.swr === false) {
          entry.value = void 0;
          entry.integrity = void 0;
          entry.mtime = void 0;
          entry.expires = void 0;
        }
        pending[key] = Promise.resolve(resolver());
      }
      try {
        entry.value = await pending[key];
      } catch (error) {
        if (!isPending) {
          delete pending[key];
        }
        throw error;
      }
      if (!isPending) {
        entry.mtime = Date.now();
        entry.integrity = integrity;
        delete pending[key];
        if (validate(entry) !== false) {
          let setOpts;
          if (opts.maxAge && !opts.swr) {
            setOpts = { ttl: opts.maxAge };
          }
          const promise = useStorage().setItem(cacheKey, entry, setOpts).catch((error) => {
            console.error(`[cache] Cache write error.`, error);
            useNitroApp().captureError(error, { event, tags: ["cache"] });
          });
          if (event?.waitUntil) {
            event.waitUntil(promise);
          }
        }
      }
    };
    const _resolvePromise = expired ? _resolve() : Promise.resolve();
    if (entry.value === void 0) {
      await _resolvePromise;
    } else if (expired && event && event.waitUntil) {
      event.waitUntil(_resolvePromise);
    }
    if (opts.swr && validate(entry) !== false) {
      _resolvePromise.catch((error) => {
        console.error(`[cache] SWR handler error.`, error);
        useNitroApp().captureError(error, { event, tags: ["cache"] });
      });
      return entry;
    }
    return _resolvePromise.then(() => entry);
  }
  return async (...args) => {
    const shouldBypassCache = await opts.shouldBypassCache?.(...args);
    if (shouldBypassCache) {
      return fn(...args);
    }
    const key = await (opts.getKey || getKey)(...args);
    const shouldInvalidateCache = await opts.shouldInvalidateCache?.(...args);
    const entry = await get(
      key,
      () => fn(...args),
      shouldInvalidateCache,
      args[0] && isEvent(args[0]) ? args[0] : void 0
    );
    let value = entry.value;
    if (opts.transform) {
      value = await opts.transform(entry, ...args) || value;
    }
    return value;
  };
}
function cachedFunction(fn, opts = {}) {
  return defineCachedFunction(fn, opts);
}
function getKey(...args) {
  return args.length > 0 ? hash(args) : "";
}
function escapeKey(key) {
  return String(key).replace(/\W/g, "");
}
function defineCachedEventHandler(handler, opts = defaultCacheOptions()) {
  const variableHeaderNames = (opts.varies || []).filter(Boolean).map((h) => h.toLowerCase()).sort();
  const _opts = {
    ...opts,
    getKey: async (event) => {
      const customKey = await opts.getKey?.(event);
      if (customKey) {
        return escapeKey(customKey);
      }
      const _path = event.node.req.originalUrl || event.node.req.url || event.path;
      let _pathname;
      try {
        _pathname = escapeKey(decodeURI(parseURL(_path).pathname)).slice(0, 16) || "index";
      } catch {
        _pathname = "-";
      }
      const _hashedPath = `${_pathname}.${hash(_path)}`;
      const _headers = variableHeaderNames.map((header) => [header, event.node.req.headers[header]]).map(([name, value]) => `${escapeKey(name)}.${hash(value)}`);
      return [_hashedPath, ..._headers].join(":");
    },
    validate: (entry) => {
      if (!entry.value) {
        return false;
      }
      if (entry.value.code >= 400) {
        return false;
      }
      if (entry.value.body === void 0) {
        return false;
      }
      if (entry.value.headers.etag === "undefined" || entry.value.headers["last-modified"] === "undefined") {
        return false;
      }
      return true;
    },
    group: opts.group || "nitro/handlers",
    integrity: opts.integrity || hash([handler, opts])
  };
  const _cachedHandler = cachedFunction(
    async (incomingEvent) => {
      const variableHeaders = {};
      for (const header of variableHeaderNames) {
        const value = incomingEvent.node.req.headers[header];
        if (value !== void 0) {
          variableHeaders[header] = value;
        }
      }
      const reqProxy = cloneWithProxy(incomingEvent.node.req, {
        headers: variableHeaders
      });
      const resHeaders = {};
      let _resSendBody;
      const resProxy = cloneWithProxy(incomingEvent.node.res, {
        statusCode: 200,
        writableEnded: false,
        writableFinished: false,
        headersSent: false,
        closed: false,
        getHeader(name) {
          return resHeaders[name];
        },
        setHeader(name, value) {
          resHeaders[name] = value;
          return this;
        },
        getHeaderNames() {
          return Object.keys(resHeaders);
        },
        hasHeader(name) {
          return name in resHeaders;
        },
        removeHeader(name) {
          delete resHeaders[name];
        },
        getHeaders() {
          return resHeaders;
        },
        end(chunk, arg2, arg3) {
          if (typeof chunk === "string") {
            _resSendBody = chunk;
          }
          if (typeof arg2 === "function") {
            arg2();
          }
          if (typeof arg3 === "function") {
            arg3();
          }
          return this;
        },
        write(chunk, arg2, arg3) {
          if (typeof chunk === "string") {
            _resSendBody = chunk;
          }
          if (typeof arg2 === "function") {
            arg2(void 0);
          }
          if (typeof arg3 === "function") {
            arg3();
          }
          return true;
        },
        writeHead(statusCode, headers2) {
          this.statusCode = statusCode;
          if (headers2) {
            if (Array.isArray(headers2) || typeof headers2 === "string") {
              throw new TypeError("Raw headers  is not supported.");
            }
            for (const header in headers2) {
              const value = headers2[header];
              if (value !== void 0) {
                this.setHeader(
                  header,
                  value
                );
              }
            }
          }
          return this;
        }
      });
      const event = createEvent(reqProxy, resProxy);
      event.fetch = (url, fetchOptions) => fetchWithEvent(event, url, fetchOptions, {
        fetch: useNitroApp().localFetch
      });
      event.$fetch = (url, fetchOptions) => fetchWithEvent(event, url, fetchOptions, {
        fetch: globalThis.$fetch
      });
      event.waitUntil = incomingEvent.waitUntil;
      event.context = incomingEvent.context;
      event.context.cache = {
        options: _opts
      };
      const body = await handler(event) || _resSendBody;
      const headers = event.node.res.getHeaders();
      headers.etag = String(
        headers.Etag || headers.etag || `W/"${hash(body)}"`
      );
      headers["last-modified"] = String(
        headers["Last-Modified"] || headers["last-modified"] || (/* @__PURE__ */ new Date()).toUTCString()
      );
      const cacheControl = [];
      if (opts.swr) {
        if (opts.maxAge) {
          cacheControl.push(`s-maxage=${opts.maxAge}`);
        }
        if (opts.staleMaxAge) {
          cacheControl.push(`stale-while-revalidate=${opts.staleMaxAge}`);
        } else {
          cacheControl.push("stale-while-revalidate");
        }
      } else if (opts.maxAge) {
        cacheControl.push(`max-age=${opts.maxAge}`);
      }
      if (cacheControl.length > 0) {
        headers["cache-control"] = cacheControl.join(", ");
      }
      const cacheEntry = {
        code: event.node.res.statusCode,
        headers,
        body
      };
      return cacheEntry;
    },
    _opts
  );
  return defineEventHandler(async (event) => {
    if (opts.headersOnly) {
      if (handleCacheHeaders(event, { maxAge: opts.maxAge })) {
        return;
      }
      return handler(event);
    }
    const response = await _cachedHandler(
      event
    );
    if (event.node.res.headersSent || event.node.res.writableEnded) {
      return response.body;
    }
    if (handleCacheHeaders(event, {
      modifiedTime: new Date(response.headers["last-modified"]),
      etag: response.headers.etag,
      maxAge: opts.maxAge
    })) {
      return;
    }
    event.node.res.statusCode = response.code;
    for (const name in response.headers) {
      const value = response.headers[name];
      if (name === "set-cookie") {
        event.node.res.appendHeader(
          name,
          splitCookiesString(value)
        );
      } else {
        if (value !== void 0) {
          event.node.res.setHeader(name, value);
        }
      }
    }
    return response.body;
  });
}
function cloneWithProxy(obj, overrides) {
  return new Proxy(obj, {
    get(target, property, receiver) {
      if (property in overrides) {
        return overrides[property];
      }
      return Reflect.get(target, property, receiver);
    },
    set(target, property, value, receiver) {
      if (property in overrides) {
        overrides[property] = value;
        return true;
      }
      return Reflect.set(target, property, value, receiver);
    }
  });
}
const cachedEventHandler = defineCachedEventHandler;

function klona(x) {
	if (typeof x !== 'object') return x;

	var k, tmp, str=Object.prototype.toString.call(x);

	if (str === '[object Object]') {
		if (x.constructor !== Object && typeof x.constructor === 'function') {
			tmp = new x.constructor();
			for (k in x) {
				if (x.hasOwnProperty(k) && tmp[k] !== x[k]) {
					tmp[k] = klona(x[k]);
				}
			}
		} else {
			tmp = {}; // null
			for (k in x) {
				if (k === '__proto__') {
					Object.defineProperty(tmp, k, {
						value: klona(x[k]),
						configurable: true,
						enumerable: true,
						writable: true,
					});
				} else {
					tmp[k] = klona(x[k]);
				}
			}
		}
		return tmp;
	}

	if (str === '[object Array]') {
		k = x.length;
		for (tmp=Array(k); k--;) {
			tmp[k] = klona(x[k]);
		}
		return tmp;
	}

	if (str === '[object Set]') {
		tmp = new Set;
		x.forEach(function (val) {
			tmp.add(klona(val));
		});
		return tmp;
	}

	if (str === '[object Map]') {
		tmp = new Map;
		x.forEach(function (val, key) {
			tmp.set(klona(key), klona(val));
		});
		return tmp;
	}

	if (str === '[object Date]') {
		return new Date(+x);
	}

	if (str === '[object RegExp]') {
		tmp = new RegExp(x.source, x.flags);
		tmp.lastIndex = x.lastIndex;
		return tmp;
	}

	if (str === '[object DataView]') {
		return new x.constructor( klona(x.buffer) );
	}

	if (str === '[object ArrayBuffer]') {
		return x.slice(0);
	}

	// ArrayBuffer.isView(x)
	// ~> `new` bcuz `Buffer.slice` => ref
	if (str.slice(-6) === 'Array]') {
		return new x.constructor(x);
	}

	return x;
}

const inlineAppConfig = {
  "nuxt": {}
};



const appConfig = defuFn(inlineAppConfig);

const NUMBER_CHAR_RE = /\d/;
const STR_SPLITTERS = ["-", "_", "/", "."];
function isUppercase(char = "") {
  if (NUMBER_CHAR_RE.test(char)) {
    return void 0;
  }
  return char !== char.toLowerCase();
}
function splitByCase(str, separators) {
  const splitters = STR_SPLITTERS;
  const parts = [];
  if (!str || typeof str !== "string") {
    return parts;
  }
  let buff = "";
  let previousUpper;
  let previousSplitter;
  for (const char of str) {
    const isSplitter = splitters.includes(char);
    if (isSplitter === true) {
      parts.push(buff);
      buff = "";
      previousUpper = void 0;
      continue;
    }
    const isUpper = isUppercase(char);
    if (previousSplitter === false) {
      if (previousUpper === false && isUpper === true) {
        parts.push(buff);
        buff = char;
        previousUpper = isUpper;
        continue;
      }
      if (previousUpper === true && isUpper === false && buff.length > 1) {
        const lastChar = buff.at(-1);
        parts.push(buff.slice(0, Math.max(0, buff.length - 1)));
        buff = lastChar + char;
        previousUpper = isUpper;
        continue;
      }
    }
    buff += char;
    previousUpper = isUpper;
    previousSplitter = isSplitter;
  }
  parts.push(buff);
  return parts;
}
function kebabCase(str, joiner) {
  return str ? (Array.isArray(str) ? str : splitByCase(str)).map((p) => p.toLowerCase()).join(joiner) : "";
}
function snakeCase(str) {
  return kebabCase(str || "", "_");
}

function getEnv(key, opts) {
  const envKey = snakeCase(key).toUpperCase();
  return destr(
    unenvProcess.env[opts.prefix + envKey] ?? unenvProcess.env[opts.altPrefix + envKey]
  );
}
function _isObject(input) {
  return typeof input === "object" && !Array.isArray(input);
}
function applyEnv(obj, opts, parentKey = "") {
  for (const key in obj) {
    const subKey = parentKey ? `${parentKey}_${key}` : key;
    const envValue = getEnv(subKey, opts);
    if (_isObject(obj[key])) {
      if (_isObject(envValue)) {
        obj[key] = { ...obj[key], ...envValue };
        applyEnv(obj[key], opts, subKey);
      } else if (envValue === void 0) {
        applyEnv(obj[key], opts, subKey);
      } else {
        obj[key] = envValue ?? obj[key];
      }
    } else {
      obj[key] = envValue ?? obj[key];
    }
    if (opts.envExpansion && typeof obj[key] === "string") {
      obj[key] = _expandFromEnv(obj[key]);
    }
  }
  return obj;
}
const envExpandRx = /\{\{([^{}]*)\}\}/g;
function _expandFromEnv(value) {
  return value.replace(envExpandRx, (match, key) => {
    return unenvProcess.env[key] || match;
  });
}

const _inlineRuntimeConfig = {
  "app": {
    "baseURL": "/",
    "buildId": "e98418f7-9aea-40a8-814b-11596f33c847",
    "buildAssetsDir": "/_nuxt/",
    "cdnURL": ""
  },
  "nitro": {
    "envPrefix": "NUXT_",
    "routeRules": {
      "/__nuxt_error": {
        "cache": false
      },
      "/_nuxt/builds/meta/**": {
        "headers": {
          "cache-control": "public, max-age=31536000, immutable"
        }
      },
      "/_nuxt/builds/**": {
        "headers": {
          "cache-control": "public, max-age=1, immutable"
        }
      },
      "/_nuxt/**": {
        "headers": {
          "cache-control": "public, max-age=31536000, immutable"
        }
      }
    }
  },
  "public": {}
};
const envOptions = {
  prefix: "NITRO_",
  altPrefix: _inlineRuntimeConfig.nitro.envPrefix ?? unenvProcess.env.NITRO_ENV_PREFIX ?? "_",
  envExpansion: _inlineRuntimeConfig.nitro.envExpansion ?? unenvProcess.env.NITRO_ENV_EXPANSION ?? false
};
const _sharedRuntimeConfig = _deepFreeze(
  applyEnv(klona(_inlineRuntimeConfig), envOptions)
);
function useRuntimeConfig(event) {
  if (!event) {
    return _sharedRuntimeConfig;
  }
  if (event.context.nitro.runtimeConfig) {
    return event.context.nitro.runtimeConfig;
  }
  const runtimeConfig = klona(_inlineRuntimeConfig);
  applyEnv(runtimeConfig, envOptions);
  event.context.nitro.runtimeConfig = runtimeConfig;
  return runtimeConfig;
}
_deepFreeze(klona(appConfig));
function _deepFreeze(object) {
  const propNames = Object.getOwnPropertyNames(object);
  for (const name of propNames) {
    const value = object[name];
    if (value && typeof value === "object") {
      _deepFreeze(value);
    }
  }
  return Object.freeze(object);
}
new Proxy(/* @__PURE__ */ Object.create(null), {
  get: (_, prop) => {
    console.warn(
      "Please use `useRuntimeConfig()` instead of accessing config directly."
    );
    const runtimeConfig = useRuntimeConfig();
    if (prop in runtimeConfig) {
      return runtimeConfig[prop];
    }
    return void 0;
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
const defaultNamespace = _globalThis[globalKey] || (_globalThis[globalKey] = createNamespace());
const getContext = (key, opts = {}) => defaultNamespace.get(key, opts);
const asyncHandlersKey = "__unctx_async_handlers__";
const asyncHandlers = _globalThis[asyncHandlersKey] || (_globalThis[asyncHandlersKey] = /* @__PURE__ */ new Set());

getContext("nitro-app", {
  asyncContext: false,
  AsyncLocalStorage: void 0
});

const config = useRuntimeConfig();
const _routeRulesMatcher = toRouteMatcher(
  createRouter$1({ routes: config.nitro.routeRules })
);
function createRouteRulesHandler(ctx) {
  return eventHandler((event) => {
    const routeRules = getRouteRules(event);
    if (routeRules.headers) {
      setHeaders(event, routeRules.headers);
    }
    if (routeRules.redirect) {
      let target = routeRules.redirect.to;
      if (target.endsWith("/**")) {
        let targetPath = event.path;
        const strpBase = routeRules.redirect._redirectStripBase;
        if (strpBase) {
          targetPath = withoutBase(targetPath, strpBase);
        }
        target = joinURL(target.slice(0, -3), targetPath);
      } else if (event.path.includes("?")) {
        const query = getQuery$1(event.path);
        target = withQuery(target, query);
      }
      return sendRedirect(event, target, routeRules.redirect.statusCode);
    }
    if (routeRules.proxy) {
      let target = routeRules.proxy.to;
      if (target.endsWith("/**")) {
        let targetPath = event.path;
        const strpBase = routeRules.proxy._proxyStripBase;
        if (strpBase) {
          targetPath = withoutBase(targetPath, strpBase);
        }
        target = joinURL(target.slice(0, -3), targetPath);
      } else if (event.path.includes("?")) {
        const query = getQuery$1(event.path);
        target = withQuery(target, query);
      }
      return proxyRequest(event, target, {
        fetch: ctx.localFetch,
        ...routeRules.proxy
      });
    }
  });
}
function getRouteRules(event) {
  event.context._nitro = event.context._nitro || {};
  if (!event.context._nitro.routeRules) {
    event.context._nitro.routeRules = getRouteRulesForPath(
      withoutBase(event.path.split("?")[0], useRuntimeConfig().app.baseURL)
    );
  }
  return event.context._nitro.routeRules;
}
function getRouteRulesForPath(path) {
  return defu({}, ..._routeRulesMatcher.matchAll(path).reverse());
}

const METHOD_WITH_BODY_RE = /post|put|patch/i;
function requestHasBody(request) {
  return METHOD_WITH_BODY_RE.test(request.method);
}
function joinHeaders(value) {
  return Array.isArray(value) ? value.join(", ") : String(value);
}
function normalizeFetchResponse(response) {
  if (!response.headers.has("set-cookie")) {
    return response;
  }
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: normalizeCookieHeaders(response.headers)
  });
}
function normalizeCookieHeader(header = "") {
  return splitCookiesString(joinHeaders(header));
}
function normalizeCookieHeaders(headers) {
  const outgoingHeaders = new Headers();
  for (const [name, header] of headers) {
    if (name === "set-cookie") {
      for (const cookie of normalizeCookieHeader(header)) {
        outgoingHeaders.append("set-cookie", cookie);
      }
    } else {
      outgoingHeaders.set(name, joinHeaders(header));
    }
  }
  return outgoingHeaders;
}

function isJsonRequest(event) {
  if (hasReqHeader(event, "accept", "text/html")) {
    return false;
  }
  return hasReqHeader(event, "accept", "application/json") || hasReqHeader(event, "user-agent", "curl/") || hasReqHeader(event, "user-agent", "httpie/") || hasReqHeader(event, "sec-fetch-mode", "cors") || event.path.startsWith("/api/") || event.path.endsWith(".json");
}
function hasReqHeader(event, name, includes) {
  const value = getRequestHeader(event, name);
  return value && typeof value === "string" && value.toLowerCase().includes(includes);
}
function normalizeError(error, isDev) {
  const cwd = typeof unenvProcess.cwd === "function" ? unenvProcess.cwd() : "/";
  const stack = (error.unhandled || error.fatal) ? [] : (error.stack || "").split("\n").splice(1).filter((line) => line.includes("at ")).map((line) => {
    const text = line.replace(cwd + "/", "./").replace("webpack:/", "").replace("file://", "").trim();
    return {
      text,
      internal: line.includes("node_modules") && !line.includes(".cache") || line.includes("internal") || line.includes("new Promise")
    };
  });
  const statusCode = error.statusCode || 500;
  const statusMessage = error.statusMessage ?? (statusCode === 404 ? "Not Found" : "");
  const message = error.unhandled ? "internal server error" : error.message || error.toString();
  return {
    stack,
    statusCode,
    statusMessage,
    message
  };
}

const errorHandler$0 = (async function errorhandler(error, event) {
  const { stack, statusCode, statusMessage, message } = normalizeError(error);
  const errorObject = {
    url: event.path,
    statusCode,
    statusMessage,
    message,
    stack: "",
    // TODO: check and validate error.data for serialisation into query
    data: error.data
  };
  if (error.unhandled || error.fatal) {
    const tags = [
      "[nuxt]",
      "[request error]",
      error.unhandled && "[unhandled]",
      error.fatal && "[fatal]",
      Number(errorObject.statusCode) !== 200 && `[${errorObject.statusCode}]`
    ].filter(Boolean).join(" ");
    console.error(tags, errorObject.message + "\n" + stack.map((l) => "  " + l.text).join("  \n"));
  }
  if (event.handled) {
    return;
  }
  setResponseStatus(event, errorObject.statusCode !== 200 && errorObject.statusCode || 500, errorObject.statusMessage);
  if (isJsonRequest(event)) {
    setResponseHeader(event, "Content-Type", "application/json");
    return send(event, JSON.stringify(errorObject));
  }
  const reqHeaders = getRequestHeaders(event);
  const isRenderingError = event.path.startsWith("/__nuxt_error") || !!reqHeaders["x-nuxt-error"];
  const res = isRenderingError ? null : await useNitroApp().localFetch(
    withQuery(joinURL(useRuntimeConfig(event).app.baseURL, "/__nuxt_error"), errorObject),
    {
      headers: { ...reqHeaders, "x-nuxt-error": "true" },
      redirect: "manual"
    }
  ).catch(() => null);
  if (!res) {
    const { template } = await import('../_/error-500.mjs');
    if (event.handled) {
      return;
    }
    setResponseHeader(event, "Content-Type", "text/html;charset=UTF-8");
    return send(event, template(errorObject));
  }
  const html = await res.text();
  if (event.handled) {
    return;
  }
  for (const [header, value] of res.headers.entries()) {
    setResponseHeader(event, header, value);
  }
  setResponseStatus(event, res.status && res.status !== 200 ? res.status : void 0, res.statusText);
  return send(event, html);
});

function defineNitroErrorHandler(handler) {
  return handler;
}

const errorHandler$1 = defineNitroErrorHandler(
  function defaultNitroErrorHandler(error, event) {
    const res = defaultHandler(error, event);
    setResponseHeaders(event, res.headers);
    setResponseStatus(event, res.status, res.statusText);
    return send(event, JSON.stringify(res.body, null, 2));
  }
);
function defaultHandler(error, event, opts) {
  const isSensitive = error.unhandled || error.fatal;
  const statusCode = error.statusCode || 500;
  const statusMessage = error.statusMessage || "Server Error";
  const url = getRequestURL(event, { xForwardedHost: true, xForwardedProto: true });
  if (statusCode === 404) {
    const baseURL = "/";
    if (/^\/[^/]/.test(baseURL) && !url.pathname.startsWith(baseURL)) {
      const redirectTo = `${baseURL}${url.pathname.slice(1)}${url.search}`;
      return {
        status: 302,
        statusText: "Found",
        headers: { location: redirectTo },
        body: `Redirecting...`
      };
    }
  }
  if (isSensitive && !opts?.silent) {
    const tags = [error.unhandled && "[unhandled]", error.fatal && "[fatal]"].filter(Boolean).join(" ");
    console.error(`[request error] ${tags} [${event.method}] ${url}
`, error);
  }
  const headers = {
    "content-type": "application/json",
    // Prevent browser from guessing the MIME types of resources.
    "x-content-type-options": "nosniff",
    // Prevent error page from being embedded in an iframe
    "x-frame-options": "DENY",
    // Prevent browsers from sending the Referer header
    "referrer-policy": "no-referrer",
    // Disable the execution of any js
    "content-security-policy": "script-src 'none'; frame-ancestors 'none';"
  };
  setResponseStatus(event, statusCode, statusMessage);
  if (statusCode === 404 || !getResponseHeader(event, "cache-control")) {
    headers["cache-control"] = "no-cache";
  }
  const body = {
    error: true,
    url: url.href,
    statusCode,
    statusMessage,
    message: isSensitive ? "Server Error" : error.message,
    data: isSensitive ? void 0 : error.data
  };
  return {
    status: statusCode,
    statusText: statusMessage,
    headers,
    body
  };
}

const errorHandlers = [errorHandler$0, errorHandler$1];

async function errorHandler(error, event) {
  for (const handler of errorHandlers) {
    try {
      await handler(error, event, { defaultHandler });
      if (event.handled) {
        return; // Response handled
      }
    } catch(error) {
      // Handler itself thrown, log and continue
      console.error(error);
    }
  }
  // H3 will handle fallback
}

const plugins = [
  
];

const _lazy_e5z1dq = () => import('../routes/api/experience.get.mjs');
const _lazy_IY4WeZ = () => import('../routes/api/profile.get.mjs');
const _lazy_TJ_pkV = () => import('../routes/api/projects.get.mjs');
const _lazy_Te9wGc = () => import('../routes/api/skills.get.mjs');
const _lazy_H_OTV_ = () => import('../routes/renderer.mjs').then(function (n) { return n.Y; });

const handlers = [
  { route: '/api/experience', handler: _lazy_e5z1dq, lazy: true, middleware: false, method: "get" },
  { route: '/api/profile', handler: _lazy_IY4WeZ, lazy: true, middleware: false, method: "get" },
  { route: '/api/projects', handler: _lazy_TJ_pkV, lazy: true, middleware: false, method: "get" },
  { route: '/api/skills', handler: _lazy_Te9wGc, lazy: true, middleware: false, method: "get" },
  { route: '/__nuxt_error', handler: _lazy_H_OTV_, lazy: true, middleware: false, method: undefined },
  { route: '/**', handler: _lazy_H_OTV_, lazy: true, middleware: false, method: undefined }
];

function createNitroApp() {
  const config = useRuntimeConfig();
  const hooks = createHooks();
  const captureError = (error, context = {}) => {
    const promise = hooks.callHookParallel("error", error, context).catch((error_) => {
      console.error("Error while capturing another error", error_);
    });
    if (context.event && isEvent(context.event)) {
      const errors = context.event.context.nitro?.errors;
      if (errors) {
        errors.push({ error, context });
      }
      if (context.event.waitUntil) {
        context.event.waitUntil(promise);
      }
    }
  };
  const h3App = createApp({
    debug: destr(false),
    onError: (error, event) => {
      captureError(error, { event, tags: ["request"] });
      return errorHandler(error, event);
    },
    onRequest: async (event) => {
      event.context.nitro = event.context.nitro || { errors: [] };
      const fetchContext = event.node.req?.__unenv__;
      if (fetchContext?._platform) {
        event.context = {
          _platform: fetchContext?._platform,
          // #3335
          ...fetchContext._platform,
          ...event.context
        };
      }
      if (!event.context.waitUntil && fetchContext?.waitUntil) {
        event.context.waitUntil = fetchContext.waitUntil;
      }
      event.fetch = (req, init) => fetchWithEvent(event, req, init, { fetch: localFetch });
      event.$fetch = (req, init) => fetchWithEvent(event, req, init, {
        fetch: $fetch
      });
      event.waitUntil = (promise) => {
        if (!event.context.nitro._waitUntilPromises) {
          event.context.nitro._waitUntilPromises = [];
        }
        event.context.nitro._waitUntilPromises.push(promise);
        if (event.context.waitUntil) {
          event.context.waitUntil(promise);
        }
      };
      event.captureError = (error, context) => {
        captureError(error, { event, ...context });
      };
      await nitroApp$1.hooks.callHook("request", event).catch((error) => {
        captureError(error, { event, tags: ["request"] });
      });
    },
    onBeforeResponse: async (event, response) => {
      await nitroApp$1.hooks.callHook("beforeResponse", event, response).catch((error) => {
        captureError(error, { event, tags: ["request", "response"] });
      });
    },
    onAfterResponse: async (event, response) => {
      await nitroApp$1.hooks.callHook("afterResponse", event, response).catch((error) => {
        captureError(error, { event, tags: ["request", "response"] });
      });
    }
  });
  const router = createRouter({
    preemptive: true
  });
  const nodeHandler = toNodeListener(h3App);
  const localCall = (aRequest) => b(
    nodeHandler,
    aRequest
  );
  const localFetch = (input, init) => {
    if (!input.toString().startsWith("/")) {
      return globalThis.fetch(input, init);
    }
    return C(
      nodeHandler,
      input,
      init
    ).then((response) => normalizeFetchResponse(response));
  };
  const $fetch = createFetch({
    fetch: localFetch,
    Headers: Headers$1,
    defaults: { baseURL: config.app.baseURL }
  });
  globalThis.$fetch = $fetch;
  h3App.use(createRouteRulesHandler({ localFetch }));
  for (const h of handlers) {
    let handler = h.lazy ? lazyEventHandler(h.handler) : h.handler;
    if (h.middleware || !h.route) {
      const middlewareBase = (config.app.baseURL + (h.route || "/")).replace(
        /\/+/g,
        "/"
      );
      h3App.use(middlewareBase, handler);
    } else {
      const routeRules = getRouteRulesForPath(
        h.route.replace(/:\w+|\*\*/g, "_")
      );
      if (routeRules.cache) {
        handler = cachedEventHandler(handler, {
          group: "nitro/routes",
          ...routeRules.cache
        });
      }
      router.use(h.route, handler, h.method);
    }
  }
  h3App.use(config.app.baseURL, router.handler);
  const app = {
    hooks,
    h3App,
    router,
    localCall,
    localFetch,
    captureError
  };
  return app;
}
function runNitroPlugins(nitroApp2) {
  for (const plugin of plugins) {
    try {
      plugin(nitroApp2);
    } catch (error) {
      nitroApp2.captureError(error, { tags: ["plugin"] });
      throw error;
    }
  }
}
const nitroApp$1 = createNitroApp();
function useNitroApp() {
  return nitroApp$1;
}
runNitroPlugins(nitroApp$1);

function defineRenderHandler(render) {
  const runtimeConfig = useRuntimeConfig();
  return eventHandler(async (event) => {
    const nitroApp = useNitroApp();
    const ctx = { event, render, response: void 0 };
    await nitroApp.hooks.callHook("render:before", ctx);
    if (!ctx.response) {
      if (event.path === `${runtimeConfig.app.baseURL}favicon.ico`) {
        setResponseHeader(event, "Content-Type", "image/x-icon");
        return send(
          event,
          "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7"
        );
      }
      ctx.response = await ctx.render(event);
      if (!ctx.response) {
        const _currentStatus = getResponseStatus(event);
        setResponseStatus(event, _currentStatus === 200 ? 500 : _currentStatus);
        return send(
          event,
          "No response returned from render handler: " + event.path
        );
      }
    }
    await nitroApp.hooks.callHook("render:response", ctx.response, ctx);
    if (ctx.response.headers) {
      setResponseHeaders(event, ctx.response.headers);
    }
    if (ctx.response.statusCode || ctx.response.statusMessage) {
      setResponseStatus(
        event,
        ctx.response.statusCode,
        ctx.response.statusMessage
      );
    }
    return ctx.response.body;
  });
}

const assets = {
  "/_nuxt/B-RL3Org.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"bfc-UkxRvRIiugosX+PMnkFAa2quesQ\"",
    "mtime": "2025-12-16T02:36:13.675Z",
    "size": 3068,
    "path": "../_nuxt/B-RL3Org.js"
  },
  "/_nuxt/B94zrFpH.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"2963-aQrzkjOb3rhVtHMbdHmxt83VSZA\"",
    "mtime": "2025-12-16T02:36:13.675Z",
    "size": 10595,
    "path": "../_nuxt/B94zrFpH.js"
  },
  "/_nuxt/BK1-cXbh.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"4686f-rK2t0x8EQFuMdnKIJ7wrT+3B2zs\"",
    "mtime": "2025-12-16T02:36:13.675Z",
    "size": 288879,
    "path": "../_nuxt/BK1-cXbh.js"
  },
  "/_nuxt/DzRgBJJm.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"31f-TU9ie/wHEyxB6tmi6UaIxDRvdQg\"",
    "mtime": "2025-12-16T02:36:13.675Z",
    "size": 799,
    "path": "../_nuxt/DzRgBJJm.js"
  },
  "/_nuxt/error-404.CCrKRS3i.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"de4-SLOwa5sHvQIi2t5fYZEgfDusMUc\"",
    "mtime": "2025-12-16T02:36:13.675Z",
    "size": 3556,
    "path": "../_nuxt/error-404.CCrKRS3i.css"
  },
  "/_nuxt/error-500.C6AJhnPD.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"75c-I8wgoT19gdl/gPtizNKXfkn+TtQ\"",
    "mtime": "2025-12-16T02:36:13.675Z",
    "size": 1884,
    "path": "../_nuxt/error-500.C6AJhnPD.css"
  },
  "/_nuxt/fedqF3Sz.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"9d9a3-yEJBXWRq5D0Z66LnYGhttSvwtCc\"",
    "mtime": "2025-12-16T02:36:13.676Z",
    "size": 645539,
    "path": "../_nuxt/fedqF3Sz.js"
  },
  "/_nuxt/builds/latest.json": {
    "type": "application/json",
    "etag": "\"47-hD+6fDiM32SEv2wAT9TkDASe6hw\"",
    "mtime": "2025-12-16T02:36:13.673Z",
    "size": 71,
    "path": "../_nuxt/builds/latest.json"
  },
  "/_nuxt/builds/meta/e98418f7-9aea-40a8-814b-11596f33c847.json": {
    "type": "application/json",
    "etag": "\"8b-84RyQT8qdNg/X/Kk5RxqkyCzGcE\"",
    "mtime": "2025-12-16T02:36:13.672Z",
    "size": 139,
    "path": "../_nuxt/builds/meta/e98418f7-9aea-40a8-814b-11596f33c847.json"
  }
};

const publicAssetBases = {"/_nuxt/builds/meta/":{"maxAge":31536000},"/_nuxt/builds/":{"maxAge":1},"/_nuxt/":{"maxAge":31536000}};

function isPublicAssetURL(id = '') {
  if (assets[id]) {
    return true
  }
  for (const base in publicAssetBases) {
    if (id.startsWith(base)) { return true }
  }
  return false
}

const nitroApp = useNitroApp();
const cloudflarePages = {
  async fetch(request, env, context) {
    const url = new URL(request.url);
    if (env.ASSETS && isPublicAssetURL(url.pathname)) {
      return env.ASSETS.fetch(request);
    }
    let body;
    if (requestHasBody(request)) {
      body = Buffer.from(await request.arrayBuffer());
    }
    globalThis.__env__ = env;
    return nitroApp.localFetch(url.pathname + url.search, {
      context: {
        waitUntil: (promise) => context.waitUntil(promise),
        _platform: {
          cf: request.cf,
          cloudflare: {
            request,
            env,
            context
          }
        }
      },
      host: url.hostname,
      protocol: url.protocol,
      method: request.method,
      headers: request.headers,
      body
    });
  },
  scheduled(event, env, context) {
  }
};

export { $fetch as $, cloudflarePages as A, defineRenderHandler as a, getQuery as b, createHooks as c, defineEventHandler as d, createError as e, getRouteRules as f, global as g, useNitroApp as h, getResponseStatusText as i, joinRelativeURL as j, getResponseStatus as k, withQuery as l, hasProtocol as m, isScriptProtocol as n, joinURL as o, getContext as p, createRouter$1 as q, defu as r, sanitizeStatusCode as s, toRouteMatcher as t, useRuntimeConfig as u, hash$1 as v, withLeadingSlash as w, parseQuery as x, withTrailingSlash as y, withoutTrailingSlash as z };
//# sourceMappingURL=nitro.mjs.map
