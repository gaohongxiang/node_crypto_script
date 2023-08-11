import webdriver from 'selenium-webdriver';
import chrome from 'selenium-webdriver/chrome.js';
import axios from 'axios';
main()

async function open() { 
    const response = await axios.post(`http://127.0.0.1:54345/browser/open`, {id: 'c04784d64e1742cab2f1329c3a8ee898'});
    if(response.data.success === true){
        const ws = response.data.data.ws;
        const chromeDriver = response.data.data.driver;
        const http = response.data.data.http;
        // console.log(ws)
        // console.log(chromeDriver)
        return response.data;  
    } else {
        throw new Error('ws请求失败,请重试');
    }
}

async function main() {
  const openRes = await open()
  if (openRes.success) {
    let options = new chrome.Options()
    options.options_['debuggerAddress'] = openRes.data.http
    options.options_['prefs'] = { 'profile.default_content_setting_values': { images: 2 } }

    let driverPath = openRes.data.driver
    let service = new chrome.ServiceBuilder(driverPath).build()
    // chrome.setDefaultService(service)

    let driver = new webdriver.Builder()
      .setChromeOptions(options)
      .withCapabilities(webdriver.Capabilities.chrome())
      .forBrowser('chrome')
      .build()

    await driver.get('https://www.baidu.com')
  }
}
