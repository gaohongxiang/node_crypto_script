/*
 * bitbrowser api : https://doc.bitbrowser.cn/api-jie-kou-wen-dang/liu-lan-qi-jie-kou
 * playwright文档: https://playwright.dev/python/docs/library
*/
import playwright from 'playwright';
import webdriver from 'selenium-webdriver';
import chrome from 'selenium-webdriver/chrome.js';
import axios from 'axios';
import * as paths from '../paths.js';


async function createOrUpdateBrowser() {
  // ...   
}

async function updateProxy() {
  // ...
}

export class BitBrowserUtil {

    constructor(browserId) {
        this.browserId = browserId;
        this.browser = null;
        this.context = null;
        this.page = null; 
        this.driver = null;
    }

    async open() { 
        const response = await axios.post(`${paths.bitbrowserUrl}/browser/open`, {id: this.browserId});
        if(response.data.success === true){
            const ws = response.data.data.ws;
            const chromeDriver = response.data.data.driver;
            const http = response.data.data.http;
            // console.log(response.data)
            // console.log(chromeDriver)
            return { ws, chromeDriver, http };  
        } else {
            throw new Error('ws请求失败,请重试');
        }
    }
  
    async start(navigationWaitTime=30, allWaitTime=30) {
        // if(!process.env.ws) {
        //     process.env.ws = await this.open();
        // }
        const { ws, chromeDriver, http } = await this.open();
        this.browser = await playwright.chromium.connectOverCDP(ws);

        const allContexts = this.browser.contexts();
        this.context = allContexts[0];
            
        const allPages = this.context.pages();
        this.page = allPages[0];
        
        // /*--------由于playwright目前不支持操作浏览器插件，这里先用selenium来操作---------*/
        
        // const debugPort = http.split(':')[1];
        // console.log(debugPort)

        // // 创建 ChromeOptions 对象，设置启动 Chrome 的参数
        // const chromeOptions = new chrome.Options()
        // // .addArguments(`--remote-debugging-port=${debugPort}`)
        // .addArguments(`--remote-debugging-port=55937`)
        // // .addArguments(`--debuggerAddress=${http}`)

        // // 创建 ServiceBuilder 实例，连接到指定的 ChromeDriver
        // const service = new chrome.ServiceBuilder('/Users/gaohongxiang/Library/Application Support/BitBrowser/chromedriver/112/chromedriver');
        // // 创建 WebDriver 实例，使用指定的 ServiceBuilder
        // this.driver = await new webdriver.Builder()
        // .forBrowser('chrome')
        // .setChromeOptions(chromeOptions)
        // .setChromeService(service)
        // .build();
        // /*--------由于playwright目前不支持操作浏览器插件，这里先用selenium来操作---------*/

        // const chromeOptions = new chrome.Options()
        // .addArguments(`--debuggerAddress=${http}`)
        // // .addArguments(`--remote-debugging-port=61915`)
        // // .addArguments(`--prefs={ 'profile.default_content_setting_values': { images: 2 }`)
        // const service = new chrome.ServiceBuilder(chromeDriver).build();
        // // 新建WebDriver实例
        // this.driver = await new chrome.Driver(service, chromeOptions);        
        // // console.log(this.driver)

        // this.defaultWaitTime(this.context, navigationWaitTime, allWaitTime);

        // // 设置全屏
        // // this.browser.maximize();
        
        // 关闭其他页面
        allPages.forEach(page => {
            if (page != this.page) {
                page.close();
            } 
        });
      
        return {
            browser: this.browser,
            context: this.context,
            page: this.page,
            // driver: this.driver 
        }
    }
      
    defaultWaitTime = function(context, navigationWaitTime=30, allWaitTime=30) {
        context.setTimeout({ 
          navigationTimeout: navigationWaitTime * 1000, 
          timeout: allWaitTime * 1000 
        });
      }

    async newContext() {
        // Create new context 
        return await this.browser.newContext()
    }

    async newPage(context='') {
        // 创建新的page.不传context就是使用默认的context创建page
        if (!context) { context = this.context }
        return await context.newPage()
    }

    getPages(context='') {
        // 获取所有页面及长度
        if (!context){ context = this.context } 
        pages = context.pages()
        pagesCount = pages.length
        return { pages, pagesCount }
    }

    async isElementExist(selector, { waitTime=5, page='' }={}) { 
        // 判断元素是否存在
        if (!page){ page = this.page } 
        try {
            await page.waitForSelector(selector, {timeout:waitTime*1000})
            return true
        }catch(error) {
            // console.log(error)
            return false
        }       
    }

    async isEnabled(selector, { waitTime=5, page='' }){
        // 判断元素是否可操作，如点击
        if (!page){ page = this.page }
        const element = await page.$(selector);
        while(true){
            let i = 1
            // 等待元素可用（包括可点击）
            const isEnabled = await element.isEnabled();
            console.log(isEnabled)
            if(isEnabled){
                await element.click()
                break
            }
            await page.waitForTimeout(10000)
            // 等待太久退出
            i++
            if(i > 8){break}
        }
    }

    pause(page='') {
        // Pause page
        if (!page){ page = this.page } 
        page.pause()
    }

    async stop() {
        // 关闭浏览器

        // // 这个方法只能关闭playwright自己创建的浏览器，不能关闭连接的浏览器。。。。
        // this.browser.close()

        // 用bitbrowser的api关闭浏览器
        // const body = {'id': this.browserId}
        // body = {'id': this.browserId,'args': [{'openWidth':200000,'openHeight':200000}]}
        await axios.post(`${paths.bitbrowserUrl}/browser/close`, {id: this.browserId});
    }
    
    closeOtherWindows(context='') {
        // 关闭上下文中的无关页面。
        if (!context){ context = this.context } 
        allPages = context.pages()
        allPages.forEach(page => {
            if (page != this.page) {
                page.close();
            } 
        });
    }

    async test() {
        await this.start();
        // await this.page.goto("https://syncswap.xyz");
        console.log(this.driver)
        await this.driver.get('https://10kswap.com/')
        // const all_handles = await this.driver.getAllWindowHandles()
        // console.log(all_handles)
    }
}

// Main:
async function main() {
    const bitbrowser = new BitBrowserUtil('c04784d64e1742cab2f1329c3a8ee898');
    bitbrowser.test()
    // await bitbrowser.stop();
}

// main();


