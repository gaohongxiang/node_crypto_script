import { ArgentXUtil } from "../../../browser/argentx.js";

export class RPATradeUtil extends ArgentXUtil {

    constructor(browserId) {
        super(browserId);
    }

    async selectTokenPair(projectName, tokens, {fromTokenEle, fromTokenInputEle, toTokenEle, searchSelector}) {
        let fromToken, toToken, value;
        // 确定fromToken
        while(true){
            fromToken = tokens[Math.floor(Math.random() * tokens.length)];
            console.log(`fromToken: ${fromToken}`)
            const fromTokenText = await fromTokenEle.textContent()
            console.log(`fromTokenText: ${fromTokenText}`)
            if (fromTokenText != fromToken){
                fromTokenEle.click()
                await this.page.waitForTimeout(100)
                const tokenEle = await this.page.$$(`text=/(^${fromToken}$)/i`)
                // console.log(tokenEle.length)
                if(tokenEle.length === 1) {
                    await tokenEle[0].click()
                }else{
                    await tokenEle[1].click()
                }  
            }
            await this.page.waitForTimeout(5000)
            await this.page.locator('text=/(^MAX$|^100%$)/').click()
            await this.page.waitForTimeout(3000)
            value = await fromTokenInputEle.getAttribute('value')
            console.log(`value: ${value}`) // type:string。'0'为真
            const valueNumber = Number(value);
            if (valueNumber) {
                break;
            }
        }
        // 避免兑换出去太多代币
        if(fromToken === 'ETH') {
            if (value > '0.008') {
                value = 0.008
                value = `${(Math.random() * (value - 0.001) + 0.001).toFixed(3)}`; // 随机选择0.001-0.008之间的一个数
            }
            await fromTokenInputEle.fill(value)
        }else{
            value = `${(Math.random() * (Number(value) - 1) + 1).toFixed(3)}`
            await fromTokenInputEle.fill(value)
        }
        console.log(`value: ${value}`) // type:string

        // 确定toToken
        while(true){
            toToken = tokens[Math.floor(Math.random() * tokens.length)];
            if(toToken != fromToken) {break}
        }
        await this.page.waitForTimeout(100)
        const toTokenText = await toTokenEle.textContent()
        if (toTokenText != toToken){
            await toTokenEle.click()
            // 当项目为rpaSpaceFi，代币为ETH时，不用搜索，直接选下面的。因为搜索了反而没有ETH了，有点傻逼
            if(toToken !== 'ETH' || !['rpaSpaceFi'].includes(projectName)){
                await this.page.getByPlaceholder(searchSelector).fill(toToken)
            }
            await this.page.waitForTimeout(500)
            const tokenEle = await this.page.$$(`text=/(^${toToken}$)/i`)
            // console.log(tokenEle.length)
            if(tokenEle.length === 1) {
                await tokenEle[0].click()
            }else{
                await tokenEle[1].click()
            }    
        }
        // 随便点一个地方。izumi需要
        await this.page.click('body', { position: {  x: 50, y: 300 } });  
        await this.page.waitForTimeout(5000)
        return { fromToken, toToken, value }
    }

    async rpaApproveToken(projectInfo) {
        try{
            const tokens = [
                {'ETH':'0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7'}, 
                {'USDC':'0x053c91253bc9682c04929ca02ed00b3e423f6710d2ee7e0d5ebb06f3ecf368a8'},
                {'USDT':'0x068f5c6a61780768455de69077e07e89787839bf8166decfbf92b645209c0fb8'},
                {'DAI':'0x00da114221cb83fa859dbdb4c44beeaa0bb37c7537ad5ae66fe5e0efd20e6eb3'}    
            ]
            const tokenInfo = tokens[Math.floor(Math.random() * tokens.length)];
            const token = Object.keys(tokenInfo)[0];
            const tokenAddress = Object.values(tokenInfo)[0];
            const min = 100;const max = 10000000;
            const randomStr = (Math.floor(Math.random() * (max - min + 1) + min)).toString();
            console.log(`授权 ${randomStr} ${token} 给 ${projectInfo.name}`)
            const url = `https://starkscan.co/contract/${tokenAddress}#read-write-contract-sub-write`
            await this.connectWallet(url, {})
            await this.page.locator('a').filter({ hasText: 'Write' }).click()
            await this.page.waitForTimeout(500)
            await this.page.locator('text=/(^approve$)/').click()
            await this.page.waitForTimeout(500)
            await this.page.locator('//div[text()="0x219209e083275171774dab1df80982e9df2096516f06319c5c6d71ae0a8480c"]/../../../div[2]/div/input').fill(projectInfo.contractAddress)
            await this.page.waitForTimeout(500)
            await this.page.locator('//div[text()="0x219209e083275171774dab1df80982e9df2096516f06319c5c6d71ae0a8480c"]/../../../div[3]/div/input').fill(randomStr)
            await this.page.waitForTimeout(500)
            await this.page.locator('//div[text()="0x219209e083275171774dab1df80982e9df2096516f06319c5c6d71ae0a8480c"]/../../../button').click()
            await this.page.waitForTimeout(5000)
            await this.argentXPage.locator('text=/(^Confirm$)/').click()
            await this.page.waitForTimeout(5000)
        }catch(error){console.log(error)}
    }
    
    async rpaJediSwapToken(projectInfo) {
        try{
            await this.connectWallet(projectInfo.website, {hasNavigator:true, navigatorButton:'//div[text()="I understand the risks outlined above"]'})

            const tokens = ['ETH', 'USDC', 'USDT']
            const fromTokenEle = await this.page.locator('//div[@id="swap-currency-input"]/div/div[2]/button/div/span')
            const fromTokenInputEle = await this.page.locator('//input[@placeholder="0.0"]').nth(0)
            // console.log(inputEle.length)
            // const fromTokenInputEle = inputEle[0]
            const toTokenEle = await this.page.locator('//div[@id="swap-currency-output"]/div/div[2]/button/div/span')
            const searchSelector = 'Search name or paste address'

            await this.selectTokenPair(projectInfo.name, tokens, {fromTokenEle, fromTokenInputEle, toTokenEle, searchSelector})
            await this.page.waitForTimeout(5000)
            await this.executeTransaction('//div[text()="Swap"]', {isConfirmPage:true, confirmButton:'//button[@id="confirm-swap-or-send"]' })
        }catch(error){console.log(error)}
    }

    /**
     * 随机选择一组from/to代币，兑换from代币的25%
     * 
     */
    async rpa10kSwapToken(projectInfo) {
        try{
            await this.connectWallet(projectInfo.website, {})
            await this.page.waitForTimeout(1000)
            await this.page.click('body', { position: {  x: 50, y: 300 } });  

            // const tokens = ['ETH', 'USDC', 'USDT']
            // const fromTokenEle = await this.page.locator('//input[@class="swap-input"][1]/following-sibling::button').nth(0)
            // const toTokenELe = await this.page.locator('//input[@class="swap-input"][1]/following-sibling::button').nth(1)
            // const fromTokenInputEle = await this.page.locator('//input[@class="swap-input"][1]').nth(0)
            // const searchSelector = 'Search name or paste address'
            // // #toolbox + div 表示选择 ID 为 #toolbox 的元素后的下一个 <div> 同级元素。
            // const searchTokenSelector = '#toolbox + div'
            // const { fromToken, toToken, value } = await this.selectTokenPair(projectInfo.name, tokens, {
            //     fromTokenEle:fromTokenEle, 
            //     fromTokenInputEle:fromTokenInputEle, 
            //     toTokenELe:toTokenELe, 
            //     searchSelector:searchSelector,
            //     searchTokenSelector:searchTokenSelector})

            // // approve
            // if (fromToken != 'ETH') {
            //     await this.approve(`text=/(^Unlock ${fromToken}$)/i`, { value:value, canEditGas:false, hasCheckPage:true })
            // }

            // // swap
            // await this.executeTransaction('text=/(^Swap$)/i', { canEditGas:false })
        }catch(error){console.log(error)}
    }

   
   
    
}

// const RPATrade = new RPATradeUtil('c04784d64e1742cab2f1329c3a8ee898');
// await RPATrade.rpaSyncSwapToken()

