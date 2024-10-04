import { ArgentXUtil } from "../../../browser/argentx.js";
import { RPATradeUtil } from "./rpa_trade.js";
import { randomWait } from "../../../utils/utils.js";

export class RPALendUtil extends RPATradeUtil {

    constructor(browserId, enPassword) {
        super(browserId, enPassword);
    }

    async rpaZkLend(projectInfo, tradeProjectInfo) {
        try{
            await this.connectWallet(projectInfo.website, {chain:'zksync', accountName:'1撸毛', hasNavigator:true, navigatorButton:'text=/(^接受$|^Accept$)/i', waitTime:15})
            await this.page.waitForTimeout(2000)
            // 抵押
            const isSupply = await this.isElementExist('//span[text()="您尚未存款任何资产"]', { waitTime:5})
            console.log(`isSupply: ${isSupply}`)
            if(isSupply){
                // 选一个代币
                while(true){
                    var array = [3, 4, 5, 7]; // // 前两个是不相关元素，从第3-7个元素里随机选择1个.分别对应['DAI', 'USDT', 'USDC', 'ETH']
                    // 从数组中随机选取一个元素
                    var randomIndex = array[Math.floor(Math.random() * array.length)];
                    await this.page.locator(`//span[text()="可存款资产"]/following-sibling::div/div[${randomIndex}]`).first().click()
                    await this.page.waitForTimeout(500)
                    const value = await this.page.locator('//span[text()="钱包余额"]/../following-sibling::div/span[1]').textContent()
                    // console.log(value)
                    if(value > 0.0000001){break}
                    // 随便点一个地方。将弹窗关闭
                    await this.page.click('body', { position: {  x: 50, y: 300 } });  
                    await this.page.waitForTimeout(1000)
                }
                await this.page.getByText('Max').click()
                await this.page.waitForTimeout(500)
                const tokenInputEle = await this.page.getByPlaceholder('输入数值')
                let value = await tokenInputEle.getAttribute('value')
                const token = await this.page.locator('//input[@placeholder="输入数值"]/following-sibling::span').textContent()
                // 避免兑换出去太多代币
                if(token === 'ETH') {
                    if (value > '0.008') {
                        value = 0.008
                        value = `${(Math.random() * (value - 0.001) + 0.001).toFixed(3)}`; // 随机选择0.001-0.008之间的一个数
                    }
                    await tokenInputEle.fill(value)
                }else{
                    value = `${(Math.random() * (Number(value) - 1) + 1).toFixed(3)}`
                    await tokenInputEle.fill(value)
                }
                console.log(`value: ${value}`) // type:string
                
                await this.page.waitForTimeout(500)
                const ele = await this.page.locator(`text=/(^启用 & 存款${token}$|^存款${token}$)/i`).first()
                await this.executeTransaction(ele, {isElementhadle:true})

                await randomWait(1,90)
            } 

            // 借贷
            const isBorrow = await this.isElementExist('//span[text()="您尚未借贷任何资产"]', { waitTime:5})
            console.log(`isBorrow: ${isBorrow}`)
            if(isBorrow){ 
                // 选一个代币，借贷
                var array = [3, 4, 5, 7]; // 前两个是不相关元素，从第3-7个元素里随机选择1个.分别对应['DAI', 'USDT', 'USDC', 'ETH']
                // 从数组中随机选取一个元素
                var randomIndex = array[Math.floor(Math.random() * array.length)];
                await this.page.locator(`//span[text()="可借贷资产"]/following-sibling::div/div[${randomIndex}]`).first().click()
                await this.page.waitForTimeout(500)
                await this.page.getByText('50%').click()
                await this.page.waitForTimeout(500)
                const token = await this.page.locator('//input[@placeholder="输入数值"]/following-sibling::span').textContent()
                await this.page.waitForTimeout(500)
                const ele = await this.page.getByRole('button', { name: `借贷${token}` })
                await this.executeTransaction(ele, {isElementhadle:true})
                
                await randomWait(1,90)
            }  

            // 还款
            const isReply = await this.isElementExist('//div[text()="已借贷资产"]', { waitTime:5})
            if(isReply){
                await this.page.locator(`//div[text()="已借贷资产"]/following-sibling::div/div[3]`).click()
                await this.page.waitForTimeout(1000)
                await this.page.getByRole('button', { name: '还款', exact: true }).click()
                await this.page.waitForTimeout(500)
                const token = await this.page.locator('//input[@placeholder="输入数值"]/following-sibling::span').textContent()
                const walletBalance = await this.page.locator('//span[text()="钱包余额"]/../following-sibling::div/span[1]').textContent()
                const lendBalance = await this.page.locator('//span[text()="借贷余额"]/../following-sibling::div/span[1]').textContent()
                console.log('--------------------------------')
                console.log(lendBalance)
                console.log(lendBalance*1.1)
                if(walletBalance < lendBalance){
                    await this.rpaJediSwapToken(tradeProjectInfo,{isFixToToken:true, fixTotoken:token, isFixToTokenValue:true, fixToTokenValue:lendBalance*1.1, isThisPage:false})
                    await this.page.waitForTimeout(10000)
                    await this.page.bringToFront()
                }
                await this.page.reload()
                await this.page.waitForTimeout(1000)
                await this.page.locator(`//div[text()="已借贷资产"]/following-sibling::div/div[3]`).click()
                await this.page.waitForTimeout(1000)
                await this.page.getByRole('button', { name: '还款', exact: true }).click()
                await this.page.getByText('Max').click()
                await this.page.waitForTimeout(500)
                const ele = await this.page.getByRole('button', { name: `还款${token}` })
                await this.executeTransaction(ele, {isElementhadle:true})

                await randomWait(1,90)
            }

            // 提现
            const iswithdraw = await this.isElementExist('//div[text()="已存款资产"]', { waitTime:5})
            const isBorrowNow = await this.isElementExist('//span[text()="您尚未借贷任何资产"]', { waitTime:5})
            // console.log(`isBorrow: ${isBorrow}`)
            if(iswithdraw && isBorrowNow){
                await this.page.locator(`//div[text()="已存款资产"]/following-sibling::div/div[3]`).first().click()
                await this.page.waitForTimeout(500)
                await this.page.getByRole('button', { name: '提款', exact: true }).click()
                // const withdraws = await this.page.$$('//button[text()="提款"]')
                // console.log(withdraws.length)
                // await withdraws[0].click()
                await this.page.waitForTimeout(500)
                await this.page.getByText('Max').click()
                await this.page.waitForTimeout(500)
                const token = await this.page.locator('//input[@placeholder="输入数值"]/following-sibling::span').textContent()
                const ele = await this.page.getByRole('button', { name: `提款${token}` })
                await this.executeTransaction(ele, {isElementhadle:true})
                // await this.executeTransaction(withdraws[1], {isElementhadle:true})
            }
        }catch(error){console.log(error)}
    }
}