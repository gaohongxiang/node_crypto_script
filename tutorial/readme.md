文档

- web3.py:https://web3py.readthedocs.io/en/v5/quickstart.html
- web3.js:https://web3js.readthedocs.io/en/v1.8.2/getting-started.html
- web3.js中文:https://learnblockchain.cn/docs/web3.js/getting-started.html
- ethers.js中文:https://learnblockchain.cn/ethers_v5/getting-started/
- 以太坊 JavaScript 库：web3.js 与 ethers.js 比较：https://learnblockchain.cn/article/1851
- etherscan API:https://docs.etherscan.io/

如何升级nodejs版本:https://blog.csdn.net/qq_22713201/article/details/122486841
es6与commonjs导入导出有什么区别：https://www.php.cn/website-design-ask-491591.html
Nodejs 中的多种导入与导出:https://www.jianshu.com/p/4d8c5b90ee99
Node 最新 Module 导入导出规范:https://zhuanlan.zhihu.com/p/419079829
Node.js笔记------作用域：https://blog.csdn.net/weixin_69270668/article/details/127340245
TypeError: Cannot read properties of undefined (reading 'JsonRpcProvider')：https://stackoverflow.com/questions/75385248/typeerror-cannot-read-properties-of-undefined-reading-jsonrpcprovider
Class和Module及ES6模块的转码(写的非常清晰):https://wohugb.gitbooks.io/ecmascript-6/content/docs/class.html
NodeJS中的类、属性和方法以及继承：https://blog.csdn.net/yahoo169/article/details/79915977
Node.js 支持 fetch API，用户使用会怎么样？:https://www.zhihu.com/question/538786726

blocknative文档：https://docs.blocknative.com/gas-platform
blocknative：https://explorer.blocknative.com/account

gas
理解以太坊 Gas 燃料和交易手续费：https://learnblockchain.cn/article/322
GAS 和费用:https://ethereum.org/zh/developers/docs/gas/
EIP-1559 对 gas 费计算的影响:https://learnblockchain.cn/article/4576
如何取消卡住的以太坊交易:https://defiprime.com/gas
估计 gas 价格输入量重要吗？：https://github.com/ethers-io/ethers.js/discussions/2439


Gas = Gas Price * gasUsed

Gas Price = Base Fee(基本费用) + Max Priority Fee(优先费｜小费｜矿工费Miner Tip)

Base Fee：基本费用。是由以太坊网络而不是用户或矿工确定的值。简而言之，当区块使用率超过 50% 时，下一个区块的 Base Fee 会自动升高，最高比例为 12.5%，当区块使用率低于 50% 时，下一个区块的 Base Fee 会自动降低，最高比例为 12.5%。

Max Priority Fee：优先费｜小费｜矿工费Miner Tip。是为了让自己交易被优先打包额外付给矿工的费用，用以激励矿工将交易纳入区块。如果没有小费，矿工会发现开采空区块在经济上是可行的，因为他们会获得相同的区块奖励。在正常情况下，一小笔小费会为矿工提供最小的激励来进行交易。对于需要在同一块中的其他交易之前优先执行的交易，将需要更高的提示来尝试出价高于竞争交易。

Max Fee｜maxFeePerGas：是为每单位 Gas 所愿意付出的最高费用。对于要执行的交易，最高费用必须超过基本费用和小费的总和。交易发送方将退还最高费用与基本费用和小费之和之间的差额。我们知道为一笔交易最小要支付的费用是 Base Fee。但 Base Fee 也是会按照网络拥堵情况进行调整的，如果交易发出去之后，在被打包进区块之前，Base Fee 调高了，那么所发送的交易就处于"给价过低"的状态，这笔交易有可能会长期在网络中游荡没节点处理，甚至直接被节点丢弃掉。为了避免这种不可预料的情况，我们需要设一个 Max Fee。把有可能 Base Fee 上调的可能性考虑进去，增加交易被打包成功的概率。实际的花费大概率是比 Max Fee 要低的。
Max Fee = (2 * Base Fee) + Max Priority Fee

Gas Limit：是用户允许这笔交易最大可消耗的 Gas 数量。用户在转账，特别是执行智能合约时 gasUsed 无法提前预知。这样存在一个风险，当用户的交易涉及一个恶意的智能合约，该合约执行将消耗无限的燃料，这样会导致交易方的余额全部消耗（恶意的智能合约有可能是程序Bug，如合约执行陷入一个死循环）。为了避免合约中的错误引起不可预计的燃料消耗，用户需要在发送交易时设定允许消耗的燃料上限，即 gasLimit。这样不管合约是否良好，最坏情况也只是消耗 gasLimit 量的燃料。
如果交易尚未执行完成，而燃料已用完，将出现一个 Out of Gas 的错误。特别注意的是，即使交易失败，也需要支付手续费，因为占用了计算资源。如果最终 gasUsed 低于 gasLimit，即燃料未用完。则剩余燃料(gasLimit - gasUsed )将在交易后退还给你。

