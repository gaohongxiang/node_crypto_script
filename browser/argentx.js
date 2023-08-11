import { BitBrowserUtil } from './bitbrowser.js';
import { password } from '../config.js';
import { parseToken } from "../crypt_module/onepassword.js";

process.env.password = await parseToken(password)

export class ArgentXUtil extends BitBrowserUtil {
    
    constructor(browserId) {
        super(browserId);
        this.argentXPage = null
        this.homeUrl = 'chrome-extension://dlcobpjiigpikoobohmabehhmhfoodbb/index.html'
        this.unlockUrl = 'chrome-extension://dlcobpjiigpikoobohmabehhmhfoodbb/lock-screen'
    }

    async unlock() {
        this.argentXPage = await this.context.newPage()
        await this.argentXPage.goto(this.homeUrl, { waitUntil:'networkidle', timeout:30000 });
        await this.argentXPage.waitForTimeout(10000)
        if (this.argentXPage.url() === this.unlockUrl) {
            const isExist = await this.isElementExist('//input[@placeholder="Password"]', { waitTime:15, page: this.argentXPage })
            // console.log(isExist)
            if(isExist) {    
                await this.argentXPage.locator('//input[@placeholder="Password"]').fill(process.env.password); 
                await this.argentXPage.click('text="Unlock"');    
                await this.argentXPage.waitForTimeout(2000);
            }
        }
    }

    async connectWallet(url, { hasAnime=false, hasNavigator=false, hasConnectButton=true, hasArgentXButton=true, hasSignButton=false, navigatorButton='', connectButton='text=/(Connect Wallet?|Connect to Wallet|连接钱包|Login)/i', checkButton='', argentXButton='text=/(Argent X|browser wallet)/i',signButton='', waitTime=5}) {
        /* 连接钱包
        * text=/(connect wallet?|连接钱包|Login)/i 匹配解析: ?表示前面的字符可有可无 i表示对大小写不敏感 |表示或者
        */
        await this.unlock();
        await this.page.bringToFront()
        await this.page.goto(url)
        await this.page.waitForTimeout(waitTime*1000)
        // 链接钱包
        // 是否第一次连接钱包。如果之前连接过钱包就没有这一步
        try{
            // 有些应用有开机动画，等他结束
            if(hasAnime) {
                await this.page.waitForTimeout(30000);
            }
            // 第一次使用时有些应用有导航页面，熟悉应用的。直接关闭.第二次就没有了，所以加个try/catch
            if(hasNavigator){
                try{
                    await this.page.waitForSelector(navigatorButton, {timeout:6000}).then(element => { element.click() });
                }catch(error){console.log(error)}
            }
            if(hasConnectButton){
                // 登录按钮
                await this.page.waitForSelector(connectButton, {timeout:10000}).then(element => { element.click() });
            }
            // 有些应用还需要先点一下checkbox才能选钱包。。。
            if(checkButton){
                try{
                    await this.page.waitForTimeout(1000)
                    await this.page.waitForSelector(checkButton, {timeout:6000}).then(element => { element.click() });
                    await this.page.waitForTimeout(1000)
                }catch(error){console.log(error)}
            }
            if(hasArgentXButton) {
                try{
                    // 选择钱包按钮
                    await this.page.waitForSelector(argentXButton, {timeout:5000}).then(element => { element.click() });
                }catch(error) {console.log(error)}
            }
            
            // 有些应用连接完钱包需要再点击签名按钮才会弹出签名页面
            if(hasSignButton){
                try{
                    await this.page.waitForTimeout(1000)
                    await this.page.waitForSelector(signButton, { timeout:waitTime*1000 }).then(element => { element.click() });
                    // 等待钱包响应
                    await this.page.waitForTimeout(waitTime)
                }catch(error) {console.log(error)}
                
            }
            
            await this.page.waitForTimeout(waitTime*1000)
            try{
                await this.argentXPage.waitForSelector('text=/(^Connect$)/i', {timeout:3000}).then(element => { element.click() });
            }catch(error){console.log(error)}
            await this.page.bringToFront()
        }catch(error){console.log(error)}
    }

    async executeTransaction(selector, { isConfirmPage=false, confirmButton='text=/(^Confirm Swap%$)/', canEditGas=true, gasLimitRate=0.5 }) {
        try{
            try{
                await this.page.waitForTimeout(3000)
                await this.page.waitForSelector(selector, {timeout:10000}).then(element => { element.click() });
                await this.page.waitForTimeout(2000)
            }catch(error){console.log(error)}
            
            // 有些应用会多一个确认页面
            if (isConfirmPage) {
                try{
                    await this.page.waitForSelector('text=/(^Accept%$)/', {timeout:1000}).then(element => { element.click() });
                }catch(error){}
                try{
                    await this.page.waitForTimeout(2000)
                    await this.page.waitForSelector(confirmButton, {timeout:5000}).then(element => { element.click() });
                }catch(error){console.log(error)}
            }
            await this.page.waitForTimeout(5000)
            
            await this.argentXPage.locator('text=/(^Confirm$)/').click()
            // 等待确认
            await this.page.waitForTimeout(10000)
        }catch(error){console.log(error)}
    }

}

// const argentx = new ArgentXUtil('c04784d64e1742cab2f1329c3a8ee898') //1
// await argentx.start()
// await argentx.unlock()