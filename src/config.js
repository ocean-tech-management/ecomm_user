import configJson from '@/config.json'
// #ifdef H5
// 引入微信sdk
import jwx from '@/common/wx-sdk';
// 超级app
import '@/common/super-app/AppSdk1.0.1';  //引入超a
// #endif
const name = configJson.name;
const href = configJson.href;
const simplifyName = configJson.configName // 企业名称缩写-用于判断是哪一家公司
const shareTitle = configJson.shareTitle;
const h5ShareTitle = configJson.h5ShareTitle;
const h5ShareDesc = configJson.h5ShareDesc;

const turnOnVConsole = false;  //是否开启vconsole，h5起效

// 全局变量
let globalData = {
  code: null,
  session3rd: null,
  token: '',
  tokenReqTime: null,
  tokenExpire: 1000 * 60 * 60 * 2,
  keepAliveOffset: 1000 * 60 * 30
};
// 平台变量
const accessKey = {
  'H5-WEIXIN': 'p10011', // 微信公众号
  'H5': 'w10011', // 纯H5
  'SuperApp': 'a10011', // 超级APP
  'MP-WEIXIN': 'm10012', // 微信小程序
  'APP-PLUS': 'd10011', // App 平台
}
// 场景信息
let sceneOptions = null;
// toast有效时间/延时执行时间， 要求大于150。 微信复用同一个toast组件， 小于150会出现ui表现上的异常
const toastDelay = 180;

// 接口地址
// #ifdef H5
const serviceInfo = {
  url: "https://kxadmin.jkyong.com/api/v1"
};
// #endif
// #ifndef H5
const serviceInfo = {
  // url: "http://mhpp-api-dev.andyoudao.cn/api/v1"
  url: configJson.apiServiceInfo
  // url: "http://cm.cn/api/v1"
};
// #endif
// 检查系统是否在运维当中的相关接口
const maintainFilePath = configJson.maintainFilePath || 'https://console.andyoudao.cn/cmk.json';
// 在${time}时间内请求失败${num}次的时候检查系统是否在运维状态
const requestFailSettings = {
  time: 1000 * 30,
  num: 3
}

// 不做鉴权的接口
const notAuthList = [
  '/wx/auth',
  '/wx/authNew',
  '/behavior/record',
  '/home/merge',
  '/goods/list',
  '/home/top',
  '/home/list',
  '/goods/info',
  '/goods/reputation',
  '/goods/other',
  '/category/list',
  '/prep/info',

  '/appVersion/list',
  '/token/refresh',
  '/token/new',
  '/superApp/auth'  //第三方的
];

// tabBar地址
const tabBarPage = [
  '/pages/index/index',
  '/pages/categories/categories',
  '/pages/crowd-fundings/crowd-fundings',
  '/pages/shopcar/shopcar',
  '/pages/me/me'
]

// 签约凭证
const kuaishangOptions = {
  companyId: configJson.kuaishangOptions
}


// 默认分享内容
const getShareInfo = () => {
  let userInfo = uni.getStorageSync('userInfo');

  let pages = getCurrentPages();
  let page = pages[pages.length - 1];

  let optionKeys = Object.keys(page.options);
  let optionValues = Object.values(page.options);
  let params = [];
  for(let i = 0; i < optionKeys.length; i++) {
    if(optionKeys[i]!='link_uid') params.push(`${optionKeys[i]}=${optionValues[i]}`);
  }
  let target = `/${page.route}`;
  if(params.length > 0) {
    target += '?';
    target += params.join('&');
  }

  let path = `/pages/index/index?redirect=${encodeURIComponent(target)}`;
  if(userInfo.uid) path += `&link_uid=${userInfo.uid}`;
  return {
    title: shareTitle,
    desc:  name,
    // imageUrl: '/static/images/share.jpg',
    path: path
  }
}

const setAccessKey = () => {
  // #ifdef H5
  if (jwx && jwx.isWechat()) {
    // 微信公众号
    uni.setStorageSync('accessKey', accessKey['H5-WEIXIN'])
  } else {
    // 纯H5
    if(AppSdk) {
      try {
        AppSdk.request_app({});   //超a登录
        uni.setStorageSync('accessKey', accessKey.SuperApp)
      } catch (e) {
        // 纯H5端 不兼容超A的webkit.messageHandlers和easyder_app.test
        uni.setStorageSync('accessKey', accessKey.H5)
      }
    } else {
      // 纯H5端
      uni.setStorageSync('accessKey', accessKey.H5)
    }
  }
  // #endif
  // #ifdef MP-WEIXIN
  uni.setStorageSync('accessKey', accessKey['MP-WEIXIN'])
  // #endif
  // #ifdef APP-PLUS
  uni.setStorageSync('accessKey', accessKey['APP-PLUS'])
  // #endif
}

const getPrivacy = (handle, _this) => {
  // #ifdef MP-WEIXIN
  if (wx.getPrivacySetting) {
    console.log('wx.getPrivacySetting: true')
    wx.getPrivacySetting({
      success: (res) => {
        console.log('wx.getPrivacySetting: success', res)
        if (res.needAuthorization) {
        // if (true) {
          _this.$nextTick(() => {
            // nextTickHandle && nextTickHandle()
            console.log('_this.$refs', _this.$refs);
            if (_this.$refs.privacyComponent) {
              _this.$refs.privacyComponent.show = true;
              console.log('this.$refs.privacyComponent.show', _this.$refs.privacyComponent.show)
            } else {
              console.log('$refs.privacyComponent: false')
              handle && handle()
            }
          });
        } else {
          console.log('res.needAuthorization: false')
          handle && handle()
        }
      },
      fail() {
        console.log('wx.getPrivacySetting: fail')
        handle && handle()
      }
    });
  } else {
    console.log('wx.getPrivacySetting: false')
    handle && handle()
  }
  // #endif
  // #ifndef MP-WEIXIN
  handle && handle()
  // #endif
}



export default {
  name,
  href,
  simplifyName,

  turnOnVConsole,
  getShareInfo,
  getPrivacy,

  globalData,
  toastDelay,
  serviceInfo,
  maintainFilePath,
  requestFailSettings,
  accessKey,

  notAuthList,
  tabBarPage,

  kuaishangOptions,

  setAccessKey,
  written: {
    shareTitle,
    h5ShareTitle,
    h5ShareDesc,
    crowdBalanceName: configJson.crowdBalanceName,
    advanceBuyCardName: configJson.advanceBuyCardName,
    integralName: configJson.integralName,
    ticketBalance: configJson.ticketBalance
  }
}