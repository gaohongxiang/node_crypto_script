import { SocksProxyAgent } from 'socks-proxy-agent';
import * as ethers from "ethers";
import * as zksync from "zksync-ethers";
import { decryptText } from "../../../crypt_module/crypt_text.js";
import * as paths from '../../../paths.js'
import { getInfo } from '../../../utils/utils.js';
import { myFormatData } from "../../../formatdata.js";
import { TradeUtil } from "./trade.js";
import { NftUtil } from "./nft.js";
import { alchemyEthMainnetApi, alchemyZksyncApi } from '../../../config.js'

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

// 创建全局代理提供者函数，所有通过这些提供者的请求都会通过代理
async function createProxyProviders(hasProxy = false, proxy = null) {
    try {
        let zksyncProvider, ethereumProvider;

        if (hasProxy && proxy) {
            // 创建 SOCKS 代理
            const agent = new SocksProxyAgent(proxy);

            // 注册全局的 getUrl 函数，所有的 FetchRequest 实例都会使用这个函数来处理网络请求
            ethers.FetchRequest.registerGetUrl(ethers.FetchRequest.createGetUrlFunc({ agent }));

            // 创建 zkSync 提供者，使用 FetchRequest 以确保走代理
            const zksyncFetchReq = new ethers.FetchRequest(alchemyZksyncApi);
            // 此方法适用于特定实例。会覆盖全局getUrl函数
            // zksyncFetchReq.getUrlFunc = ethers.FetchRequest.createGetUrlFunc({ agent });
            zksyncProvider = new zksync.Provider(zksyncFetchReq);

            // 创建以太坊提供者，使用 FetchRequest 以确保走代理
            const ethFetchReq = new ethers.FetchRequest(alchemyEthMainnetApi);
            ethereumProvider = new ethers.JsonRpcProvider(ethFetchReq);
        } else {
            // 不使用代理的情况
            zksyncProvider = new zksync.Provider(alchemyZksyncApi);
            ethereumProvider = new ethers.JsonRpcProvider(alchemyEthMainnetApi);
        }
        // console.log(zksyncProvider)
        // console.log(ethereumProvider)
        return { zksyncProvider, ethereumProvider };
    } catch (error) {
        console.error("provider设置失败:", error.message);
        // 如果设置失败，返回空
        return null;
    }
}


const main = (async(startNum, endNum=null)=>{
    try {
        const projectInfos = getInfo(paths.projectFile)

        const data = await myFormatData(startNum, endNum)
        // console.log(data)

        let startNonce;
        let endNonce;
        for (const d of data) {
            // console.log(d)
            const providers = await createProxyProviders(hasProxy = true, proxy = d['proxy']);
            if (!providers) {console.error("创建代理提供程序失败。跳过本次迭代。");continue;}
            const { zksyncProvider, ethereumProvider } = providers;
            // const check = await checkGasPrice(ethereumProvider); if(!check) { return; };

            const privateKey = await decryptText(d['enPrivateKey']);
            if (privateKey === null) {break};
            const wallet = new zksync.Wallet(privateKey, zksyncProvider, ethereumProvider);

            startNonce = await zksyncProvider.getTransactionCount(wallet.address)
            console.log("任务开始前nonce:",startNonce)
            
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

                if(randomProject.name === 'mute') {
                    if(randomTradeAction === 'approve') {
                        await trade.approveToken(wallet, randomProject);
                    } else if(randomTradeAction === 'swap') {
                        await trade.MuteSwapToken(wallet, randomProject)
                    }
                }   
            }else if(randomAction.name === 'mintNft') {
                const nft = new NftUtil();

                if(randomProject.name === 'zksNetwork') {
                    await nft.mintZksDomain(wallet, randomProject)
                }else if(randomProject.name === 'race') {
                    await nft.mintRaceNft(wallet, randomProject)
                }
            }
            endNonce = await zksyncProvider.getTransactionCount(wallet.address)
            console.log("任务开始后nonce:",endNonce)
            // 如果nonce没变化，说明没有新的交易。重新运行
            if (endNonce === startNonce) {
                await main(startNum, endNum)
            }
        }
        

    } catch(error){
        console.log(error.reason)
        // NETWORK_ERROR|SERVER_ERROR
        if(error.reason === 'could not detect network' || error.reason === 'missing response') {

            await main(startNum, endNum)
        }
        console.log(error)
    }
})

await main(25);