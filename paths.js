
const tokenFile = './data/token.json'
const projectFile = './data/project.json'
const zksyncSuccessLogFile = './chains/zksync/successlog.csv';
const zksyncFailedLogFile = './chains/zksync/failedlog.csv';
// 指纹浏览器
// AdsPower Local API 接口
const adspowerUrl = 'http://local.adspower.com:50325'
// BitBrowser Local API 接口
const bitbrowserUrl = 'http://127.0.0.1:54345'
const bitbrowserFile = './playwright/browser/data/bitbrowser.xlsx'
const adspowerFile = './playwright/browser/data/adspower.xlsx'
export {
    tokenFile,
    projectFile,
    zksyncSuccessLogFile,
    zksyncFailedLogFile,
    adspowerUrl,
    bitbrowserUrl,
    bitbrowserFile,
    adspowerFile
};