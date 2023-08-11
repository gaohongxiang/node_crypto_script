//node-csv parse 文档：https://csv.js.org/parse/

import { parse } from 'csv-parse';  
import fs from 'fs';
import { ethers } from 'ethers';
import * as paths from '../paths.js'

function getInfo(file=paths.tokenFile, chain=null) {
    let data = fs.readFileSync(file, 'utf-8');
    data = JSON.parse(data);
    if (chain != null) {
        data = data[chain]
    }
    return data;
}

/**
 * 从给定对象中随机选择一个属性，并返回一个包含属性名和属性值的对象。
 * @param {Object} obj - 一个包含属性的对象。
 * @param {Array} excludedKeys - 一个需要排除的属性名数组，可以为 null。
 * @returns {Object} 包含随机选择的属性名和属性值的对象。
 */
function getRandomObject(obj, excludedKeys = null) {
    // 根据 excludedKeys 参数过滤属性名数组
    const keys = excludedKeys === null
        ? Object.keys(obj)
        : Object.keys(obj).filter(key => !excludedKeys.includes(key));
    // 从属性名数组中随机选择一个属性名
    const key = keys[Math.floor(Math.random() * keys.length)];
    // 使用随机选择的属性名获取属性值
    const value = obj[key];
    // 返回包含属性名和属性值的对象
    return { key, value };
}


const getInfo1 = async (filterVal1, filterVal2, file = paths.tokenFile, sep = '|') => {  
	
	if (!fs.existsSync(file)) {  
		console.log(`${file} 文件不存在，请先创建`);  
		return null;  
	}

    let filterCol1;
    let filterCol2;
    let filterCol3;
    let filterCol4;
    let filterCol5;
    if (file.includes('token.csv')) {
        filterVal1 = filterVal1.toUpperCase();  
        filterVal2 = filterVal2.toLowerCase();
        filterCol1 = 'token'
        filterCol2 = 'chain'
        filterCol3 = 'tokenDecimals'
        filterCol4 = 'tokenAddress'
        filterCol5 = 'tokenAbi'
    } else if (file.includes('project.csv')){
        filterVal2 = filterVal2.toLowerCase();
        filterCol1 = 'project'
        filterCol2 = 'chain'
        filterCol3 = 'website'
        filterCol4 = 'contractAddress'
        filterCol5 = 'contractAbi'
    }
	const results = [];

	try {  
        const parser = fs
        .createReadStream(file)
        .pipe(parse({
            delimiter: sep, // 分隔符为sep，默认逗号
            columns: true, // 第一行为列名
            escape: false, // 用于转义的单个字符。它仅适用于与 匹配的字符
            quote: false, // 用于包围字段的字符，该字段周围是否存在引号是可选的，并且会自动检测。false禁用引号检测（abi很多引号，不需要检测）
            skip_empty_lines: true, // 跳过空行
        }));
        // console.log(parser)
        for await(const row of parser) {
            if (row[filterCol1] === filterVal1 && row[filterCol2].includes(filterVal2)) {
                results.push(row);
            }   
        }  
		
        // console.log(results)
		if (results.length === 0) {  
			console.log(`文件 ${file} 中没有 ${filterVal1} 信息，请先添加`);  
			return null;  
		} else if (results.length > 1) {  
			console.log(`文件 ${file} 中有重复的 ${filterVal1} 信息，请先确认`);  
			return null;  
		}

        const result = results[0];
   
        if (!result[filterCol5]) {  
            console.log(`${filterVal1} 未添加 ABI,请先添加。可留空,如'[]'`);  
            return null;  
        }
        if (file.includes('token.csv')) {
            const tokenAddress = result[filterCol4];
            const tokenAbi = result[filterCol5];
            const tokenDecimals = result[filterCol3];
            // console.log(`tokenAddr: ${tokenAddress}\ntokenDecimals: ${tokenDecimals}\ntokenAbi: ${tokenAbi}`);  
            return { tokenAddress, tokenAbi, tokenDecimals };
        } else if (file.includes('project.csv')) {
            const contractAddress = result[filterCol4];
            const contractAbi = result[filterCol5];
            const website = result[filterCol3];
            // console.log(`contractAddr: ${contractAddress}\nwebsite:  ${website}\ncontractAbi: ${contractAbi}`);  
            return { contractAddress, contractAbi, website };
        }
        
    } catch (err) {  
        console.error(err);  
        return null;
    }  
};

// const tokenInfo = async (coin, chain, file = './data/token.csv', sep = '|') => {  
// 	coin = coin.toUpperCase();  
// 	chain = chain.toLowerCase();

// 	if (!fs.existsSync(file)) {  
// 		console.log(`${file} 文件不存在，请先创建`);  
// 		return null;  
// 	}

// 	const tokens = [];

// 	try {  
// 		await new Promise((resolve, reject) => {  
// 		fs.createReadStream(file)  
// 			.pipe(parse({  
// 				delimiter: sep, // 分隔符为sep，默认逗号
// 				columns: true, // 第一行为列名
// 				escape: false, // 用于转义的单个字符。它仅适用于与 匹配的字符
// 				quote: false, // 用于包围字段的字符，该字段周围是否存在引号是可选的，并且会自动检测。false禁用引号检测（abi很多引号，不需要检测）
// 				skip_empty_lines: true, // 跳过空行
// 			}))  
// 			.on('data', (row) => {  
// 			if (row['token'] === coin && row['chain'].includes(chain)) {  
// 				tokens.push(row);  
// 			}  
// 			})  
// 			.on('end', () => {  
// 			resolve();  
// 			})  
// 			.on('error', (err) => {  
// 			reject(err);  
// 			});  
// 		});

// 		if (tokens.length === 0) {  
// 			console.log(`文件 ${file} 中没有 ${coin} 代币信息，请先添加`);  
// 			return null;  
// 		} else if (tokens.length > 1) {  
// 			console.log(`文件 ${file} 中有重复的 ${coin} 代币信息，请先确认`);  
// 			return null;  
// 		}

//         const token = tokens[0];

//         if (!token.tokenAbi) {  
//             console.log(`代币 ${coin} 未添加 ABI，请先添加。可留空，如'[{}]'`);  
//             return null;  
//         }

//         const tokenAddress = token.tokenAddress;
//         const tokenAbi = token.tokenAbi;
//         const tokenDecimals = token.tokenDecimals;
//         // console.log(`tokenAddr: ${tokenAddress}\ntokenDecimals: ${tokenDecimals}\ntokenAbi: ${tokenAbi}`);  
//         return { tokenAddress, tokenAbi, tokenDecimals };  
//     } catch (err) {  
//             console.error(err);  
//             return null;
//     }  
// };  


/**
 * 用于没有abi，通过abi编码器和函数参数的类型和值生成智能合约调用的交易数据。
 * 
 * @param {string} functionPrototype 函数原型，包括函数名和参数类型
 * @param {Array<value>} [paramValues] 参数值数组（可选）
 * @returns {string} 交易数据 
 */
function generateTransactionData(functionPrototype, paramValues = []) {
    // 1.生成函数签名
    // 计算函数原型的 Keccak-256 哈希
    const functionKeccak256Hash = ethers.keccak256(ethers.toUtf8Bytes(functionPrototype));
    // 取哈希的前4个字节作为函数签名(包含0x)
    const functionSignature = functionKeccak256Hash.slice(0, 10); //0x + 8个字符 = 10个字符

    // 如果没有参数的话,函数签名即为交易数据
    let transactionData = functionSignature;
    // console.log(transactionData);

    // 获取函数的类型数组
    const startIndex = functionPrototype.indexOf('(') + 1;
    const endIndex = functionPrototype.lastIndexOf(')');
    // let paramTypes = functionPrototype.slice(startIndex, endIndex).split(','); // 这个没考虑复杂情况。比如参数里还有括号

    const params = functionPrototype.slice(startIndex, endIndex).trim();

    const paramTypes = [];

    let i = 0;
    let j = 0;
    let nested = 0;

    while (j <= params.length) {
        const ch = params[j];
        if (ch === ',' && nested === 0) {
            const param = params.slice(i, j).trim();
            paramTypes.push(param);
            i = j + 1;
        } else if (ch === '(') {
            nested++;
        } else if (ch === ')') {
            nested--;
        }
        j++;
    }
    if (i < j) {
        const param = params.slice(i, j).trim();
        paramTypes.push(param);
    }

    if (startIndex === endIndex) paramTypes = []; // 当空括号时，得到的结果是[''],将它修改为空数组
    // console.log(paramTypes)
    // console.log(paramValues) 
    // console.log(paramTypes.length)
    // console.log(paramValues.length)

    if (paramTypes.length !== paramValues.length) {
        console.log('函数类型与值不匹配,请修改')
        return null
    }

    // 2.生成参数十六进制abi编码
    // AbiCoder是一个低级类，用于进行 ABI 编码和解码，encode将 JavaScript 值编码为符合abi编码规范的二进制数据，decode将二进制数据解码为 JavaScript 值。
    const abiCoder = new ethers.AbiCoder();
    // 遵循以太坊的 ABI 编码规范对参数进行编码，生成一个符合abi编码规范的十六进制字符串
    // 每个参数占用32字节，不够的在左边填充0
    // 结果是带0x的16进制数据。我们要跟函数签名拼接，不需要0x，用slice(2)去掉
    let encodedParams;
    if (paramValues.length > 0) {
        encodedParams = abiCoder.encode(paramTypes, paramValues);
        // 将函数签名和编码后的参数拼接，生成交易数据
        transactionData = `${functionSignature}${encodedParams.slice(2)}`;
    }
    // console.log(encodedParams);
    // console.log(transactionData);
    return {functionSignature, encodedParams, transactionData};
    
    /*
    // 知道合约abi的情况获取交易数据。实际不用，因为多此一举。写在这学习一下
    const contract  = new ethers.Contract(tokenAddress,tokenAbi,wallet)
    // 获取 safeMint 函数
    const safeMintFunction = contract.interface.getFunction('safeMint').format();
    // 计算函数签名的Keccak-256哈希值
    const functionKeccak256Hash = ethers.keccak256(ethers.toUtf8Bytes(safeMintFunction));
    // 获取哈希值的前4个字节（8个十六进制字符）
    const functionSignature = functionKeccak256Hash.slice(0, 10);
    // console.log('Function selector:', functionSignature);
    // 使用 safeMint 函数签名和参数，编码数据
    const transactionData = contract.interface.encodeFunctionData(functionSignature, [wallet.address, 1]);
    console.log(transactionData)
    */
};

function parseTransactionData(params, TransactionData) {
    const abiCoder = new ethers.AbiCoder();
    TransactionData = '0x' + TransactionData.slice(10)
    // console.log(TransactionData)
    const decodeTransactionData = abiCoder.decode(params, TransactionData)
    console.log(decodeTransactionData)
    console.log(decodeTransactionData[0][0][0])
    return decodeTransactionData
}

/** 循环执行直到任务成功 */
function loop(task) {
    return new Promise(async (resolve) => {
        while (true) {
            try {
                await task();
                resolve(true)
                break;
            } catch (error) {
                console.log(`[loop] ${error?.reason || error?.message}`)
            }
        }
    })
}

function sleep(seconds) {
    return new Promise(resolve => setTimeout(resolve, seconds * 1000));
}

function randomWait(maxSeconds=10) {
    const randomSeconds = Math.random() * maxSeconds;
    console.log(`等待${randomSeconds}秒`)
    return new Promise(resolve => {
        setTimeout(() => {
            resolve();  
        }, randomSeconds * 1000);
    })
}

function generateRandomString(length) {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
  }

// generateTransactionData("claim(address,uint256,uint256,address,uint256,(bytes32[],uint256,uint256,address),bytes)", ["0x558eD78A8Ca9b69d59f0b6193C1f78fB4A8f7b88", 0, 1, '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee', 0, [["0x0000000000000000000000000000000000000000000000000000000000000000"], 1, 0, "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee"], '0x']);
// generateTransactionData("safeMint(address,uint256)", ["0x85Df5B43Ad158B1860834C0ffcb59bf70e191347",1]);
// parseTransactionData(['((address,bytes,address,bytes)[],address,uint256)[]', 'uint256', 'uint256'],'0x2cc4081e0000000000000000000000000000000000000000000000000000000000000060000000000000000000000000000000000000000000000000000000000010fbbd0000000000000000000000000000000000000000000000000000000064abb09f0000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000221b262dd80000000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000002000000000000000000000000080115c708e12edd42e504c1cd52aea96c547c05c00000000000000000000000000000000000000000000000000000000000000800000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000000600000000000000000000000005aea5775959fbc2557cc8789bc1bf90a239d9a91000000000000000000000000c5aba5066dad7108c08646733235a498794a714000000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000000')
// parseTransactionData(['address', 'address', 'uint256'],'0x2cc4081e0000000000000000000000005aea5775959fbc2557cc8789bc1bf90a239d9a9100000000000000000000000086330a40e3a92591e502fc57c9821566c97a04c80000000000000000000000000000000000000000000000000000000000000002')
// generateTransactionData("swap(address,address,uint256)", ["0x5AEa5775959fBC2557Cc8789bC1bf90A239D9a91","0xd4a658A9ce170C0D713Bc513fe579a11D464A3A1",2]);
// 多重加密解密
// generateTransactionData("swap(((address,bytes,address,bytes)[],address,uint256)[],uint256,uint256)", [[[[[
//     '0x80115c708E12eDd42E504c1cD52Aea96C547c05c',
//     '0x0000000000000000000000005aea5775959fbc2557cc8789bc1bf90a239d9a91000000000000000000000000d4a658a9ce170c0d713bc513fe579a11d464a3a10000000000000000000000000000000000000000000000000000000000000002',
//     '0x0000000000000000000000000000000000000000',
//     '0x'
//   ]], '0x0000000000000000000000000000000000000000', 100000000000000]], 185189, 1688850482]);

// swap(((address,bytes,address,bytes)[],address,uint256)[],uint256,uint256)	

// await tokenInfo('people', 'eth')
// await getInfo('people', 'eth')
// await getInfo('syncswap-swap', 'zksync', paths.projectFile)
export { sleep, randomWait, getInfo, getRandomObject, generateTransactionData, parseTransactionData, loop, generateRandomString };
