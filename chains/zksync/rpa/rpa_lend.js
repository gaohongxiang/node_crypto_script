import { MetaMaskUtil } from "../../../browser/metamask.js";

export class RPALendUtil extends MetaMaskUtil {

    constructor(browserId) {
        super(browserId);
    }

    async rpaEraLend(projectInfo) {
        try{
            await this.connectWallet(projectInfo.website, {chain:'zksync', accountName:'1撸毛', checkButton:`label.flex input`, waitTime:15})
            const tokens = [{0:'ETH'}, {1:'USDC'}]
            let index, randomToken, maxWithdrawal, walletBalance
            while(true){
                const randomTokenInfo = tokens[Math.floor(Math.random() * tokens.length)];
                [index, randomToken] = Object.entries(randomTokenInfo)[0];
                await this.page.locator('//button[text()="Supply"]').nth(index).click()
                await this.page.waitForTimeout(500)
                // 先看看有没有存款
                await this.page.locator('//span[text()="WITHDRAW"]').click()
                
                // maxWithdrawal = await this.page.locator('//span[text()="Max Withdrawal"]/../following-sibling::p').textContent()
                // // console.log(maxWithdrawal)
                // await this.page.locator('//span[text()="SUPPLY"]').click()
                // await this.page.waitForTimeout(500)
                // walletBalance = await this.page.locator('//span[text()="Wallet Balance"]/../following-sibling::p').textContent()
                // console.log(`maxWithdrawal: ${maxWithdrawal}`)
                // console.log(`walletBalance: ${walletBalance}`)

                await this.page.locator('//p[text()="MAX"]').click()
                maxWithdrawal = await this.page.locator('//input[@placeholder="0.00"]').getAttribute('value')
                await this.page.waitForTimeout(500)
                await this.page.locator('//span[text()="SUPPLY"]').click()
                await this.page.locator('//p[text()="MAX"]').click()
                walletBalance = await this.page.locator('//input[@placeholder="0.00"]').getAttribute('value')
                await this.page.waitForTimeout(500)
                console.log(`maxWithdrawal: ${maxWithdrawal}`)
                console.log(`walletBalance: ${walletBalance}`)
                // 有一项不为0，可以操作。否则重新选
                if(maxWithdrawal > '0.0000001' || walletBalance > '0.0000001') {
                    break
                }
                await this.page.click('body', { position: { x: 50, y: 300 } });
            }
            // 如果没有可提取的代币，说明没有存过，那就执行存款
            if(maxWithdrawal < '0.0000001') {
                await this.page.waitForTimeout(500)
                await this.page.locator('//span[text()="SUPPLY"]').click()
                await this.page.waitForTimeout(500)
                await this.page.locator('//p[text()="MAX"]').click()
                let value = await this.page.locator('//input[@type="number"]').getAttribute('value')
                
                // console.log(value)
                if(randomToken === 'ETH') {
                    if (value > '0.008') {
                        value = 0.008
                        value = `${(Math.random() * (value - 0.001) + 0.001).toFixed(3)}`; // 随机选择0.001-0.008之间的一个数
                    }
                }else{
                    value = `${(Math.random() * (Number(value) - 1) + 1).toFixed(3)}`
                }
                // console.log(`value: ${value}`) // type:string
                await this.page.waitForTimeout(500)
                await this.page.locator('//input[@type="number"]').fill(value)
                
                // approve
                if(randomToken !== 'ETH') {
                    await this.approve('//form/div/button[text()="Approve"]', value, { gasLimitRate:0.7 })
                }

                // supply
                await this.executeTransaction('//form/div/button[text()="Supply"]', {gasLimitRate:0.8})
                
            // 如果有可提取的代币，说明存过，那就执行取款
            }else {
                await this.page.locator('//span[text()="WITHDRAW"]').click()
                await this.page.waitForTimeout(500)
                await this.page.locator('//p[text()="MAX"]').click()
                // supply
                await this.executeTransaction('//button[@type="submit"]', {gasLimitRate:0.8})
            }  
        }catch(error){console.log(error)}
    }

    async rpaEraWithdraw(projectInfo) {
        try{
            await this.connectWallet(projectInfo.website, {chain:'zksync', accountName:'1撸毛', checkButton:`label.flex input`, waitTime:15})
            const tokens = [{0:'ETH'}, {1:'USDC'}]
            let index, randomToken, maxWithdrawal, walletBalance
            for(const token of tokens){
                [index, randomToken] = Object.entries(token)[0];
                await this.page.locator('//button[text()="Supply"]').nth(index).click()
                await this.page.waitForTimeout(500)
                // 先看看有没有存款
                await this.page.locator('//span[text()="WITHDRAW"]').click()
                await this.page.locator('//p[text()="MAX"]').click()
                maxWithdrawal = await this.page.locator('//input[@placeholder="0.00"]').getAttribute('value')
                console.log(`maxWithdrawal: ${maxWithdrawal}`)
                // console.log(typeof(maxWithdrawal))
                // 有一项不为0，可以操作。否则重新选
                if(maxWithdrawal !== '0.00') {
                    // supply
                    await this.executeTransaction('//button[@type="submit"]', {gasLimitRate:0.8})    
                    await this.page.waitForTimeout(500)
                }
                await this.page.click('body', { position: { x: 50, y: 300 } });
                await this.page.waitForTimeout(1000)
            }   
        }catch(error){console.log(error)}
    }
}