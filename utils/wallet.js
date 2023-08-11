import { ethers } from 'ethers';
import fs from 'fs';

function createWallet(num = 2, walletfile = 'wallets.csv') {
	// 判断文件是否存在
	if (!fs.existsSync(walletfile)) {
	  // 文件不存在则创建文件并写入标题行
	  const header = 'wallet_id,address,private_key,mnemonic\n';
	  fs.writeFileSync(walletfile, header);
	}
	
	const file = fs.openSync(walletfile, 'a');
	
	for (let i = 1; i <= num; i++) {
		const wallet = ethers.Wallet.createRandom();
		const rowData = `${i},${wallet.address},${wallet.privateKey},${wallet.mnemonic.phrase}\n`
	
		// 文件存在则追加,不存在则创建
		fs.appendFileSync(file, rowData);  
	}
  
	fs.closeSync(file);
	console.log(`已将 ${num} 个钱包存储到 ${walletfile}`);
  }

createWallet(10);