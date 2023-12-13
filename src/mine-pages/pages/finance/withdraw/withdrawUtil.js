import {app} from '@/main'

/**
 * 
 * @param {Object} options 请求相关内容
 *  options argument
 *    @param params //请求带参
 *    @param type //默认get，暂不针对post进行处理
 * @param {Function} handler //请求成功回调
 * @param {Function} errHandler //请求失败回调
 */
const getSignData = (
  options = {}, 
  handler, 
  errHandler
) => {
  if(!options || typeof options != 'object') {
    if(console) console.warn('输入参数格式有误，第一个参数格式应该为object');
    options = {};
  }
  let originalOptions = {
    params: {},
    type: 'get',
    url: '/common/payment/ContractInfo',
    slient: true
  }
  // 对默认值进行覆盖操作。
  options = {
    ...originalOptions,
    ...options
  }
  if(options.type) options.type = options.type.toLowerCase();

  //交给下方链路去处理请求相关内容
  handlerGetSignData(options, handler, errHandler)
  
}

//参数与上一致
const handlerGetSignData = (options, handler, errHandler) => {
  // 发起签名信息获取请求
  switch(options) {
    case 'get': 
      app.$sget(options.url, options.params, res => {
        if(handler && typeof handler == 'function') handler(res);
      }, err => {
        if(errHandler && typeof errHandler == 'function') errHandler(err);
      }, options.slient);
      break;
    
    case 'post':  
      app.$spost(options.url, options.params, res => {
        if(handler && typeof handler == 'function') handler(res);
      }, err => {
        if(errHandler && typeof errHandler == 'function') errHandler(err);
      }, options.slient);
      break;

    default: 
      app.$sget(options.url, options.params, res => {
        if(handler && typeof handler == 'function') handler(res);
      }, err => {
        if(errHandler && typeof errHandler == 'function') errHandler(err);
      }, options.slient);
      break;
  }
}


// 没有签约，不让支付
const throwAllowPayError = (type = 1, needToSign = false) => {
  uni.showModal({
    title: '提示',
    content: `${app.$name}已经为您缴纳所有税费，请您前往填写个人信息和签约合同哦`,
    confirmText: '前往签约',
    success: res => {
      if(res.confirm) {
        if(needToSign) handlerUnsign();
      }
    }
  })
}
// 确定弹窗后走哪个签约路径
const handlerUnsign = type => {
  switch(type) {
    case 1: 
      // 快商
      uni.redirectTo({
        url: '/market-pages/pages/kuaishang-pay/sign/sign'
      })
      break;
    
    case 2:  
      // 乐小活
      uni.redirectTo({
        url: '/market-pages/pages/lexiaohuo-pay/pre-sign/pre-sign'
      })
      break;

    default: 
      // 默认走快商
      uni.redirectTo({
        url: '/market-pages/pages/kuaishang-pay/sign/sign'
      })
      break;
  }
}


export default {
  getSignData,

  throwAllowPayError
}