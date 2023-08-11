import { BitBrowserUtil } from './bitbrowser.js';
import { password } from '../config.js';
import { parseToken } from "../crypt_module/onepassword.js";

process.env.password = await parseToken(password)

export class BraavosUtil extends BitBrowserUtil {
    
    constructor(browserId) {
        super(browserId);
        this.homeUrl = 'chrome-extension://bedkmmbfibnhpofmmachemojbnbndfbg/index.html'
    }

    async unlock() {
        await this.page.goto(this.homeUrl, { waitUntil:'networkidle', timeout:10000 });
        await this.page.waitForTimeout(2000)
        const isExist = await this.isElementExist('//input[@data-testid="password"]', 7)
        console.log(isExist)
        if(isExist) {    
            await this.page.locator('//input[@data-testid="password"]').fill(process.env.password); 
            await this.page.click('text="Login"');    
            await this.page.waitForTimeout(500);  
        }
    }
}

// const braavos = new BraavosUtil('f05d8af4d4a24d029ba4f3ae453f1647') //21
// await braavos.start()
// await braavos.unlock()