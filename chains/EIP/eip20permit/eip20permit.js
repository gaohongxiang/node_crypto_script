import { ethers } from 'ethers';
// import {alchemyEthMainnetApi, alchemyGoerliMainnetApi} from './config.js';
import * as config from '../../config.js'; // 全部导入。使用:config.alchemyEthMainnetApi
import { getInfo, generateTransactionData } from '../../utils/utils.js';
import { CryptText } from '../../crypt_module/crypt_text.js';
import { myFormatData } from '../../formatdata.js'

const eth_rpc = `https://eth-mainnet.g.alchemy.com/v2/${config.alchemyEthMainnetApi}`; // mainnet
const goerli_rpc = `https://eth-goerli.g.alchemy.com/v2/${config.alchemyGoerliMainnetApi}`
const provider = new ethers.JsonRpcProvider(goerli_rpc);

async function getWallet(enPrivateKey) {
    const cryptText = new CryptText()
    const privateKey = await cryptText.decryptText(enPrivateKey);
    const wallet = new ethers.Wallet(privateKey, provider);
    // console.log(wallet)
    return wallet
}

async function Eip20Permit(enPrivateKey, contractName, contractAddress, spender, value) {
    const wallet = await getWallet(enPrivateKey)
    const nonce = await provider.getTransactionCount(contractAddress);
    console.log(nonce)

    const domain = {
        name: contractName,
        version: '1',
        chainId: '5',
        verifyingContract: contractAddress,
    };

    const types = {
        Permit: [
          { name: "owner", type: "address" },
          { name: "spender", type: "address" },
          { name: "value", type: "uint256" },
          { name: "nonce", type: "uint256" },
          { name: "deadline", type: "uint256" },
        ],
    };

    const message = {
        owner: wallet.address,
        spender: spender,
        value: value,
        nonce: '3',
        deadline: '115792089237316195423570985008687907853269984665640564039457584007913129639935',
    };

    try {
        console.log(message)
        const signature = await wallet.signTypedData(domain, types, message);
        const sig = ethers.Signature.from(signature);
        const v = sig.v
        const r = sig.r
        const s = sig.s
        console.log("Signature:", signature);
        console.log("v:", v);
        console.log("r:", r);
        console.log("s:", s);
    } catch (error) {
        console.error("Error signing permit:", error);
    }
}

// function getExpirationTime() {
//     const date = new Date('2030-01-01');
//     const timestamp = date.getTime() / 1000; // 将毫秒数转换为秒数

//     console.log(Math.floor(timestamp)); // 取整
// }
// getExpirationTime()

const data = await myFormatData(1)
for (const d of data) {
    await Eip20Permit(d['fuzhu_enPrivateKey'], 'ghx', '0xbd2925fb22E98068466f0F84cf203fBF5BFfC788', '0x85C2e939D0261d587402E4D29b5e75AF0Afa4E9F', '350' )
}