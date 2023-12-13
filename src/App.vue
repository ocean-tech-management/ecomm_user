<script>

  // #ifdef H5
  import jwx from '@/common/wx-sdk';
  // #endif
  // #ifdef APP-PLUS
  import wgtUpdate from '@/common/wgtUpdate';
  // #endif
  // #ifdef MP-WEIXIN
  // let livePlayer = requirePlugin('live-player-plugin')
  // #endif
	export default {
		onLaunch(options) {
      // // 生产环境下才使用的代码
      // if (process.env.NODE_ENV === 'production') {
      //   // #ifdef MP-WEIXIN
      //   // 当且仅当微信小程序环境下使用数据预拉取
      //   if(wx.getStorageSync('firstPageData')) wx.removeStorageSync('firstPageData'); //重新启动发现了缓存，认为是过时的
      //   let token = wx.getStorageSync('token') && wx.getStorageSync('token').token ? wx.getStorageSync('token').token : 'firstInit';

      //   wx.setBackgroundFetchToken({
      //     token: token
      //   })

      //   wx.getBackgroundFetchData({
      //     fetchType: 'pre',
      //     success(res) {
      //       let data = JSON.parse(res.fetchedData);
      //       if(data && data.error_code == 0) wx.setStorageSync('firstPageData', data.data);
      //     },
      //     fail: err => {
      //       console.log(err);
      //     }
      //   })
      //   // #endif
      // }


      // #ifdef MP
      // 当且仅当小程序环境才检查是否需要更新
      let updateManager = uni.getUpdateManager();
      updateManager.onCheckForUpdate((res) => {
        console.log('有无新版本，', res.hasUpdate)
      })

      updateManager.onUpdateReady(() => {
        uni.showModal({
          title: '更新提示',
          content: '检测到新版本，是否重启应用？',
          success: function (confirm) {
            if (confirm.confirm) {
              updateManager.applyUpdate();
            }
          }
        })
      })


      // 清除旧有待跳转缓存
      uni.removeStorageSync('shareSpu');
      uni.removeStorageSync('redirect');
      uni.removeStorageSync('failRequestTimes');


      // 清除海外购提示
      uni.removeStorageSync('hasAttachTips');

      // 清除预跳转链接
      if(uni.getStorageSync('authOriginPage')) uni.removeStorageSync('authOriginPage');

      // #endif



      // 清除没有uid的缓存和登录的微信数据包缓存
      if(!uni.getStorageSync('userInfo') || !uni.getStorageSync('userInfo').uid) {
        uni.removeStorageSync('userInfo');
        uni.removeStorageSync('h5SignData');
      }


      let storageTrigger = {
        address: false,
        shopcar: false,
        userType: false
      }
      uni.setStorageSync('storageTrigger', storageTrigger);


      // #ifdef H5
      let shareParams = this.getParams();
      if (jwx && jwx.isWechat()) {//检查是否是微信环境
        // 清除超A
        uni.removeStorageSync('_thirdEnv');
        jwx.initJssdk(data => {
          jwx.initShare(shareParams);
          jwx.hideMenu();
        })
      } else {
        // 因为超a，所以需要额外兼容
        // 多做几层异步/延时，确保能把超a的信息给加进去
        setTimeout(() => {
          this.$nextTick(() => {
            let _thirdEnv = uni.getStorageSync('_thirdEnv');
            if (options.query['_thirdEnv']) {
              // 这是超A
            } else if(_thirdEnv != 'superApp') {
              // 纯h5
              uni.removeStorageSync('_thirdEnv');
              // window.location.replace('/pages/not-wechat/not-wechat');
            }
          })
        }, 150)
      }
      // #endif
      // #ifdef APP-PLUS
      uni.removeStorageSync('login')
      wgtUpdate.sCheckVersion();
      // #endif
			console.log('App Launch')
    },
		onShow: function(options) {
			console.log('App Show');

      if(options.scene) uni.setStorageSync('scene', options.scene);

      let step = {
        entrance_type: options.scene || '',
        type: 1,
        main_type: 1,
        enter_time: new Date().getTime()
      }
      if(uni.getStorageSync('link_uid')) {
        step.entrance_link_user = uni.getStorageSync('link_uid');
      }
      this.$saveStep(step);

      // #ifdef APP-PLUS
    let accessKey = uni.getStorageSync('accessKey');
    if((!uni.getStorageSync('userInfo') || !uni.getStorageSync('userInfo').uid) && accessKey === this.$accessKey['APP-PLUS']) {
      const pages = getCurrentPages();
      if (pages && pages.length > 0) {
        let page = pages[pages.length - 1];
        const pageView = page && page.$getAppWebview();
        if (pageView && pageView.__uniapp_route != 'pages/login/login') {
          uni.reLaunch({
            url: '/pages/login/login'
          })
        }
      } else {
        uni.reLaunch({
          url: '/pages/login/login'
        })
      }
    }
    // #endif


      // // #ifdef MP-WEIXIN
      // // 只有微信小程序才检查直播间进入
      // // 分享卡片/订阅消息/扫码二维码/广告/朋友圈等场景才能调用getShareParams接口获取以下参数
      // const sceneList = [1007, 1008, 1014, 1044, 1045, 1046, 1047, 1048, 1049, 1073, 1154, 1155]
      // if (sceneList.includes(options.scene) && livePlayer) {
      //   livePlayer.getShareParams()
      //     .then(res => {
      //       // 房间号
      //       console.log('get room id', res.room_id)
      //       // 用户openid
      //       console.log('get openid', res.openid)
      //       // 分享者openid，分享卡片进入场景才有
      //       console.log('get share openid', res.share_openid)
      //       // 开发者在跳转进入直播间页面时，页面路径上携带的自定义参数，这里传回给开发者
      //       console.log('get custom params', res.custom_params)
      //       // 换uid
      //       let params = {
      //         openid: res.share_openid
      //       }
      //       this.$get('/wx/checkUser', params, res => {
      //         console.log('获取到用户uid', res.data);
      //         if(res.data) uni.setStorageSync('link_uid', res.data);
      //       })
      //     }).catch(err => {
      //       console.log('get share params', err)
      //     })
      // }
      // // #endif
		},
		onHide: function() {
			console.log('App Hide');
      this.$uploadSteps();
    },
    methods: {
      getParams() {
        let url = window.location.origin;
        let pageInfo = encodeURIComponent(window.location.pathname + window.location.search);
        let shareParams = {};
        if(
            window.location.pathname != '/' &&
            window.location.pathname != '/pages/index/index' &&
            window.location.pathname != '/pages/categories/categories' &&
            window.location.pathname != '/pages/crowd-fundings/crowd-fundings' &&
            window.location.pathname != '/pages/shopcar/shopcar' &&
            window.location.pathname != '/pages/me/me'
        ) {
          shareParams = {
            link: `${window.location.origin}?redirect=${pageInfo}`,
            params: true
          }
        }
        return shareParams;
      }
    },
    watch:{
      $route: {
        handler(to, from){
          // #ifdef H5
          let accessKey = uni.getStorageSync('accessKey');
          if (accessKey === this.$accessKey.H5 &&
              (!uni.getStorageSync('userInfo') || !uni.getStorageSync('userInfo').uid) &&
              to.path !== '/pages/login/login' &&
              to.path !== '/pages/maintain/maintain'
          ) {
            // 纯H5-无登录状态-跳到登录页
            window.location.replace('/pages/login/login');
          }
          if(to.path != '/pages/index/index') {
            // 首页那边有自己的判断
            if (jwx && jwx.isWechat()) {//检查是否是微信环境
            } else {
              // 不是微信+不是首页/提示页，那就再判定是不是超a，不是就跳转到提示页
              let _thirdEnv = uni.getStorageSync('_thirdEnv');
              if(_thirdEnv != 'superApp') {
                if(to.path != '/pages/not-wechat/not-wechat') {
                  // window.location.replace('/pages/not-wechat/not-wechat');
                }
              }
            }
          }


          // 做微信授权的兼容
          let isiOS = !!navigator.userAgent.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/)
          if(
              to.type &&
              to.path != '/pages/product-detail/product-detail' &&
              to.path != '/pages/pre-order/pre-order' &&
              to.path != '/pages/pay-result/pay-result'
          ) {
            let shareParams = this.getParams();
            if (jwx && jwx.isWechat()) {//检查是否是微信环境
              if(!isiOS) {
                // 安卓机需要重新初始化sdk，不然分享会有问题
                jwx.initJssdk(data => {
                  jwx.initShare(shareParams);
                  jwx.hideMenu();
                })
              } else {
                jwx.initShare(shareParams);
                jwx.hideMenu();
              }
            }
          }

          // #endif
        },
        immediate: true
      }
    }
	}
</script>

<style lang="scss">
/* #ifndef APP-PLUS-NVUE */
/* uni.css - 通用组件、模板样式库，可以当作一套ui库应用 */
@import './style/uni.css';

/* #endif*/
@import './style/style.scss';
</style>
