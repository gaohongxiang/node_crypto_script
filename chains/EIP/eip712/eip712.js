import { ethers } from 'ethers';
// import {alchemyEthMainnetApi, alchemyGoerliMainnetApi} from './config.js';
import * as config from '../../../config.js'; // 全部导入。使用:config.alchemyEthMainnetApi
import { getInfo, generateTransactionData } from '../../../utils/utils.js';
import { CryptText } from '../../../crypt_module/crypt_text.js';
import { myFormatData } from '../../../formatdata.js'

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

async function Eip712(enPrivateKey, contractName, contractAddress, number) {
    const wallet = await getWallet(enPrivateKey)
    // console.log(wallet)

    const EIP712Domain = {
        name: contractName,
        version: '1',
        chainId: '5',
        verifyingContract: contractAddress,
    };

    const types = {
        Storage: [
            { name: "spender", type: "address" },
            { name: "number", type: "uint256" },
        ],
    };

    const message = {
        spender: wallet.address,
        number: number,
    };

    // EIP712 签名
    const signature = await wallet.signTypedData(EIP712Domain, types, message);
    console.log("Signature:", signature);

    // 验证 EIP712 签名，从签名和消息复原出 signer 地址
    let eip712Signer = ethers.verifyTypedData(EIP712Domain, types, message, signature)
    console.log("EIP712 Signer: ", eip712Signer)
    //EIP712 Signer: 0x5B38Da6a701c568545dCfcB03FcB875f56beddC4
}



const data = await myFormatData(1)
for (const d of data) {
    await Eip712(d['fuzhu_enPrivateKey'], 'EIP712Storage', '0xf40E96C914BcE1a2685E5950EEC3FfA38E650cbc', '100' )
}