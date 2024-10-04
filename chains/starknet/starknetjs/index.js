import { RpcProvider, Account, Contract, ec } from "starknet";
import { decryptText } from "../../../crypt_module/crypt_text.js";
import * as paths from '../../../paths.js'
import { getInfo } from '../../../utils/utils.js';
import { myFormatData } from "../../../formatdata.js";
import { alchemyStarknetMainnetApi } from "../../../config.js";
import { TradeUtil } from "./trade.js";
import { setDomain } from "./nft.js";
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
        const starknetProvider = new RpcProvider({ nodeUrl: 'https://starknet-mainnet.g.alchemy.com/v2/' + alchemyStarknetMainnetApi});
        // console.log("Chain ID: ", await starknetProvider.getChainId());

        // const projectInfos = getInfo(paths.projectFile)

        const data = await myFormatData(startNum, endNum)
        // console.log(data)

        for (const d of data) {

            // const check = await checkGasPrice(ethereumProvider); if(!check) { return; };

            const privateKey = await decryptText(d['argent_enPrivateKey']);
            if (privateKey === null) {break};
            const accountAddress = d['argent_address'];
            const account = new Account(starknetProvider, accountAddress, privateKey);
            // await setDomain(account)
            // console.log(account)
            // const nonce = await starknetProvider.getNonceForAddress(accountAddress)
            // console.log(Number(nonce));
            const trade = new TradeUtil();
            await trade.approve(account);
            
            // // 随机选一个动作。可能是兑换代币，可能是mint nft。。。
            // const actions = projectInfos['actions']
            // const randomAction = actions[Math.floor(Math.random() * actions.length)];
            // // 根据randomAction随机选一个项目。比如mute、mav。。。或zksNetwork。。。
            // const projects = randomAction.projects
            // const randomProject = projects[Math.floor(Math.random() * projects.length)];
            // // console.log(randomAction);console.log('------------------------------------------');console.log(randomProject);process.exit();
            // if (randomAction.name === 'trade') {
            //     // 随机选approve或swap（单独approve增加交易量手续费便宜）
            //     const tradeactions = ['approve', 'swap']
            //     const randomTradeAction = tradeactions[Math.floor(Math.random() * tradeactions.length)];
            //     const trade = new TradeUtil();
            //     console.log('---------------44444444444------------------')

            //     if(randomProject.name === 'mute') {
            //         if(randomTradeAction === 'approve') {
            //             await trade.approveToken(wallet, randomProject);
            //         } else if(randomTradeAction === 'swap') {
            //             await trade.MuteSwapToken(wallet, randomProject)
            //         }
            //     }   
            // }
        }
        

    } catch(error){
        console.log(error)
    }
})

await main(1);