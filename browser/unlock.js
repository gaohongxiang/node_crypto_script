import { MetaMaskUtil } from "./metamask.js";
import { ArgentXUtil } from "./argentx.js";
import { BraavosUtil } from "./braavos.js";
import { myFormatData } from "../formatdata.js";

const braavosMain = (async(startNum, endNum=null)=>{
    const data = await myFormatData(startNum, endNum)
    for(const d of data) {
        // console.log(d)
        console.log(`第${d['index_id']}个账号开始执行任务`)
        const braavos = new BraavosUtil(d['browser_id'], d['enPassword'])
        await braavos.start()
        await braavos.import_wallet(d['braavos_enMnemonic'])
        // await braavos.unlock()
    }
})

const argentxMain = (async(startNum, endNum=null)=>{
    try{
        const data = await myFormatData(startNum, endNum)
        for(const d of data) {
            console.log(`第${d['index_id']}个账号`)
            const argentx = new ArgentXUtil(d['browser_id'], d['enPassword']);
            await argentx.start()
            await argentx.importByMnemonic(d['argent_enMnemonic'])
            // await argentx.unlock()
            // await argentx.connectWallet('https://syncswap.xyz', {chain:'zksync'})
        }
    }catch(error){console.log}
})

const metamaskMain = (async(startNum, endNum=null)=>{
    try{
        const data = await myFormatData(startNum, endNum)
        for(const d of data) {
            console.log(`第${d['index_id']}个账号`)
            const metamask = new MetaMaskUtil(d['browser_id'], d['enPassword']);
            await metamask.start()
            await metamask.firstImportByMnemonic()
            await metamask.importByPrivateKey(d['enPrivateKey'], '1撸毛')
            await metamask.importByPrivateKey(d['tugou_enPrivateKey'], '2土狗')
            await metamask.importByPrivateKey(d['fuzhu_enPrivateKey'], '3辅助')
            await metamask.changeAccount('1撸毛')
            // await metamask.unlock()
            await metamask.changeChain('zksync')
            await metamask.changeChain('op')
            await metamask.changeChain('arb')
            await metamask.changeChain('polygon')
            await metamask.changeChain('bnb')
            await metamask.changeChain('zksync')
            // await metamask.connectWallet('https://syncswap.xyz', {chain:'zksync'})
            await metamask.stop()
        }
    }catch(error){console.log}
})

const main = (async({startNum, endNum=null, isUnlockMetaMask=true, isUnlockArgent=true, isUnlockbraavos=false}={})=>{
    try{
        const data = await myFormatData(startNum, endNum)
        for(const d of data) {
            console.log(`第${d['index_id']}个账号`)
            if(isUnlockMetaMask){
                const metamask = new MetaMaskUtil(d['browser_id'], d['enPassword']);
                await metamask.start()
                await metamask.unlock()
            }
            if(isUnlockArgent){
                const argentx = new ArgentXUtil(d['browser_id'], d['enPassword']);
                await argentx.start()
                await argentx.unlock()
            } 
            if(isUnlockbraavos){
                const braavos = new BraavosUtil(d['browser_id'], d['enPassword'])
                await braavos.start()
                await braavos.unlock()
            }
            
        }
    }catch(error){console.log(error)}
})

// 解锁钱包
// metamask + argent
await main({startNum:8, endNum:null, isUnlockMetaMask:true, isUnlockArgent:true, isUnlockbraavos:false})

// metamask + braavos
// await main({startNum:21, endNum:null, isUnlockMetaMask:true, isUnlockArgent:false, isUnlockbraavos:true})

// await metamaskMain(7)

// await argentxMain(9,20)

// await braavosMain(21,30)
