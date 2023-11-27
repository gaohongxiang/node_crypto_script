import { ethers } from 'ethers';
import * as config from '../config.js'
import { read } from 'xlsx';

// const provider = new ethers.JsonRpcProvider(`https://mainnet.infura.io/v3/0c0de4c240c24b47a3c69184baf8d457`);
const provider = new ethers.JsonRpcProvider(`https://eth-mainnet.g.alchemy.com/v2/${config.alchemyEthMainnetApi}`);
// const provider = new ethers.JsonRpcProvider(`https://arb-mainnet.g.alchemy.com/v2/${config.alchemyArbitrumMainnetApi}`);
// const provider = new ethers.JsonRpcProvider(`https://eth-goerli.g.alchemy.com/v2/${config.alchemyGoerliMainnetApi}`);
const address = '0xC38794b0747D63f9eE8bebFF34cD272E706CD432';
const privateKey = '0x00c1d4b5477fa618e8a479241236629f665c615e2aa34e7165e229a16509ec90';
const toAddress = '0xB03BAad50797793Ce0628e1EC122d88caA97cDB6';
const wallet = new ethers.Wallet(privateKey, provider);
// console.log(wallet.getAddress());

const WETHAddress = '0xb4fbf271143f4fbf7b91a5ded31805e42b2208d6';
const WETHAbi = '[{"constant":true,"inputs":[],"name":"name","outputs":[{"name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"guy","type":"address"},{"name":"wad","type":"uint256"}],"name":"approve","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"totalSupply","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"src","type":"address"},{"name":"dst","type":"address"},{"name":"wad","type":"uint256"}],"name":"transferFrom","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"wad","type":"uint256"}],"name":"withdraw","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"decimals","outputs":[{"name":"","type":"uint8"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"","type":"address"}],"name":"balanceOf","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"symbol","outputs":[{"name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"dst","type":"address"},{"name":"wad","type":"uint256"}],"name":"transfer","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[],"name":"deposit","outputs":[],"payable":true,"stateMutability":"payable","type":"function"},{"constant":true,"inputs":[{"name":"","type":"address"},{"name":"","type":"address"}],"name":"allowance","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"payable":true,"stateMutability":"payable","type":"fallback"},{"anonymous":false,"inputs":[{"indexed":true,"name":"src","type":"address"},{"indexed":true,"name":"guy","type":"address"},{"indexed":false,"name":"wad","type":"uint256"}],"name":"Approval","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"src","type":"address"},{"indexed":true,"name":"dst","type":"address"},{"indexed":false,"name":"wad","type":"uint256"}],"name":"Transfer","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"dst","type":"address"},{"indexed":false,"name":"wad","type":"uint256"}],"name":"Deposit","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"src","type":"address"},{"indexed":false,"name":"wad","type":"uint256"}],"name":"Withdrawal","type":"event"}]';


const base = async() => {
    let balance = await provider.getBalance(address);
    // let balance = await provider.getBalance(`vitalik.eth`);
    console.log(`ETH Balance Of Vitalik: ${ethers.formatEther(balance)}ETH`);
    const network = await provider.getNetwork()
    console.log(network.toJSON())
    const blockNumber = await provider.getBlockNumber();
    console.log(blockNumber)
    const txCount = await provider.getTransactionCount(address);
    console.log(txCount)
    const feeData = await provider.getFeeData();
    console.log(feeData);
    const code = await provider.getCode(WETHAddress);
    console.log(code)
}

const readContract = async() => {
    const contract = new ethers.Contract(WETHAddress, WETHAbi, provider);
    const name = await contract.name();
    const symbol = await contract.symbol();
    const totalSupply = await contract.totalSupply();
    const tokenBalance = await contract.balanceOf(address)
    console.log(name)
    console.log(symbol)
    console.log(totalSupply)
    console.log(totalSupply.toString())
    console.log(ethers.formatEther(tokenBalance))
}

const sendETH = async() => {
    const fromBalance = await provider.getBalance(address);
    console.log(`fromAddress${address}发送前余额：${fromBalance}`);
    const toBalance = await provider.getBalance(toAddress);
    console.log(`toAddress${toAddress}发送前余额：${toBalance}`);

    const tx = {
        to: toAddress,
        value: ethers.parseEther('0.001')
    }
    const receipt = await wallet.sendTransaction(tx);
    await receipt.wait();
    console.log(receipt)

    const fromBalanceAfter = await provider.getBalance(address);
    console.log(`fromAddress${address}发送后余额：${fromBalanceAfter}`);
    const toBalanceAfter = await provider.getBalance(toAddress);
    console.log(`toAddress${address}发送后余额：${toBalanceAfter}`);
}

const writeContract = async() => {
    const contract = new ethers.Contract(WETHAddress, WETHAbi, wallet);
    const balance = await contract.balanceOf(address);
    console.log(`存款前余额：${ethers.formatEther(balance)}`)

    const deposit = await contract.deposit({value: ethers.parseEther('0.002')});
    await deposit.wait();
    console.log(deposit);
    const balanceDeposit = await contract.balanceOf(address);
    console.log(`存款后WETH余额: ${ethers.formatEther(balanceDeposit)}`)

    const transfer = await contract.transfer('vitalik.eth', ethers.parseEther('0.001'));
    await transfer.wait();
    console.log(transfer);
    const balanceTransfer = await contract.balanceOf(address)
    console.log(`转账后WETH持仓: ${ethers.formatEther(balanceTransfer)}`)
}

const event = async() => {
    const contract = new ethers.Contract(WETHAddress, WETHAbi, wallet);
    const block = await provider.getBlockNumber();
    console.log(`当前区块高度: ${block}`);
    console.log(`打印事件详情:`);
    const transferEvents = await contract.queryFilter('Transfer', block-10, block);
    console.log(transferEvents[0])
    // 解析Transfer事件的数据（变量在args中）
    console.log(" 解析事件：")
    const amount = ethers.formatUnits(transferEvents[0].args[2], "ether");
    console.log(`地址 ${transferEvents[0].args[0]} 转账${amount} WETH 到地址 ${transferEvents[0].args[1]}`)
}

const watchEvent = async() => {
    // USDT的合约地址
    const usdtAddress = '0xdac17f958d2ee523a2206206994597c13d831ec7'
    // 构建USDT的Transfer的ABI
    const usdtAbi = [
        "event Transfer(address indexed from, address indexed to, uint value)",
    ];
    console.log("利用contract.on() 持续监听Transfer事件");
    const contract = new ethers.Contract(usdtAddress, usdtAbi, wallet);
    contract.on('Transfer',(from, to, value)=>{
        console.log(`${from} -> ${to} ${ethers.formatUnits(value, 6)}`)
    })
}

const filterEvent = async() => {
    // 交易所地址
    const binanceAddress = '0x28C6c06298d514Db089934071355E5743bf21d60'
    // USDT的合约地址
    const usdtAddress = '0xdac17f958d2ee523a2206206994597c13d831ec7'
    // 构建USDT的Transfer的ABI
    const usdtAbi = [
        "event Transfer(address indexed from, address indexed to, uint value)",
        "function balanceOf(address) public view returns(uint)",
    ];
    const contract = new ethers.Contract(usdtAddress, usdtAbi, wallet);

    const balanceUSDT = await contract.balanceOf(binanceAddress)
    console.log(`USDT余额: ${ethers.formatUnits(balanceUSDT,6)}\n`)

    console.log('---------监听USDT进入交易所--------');
    let filter = contract.filters.Transfer(null,binanceAddress);
    // console.log(filter)
    contract.on(filter,(res)=>{
        console.log(`${res.args[0]} -> ${res.args[1]} ${ethers.formatUnits(res.args[2],6)}`)
    })
}

const staticCall = async() => {
    // DAI的ABI
    const abiDAI = [
        "function balanceOf(address) public view returns(uint)",
        "function transfer(address, uint) public returns (bool)",
    ];
    // DAI合约地址（主网）
    const addressDAI = '0x6B175474E89094C44Da98b954EedeAC495271d0F' // DAI Contract
    // 创建DAI合约实例
    const contractDAI = new ethers.Contract(addressDAI, abiDAI, provider);
    const balanceDAI = await contractDAI.balanceOf(address);
    console.log(`DAI持仓: ${ethers.formatEther(balanceDAI)}\n`)

    console.log("用staticCall尝试调用transfer转账1 DAI，msg.sender为Vitalik地址")
    // 发起交易
    const tx = await contractDAI.transfer.staticCall(address, ethers.parseEther("1"), {from:  await provider.resolveName("vitalik.eth")})
    console.log(`交易会成功吗？：`, tx)

    console.log("用staticCall尝试调用transfer转账1 DAI，msg.sender为测试钱包地址")
    const tx2 = await contractDAI.transfer.staticCall("vitalik.eth", ethers.parseEther("10000"), {from: address})
    console.log(`交易会成功吗？：`, tx2)
}

const isERC721 = async() => {
    // 合约abi
    const abiERC721 = [
        "function name() view returns (string)",
        "function symbol() view returns (string)",
        "function supportsInterface(bytes4) public view returns(bool)",
    ];
    // ERC721的合约地址，这里用的BAYC
    const addressBAYC = "0xbc4ca0eda7647a8ab7c2061c2e118a18a936f13d"
    // 创建ERC721合约实例
    const contractERC721 = new ethers.Contract(addressBAYC, abiERC721, provider)

    // 1. 读取ERC721合约的链上信息
    const nameERC721 = await contractERC721.name()
    const symbolERC721 = await contractERC721.symbol()
    console.log("\n1. 读取ERC721合约信息")
    console.log(`合约地址: ${addressBAYC}`)
    console.log(`名称: ${nameERC721}`)
    console.log(`代号: ${symbolERC721}`)

    // 2. 利用ERC165的supportsInterface，确定合约是否为ERC721标准
    // ERC721接口的ERC165 identifier
    const selectorERC721 = "0x80ac58cd"
    const isERC721 = await contractERC721.supportsInterface(selectorERC721)
    console.log("\n2. 利用ERC165的supportsInterface，确定合约是否为ERC721标准")
    console.log(`合约是否为ERC721标准: ${isERC721}`)
}

const main = async() => {
    // await base();
    // await readContract(); 
    // await  sendETH();
    // await writeContract();
    // await event();
    // await watchEvent();
    // await filterEvent();
    // await staticCall();
    await isERC721();
}

main();