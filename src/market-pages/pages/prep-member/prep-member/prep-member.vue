<template>
  <view class="flex-page">
    <block v-if="cardData.prep_sn">
    <!-- 空节点，做撑开空间用 -->
      <view style="height: 1rpx"></view>
      <view class="card-item">
        <view class="card-base-info">
          <block>
            <image 
              v-if="cardData.batch.cover_path && cardData.batch.cover_path !== ''"
              class="card-bg" 
              :src="cardData.batch.cover_path"
              webp
            ></image>
            <image 
              v-else
              class="card-bg" 
              src="/market-pages/static/images/gift_card/card_bg.png"
              webp
            ></image>
          </block>
          <view class="card-base-info-content">
            <view class="card-base-info-title">{{cardData.vip_name}}</view>
            <view class="card-sn"></view>
            <view class="card-date">有效期限：{{cardData.start_time}}至{{cardData.end_time}}</view>
          </view>
        </view>
      </view>
      
      <view v-if="cardData.remark && cardData.remark !== ''" class="card-desc">

        <view class="card-desc-title">说明：</view>
        <view class="card-desc-content">
          <text>{{cardData.remark}}</text>
        </view>
      </view>
      <view class="bind-box">
        <block v-if="cardData.invalid">
          <view v-if="cardData.no_start" class="ask-phone-btn disabled">
            未到可用时间
          </view>
          <view v-if="cardData.expire" class="ask-phone-btn disabled">
            已过期
          </view>
        </block>
        <block v-else>
          <button v-if="!userInfo.phone || userInfo.phone === ''" class="ask-phone-btn" open-type="getPhoneNumber" @getphonenumber="getUserPhone" @tap="getUserProfile">
            激活会员卡
          </button>
          <view v-else class="ask-phone-btn" @tap="bindMember">
            激活会员卡
          </view>
        </block>
      </view>
    </block>
  </view>
</template>
<script>
import moment from 'moment';
export default {
  data() {
    return {
      wxCode: '',
      userInfo: {},
      getUser: false,

      cardData: {}
    }
  },
  onLoad(options) {
    // #ifndef H5
    //                          -----非H5逻辑
    if(options.scene) {
      // 通过二维码进来的
      let sceneParams = options.scene.split('%26'); //0商品sn,1关联用户uid
      if(sceneParams[1] && sceneParams[1] != 'Nope') uni.setStorageSync('link_uid', sceneParams[1]);
      
      if(sceneParams[0] && sceneParams[0] != 'Nope') {
        this.getCardInfo(sceneParams[0]);
      } else {
        return uni.showModal({
          title: '提示',
          content: '该会员卡异常，无法使用',
          confirmText: '返回首页',
          success: res => {
            if(res.confirm) {
              uni.reLaunch({
                url: '/pages/index/index'
              })
            }
          }
        })
      }
    } else {
      return uni.showModal({
        title: '提示',
        content: '非正常进入，可点击“返回首页”回到系统首页',
        confirmText: '返回首页',
        success: res => {
          if(res.confirm) {
            uni.reLaunch({
              url: '/pages/index/index'
            })
          }
        }
      })
    }
    // #endif

    let userInfo = uni.getStorageSync('userInfo');
    if(userInfo.uid) this.userInfo = userInfo;
    // #ifdef H5
    // 首先检查进来时有没有带code，有的话是微信登陆       ----H5逻辑
    if(!options.code) {
      // 无code检查是否有用户缓存
      if(!userInfo.uid) {
        // 无缓存去授权登陆
        var uri = encodeURIComponent(window.location.href.split('#')[0]); //获取当前url然后传递给后台获取授权和签名信息  
        if (this.$jwx && this.$jwx.isWechat()) {//检查是否是微信环境
          this.$jwx.initJssdk(data => {
            window.location.replace(`https://open.weixin.qq.com/connect/oauth2/authorize?appid=${data.appId}&redirect_uri=${uri}&response_type=code&scope=snsapi_userinfo&state=STATE#wechat_redirect`);
          })
        }
        return;
      } else {
        // 有缓存直接使用缓存
        this.getAuth(this.wxCode, this.getWxCode());  //需要再走一遍获取wxcode，code是即用即弃的，必须得重新拿
      }
      
    } else {
      // 有code检查是不是被使用过了
      if(options.code != uni.getStorageSync('code')) {
        // 没使用的话重新走授权
        this.getAuth(options.code, this.getWxCode());
      } else {
        this.getAuth(this.wxCode, this.getWxCode());  //需要再走一遍获取wxcode，code是即用即弃的，必须得重新拿
      } 
    }
    // #endif

    // #ifndef H5
    //                          -----非H5逻辑
    this.getWxCode(() => {
      this.getAuth(this.wxCode, this.getWxCode());  //需要再走一遍获取wxcode，code是即用即弃的，必须得重新拿
    });
    // #endif
  },
  methods: {
    getCardInfo(prep_sn) {
      let params = {
        prep_sn: prep_sn
      }
      this.$get('/prep/info', params, res => {
        this.cardData = res.data;
        // 未开始或者过期
        if(moment().diff(this.cardData.start_time) < 0) {
          this.cardData.invalid = true;
          this.cardData.no_start = true;
        } else if(moment().diff(this.cardData.end_time) > 0) {
          this.cardData.invalid = true;
          this.cardData.expire = true;
        }
        this.cardData.start_time = moment(this.cardData.start_time).format('YYYY年MM月DD日');
        this.cardData.end_time = moment(this.cardData.end_time).format('YYYY年MM月DD日');
      })
    },

    getAuth(code, handler) {
      let params = {
        code: code
      }
      if(uni.getStorageSync('link_uid')) params.link_user = uni.getStorageSync('link_uid');
      this.$post('/wx/authNew', params, res => {
        if(res.data) {
          let data = res.data;
          //#ifdef H5
          data.real_uid = data.uid;
          if(data.primary_uid) data.uid = data.primary_uid; //同步过，改写uid
          // #endif
          this.userInfo = data;
          uni.setStorageSync('userInfo', data);
        }
        if(handler && typeof handler == 'function') handler();
      }, err => {
        if(handler && typeof handler == 'function') handler();
      })
    },
    getWxCode(handler) {
      uni.login({
        success: res => {
          let wechat = res;
          this.wxCode = wechat.code;
          if(handler && typeof handler == 'function') handler();
        }
      });
    },
    getUserPhone(e) {
      if(!this.getUser) return uni.showToast({
        title: '请重新授权',
        icon: 'none'
      }); //如果获取用户信息已经失败了，那就直接不走下面的步骤啦
      let data = e.detail;
      if(data.errMsg == 'getPhoneNumber:ok') {
        let params = {
          code: this.wxCode,
          crypt: {
            encryptedData: data.encryptedData,
            iv: data.iv
          },
          needUpdate: true
        }
        
        this.$post('/user/cryptPhoneAndUpdate', params, res => {
          if(res.data && res.data.cryptInfo && res.data.cryptInfo.purePhoneNumber) {
            this.userInfo.phone = res.data.cryptInfo.purePhoneNumber;
          }
          this.bindMember();
        }, err => {
          this.getWxCode();
        })
      } else {
        this.getWxCode();
        uni.showToast({
          title: '未授权成功请重试',
          icon: 'none',
          mask: true
        })
      }
    },
    getUserProfile(e) {
      if(!this.userInfo.need_auth) return this.getUser = true;  //如果已经授权，就不再问用户拿信息啦
      this.getUser = false;
      uni.getUserProfile({
        desc: '需授权才可正确激活会员卡',
        success: e => {
          if(e.errMsg == 'getUserProfile:ok') {
            let params = {
              userProfile: e.userInfo
            };
            params.code = this.wxCode;
            
            this.$post('/wx/authNew', params, res => {
              let data = res.data;
              //#ifdef H5
              data.real_uid = data.uid;
              if(data.primary_uid) data.uid = data.primary_uid; //同步过，改写uid
              // #endif
              this.userInfo = data;
              uni.setStorageSync('userInfo', data);
              uni.setStorageSync('token', {
                token: data.token,
                time: new Date().getTime()
              })
              uni.setStorageSync('code', this.wxCode);
              this.getWxCode(); //重新获取一个code防止code复用
              this.getUser = true;

            }, err => {
              uni.showModal({
                title: '提示',
                content: '激活会员卡失败，请正确提供身份授权',
                showCancel: false
              });
              this.getWxCode();
            })
          }
        },
        fail: err => {
          console.log(err)
          uni.showModal({
            title: '提示',
            content: '获取微信授权信息失败，请重试',
            showCancel: false
          });
          this.getWxCode();
        }
      })
    },
    bindMember() {
      if(this.cardData.prep_bind_phone && this.cardData.prep_bind_phone !== this.userInfo.phone) {
        return uni.showModal({
          title: '提示',
          content: '您不是这张会员卡的拥有者',
          showCancel: false
        });
      }
      uni.showModal({
        title: '提示',
        content: '确定激活这张会员卡？',
        success: res => {
          if(res.confirm) {
            let params = {
              uid: this.userInfo.uid,
              prep_sn: this.cardData.prep_sn
            }
            this.$post('/prep/activation', params, res => {
              uni.showToast({
                title: '激活成功',
                mask: true
              })
              let url = '/pages/index/index';
              if(this.cardData.present_lottery == 1 && this.cardData.lottery_code) {
                // 绑定了抽奖
                url = `/market-pages/pages/lottery/entrance/entrance?code=${this.cardData.lottery_code}`
              }
              setTimeout(() => {
                uni.reLaunch({
                  url: url
                });
              }, 1500)
            }, err => {
              this.getWxCode();
            })
          }
        }
      })
      
    }
  }
}
</script>
<style lang="scss" scoped>
  @import 'prep-member.scss';
</style>