import { ethers } from 'ethers';
import { SocksProxyAgent } from 'socks-proxy-agent';
import { decryptText } from '../crypt_module/crypt_text.js';
import { myFormatData } from '../formatdata.js'

async function getAirdrop(address, userAgent, agent, indexId){
    address = address.toLowerCase()
    // console.log('使用的代理:', agent.proxy);
    const response = await fetch(`https://geteligibleuserrequest-xqbg2swtrq-uc.a.run.app/?address=${address}`, {
        "headers": {
          "accept": "*/*",
          "accept-language": "zh-CN,zh;q=0.9,en;q=0.8,zh-TW;q=0.7",
          "user-agent": userAgent,
          "Referer": "https://genesis.dymension.xyz/",
          "Referrer-Policy": "strict-origin-when-cross-origin"
        },
        "body": null,
        "method": "GET",
        "agent": agent,
    });

    const responseData = await response.json();
    console.log(responseData)
    // console.log(`第${indexId}个账号空投数量为: ${responseData['userInfo']['totalAllocation']}`)
}

const main = (async(startNum, endNum=null)=>{
    const data = await myFormatData(startNum, endNum)
    // console.log(data)
    for (const d of data) {
        const agent = new SocksProxyAgent(d['proxy']);
        // console.log('使用的代理:', agent.proxy);
        // await verifySignature(d['address']);
        await getAirdrop(d['address'], d['user_agent'], agent, d['index_id']);
    }
});

await main(1,30)