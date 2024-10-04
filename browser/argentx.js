import { BitBrowserUtil } from './bitbrowser.js';
import { myFormatData } from '../formatdata.js';
import { decryptText } from '../crypt_module/crypt_text.js';

export class ArgentXUtil extends BitBrowserUtil {
    
    constructor(browserId, enPassword) {
        super(browserId);
        this.enPassword = enPassword
        this.argentXPage = null
        // this.homeUrl = 'chrome-extension://dlcobpjiigpikoobohmabehhmhfoodbb/index.html'
        this.homeUrl = 'chrome-extension://mgdkjlekophodpmmfgkadbdekaloeelg/index.html'
        // this.unlockUrl = 'chrome-extension://dlcobpjiigpikoobohmabehhmhfoodbb/lock-screen'
        this.unlockUrl = 'chrome-extension://mgdkjlekophodpmmfgkadbdekaloeelg/lock-screen'
    }
    

    async importByMnemonic(enMnemonic) {
        const mnemonic = await decryptText(enMnemonic)
        const mnemonics = mnemonic.split(' ')
        const password = await decryptText(this.enPassword)
        try{
            await this.page.waitForTimeout(5000)
            await this.page.goto(this.homeUrl)
            await this.page.waitForTimeout(3000)
            await this.page.locator('//button[text()="Restore an existing wallet"]').click()
            await this.page.getByTestId('seed-input-0').fill(mnemonics[0])
            await this.page.getByTestId('seed-input-1').fill(mnemonics[1])
            await this.page.getByTestId('seed-input-2').fill(mnemonics[2])
            await this.page.getByTestId('seed-input-3').fill(mnemonics[3])
            await this.page.getByTestId('seed-input-4').fill(mnemonics[4])
            await this.page.getByTestId('seed-input-5').fill(mnemonics[5])
            await this.page.getByTestId('seed-input-6').fill(mnemonics[6])
            await this.page.getByTestId('seed-input-7').fill(mnemonics[7])
            await this.page.getByTestId('seed-input-8').fill(mnemonics[8])
            await this.page.getByTestId('seed-input-9').fill(mnemonics[9])
            await this.page.getByTestId('seed-input-10').fill(mnemonics[10])
            await this.page.getByTestId('seed-input-11').fill(mnemonics[11])
            await this.page.waitForTimeout(500)
            await this.page.locator('//button[text()="Continue"]').click()
            await this.page.waitForTimeout(500)
            await this.page.getByPlaceholder('Password', { exact: true }).fill(password)
            await this.page.getByPlaceholder('Repeat password').fill(password)
            await this.page.waitForTimeout(500)
            await this.page.locator('//button[text()="Continue"]').click()
            await this.page.waitForTimeout(30000)
            await this.page.locator('//button[text()="Finish"]').click()
        }catch(error){console.log(error)}
    }

    async unlock() {
        const password = await decryptText(this.enPassword)
        if(this.argentXPage === null){
            this.argentXPage = await this.context.newPage()
        }
        await this.argentXPage.goto(this.homeUrl, { waitUntil:'networkidle', timeout:30000 });
        await this.argentXPage.waitForTimeout(10000)
        if (this.argentXPage.url() === this.unlockUrl) {
            const isExist = await this.isElementExist('//input[@placeholder="Password"]', { waitTime:15, page: this.argentXPage })
            // console.log(isExist)
            if(isExist) {
                await this.argentXPage.locator('//input[@placeholder="Password"]').fill(password); 
                await this.argentXPage.click('text="Unlock"');    
                await this.argentXPage.waitForTimeout(2000);
            }
        }
    }

    async connectWallet(url, { page='', hasAnime=false, hasNavigator=false, hasConnectButton=true, hasArgentXButton=true, hasSignButton=false, navigatorButton='', connectButton='text=/(Connect Wallet?|Connect to Wallet|连接钱包|Login)/i', checkButton='', argentXButton='text=/(Argent X|browser wallet)/i',signButton='', waitTime=5}={}) {
        /* 连接钱包
        * text=/(connect wallet?|连接钱包|Login)/i 匹配解析: ?表示前面的字符可有可无 i表示对大小写不敏感 |表示或者
        */
        await this.unlock();
        if (!page){ page = this.page } 
        await page.bringToFront()
        await page.goto(url)
        await page.waitForTimeout(waitTime*1000)
        // 链接钱包
        // 是否第一次连接钱包。如果之前连接过钱包就没有这一步
        try{
            // 有些应用有开机动画，等他结束
            if(hasAnime) {
                await page.waitForTimeout(30000);
            }
            // 第一次使用时有些应用有导航页面，熟悉应用的。直接关闭.第二次就没有了，所以加个try/catch
            if(hasNavigator){
                try{
                    await page.waitForSelector(navigatorButton, {timeout:6000}).then(element => { element.click() });
                }catch(error){console.log(error)}
            }
            if(hasConnectButton){
                // 登录按钮
                await page.waitForSelector(connectButton, {timeout:10000}).then(element => { element.click() });
            }
            // 有些应用还需要先点一下checkbox才能选钱包。。。
            if(checkButton){
                try{
                    await page.waitForTimeout(1000)
                    await page.waitForSelector(checkButton, {timeout:6000}).then(element => { element.click() });
                    await page.waitForTimeout(1000)
                }catch(error){console.log(error)}
            }
            if(hasArgentXButton) {
                try{
                    // 选择钱包按钮
                    await page.waitForSelector(argentXButton, {timeout:5000}).then(element => { element.click() });
                }catch(error) {console.log(error)}
            }
            
            // 有些应用连接完钱包需要再点击签名按钮才会弹出签名页面
            if(hasSignButton){
                try{
                    await page.waitForTimeout(1000)
                    await page.waitForSelector(signButton, { timeout:waitTime*1000 }).then(element => { element.click() });
                    // 等待钱包响应
                    await page.waitForTimeout(waitTime)
                }catch(error) {console.log(error)}
                
            }
            
            await page.waitForTimeout(waitTime*1000)
            try{
                await this.argentXPage.waitForSelector('text=/(^Connect$)/i', {timeout:3000}).then(element => { element.click() });
            }catch(error){console.log(error)}
            // 将page页面带到前台
            await page.bringToFront()
        }catch(error){console.log(error)}
    }

    async executeTransaction(selector, { page='', isElementhadle=false, isConfirmPage=false, confirmButton='text=/(^Confirm Swap%$)/', canEditGas=true, gasLimitRate=0.5 }={}) {
        try{
            if (!page){ page = this.page } 
            try{
                await page.waitForTimeout(3000)
                if(isElementhadle){
                    await selector.click()
                }else{
                    await page.waitForSelector(selector, {timeout:10000}).then(element => { element.click() });
                }
                await page.waitForTimeout(2000)
            }catch(error){console.log(error)}
            
            // 有些应用会多一个确认页面
            if (isConfirmPage) {
                try{
                    await page.waitForSelector('text=/(^Accept%$)/', {timeout:1000}).then(element => { element.click() });
                }catch(error){}
                try{
                    await page.waitForTimeout(2000)
                    await page.waitForSelector(confirmButton, {timeout:5000}).then(element => { element.click() });
                }catch(error){console.log(error)}
            }
            await page.waitForTimeout(5000)

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
            // 将page页面带到前台
            await page.bringToFront()
            // 等待确认
            await page.waitForTimeout(10000)
        }catch(error){console.log(error)}
    }
}