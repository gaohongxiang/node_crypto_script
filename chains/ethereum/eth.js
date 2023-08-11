import { ethers } from 'ethers';
// import {alchemyEthMainnetApi, alchemyGoerliMainnetApi} from './config.js';
import * as config from '../../config.js'; // 全部导入。使用:config.alchemyEthMainnetApi
import { getInfo, generateTransactionData } from '../../utils/utils.js';
import { CryptText } from '../../crypt_module/crypt_text.js';
import { myFormatData } from '../../formatdata.js'
// 退出当前进程
// process.exit();

class EthersUtil {
	constructor(chain) {
		this.chain = chain.toLowerCase();
		let rpc; // ES6有块级作用域。如果想在外部使用要先在外部声明一下
		// includes()方法用于检查chain变量是否包含在给定的数组['eth', 'ethereum']中
		if (['eth', 'ethereum', 'erc20'].includes(this.chain)) {
			rpc = `https://eth-mainnet.g.alchemy.com/v2/${config.alchemyEthMainnetApi}`; // mainnet
			this.etherscanUrl = 'https://api.etherscan.io/';
			this.etherscanApi = config.ethEtherscanApi;
		} else if (this.chain === 'goerli') {
			rpc = `https://eth-goerli.g.alchemy.com/v2/${config.alchemyGoerliMainnetApi}`; // goerli
			this.etherscanUrl = 'https://api-goerli.etherscan.io/';
			this.etherscanApi = config.ethEtherscanApi;
		} else if (['arb', 'arbitrum'].includes(this.chain)) {
			rpc = `https://arb-mainnet.g.alchemy.com/v2/${config.alchemyArbitrumMainnetApi}`; // arbitrum
			this.etherscanUrl = 'https://api.arbiscan.io/';
			this.etherscanApi = config.arbitrumEtherscanApi;
		} else {
			console.log('链不存在, 请重新输入')
			return
		}
		this.provider = new ethers.JsonRpcProvider(rpc);
		this.mainTokens = ['ETH', 'BNB', 'MATIC', 'AVAX']
	}

    async getWallet(enPrivateKey) {
        const cryptText = new CryptText()
        const privateKey = await cryptText.decryptText(enPrivateKey);
        const wallet = new ethers.Wallet(privateKey, this.provider);
        // console.log(wallet)
        return wallet
    }

	async getNetwork() {
		// 如果出错，打印错误，返回null
		const network = await this.provider.getNetwork().catch(err => { console.log(err); return null; });
		const networkName = network.name;
		const networkChainId = network.chainId;
		console.log(`provider连接到了${networkName}, chainId:${networkChainId}`);
		return { networkName, networkChainId };
	}

	async getLastBlockNumber() {
		const lastBlockNumber = await this.provider.getBlockNumber().catch(err => { console.log(err); return null; });
		console.log('当前最新区块号：', lastBlockNumber);
		return lastBlockNumber;
	}

	async getBlockInfo(blockNumber) {
		const blockInfo = await this.provider.getBlock(blockNumber).catch(err => { console.log(err); return null; });
		console.log('最新区块信息：', blockInfo);
		return blockInfo;
	}

	async getTransactionCount(address) {
		const txCount = await this.provider.getTransactionCount(address).catch(err => { console.log(err); return null; });
		console.log(`地址${address}, 历史交易次数:${txCount}`);
		return txCount
	}

	async getBytecode(tokenAddr){
		// 7. 给定合约地址查询合约bytecode，例子用的WETH地址
		const code = await this.provider.getCode(tokenAddr).catch(err => { console.log(err); return null; });
		console.log(`地址${tokenAddr}合约bytecode: ${code}`);
		return code
	}

	async getGasInfo() {
		const feeData = await this.provider.getFeeData().catch(err => { console.log(err); return null; });
		const gasPrice = ethers.formatUnits(feeData['gasPrice'], 'gwei');
		const maxFeePerGas = ethers.formatUnits(feeData['maxFeePerGas'], 'gwei');
		const maxPriorityFeePerGas = ethers.formatUnits(feeData['maxPriorityFeePerGas'], 'gwei');
		console.log(`gasPrice:${gasPrice}\nmaxFeePerGas:${maxFeePerGas}\nmaxPriorityFeePerGas:${maxPriorityFeePerGas}`);
		return { gasPrice, maxFeePerGas, maxPriorityFeePerGas };
	}

	async getBalance(address, token) {
		token = token.toUpperCase();
		let tokenBalance
		if (this.mainTokens.includes(token)){
			const tokenBalanceWei = await this.provider.getBalance(address).catch(err => { console.log(err); return null; });
			tokenBalance = ethers.formatEther(tokenBalanceWei);
			console.log(`地址 ${address} ${token}余额: ${tokenBalance}`);
		} else {
			const { tokenAddr, tokenAbi } = await getInfo(token, this.chain);
			const tokenContract = new ethers.Contract(tokenAddr, tokenAbi, this.provider);
			// process.exit()
			const tokenBalanceWei  = await tokenContract.balanceOf(address).catch(err => { console.log(err); return null; });
			tokenBalance = ethers.formatEther(tokenBalanceWei);
			console.log(`地址 ${address} ${token}余额: ${tokenBalance}`);
		};
		return tokenBalance;
	}

	async getTokenAbi(tokenAddr) {
		const response = await fetch(`${this.etherscanUrl}api?module=contract&action=getabi&address=${tokenAddr}&apikey=${this.etherscanApi}`).catch(err => { console.log(err); return null; });
		const data = await response.json().catch(err => { console.log(err); return null; });
		const tokenAbi = data.result;
		// console.log(tokenAbi);
		return tokenAbi;
	}

	async getTokenInfo(tokenAddr, tokenAbi = []) {
		if (tokenAbi.length === 0) {
			tokenAbi = await this.getTokenAbi(tokenAddr);
		}
		const tokenContract = new ethers.Contract(tokenAddr, tokenAbi, this.provider);
		// 并行，缩短程序执行时间
		// 使用Promise.all()同时获取多个异步结果时，返回的结果是一个包含每个异步操作结果的数组。用数组结构赋值获取结果
		const [ tokenName, tokenSymbol, tokenTotalSupply ] = await Promise.all([
			tokenContract.name(),
			tokenContract.symbol(),
			tokenContract.totalSupply(),
		]).catch(err => { console.log(err); return null; });
		console.log(`代币名称: ${tokenName}\n代币符号: ${tokenSymbol}\n代币总供应量: ${tokenTotalSupply}`)
		return { tokenName, tokenSymbol, tokenTotalSupply }
	}

	async sendToken(token, privateKey, to, value) {
		try {
			token = token.toUpperCase()
			const wallet = new ethers.Wallet(privateKey, this.provider);
			const address = await wallet.getAddress();
			console.log(address)
			if (this.mainTokens.includes(token)){
				console.log(`地址 ${address} 发送前 ${token} 余额: ${ethers.formatEther(await this.provider.getBalance(address))}`);
				// 构造交易请求，参数：to为接收地址，value为ETH数额
				const tx = {
					to,
					value: ethers.parseEther(value.toString()),
				};
				// 发送交易，获得收据
				const receipt = await wallet.sendTransaction(tx);
				console.log('等待交易在区块链确认（需要几分钟）');
				await receipt.wait(); // 等待链上确认交易
				console.log(`交易哈希: ${receipt.hash}`); // 打印交易详情
				console.log(`地址 ${address} 发送后 ${token} 余额: ${ethers.formatEther(await wallet.getBalance())}`);
			} else {
				const { tokenAddr, tokenAbi } = await getInfo(token, this.chain);
				const tokenContract = new ethers.Contract(tokenAddr, tokenAbi, wallet);
				console.log(`地址 ${address} 发送前 ${token} 余额: ${ethers.formatEther(await tokenContract.balanceOf(address))}`);
				// const tx = {
				//     to: to,
				//     value: ethers.utils.parseEther((value).toString())
				// }
				const receipt = await tokenContract.transfer(to, ethers.parseEther((value).toString()));
				console.log('等待交易在区块链确认（需要几分钟）');
				await receipt.wait();
				console.log(`交易哈希: ${receipt.hash}`); // 打印交易详情
				// iv. 打印交易后余额
				console.log(`地址 ${address} 发送后 ${token} 余额: ${ethers.formatEther(await tokenContract.balanceOf(address))}`);
			}
		} catch (err) {
			console.log(err.code);
		}
	}

	async sendErc20Token(tokenAddr, tokenAbi, privateKey, to, value) {
		try {
			const wallet = new ethers.Wallet(privateKey, this.provider);
			const tokenContract = new ethers.Contract(tokenAddr, tokenAbi, wallet);

			const [address, tokenSymbol] = await Promise.all([
				wallet.getAddress(),
				tokenContract.symbol(),
			]);

			await tokenContract.balanceOf(address).then(balance => console.log(`地址 ${address} ${tokenSymbol} 余额: ${balance}`));

			// const tx = {
			//     to: to,
			//     value: ethers.utils.parseEther((value).toString())
			// }
			const receipt = await tokenContract.transfer(to, ethers.utils.parseEther((value).toString()));
			console.log('等待交易在区块链确认（需要几分钟）');
			await receipt.wait();
			console.log(`交易哈希: ${receipt.hash}`); // 打印交易详情
			// iv. 打印交易后余额
			console.log(`地址 ${address} 发送后余额: ${ethers.utils.formatEther(await tokenContract.balanceOf(address))} ETH`);
		} catch (err) {
			console.log(err.code);
		}
	}

	async listenContract(tokenAddr, tokenAbi) {
		// 币安交易所地址
		const accountBinance = '0x28C6c06298d514Db089934071355E5743bf21d60';
		const tokenContract = new ethers.Contract(tokenAddr, tokenAbi, this.provider);
		const tokenSymbol = await tokenContract.symbol();
		await tokenContract.balanceOf(accountBinance).then(balance => (console.log(`币安交易所钱包 ${accountBinance} ${tokenSymbol} 余额: ${balance}`)));
		const filter = tokenContract.filters.Transfer(null, accountBinance);
		console.log('---------监听USDT进入交易所--------');
		tokenContract.on(filter, (from, to, value) => {
			console.log(`${from} -> ${to} ${ethers.utils.formatUnits(ethers.BigNumber.from(value), 'ether')}`);
		});
	}

	async claim(privateKey, gasLimit) {
		const contractAddress = '0x67a24ce4321ab3af51c2d0a4801c3e111d88c9d9';
		const contractABI = ['function claim() public'];
		const wallet = new ethers.Wallet(privateKey, this.provider);
		const contract = new ethers.Contract(contractAddress, contractABI, wallet);
		// console.log(contract)
		let gasPrice = await this.provider.getGasPrice();
		gasPrice = BigNumber.from(gasPrice * 1.2);
		gasLimit = BigNumber.from(gasLimit * 2);
		const claimTx = await contract.claim({ gasPrice, gasLimit });
		const signedClaimTx = await wallet.signTransaction(claimTx);
		const txResponse = await this.provider.sendTransaction(signedClaimTx);
		// console.log(`Transaction hash: ${txResponse.hash}`);
	}

    async mint(enPrivateKey) {
        const wallet = await this.getWallet(enPrivateKey)
        const contractAddress = '0xAE4851f02CCe16da076348b93d8bA70bd96108EA'
        const contractAbi = ['function safeMint(address, uint256)']
        const contract = new ethers.Contract(contractAddress, contractAbi, wallet)
        try {
            // 使用您的钱包连接的提供程序发送交易(自动签署交易？)
            const txResponse = await contract.safeMint(wallet.address, 8);
            console.log('Transaction hash:', txResponse.hash);
            // 等待交易被确认
            const receipt = await txResponse.wait();
            console.log('Transaction has been confirmed in block number', receipt.blockNumber);
        } catch(error) {
            console.error('Error occurred during the mint process:', error);
        }

        // const input_data = generateTransactionData("safeMint(address,uint256)", [wallet.address,5]);
        // console.log(input_data)
        // // 创建交易对象
        // const transaction = {
        //     to:  contractAddress, // 合约地址
        //     data: input_data,
        //     gasPrice: ethers.parseUnits('30', 'gwei'), //设置 gas 价格，根据当前网络情况调整
        //     // nonce: await this.provider.getTransactionCount(wallet.address),
        //     // chainId:5
        // };
        
        // // 估算交易所需的 gas 量
        // const gasLimit = await wallet.estimateGas(transaction);
        // transaction.gasLimit = gasLimit;
        // try {
        //     // 使用您的钱包连接的提供程序发送交易(自动签署交易？)
        //     const txResponse = await wallet.sendTransaction(transaction);
        //     console.log('Transaction hash:', txResponse.hash);
        //     // 等待交易被确认
        //     const receipt = await txResponse.wait();
        //     console.log('Transaction has been confirmed in block number', receipt.blockNumber);
        // } catch(error) {
        //     console.error('Error occurred during the mint process:', error);
        // }
    }
}
const data = await myFormatData(21)
// console.log(data)
for (const d of data) {
    const myEthers = new EthersUtil('eth');
    // myEthers.createWallet()
    await myEthers.getNetwork();
    // await myEthers.mint(d['enPrivateKey']);

    // myEthers.getTransactionCount('0x4D00210444949bBA6353bf1b0ae6e755404071Bf')
    // myEthers.getBalance('0x6cD70ffeb89373D89712BB5347e34F4680497586', 'PEOPLE');
    myEthers.getGasInfo();
    // blockNumber = myEthers.getLastBlockNumber();
    // myEthers.getBlockInfo(blockNumber)
    // myEthers.getBytecode('0xc778417e063141139fce010982780140aa0cd5ab')
    // myEthers.getTokenAbi('0xF57e7e7C23978C3cAEC3C3548E3D615c346e79fF')

    // 获取代币信息
    // 参数tokenAddr, tokenAbi = []（传惨为[]的话代表自动从ethscan获取abi
    // myEthers.getTokenInfo('0x6B175474E89094C44Da98b954EedeAC495271d0F', []);

    // myEthers.sendToken('people', '0x696a83dc8503134e97e28a53fe06ccbd3779e180834507e53c6c4ed3db37dd9b', '0x12E216FE19D38194d51ec7Fb6a37C30bf9D6b026', 0.01);
    // myEthers.sendErc20Token('0x326C977E6efc84E512bB9C30f76E30c160eD06FB', [
    // 		'function name() view returns (string)',
    //         'function symbol() view returns (string)',
    //         'function totalSupply() view returns (uint256)',
    //         'function balanceOf(address) public view returns(uint)',
    //         'function deposit() public payable',
    //         'function transfer(address, uint) public returns (bool)',
    //         'function withdraw(uint) public',
    //     ], '0xa926c3f24698e65e119e9deb99e8df57e5b664270b7f969ec148124fd0c688bb', '0x12E216FE19D38194d51ec7Fb6a37C30bf9D6b026', 0.001);
    //     // eth主网usdt
    // myEthers.listenContract('0xdac17f958d2ee523a2206206994597c13d831ec7', [
    //         'event Transfer(address indexed from, address indexed to, uint value)',
    //         'function symbol() view returns (string)',
    //         'function balanceOf(address) public view returns(uint)',
    //       ]);
    // myEthers.claim('0xe89259cd365c0264658547a8f6cc35e7139c2cab002e02fd1d721c66f0aaa524', 455210);
}