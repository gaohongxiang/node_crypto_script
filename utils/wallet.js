import { ethers } from 'ethers';
import fs from 'fs';
import { encryptText } from '../crypt_module/crypt_text.js';
import { generateRandomString } from './utils.js';

async function createWallet(num = 2, walletfile = 'wallets.csv') {
	// 判断文件是否存在
	if (!fs.existsSync(walletfile)) {
	  // 文件不存在则创建文件并写入标题行
	  const header = 'wallet_id,address,enPrivateKey,enMnemonic,enPassword\n';
	  fs.writeFileSync(walletfile, header);
	}
	
	const file = fs.openSync(walletfile, 'a');
	
	for (let i = 1; i <= num; i++) {
		const wallet = ethers.Wallet.createRandom();
        const enPrivateKey = await encryptText(wallet.privateKey)
        const enMnemonic = await encryptText(wallet.mnemonic.phrase)
        const randomPassword = generateRandomString(18)
        const enPassword = await encryptText(randomPassword)
		const rowData = `${i},${wallet.address},${enPrivateKey},${enMnemonic},${enPassword}\n`
	
		// 文件存在则追加,不存在则创建
		fs.appendFileSync(file, rowData);  
	}
  
	fs.closeSync(file);
	console.log(`已将 ${num} 个钱包存储到 ${walletfile}`);
  }

async function createPasswordWallet(num = 2, walletfile = 'wallets.csv') {
	// 判断文件是否存在
	if (!fs.existsSync(walletfile)) {
	  // 文件不存在则创建文件并写入标题行
	  const header = 'wallet_id,enPassword\n';
	  fs.writeFileSync(walletfile, header);
	}
	
	const file = fs.openSync(walletfile, 'a');
	
	for (let i = 1; i <= num; i++) {
        const randomPassword = generateRandomString(18)
        const enPassword = await encryptText(randomPassword)
		const rowData = `${i},${enPassword}\n`
	
		// 文件存在则追加,不存在则创建
		fs.appendFileSync(file, rowData);  
	}
  
	fs.closeSync(file);
	console.log(`已将 ${num} 个钱包存储到 ${walletfile}`);
}

/**
 * 在现有的 CSV 文件中添加新列（加密密码）并补全值，并将结果写回到现有的 CSV 文件中。
 * @param {string} filePath - 要读取和更新的现有 CSV 文件路径。
 * @param {string} newColumnName - 要添加的新列的列名。
 */
async function addColumnAndPopulate(filePath, newColumnName) {
    try {
      const data = await fs.promises.readFile(filePath, 'utf8');
  
      // 解析 CSV 文件内容
      const rows = data.split('\n');
      const header = rows.shift().split(',');
  
      // 添加新列名
      header.push(newColumnName);
  
      // 更新每一行的值
      for (let i = 0; i < rows.length; i++) {
        const row = rows[i].split(',');
        const randomPassword = generateRandomString(18);
        const enPassword = await encryptText(randomPassword);
        row.push(enPassword);
        rows[i] = row.join(',');
      }
  
      // 生成更新后的 CSV 文件内容
      const updatedContent = [header.join(','), ...rows].join('\n');
  
      // 写回到现有的 CSV 文件
      await fs.promises.writeFile(filePath, updatedContent, 'utf8');
      console.log('成功添加新列');
    } catch (err) {
      console.error('添加新列失败：', err);
    }
  }

// 调用示例
await createWallet(5, 'wallets.csv');
// await createPasswordWallet(100, 'wallet_password.csv')
// await addColumnAndPopulate('../data/wallet_eth_tugou.csv', 'enPassword');