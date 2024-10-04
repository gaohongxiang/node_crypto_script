import { withdraw as okxWithdraw } from "./okx.js";
import { withdraw as binanceWithdraw } from "./binance.js";
import { myFormatData } from '../formatdata.js';
import { randomWait } from "../utils/utils.js";

const okxMain = (async(startNum, endNum=null)=>{
    const data = await myFormatData(startNum, endNum)
    // console.log(data)
    for (const d of data) {
        try{
            console.log(`第${d['index_id']}个账号`)
            //生成一个0.035-0.045之间的的数字，小数点5位
            // const value = (Math.random() * (0.05 - 0.04) + 0.04).toFixed(5);
            // console.log(value);

            // const value = 0.1 + (Math.floor(Math.random() * 900) + 100) / 10000; // 生成0.1000-0.1999之间的随机数
            // console.log(value);

            // 生成0.1xxx之间的随机数，第一个x不大于3
            const randomDigit = Math.floor(Math.random() * 4); // 生成0-4之间的随机数
            const randomDigits = Math.floor(Math.random() * 1000);
            const formattedRandomDigits = String(randomDigits).padStart(3, '0');
            const value = parseFloat(`0.1${randomDigit}${formattedRandomDigits}`);
            
            console.log(value);

            //account, chain, address, coin, amount
            await okxWithdraw('', 'sol', d['sol_wallet'], 'sol', value)

            //等待60-180秒之间的随机时间
            await randomWait(60, 180)
        }catch(error){console.log(error)}
    }
});


const binanceMain = (async(startNum, endNum=null)=>{
    const data = await myFormatData(startNum, endNum)
    // console.log(data)
    for (const d of data) {
        try{
            console.log(`第${d['index_id']}个账号`)
            // //生成一个0.01xxx1的数字(其中第一个x为0-5之间)
            // const randomDigit = Math.floor(Math.random() * 6) + 1; // 生成1-5之间的随机数
            // const randomDigits = Math.floor(Math.random() * 100);
            // const formattedRandomDigits = String(randomDigits).padStart(2, '0');
            // const value = `0.01${randomDigit}${formattedRandomDigits}1`;
            // // console.log(value);
            const randomDigits = Math.floor(Math.random() * 1000) + 1; // 生成1-1000之间的随机数
            const formattedRandomDigits = String(randomDigits).padStart(3, '0');
            const value = `5.${formattedRandomDigits}`;
            console.log(value);
            //account, chain, address, coin, amount
            await binanceWithdraw('', 'optimism', '', 'usdt', 5)

            //等待60-180秒之间的随机时间
            await randomWait(60, 180)
        }catch(error){console.log(error)}
    }
});

// okxMain(3)

// binanceMain(1)