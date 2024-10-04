import ccxt from 'ccxt';
import fs from 'fs';
// import csv from 'csv-parser';
import { decryptText } from '../crypt_module/crypt_text.js';


/**
 * 根据输入的链名称返回标准化的链名称。
 * 支持的链名称包括 ETH/ERC20, TRC/TRC20, POLYGON/MATIC 等，
 * 如果输入的链名称不被支持，则抛出错误。
 * 
 * @param {string} chain - 输入的链名称。
 * @returns {string} 标准化后的链名称。
 */
function normalizeChain(chain) {
    const upperChain = chain.toUpperCase(); // 将输入转换为大写以忽略大小写差异
    // 检查输入的链名称是否属于已知的链名称，并返回相应的标准化名称
    if (['ETH', 'ERC20'].includes(upperChain)) {
        return 'ETH';
    } else if (['TRC', 'TRC20', 'TRX'].includes(upperChain)) {
        return 'TRX';
    } else if (['BSC', 'BEP20'].includes(upperChain)) {
        return 'BSC';
    } else if (['POLYGON', 'MATIC'].includes(upperChain)) {
        return 'MATIC';
    } else if (['AVAL', 'AVALANCHE'].includes(upperChain)) {
        return 'AVAX';
    } else if (['ARB', 'ARBITRUM', 'ARBITRUM ONE'].includes(upperChain)) {
        return 'ARBITRUM';
    } else if (['OP', 'OPTIMISM'].includes(upperChain)) {
        return 'OPTIMISM';
    } else if (['ZKS', 'ZKSYNC', 'ERA'].includes(upperChain)) {
        return 'ZKSYNCERA';
    }else if (['STK', 'STARKNET', 'STRK'].includes(upperChain)) {
        return 'STARKNET';
    } else if (['SOL', 'SOLANA'].includes(upperChain)) {
        return 'SOL';
    }else if (['LINEA'].includes(upperChain)) {
        return 'LINEA';
    }else if (['BASE'].includes(upperChain)) {
        return 'BASE';
    }else if (['OPBNB'].includes(upperChain)) {
        return 'OPBNB';
    }else if (['OSMO', 'OSMOSIS'].includes(upperChain)) {
        return 'OSMO';
    } else {
        // 如果输入的链名称不被支持，抛出错误
        throw new Error(`${chain} 链不支持，请重新选择`);
    }
}

/**
 * 创建并配置交易所实例。
 * 
 * @param {string} account 账户名称，用于选择正确的API密钥。
 * @param {string} proxy 代理服务器URL。
 * @param {string} file_ 包含API密钥的JSON文件路径。
 * @returns {Promise<ccxt.Exchange>} 配置好的交易所实例。
 */
async function createExchange(account, file_='./data/binance.json') {

    // 异步读取文件并解析JSON
    const accountApis = JSON.parse(fs.readFileSync(file_, 'utf-8'));
    // console.log(accountApis)
    const proxys = accountApis[account]['main']['api_proxy']
    const randomproxy = proxys[Math.floor(Math.random() * proxys.length)];
    // 创建并配置okx交易所实例
    const binance = new ccxt.binance({
        'apiKey': await decryptText(accountApis[account]['main']['api_key']),
        'secret': await decryptText(accountApis[account]['main']['api_secret']),
        'enableRateLimit': true, // 启用请求速率限制
        'options': { 'adjustForTimeDifference': true }, // 自动调整时间戳以适应本地计算机的时区差异
        'socksProxy': randomproxy, // 使用提供的代理
    });

    return binance;
}

/**
 * 提现函数
 * @param {string} account - 用户账户
 * @param {string} chain - 链名称
 * @param {string} address - 提现地址.外部地址为真实地址(例:0x...),内部地址为哪个账户(例:xxx@gmail.com)
 * @param {string} coin - 提现币种
 * @param {number} amount - 提现数量
 */
export async function withdraw(account, chain, address, coin, amount) {
    /**
     * ccxt统一api: 
            fetchBalance(): 查询账户信息
            fetchDepositAddress(): 获取地址
            fetchTransactionFees(): 获取交易手续费
            withdraw(): 提现
     */
    try {
        const binance = await createExchange(account)
        coin = coin.toUpperCase()
        amount = parseFloat(amount);
        chain = normalizeChain(chain)
        // console.log(chain);
        const allBalance = await binance.fetchBalance() //默认查询现货账户
        // console.log(allBalance)
        const coinBalance = allBalance[coin]['free']
        console.log(`账户 ${account} 现有 ${coinBalance} ${coin}`);

        let addressType, coinTransactionFeeOfChain;

        //内部地址传参为邮箱的形式，用@来判断是不是内部地址，如果是内部地址，根据api自动获取地址，并且转账手续费为0
        //内部先不要用，直接手动转吧
        if (address.includes('@')) {
            addressType = '内部地址';
            // 假设内部地址以邮箱形式给出，获取存款地址并设置手续费为0
            const depositAddress = await binance.fetchDepositAddress(coin, params={"network": self.chain});
            // console.log(depositAddress)
            address = depositAddress.address;
            // console.log(address)
            coinTransactionFeeOfChain = 0.0;
            
        } else {
            addressType = '外部地址';
            // 获取提币手续费
            const transaction_fees = await binance.fetchTransactionFees()
            // console.log(transaction_fees)
            coinTransactionFeeOfChain = transaction_fees['withdraw'][coin][chain]
            console.log(`${chain} 链转账 ${coin} 到外部地址 ${address} 手续费为 ${coinTransactionFeeOfChain} ${coin}`);
        }

        if (amount + coinTransactionFeeOfChain > coinBalance) {
            console.log('提现金额超出余额，请先充值或者减少提现数量');
            return;
        }
        
        // 执行提现操作
        await binance.withdraw(coin, amount + coinTransactionFeeOfChain, address, undefined, {
            network: chain,
            fee: coinTransactionFeeOfChain,//手续费从接收方扣除
            transactionFeeFlag: true //提现到内部地址，免手续费，transactionFeeFlag设置为true手续费归资金接收方; 设置为false手续费归资金转出方. 默认false,设置为true可以将转出方提干净
        });

        console.log(`账户 ${account} 通过 ${chain} 链 提现 ${amount} ${coin} 到 ${addressType} ${address} 请求已提交，等待确认。手续费为 ${coinTransactionFeeOfChain} ${coin}`);
    } catch (error) {
        console.error(`提现错误: ${error}`);
    }  
}