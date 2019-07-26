(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.floodFill = (x, y, width, height, canFlood, onFlood) => {
    x = x | 0;
    y = y | 0;
    let x1;
    let isAbove;
    let isBelow;
    const stack = [[x, y]];
    const pop = () => {
        if (stack.length > 0) {
            [x, y] = stack.pop();
            return true;
        }
        return false;
    };
    while (pop()) {
        x1 = x;
        while (x1 >= 0 && canFlood(x1, y))
            x1--;
        x1++;
        isAbove = isBelow = false;
        while (x1 < width && canFlood(x1, y)) {
            onFlood(x1, y);
            if (!isAbove && y > 0 && canFlood(x1, y - 1)) {
                stack.push([x1, y - 1]);
                isAbove = true;
            }
            else if (isAbove && y > 0 && !canFlood(x1, y - 1)) {
                isAbove = false;
            }
            if (!isBelow && y < height - 1 && canFlood(x1, y + 1)) {
                stack.push([x1, y + 1]);
                isBelow = true;
            }
            else if (isBelow && y < height - 1 && !canFlood(x1, y + 1)) {
                isBelow = false;
            }
            x1++;
        }
    }
};

},{}],2:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const util_1 = require("./util");
exports.imageToImageData = (img) => {
    const { naturalWidth: width, naturalHeight: height } = img;
    const { context } = exports.createCanvasContext(width, height);
    context.drawImage(img, 0, 0);
    return context.getImageData(0, 0, width, height);
};
exports.imageDataToImage = (imageData) => {
    const { width, height } = imageData;
    const { canvas, context } = exports.createCanvasContext(width, height);
    context.putImageData(imageData, 0, 0);
    const img = new Image();
    img.src = canvas.toDataURL();
    return img;
};
exports.createCanvasContext = (width, height) => {
    width = util_1.nonZeroInt(width);
    height = util_1.nonZeroInt(height);
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    Object.assign(canvas, { width, height });
    return { canvas, context };
};

},{"./util":8}],3:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const loaders_1 = require("./loaders");
const paint_1 = require("./paint");
const start = async () => {
    const main = document.querySelector('main');
    const palette = await loaders_1.loadPalette('palette.png');
    const paintApp = paint_1.paint(palette, 9, 10);
    main.appendChild(paintApp);
    // const { light, dark } = splitPaletteToDarkAndLight( palette )
    // const lightImageData = paletteToImageData( light, 32 )
    // const darkImageData = paletteToImageData( dark, 32 )
    // const lightImg = imageDataToImage( lightImageData )
    // const darkImg = imageDataToImage( darkImageData )
    // document.body.append( lightImg )
    // document.body.append( document.createElement( 'br' ) )
    // document.body.append( darkImg )
    // document.body.append( document.createElement( 'br' ) )
};
start();

},{"./loaders":5,"./paint":6}],4:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.line = (x0, y0, x1, y1, action) => {
    x0 = x0 | 0;
    y0 = y0 | 0;
    x1 = x1 | 0;
    y1 = y1 | 0;
    action(x0, y0);
    const dX = Math.abs(x1 - x0);
    const dY = Math.abs(y1 - y0);
    const sX = x0 < x1 ? 1 : -1;
    const sY = y0 < y1 ? 1 : -1;
    let err = dX - dY;
    while (x0 !== x1 || y0 !== y1) {
        const err2 = 2 * err;
        if (err2 > dY * -1) {
            err -= dY;
            x0 += sX;
        }
        if (err2 < dX) {
            err += dX;
            y0 += sY;
        }
        action(x0, y0);
    }
};

},{}],5:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const palette_1 = require("./palette");
const image_1 = require("./image");
exports.loadPalette = async (src) => {
    const img = await exports.loadImage(src);
    const imageData = image_1.imageToImageData(img);
    return palette_1.imageDataToPalette(imageData);
};
exports.loadImage = (src) => new Promise((resolve, reject) => {
    const img = new Image();
    img.addEventListener('load', () => {
        const { naturalWidth, naturalHeight } = img;
        if (naturalWidth === 0 || naturalHeight === 0) {
            return reject(Error('Bad image'));
        }
        resolve(img);
    });
    img.addEventListener('error', () => reject(Error('Bad image')));
    img.src = src;
});

},{"./image":2,"./palette":7}],6:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const util_1 = require("./util");
const palette_1 = require("./palette");
const image_1 = require("./image");
const line_1 = require("./line");
const floodfill_1 = require("./floodfill");
exports.paint = (palette, fill, selected) => {
    const app = util_1.h('div', { class: 'app' }, util_1.css `
      .app {
        display: grid;
        grid-template-rows: auto 1fr;
        grid-gap: 1rem;
      }

      .app .palette {
        display: grid;
        grid-template-columns: auto auto auto 1fr;
        grid-gap: 1rem;
        align-items: center;
      }

      .app .palette img:first-child {
        outline: 1px solid #39f;
      }

      .app .paint-surface {
        position: relative;
      }

      .app .paint-surface canvas {
        height: 100%;
        width: auto;
        image-rendering: auto;
        image-rendering: crisp-edges;
        image-rendering: pixelated;
      }
    `, util_1.h('div', { class: 'palette' }, exports.selectedEl(palette, selected), exports.paletteEl(palette, 32), util_1.h('form', util_1.h('label', util_1.h('input', { type: 'radio', name: 'mode', value: 'paint', checked: '' }), 'paint'), util_1.h('label', util_1.h('input', { type: 'radio', name: 'mode', value: 'fill' }), 'fill'))), util_1.h('div', { class: 'paint-surface' }, exports.paintCanvas(256, 256, palette, fill)));
    return app;
};
exports.paintCanvas = (width, height, palette, fillIndex) => {
    const { canvas, context } = image_1.createCanvasContext(width, height);
    util_1.populateElement(canvas, { width: width, height: height });
    const rgb = palette[fillIndex];
    context.fillStyle = `rgb(${[...rgb].join(',')})`;
    context.fillRect(0, 0, width, height);
    const imageData = context.getImageData(0, 0, width, height);
    let mode = 'paint';
    let drawing = false;
    let last = null;
    let selectedIndex = fillIndex;
    const getCanvasCoords = (e) => {
        const { left, top, height: ch } = canvas.getBoundingClientRect();
        const { clientX, clientY } = e;
        // wrong! only works in landscape
        const dw = width / ch;
        const dh = height / ch;
        const sx = clientX - left;
        const sy = clientY - top;
        const dx = Math.floor(dw * sx);
        const dy = Math.floor(dh * sy);
        return [dx, dy];
    };
    const click = (e) => {
        const form = document.querySelector('form');
        const formData = new FormData(form);
        const m = formData.get('mode');
        if (typeof m === 'string')
            mode = m;
        if (mode === 'paint')
            return;
        const selectEl = document.querySelector('[data-index]');
        selectedIndex = Number(selectEl.dataset.index);
        const [cx, cy] = getCanvasCoords(e);
        const sindex = (cy * width + cx) * 4;
        const sr = imageData.data[sindex];
        const sg = imageData.data[sindex + 1];
        const sb = imageData.data[sindex + 2];
        const srgb = palette_1.createRgb(sr, sg, sb);
        const rgb = palette[selectedIndex];
        if (srgb === rgb) {
            return;
        }
        const [r, g, b] = rgb;
        floodfill_1.floodFill(cx, cy, width, height, (x, y) => {
            const index = (y * width + x) * 4;
            const cr = imageData.data[index];
            const cg = imageData.data[index + 1];
            const cb = imageData.data[index + 2];
            const crgb = palette_1.createRgb(cr, cg, cb);
            return crgb === srgb;
        }, (x, y) => {
            const index = (y * width + x) * 4;
            imageData.data[index] = r;
            imageData.data[index + 1] = g;
            imageData.data[index + 2] = b;
            imageData.data[index + 3] = 255;
        });
        context.putImageData(imageData, 0, 0);
    };
    const mousedown = (e) => {
        if (mode === 'fill')
            return;
        drawing = true;
        last = getCanvasCoords(e);
        const selectEl = document.querySelector('[data-index]');
        selectedIndex = Number(selectEl.dataset.index);
    };
    const mouseup = (e) => {
        drawing = false;
        last = null;
    };
    const mouseleave = (e) => {
        mouseup(e);
    };
    const mousemove = (e) => {
        if (mode === 'fill')
            return;
        if (!drawing || last === null)
            return;
        const [r, g, b] = palette[selectedIndex];
        const [lx, ly] = last;
        const [cx, cy] = getCanvasCoords(e);
        line_1.line(lx, ly, cx, cy, (x, y) => {
            const index = (y * width + x) * 4;
            imageData.data[index] = r;
            imageData.data[index + 1] = g;
            imageData.data[index + 2] = b;
            imageData.data[index + 3] = 255;
        });
        context.putImageData(imageData, 0, 0);
        last = [cx, cy];
    };
    util_1.populateElement(canvas, { mousedown, mousemove, mouseup, mouseleave, click });
    return canvas;
};
exports.selectedEl = (palette, selected, scale = 48) => {
    const selectedImg = palette_1.paletteToImage(palette_1.slicePalette(palette, selected, selected + 1), scale);
    util_1.populateElement(selectedImg, {
        'data-index': selected
    });
    return selectedImg;
};
exports.paletteEl = (palette, scale) => {
    const paletteImg = palette_1.paletteToImage(palette, scale);
    const click = (e) => {
        const { left } = paletteImg.getBoundingClientRect();
        const index = Math.floor((e.clientX - left) / scale);
        const old = paletteImg.previousElementSibling;
        const selected = exports.selectedEl(palette, index);
        old.src = selected.src;
        old.dataset.index = String(index);
    };
    util_1.populateElement(paletteImg, {
        click
    });
    return paletteImg;
};

},{"./floodfill":1,"./image":2,"./line":4,"./palette":7,"./util":8}],7:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const util_1 = require("./util");
const image_1 = require("./image");
const paletteMap = new Map();
exports.createRgb = (r, g, b) => {
    r |= 0;
    g |= 0;
    b |= 0;
    const key = `${r},${g},${b}`;
    if (paletteMap.has(key))
        return paletteMap.get(key);
    const rgb = Object.freeze([r, g, b]);
    paletteMap.set(key, rgb);
    return rgb;
};
exports.imageDataToPalette = (imageData) => {
    const used = new Set();
    const palette = [];
    const { width, height } = imageData;
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const index = (y * width + x) * 4;
            const r = imageData.data[index];
            const g = imageData.data[index + 1];
            const b = imageData.data[index + 2];
            const key = `${r},${g},${b}`;
            if (used.has(key))
                continue;
            const rgb = exports.createRgb(r, g, b);
            palette.push(rgb);
            used.add(key);
        }
    }
    return Object.freeze(palette);
};
exports.paletteToImageData = (palette, scale = 1, columns = palette.length) => {
    scale = util_1.nonZeroInt(scale);
    columns = util_1.nonZeroInt(columns);
    const rows = Math.ceil(palette.length / columns);
    const width = columns * scale;
    const height = rows * scale;
    const imageData = new ImageData(width, height);
    for (let ry = 0; ry < rows; ry++) {
        const dy = ry * scale;
        for (let cx = 0; cx < columns; cx++) {
            const paletteIndex = ry * columns + cx;
            if (paletteIndex >= palette.length)
                continue;
            const [r, g, b] = palette[paletteIndex];
            const dx = cx * scale;
            for (let sy = 0; sy < scale; sy++) {
                const y = dy + sy;
                for (let sx = 0; sx < scale; sx++) {
                    const x = dx + sx;
                    const index = (y * width + x) * 4;
                    imageData.data[index] = r;
                    imageData.data[index + 1] = g;
                    imageData.data[index + 2] = b;
                    imageData.data[index + 3] = 255;
                }
            }
        }
    }
    return imageData;
};
exports.paletteToImage = (palette, scale = 1, columns = palette.length) => {
    const imageData = exports.paletteToImageData(palette, scale, columns);
    return image_1.imageDataToImage(imageData);
};
exports.sortPalette = (palette, comparator) => Object.freeze(Array.from(palette).sort(comparator));
exports.filterPalette = (palette, predicate) => Object.freeze(Array.from(palette).filter(predicate));
exports.mapPalette = (palette, mapper) => Object.freeze(Array.from(palette).map(rgb => {
    const [r, g, b] = mapper(rgb);
    return exports.createRgb(r, g, b);
}));
exports.slicePalette = (palette, start, end) => Object.freeze(Array.from(palette).slice(start, end));
exports.getHue = (rgb) => {
    const [r, g, b] = rgb;
    const min = Math.min(r, g, b);
    const max = Math.max(r, g, b);
    const delta = max - min;
    if (delta === 0)
        return 0;
    let hue = 0;
    if (max === r) {
        hue = (g - b) / delta;
    }
    else if (max === g) {
        hue = 2 + (b - r) / delta;
    }
    else {
        hue = 4 + (r - g) / delta;
    }
    hue *= 60;
    if (hue < 0)
        hue += 360;
    return Math.round(hue);
};
exports.getLuma = (rgb) => {
    const [r, g, b] = rgb;
    return 0.299 * r + 0.587 * g + 0.114 * b;
};
exports.getSaturation = (rgb) => {
    let [r, g, b] = rgb;
    r /= 255;
    g /= 255;
    b /= 255;
    const min = Math.min(r, g, b);
    const max = Math.max(r, b, b);
    const delta = max - min;
    const l = (min + max) / 2;
    return delta / (1 - Math.abs(2 * l - 1));
};
exports.lumaComparator = (a, b) => exports.getLuma(a) - exports.getLuma(b);
exports.hueComparator = (a, b) => exports.getHue(a) - exports.getHue(b);
exports.saturationComparator = (a, b) => exports.getSaturation(a) - exports.getSaturation(b);
exports.splitPaletteToDarkAndLight = (palette) => {
    const half = Math.ceil(palette.length / 2);
    const sorted = exports.sortPalette(palette, exports.lumaComparator);
    const d = [];
    const l = [];
    for (let i = 0; i < sorted.length; i++) {
        const rgb = sorted[i];
        if (i < half) {
            d.push(rgb);
        }
        else {
            l.push(rgb);
        }
    }
    const dark = exports.filterPalette(palette, rgb => d.includes(rgb));
    const light = exports.filterPalette(palette, rgb => l.includes(rgb));
    return { dark, light };
};

},{"./image":2,"./util":8}],8:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.nonZeroInt = (value) => Math.max(Math.floor(value), 1);
exports.h = (name, ...args) => {
    const el = document.createElement(name);
    return exports.populateElement(el, ...args);
};
exports.populateElement = (el, ...args) => {
    args.forEach(arg => {
        if (typeof arg === 'string') {
            el.appendChild(document.createTextNode(arg));
        }
        else if (arg instanceof Node) {
            el.appendChild(arg);
        }
        else if (arg) {
            Object.keys(arg).forEach(key => {
                const value = arg[key];
                if (typeof value === 'function') {
                    el.addEventListener(key, value);
                }
                else {
                    el.setAttribute(key, String(value));
                }
            });
        }
    });
    return el;
};
exports.css = (strings, ...keys) => exports.h('style', strings.map((s, i) => s + (keys[i] || '')).join(''));

},{}]},{},[3]);
