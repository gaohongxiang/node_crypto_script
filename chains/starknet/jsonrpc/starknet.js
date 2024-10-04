import axios from 'axios'
import { SocksProxyAgent } from 'socks-proxy-agent';

const alchemyStarknetMainnetApi = "sQ8jyFhX5DLE9wmIYMLSpilLvnEFeqzx"

class starknetUtil {

    constructor(proxy) {
        this.proxy = new SocksProxyAgent(proxy)
    }

    async getAbi(contractAddress) {
        try{
            const response = await axios({
                method: 'POST',
                url: `https://starknet-mainnet.g.alchemy.com/v2/${alchemyStarknetMainnetApi}`,
                headers: { accept: 'application/json', 'content-type': 'application/json' },
                data: {
                    id: 1,
                    jsonrpc: '2.0',
                    method: 'starknet_getClassAt',
                    params: ['latest', contractAddress],
                },
                // `httpAgent` 和 `httpsAgent` 分别在 node.js 中用于定义在执行 http 和 https 时使用的自定义代理
                httpsAgent: this.proxy
            })
            const abi = response.data.result.abi
            console.log(abi)
            return abi;
        }catch(error) {console.log(error)}
    }

    async getBlockHashAndNumber() {
        try{
            const response = await axios({
                method: 'POST',
                url: `https://starknet-mainnet.g.alchemy.com/v2/${alchemyStarknetMainnetApi}`,
                headers: { accept: 'application/json', 'content-type': 'application/json' },
                data: {
                    id: 1,
                    jsonrpc: '2.0',
                    method: 'starknet_blockHashAndNumber',
                },
                // `httpAgent` 和 `httpsAgent` 分别在 node.js 中用于定义在执行 http 和 https 时使用的自定义代理
                httpsAgent: this.proxy
            })
            const blockHash = response.data.result.block_hash
            const blockNumber = response.data.result.block_number
            // console.log(blockHash)
            // console.log(blockNumber)
            return { blockHash, blockNumber };
        }catch(error) {console.log(error)}
    }

    async getNonce(address) { 
        try{
            const response = await axios({
                method: 'POST',
                url: `https://starknet-mainnet.g.alchemy.com/v2/${alchemyStarknetMainnetApi}`,
                headers: { accept: 'application/json', 'content-type': 'application/json' },
                data: {
                    id: 1,
                    jsonrpc: '2.0',
                    method: 'starknet_getNonce',
                    params: ['latest', address],
                },
                // `httpAgent` 和 `httpsAgent` 分别在 node.js 中用于定义在执行 http 和 https 时使用的自定义代理
                httpsAgent: this.proxy
            })
            const nonce = parseInt(response.data.result, 16); // 16进制转10进制
            console.log(`地址 ${address} 当前nonce: ${nonce}`);
            return nonce;
        }catch(error) {console.log(error)}
    }

    async approve() { 
        try{
            const response = await axios({
                method: 'POST',
                url: `https://starknet-mainnet.g.alchemy.com/v2/${alchemyStarknetMainnetApi}`,
                headers: { accept: 'application/json', 'content-type': 'application/json' },
                data: {
                    id: 1,
                    jsonrpc: '2.0',
                    method: 'starknet_addInvokeTransaction',
                    params: [{
                        contract_address: '0x7a6f98c03379b9513ca84cca1373ff452a7462a3b61598f0af5bb27ad7f76d1', // 10kswap
                        entry_point_selector: '',
                        calldata: ['']
                    }],
                },
                // `httpAgent` 和 `httpsAgent` 分别在 node.js 中用于定义在执行 http 和 https 时使用的自定义代理
                httpsAgent: this.proxy
            })

        }catch(error) {console.log(error)}
    }
}

const starknet = new starknetUtil('')
// await starknet.getAbi('0x053c91253bc9682c04929ca02ed00b3e423f6710d2ee7e0d5ebb06f3ecf368a8')
// starknet.getNonce('')
starknet.getBlockHashAndNumber()