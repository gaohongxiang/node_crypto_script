import { MetaMaskUtil } from "../../../browser/metamask.js";
import { generateRandomString } from "../../../utils/utils.js";

export class RPANftUtil extends MetaMaskUtil {

    constructor(browserId) {
        super(browserId);
    }

    async rpaZksNetworkMintDomain(projectInfo) {
        try{
            await this.connectWallet(projectInfo.website, {chain:'zksync', accountName:'1撸毛', metamaskButton:`text=/(^MetaMask$)/`})
            while(true){
                let domainName = '';
                for (let i = 0; i < 6; i++) {
                    domainName += Math.floor(Math.random() * 10);  
                }
                await this.page.getByPlaceholder('Get your .zks').fill(domainName)
                await this.page.locator('div.btn-search').click()
                let value = await this.page.locator('div.availability').textContent()
                // console.log(value)
                await this.page.waitForTimeout(2000)
                if (value === 'Available'){
                    break
                }
            }
            await this.page.locator('div.btn-search').click() // Register
            await this.page.waitForTimeout(1000)
            // Confirm元素有before伪类选择器，不能直接点击
            const confirmButton = await this.page.$('text=/(^Confirm$)/')
            await this.page.evaluate(button => {button.click()}, confirmButton)
            await this.page.waitForTimeout(1000)
            const registerButton = await this.page.$('text=/(^Register$)/') // Register
            await this.page.evaluate(button => {button.click()}, registerButton)
            await this.page.waitForTimeout(2000)

            const metamaskPage = await this.context.newPage()
            await metamaskPage.goto(this.homeUrl, {wait_until:'networkidle', timeout:10000})
            await metamaskPage.waitForTimeout(5000)
            await metamaskPage.reload()
            // 修改gas limit。设置为推荐的一半
            try{
                await metamaskPage.waitForTimeout(1000)
                await metamaskPage.getByText('建议的网站', {exact:true}).click() // 建议的网站
                await metamaskPage.locator('//span[text()="高级"]').click() // 高级
                await metamaskPage.locator('//a[text()="编辑"]').click() // 编辑
                let gasLimit = await metamaskPage.getByTestId('gas-limit-input').getAttribute('value')
                gasLimit = Math.round(gasLimit * 0.75).toString()
                await metamaskPage.waitForTimeout(500)
                await metamaskPage.getByTestId('gas-limit-input').fill(gasLimit)
                await metamaskPage.waitForTimeout(500)
                await metamaskPage.locator('text=/(^保存$)/').click() // 保存
            }catch(error){console.log(error)}
            await metamaskPage.waitForTimeout(1000)
            await metamaskPage.locator('text=/(^确认$)/').click()
            // 等待确认
            await this.page.waitForTimeout(10000)
            await metamaskPage.close()
        }catch(error){console.log(error)}
    }

    async rpaL2telegraph(projectInfo) {
        try{
            const actions = ['sendMessage', 'bridgeNft', 'bridgeToken']
            const randomAction = actions[Math.floor(Math.random() * actions.length)];
            if(randomAction === 'sendMessage') {
                await this.connectWallet(projectInfo.sendMessageWebsite, {chain:'zksync', accountName:'1撸毛', connectButton:'text=/(Connect Metamask)/i'})
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
            }else if(randomAction === 'bridgeNft') {
                await this.connectWallet(projectInfo.bridgeNftWebsite, {chain:'zksync', accountName:'1撸毛', connectButton:'text=/(Connect Metamask)/i'})
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
            }else if(randomAction === 'bridgeToken') {
                await this.connectWallet(projectInfo.bridgeTokenWebsite, {chain:'zksync', accountName:'1撸毛', connectButton:'text=/(Connect Metamask)/i'})
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
            }
        }catch(error){console.log(error)}
    }

    async rpaRace(projectInfo) {
        await this.page.goto(projectInfo.name);

    }
}

// const RPATrade = new RPATradeUtil('c04784d64e1742cab2f1329c3a8ee898');
// await RPATrade.rpaSyncSwapToken()

