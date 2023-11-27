import express from 'express'
import * as zksync from "zksync-web3";
import * as ethers from "ethers";
import { decryptText } from "../../../crypt_module/crypt_text.js";
import * as paths from '../../../paths.js'
import { getInfo } from '../../../utils/utils.js';
import { myFormatData } from "../../../formatdata.js";
import { TradeUtil } from "../trade.js";
import { NftUtil } from "./nft.js";

const ethereumGasPrice = 30

// process.exit()
async function checkGasPrice(ethereumProvider) {
    const feeData = await ethereumProvider.getFeeData();
    const gasPrice = ethers.utils.formatUnits(feeData['gasPrice'], 'gwei');
    if (gasPrice <= ethereumGasPrice) {
        return true
    } else {
        console.log(`当前eth主网gas高于设定的gasPrice:${ethereumGasPrice},等待gas降低`)
        return false
    }
}

const main = (async(startNum, endNum=null)=>{
    try {
        const zksyncProvider = new zksync.Provider('https://mainnet.era.zksync.io'); // zksync era 节点
        const ethereumProvider = new ethers.providers.JsonRpcProvider('https://eth-mainnet.g.alchemy.com/v2/KsQRrJb04s-adwpiSUoSr73lgTiIVmHX'); // 以太坊主网节点
        console.log('---------------0000000000------------------')
        const projectInfos = getInfo(paths.projectFile)
        console.log('---------------0000000001------------------')

        const data = await myFormatData(startNum, endNum)
        console.log(data)
        console.log('---------------0000000002------------------')

        let startNonce;
        let endNonce;
        for (const d of data) {
            console.log('---------------0000000003------------------')

            const check = await checkGasPrice(ethereumProvider); if(!check) { return; };
            console.log('---------------1111111111------------------')

            const privateKey = await decryptText(d['enPrivateKey']);
            if (privateKey === null) {break};
            const wallet = new zksync.Wallet(privateKey, zksyncProvider, ethereumProvider);
            console.log('---------------22222222222------------------')

            startNonce = await wallet.getTransactionCount()
            console.log('---------------33333333333------------------')

            // 随机选一个动作。可能是兑换代币，可能是mint nft。。。
            const actions = projectInfos['actions']
            const randomAction = actions[Math.floor(Math.random() * actions.length)];
            // 根据randomAction随机选一个项目。比如mute、mav。。。或zksNetwork。。。
            const projects = randomAction.projects
            const randomProject = projects[Math.floor(Math.random() * projects.length)];
            // console.log(randomAction);console.log('------------------------------------------');console.log(randomProject);process.exit();
            if (randomAction.name === 'trade') {
                // 随机选approve或swap（单独approve增加交易量手续费便宜）
                const tradeactions = ['approve', 'swap']
                const randomTradeAction = tradeactions[Math.floor(Math.random() * tradeactions.length)];
                const trade = new TradeUtil();
                console.log('---------------44444444444------------------')

                if(randomProject.name === 'mute') {
                    if(randomTradeAction === 'approve') {
                        await trade.approveToken(wallet, randomProject);
                    } else if(randomTradeAction === 'swap') {
                        await trade.MuteSwapToken(wallet, randomProject)
                    }
                }   
            }else if(randomAction.name === 'mintNft') {
                const nft = new NftUtil();
                console.log('---------------5555555555------------------')

                if(randomProject.name === 'zksNetwork') {
                    await nft.mintZksDomain(wallet, randomProject)
                }else if(randomProject.name === 'race') {
                    await nft.mintRaceNft(wallet, randomProject)
                }
            }
            endNonce = await wallet.getTransactionCount();
            console.log(startNonce)
            console.log(endNonce)
            // 如果nonce没变化，说明没有新的交易。重新运行
            if (endNonce === startNonce) {
                await main(startNum, endNum)
            }
        }
        

    } catch(error){
        console.log(error.reason)
        console.log('111111111111111111')
        // NETWORK_ERROR|SERVER_ERROR
        if(error.reason === 'could not detect network' || error.reason === 'missing response') {

            await main(startNum, endNum)
        }
        console.log('222222222222222222')
        console.log(error)
    }
})

// await main(25);

// Error: could not detect network (event="noNetwork", code=NETWORK_ERROR, version=providers/5.7.2)
//     at Logger.makeError (/Users/gaohongxiang/project/my_script/nodejs/web3_script_node/chains/zksync/node_modules/@ethersproject/logger/lib/index.js:238:21)
//     at Logger.throwError (/Users/gaohongxiang/project/my_script/nodejs/web3_script_node/chains/zksync/node_modules/@ethersproject/logger/lib/index.js:247:20)
//     at Provider.<anonymous> (/Users/gaohongxiang/project/my_script/nodejs/web3_script_node/chains/zksync/node_modules/@ethersproject/providers/lib/json-rpc-provider.js:609:54)
//     at step (/Users/gaohongxiang/project/my_script/nodejs/web3_script_node/chains/zksync/node_modules/@ethersproject/providers/lib/json-rpc-provider.js:48:23)
//     at Object.throw (/Users/gaohongxiang/project/my_script/nodejs/web3_script_node/chains/zksync/node_modules/@ethersproject/providers/lib/json-rpc-provider.js:29:53)
//     at rejected (/Users/gaohongxiang/project/my_script/nodejs/web3_script_node/chains/zksync/node_modules/@ethersproject/providers/lib/json-rpc-provider.js:21:65)
//     at process.processTicksAndRejections (node:internal/process/task_queues:95:5) {
//   reason: 'could not detect network',
//   code: 'NETWORK_ERROR',
//   event: 'noNetwork'
// }

const app = express()

app.use(async(req,res)=>{
    const targetUrl = 'https://mainnet.era.zksync.io'
    req.headers.host = new URL(targetUrl).host
    console.log(`Proxying to ${targetUrl}${req.url}`)
    console.log(req.body)
    try{
        const response = await axios({
            method:req.method,
            proxy:'socks5://qoytdppy:ahwms9ynfn71@45.114.12.28:5096',
            url:`${targetUrl}${req.url}`,
            headers: {
                'Content-Type': 'application/json',
            },
            data: Json.stringify(req.body),
        })
        console.log(response.headers)
        console.log(response.data)
        res.status(response.status).set(response.headers).send(response.data)
    }catch(error){
        console.log(error)
        if(error.response){
            res.status(error.response.status).set(error.response.headers).send(error.response.data)
        }else{
            res.status(500).send(`An error occurred while processing the request.`)
        }
    }
})