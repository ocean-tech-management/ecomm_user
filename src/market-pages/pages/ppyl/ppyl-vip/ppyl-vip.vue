<template>
  <view class="vip-page">
    <view class="page-turnback" :style="'top:' + nativeInfo.statusBarHeight + 'px'" @tap="returnBack">
      <image class="page-turnback-icon" src="/static/images/icon_return_white.png" mode="heightFix"></image>
    </view>
    <view class="vip-card-box">
      <view class="vip-card-decorate">
        <image class="vip-card-decorate-img" src="/static/images/ppyl/cvip_card_decorate.png"></image>
      </view>
      <view class="vip-card">
        <image class="vip-card-bg" src="/static/images/ppyl/cvip_card.png"></image>
        <view class="vip-card-content">
          <view class="vip-card-base">
            <view class="vip-card-baseinfo">
              <block>
                <view v-if="userInfo.c_vip_level == 1" class="vip-card-vipname">CVIP</view>
                <view v-else class="vip-card-vipname">暂未开通CVIP</view>
              </block>
              <view v-if="userInfo.c_vip_level == 1" class="vip-card-expiretime">将于{{userInfo.c_vip_time_out_time}}到期</view>
            </view>
            <view class="vip-card-ctrl" @tap="goToVipRecords">充值记录</view>
          </view>
          <view v-if="userInfo.c_vip_level == 1" class="vip-card-function">
            <view class="vip-card-function-info">
              <view class="vip-card-function-name">开启自动领红包</view>
              <view class="vip-card-function-tips">{{time}}后的订单红包可自动领取</view>
            </view>
            <view class="vip-card-function-trigger-box">
              <switch class="vip-card-function-trigger" :checked="userInfo.auto_receive_reward == 1" :disabled="updateAutoLoading" @change="toggleAutoGetReward" />
            </view>
          </view>
        </view>
      </view>

      <view class="vip-block">
        <view class="vip-block-title">CVIP特权</view>
        <view class="vip-benefits">
          <view class="vip-benefit">
            <image class="vip-benefit-img" src="/static/images/ppyl/benefits/no_ad.png"></image>
            <view class="vip-benefit-info">
              <view class="vip-benefit-name">广告特权</view>
              <view class="vip-benefit-tips">会员畅快抢购</view>
            </view>
          </view>
          <view class="vip-benefit">
            <image class="vip-benefit-img" src="/static/images/ppyl/benefits/auto_service.png"></image>
            <view class="vip-benefit-info">
              <view class="vip-benefit-name">智能托管</view>
              <view class="vip-benefit-tips">智能自动托管</view>
            </view>
          </view>
          <view class="vip-benefit">
            <image class="vip-benefit-img" src="/static/images/ppyl/benefits/reward.png"></image>
            <view class="vip-benefit-info">
              <view class="vip-benefit-name">一键领取红包</view>
              <view class="vip-benefit-tips">一键领取红包奖金</view>
            </view>
          </view>
          <view class="vip-benefit">
            <image class="vip-benefit-img" src="/static/images/ppyl/benefits/benefit.png"></image>
            <view class="vip-benefit-info">
              <view class="vip-benefit-name">独立开团</view>
              <view class="vip-benefit-tips">CVIP独享</view>
            </view>
          </view>
        </view>

      </view>


      <view v-if="packages.length > 0" class="vip-block">
        <view class="vip-block-title">会员套餐</view>
        <view class="vip-packages">
          <view v-for="(item, index) in packages" :class="{'vip-package': true, 'selected': selectPackage == index}" :key="index" @tap="updateSelectedPackage(index)">
            <view class="vip-package-title">{{item.name}}</view>
            <view class="vip-pageage-price">{{item.price}}</view>
            <view v-if="item.market_price && item.market_price != item.price" class="vip-pageage-price-unactive">{{item.market_price}}</view>
            <view class="vip-pageage-tips">{{item.desc}}</view>
          </view>
        </view>

        <view class="vip-buy-btn" @tap="tryBuyCVip">确认协议并支付</view>
        <view class="vip-buy-tips" @tap="goToUserAgreement">
          <text>开通前请阅读</text>
          <text class="vip-agreement">《{{systemName}}会员服务协议》</text>
        </view>
      </view>

    </view>
  </view>
</template>
<script>
import config from '@/config';
import moment from 'moment';
export default {
  data() {
    return {
      systemName: '',
      nativeInfo: {
        width: 375, //页面宽度，单位px
        statusBarHeight: 20,  //状态栏高度，有一般为20px
        menuBottom: 0,  //胶囊下方位置，单位px
        menuLeft: 0,  //胶囊左侧位置，单位px
        bannerOffset: 0,  //搜索栏加状态栏高度
        radio: 2,  //rpx缩放倍数
        bannerBottom: 440 //banner底部位置，单位px
      },

      time: '',

      userInfo: {},
      packages: [],

      updateAutoLoading: false,

      selectPackage: 1,

      paying: false
    }
  },
  onLoad() {
    this.systemName = config.name;
    if(uni.getStorageSync('nativeInfo')) {
      this.nativeInfo = uni.getStorageSync('nativeInfo');
    } else {
      this.trySystemInfo();
    }

    this.time = moment().format('YYYY.MM.DD HH:mm:ss');

    this.getCvipInfo();
  },
  methods: {
    trySystemInfo() {
      // #ifndef H5
      // 获取相关系统信息，为首页动效做准备
      let menu = uni.getMenuButtonBoundingClientRect();
      if(menu && menu.bottom) this.nativeInfo.menuBottom = menu.bottom;
      if(menu && menu.left) this.nativeInfo.menuLeft = menu.left;
      // #endif
      let system = uni.getSystemInfoSync();
      if(system && system.windowWidth) this.nativeInfo.width = system.windowWidth;
      if(system && system.statusBarHeight) this.nativeInfo.statusBarHeight = system.statusBarHeight;
      this.nativeInfo.radio = this.nativeInfo.width / 750;
      this.nativeInfo.bannerBottom = 880 * this.nativeInfo.radio;  //其中880是banner的高度880rpx
    },
    getCvipInfo() {
      let params = {
        uid: uni.getStorageSync('userInfo').uid
      }
      this.$get('/ppyl/CVIPInfo', params, res => {
        let cvip = res.data;
        this.userInfo = cvip.userInfo;
        this.packages = cvip.price;
        this.selectPackage = 0;
      })
    },
    toggleAutoGetReward() {
      if(this.updateAutoLoading) return;
      this.updateAutoLoading = true;
      let params = {
        uid: uni.getStorageSync('userInfo').uid,
        type: this.userInfo.auto_receive_reward
      }
      this.$post('/ppyl/autoReceiveSwitch', params, res => {
        this.userInfo.auto_receive_reward = this.userInfo.auto_receive_reward == 1 ? 2 : 1;
        setTimeout(() => {
          uni.showToast({
            title: `${params.type == 1 ? '开启' : '关闭'}成功`
          });
          this.updateAutoLoading = false;
        }, this.$toastDelay);
      }, err => {
        this.updateAutoLoading = false;
      })
    },
    updateSelectedPackage(val) {
      this.selectPackage = val;
    },

    tryBuyCVip() {
      if(this.paying) return;
      this.paying = true;
      let params = {
        uid: uni.getStorageSync('userInfo').uid,
        combo_sn: this.packages[this.selectPackage].combo_sn
      }
      this.$post('/ppyl/CVIPOrderCreate', params, res => {
        // #ifdef H5
        this.h5Pay(res);
        // #endif
        // #ifndef H5
        this.wxappPay(res);
        // #endif
      }, err => {
        this.paying = false;
      })
    },
    
    h5Pay(res) {
      // h5给钱（走微信sdk）
      if (this.$jwx && this.$jwx.isWechat()) {//检查是否是微信环境
        this.$jwx.wxpay(res.data, wxmsg => {
          this.paying = false;

          if(wxmsg == '{"errMsg":"chooseWXPay:ok"}') {
            setTimeout(() => {
              uni.showToast({
                title: '支付成功',
                mask: true,
                duration: 2000
              })
              setTimeout(() => {
                this.getCvipInfo();
              }, 1800);
            },this.$toastDelay)
          } else {
            setTimeout(() => {
              uni.showToast({
                title: '支付失败',
                icon: 'none',
                mask: true,
                duration: 2000
              })
            },this.$toastDelay)
          }
        }, err => {
          this.paying = false;
        })
      }
    },
    wxappPay(res) {
      // 小程序或者app给钱，走支付平台统一接口
      let data = res.data;
      uni.requestPayment({
        provider: 'wxpay',
        timeStamp: data.timeStamp,
        nonceStr: data.nonceStr,
        package: data.package,
        signType: data.signType,
        paySign: data.paySign,
        success: res => {
          
          this.paying = false;
          setTimeout(() => {
            uni.showToast({
              title: '支付成功',
              mask: true,
              duration: 2000
            })
            setTimeout(() => {
              this.getCvipInfo();
            }, 1800);
          },this.$toastDelay)

        },
        fail: err => {
          setTimeout(() => {
            uni.showToast({
              title: '支付失败',
              icon: 'none',
              mask: true,
              duration: 2000
            })
          },this.$toastDelay)
        }
      });
    },


    goToVipRecords() {
      uni.navigateTo({
        url: '/market-pages/pages/ppyl/vip-records/vip-records'
      })
    },
    goToUserAgreement() {
      uni.navigateTo({
        url: '/pages/user-agreement/user-agreement'
      })
    },


    returnBack() {
      uni.navigateBack({
        fail: err => {
          uni.switchTab({
            url: '/pages/index/index'
          })
        }
      });
    }
  }
}
</script>
<style lang="scss" scoped>
@import './ppyl-vip.scss';
</style>
<style lang="scss">
page,
uni-page {
  background-color: #191b1f;
}
</style>