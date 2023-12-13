  // 导入公用配置
  import config from '@/config';
  // #ifdef H5
  // 引入微信sdk
  // import jwx from '@/common/wx-sdk';
  // #endif
  let globalData = config.globalData;
  const toastDelay = config.toastDelay;
  const serviceInfo = config.serviceInfo;
  const notAuthList = config.notAuthList;
  let validPromise = null;
  let isErrorRequest = false

  // 请求前拦截，检查token是否过期
  const beforeRequest = function (url, data, handler) {
    if (!notAuthList.includes(url)) {
      if(!validPromise) validPromise = new Promise(resolve => {
        //#ifndef H5
        keepTokenAlive(() => {
          resolve();
        })
        //#endif
        //#ifdef H5
        resolve();
        //#endif
      })
      // 需要捕捉请求进程的话需要放在then回调里
      return validPromise.then(() => {
        validPromise = null;
        if (handler && typeof handler == 'function') return handler();
      })
    } else {
      if (handler && typeof handler == 'function') return handler();
    }
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
    if (!uni.getStorageSync('accessKey')) config.setAccessKey()
    return {
      url: serviceInfo.url + url,
      header: {
        token: uni.getStorageSync('token').token || '',
        'access-key': uni.getStorageSync('accessKey') || '' // 请求头headers里access-key身份标识，所有api需携带此标识,各项目拥有独立且唯一的标识。
      },
      data: data,
      success: function (res) {
        if (res.data.error_code == 0) {
          requestFailList = []; //请求成功，那么不是在维护状态
          if (handler && typeof handler == 'function') handler(res.data);
        } else if (res.data.error_code == 1000101 || res.data.error_code == 1000102 || res.data.error_code == 500101 || res.data.error_code == 1500112) {
          handlerExpire(res.data.error_code);
        } else if (res.data.error_code == 404010 && !uni.getStorageSync('userInfo')) {
          handlerExpire(res.data.error_code);
        } else {
          if (res.data.error_code == 14001 && uni.getStorageSync('accessKey') == config.accessKey.H5 && url.match('webLogin')) {
            // 纯H5登录, 账号登录异常(密码输入错了/撞库), 直接返回错误让业务代码处理
            requestFailList = []; //请求成功，那么不是在维护状态
            alertError(res && res.data && res.data.msg ? res.data.msg : '看起来您的网络可能有点问题，请重试哦', function () {
              if (failHandler && typeof failHandler == 'function') failHandler(res);
            })
          } else {
            handlerRequestError(url, res, failHandler, slience, data);
          }
        }
      },
      fail: function (res) {
        console.log('fail', res);
        if(!res || res.errMsg !== 'request:fail abort') {
          handlerRequestError(url, res, failHandler, slience, data);
          console.log('err', url, res);
        }
        uni.request({
          url: serviceInfo.url + '/debug/record',
          method: "POST",
          data: {
            url,
            data: data,
            res: JSON.stringify(res),
            userInfo: uni.getStorageSync('userInfo') ? uni.getStorageSync('userInfo') : '无userInfo',
            requestFailList: requestFailList
          },
          complete: function () {},
        })
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
  const handlerRequestError = (url, res, failHandler, slience = false, requestData = {}) => {
    if(config.maintainFilePath == url) return; //当请求链接是维护嗅针时，不进行任何抛错也不执行任何业务
    requestFailList.push(new Date().getTime());

    validSystemStatus(() => {
      if(!slience) {
        alertError(res && res.data && res.data.msg ? res.data.msg : '看起来您的网络可能有点问题，请重试哦', function () {
          if (failHandler && typeof failHandler == 'function') failHandler(res);
        })
      } else {
        if (failHandler && typeof failHandler == 'function') failHandler(res);
      }
    })
  }

  const validSystemStatus = handler => {
    let shootValid = 0, shootEdge = false;  //shootValid有效失败次数 shootEdge是否已经到了失败次数边界值
    if(requestFailList.length >= config.requestFailSettings.num) {
      for(let i = requestFailList.length - 1; i > 0; i--) {
        let current = new Date().getTime();
        if(current - requestFailList[i] < config.requestFailSettings.time) shootValid++;  //在有效失败时间段内，+1
        if(shootValid >= config.requestFailSettings.num) {
          shootEdge = true;
          break;
        }
      }
    }
    // 已经命中了边界值
    if(shootEdge) {
      // 请求 运维文件
      sgetCross(config.maintainFilePath, null, res => {
        if(res && res.data) {
          if(res.data.is_maintain) {
            // 如果是运维状态跳转到运维页面
            uni.reLaunch({
              url: '/pages/maintain/maintain'
            });
          } else {
            if (handler && typeof handler == 'function') handler();
          }
        }
      }, err => {
        console.log('请求维护文件失败，原因：', err);
        if (handler && typeof handler == 'function') handler();
      }, true)
    } else {
      if (handler && typeof handler == 'function') handler();
    }
  }

  /**
   *
   * @param {请求地址} url
   * @param {请求内容体} data
   * @param {成功时的回调} handler
   * @param {失败时的回调} failHandler
   * @param {只显示loading，无其他弹窗提示} slience
   * @returns
   */
  const post = function (url, data, handler, failHandler, slience = false) {
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
   * @param {只显示loading，无其他弹窗提示} slience
   * @returns
   */
  const get = function (url, data, handler, failHandler, slience = false) {

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


  // 保存浏览足迹
  const saveStep = function(step) {
    let steps = uni.getStorageSync('steps') || [];
    steps.push(step);
    uni.setStorageSync('steps', steps);
    if(steps.length >= 10) {
      // 上传
      uploadSteps();
    }
  }
  // 上传足迹
  const uploadSteps = function() {
    let userInfo = uni.getStorageSync('userInfo');
    if(!userInfo) return;

    let steps = uni.getStorageSync('steps') || [];
    if(!steps || steps.length == 0) return;
    for(let i = 0; i < steps.length; i++) {
      if(userInfo.uid) steps[i].uid = userInfo.uid;
      if(userInfo.openid) steps[i].openid = userInfo.openid;
      if(userInfo.unionId) steps[i].unionId = userInfo.unionId;
    }
    spost('/behavior/record', {
      step: steps
    }, res => {
      uni.setStorageSync('steps', []);
    }, err => {
      console.log('出错了', err);
      if(steps.length > 20) uni.setStorageSync('steps', []);  //太多条记录没成功上传，直接清了，防止内存溢出，防止用户正确的记录无法上传
    }, true)
  }


  const handlerExpire = function(errorCode) {
    uni.removeStorageSync('token');
    uni.removeStorageSync('userInfo');

    uni.removeStorageSync('addresses');
    uni.removeStorageSync('shopcar');

    uni.removeStorageSync('userTypes');
    let storageTrigger = {
      address: false,
      shopcar: false,
      userType: false
    }
    uni.setStorageSync('storageTrigger', storageTrigger);

    // 接口账号出错
    // #ifdef H5
    failRequestDispose(errorCode, () => {
      uni.setStorageSync('redirect_url', window.location.pathname);
      window.location.replace('/', true);
    });
    // #endif
    // #ifndef H5
    uni.reLaunch({
      url: '/pages/index/index'
    })
    // #endif
  };

  // 微信登录获取code
  const uniLogin = function (handler) {

    uni.login({
      success: function (res) {
        let wechat = res;
        if (wechat.code) {
          //获取code
          globalData.code = wechat.code;
          if (handler && typeof handler == 'function') handler(wechat.code, handler);
        } else {
          // 没拿到微信code
          uni.showToast({
            title: '微信登录失败，请重试',
            icon: 'none',
            mask: true,
            duration: 3000
          })
        }
      }
    });
  };

  // 接口多次请求出错，弹窗提醒用户
  const failRequestDispose = function (errorCode, handler) {
    // 过滤3秒内的多次请求,过滤进入个人页，同时请求多个接口返回错误
    if (isErrorRequest) return
    isErrorRequest = true
    setTimeout(() => {
      isErrorRequest = false
    }, 3000)
    const exportWareValue = {
      key: 'failRequestTimes',
      errorCode,
      date: new Date().getTime()
    }
    let failRequestTimes = uni.getStorageSync('failRequestTimes') || []
    if (Array.isArray(failRequestTimes) && failRequestTimes.length > 0) {
      // 只保留一分钟内3次登录失败
      const inMinArr = failRequestTimes.filter(e => parseInt(e.date / 1000 / 60) == parseInt(new Date().getTime() / 1000 / 60))
      inMinArr.push(exportWareValue)
      if (inMinArr.length > 3) {
        uni.showToast({
          title: '登录失败，请稍后重试',
          icon: 'none',
          mask: true,
          duration: 3000,
          complete: () => {
            uni.removeStorageSync('redirect_url')
            setTimeout(() => {
              if (!(window.location.pathname == '/' || window.location.pathname == '/pages/index/index')) {
                // 过滤首页不断重复刷新
                window.location.replace('/', true);
              }
            }, 3000)
          }
        })
      } else {
        uni.setStorageSync('failRequestTimes', inMinArr)
        if(handler && typeof handler == 'function') handler();
      }
    } else {
      uni.setStorageSync('failRequestTimes', [exportWareValue])
      if(handler && typeof handler == 'function') handler();
    }
  }

   // 过期更新token，保持长期在线
  const keepTokenAlive = function (handler) {

    let token = uni.getStorageSync('token');
    let current = (new Date()).getTime();
    // #ifndef APP-PLUS
    if (!token || current - token.time > globalData.tokenExpire - globalData.keepAliveOffset) {
      uniLogin(code => {
        post('/wx/authNew', {
          code: code
        }, res => {
          let data = res.data;
          //#ifdef H5
          data.real_uid = data.uid;
          if(data.primary_uid) data.uid = data.primary_uid; //同步过，改写uid
          // #endif
          uni.setStorageSync('userInfo', data);
          let token = {
            token: data.token,
            time: new Date().getTime()
          }
          uni.setStorageSync('token', token);
          if (handler && typeof handler == 'function') handler();

        }, err => {
          if (handler && typeof handler == 'function') handler();
        })
      })

    } else {
      if (handler && typeof handler == 'function') handler();
    }
    // #endif
    // #ifdef APP-PLUS
    if (token && uni.getStorageSync('userInfo') && uni.getStorageSync('userInfo').uid && (current - token.time > globalData.tokenExpire - globalData.keepAliveOffset)) {
      //参数为客户端缓存中的userInfo, 其中必须带uid、header需要带过期的token和accessKey, 创建新token会强制让过往的所有token失效, 请注意多端同时运行的问题, 非必要请勿一直调用此接口
      post('/token/new', { uid: uni.getStorageSync('userInfo').uid }, res => {
        let data = res.data;
        let token = {
          token: data,
          time: new Date().getTime()
        }
        uni.setStorageSync('token', token);
        if (handler && typeof handler == 'function') handler();
      }, err => {
        console.log('err', err);
        if (handler && typeof handler == 'function') handler();
      }, true)
    } else if (token && (current - token.time > globalData.tokenExpire - globalData.keepAliveOffset - 10000)) {
      // 无参数, header带有效期内的token和accessKey即可
      post('/token/refresh', {}, res => {
        let data = res.data;
        let token = {
          token: data,
          time: new Date().getTime()
        }
        uni.setStorageSync('token', token);
        if (handler && typeof handler == 'function') handler();
      }, err => {
        if (handler && typeof handler == 'function') handler();
      }, true)
    } else {
      if (handler && typeof handler == 'function') handler();
    }
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
    get,
    post,
    sget,
    spost,
    sgetCross,

    serviceInfo,
    toastDelay,
    saveStep,
    uploadSteps
  }
