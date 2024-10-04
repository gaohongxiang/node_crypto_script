import { RpcProvider, Account, Contract, json, uint256, ec, stark, hash, CallData } from "starknet";

function getRandomString(min, max) {
    const gasLimit = Math.floor(Math.random() * (max - min + 1)) + min; // 随机生成 min 到 max 的整数
    return gasLimit.toString(); // 返回字符串形式的 gas limit
}
export async function setDomain(account) {
    const braavos_addr = "0x03448896d4a0df143f98c9eeccc7e279bf3c2008bda2ad2759f5b20ed263585f";
    const domain_addr = "0x06ac597f8116f886fa1c97a23fa4e08299975ecaf6b598873ca6792b9bbfb678"
    
    let nonce = await account.getNonce()
    console.log("nonce:", nonce)
    let number = getRandomString(100000, 200000)
    console.log(number)
    try{
        let call = null
        call = await account.execute(
            [
                {
                    contractAddress: braavos_addr,
                    entrypoint: 'claim_name',
                    calldata: CallData.compile({
                        name: number
                    })
                },
                {
                    contractAddress: domain_addr,
                    entrypoint: 'set_address_to_domain',
                    calldata: CallData.compile({
                        array: [number, "0xce31cfe97"]
                    })
                }
            ],
                undefined,
            {
                nonce: null
            }
        );
        const receipt = await account.provider.waitForTransaction(tx.transaction_hash)

        console.log(index, "🍺 成功!", `https://starkscan.co/tx/${call.transaction_hash}`)
        // fs.appendFileSync("domain.log", `🍺 ${index} ${account.address} https://starkscan.co/tx/${call.transaction_hash}\n`)
    }
    catch(e){
        // fs.appendFileSync("domain.log", `❌ ${index} ${account.address}\n`)
        console.log("Erorr", e.message)
    }
}