// zksync-web3继承了ethers。跟zksync交互只需要导入zksync-web3即可。如果需要跟以太坊主网交互还是需要ethers
import * as zksync from "zksync-web3";
import * as ethers from "ethers";
import * as paths from '../../../paths.js'
import * as config from '../../../config.js'; // 全部导入。使用:config.alchemyEthMainnetApi
import { generateTransactionData, sleep, loop } from "../../../utils/utils.js";
import { ZksyncUtil } from "./zksync.js";

export class NftUtil extends ZksyncUtil {

    constructor() {
        super()
    }

    async mintNft(wallet, nftAddress, nftAbi) {
        const nftContract = new zksync.Contract(nftAddress, nftAbi, wallet);
        try {
            const receipt = await nftContract.mint();
            await receipt.wait();
            console.log(`${wallet.address} mint nft 成功, hash:${receipt.hash}`);
            await this.addRecord(paths.zksyncSuccessLogFile, wallet.address, 'https://zks.network/ mint nft', receipt.hash)
        } catch(error) {
            console.log(`${wallet.address} mint nft 失败, 原因:${error}`)
            await this.addRecord(paths.zksyncFailedLogFile, wallet.address, 'https://zks.network/ mint nft', error)
        }
    }

    /**
     * 网址：https://zks.network/
     * 合约：0xCBE2093030F485adAaf5b61deb4D9cA8ADEAE509
     */
    async mintZksDomain(wallet, projectInfo) {
        let nonce;
        try {
            console.log(`--------mint域名操作, 通过 ${projectInfo.name} mint 随机数字域名-------------`)
            let domainName = '';
            for (let i = 0; i < 6; i++) {
                domainName += Math.floor(Math.random() * 10);  
            }
            nonce = await wallet.getTransactionCount()
            const zksDomainContract = new zksync.Contract(projectInfo['address'], projectInfo['abi'], wallet);
            const overrides = {
                // gasLimit: 3000000,
                gasPrice: ethers.utils.parseUnits('0.25', 'gwei')
            }
            const receipt = await zksDomainContract.register(domainName, wallet.address, 1, overrides);
            await receipt.wait();
            console.log(`${wallet.address} mint域名 成功, hash:${receipt.hash}`);
            await this.addRecord(paths.zksyncSuccessLogFile, wallet.address, nonce+1, `${projectInfo['website']} 域名注册`, receipt.hash)
        } catch(error) {
            console.log('-------------mintZksDomain---------------')
            if(error.reason === 'could not detect network' || error.reason === 'missing response') {
                sleep(30);
                mintZksDomain(wallet, projectInfo);
            }
            console.log(`${wallet.address} mint域名 失败, 原因:${error}`)
            await this.addRecord(paths.zksyncFailedLogFile, wallet.address, nonce+1, `${projectInfo['website']} 域名注册`, error)
        }
    };

    /**
    * 通过调用智能合约的 claim 函数来创建游戏 NFT。
    * @param {Object} wallet 钱包对象，用于签名交易
    * @param {Object} projectInfo 项目信息对象，包括合约地址等信息
    * @returns {Promise<void>} 不返回任何值，但可能会抛出错误
    */
    async mintRaceNft(wallet, projectInfo) {
        console.log(`--------mint nft操作, 通过 ${projectInfo.name} mint 游戏nft-------------`)
        // 循环 5 次，输出数字 0 到 4
        for (let i = 0; i < 5; i++) {
            let nonce; 
            try {    
                nonce = await wallet.getTransactionCount()
                const { transactionData:input_data } = generateTransactionData("claim(address,uint256,uint256,address,uint256,(bytes32[],uint256,uint256,address),bytes)", [wallet.address, i, 1, '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee', 0, [["0x0000000000000000000000000000000000000000000000000000000000000000"], 1, 0, "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee"], '0x']);
                console.log(input_data)
                // process.exit()
                // 创建交易对象
                const transaction = {
                    to: projectInfo['address'], // 交易发送给项目合约地址
                    data: input_data,
                    gasPrice: ethers.utils.parseUnits('0.25', 'gwei'), //设置 gas 价格，根据当前网络情况调整
                };
                // 估算交易所需的 gas 量
                const gasLimit = await wallet.estimateGas(transaction);
                transaction.gasLimit = gasLimit;
                // 使用您的钱包连接的提供程序发送交易
                const receipt = await wallet.sendTransaction(transaction);
                // 等待交易被确认
                await receipt.wait();
                console.log(`${wallet.address} mint 第 ${i} race nft 成功, hash:${receipt.hash}`);
                await this.addRecord(paths.zksyncSuccessLogFile, wallet.address, nonce+1, `${projectInfo['website']} mint race nft`, receipt.hash)
            } catch(error) {
                console.log('-------------mintRaceNft---------------')
                if(error.reason === 'could not detect network' || error.reason === 'missing response') {
                    sleep(30);
                    mintRaceNft(wallet, projectInfo);
                }
                console.log(`${wallet.address} mint race nft 失败, 原因:${error}`)
                await this.addRecord(paths.zksyncFailedLogFile, wallet.address, nonce+1, `${projectInfo['website']} mint race nft`, error)
            }
        }     
    }
}