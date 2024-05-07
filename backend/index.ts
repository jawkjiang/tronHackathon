import * as fs from 'fs';
import * as path from 'path';
import express from 'express';
import session from 'express-session';
import * as crypto from 'crypto';
import * as bodyParser from 'body-parser';
import { TronWeb } from 'tronweb';
import cors from 'cors';
import * as dotenv from 'dotenv';
import { errors } from 'web3';

// initialize constant variables
const Precision = 1e6;

const app = express();
const secretKey = crypto.randomBytes(64).toString('hex')
app.use(session({
    secret: secretKey,
    resave: false,
    saveUninitialized: true
}));
declare module 'express-session' {
    interface SessionData {
        userAddress: string;
        userToken: string;
        ETHQuantity: number;
        tokenQuantity: number;
    }
}
app.use(bodyParser.json());
app.use(cors());
const port = 3000;
dotenv.config();

const tronWeb = new TronWeb({
    fullHost: 'https://api.shasta.trongrid.io',
    headers: { "TRON-PRO-API-KEY": "b234053e-bfdd-4378-a4b7-4fad7ec33e28" },
    privateKey: '0x1' // dummy private key
});

const mainAddress = process.env.mainAddress as string;
const mainABI = JSON.parse(fs.readFileSync('data/mainABI.json', 'utf-8'));
const mainContract = tronWeb.contract(mainABI, mainAddress);

const tokenAddress = process.env.contractAddress as string;
const tokenABI = JSON.parse(fs.readFileSync('data/ABI.json', 'utf-8'));
const tokenContract = tronWeb.contract(tokenABI, tokenAddress);

const goodsAddresses: Array<string> = await (async () => {
    let raw = await mainContract.getGoodsList().call();
    return JSON.parse(raw);
})();

const test = process.env.test as unknown as number;

app.get('/test', (req, res) => {
    res.send('Hello World!');
});
    
app.post('/login', async (req, res) => {
    try {
        const { userAddress, userToken } = req.body;
        req.session.userAddress = userAddress;
        req.session.userToken = userToken;
        if (test === 1){
            req.session.ETHQuantity = 10000;
            req.session.tokenQuantity = 1000;
        }
        else {
            const ETHQuantity = (await tronWeb.trx.getBalance(userAddress)) / Precision;
            let tokenQuantity = 0;
            try {
                tokenQuantity = await tokenContract.balanceOf(userAddress).call();
            } catch (e) {
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
});

app.get('/goods', async (req, res) => {
    try {
        if (test === 1){
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
            const nfts: any[] = []; 
            for (let i = 1; i < goodsAddresses.length; i++) {
                let goodsContract = tronWeb.contract(tokenABI, goodsAddresses[i]);
                let metadata = await goodsContract.getMetadata().call();
                let parsed = JSON.parse(JSON.stringify(metadata));
                let price: Number = Number(await goodsContract.getPrice().call());
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
});

app.post('/routes', async (req, res) => {
    try {
        interface RequestBody {
            NFTId: string,
            quantity: number
        }
        const reqList: RequestBody[] = req.body;
        console.log(reqList);
        const tokenDiscountPrice = 0.0002;
        let tokenPrice: number;
        if (test === 1){
            tokenPrice = 0.0001;
            req.session.ETHQuantity = 10000;
            req.session.tokenQuantity = 1000;
        }
        else {
            tokenPrice = 0.0001;
            req.session.ETHQuantity = Number(await tronWeb.trx.getBalance(req.session.userAddress)) / Precision;
            req.session.tokenQuantity = Number(await tokenContract.balanceOf(req.session.userAddress).call());
        }
        
        let total = 0;
        // object in reqList: { "NFTId": NFTId, "quantity": quantity }
        for (let i = 0; i < reqList.length; i++){
            let NFTId = reqList[i].NFTId;
            let quantity = reqList[i].quantity;
            console.log(NFTId, quantity);
            let price = 0;
            if (test === 1){
                const goods = fs.readFileSync('data/goodsTest.json', 'utf-8');
                const goodsList = JSON.parse(goods);
                for (let j = 0; j < goodsList.length; j++){
                    if (goodsList[j].NFTId === NFTId){
                        price = goodsList[j].price * quantity;
                        break;
                    }
                }
            }
            else {
                // attention: the backend basically does not store the prices of NFTs, so fetch the price from the blockchain again
                let index = parseInt(NFTId);
                let goodsContract = tronWeb.contract(tokenABI, goodsAddresses[index]);
                let perPrice = Number(await goodsContract.getPrice().call());
                price = perPrice * quantity;
            }
            total += price;
            console.log(total);
        }

        // calculate route0
        const totalRawPrice0 = total;
        console.log(totalRawPrice0);
        const totalMaxToken = parseInt((totalRawPrice0 / tokenDiscountPrice * 0.3).toFixed(0))
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
        if (totalMaxToken < (req.session.tokenQuantity ?? 0)){
            totalToken1 = totalMaxToken;
        }
        else {
            totalToken1 = req.session.tokenQuantity ?? 0;
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
        if (totalMaxToken < (req.session.tokenQuantity ?? 0)){
            tokenToBuy2 = 0;
            priceBuyingToken2 = 0;
            totalDiscountPrice2 = totalMaxToken * tokenDiscountPrice;
        }
        else {
            tokenToBuy2 = totalMaxToken - (req.session.tokenQuantity ?? 0);
            priceBuyingToken2 = tokenToBuy2 * tokenPrice;
            totalDiscountPrice2 = totalMaxToken * tokenDiscountPrice - priceBuyingToken2;
        }
        const totalPrice2 = totalRawPrice2 - totalDiscountPrice2;

        if (totalPrice0 > (req.session.ETHQuantity ?? 0) && totalPrice1 > (req.session.ETHQuantity ?? 0) && totalPrice2 > (req.session.ETHQuantity ?? 0)){
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
                            totalRawPrice: Math.round(totalRawPrice0*Precision)/Precision,
                            totalToken: totalToken0,
                            tokenToBuy: tokenToBuy0,
                            priceBuyingToken: Math.round(priceBuyingToken0*Precision)/Precision,
                            totalDiscountPrice: Math.round(totalDiscountPrice0*Precision)/Precision,
                            totalPrice: Math.round(totalPrice0*Precision)/Precision
                        },
                        {
                            route: 1,
                            totalRawPrice: Math.round(totalRawPrice1*Precision)/Precision,
                            totalToken: totalToken1,
                            tokenToBuy: tokenToBuy1,
                            priceBuyingToken: Math.round(priceBuyingToken1*Precision)/Precision,
                            totalDiscountPrice: Math.round(totalDiscountPrice1*Precision)/Precision,
                            totalPrice: Math.round(totalPrice1*Precision)/Precision
                        },
                        {
                            route: 2,
                            totalRawPrice: Math.round(totalRawPrice2*Precision)/Precision,
                            totalToken: totalToken2,
                            tokenToBuy: tokenToBuy2,
                            priceBuyingToken: Math.round(priceBuyingToken2*Precision)/Precision,
                            totalDiscountPrice: Math.round(totalDiscountPrice2*Precision)/Precision,
                            totalPrice: Math.round(totalPrice2*Precision)/Precision
                        }
                    ]
                }
            };
            // send response
            console.log(JSON.stringify(responseJson))
            res.json(responseJson);
        };
    }
    catch (e) {
        let responseJson = {
            code: 500,
            msg: e.message
        };
        res.json(responseJson);
    }   
});

app.post('/save', (req: express.Request, res: express.Response) => {
    const reqList = req.body;
    for (let i = 0; i < reqList.length; i++){
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
    console.log(`Server is running at http://localhost:${port}`,'\n Current time is', new Date().toLocaleString('en-US', { timeZone: 'America/New_York' }),'\n Secret key is', secretKey);
});