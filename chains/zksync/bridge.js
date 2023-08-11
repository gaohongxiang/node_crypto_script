export async function depositL1ToL2(wallet, depositAmount) {
    // 如果桥接erc20代币，需要先授权
    // const txHandle = await wallet.approveERC20(
    //     tokenAddress,
    //     ethers.utils.parseUnits(amount.toString(), tokenDecimals)
    // );
    // await txHandle.wait();
    const deposit = await wallet.deposit({
        token: zksync.utils.ETH_ADDRESS,
        amount: ethers.utils.parseEther(depositAmount.toString()),
        overrides: {
            gasLimit:149210,
        }
    })
    // 等待对L1的存款进行处理
    const ethereumTxReceipt = await deposit.waitL1Commit();
    // 等待处理zkSync上的存款
    const depositReceipt = await deposit.wait();
}