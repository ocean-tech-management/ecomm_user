  // 导入公用配置
  import config from './config';
  const {platform_num, serviceInfo, errorDictionary} = config;

  // 请求前拦截，后续有需要可以使用上
  const beforeRequest = function (url, data, handler) {
    if (handler && typeof handler == 'function') return handler();
  };

  let requestFailList = []; //请求有问题的时候做相关记录
  /**
   * 
   * @param {请求地址} url 
   * @param {请求内容体} data 
   * @param {成功时的回调} handler 
   * @param {失败时的回调} failHandler 
   * @param {是否为纯静默请求/不弹窗提醒任何信息} slience
   * @returns {请求方法的基本结构}<Object>
   */
  const requestContent = (url, data, handler, failHandler, slience = false) => {
    console.log('url', serviceInfo.url + url);
    return {
      url: serviceInfo.url + url,
      data: data,
      success: function (res) {
        if (res.data.errcode == 0) {
          if (handler && typeof handler == 'function') handler(res.data);
        } else if (res.data.errcode == 202 || res.data.errcode == 203 || res.data.errcode == 204) {
          handlerExpire();
        } else {
          handlerRequestError(url, res, failHandler, slience);
        }
      },
      fail: function (res) {
        if(!res || res.errMsg !== 'request:fail abort') {
          handlerRequestError(url, res, failHandler, slience);
          console.log('err', url, res);
        }
      }

    }
  }
  // 请求有问题时的统一处理
  /**
   * 
   * @param {请求地址} url 
   * @param {请求响应内容} res 
   * @param {失败时的回调} failHandler 
   * @param {是否为纯静默请求/不弹窗提醒任何信息} slience
   * @returns 
   */
  const handlerRequestError = (url, res, failHandler, slience = false) => {
    if(!slience) {
      console.log('超a错误： ', res);
      if(res.errcode) console.log('超a错误类型： ', errorDictionary[res.errcode]);

      alertError('网络有问题或APP未联网，请稍后重试', function () {
        if (failHandler && typeof failHandler == 'function') failHandler(res);
      })
    } else {
      if (failHandler && typeof failHandler == 'function') failHandler(res);
    }
  };

  /**
   * 
   * @param {请求地址} url 
   * @param {请求内容体} data 
   * @param {成功时的回调} handler 
   * @param {失败时的回调} failHandler 
   * @returns 
   */
  const post = function (url, data, handler, failHandler) {
    return beforeRequest(url, data, () => {
      uni.showLoading({
        title: '加载中...',
        mask: true
      });
      return uni.request({
        method: "POST",
        complete: function () {
          uni.hideLoading();
        },
        ...requestContent(url, data, handler, failHandler)
      })
    })
  };

  /**
   * 
   * @param {请求地址} url 
   * @param {请求内容体} data 
   * @param {成功时的回调} handler 
   * @param {失败时的回调} failHandler 
   * @returns 
   */
  const get = function (url, data, handler, failHandler) {

    return beforeRequest(url, data, () => {
      uni.showLoading({
        title: '加载中...',
        mask: true
      });
      return uni.request({
        method: "GET",
        complete: function () {
          uni.hideLoading();
        },
        ...requestContent(url, data, handler, failHandler)
      })
    })
  };

  /**
   * 
   * @param {请求地址} url 
   * @param {请求内容体} data 
   * @param {成功时的回调} handler 
   * @param {失败时的回调} failHandler 
   * @param {是否为纯静默请求/不弹窗提醒任何信息} slience
   * @returns 
   */
  const spost = function (url, data, handler, failHandler, slience = false) {

    return beforeRequest(url, data, () => {
      return uni.request({
        method: "POST",
        ...requestContent(url, data, handler, failHandler, slience)
      })
    })
  };

  /**
   * 
   * @param {请求地址} url 
   * @param {请求内容体} data 
   * @param {成功时的回调} handler 
   * @param {失败时的回调} failHandler 
   * @param {是否为纯静默请求/不弹窗提醒任何信息} slience
   * @returns 
   */
  const sget = function (url, data, handler, failHandler, slience = false) {

    return beforeRequest(url, data, () => {
      return uni.request({
        method: "GET",
        ...requestContent(url, data, handler, failHandler, slience)
      })
    })
  };

  // 同上，其中url不再补全，使用全路径
  const sgetCross = function (url, data, handler, failHandler, slience = false) {

    return beforeRequest(url, data, () => {
      return uni.request({
        method: "GET",
        url: url,
        success: res => {
          // 因为是全路径地址，一般不是本系统业务内的，不使用公用请求成功回调
          if(handler && typeof handler == 'function') handler(res);
        },
        fail: err => {
          console.log('err', url, err);
          handlerRequestError(url, data, handler, failHandler, slience);
        }
      })
    })
  };

  const handlerExpire = function() {
    // #ifdef H5
    window.location.replace('/', true);
    // #endif
    // #ifndef H5
    uni.reLaunch({
      url: '/pages/index/index'
    })
    // #endif
  };


  const alertError = function (text = '网络有点小问题请重试', handler = null) {
    uni.showModal({
      content: text,
      showCancel: false,
      success: function (res) {
        //do something;
        if (handler && typeof handler == 'function') {
          handler();
        }
      }
    })
  };

  export default {
    serviceInfo,
    platform_num,

    get,
    post,
    sget,
    spost,
    sgetCross,
  }
  