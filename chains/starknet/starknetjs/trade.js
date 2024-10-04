import { RpcProvider, Account, Contract, json, uint256, ec, cairo, hash, CallData } from "starknet";
import fs from "fs";

export class TradeUtil {

    async swap(account, provider) {
        // eth
        const tokenAddress = "0x053c91253bc9682c04929ca02ed00b3e423f6710d2ee7e0d5ebb06f3ecf368a8";
        // const tokenAbi = 'function balanceOf(address account) external view returns (uint256);'
        
        // // fs.writeFileSync('./myAbi.json', json.stringify( compressedContract.abi, undefined, 2));
        // process.exit()
        // // read abi of Test contract
        const { abi: tokenAbi } = await provider.getClassAt('0x053c91253bc9682c04929ca02ed00b3e423f6710d2ee7e0d5ebb06f3ecf368a8');
        // const tokenInfo = await provider.getClassAt(tokenAddress);
        // console.log(tokenInfo)
        // const compiledContract = json.parse(fs.readFileSync(tokenInfo.program).toString("ascii"));
        // console.log(compiledContract)
        // for(const abi of tokenInfo.abi){
        //     console.log(abi)
        // }
        // process.exit()
        if (tokenAbi === undefined) { throw new Error("no abi.") };
        const tokenContract = new starknet.Contract(tokenAbi, tokenAddress, provider);
        console.log(tokenContract)
        // Connect account with the contract
        tokenContract.connect(account);

        const balanceInitial = await tokenContract.balanceOf(account.address);
        // console.log(balanceInitial.balance)
        console.log("account has a balance of :", starknet.uint256.uint256ToBN(balanceInitial.balance).toString()); // Cairo 0 response
    }

    async approve(account) {
        try {
            const tx = await account.execute(
                [
                    {
                        contractAddress: '0x219209e083275171774dab1df80982e9df2096516f06319c5c6d71ae0a8480c', // USDC
                        entrypoint: "approve",
                        calldata: CallData.compile({
                            spender: '0x7a6f98c03379b9513ca84cca1373ff452a7462a3b61598f0af5bb27ad7f76d1', // 10kswap
                            amount: cairo.uint256(10000),
                            // amount: '100000',
                        })
                    },
                    // {
                    //     contractAddress: routerInstance.address,
                    //     entrypoint: "transferERC20",
                    //     calldata: CallData.compile({
                    //         _token: '0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7', // ETH
                    //         _to: '0x07b393627bd514d2aa4c83e9f0c468939df15ea3c29980cd8e7be3ec847795f0', // orbiter wallet
                    //         _amount: {type: 'struct', low: valueUint256.low, high: valueUint256.high},
                    //         _ext: EVM_ADDRESS, // your evm address to bridge funds
                    //     })
                    // }
                ]
            );
            const receipt = await account.provider.waitForTransaction(tx.transaction_hash)

        } catch (e) {
          console.log('error sending tx', e);
        }
    }
}