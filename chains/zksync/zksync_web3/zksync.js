// zksync-ethers继承了ethers。跟zksync交互只需要导入zksync-ethers即可。如果需要跟以太坊主网交互还是需要ethers
import * as zksync from "zksync-ethers";
import * as ethers from "ethers";
import fs from 'fs';
import { getInfo } from '../../../utils/utils.js';
import * as paths from '../../../paths.js'
import * as config from '../../../config.js'; // 全部导入。使用:config.alchemyEthMainnetApi
import { myFormatData } from "../../../formatdata.js";
// 退出当前进程
// process.exit();

export class ZksyncUtil {

    async getTransactionCount(zksyncProvider, address) {
		const txCount = await zksyncProvider.getTransactionCount(address).catch(err => { console.log(err); return null; });
		console.log(`地址${address}, 历史交易次数:${txCount}`);
		return txCount
	}

    async getGasPrice(zksyncProvider) {
        try {
            let gasPrice = (await zksyncProvider.getGasPrice()).toString()
            gasPrice = ethers.utils.formatUnits(gasPrice, 'gwei')
            return gasPrice
        } catch(error) {
            console.log(error)
            return null
        }
    }

    async getGasInfo(ethereumProvider) {
		const feeData = await ethereumProvider.getFeeData().catch(err => { console.log(err); return null; });
		const gasPrice = ethers.utils.formatUnits(feeData['gasPrice'], 'gwei');
		const maxFeePerGas = ethers.utils.formatUnits(feeData['maxFeePerGas'], 'gwei');
		const maxPriorityFeePerGas = ethers.utils.formatUnits(feeData['maxPriorityFeePerGas'], 'gwei');
		// console.log(`gasPrice:${gasPrice}\nmaxFeePerGas:${maxFeePerGas}\nmaxPriorityFeePerGas:${maxPriorityFeePerGas}`);
		return { gasPrice, maxFeePerGas, maxPriorityFeePerGas };
	}

    async checkGasPrice() {
        const { gasPrice } = await this.getGasInfo()
        if (gasPrice <= config.ethereumGasPrice) {
            return true
        } else {
            console.log(`当前eth主网gas高于设定的gasPrice:${config.ethereumGasPrice},等待gas降低`)
            return false
        }
    }

    async getTokenAbi(tokenAddr) {
		const response = await fetch(`${this.etherscanUrl}api?module=contract&action=getabi&address=${tokenAddr}&apikey=${this.etherscanApi}`).catch(err => { console.log(err); return null; });
		const data = await response.json().catch(err => { console.log(err); return null; });
		const tokenAbi = data.result;
		// console.log(tokenAbi);
		return tokenAbi;
	}


    /**
     * 获取指定地址的以太坊余额或指定代币余额
     * @param {string} address 要查询余额的以太坊地址
     * @param {string} token 要查询余额的代币名称，缺省值为 'ETH'，表示查询以太坊余额
     * @param {string} blockTag 查询区块的标识符，缺省值为 'committed'，表示查询已提交的区块
     * @return {string} 查询到的余额，以字符串形式返回
     * 注：zksync-web3内部用ethers.js处理了erc20token获取余额方法。统一用getBalance方法查询。
     */
    async getBalance(zksyncProvider, address, token='ETH', blockTag='committed') {
        token = token.toUpperCase();
        let tokenBalance
        if (token === 'ETH'){
            tokenBalance = await zksyncProvider.getBalance(address).catch(err => { console.log(err); return null; });
            tokenBalance = ethers.utils.formatEther(tokenBalance);
        } else {
            const tokenInfos = getInfo(paths.tokenFile, 'zksync')
            tokenBalance = await zksyncProvider.getBalance(address, blockTag, tokenInfos[token]['address']).catch(err => { console.log(err); return null; });
            tokenBalance = ethers.utils.formatUnits(tokenBalance, tokenInfos[token]['decimals']);
        }
        // 获取地址所有代笔余额
        // const allBalance = await this.zksyncProvider.getAllAccountBalances(address)
        // console.log(allBalance)
        console.log(`地址 ${address} ${token}余额: ${tokenBalance}`);
        return tokenBalance
    }

    async addRecord(filePath, address, nonce, projectName, result) {
        // // 获取数据，用换行符分割成数组，并去掉第一行数据（第一行为表头）
        // const rows = fs.readFileSync(filePath, "utf8").split("\n").slice(1);
        // // 每个字段分割出来
        // const records = rows.map(row => {
        //     const [id, address, date, projectName, result] = row.split(sep);
        //     return { id, address, date, projectName, result };
        //   });
        // // 根据address查找，没有就将nonce置为0，有就获取最后一条记录的nonce
        // const existingRecords = records.filter(r => r.address === address);
        // let nonce;
        // if (existingRecords.length === 0) {
        //     nonce = 0;   
        // } else {
        //     nonce = parseInt(existingRecords[existingRecords.length - 1].id, 10);
        // }
        // 获取时间 
        const date = new Date();
        const utc8Offset = 480; // UTC+8 的时区偏移量为 480 分钟
        const utc8Date = new Date(date.getTime() + utc8Offset * 60 * 1000).toISOString();
        // 构建记录
        const record = `${nonce},${address},${utc8Date},${projectName},${result}`;
        // 追加记录
        fs.appendFile(filePath, "\n" + record, (err) => {
            if (err) console.log(err);
        });
    }
}

// const data = await myFormatData(22)
// for (const d of data) {
//     const zks = new ZksyncUtil();
//     // zks.checkGasPrice()
//     // const wallet = await zks.getWallet(d['enPrivateKey'])
//     // console.log(wallet)
//     // zks.depositL1ToL2(d['enPrivateKey'], 0.01)
//     // zks.getTransactionCount('0x2b0eb9cb44c717784A4879466FB7fA2D5A214B33')
//     zks.getBalance(new zksync.Provider('https://mainnet.era.zksync.io'),d['address'], 'usdc')
//     // zks.approveToken(d['enPrivateKey'], 'usdc', 'mute-swap')
//     // zks.swapToken(d['enPrivateKey'], 'USDC', 'ETH', 'mute-swap', 10)
//     // zks.mintNft(d['enPrivateKey'], '0x1ec43b024A1C8D084BcfEB2c0548b6661C528dfA', ['function mint()'])

//     // zks.mintZksDomain(d['enPrivateKey'])
//     // zks.addRecord('./chains/zksync/successlog.csv', '0x2b0eb9cb44c717784A4879466FB7fA2D5A214B33', 'rger', 'erv')
// }