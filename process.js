const fs = require('fs');
const commentJson = require('comment-json');
const argvs = process.argv.slice(2);
const settingVO = JSON.parse(argvs[0]);
let workspace = argvs[1];
if (!workspace) workspace = '.'
const manifestPath = `${workspace}/src/manifest.json`
const pagesPath = `${workspace}/src/pages.json`
const configPath = `${workspace}/src/config.json`

function handlePages(name) {
  // 读取文件
  const jsonString = fs.readFileSync(pagesPath, 'utf-8').toString()
  const jsonData = commentJson.parse(jsonString)
  jsonData.pages.forEach(page => {
    if (page.path === 'pages/index/index' || page.path === 'pages/ppyl/ppyls/ppyls') page.style.navigationBarTitleText = name;
  })
  jsonData.globalStyle.navigationBarTitleText = name;
  // 将修改后的JSON内容写回到文件中（保留注释）
  fs.writeFileSync(pagesPath, commentJson.stringify(jsonData, null, 2));
}

function handleManifest(appid) {
  // 读取文件
  const jsonString = fs.readFileSync(manifestPath, 'utf-8').toString()
  const jsonData = commentJson.parse(jsonString)
  jsonData['mp-weixin']['appid'] = appid;
  // 将修改后的JSON内容写回到文件中（保留注释）
  fs.writeFileSync(manifestPath, commentJson.stringify(jsonData, null, 2));
}

function handleConfig(appid) {
  // 读取文件
  const jsonString = fs.readFileSync(configPath, 'utf-8').toString()
  const jsonData = commentJson.parse(jsonString)
  Object.keys(jsonData).forEach(key => {
    if (settingVO[key]) jsonData[key] = settingVO[key]
  })
  // 将修改后的JSON内容写回到文件中（保留注释）
  fs.writeFileSync(configPath, commentJson.stringify(jsonData, null, 2));

}

settingVO.name && handlePages(settingVO.name)
settingVO.appid && handleManifest(settingVO.appid)
handleConfig()