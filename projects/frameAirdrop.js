import * as zksync from "zksync-ethers";
import { SocksProxyAgent } from 'socks-proxy-agent';
import { decryptText } from '../crypt_module/crypt_text.js';
import { myFormatData } from '../formatdata.js'

async function getSignature(address, enPrivateKey) {
    // 定义要签名的消息
    address = address.toLowerCase() // 地址字符串是小写的，这个问题卡了两天。。。
    const message = `You are claiming the Frame Chapter One Airdrop with the following address: ${address}`;
    const privateKey = await decryptText(enPrivateKey);
    // 创建一个签名者（Signer）对象
    const signer = new zksync.Wallet(privateKey);
    // 对消息签名
    const signature = await signer.signMessage(message);

    // console.log('Signature:', signature);
    return signature;
  }

async function getAirdrop(address, enPrivateKey, userAgent, agent, index_id){
    const signature = await getSignature(address, enPrivateKey);

    const response = await fetch("https://claim.frame-api.xyz/authenticate", {
        headers: {
            "accept": "*/*",
            "accept-language": "zh-CN,zh;q=0.9",
            "content-type": "application/json",
            "user-agent": userAgent,
            "Referrer-Policy": "strict-origin-when-cross-origin",
            "agent": agent
        },
        // body: `{"address": "${address}", "signature": "0xbbdcf7a4c1f55e640c458b7e0ad24b33a213ceae83c3477c751b503e6b9a45c7725778fe4745f3ef6f1324c08bcc84781925038d4e1dc8d582b934bda971efd41c"}`,
        body: `{"address": "${address}", "signature": "${signature}"}`,
        method: "POST",
    });

    const responseData = await response.json();
    // console.log(responseData)
    console.log(`第${index_id}个账号空投数量为: ${responseData['userInfo']['totalAllocation']}`)
}

async function verifySignature(signerAddress) {
    signerAddress = signerAddress.toLowerCase()
    const message = `You are claiming the Frame Chapter One Airdrop with the following address: ${signerAddress}`;
    const signature = '0xbbdcf7a4c1f55e640c458b7e0ad24b33a213ceae83c3477c751b503e6b9a45c7725778fe4745f3ef6f1324c08bcc84781925038d4e1dc8d582b934bda971efd41c'
    const signer = ethers.verifyMessage(message, signature);
    let address = ethers.getAddress(signer);
    address = address.toLowerCase()
    console.log(address === signerAddress);
    return address === signerAddress;
  }

const main = (async(startNum, endNum=null)=>{
    const data = await myFormatData(startNum, endNum)
    // console.log(data)
    for (const d of data) {
        const agent = new SocksProxyAgent(d['proxy']);
        // console.log('使用的代理:', agent.proxy);
        // await verifySignature(d['address']);
        await getAirdrop(d['address'], d['enPrivateKey'], d['user_agent'], agent, d['index_id']);
    }
});

await main(1,30)