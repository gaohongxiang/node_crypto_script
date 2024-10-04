/*
 * bitbrowser api : https://doc.bitbrowser.cn/api-jie-kou-wen-dang/liu-lan-qi-jie-kou
 * playwright文档: https://playwright.dev/docs/library
*/
import playwright from 'playwright';
import webdriver from 'selenium-webdriver';
import chrome from 'selenium-webdriver/chrome.js';
import axios from 'axios';
import { sleep } from '../utils/utils.js';
import * as paths from '../paths.js';


async function createOrUpdateBrowser() {
  // ...   
}

export async function updateBitbrowserProxy(id, host, post, username, password) {
    try{
        const response = await axios.post(`${paths.bitbrowserUrl}/browser/proxy/update`, {
            ids: [id],
            ipCheckService:'ip-api',
            proxyMethod:2, //自定义代理
            proxyType:'socks5',
            host:host,
            port:post,
            proxyUserName:username,
            proxyPassword:password
        });

        // console.log(response)
        if(response.data.success){
            console.log('修改代理成功')
        }else{
            console.log('修改代理失败')
        }
    }catch(error){console.log(error)}
}

export class BitBrowserUtil {

    constructor(browserId) {
        this.browserId = browserId;
        this.browser = null;
        this.context = null;
        this.page = null; 
        this.driver = null;
        this.isStarted = false; // 初始化后变为true，第二次就不会运行了
    }

    async open() { 
        try{
            const response = await axios.post(`${paths.bitbrowserUrl}/browser/open`, {id: this.browserId});
            if(response.data.success === true){
                const ws = response.data.data.ws;
                const chromeDriverPath = response.data.data.driver;
                const http = response.data.data.http;
                // console.log(response.data)
                return { ws, chromeDriverPath, http };  
            } else {
                throw new Error('ws请求失败,请重试');
            }
        }catch(error){
            console.error('打开浏览器失败:', error);
            throw error;
        }
    }
  
    async start(navigationWaitTime=30, allWaitTime=30, maxRetries = 3) {
        let retries = 0;
        while (retries < maxRetries) {
            try {
                if (this.isStarted) {
                    // console.log('已经调用过start方法,不执行初始化操作');
                    return;
                }
                const { ws, chromeDriverPath, http } = await this.open();
                this.browser = await playwright.chromium.connectOverCDP(ws);
    
                const allContexts = this.browser.contexts();
                this.context = allContexts[0];
    
                const allPages = this.context.pages();
                this.page = allPages[0];
    
                // this.defaultWaitTime(this.context, navigationWaitTime, allWaitTime);
    
                // 设置全屏
                // this.browser.maximize();
    
                // 关闭其他页面
                allPages.forEach(page => {
                    if (page != this.page) {
                        page.close();
                    }
                });
    
                /*--------由于playwright目前不支持操作浏览器插件，这里先用selenium来操作---------*/
                // 初始化Selenium WebDriver
                // this.driver = await this.initSeleniumDriver(chromeDriverPath, http);
                // 初始化完毕后设为true，下次调用不会再次初始化
                this.isStarted = true;
    
                // 如果成功初始化，跳出循环
                break;
            } catch (error) {
                console.error('初始化失败，重试中...', error);
                retries++;
                if (retries >= maxRetries) {
                    console.error('达到最大重试次数，无法继续初始化。');
                    break;
                }
                // 在重试之前等待一段时间
                await sleep(5); // 5秒后重试
            }
        }
    }
    

    async closeSeleniumDriver() {
        if (this.driver) {
            await this.driver.quit();  // 关闭 Selenium WebDriver
            this.driver = null;
        }
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


/*------------------------------------------------seleniumx相关操作操作-------------------------------------------------*/

    // 初始化 Selenium WebDriver 的函数
    async initSeleniumDriver(chromeDriverPath, debuggerAddress) {
        try{
            let options = new chrome.Options()
            options.options_['debuggerAddress'] = debuggerAddress

            let service = new chrome.ServiceBuilder(chromeDriverPath)
            // chrome.setDefaultService(service)
        
            let driver = new webdriver.Builder()
                .setChromeService(service)
                .setChromeOptions(options)
                // .withCapabilities(webdriver.Capabilities.chrome())
                .forBrowser('chrome')
                .build()

            return driver;
        } catch (error) {
            console.error('初始化 Selenium WebDriver失败:', error);
            throw error; 
        }
    }
   
    async changeHandle() {
        await sleep(3)
        // 查找新打开的窗口句柄
        const allHandles = await this.driver.getAllWindowHandles();
        if (allHandles.length > 1) {
            const newHandle = allHandles[1]; // 直接取第二个新句柄。原来的句柄是数组的第一个元素
            // 切换到新窗口
            await this.driver.switchTo().window(newHandle);
            return true; // 返回 true 表示成功切换到了新窗口
        } else {
            // console.log('No new window was opened.');
            return false; // 返回 false 表示没有新窗口被打开
        }
    }
    
    // async changeHandle(currentAllHandles, allHandles) {
    //     await sleep(2)
    //     // 查找新打开的窗口句柄
    //     const newHandles = currentAllHandles.filter(handle => !allHandles.includes(handle));
    //     if (newHandles.length > 0) {
    //         // 假设只有一个新句柄，获取该句柄
    //         const newHandle = newHandles[0]; // 直接取第一个新句柄，假设一次只会打开一个新窗口
    //         // 切换到新窗口
    //         await this.driver.switchTo().window(newHandle);
    //         return true; // 返回 true 表示成功切换到了新窗口
    //     } else {
    //         // console.log('No new window was opened.');
    //         return false; // 返回 false 表示没有新窗口被打开
    //     }
    // }
    /*------------------------------------------------seleniumx相关操作操作-------------------------------------------------*/


    async test() {
        await this.start();
        // await this.page.goto("https://syncswap.xyz");
        // await this.page.waitForTimeout(5000)
        // console.log(this.driver)
        // await this.driver.get('https://www.baidu.com')
        // await this.driver.get('https://10kswap.com/')
        // const all_handles = await this.driver.getAllWindowHandles()
        // console.log(all_handles)
    }
}

// Main:
async function main() {
    const bitbrowser = new BitBrowserUtil('c04784d64e1742cab2f1329c3a8ee898');
    bitbrowser.test()
}

// main();
