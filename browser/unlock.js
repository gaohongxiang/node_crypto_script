import { MetaMaskUtil } from "./metamask.js";
import { ArgentXUtil } from "./argentx.js";
import { BraavosUtil } from "./braavos.js";
import { UnisatUtil } from "./unisat.js";
import { PhantomUtil } from "./phantom.js";
import { myFormatData } from "../formatdata.js";
import { KeplrUtil } from "./keplr.js";
import { FuelUtil } from "./fuel.js";
import { MagicEdenUtil } from "./magiceden.js";
import { updateBitbrowserProxy } from "./bitbrowser.js";
import { encryptText, decryptText, decryptColumn } from "../crypt_module/crypt_text.js";

const updateBitbrowserProxyMain = (async(startNum, endNum=null)=>{
    try{
        const data = await myFormatData(startNum, endNum)
        for(const d of data) {
            // console.log(d)
            console.log(`第${d['index_id']}个账号`)
            await updateBitbrowserProxy(d['browser_id'], d['proxy_ip'], d['proxy_port'], d['proxy_username'], d['proxy_password'])
        }
    }catch(error){console.log}
})

const myFormatDataMain = (async(startNum, endNum=null)=>{
    try{
        const data = await myFormatData(startNum, endNum)
        for(const d of data) {
            console.log(d)
        }
    }catch(error){console.log}
})

const braavosMain = (async(startNum, endNum=null)=>{
    const data = await myFormatData(startNum, endNum)
    for(const d of data) {
        // console.log(d)
        console.log(`第${d['index_id']}个账号开始执行任务`)
        const braavos = new BraavosUtil(d['browser_id'])
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

const keplrMain = (async(startNum, endNum=null)=>{
    try{
        const data = await myFormatData(startNum, endNum)
        // console.log(data)
        for(const d of data) {
            console.log(`第${d['index_id']}个账号`)
            const keplr = new KeplrUtil(d['browser_id']);
            await keplr.start()
            // await keplr.importByMnemonic(d['cosmos_enMnemonic'])  
            await keplr.createNewWallet(d['index_id'])
            // await keplr.unlock()
            // await keplr.connectWallet('https://launchpad.ally.build?id=1&inviteCode=YBGWJF', {hasCheckButton:true})
            // await keplr.stop()
        }
    }catch(error){console.log(error)}
})

const phantomMain = (async(startNum, endNum=null)=>{
    try{
        const data = await myFormatData(startNum, endNum)
        for(const d of data) {
            console.log(`第${d['index_id']}个账号`)
            const phantom = new PhantomUtil(d['browser_id']);
            await phantom.start()
            // await phantom.createNewWallet(d['index_id'])
            // await phantom.connectWallet('https://www.orca.so/',{hasCheckButton:true})
            
            // await phantom.connectWallet('https://syncswap.xyz', {chain:'zksync'})
            // await phantom.stop()
        }
    }catch(error){console.log}
})

const fuelMain = (async(startNum, endNum=null)=>{
    try{
        const data = await myFormatData(startNum, endNum)
        for(const d of data) {
            console.log(`第${d['index_id']}个账号`)
            const phantom = new FuelUtil(d['browser_id']);
            await phantom.start()
            await phantom.import(d['enMnemonic'])
            // await phantom.connectWallet('https://www.orca.so/',{hasCheckButton:true})
            
            // await phantom.connectWallet('https://syncswap.xyz', {chain:'zksync'})
            // await phantom.stop()
        }
    }catch(error){console.log}
})

const magicedenMain = (async(startNum, endNum=null)=>{
    try{
        const data = await myFormatData(startNum, endNum)
        for(const d of data) {
            console.log(`第${d['index_id']}个账号`)
            const magiceden = new MagicEdenUtil(d['browser_id']);
            await magiceden.start()
            await magiceden.import(d['sol_enMnemonic'])
            // await magiceden.unlock()
            // await magiceden.stop()
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
            // await metamask.stop()
        }
    }catch(error){console.log}
})

const deCryptText = (async(text)=>{
    
    const decryptedText = await decryptText(text);
    console.log(`解密后文本: ${decryptedText}`);
    
    // await decryptColumn('./data/wallet_eth.csv', 'enPrivateKey')
    // await decryptColumn('./data/wallet_btc.csv', 'enMnemonic')
    // await encryptColumn('./data/wallet_eth.csv', 'enPrivateKey')
    // await encryptColumn('./data/wallet_eth.csv', 'enMnemonic')

    // await decryptColumn('./data/wallet_eth_fuzhu.csv', 'fuzhu_enPrivateKey')
    // await decryptColumn('./data/wallet_eth_fuzhu.csv', 'fuzhu_enMnemonic')
    // await encryptColumn('./data/wallet_eth_fuzhu.csv', 'fuzhu_enPrivateKey')
    // await encryptColumn('./data/wallet_eth_fuzhu.csv', 'fuzhu_enMnemonic')

    // await decryptColumn('./data/wallet_eth_tugou.csv', 'tugou_enPrivateKey')
    // await decryptColumn('./data/wallet_eth_tugou.csv', 'tugou_enMnemonic')
    // await encryptColumn('./data/wallet_eth_tugou.csv', 'tugou_enPrivateKey')
    // await encryptColumn('./data/wallet_eth_tugou.csv', 'tugou_enMnemonic')

    // await decryptColumn('./data/wallet_argent.csv', 'argent_enPrivateKey')
    // await decryptColumn('./data/wallet_argent.csv', 'argent_enMnemonic')
    // await encryptColumn('./data/wallet_argent.csv', 'argent_enPrivateKey')
    // await encryptColumn('./data/wallet_argent.csv', 'argent_enMnemonic')

    // await decryptColumn('./data/wallet_braavos.csv', 'braavos_enMnemonic')
    // await encryptColumn('./data/wallet_braavos.csv', 'braavos_enMnemonic')
})

const enCryptText = (async(text)=>{
    const encryptedText = await encryptText(text);
    console.log(`加密后文本: ${encryptedText}`);
})

const unisatMain = (async(startNum, endNum=null)=>{
    try{
        const data = await myFormatData(startNum, endNum)
        for(const d of data) {
            console.log(`第${d['index_id']}个账号`)
            const unisat = new UnisatUtil(d['browser_id']);
            await unisat.start()
            await unisat.unlock()
            // await unisat.createNewWallet(d['index_id'])
            // await unisat.changeNetwork()
            // await unisat.changeAddressType()
            await unisat.page.goto('https://fractal.unisat.io/inscribe')
            // await unisat.page.goto('https://explorer.fractalbitcoin.io/faucet')
            // await unisat.page.goto('https://fractal-faucet.opnet.org/')
            // await unisat.connectWallet('https://launchpad.ally.build?id=1&inviteCode=YBGWJF', {hasCheckButton:true})
            // await unisat.stop()
        }
    }catch(error){console.log(error)}
})

const main = (async({startNum, endNum=null, isUnlockMetaMask=true, isUnlockArgent=true, isUnlockbraavos=false, isUnlockUnisat=false}={})=>{
    try{
        const data = await myFormatData(startNum, endNum)
        for(const d of data) {
            console.log(`第${d['index_id']}个账号`)
            if(isUnlockMetaMask){
                try{
                const metamask = new MetaMaskUtil(d['browser_id'], d['enPassword']);
                await metamask.start()
                await metamask.unlock()
                // await metamask.page.goto('https://pilot.ultiverse.io/')
                // await metamask.page.goto('https://bitlightlabs.com/airdrop/') 
                // await metamask.page.goto('https://secwarex.io/')
                await metamask.page.goto('https://docs.google.com/forms/d/e/1FAIpQLSdZYCnB0qUGt7dQTFi013wUSb7FEF7fKRgdZv1CnFmsoHuUeg/viewform?pli=1')
                // await metamask.page.goto('https://app.infinityai.network/') 
                }catch(error){console.log(error)}
            }
            if(isUnlockArgent){
                const argentx = new ArgentXUtil(d['browser_id'], d['enPassword']);
                await argentx.start()
                await argentx.unlock()
                // await argentx.page.goto('https://element.market/airdrop/starknet')
            } 
            if(isUnlockbraavos){
                const braavos = new BraavosUtil(d['browser_id'], d['enPassword'])
                await braavos.start()
                await braavos.unlock()
            }
            if(isUnlockUnisat){
                const braavos = new UnisatUtil(d['browser_id'])
                await braavos.start()
                await braavos.unlock()
            }

        }
    }catch(error){console.log(error)}
})

// await updateBitbrowserProxyMain(1,30)

// await myFormatDataMain(1)

// await enCryptText('')
// await deCryptText('')

// 
// await metamaskMain(8)

// 解锁钱包
// metamask + argent
// await main({startNum:1, endNum:10, isUnlockMetaMask:true, isUnlockArgent:false, isUnlockbraavos:false, isUnlockUnisat:false})

// metamask + braavos
// await main({startNum:25, endNum:null, isUnlockMetaMask:false, isUnlockArgent:false, isUnlockbraavos:true, isUnlockUnisat:false})

// await metamaskMain(28,30)

// await unisatMain(1,10)

// await argentxMain(1,20)
// await braavosMain(24,30)

// await fuelMain(1)

// await magicedenMain(4)

// await phantomMain(3,30)

// await keplrMain(10)