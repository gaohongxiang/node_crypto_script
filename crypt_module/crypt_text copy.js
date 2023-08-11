import crypto from 'crypto';
import fs from 'fs';
import Papa from 'papaparse';
import { parseToken } from './onepassword.js';
import { personal_token } from '../config.js';
/**
 * 使用crypto的aes-256-gcm算法（等同于python的cryptography库的AESGCM模式）对敏感数据加解密,确保数据在传输或存储过程中的保密性和完整性。此模式提供了高效的认证和加密, 因此被认为是最好的加密模式之一。
 * 需要三个参数
 * 1、密钥
 * crypto.createHash('sha256') 哈希函数将密码转换成一个固定长度的 32 字节(256 位)哈希值。这使得我们可以用一个恒定长度的密钥来执行加密和解密操作。
 *
 * 2、初始化向量iv
 * iv的主要目的是提高加密过程的随机性,使用不同的iv,确保每个加密操作的输出都是唯一的。因此相同的明文也会加密成不同的密文。可防止对加密消息进行重放攻击。
 * 一个加密文本需要一个iv,一个比较好的实践是iv跟密文一起存储,解密时分离。将iv与密文一起存储不会影响加密的安全性。因为iv的主要目的是提高加密过程的随机性,而不是保持机密。因此,即使攻击者知道iv,他们仍然无法破解加密数据,除非他们获得了密钥。
 *
 * 3、authTag
 * 加密过程中自动生成authTag。需要存储到密文中，解密用。一个完整的密文是：iv + encrypted + authTag
 * 解密时拆开，authTag来验证数据的完整性。
 */

// 这种方法不管用没用到都会加载。
// if(!process.env.KEY) {
//     const KEY = await parseToken(personal_token);
//     process.env.KEY = KEY
// }

class CryptText {

    strToBytes(password) {
        const hash = crypto.createHash('sha256');
        hash.update(password);
        const passwordBytes = hash.digest();
        return passwordBytes;
    }

    async encryptText(text) {
        try {
            if(!process.env.KEY) {
                const KEY = await parseToken(personal_token);
                process.env.KEY = KEY
            }
            const passwordBytes = this.strToBytes(process.env.KEY);
            const iv = crypto.randomBytes(12); // Generate a random 12-byte IV
            const cipher = crypto.createCipheriv('aes-256-gcm', passwordBytes, iv);
            let encrypted = cipher.update(text, 'utf8', 'hex');
            encrypted += cipher.final('hex');
            const authTag = cipher.getAuthTag();
            const encryptedData = `${iv.toString('hex')}${encrypted}${authTag.toString('hex')}`;
            return encryptedData;
        } catch(error) {
            console.log('加密失败', error)
            return null
        }
    }

    async decryptText(encryptedText) {
        try {
            if(!process.env.KEY) {
                const KEY = await parseToken(personal_token);
                process.env.KEY = KEY
            }
            const passwordBytes = this.strToBytes(process.env.KEY);
            const iv = Buffer.from(encryptedText.slice(0, 24), 'hex'); // Extract the IV from the encrypted data
            const encrypted = encryptedText.slice(24, -32);
            const authTag = Buffer.from(encryptedText.slice(-32), 'hex');
            const decipher = crypto.createDecipheriv('aes-256-gcm', passwordBytes, iv);
            decipher.setAuthTag(authTag);
            let decrypted = decipher.update(encrypted, 'hex', 'utf8');
            decrypted += decipher.final('utf8');
            return decrypted;
        } catch(error) {
            console.log('解密失败', error)
            return null
        }
    }

    /**
     * 对 CSV 文件的某一列加密。
     *
     * @param {string} filePath - CSV 文件的路径。
     * @param {string} columnName - 要加密的列名。
     */
    async encryptColumn(filePath, columnName) {
        // 读取文件并解析 CSV 数据
        const fileContent = fs.readFileSync(filePath, 'utf8');
        const parsedData = Papa.parse(fileContent, { header: true, skipEmptyLines: true }); //skipEmptyLines跳过空行
        // 对指定列进行加密
        for (const row of parsedData.data) {
            row[columnName] = this.encryptText(row[columnName]);
        }

        // 将处理后的数据保存回原文件
        const csvContent = Papa.unparse(parsedData.data);
        fs.writeFileSync(filePath, csvContent);
    }

    async decryptColumn(filePath, columnName) {
        // 读取文件并解析 CSV 数据
        const fileContent = fs.readFileSync(filePath, 'utf8');
        const parsedData = Papa.parse(fileContent, { header: true, skipEmptyLines: true });
      
        // 对指定列进行解密
        for (const row of parsedData.data) {
            row[columnName] = this.decryptText(row[columnName]);
        }
      
        // 将处理后的数据保存回原文件
        const csvContent = Papa.unparse(parsedData.data);
        fs.writeFileSync(filePath, csvContent);
    }
}


// const cryptText = new CryptText();

// const encryptedText = await cryptText.encryptText('503f38a9c967ed597e47fe25643985f032b072db8075426a92110f82df48dfcb');
// console.log(`Encrypted text: ${encryptedText}`);

// const decryptedText = await cryptText.decryptText('ea422b772f393a8177c31c71f99b5a5fbda4868a69141141f1df647129140f7d2e');
// console.log(`Decrypted text: ${decryptedText}`);

// await cryptText.encryptColumn('./data/wallets.csv', 'enPrivateKey')
// await cryptText.encryptColumn('./data/wallets.csv', 'enMnemonic')
// await cryptText.encryptColumn('./wallet/data/wallet_tugou.csv', 'tugou_enPrivateKey')
// await cryptText.encryptColumn('./wallet/data/wallet_tugou.csv', 'tugou_enMnemonic')
// await cryptText.decryptColumn('./data/wallets.csv', 'enPrivateKey')
// await cryptText.decryptColumn('./data/wallets.csv', 'enMnemonic')

export { CryptText };