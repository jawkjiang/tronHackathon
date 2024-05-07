"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs = __importStar(require("fs"));
const express_1 = __importDefault(require("express"));
const express_session_1 = __importDefault(require("express-session"));
const crypto = __importStar(require("crypto"));
const bodyParser = __importStar(require("body-parser"));
const tronweb_1 = require("tronweb");
const cors_1 = __importDefault(require("cors"));
const dotenv = __importStar(require("dotenv"));
// initialize constant variables
const Precision = 1e6;
const app = (0, express_1.default)();
const secretKey = crypto.randomBytes(64).toString('hex');
app.use((0, express_session_1.default)({
    secret: secretKey,
    resave: false,
    saveUninitialized: true
}));
app.use(bodyParser.json());
app.use((0, cors_1.default)());
const port = 3000;
dotenv.config();
const tronWeb = new tronweb_1.TronWeb({
    fullHost: 'https://api.shasta.trongrid.io',
    headers: { "TRON-PRO-API-KEY": "b234053e-bfdd-4378-a4b7-4fad7ec33e28" },
    privateKey: '0x1' // dummy private key
});
const mainAddress = process.env.mainAddress;
const mainABI = JSON.parse(fs.readFileSync('data/mainABI.json', 'utf-8'));
const mainContract = tronWeb.contract(mainABI, mainAddress);
const tokenAddress = process.env.contractAddress;
const tokenABI = JSON.parse(fs.readFileSync('data/ABI.json', 'utf-8'));
const tokenContract = tronWeb.contract(tokenABI, tokenAddress);
const goodsAddresses = await (() => __awaiter(void 0, void 0, void 0, function* () {
    let raw = yield mainContract.getGoodsList().call();
    return JSON.parse(raw);
}))();
const test = process.env.test;
app.get('/test', (req, res) => {
    res.send('Hello World!');
});
app.post('/login', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userAddress, userToken } = req.body;
        req.session.userAddress = userAddress;
        req.session.userToken = userToken;
        if (test === 1) {
            req.session.ETHQuantity = 10000;
            req.session.tokenQuantity = 1000;
        }
        else {
            const ETHQuantity = (yield tronWeb.trx.getBalance(userAddress)) / Precision;
            let tokenQuantity = 0;
            try {
                tokenQuantity = yield tokenContract.balanceOf(userAddress).call();
            }
            catch (e) {
                tokenQuantity = 0;
            }
            req.session.ETHQuantity = ETHQuantity;
            req.session.tokenQuantity = tokenQuantity;
        }
        let responseJson = {
            code: 0,
            msg: 'OK',
            data: {
                userAddress: userAddress,
                userToken: userToken,
                assets: [
                    {
                        asset: 'SOL',
                        quantity: req.session.ETHQuantity
                    },
                    {
                        asset: 'Token',
                        quantity: req.session.tokenQuantity
                    }
                ]
            }
        };
        res.json(responseJson);
    }
    catch (e) {
        let responseJson = {
            code: 500,
            msg: e.message
        };
        res.json(responseJson);
    }
}));
app.get('/goods', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (test === 1) {
            const goods = fs.readFileSync('data/goodsTest.json', 'utf-8');
            const goodsList = JSON.parse(goods);
            let responseJson = {
                code: 0,
                msg: 'OK',
                data: goodsList
            };
            res.json(responseJson);
        }
        else {
            const nfts = [];
            for (let i = 1; i < goodsAddresses.length; i++) {
                let goodsContract = tronWeb.contract(tokenABI, goodsAddresses[i]);
                let metadata = yield goodsContract.getMetadata().call();
                let parsed = JSON.parse(JSON.stringify(metadata));
                let price = Number(yield goodsContract.getPrice().call());
                let nft = {
                    NFTId: i.toString().padStart(5, '0'),
                    name: parsed.name,
                    URL: parsed.image,
                    price: price,
                    description: parsed.description
                };
                nfts.push(nft);
            }
            let responseJson = {
                code: 0,
                msg: 'OK',
                data: nfts
            };
            res.json(responseJson);
        }
    }
    catch (e) {
        let responseJson = {
            code: 500,
            msg: e.message
        };
        res.json(responseJson);
    }
}));
app.post('/routes', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e, _f, _g;
    try {
        const reqList = req.body;
        console.log(reqList);
        const tokenDiscountPrice = 0.0002;
        let tokenPrice;
        if (test === 1) {
            tokenPrice = 0.0001;
            req.session.ETHQuantity = 10000;
            req.session.tokenQuantity = 1000;
        }
        else {
            tokenPrice = 0.0001;
            req.session.ETHQuantity = Number(yield tronWeb.trx.getBalance(req.session.userAddress)) / Precision;
            req.session.tokenQuantity = Number(yield tokenContract.balanceOf(req.session.userAddress).call());
        }
        let total = 0;
        // object in reqList: { "NFTId": NFTId, "quantity": quantity }
        for (let i = 0; i < reqList.length; i++) {
            let NFTId = reqList[i].NFTId;
            let quantity = reqList[i].quantity;
            console.log(NFTId, quantity);
            let price = 0;
            if (test === 1) {
                const goods = fs.readFileSync('data/goodsTest.json', 'utf-8');
                const goodsList = JSON.parse(goods);
                for (let j = 0; j < goodsList.length; j++) {
                    if (goodsList[j].NFTId === NFTId) {
                        price = goodsList[j].price * quantity;
                        break;
                    }
                }
            }
            else {
                // attention: the backend basically does not store the prices of NFTs, so fetch the price from the blockchain again
                let index = parseInt(NFTId);
                let goodsContract = tronWeb.contract(tokenABI, goodsAddresses[index]);
                let perPrice = Number(yield goodsContract.getPrice().call());
                price = perPrice * quantity;
            }
            total += price;
            console.log(total);
        }
        // calculate route0
        const totalRawPrice0 = total;
        console.log(totalRawPrice0);
        const totalMaxToken = parseInt((totalRawPrice0 / tokenDiscountPrice * 0.3).toFixed(0));
        console.log(totalMaxToken);
        const totalToken0 = 0;
        const tokenToBuy0 = 0;
        const priceBuyingToken0 = 0;
        const totalDiscountPrice0 = 0;
        const totalPrice0 = totalRawPrice0 - totalDiscountPrice0;
        console.log("totalPrice0", totalPrice0);
        // calculate route1
        const totalRawPrice1 = total;
        console.log(totalRawPrice1);
        let totalToken1;
        if (totalMaxToken < ((_a = req.session.tokenQuantity) !== null && _a !== void 0 ? _a : 0)) {
            totalToken1 = totalMaxToken;
        }
        else {
            totalToken1 = (_b = req.session.tokenQuantity) !== null && _b !== void 0 ? _b : 0;
        }
        const tokenToBuy1 = 0;
        const priceBuyingToken1 = 0;
        const totalDiscountPrice1 = totalToken1 * tokenDiscountPrice;
        const totalPrice1 = totalRawPrice1 - totalDiscountPrice1;
        // calculate route2
        const totalRawPrice2 = total;
        const totalToken2 = totalMaxToken;
        let tokenToBuy2;
        let priceBuyingToken2;
        let totalDiscountPrice2;
        if (totalMaxToken < ((_c = req.session.tokenQuantity) !== null && _c !== void 0 ? _c : 0)) {
            tokenToBuy2 = 0;
            priceBuyingToken2 = 0;
            totalDiscountPrice2 = totalMaxToken * tokenDiscountPrice;
        }
        else {
            tokenToBuy2 = totalMaxToken - ((_d = req.session.tokenQuantity) !== null && _d !== void 0 ? _d : 0);
            priceBuyingToken2 = tokenToBuy2 * tokenPrice;
            totalDiscountPrice2 = totalMaxToken * tokenDiscountPrice - priceBuyingToken2;
        }
        const totalPrice2 = totalRawPrice2 - totalDiscountPrice2;
        if (totalPrice0 > ((_e = req.session.ETHQuantity) !== null && _e !== void 0 ? _e : 0) && totalPrice1 > ((_f = req.session.ETHQuantity) !== null && _f !== void 0 ? _f : 0) && totalPrice2 > ((_g = req.session.ETHQuantity) !== null && _g !== void 0 ? _g : 0)) {
            throw new Error('Insufficient funds');
        }
        else {
            let responseJson = {
                code: 0,
                msg: 'OK',
                data: {
                    routes: [
                        {
                            route: 0,
                            totalRawPrice: Math.round(totalRawPrice0 * Precision) / Precision,
                            totalToken: totalToken0,
                            tokenToBuy: tokenToBuy0,
                            priceBuyingToken: Math.round(priceBuyingToken0 * Precision) / Precision,
                            totalDiscountPrice: Math.round(totalDiscountPrice0 * Precision) / Precision,
                            totalPrice: Math.round(totalPrice0 * Precision) / Precision
                        },
                        {
                            route: 1,
                            totalRawPrice: Math.round(totalRawPrice1 * Precision) / Precision,
                            totalToken: totalToken1,
                            tokenToBuy: tokenToBuy1,
                            priceBuyingToken: Math.round(priceBuyingToken1 * Precision) / Precision,
                            totalDiscountPrice: Math.round(totalDiscountPrice1 * Precision) / Precision,
                            totalPrice: Math.round(totalPrice1 * Precision) / Precision
                        },
                        {
                            route: 2,
                            totalRawPrice: Math.round(totalRawPrice2 * Precision) / Precision,
                            totalToken: totalToken2,
                            tokenToBuy: tokenToBuy2,
                            priceBuyingToken: Math.round(priceBuyingToken2 * Precision) / Precision,
                            totalDiscountPrice: Math.round(totalDiscountPrice2 * Precision) / Precision,
                            totalPrice: Math.round(totalPrice2 * Precision) / Precision
                        }
                    ]
                }
            };
            // send response
            console.log(JSON.stringify(responseJson));
            res.json(responseJson);
        }
        ;
    }
    catch (e) {
        let responseJson = {
            code: 500,
            msg: e.message
        };
        res.json(responseJson);
    }
}));
app.post('/save', (req, res) => {
    const reqList = req.body;
    for (let i = 0; i < reqList.length; i++) {
        const { userAddress, NFTId, quantity, price, token } = reqList[i];
        const timestamp = new Date().getTime();
        const data = {
            userAddress: userAddress,
            NFTId: NFTId,
            quantity: quantity,
            price: price,
            token: token,
            timestamp: timestamp
        };
        const dataString = JSON.stringify(data);
        fs.appendFileSync('data/transactions.json', dataString);
    }
    let responseJson = {
        code: 0,
        msg: 'OK'
    };
    res.json(responseJson);
});
app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`, '\n Current time is', new Date().toLocaleString('en-US', { timeZone: 'America/New_York' }), '\n Secret key is', secretKey);
});
