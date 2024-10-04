import { By, until } from 'selenium-webdriver';
import { myFormatData } from "../formatdata.js";
import { PhantomUtil } from "../browser/phantom.js";
import { TwitterUtil } from "../social/twitter.js"

class GGUtil extends PhantomUtil{

    constructor(browserId){
        super(browserId)
    }

    async followTwitter(){
        const newPage = await this.context.newPage()
        await newPage.goto()
    }

    async claimPoint(url, username, followUsername){
        try{
            // const newPage = await this.context.newPage()
            // const twitter = new TwitterUtil()
            // await twitter.followTwitter(followUsername, newPage)
            // await newPage.close()
            await this.connectWallet(url, {hasCheckButton:true})
            await this.page.getByRole('button', { name: 'Enter' }).click()
            try{
                await this.page.getByText('Connect Wallet').click()
            }catch{
                await this.page.reload()
                await this.page.waitForTimeout(3000)
                await this.page.reload()
            }
            await this.page.getByPlaceholder('Enter your username').fill(username)
            // await this.page.getByText('Set Username').click()
            await this.page.getByRole('button', { name: 'Follow' }).click()
            await this.page.getByText('Set Username').click()
            await this.page.getByText('Set Username').click()
        }catch{
            await this.page.reload()
            await this.page.waitForTimeout(3000)
            await this.page.reload()
        }
    }
}

const main = (async(startNum, endNum=null)=>{
    const data = await myFormatData(startNum, endNum)
    // console.log(data)
    for (const d of data) {
        try{
            const gg = new GGUtil(d['browser_id'])
            await gg.start()
            await gg.claimPoint('https://gg.zip/X3B9C', d['twitter_username'], 'ggdotzip')
            // await sleep(3)
            // await gg.stop()
        }catch(error){console.log(error)}
    }
});

await main(4)