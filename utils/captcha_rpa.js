import { BitBrowserUtil } from "../browser/bitbrowser.js";
import { yescaptchaClientKey } from "../config.js";
import { myFormatData } from "../formatdata.js";
import { sleep } from "./utils.js";

class YescaptchaUtil extends BitBrowserUtil{
    constructor(browserId) {
        super(browserId);
    }
   
    async importYescaptcha(){
        await this.page.goto('chrome-extension://lioileegmgkjjkanamdgifojepdfpfkg/option/index.html')
        await this.page.locator('//label[text()="密钥"]/../following-sibling::div/input').fill(yescaptchaClientKey)
        await this.page.getByText('SAVE').click()
    }

    async setYescaptchaState(operate=true){
        await this.page.goto('chrome-extension://lioileegmgkjjkanamdgifojepdfpfkg/option/index.html')
        const checkbox = await this.page.$('//label[text()="总开关"]/../following-sibling::div/span/input')
        if (checkbox) {
            // 获取复选框的状态
            const isChecked = await checkbox.isChecked();
            // console.log(isChecked)
            if (isChecked == operate) {
              return;
            } else {
                checkbox.click();
            }
        } else {
        console.log('未找到复选框元素');
        }
        await this.page.getByText('SAVE').click()
    }

}


const main = (async(startNum, endNum=null)=>{
    const data = await myFormatData(startNum, endNum)
    // console.log(data)
    for (const d of data) {
        try{
            const yescaptcha = new YescaptchaUtil(d['browser_id'])
            await yescaptcha.start()
            // await yescaptcha.importYescaptcha()
            await yescaptcha.setYescaptchaState(true)
            await sleep(3)
            // await yescaptcha.stop()
        }catch(error){console.log(error)}
    }
});

// await main(1,30)