import * as bitcoin from 'bitcoinjs-lib';

const generateBitcoinAddress = () => {
    const network = bitcoin.networks.bitcoin; // 指定比特币网络
    const keyPair = bitcoin.ECPair.makeRandom({ network }); // 生成密钥对
    const { publicKey } = keyPair; // 提取公钥
    const address = bitcoin.payments.p2pkh({ pubkey: publicKey, network }).address; // 生成地址

    return address;
};

const address = generateBitcoinAddress();
console.log("Generated Bitcoin address:", address);



