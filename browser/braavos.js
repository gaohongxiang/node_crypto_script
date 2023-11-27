import { BitBrowserUtil } from './bitbrowser.js';
import { decryptText } from '../crypt_module/crypt_text.js';
import { myFormatData } from '../formatdata.js';

export class BraavosUtil extends BitBrowserUtil {
    
    constructor(browserId, enPassword) {
        super(browserId);
        this.enPassword = enPassword
        this.homeUrl = 'chrome-extension://jnlgamecbpmbajjfhmmmlhejkemejdma/index.html'
    }

    async import_wallet(enMnemonic) {
        try{
            const password = await decryptText(this.enPassword)
            const mnemonic = await decryptText(enMnemonic)
            await this.page.goto(this.homeUrl)
            await this.page.waitForTimeout(3000)
            await this.page.getByTestId('recover-wallet-btn-text').click()
            await this.page.getByPlaceholder('12-word recovery phrase').fill(mnemonic)
            await this.page.waitForTimeout(1000)
            await this.page.getByTestId('recover-wallet-submit-btn-text').click()
            await this.page.waitForTimeout(500)
            await this.page.getByTestId('password0').fill(password)
            await this.page.getByTestId('password1').fill(password)
            await this.page.waitForTimeout(1000)
            await this.page.getByTestId('create-password-loading-btn-text').click()
            await this.page.waitForTimeout(5000)
            // 等待元素消失
            await this.page.waitForSelector('//div[text()="exit the screen"]', {state:'detached',timeout:500000})
            //关闭提示
            try{
                await this.page.getByTestId('pin-ext-close-btn').click()
            }catch(error){}
        }catch(error){console.log(error)}
    }

    async unlock() {
        const password = await decryptText(this.enPassword)
        await this.page.goto(this.homeUrl, { waitUntil:'networkidle', timeout:10000 });
        await this.page.waitForTimeout(2000)
        const isExist = await this.isElementExist('//input[@data-testid="password"]', 7)
        console.log(isExist)
        if(isExist) {    
            await this.page.locator('//input[@data-testid="password"]').fill(password); 
            await this.page.click('text="Login"');    
            await this.page.waitForTimeout(500);  
        }
    }
}