import axios from "axios";
import { SocksProxyAgent } from 'socks-proxy-agent';
import { myFormatData } from "./formatdata.js";

async function check(startNum, endNum=null) {
    const data = await myFormatData(startNum, endNum)
    for(const d of data) {
        const address = d['address'].toLowerCase()
        // console.log(address)
        try{
            const response = await axios({
                method: 'GET',
                url: `https://pacific-1.albatross.sei-internal.com/eligibility?originAddress=${address}`,
                headers: { accept: 'application/json', 'content-type': 'application/json' },
                // data: {
                //     id: 1,
                //     jsonrpc: '2.0',
                //     method: 'starknet_getClassAt',
                //     params: ['latest', contractAddress],
                // },
                // `httpAgent` 和 `httpsAgent` 分别在 node.js 中用于定义在执行 http 和 https 时使用的自定义代理
                httpsAgent: new SocksProxyAgent(d['proxy'])
            })
            const airdrop = response.data

            console.log(`第 ${d['index_id']} 个账户 ${d['address']} 查询结果`);
            console.log(airdrop)
            
            // return airdrop;
        }catch(error) {console.log(error)}
    }
}

// await check(1,20)
