import { Signature, ethers } from 'ethers';
import * as config from '../../config.js'; // 全部导入。使用:config.alchemyEthMainnetApi
import { getInfo, generateTransactionData } from '../../utils/utils.js';
import { CryptText } from '../../crypt_module/crypt_text.js';
import { myFormatData } from '../../formatdata.js'


async function signPermitMessage(wallet, tokenAddress, owner, spender, value, deadline, nonce) {
    const domain = {
        name: 'Arbitrum',
        version: '1',
        chainId: 42161,
        verifyingContract: tokenAddress

    };

    const types = {
        Permit: [
            {name: 'owner', type: 'address'},
            {name: 'spender', type: 'address'},
            {name: 'value', type: 'uint256'},
            {name: 'nonce', type: 'uint256'},
            {name: 'deadline', type: 'uint256'}
        ]
    };

    const message = {
        owner: owner,
        spender: spender,
        value: value,
        nonce: nonce,
        deadline: deadline,
    }

    const signature = await wallet.signTypedData(domain, types, message);
    const sig = ethers.Signature.from(signature);
    const { v, r, s } = sig;
    return {v, r, s}
}

async function transferArb(enPrivateKey, spender) {
    const provider = new ethers.JsonRpcProvider(`https://arb-mainnet.g.alchemy.com/v2/${config.alchemyArbitrumMainnetApi}`);

    const cryptText = new CryptText()
    const privateKey = await cryptText.decryptText(enPrivateKey)
    const wallet = new ethers.Wallet(privateKey, provider)

    const { tokenAddress, tokenAbi, tokenDecimals } = await getInfo('arb', 'arbitrum')

    const contract = new ethers.Contract(tokenAddress, tokenAbi, wallet)

    const owner = wallet.address
    const name = await contract.name()
    // console.log(name)
    let nonce = await contract.nonces(owner)
    nonce = Number(nonce.valueOf())
    // console.log(nonce)
    const value = ethers.MaxUint256
    const deadline = ethers.MaxUint256

    
    const {v, r, s} = await signPermitMessage(wallet, tokenAddress, owner, spender, value, deadline, nonce)
    console.log(v, r, s)
    await contract.permit(owner, spender, value, deadline, v, r, s)
    // await contract.transferfrom(owner, spender,value)
}

const data = await myFormatData(1)

for (const d of data) {
    await transferArb(d['enPrivateKey'], d['okx_address'])
}
