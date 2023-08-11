# 交易基础知识

“以太坊是一个全局的单体状态机，交易是唯一能让这台状态机向前推进并改变状态的东西。”

“交易是由外部账户发出的经过签名的消息，通过以太坊的网络传播，由矿工记录在区块链上。”

“合约不会自动执行，以太坊也不会在后台运行，所以这一切，都是由交易触发”。

交易的结构

“交易是一串打包在一起的二进制数据”，包括如下内容：

- nonce
- gas price
- gas limit
- recipient
- value （发送给目标地址的以太币的数量）
- data （附加在交易中的可变长度的数据）
- v, r, s

交易的 4 种类型

交易数据包的两大核心字段： value, data，均可单独设定是否赋值

由此可区分 4 中交易类型：

- 有 value 无 data （普通转账）
- 无 value 有 data (合约调用，链上聊天)
- 有 value 有 data （带转账的合约调用，比如付费mint NFT，或转账附带聊天信息）
- 无 value 无 data（取消前一笔交易）


gas设置

gas_limit：

默认的转账操作是固定的 gas limit：21000。但调用智能合约所需的 gas limit 往往高很多。不单独调整的话，会引发 “out of gas”错误，并浪费一笔 gas。具体数值可参考其他同类型已成功的交易

gas_price：

gas 价格可以根据当时的价格来定 ，可以稍微高点。比如乘以1.2，设置为平均价格的1.2倍，可以更快的成交


# 实例化合约并调用合约方法直接发送交易

这种方法中比较简单，开源合约，知道abi、调用函数及参数比较好用

1. 创建一个合约实例，
    - abi可以用JSON对象表示（包括输入参数、函数名称、输出参数、状态可变性和函数类型）也可以写成人类可读形式
2. 使用该实例调用智能合约方法。

abi示例
```
// 人类可读形式
const contractABI = ['function claim() public'];

// json对象形式
const contractABI = [{
	"inputs": [
		{
			"internalType": "address",
			"name": "to",
			"type": "address"
		},
		{
			"internalType": "uint256",
			"name": "tokenId",
			"type": "uint256"
		}
	],
	"name": "safeMint",
	"outputs": [],
	"stateMutability": "nonpayable",
	"type": "function"
}]
```

以safeMint为例：
```
function async mint(enPrivateKey) {
    const provider = new ethers.JsonRpcProvider('https://ethereum-goerli.publicnode.com');
    const wallet = new ethers.Wallet(privateKey, provider);
    const contractAddress = '0xAE4851f02CCe16da076348b93d8bA70bd96108EA' // 部署在goerli的合约地址
    const contractAbi = ['function safeMint(address, uint256)'] // 人类可读abi
    const contract = new ethers.Contract(contractAddress, contractAbi, wallet)
    try {
        // 使用您的钱包连接的提供程序发送交易(自动签署交易？)
        const txResponse = await contract.safeMint(wallet.address, 6);
        console.log('Transaction hash:', txResponse.hash);
        // 等待交易被确认
        const receipt = await txResponse.wait();
        console.log('Transaction has been confirmed in block number', receipt.blockNumber);
    } catch(error) {
        console.error('Error occurred during the mint process:', error);
    }
```

# 组装数据并使用sendTransaction发送交易

这种方式比较灵活，但是相对复杂。当合约未开源，不知道abi，只知道调用的函数及参数时比较好用

1. 手动构造交易对象，包括指定to、value、gasLimit、gasPrice和data等参数。
    - to: 合约地址。向一个智能合约地址传送 data 数据的交易，会被 EVM 解读为针对智能合约的函数调用
    - gasLimit: 交易所需的 gas 量
    - gasPrice: gas单价。根据当前拥堵情况决定
    - value: 根据具体情况而定，需不需要value
    - data: 函数签名以及参数组成的16进制abi数据
    - nonce: 防止交易重放攻击，确保每笔交易只能执行一次。
    - chainId: 链的id
2. 使用wallet.sendTransaction(transaction)将交易发送到以太坊网络


以saftMint为例：
```
function async mint(privateKey) {
    const provider = new ethers.JsonRpcProvider('https://ethereum-goerli.publicnode.com');
    const wallet = new ethers.Wallet(privateKey, provider);
    const contractAddress = '0xAE4851f02CCe16da076348b93d8bA70bd96108EA' // 部署在goerli的合约地址
    // 函数签名以及参数组成的16进制abi数据
    const input_data = generateTransactionData("safeMint(address,uint256)", [wallet.address,4]); // 参数：地址、mint的nft id
    // console.log(input_data)
    
    // 创建交易对象
    const transaction = {
        to: contractAddress,
        data: input_data,
        gasPrice: ethers.parseUnits('30', 'gwei'), //设置 gas 价格，根据当前网络情况调整
        // 下面数据ethers库自动处理，不必手动组装
        //nonce: await provider.getTransactionCount(wallet.address),
        //chainId:5
    };
    
    // 估算交易所需的 gas 量
    const gasLimit = await wallet.estimateGas(transaction);
    transaction.gasLimit = gasLimit;
    
    try {
        // 使用您的钱包连接的提供程序发送交易(自动签署交易？)
        const txResponse = await wallet.sendTransaction(transaction);
        console.log('Transaction hash:', txResponse.hash);
        // 等待交易被确认
        const receipt = await txResponse.wait();
        console.log('Transaction has been confirmed in block number', receipt.blockNumber);
    } catch(error) {
        console.error('Error occurred during the mint process:', error);
    }
}
```

没有abi，通过abi编码器和函数参数的类型和值生成智能合约调用的交易数据。

```
/**
 * 用于没有abi，通过abi编码器和函数参数的类型和值生成智能合约调用的交易数据。
 * 
 * @param {string} functionPrototype 函数原型，包括函数名和参数类型
 * @param {Array<value>} [paramValues] 参数值数组（可选）
 * @returns {string} 交易数据。  0x + 函数选择器 + 函数参数的16进制
 */
function generateTransactionData(functionPrototype, paramValues = []) {
    
    // 1.生成函数签名
    // 计算函数原型的 Keccak-256 哈希
    const functionKeccak256Hash = ethers.keccak256(ethers.toUtf8Bytes(functionPrototype));
    // 取哈希的前4个字节作为函数签名(包含0x)
    const functionSignature = functionKeccak256Hash.slice(0, 10); //0x + 8个字符 = 10个字符

    // 如果没有参数的话,函数签名即为交易数据
    let transactionData = functionSignature;
    // console.log(transactionData);

    // 获取函数的类型数组
    const startIndex = functionPrototype.indexOf('(') + 1;
    const endIndex = functionPrototype.indexOf(')');
    let paramTypes = functionPrototype.slice(startIndex, endIndex).split(',');
    if (startIndex === endIndex) paramTypes = []; // 当空括号时，得到的结果是[''],将它修改为空数组
    
    if (paramTypes.length !== paramValues.length) {
        console.log('函数类型与值不匹配,请修改')
        return null
    }

    // 2.生成参数十六进制abi编码
    // AbiCoder是一个低级类，用于进行 ABI 编码和解码，encode将 JavaScript 值编码为符合abi编码规范的二进制数据，decode将二进制数据解码为 JavaScript 值。
    const abiCoder = new ethers.AbiCoder();
    // 遵循以太坊的 ABI 编码规范对参数进行编码，生成一个符合abi编码规范的十六进制字符串
    // 每个参数占用32字节，不够的在左边填充0
    // 结果是带0x的16进制数据。我们要跟函数签名拼接，不需要0x，用slice(2)去掉
    if (paramValues.length > 0) {
        const encodedParams = abiCoder.encode(paramTypes, paramValues).slice(2);
        // console.log(encodedParams);
        // 将函数签名和编码后的参数拼接，生成交易数据
        transactionData = `${functionSignature}${encodedParams}`;
        // console.log(transactionData);
    }
    // console.log(transactionData);
    return transactionData;
    
    /*
    // 知道合约abi的情况获取交易数据。实际不用，因为多此一举。写在这学习一下
    const contract  = new ethers.Contract(tokenAddress,tokenAbi,wallet)
    // 获取 safeMint 函数
    const safeMintFunction = contract.interface.getFunction('safeMint').format();
    // 计算函数签名的Keccak-256哈希值
    const functionKeccak256Hash = ethers.keccak256(ethers.toUtf8Bytes(safeMintFunction));
    // 获取哈希值的前4个字节（8个十六进制字符）
    const functionSignature = functionKeccak256Hash.slice(0, 10);
    // console.log('Function selector:', functionSignature);
    // 使用 safeMint 函数签名和参数，编码数据
    const transactionData = contract.interface.encodeFunctionData(functionSignature, [wallet.address, 1]);
    console.log(transactionData)
    */
};
```

# 参考

https://twitter.com/gm365/status/1519908373948694528