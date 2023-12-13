import Vue from 'vue'
import App from './App'

import util from '@/common/util';
import config from '@/config';
// #ifdef MP-WEIXIN
import privacyPopup from "@/components/privacyPopup/privacyPopup"
// #endif

Vue.config.productionTip = false


// 引入网络请求
Vue.prototype.$get = util.get;
Vue.prototype.$post = util.post;
Vue.prototype.$sget = util.sget;
Vue.prototype.$spost = util.spost;
Vue.prototype.$sgetCross = util.sgetCross;

// 收集用户足迹
Vue.prototype.$saveStep = util.saveStep;
Vue.prototype.$uploadSteps = util.uploadSteps;

// 系统默认配置项
Vue.prototype.$name = config.name;
Vue.prototype.$href = config.href;
Vue.prototype.$getShareInfo = config.getShareInfo;
Vue.prototype.$written = config.written
Vue.prototype.$accessKey = config.accessKey

// 弹窗统一延迟时间
Vue.prototype.$toastDelay = util.toastDelay;


config.setAccessKey()
// #ifdef H5
import jwx from '@/common/wx-sdk';
// 引入微信sdk
Vue.prototype.$jwx = jwx;

// 超级app
import superApp from '@/common/super-app/util';
import '@/common/super-app/AppSdk1.0.1';  //引入超a
Vue.prototype.$superApp = superApp;

// 是否开启vconsole调试面板
import VConsole from 'vconsole';
if(config.turnOnVConsole) {
  const testTerminal = new VConsole();
  Vue.use(testTerminal);
}
// #endif
App.mpType = 'app'
// #ifdef MP-WEIXIN
Vue.component('privacy-popup', privacyPopup)
// #endif
const app = new Vue({
	...App
})

app.$mount()

export {
  app
}