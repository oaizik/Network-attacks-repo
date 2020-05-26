"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
var crypto = require("crypto");
var express = require("express");
var request = require("request-promise-native");
var bodyParser = require("body-parser");
var MersenneTwister = require('mersenne-twister');
var app = express();
app.get("/getChallenge", function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, key, iv, data;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0: return [4 /*yield*/, enc()];
            case 1:
                _a = _b.sent(), key = _a[0], iv = _a[1], data = _a[2];
                res.json({
                    data: data.toString('hex'),
                    key: key.toString('hex')
                });
                return [2 /*return*/];
        }
    });
}); });
app.post("/attemptChallenge", bodyParser.json(), function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var chlng, key, iv, data;
    return __generator(this, function (_a) {
        console.log('here');
        chlng = req.body;
        key = Buffer.from(chlng.key, 'hex');
        iv = Buffer.alloc(8, 0);
        data = Buffer.from(chlng.data, 'hex');
        res.json(dec(data, key, iv));
        return [2 /*return*/];
    });
}); });
function prepare(data) {
    var sha1 = crypto.createHmac('sha1', "asaf");
    sha1.update(data);
    var tag = sha1.digest();
    var paddingSize = 8 - ((data.length + tag.length) % 8);
    var paddingVal = paddingSize - 1;
    var blockCount = (Math.floor((data.length + tag.length) / 8)) + 1;
    var prep = Buffer.alloc(blockCount * 8);
    data.copy(prep, 0, 0);
    tag.copy(prep, data.length, 0);
    Buffer.alloc(paddingSize, paddingVal).copy(prep, data.length + tag.length, 0);
    console.log(prep);
    return prep;
}
function naiveCBC_MACEncrypt(data, key, iv, dec) {
    var encBlock = Buffer.alloc(data.length);
    var gen = new MersenneTwister();
    gen.init_seed(key.readUInt32LE(0) ^ key.readUInt32LE(4));
    for (var i = 0; i < data.length / 8; i++) {
        var blockKey = Buffer.alloc(8);
        blockKey.writeUInt32LE(gen.random_int(), 0);
        blockKey.writeUInt32LE(gen.random_int(), 4);
        var lastBlock = (i === 0) ? iv : (dec ? data.slice((i - 1) * 8, i * 8) : encBlock.slice((i - 1) * 8, i * 8));
        for (var j = 0; j < 8; j++)
            encBlock[(8 * i) + j] = data[(8 * i) + j] ^ lastBlock[j] ^ blockKey[j];
    }
    return encBlock;
}
function enc() {
    return __awaiter(this, void 0, void 0, function () {
        var req, _a, _b, byteArray, key, iv;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    _b = (_a = JSON).parse;
                    return [4 /*yield*/, request.get('https://baconipsum.com/api/?type=all-meat&sentences=1&start-with-lorem=1')];
                case 1:
                    req = _b.apply(_a, [_c.sent()]);
                    byteArray = Buffer.from(req[0]);
                    key = crypto.randomBytes(8);
                    iv = Buffer.alloc(8, 0);
                    return [2 /*return*/, [key, iv, naiveCBC_MACEncrypt(prepare(byteArray), key, iv, false)]];
            }
        });
    });
}
;
function dec(data, key, iv) {
    var dec = naiveCBC_MACEncrypt(data, key, iv, true);
    var paddingVal = dec[dec.length - 1];
    var paddingLength = paddingVal + 1;
    var padding = dec.slice(dec.length - paddingLength, dec.length);
    if (paddingVal > 7)
        return { error: 'padding' };
    // if (padding.length == 0)
    //     return { error: 'padding' };
    for (var i = 0; i < padding.length - 1; i++)
        if (padding[i] != padding[i + 1])
            return { error: 'pad' };
    console.log(padding);
    console.log("pad ok !");
    var decNoPad = dec.slice(0, dec.length - padding[0] - 1);
    var tag = decNoPad.slice(decNoPad.length - 20, decNoPad.length);
    var pt = decNoPad.slice(0, decNoPad.length - 20);
    var hmac = crypto.createHmac("sha1", "asaf");
    hmac.update(pt);
    var attemptedDigest = hmac.digest();
    if (attemptedDigest.compare(tag) != 0) {
        return { error: 'tag' };
    }
    return { error: 'none' };
}
app.listen(3000, function () { return console.log('server running'); });
