import config from '@/config';
import { getClient } from '@/common/clientShare';
var jweixin = require('jweixin-module');
var origin = window.location.origin + '/';
export default {
  //判断是否在微信中
  isWechat: function () {
    var ua = window.navigator.userAgent.toLowerCase();
    if (ua.match(/micromessenger/i) == 'micromessenger') {
      //console.log('是微信客户端')
      return true;
    } else {
      //console.log('不是微信客户端')
      return false;
    }
  },
  initJssdk: function (callback) {
    // var uri = encodeURIComponent(window.location.href.split('#')[0]); //获取当前url然后传递给后台获取授权和签名信息
    var uri = window.location.href.split('#')[0];
    uni.request({
      url: '/api/v1/wx/config', //你的接口地址
      header: {
        'access-key': config.accessKey['H5-WEIXIN']
      },
      method: 'POST',
      data: {
        url: uri
      },
      success: (res) => {
        //返回需要的参数appId,timestamp,noncestr,signature等
        //注入config权限配置
        let data = res.data.data;
        jweixin.config({
          debug: false,
          appId: data.appId,
          timestamp: data.timeStamp,
          nonceStr: data.nonceStr,
          signature: data.signature,
          jsApiList: [ //这里是需要用到的接口名称
            "onMenuShareTimeline", //分享给好友
            "onMenuShareAppMessage", //分享到朋友圈
            "onMenuShareQQ", //分享到QQ
            "updateTimelineShareData",
            "updateAppMessageShareData",

            "hideMenuItems", //隐藏彩蛋

            'checkJsApi', //判断当前客户端版本是否支持指定JS接口
            'getLocation', //获取位置
            'openLocation', //打开位置
            'scanQRCode', //扫一扫接口
            'chooseWXPay', //微信支付
            'chooseImage', //拍照或从手机相册中选图接口
            'previewImage', //预览图片接口
            'uploadImage' //上传图片
          ]
        });

        if (callback) {
          callback(data);
        }

      }
    })
  },

  readySdk: function(callback) {
    if (!this.isWechat()) {
      //console.log('不是微信客户端')
      return;
    }
    jweixin.ready(function () {
      if(callback && typeof callback == 'function') callback();
    })
  },
  // 初始化分享板块
  initShare: function (data = {}) {
    if (!this.isWechat()) {
      //console.log('不是微信客户端')
      return;
    }
    let userInfo = uni.getStorageSync('userInfo');
    let distributeParams = `?link_uid=${userInfo.uid}`;
    if (data.link && data.params) distributeParams = `&link_uid=${userInfo.uid}`;
    jweixin.ready(async () => {
      const clientData = await getClient()
      console.log('clientData', clientData);
      let shareData = {
        title: data.title || clientData.share_title || config.written.h5ShareTitle,
        desc: data.desc || clientData.share_desc || config.written.h5ShareDesc, //这里请特别注意是要去除html
        link: (data.link || origin) + distributeParams,
        imgUrl: data.imgUrl || (clientData.share_image && clientData.share_image.indexOf('http') > -1 ? clientData.share_image : (origin + '/static/images/share.jpg'))
      };
      console.log('shareData', shareData);
      // jweixin.onMenuShareAppMessage(shareData);
      // jweixin.onMenuShareTimeline(shareData);
      // jweixin.onMenuShareQQ(shareData);


      jweixin.updateTimelineShareData(shareData);
      jweixin.updateAppMessageShareData(shareData);
    });
  },

  // 更新分享板块
  updateShare: function (data = {}) {
    if (!this.isWechat()) {
      return;
    }

    let userInfo = uni.getStorageSync('userInfo');
    let distributeParams = `?link_uid=${userInfo.uid}`;
    if (data.link && data.params) distributeParams = `&link_uid=${userInfo.uid}`;
    let shareData = {
      title: data.title || config.h5ShareTitle,
      desc: data.desc || config.h5ShareDesc, //这里请特别注意是要去除html
      link: (data.link || origin) + distributeParams,
      imgUrl: data.imgUrl || (origin + '/static/images/share.jpg')
    };
    // jweixin.onMenuShareAppMessage(shareData);
    // jweixin.onMenuShareTimeline(shareData);
    // jweixin.onMenuShareQQ(shareData);


    jweixin.updateTimelineShareData(shareData);
    jweixin.updateAppMessageShareData(shareData);
  },

  // 隐藏复制链接
  hideMenu: function () {
    if (!this.isWechat()) {
      return;
    }
    jweixin.ready(function () {
      jweixin.hideMenuItems({
        menuList: [
          "menuItem:copyUrl",
          "menuItem:originPage",
          "menuItem:openWithQQBrowser",
          "menuItem:openWithSafari"
        ]
      });
    });
  },


  //在需要定位页面调用
  getlocation: function (callback) {
    if (!this.isWechat()) {
      //console.log('不是微信客户端')
      return;
    }
    this.initJssdk(function (res) {
      jweixin.ready(function () {
        jweixin.getLocation({
          type: 'gcj02', // 默认为wgs84的gps坐标，如果要返回直接给openLocation用的火星坐标，可传入'gcj02'
          success: function (res) {
            // console.log(res);
            callback(res)
          },
          fail: function (res) {
            console.log(res)
          },
          // complete:function(res){
          //     console.log(res)
          // }
        });
      });
    });
  },
  openlocation: function (data, callback) { //打开位置
    if (!this.isWechat()) {
      //console.log('不是微信客户端')
      return;
    }
    this.initJssdk(function (res) {
      jweixin.ready(function () {
        jweixin.openLocation({ //根据传入的坐标打开地图
          latitude: data.latitude,
          longitude: data.longitude
        });
      });
    });
  },
  chooseImage: function (callback) { //选择图片
    if (!this.isWechat()) {
      //console.log('不是微信客户端')
      return;
    }
    //console.log(data);
    this.initJssdk(function (res) {
      jweixin.ready(function () {
        jweixin.chooseImage({
          count: 1,
          sizeType: ['compressed'],
          sourceType: ['album'],
          success: function (rs) {
            callback(rs)
          }
        })
      });
    });
  },

  scanCode: function (callback) { //选择图片
    if (!this.isWechat()) {
      //console.log('不是微信客户端')
      return;
    }
    //console.log(data);
    this.initJssdk(function (res) {
      jweixin.ready(function () {
        jweixin.scanQRCode({
          needResult: 1, // 默认为0，扫描结果由微信处理，1则直接返回扫描结果，
          scanType: ["qrCode","barCode"], // 可以指定扫二维码还是一维码，默认二者都有
          success: function (rs) {
            callback(rs)
          }
        });
      });
    });
  },

  //微信支付
  wxpay: function (data, callback, errCallback) {
    if (!this.isWechat()) {
      //console.log('不是微信客户端')
      return;
    }

    jweixin.chooseWXPay({
      timestamp: data.timeStamp, // 支付签名时间戳，注意微信jssdk中的所有使用timestamp字段均为小写。但最新版的支付后台生成签名使用的timeStamp字段名需大写其中的S字符
      nonceStr: data.nonceStr, // 支付签名随机串，不长于 32 位
      package: data.package, // 统一支付接口返回的prepay_id参数值，提交格式如：prepay_id=\*\*\*）
      signType: data.signType, // 签名方式，默认为'SHA1'，使用新版支付需传入'MD5'
      paySign: data.paySign, // 支付签名
      success: function (res) {
        // console.log(res);
        setTimeout(() => {
          callback('success' + res);
          console.log('success' + res);
        }, 400)
      },
      fail: function (res) {
        if (errCallback && typeof errCallback == 'function') errCallback('err' + res)
        console.log('err' + res);
      },
      complete: function (res) {
        setTimeout(() => {
          callback(JSON.stringify(res));
          console.log('complete' + res);
        }, 400)
      }
    });

  }
}