// zksync-web3继承了ethers。跟zksync交互只需要导入zksync-web3即可。如果需要跟以太坊主网交互还是需要ethers
import * as zksync from "zksync-web3";
import * as ethers from "ethers";
import * as paths from '../../paths.js'
import * as config from '../../config.js'; // 全部导入。使用:config.alchemyEthMainnetApi
import { ZksyncUtil } from "./zksync.js";
import { getInfo, getRandomObject, generateTransactionData } from '../../utils/utils.js';

const tokenInfos = getInfo(paths.tokenFile, 'zksync')

export class TradeUtil extends ZksyncUtil {

    constructor() {
        super()
    }
    
    async getRandomTokenPairs(wallet) {
        // 随机选择一个余额不为0的代币
        let fromToken;
        let fromTokenInfo;
        let fromTokenBalance;
        // 没判断余额全为0的情况
        while(true) {  
            const {key, value} = getRandomObject(tokenInfos); 
            fromTokenBalance = await this.getBalance(wallet.provider, wallet.address, key);
            if (fromTokenBalance != '0.0') {
                fromToken = key;
                fromTokenInfo = value;
                break;  
            }
        };
        
        // 0.0001～fromTokenBalance之间的随机小数，精度4位小数点。4位小数是为了满足eth的兑换
        const minAmount = 0.0001;
        let randomNumber = Math.random() * (fromTokenBalance - minAmount) + minAmount;
        randomNumber = parseFloat(randomNumber).toFixed(4);
        // console.log(randomNumber)
        const randomNum = ethers.utils.parseUnits(randomNumber.toString(), fromTokenInfo['decimals']);
        // console.log(randomNum)
        
        // 随机选择一个不同于fromToken的代币
        let toToken;
        let toTokenInfo;
        // 没判断只有一个代币或者只有两个代币相同的情况
        while(true) {
            const {key, value} = getRandomObject(tokenInfos); 
            if (fromToken !== key) {
                toToken = key;
                toTokenInfo = value;
                break;  
            }  
        }
        // console.log(`fromToken:${fromToken}\nfromTokenInfo:${fromTokenInfo}\nrandomNum:${randomNum}\ntoToken:${toToken}\ntoTokenInfo:${toTokenInfo}`)
        // console.log(fromToken)
        // console.log(fromTokenInfo)
        // console.log(randomNum)
        // console.log(toToken)
        // console.log(toTokenInfo)
        return { fromToken, fromTokenInfo, randomNum, toToken, toTokenInfo }
    }

    async approveToken(wallet, projectInfo) {
        // 随机选择一个交易对和交易金额
        const { fromToken, fromTokenInfo, randomNum } = await this.getRandomTokenPairs(wallet)
        if(fromToken === 'ETH') {
            console.log('ETH不需要授权')
            return
        }
        console.log(`--------授权操作：授权${ethers.utils.formatUnits(randomNum.toString(), fromTokenInfo['decimals'])} ${fromToken} 给 ${projectInfo.name}-------------`)
        const tokenCantract = new zksync.Contract(fromTokenInfo['address'], fromTokenInfo['abi'], wallet);
        const nonce = await wallet.getTransactionCount()
        try {
            const receipt = await tokenCantract.approve(projectInfo['address'], randomNum)
            await receipt.wait();
            console.log(`${wallet.address} 批准代币 成功, hash:${receipt.hash}`);
            await this.addRecord(paths.zksyncSuccessLogFile, wallet.address, nonce+1, `${projectInfo['website']} 批准代币`, receipt.hash)
        } catch(error) {
            console.log(`${wallet.address} 批准代币 失败, ${error}`)
            await this.addRecord(paths.zksyncFailedLogFile, wallet.address, nonce+1, `${projectInfo['website']} 批准代币`, error)
        }
    }

    async approveToken(wallet, projectInfo) {
        // 随机选择一个交易对和交易金额
        const { fromToken, fromTokenInfo, randomNum } = await this.getRandomTokenPairs(wallet);
        if (fromToken === 'ETH') {
        console.log('ETH不需要授权');
        return;
        }
        console.log(`--------授权操作：授权${ethers.utils.formatUnits(randomNum.toString(), fromTokenInfo['decimals'])} ${fromToken} 给 ${projectInfo.name}-------------`);
        
        // 使用axios库和中间件函数作为代理来发送HTTP请求
        const proxy = 'socks5://qoytdppy:ahwms9ynfn71@45.114.12.28:5096';
        const targetUrl = 'https://mainnet.era.zksync.io';
        const { transactionData } = generateTransactionData('approve(address,uint256)', [projectInfo['address'], randomNum])
        const requestData = {
            jsonrpc: '2.0',
            method: 'eth_sendTransaction',
            params: [{
                to: projectInfo['address'],
                data: transactionData
            }],
            id: 1
        };
        try {
            const response = await axios.post(targetUrl, requestData, {
                headers: {
                'Content-Type': 'application/json',
                },
                proxy: proxy
            });
            console.log(`${wallet.address} 批准代币 成功, hash:${response.data.result}`);
            await this.addRecord(`paths.zksyncSuccessLogFile, wallet.address, nonce+1, ${projectInfo['website']} 批准代币, response.data.result`);
        } catch(error) {
            console.log(`${wallet.address} 批准代币 失败, ${error}`);
            await this.addRecord(`paths.zksyncFailedLogFile, wallet.address, nonce+1, ${projectInfo['website']} 批准代币, error`);
            }
        }
}

// const trade = new TradeUtil()
// trade.swapToken(11)