import { ethers } from 'ethers';
import * as zksync from "zksync-ethers";
import { SocksProxyAgent } from 'socks-proxy-agent';
import { decryptText } from '../crypt_module/crypt_text.js';
import { myFormatData } from '../formatdata.js'
import { alchemyEthMainnetApi, infuraEthMainnetApi, quicknodeEthMainnetApi, ankrEthMainnetApi, ankrZksyncApi } from '../config.js'

async function getBearerToken(address, wallet, userAgent, agent){

    const timestamp = Date.now().toString(); //number类型
    // // 定义要签名的消息
    address = address.toLowerCase() // 地址字符串是小写的，这个问题卡了两天。。。
    const message = address + timestamp;
    // console.log(message)
    
    // 对消息签名
    const signature = await wallet.signMessage(message);

    console.log('Signature:', signature);

    const response = await fetch(`https://api.theanimalage.com/api/login?address=${address}&signature=${signature}&timestamp=${timestamp}`, {
        "headers": {
          "accept": "application/json, text/plain, */*",
          "accept-language": "zh-CN,zh;q=0.9",
          "user-agent": userAgent,
          "Referer": "https://game.theanimalage.com/",
          "Referrer-Policy": "strict-origin-when-cross-origin"
        },
        "body": null,
        "method": "GET",
        "agent": agent
    });

    const responseData = await response.json();
    // console.log(responseData)
    if (responseData['code'] == 1) {
        return responseData['data']['token']
    }else{
        throw new TypeError('获取bearerToken失败,请重试')
    }
}

async function CheckIn(address, bearerToken, userAgent, agent){
    const response = await fetch("https://api.theanimalage.com/api/do_sign", {
        "headers": {
          "accept": "application/json, text/plain, */*",
          "accept-language": "zh-CN,zh;q=0.9",
          "authorization": `Bearer ${bearerToken}`,
          "content-type": "application/json",
          "user-agent": userAgent,
          "Referer": "https://game.theanimalage.com/",
          "Referrer-Policy": "strict-origin-when-cross-origin"
        },
        "body": `{"address": "${address}"}`,
        "method": "POST",
        "agent": agent
    });
    const responseData = await response.json();
    const code = responseData['code'].toString()
    const msg = responseData['msg']
    // console.log(responseData)
    if (code === '0' && msg.includes("You have signed")) {
        console.log('今日已签到');
    } else if (code.includes(0) || code.includes(1)) {
        console.log('签到成功');
    } else {
        console.log('签到失败');
    }
}

async function getTokenIds(address, bearerToken, userAgent, agent){
    const response = await fetch("https://api.theanimalage.com/api/task/1", {
        "headers": {
          "accept": "application/json, text/plain, */*",
          "accept-language": "zh-CN,zh;q=0.9",
          "authorization": `Bearer ${bearerToken}`,
          "content-type": "application/json",
          "user-agent": userAgent,
          "Referer": "https://game.theanimalage.com/",
          "Referrer-Policy": "strict-origin-when-cross-origin"
        },
        "body": `{"address": "${address}"}`,
        "method": "POST",
        "agent": agent
    });
    const responseData = await response.json();
    // console.log(responseData)
    const taskAward = responseData['data']['task_award']
    // console.log(taskAward)
    const tokenIds = [];
    taskAward.forEach((item) => {
        const tokenid = item.tokenid;
        tokenIds.push(tokenid);
    });
    console.log(tokenIds)
    return tokenIds
}

async function getTokenSignature(address, tokenId, bearerToken, userAgent, agent){
    try{
        const response = await fetch("https://api.theanimalage.com/api/claim_sign_award", {
            "headers": {
            "accept": "application/json, text/plain, */*",
            "accept-language": "zh-CN,zh;q=0.9",
            "authorization": `Bearer ${bearerToken}`,
            "content-type": "application/json",
            "user-agent": userAgent,
            "Referer": "https://game.theanimalage.com/",
            "Referrer-Policy": "strict-origin-when-cross-origin"
            },
            "body": `{"address": "${address}", "token_id":${tokenId}}`,
            "method": "POST",
            "agent": agent
        });

        const responseData = await response.json();
        // console.log(responseData)
        const tokenSignature = responseData['data']['signature']
        console.log('tokenSignature:', tokenSignature);
        return tokenSignature
    }catch(error){
        console.log(`获取tokenSignature失败: error`)
    }
}

async function mint(contract, tokenId, signature){
    try{
        const receipt = await contract.mint(tokenId, 1, signature)
        await receipt.wait();
        console.log('mint nft成功')
    }catch(error){
        console.log(`mint nft失败:${error['shortMessage']}`)
    }
}

const main = (async(startNum, endNum=null)=>{
    const data = await myFormatData(startNum, endNum)
    // console.log(data)
    for (const d of data) {
        const agent = new SocksProxyAgent(d['proxy']);
        // console.log('使用的代理:', agent.proxy);
        const ethFetchReq = new ethers.FetchRequest(ankrZksyncApi);
      
        // 1、使用 FetchRequest.registerGetUrl 注册一个全局的 getUrl 函数，所有的 FetchRequest 实例都会使用这个函数来处理 URL 获取
        ethers.FetchRequest.registerGetUrl(ethers.FetchRequest.createGetUrlFunc({ agent }))
        // 2、适用于特定实例
        // ethFetchReq.getUrlFunc = ethers.FetchRequest.createGetUrlFunc({ agent });
      
        const provider = new zksync.Provider(ethFetchReq);
        const privateKey = await decryptText(d['enPrivateKey']);
        const wallet = new zksync.Wallet(privateKey, provider);
        const contractAddress = '0xE0E9e2f208EB5c953345526BCB515120128298CF'
        // const contractAbi = 'function mint(uint256 _tokenId, uint256 amount, bytes memory _signature) external whenNotPaused'
        const contractAbi = [
            {
              "name": "mint",
              "inputs": [
                {
                  "name": "_tokenId",
                  "type": "uint256"
                },
                {
                  "name": "amount",
                  "type": "uint256"
                },
                {
                  "name": "_signature",
                  "type": "bytes"
                }
              ],
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function"
            }
          ]
        const contract = new zksync.Contract(contractAddress, contractAbi, wallet);
        
        // 通过私钥签名向服务器发送请求，获取bearerToken
        const bearerToken = await getBearerToken(d['address'], wallet, d['user_agent'], agent);
        // 签到
        await CheckIn(d['address'], bearerToken, d['user_agent'], agent)
        // 通过bearerToken和地址向服务器发送请求，获取tokenId列表
        const tokenIds = await getTokenIds(d['address'], bearerToken, d['user_agent'], agent)

        // // 并行处理每个 tokenId 的签名和 mint 操作
        // await Promise.all(tokenIds.map(async (tokenId) => {
        //     // 通过bearerToken，tokenId和地址向服务器发送请求，获取最终的token签名
        //     const tokenSignature = await getTokenSignature(d['address'], tokenId, bearerToken, d['user_agent']);
        //     // 发送web3请求，mint nft
        //     await mint(contract, tokenId, tokenSignature);
        // }));

        for (const tokenId of tokenIds) {
            const tokenSignature = await getTokenSignature(d['address'], tokenId, bearerToken, d['user_agent'], agent);
            await mint(contract, tokenId, tokenSignature);
        }
    }
});

// await main(11)