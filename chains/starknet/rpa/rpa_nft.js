import { ArgentXUtil } from "../../../browser/argentx.js";
import { randomWait } from "../../../utils/utils.js";

export class RPANftUtil extends ArgentXUtil {

    constructor(browserId, enPasswrod) {
        super(browserId, enPasswrod);
    }

    async starknetId(project) {
        try{
            await this.connectWallet(project.website, {hasNavigator:true,navigatorButton:'//button[text()="connect"]',connectButton:'//div[text()="Connect Argent X"]', hasArgentXButton:false})
            const randomNum = Math.floor(Math.random() * 5) + 1; //1-5之间的随机整数
            console.log(`总计mint${randomNum}个id`)
            for(let i=0; i<randomNum; i++){
                await this.page.waitForTimeout(5000)
                const eles = await this.page.$$('//h1[text()="Your Starknet identities"]/following-sibling::div/div')
                // console.log(eles.length)
                const ele = eles[eles.length - 1];
                await ele.click()
                await this.page.waitForTimeout(3000)
                const element = await this.argentXPage.$('text=/(^Confirm$)/');
                while(true){
                    let i = 1
                    // 等待元素可用（包括可点击）
                    const isEnabled = await element.isEnabled();
                    console.log(isEnabled)
                    if(isEnabled){
                        await element.click()
                        break
                    }
                    await this.argentXPage.waitForTimeout(10000)
                    // 等待太久退出
                    i++
                    if(i > 8){break}
                }
                // 等待确认
                await this.page.waitForTimeout(10000)
                await this.page.bringToFront()
                try{
                    await this.page.waitForTimeout(2000)
                    await this.page.locator('//button[text()="Close"]').click()
                }catch(error){console.log(error)}
                // 当数组长度大于1并且不是最后一个元素时随机等待（范围0-maxSeconds）
                if(randomNum > 1 && i< randomNum-1){
                    await randomWait(300)
                }
            }
        }catch(error){console.log(error)}
    }
}


