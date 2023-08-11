import { MetaMaskUtil } from "../../../browser/metamask.js";
import { generateRandomString, randomWait } from "../../../utils/utils.js";

export class RPASendMsgUtil extends MetaMaskUtil {

    constructor(browserId) {
        super(browserId);
    }

    async rpaDmail(project, email) {
        try{
            await this.connectWallet(project.loginWebsite, {chain:'zksync', accountName:'1撸毛', hasConnectButton:false})
            await this.page.waitForTimeout(20000)
            try{
                await this.page.waitForSelector('text=/(^Launch$)/', {timeout:3000}).then(element => { element.click() });
            }catch(error){console.log(error)}
            const randomNum = Math.floor(Math.random() * 5) + 1; //1-5之间的随机整数
            console.log(`总计发送${randomNum}封邮件`)
            for(let i=0; i<randomNum; i++){
                console.log(`发送第${i+1}封邮件`)
                await this.page.locator('span').filter({ hasText: 'Compose' }).click()
                // 关闭介绍
                await this.page.waitForTimeout(8000)
                await this.page.click('body', { position: {  x: 300, y: 300 } });  
                await this.page.waitForTimeout(500)
                await this.page.click('body', { position: {  x: 300, y: 300 } });  
                await this.page.waitForTimeout(500)
                await this.page.click('body', { position: {  x: 300, y: 300 } });  
                await this.page.waitForTimeout(500)
                await this.page.click('body', { position: {  x: 300, y: 300 } });  
                await this.page.waitForTimeout(500)
                await this.page.click('body', { position: {  x: 300, y: 300 } });
                await this.page.waitForTimeout(500)
                await this.page.getByPlaceholder('Default Address/NFT Domain/Email Address/DID').fill(email)
                const length = Math.floor(Math.random() * (20 - 6 + 1)) + 6; // 6-20的随机数字
                const message1 = generateRandomString(length)
                const message2 = generateRandomString(length)
                await this.page.getByPlaceholder('Enter the subject').fill(message1)
                const ps = await this.page.$$('//div[@class="ql-editor"]/p')
                await ps[1].fill(message2)
                // console.log(ps)
                // 切换到zksync
                const chain = await this.page.locator('//div[@class="switch"]/div/div/span').textContent()
                console.log(chain)
                if(chain !== 'zkSync Mainnet') {
                    await this.page.locator('//div[@class="switch"]/div/div/span').click()
                    await this.page.getByText('zkSync Mainnet').nth(1).click()
                }
                await this.executeTransaction('//span[text()="Send"]', { gasLimitRate:0.9 })

                await randomWait(300)
            }
        }catch(error){console.log(error)}
    }
}


