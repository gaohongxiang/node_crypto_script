import fs from 'fs';
import XLSX from 'xlsx';
import { parse } from 'csv-parse';

// 读取Excel文件并返回Promise解析为数组
async function readExcelFileAsArray(filePath) {
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const sheetData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
    const filteredData = sheetData.map((row) => {
        return {
        index_id: row['序号'],
        browser_id: row['ID'],
        user_agent: row['User Agent'],
        };
    });

    const sortedData = filteredData.sort((a, b) => a.index_id - b.index_id);
    return sortedData;
}

// 读取CSV文件并返回Promise解析为数组
async function readCsvFileAsArray(filePath, sep=',') {
    return new Promise((resolve, reject) => {
      const results = [];
      fs.createReadStream(filePath)
      .pipe(parse({  
        delimiter: sep, // 分隔符为sep，默认逗号
        columns: true, // 第一行为列名
        escape: false, // 用于转义的单个字符。它仅适用于与 匹配的字符
        quote: false, // 用于包围字段的字符，该字段周围是否存在引号是可选的，并且会自动检测。false禁用引号检测（abi很多引号，不需要检测）
        skip_empty_lines: true, // 跳过空行
    }))  
        .on('data', (data) => results.push(data))
        .on('end', () => {
          resolve(results);
        })
        .on('error', (error) => {
          reject(error);
        });
    });
}

  const bitbrowserFile = './data/bitbrowser.xlsx'
  const adspowerFile = './data/adspower.xlsx'
  const ipFile = './data/ip.csv'
  const ethWalletFile = './data/wallet_eth.csv'
  const walletPasswordFile = './data/wallet_password.csv'
  const ethWalletTugouFile = './data/wallet_eth_tugou.csv'
  const ethWalletFuzhuFile = './data/wallet_eth_fuzhu.csv'
  const okxAddressFile = './data/okx_address.csv'
  const argentWalletFile = './data/wallet_argent.csv'
  const braavosWalletFile = './data/wallet_braavos.csv'
  const emailFile = './data/gmail.csv'

// 处理数据
async function myFormatData(startNum, endNum=null, isBitbrowser=true) {
    // 不传endNum即表示查询一个账户
    if (endNum === null) {
        endNum = startNum;
    }
    if (parseInt(startNum) <= 0 || parseInt(endNum) <= 0) {
        console.log('账号必须大于0');
        return;
    }
    if (parseInt(startNum) > parseInt(endNum)) {
        console.log('开始账号必须小于或等于结束账号');
        return;
    }
    // 读取Excel文件
    const allBrowser = await readExcelFileAsArray(isBitbrowser ? bitbrowserFile : adspowerFile);
    // 读取CSV文件
    const allIp = await readCsvFileAsArray(ipFile, ':'); //分割符是冒号
    const allWallet = await readCsvFileAsArray(ethWalletFile);
    const allPassword = await readCsvFileAsArray(walletPasswordFile);
    const allWalletTogou = await readCsvFileAsArray(ethWalletTugouFile);
    const allWalletFuzhu = await readCsvFileAsArray(ethWalletFuzhuFile);
    const allWalletArgent = await readCsvFileAsArray(argentWalletFile);
    const allWalletBraavos = await readCsvFileAsArray(braavosWalletFile);
    const okxAddress = await readCsvFileAsArray(okxAddressFile);
    const email = await readCsvFileAsArray(emailFile, '|');
    // 处理数据
    const data = allBrowser.map((browser, index) => {
        const proxy = `socks5://${allIp[index].proxy_username}:${allIp[index].proxy_password}@${allIp[index].proxy_ip}:${allIp[index].proxy_port}`;
        return {
        ...browser,
        ...allIp[index],
        proxy: proxy,
        ...allWallet[index],
        ...allPassword[index],
        ...allWalletTogou[index],
        ...allWalletFuzhu[index],
        ...allWalletArgent[index],
        ...allWalletBraavos[index],
        ...okxAddress[index],
        ...email[index],
        };
    }).slice(startNum - 1, endNum);

    return data;
}


// const data = await myFormatData(1);
// console.log(data);

export { myFormatData };