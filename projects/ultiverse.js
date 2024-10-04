import { By, until } from 'selenium-webdriver';
import { myFormatData } from "../formatdata.js";
import { follow, interactionAction } from '../social/twitter.js';
import { MetaMaskUtil } from '../browser/metamask.js';

class UltiverseUtil extends MetaMaskUtil{

    constructor(browserId, enPassword){
        super(browserId, enPassword)
    }

    async followTwitter(){
        await follow(this.page, ['UltiverseDAO', '0xElectricsheep', 'jimbol14', 'metagf_', 'MUA_Labs'])
    }


    async dd(){
        await this.page.goto('https://mission.ultiverse.io/project/ultiverse/2')
        const element = await this.page.locator('//h5[text()="UltiverseDAO Twitter Followers"]/../follow-sibling::button')
        const text = element.textContent()
        if(text === 'CONNECT'){
            await element.click()
            await this.page.locator('text=Authorize app').click()
            const text = element.textContent()
            if(text === 'FOLLOW'){
                await element.click()
            }
        }
        if(text === 'FOLLOW'){
            await element.click()
        }
    }

    async Explore(){
        try{
            await this.connectWallet('https://pilot.ultiverse.io/', {chain:'opBNB',connectButton:'//img[@alt="icon-metaMask"]'})
            await this.page.waitForTimeout(5000)
            try{
                // 关闭news页面
                const closeIconElement = await this.page.waitForSelector('.closeIcon')
                await closeIconElement.click();
            }catch(error){console.log(error)}
            await this.page.locator('//p[text()="Explore"]').click()
            await this.page.waitForTimeout(5000)
            const elements = await this.page.$$('//button[text()="Explore"]')
            // console.log(elements)
            console.log(elements.length)
            // 如果只有一个元素就是底部的那个，没有可探索的了
            if(elements.length > 1){
                for (let i = 0; i < elements.length; i++) {
                    await elements[i].click();
                    await elements[elements.length - 1].click();
                    try{
                        await this.page.locator('//button[text()="Yes"]').click()
                    }catch{}
                    await this.page.waitForTimeout(13000);
                    // await this.changeHandle()
                    // await this.driver.wait(until.elementLocated(By.xpath('//button[text()="确认"]')), 5000)
                    //     .then(element => this.driver.wait(until.elementIsVisible(element), 5000))
                    //     .then(element => element.click());
                    const metamaskPage = await this.context.newPage()
                    await metamaskPage.goto(this.homeUrl)
                    // await metamaskPage.goto(this.homeUrl, {waitUntil:'networkidle', timeout:10000})
                    await this.page.waitForTimeout(2000)
                    await metamaskPage.reload()
                    await metamaskPage.waitForSelector('text=/(^确认$|^comfirm$)/i', {timeout:5000}).then(element => { element.click() });
                    await this.page.waitForTimeout(2000)
                    await metamaskPage.close()
                    await this.page.locator('//button[text()="Close"]').click()
                    try{
                        await metamaskPage.waitForSelector('text=/(^下一步$|^Next$)/i', {timeout:5000}).then(element => { element.click() });
                        await metamaskPage.waitForSelector('text=/(^下一步$|^Next$)/i', {timeout:5000}).then(element => { element.click() });
                        await metamaskPage.waitForSelector('text=/(^下一步$|^Next$)/i', {timeout:5000}).then(element => { element.click() });
                    }catch(error){}
                }
            }        
        }catch(error){
           console.log(error)
        }
    }
}


const main = (async(startNum, endNum=null)=>{
    try{
        const data = await myFormatData(startNum, endNum)
        for(const d of data) {
            console.log(`第${d['index_id']}个账号`)
            const ultiverse = new UltiverseUtil(d['browser_id'], d['enPassword']);
            await ultiverse.start()
            await ultiverse.unlock()
            await ultiverse.changeChain('opBNB')
            await ultiverse.page.goto('https://pilot.ultiverse.io/')
            // await ultiverse.connectWallet('https://pilot.ultiverse.io/', {chain:'opBNB', connectButton:'//div[@class="onboard_loginBtn__8nQch"]', connectButton:'//img[@alt="icon-metaMask"]'})
            // await ultiverse.Explore()
            // const newPage1 = await metamask.newPage()
            // await newPage1.goto(`https://pilot.ultiverse.io/?inviteCode=pIrSx`)
            // const newPage2 = await metamask.newPage()
            // await newPage2.goto('https://mission.ultiverse.io/project/1B-U2DM')
            
            // await metamask.stop()
        }
    }catch(error){console.log(error)}
})

// await main(21,30)