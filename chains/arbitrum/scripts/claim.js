import { ethers } from 'ethers';
import fs from 'fs';

const provider = new ethers.JsonRpcProvider("");

// 配置空投合约和 ERC20 代币合约的地址和 ABI
const airdropContractAddress = "0x96fe324b73329f97cCc6da1EE8A4E3ecEd7FD4Eb"; // 领取合约地址
const airdropContractABI = [
    "function claim() public",
	"function claimed() public",
];
const erc20TokenContractAddress = "0xe9aa02460D97bCCb1261C2966fE41c7d48A818c2"; //erc20代币合约地址
const erc20TokenContractABI = [
	"function balanceOf(address) view returns (uint)",
	"function transfer(address,uint256) returns (bool)"  
];

const amount = ethers.parseEther('0.03')

const mainWallet = new ethers.Wallet('', provider)

async function claimAirdrop() {
	const data = myData();
	// map() 返回的是一个数组,这个数组包含了所有异步任务。Promise.all(),并行执行这些任务。这里不用for of循环的原因是后者是顺序执行每个任务完成，再执行下一个任务。多个账号同时领空投的话肯定并行更合适。
	const results = await Promise.allSettled(data.map(async ({ privateKey, address }) => {
		// 使用统一的提供者对象provider时，当发生错误时只捕获了一个私钥的错误。查了很久，目前解决方案是为每个异步操作创建独立的提供者对象，以避免可能的竞争条件和共享状态问题。
		const batchWallet = new ethers.Wallet(privateKey, new ethers.JsonRpcProvider(''));
		// const batchWallet = new ethers.Wallet(privateKey, provider);
		const airdropContract = new ethers.Contract(airdropContractAddress, airdropContractABI, batchWallet);
		const erc20TokenContract = new ethers.Contract(erc20TokenContractAddress, erc20TokenContractABI, batchWallet);
		
		let sendSuccess = false;
		let claimSuccess = false;
    	let transferSuccess = false;

		// 从主钱包发送 0.01 ETH 到目标钱包
		while (true) {
			if (sendSuccess == true) {
				break;
			}else {
				const tx = {
					to: batchWallet.address,
					value: amount,
				  };
				try {
					const txResponse = await mainWallet.sendTransaction(tx);
					console.log(`ETH转账成功\n接收地址: ${batchWallet.address}\nhash: ${txResponse.hash}\n`);
					sendSuccess = true;
				} catch (error) {
					console.error(`ETH转账失败\n接收地址: ${batchWallet.address}\n错误信息: ${error.message}\n`);
				}
			};
		};

		// 目标钱包调用空投合约的 claim() 函数领取空投
		while (true) {
			if (claimSuccess == true) {
				break;
			}else {
				try {
					const claimTxResponse = await airdropContract.claim();
					// console.log("Claim transaction hash:", claimTxResponse.hash);
					console.log(`领取空投成功\n地址: ${batchWallet.address}\nhash: ${claimTxResponse.hash}\n`);
					claimSuccess = true;
				} catch (error) {
					// 如果已经claim过了，将claimSuccess改成true
					if (error.reason == 'Already claimed') {
						console.log(`空投已经领取，不能重复领取\n地址: ${batchWallet.address}\n`);
						claimSuccess = true;
					} else {
						// console.error(`Error claiming airdrop for wallet ${batchWallet.address}:`, error.message);
						console.log(`领取空投失败\n地址: ${batchWallet.address}\n错误信息: ${error.message}\n`);
					}
					
					
				}
			};
		};

		// 将空投的 ERC20 代币发送给交易所对应钱包
		while (true) {
			if (transferSuccess == true) {
				break;
			}else {
				try {
					const balance = await erc20TokenContract.balanceOf(batchWallet.address);
					const transferTxResponse = await erc20TokenContract.transfer(address, balance / 2n)
					// console.log("Transfer transaction hash:", transferTxResponse.hash);
					console.log(`转移空投成功\n接收地址: ${address}\nhash: ${transferTxResponse.hash}\n`);
					transferSuccess = true;
				} catch (error) {
					console.log(`转移空投失败\n接收地址: ${address}\n错误信息: ${error.message}\n`);
					// console.error(`Error transferring tokens to main wallet from ${batchWallet.address}:`, error.message);
				}
			};
		};

		return { sendSuccess, claimSuccess, transferSuccess };
	}));
	  
	// 处理成功和失败的操作
	const successfulPromises = results.filter(result => result.success);
	const failedPromises = results.filter(result => !result.success);
	
	console.log("Successful claims:", successfulPromises);
	console.log("Failed claims:", failedPromises);
}

function myData() {
	let wallets = fs.readFileSync("wallets.csv", "utf8")  
	.split("\n") // 使用 .split() 分割行和字段
	.slice(1) // 使用 .slice(1) 去除表头   
	// 去除末尾多余的空行。如果去除所有的空行可以直接用：.filter(line => line.trim())
	wallets = wallets.filter((line, index) => {
		while (wallets.length - 1 > index && !wallets[index].trim()) {
		  index++;        
		}    
		return wallets[index].trim()
	})
	.map(line => line.split(",")); // 使用 .map() 为每行数据构造对象

	let addresses = fs.readFileSync("ok_addresses.csv", "utf8")  
	.split("\n")
	.slice(1)
	addresses = addresses.filter((line, index) => {
		while (addresses.length - 1 > index && !addresses[index].trim()) {
		  index++;        
		}    
		return addresses[index].trim()
	})
	.map(line => line.split(","));

	const privateKeys = [];

	wallets.forEach((wallet, i) => {
		const [ , , privateKey, ] = wallet;  
		const [, address, , ] = addresses[i];
		
		privateKeys.push({
			privateKey,
			address
		});
	});
	// console.log(privateKeys);
	return privateKeys;
}
// myData()
claimAirdrop();