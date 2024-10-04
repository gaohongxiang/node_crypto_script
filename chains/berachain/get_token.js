import { SocksProxyAgent } from "socks-proxy-agent";
import { myFormatData } from "../../formatdata.js";
import { verifyWebsite } from "../../utils/captcha.js";
import { sleep } from "../../utils/utils.js";

async function getTestToken(address, userAgent, agent){
    try{
        let retryCount = 1;
        while (retryCount <= 5) {
            const websiteUrl = 'https://artio.faucet.berachain.com';
            const websiteKey = '6LfOA04pAAAAAL9ttkwIz40hC63_7IsaU2MgcwVH';
            const recaptchaToken = await verifyWebsite(websiteUrl, websiteKey, "recaptchaV3");

            const response = await fetch(`https://artio-80085-ts-faucet-api-2.berachain.com/api/claim?address=${address}`, {
                "headers": {
                    "accept": "*/*",
                    "accept-language": "zh-CN,zh;q=0.9",
                    "authorization": `Bearer ${recaptchaToken}`,
                    "content-type": "text/plain;charset=UTF-8",
                    "sec-ch-ua": "\"Not_A Brand\";v=\"8\", \"Chromium\";v=\"120\", \"Google Chrome\";v=\"120\"",
                    "sec-ch-ua-mobile": "?0",
                    "sec-ch-ua-platform": "\"macOS\"",
                    "sec-fetch-dest": "empty",
                    "sec-fetch-mode": "cors",
                    "sec-fetch-site": "same-site",
                    "Referer": "https://artio.faucet.berachain.com/",
                    "Referrer-Policy": "strict-origin-when-cross-origin",
                    "user-agent": userAgent
                },
                "body": `{"address": "${address}"}`,
                "method": "POST",
                "agent": agent
            });

            const responseData = await response.json();
            console.log(responseData)
            const regex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
            if (regex.test(responseData.message)) {
                break
            } else {
                
                console.log(`休息中...`);
                await sleep(20);
                console.log(`第 ${retryCount} 次重试...`);
                retryCount++;
                
            }
        }
    }catch(error){
        console.error(`领取失败❌，地址：${address}:`, error);
    }
}

const main = (async(startNum, endNum=null)=>{
    const data = await myFormatData(startNum, endNum)
    // console.log(data)
    for (const d of data) {
        const agent = new SocksProxyAgent(d['proxy']);
        // console.log('使用的代理:', agent.proxy);
        console.log(`第 ${d['index_id']} 个账号 ${d['address']} 开始领取测试币`)
        await getTestToken(d['address'], d['user_agent'], agent);
    }
});

await main(1,30)