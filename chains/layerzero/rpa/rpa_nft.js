import { MetaMaskUtil } from "../../../browser/metamask.js";
import { myFormatData } from "../../../formatdata.js";
import { generateRandomString, randomWait } from "../../../utils/utils.js";

export class RPANftUtil extends MetaMaskUtil {

    constructor(browserId,enPassword) {
        super(browserId,enPassword);

    }

    async rpaMintOmnichainAdventuresNFT() {
        await this.unlock()
        await this.page.goto('https://optimistic.etherscan.io/address/0xd12999440402d30f69e282d45081999412013844#writeContract')
        
        // await this.connectWallet('https://omni-x.io/drops/omnia', {chain:'op', accountName:'1撸毛', connectButton:'//div[text()="connect"]'})
        // await this.page.waitForTimeout(2000)
        // try{
        //     await this.page.locator('text=/(^Accept and sign$)/', {timeout:10000}).click()
        //     const metamaskPage = await this.context.newPage()
        //     await metamaskPage.goto(this.homeUrl, {waitUntil:'networkidle', timeout:10000})
        //     await this.page.waitForTimeout(1000)
        //     await metamaskPage.reload({waitUntil:'networkidle', timeout:10000})
        //     await metamaskPage.waitForSelector('text=/(^签名$|^sign$)/i', {timeout:3000}).then(element => { element.click() });
        //     await this.page.waitForTimeout(1000)
        //     metamaskPage.close()
        //     await this.page.waitForTimeout(6000)
        // }catch(error){console.log(error)}
        // for (let i = 0; i < 20; i++) {
        //     await this.page.locator('//img[@alt="minus"]').nth(1).click()
        // }
        // await this.page.locator('//div[text()="mint"]').click()
        // const metamaskPage2 = await this.context.newPage()
        // await metamaskPage2.goto(this.homeUrl, {wait_until:'networkidle', timeout:10000})
        // await metamaskPage2.waitForTimeout(5000)
        // await metamaskPage2.reload()
        // await metamaskPage2.waitForTimeout(1000)
        // await metamaskPage2.locator('text=/(^确认$)/').click()
        // // 等待确认
        // await this.page.waitForTimeout(10000)
        // await metamaskPage2.close()
    }

    async sendNft() {
        try{
            const nfts = [
                {
                    'chain':'Op',
                    'project':'Omnichain Adventures'
                },
                // {
                //     'chain':'Base',
                //     'project':'Omnichain Adventures Part 2                    '
                // }
            ]
            const randomNft = nfts[Math.floor(Math.random() * nfts.length)];
            await this.connectWallet('https://omni-x.io/account', {chain:randomNft['chain'], accountName:'1撸毛', connectButton:'//div[text()="connect"]'})
            await this.page.waitForTimeout(2000)
            try{
                await this.page.waitForSelector('text=/(^Accept and sign$)/', {timeout:6000}).then(element => { element.click() });
                const metamaskPage = await this.context.newPage()
                await metamaskPage.goto(this.homeUrl, {waitUntil:'networkidle', timeout:10000})
                await this.page.waitForTimeout(1000)
                await metamaskPage.reload({waitUntil:'networkidle', timeout:10000})
                await metamaskPage.waitForSelector('text=/(^签名$|^sign$)/i', {timeout:3000}).then(element => { element.click() });
                await this.page.waitForTimeout(1000)
                metamaskPage.close()
                await this.page.waitForTimeout(6000)
            }catch(error){console.log(error)}

            let chains
            if(randomNft['chain']==='Op'){
                chains = ['Avalanche', 'Polygon', 'Moonbeam', 'METIS', 'GNOSIS', 'Arb Nova', 'Base']
            }else if(randomNft['chain']==='Base'){
                chains = ['METIS']
            }
            const chain = chains[Math.floor(Math.random() * chains.length)];
            while(true) {
                await this.page.goto('https://omni-x.io/account')
                await this.page.waitForSelector('//div[text()="Collected"]', {timeout:15000})
                // await this.page.waitForTimeout(10000)
                const eles = await this.page.$$(`//div[text()="${randomNft['project']}"]`)
                console.log(eles.length)    
                if(eles.length > 0) {
                    const ele = eles[Math.floor(Math.random() * eles.length)];
                    await ele.click()
                    await this.page.waitForSelector('//div[text()="Item Details"]', {timeout:15000})
                    // await this.page.waitForTimeout(5000)
                    const text = await this.page.locator('//span[text()="Chain"]/following-sibling::span').textContent()
                    // console.log(text)
                    if(text.includes(randomNft['chain'])){
                        break
                    }
                }
            }
            await this.page.waitForTimeout(1000)
            await this.page.locator('//div[text()="Send"]').click()
            await this.page.waitForTimeout(1000)
            await this.page.locator('//span[text()="Select a network"]').click()
            await this.page.waitForTimeout(1000)
            await this.page.locator(`//div[text()="${chain}"]`).click()
            await this.page.waitForTimeout(2000)
            // await this.page.locator('//div[text()="Send"]').click()
            await this.page.locator('//div[@id="form-dialog-title"]/following-sibling::div/div/div[3]/button').click()
            await this.page.waitForTimeout(1000)
            const metamaskPage = await this.context.newPage()
            await metamaskPage.goto(this.homeUrl, {waitUntil:'networkidle', timeout:10000})
            await this.page.waitForTimeout(6000)
            await metamaskPage.reload({waitUntil:'networkidle', timeout:10000})
            await metamaskPage.waitForSelector('text=/(^确认$)/i', {timeout:6000}).then(element => { element.click() });
            await this.page.waitForTimeout(6000)
            metamaskPage.close()
            await this.page.waitForTimeout(6000)
        }catch(error){console.log(error)}
    }

    async testnetBridge() {
        try{
            const  chain = ['op', 'arb']
            let randomChain = chain[Math.floor(Math.random() * chain.length)];
            await this.connectWallet('https://testnetbridge.com/', {chain:randomChain, accountName:'1撸毛', connectButton:'text=/(Connect Wallet)/i'})
            let text = await this.page.locator('//div[text()="Token"]/following-sibling::div/div').textContent()
            text = text.toLowerCase()
            if (!text.includes(randomChain)) {
                if(randomChain === 'op'){
                    randomChain = 'Optimism'
                }else if(randomChain === 'arb'){
                    randomChain = 'Arbitrum'
                }
                await this.page.locator('//div[text()="Token"]/following-sibling::div/div').click()
                await this.page.locator(`//div[text()="${randomChain}"]/../following-sibling::div`).click()
                await this.page.waitForTimeout(1000)
                await this.page.locator('//button[text()="Max"]').click()
                await this.page.waitForTimeout(1000)
                let value = await this.page.getByPlaceholder('0.0').getAttribute('value')
                if(value < 0.0005){
                    console.log(`${randomChain}链 ETH 余额不足`)
                    return
                }
                // 0.00001 - 0.0001 之间的随机数，randomdecimalPlaces位
                const randomdecimalPlaces = (Math.random() * (7 - 5) + 5); // 5-7随机数
                const randomNum = (Math.random() * (0.0001 - 0.00001) + 0.00001).toFixed(randomdecimalPlaces);
                await this.page.getByPlaceholder('0.0').fill(randomNum.toString())
                await this.page.waitForTimeout(1000)
                await this.page.locator('//button[text()="Transfer"]').click()
                await this.page.waitForTimeout(1000)
                const metamaskPage = await this.context.newPage()
                await metamaskPage.goto(this.homeUrl, {waitUntil:'networkidle', timeout:10000})
                await this.page.waitForTimeout(5000)
                await metamaskPage.reload({waitUntil:'networkidle', timeout:10000})
                await this.page.waitForTimeout(5000)
                await metamaskPage.waitForSelector('text=/(^确认$)/i', {timeout:3000}).then(element => { element.click() });
                await this.page.waitForTimeout(6000)
                await metamaskPage.close()
                await this.page.waitForTimeout(6000)
            }
        }catch(error){console.log(error)}
    }

    async rpaL2telegraph() {
        try{
            const sendMessageWebsite = "https://l2telegraph.xyz/"
            const bridgeNftWebsite = "https://l2telegraph.xyz/bridge/"
            const bridgeTokenWebsite = "https://l2telegraph.xyz/bridgetokens/"
            const actions = ['sendMessage', 'bridgeNft', 'bridgeToken']
            const randomAction = actions[Math.floor(Math.random() * actions.length)];
            if(randomAction === 'sendMessage') {
                await this.connectWallet(sendMessageWebsite, {chain:'zksync', accountName:'1撸毛', connectButton:'text=/(Connect Metamask)/i'})
                const chains = ['Arbitrum Nova', 'Arbitrum', 'Fantom', 'Meter (MTR)']
                const randomChain = chains[Math.floor(Math.random() * chains.length)];
                console.log(`randomChain: ${randomChain}`)
                const toChainButton = await this.page.locator('//div[@class="item-l2telegraph__link"]').nth(1)
                const toChain = await toChainButton.textContent()
                console.log(`toChain: ${toChain}`)
                if(toChain !== randomChain) {
                    await toChainButton.click()
                    await this.page.locator(`//div[text()="${randomChain}"]`).click()
                    await this.page.waitForTimeout(1000)
                }
                const length = Math.floor(Math.random() * (20 - 6 + 1)) + 6; // 6-20的随机数字
                const message = generateRandomString(length)
                await this.page.getByPlaceholder('Type any message').fill(message);
                await this.page.waitForTimeout(1000)
                await this.executeTransaction('//button[text()="Send message"]', { gasLimitRate:0.7 })
                await this.page.waitForTimeout(6000)
            }else if(randomAction === 'bridgeNft') {
                await this.connectWallet(bridgeNftWebsite, {chain:'zksync', accountName:'1撸毛', connectButton:'text=/(Connect Metamask)/i'})
                const chains = ['Arbitrum Nova', 'Arbitrum', 'Fantom', 'Meter (MTR)', 'Polygon', 'Avalanche']
                const randomChain = chains[Math.floor(Math.random() * chains.length)];
                console.log(`randomChain: ${randomChain}`)
                const toChainButton = await this.page.locator('//div[@class="item-l2telegraph__link"]').nth(1)
                const toChain = await toChainButton.textContent()
                console.log(`toChain: ${toChain}`)
                if(toChain !== randomChain) {
                    await toChainButton.click()
                    await this.page.locator(`//div[text()="${randomChain}"]`).click()
                    await this.page.waitForTimeout(1000)
                }
                await this.executeTransaction('//button[text()="MINT"]', { gasLimitRate:0.7 })
                await this.page.waitForTimeout(5000)
                await this.executeTransaction('//button[text()="Bridge NFT"]', { gasLimitRate:0.7 })
                await this.page.waitForTimeout(6000)
            }else if(randomAction === 'bridgeToken') {
                await this.connectWallet(bridgeTokenWebsite, {chain:'zksync', accountName:'1撸毛', connectButton:'text=/(Connect Metamask)/i'})
                const chains = ['Arbitrum Nova']
                const randomChain = chains[Math.floor(Math.random() * chains.length)];
                console.log(`randomChain: ${randomChain}`)
                const toChainButton = await this.page.locator('//div[@class="item-l2telegraph__link"]').nth(1)
                const toChain = await toChainButton.textContent()
                console.log(`toChain: ${toChain}`)
                if(toChain !== randomChain) {
                    await toChainButton.click()
                    await this.page.locator(`//div[text()="${randomChain}"]`).click()
                    await this.page.waitForTimeout(1000)
                }
                await this.executeTransaction('//button[text()="Claim"]', { gasLimitRate:0.7 })
                await this.page.waitForTimeout(5000)
                await this.executeTransaction('//button[text()="Bridge Tokens"]', { gasLimitRate:0.7 })
                await this.page.waitForTimeout(6000)
            }
        }catch(error){console.log(error)}
    }
}

const main = (async(startNum, endNum=null)=>{
    try {
        const data = await myFormatData(startNum, endNum)
        for (let i = 0; i < data.length; i++) {
            const d = data[i];
            // console.log(d)
            console.log(`第${d['index_id']}个账号开始执行任务`)

            const maxTaskNum = 5
            const randomTaskNum = Math.floor(Math.random() * maxTaskNum) + 1;
            console.log(`开始执行任务，将获得${randomTaskNum}条Tx`)
            
            const rpaNft = new RPANftUtil(d['browser_id'], d['enPassword']);
            await rpaNft.start()
            for (let j = 0; j < randomTaskNum; j++) {
                const  project = ['omni-x', 'testnetBridge', 'rpaL2telegraph']
                // const  project = ['omni-x']
                const randomProject = project[Math.floor(Math.random() * project.length)];
                if(randomProject === 'omni-x'){
                    await rpaNft.sendNft()
                }else if(randomProject === 'testnetBridge'){
                    await rpaNft.testnetBridge()
                }else if(randomProject === 'rpaL2telegraph'){
                    await rpaNft.rpaL2telegraph()
                }
                // 当数组长度大于1并且不是最后一个元素时随机等待（范围0-maxSeconds）
                if(randomTaskNum > 1 && j< randomTaskNum-1){
                    await randomWait(600,1800)
                }
            }
            await rpaNft.stop()
            // 当数组长度大于1并且不是最后一个元素时随机等待（范围minSeconds-maxSeconds）
            if(data.length > 1 && i< data.length-1){
                await randomWait(1800,7200)
            }
        }
    }catch(error){console.log(error)}
});

await main(14,15);

