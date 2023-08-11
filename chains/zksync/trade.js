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

    async MuteSwapToken(wallet, projectInfo, slippage=0.5) {
        // 随机选择一个交易对和交易金额
        const { fromToken, fromTokenInfo, randomNum, toToken, toTokenInfo } = await this.getRandomTokenPairs(wallet)

        // const fromToken = 'ETH'
        // const fromTokenInfo = {
        //     "address":"0x5AEa5775959fBC2557Cc8789bC1bf90A239D9a91",
        //     "abi":["function approve(address spender, uint256 amount)", "function deposit(uint256 amount) external payable returns (bool success)"],
        //     "decimals":"18"
        // }
        // const toToken = 'USDC'
        // const toTokenInfo = {
        //     "address":"0x3355df6D4c9C3035724Fd0e3914dE96A5a83aaf4",
        //     "abi":["function approve(address spender, uint256 amount)"],
        //     "decimals":"6"
        // }
        // // const randomNum = ethers.BigNumber.from('0x071afd498d0000')  // 0.002
        // const randomNum = '0x038d7ea4c68000' // 0.001
        // // console.log(ethers.utils.formatUnits(randomNum, fromTokenInfo['decimals']))
        // // console.log(`randomNum:${randomNum}`)

       
        // process.exit()
        const nonce = await wallet.getTransactionCount()
        
        // if(fromToken != 'ETH') {
        //     const wethContract = new ethers.Contract(fromTokenInfo['address'], fromTokenInfo['abi'], wallet);
        //     const tx = await wethContract.deposit({ value: randomNum });
        //     await tx.wait();
        // }
        // 授权代币
        if(fromToken != 'ETH') {
            console.log(`--------授权操作：授权${ethers.utils.formatUnits(randomNum.toString(), fromTokenInfo['decimals'])} ${fromToken} 给 ${projectInfo.name}-------------`)
            const tokenCantract = new zksync.Contract(fromTokenInfo['address'], fromTokenInfo['abi'], wallet);
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
        
        // 兑换代币
        const cantract = new zksync.Contract(projectInfo['address'], projectInfo['abi'], wallet)
        const path = [fromTokenInfo['address'], toTokenInfo['address']]
        const stable = [false, false]
        const result = await cantract.getAmountsOut(randomNum, path, stable)
        // console.log(result)
        const amountOut = result[0][result[0].length - 1];
        // console.log(amountOut)
        // console.log(ethers.utils.formatUnits(amountOut.toString(), toTokenInfo['decimals']))
        // const fee = result[2]
        slippage = ethers.utils.parseUnits((slippage / 100).toString(), "ether")
        let amountOutMin = amountOut.mul(ethers.constants.WeiPerEther.sub(slippage)).div(ethers.constants.WeiPerEther);
        // console.log(`amountOutMin:${amountOutMin}`)
        // console.log(ethers.utils.formatUnits(amountOutMin.toString(), toTokenInfo['decimals']))
        console.log(`--------兑换操作：通过${projectInfo.name} 兑换 ${ethers.utils.formatUnits(randomNum.toString(), fromTokenInfo['decimals'])} ${fromToken} ---> ${ethers.utils.formatUnits(amountOutMin.toString(), toTokenInfo['decimals'])} ${toToken} -------------`)

        // process.exit()
        const block = await wallet.provider.getBlock()
        const deadline = block.timestamp + 60 * 1000
        console.log(deadline)
        const overrides = {
            gasLimit: 2000000,
            gasPrice: ethers.utils.parseUnits('0.25', 'gwei')
        }
        try {
            let receipt;
            if(fromToken === 'ETH') {
                // receipt = await cantract.swapExactETHForTokens(amountOutMin, path, wallet.address, deadline, stable, overrides)
                receipt = await cantract.swapExactETHForTokensSupportingFeeOnTransferTokens(randomNum, amountOutMin, path, wallet.address, deadline, stable, overrides)
            }else if(toToken === 'ETH') {
                receipt = await cantract.swapExactTokensForETHSupportingFeeOnTransferTokens(randomNum, amountOutMin, path, wallet.address, deadline, stable, overrides)
            }else {
                receipt = await cantract.swapExactTokensForTokensSupportingFeeOnTransferTokens(randomNum, amountOutMin, path, wallet.address, deadline, stable, overrides)
            }
            await receipt.wait();
            console.log(`${wallet.address} 兑换代币 成功, hash:${receipt.hash}`);
            await this.addRecord(paths.zksyncSuccessLogFile, wallet.address, nonce+2, `${projectInfo['website']} 兑换代币`, receipt.hash)
        } catch(error) {
            console.log(`${wallet.address} 兑换代币 失败, ${error}`)
            await this.addRecord(paths.zksyncFailedLogFile, wallet.address, nonce+2, `${projectInfo['website']} 兑换代币`, error)
        }
    }

    async syncSwapToken(wallet, projectInfo, slippage=0.5) {
        // eth->usdc。没跑通。老提示gas问题。。。数据组装没问题
        const { fromToken, fromTokenInfo, randomNum, toToken, toTokenInfo } = await this.getRandomTokenPairs(wallet)

        console.log(`--------兑换操作：通过${projectInfo.name} 兑换 ${ethers.utils.formatUnits(randomNum.toString(), fromTokenInfo['decimals'])} ${fromToken} ---> ${ethers.utils.formatUnits(amountOutMin.toString(), toTokenInfo['decimals'])} ${toToken} -------------`)
        const block = await wallet.provider.getBlock()
        const deadline = block.timestamp + 60 * 1000
        const contractAddress = '0x2da10A1e27bF85cEdD8FFb1AbBe97e53391C0295'; // 智能合约地址
        const { encodedParams } = generateTransactionData("swap(address,address,uint256)", ["0x5AEa5775959fBC2557Cc8789bC1bf90A239D9a91",wallet.address,2]);
        const { transactionData:input_data } = generateTransactionData("swap(((address,bytes,address,bytes)[],address,uint256)[],uint256,uint256)", [[[[[
            '0x80115c708E12eDd42E504c1cD52Aea96C547c05c',
            encodedParams,
            '0x0000000000000000000000000000000000000000',
            '0x'
        ]], '0x0000000000000000000000000000000000000000', 100000000000000]], 185680, deadline]);
        console.log(input_data)
        // process.exit()
        // 创建交易对象
        const transaction = {
            to: contractAddress,
            data: input_data,
            gasPrice: ethers.utils.parseUnits('0.25', 'gwei'), //设置 gas 价格，根据当前网络情况调整
            gasLimit: 1541608,
            // 下面数据ethers库自动处理，不必手动组装
            //nonce: await provider.getTransactionCount(wallet.address),
            //chainId:5
        };
        
        // 估算交易所需的 gas 量
        // const gasLimit = await wallet.estimateGas(transaction);
        // transaction.gasLimit = gasLimit;
        try {
            // 使用您的钱包连接的提供程序发送交易
            const receipt = await wallet.sendTransaction(transaction);
            await receipt.wait();
            console.log(`${wallet.address} 交易 成功, hash:${receipt.hash}`);
        } catch(error) {
            console.log(`${wallet.address} 交易 失败, 原因:${error}`)
        }
        
    }
}

// const trade = new TradeUtil()
// trade.swapToken(11)