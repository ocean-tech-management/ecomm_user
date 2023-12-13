<template>
  <view class="flex-page">

    <!-- 页面内容 -->
    <view class="flex-page-content">

      <scroll-view scroll-y class="tab-page-scroll">
        <view class="pay-result-banner">
          <view class="pay-result-content">
            <image class="pay-success-icon" src="/static/images/icon_pay_success.png"></image>
            <view class="pay-result-title">{{ type == 1 ? '下单成功' : '下单失败' }}</view>
            <!-- 成功 -->
            <block v-if="type == 1">
              <view v-if="preOrderInfo.order_type != 4" class="pay-result-tips">我们的小哥哥正在马不停蹄的为您配货</view>
              <view v-else class="pay-result-tips">未拼中订单，随时可退还您的本金</view>
            </block>
            <!-- 失败未过期 -->
            <view v-if="preParams.order_sn && type == 2" class="pay-result-tips">
              <block v-if="preOrderInfo.order_type != 4">请在<text class="repay-timeout">{{ timeLimit }}</text>内完成付款哦
              </block>
              <block v-else>未成功付款，请尝试重新下单</block>
            </view>
            <view v-if="!preParams.order_sn && type == 2" class="pay-result-tips">
              生成订单有误，请尝试重新下单
            </view>
            <!-- 失败已过期 -->
            <!-- <view v-if="type == 2 && order.order_status == 1" class="pay-result-tips">
              订单已失效，请重新下单购买
            </view> -->
            <view class="pay-result-btns">
              <view v-if="preParams.order_sn && preOrderInfo.order_type != 4" class="pay-result-btn" @tap="goToOrder">查看订单
              </view>
              <!-- 拼拼订单不让重新支付 -->
              <view v-if="preParams.order_sn && type == 2 && preOrderInfo.order_type != 4" class="pay-result-btn primary"
                :class="{ 'disabled': !couldPay }" @tap="repay">重新支付</view>
              <!-- <view v-if="preOrderInfo.order_type == 4 && preParams.activity_sn" class="pay-result-btn primary" @tap="redirectToPpylTeam">查看订单</view> -->
            </view>
          </view>
        </view>

        <view class="order-user-bar">
          <view class="order-user-infos">
            <view class="order-user-base-info">{{ preOrderInfo.shipping_phone }} {{ preOrderInfo.shipping_name }}</view>
            <view class="order-user-info">{{ preOrderInfo.shipping_address }}</view>
            <view class="order-user-realpay">
              实付：<text v-if="!isCrowdActivitySign">￥</text>{{ preOrderInfo.real_pay_price || '0.00' }}
            </view>
          </view>
        </view>

        <!-- <view class="pay-result-other">
          <view class="kv-item">
            <view class="kv-key">查看更多拼团商品</view>
            <view class="kv-val"></view>
            <image class="kv-arrow" src="/static/images/more.png"></image>
          </view>
        </view> -->


      </scroll-view>

    </view>
    <view class="bottom-btns">
      <view v-if="preOrderInfo.order_type != 4" class="bottom-btn" @tap="toIndex">
        返回首页
      </view>
      <view v-else class="bottom-btn" @tap="toPpylOrders">返回拼团订单</view>
    </view>
  </view>
</template>
<script>
import moment from 'moment';
  export default {
    data() {
      return {
        type: 1, //1成功2失败
        order: {},
        preOrderInfo: {},
        preParams: null,
        isPaying: false,
        timeLimit: '15分钟',

        isCrowdActivitySign: false
      }
    },
    onShareAppMessage() {
      let shareInfo = this.$getShareInfo();
      return shareInfo;
    },
    onLoad(options) {
      if(options.type) this.type = options.type;
      this.preOrderInfo = uni.getStorageSync('preOrderInfo');
      this.preParams = uni.getStorageSync('preParams');
      if(!this.preOrderInfo || !this.preParams) {
        uni.reLaunch({
          url: '/pages/index/index'
        });
      }
      uni.removeStorageSync('preOrderInfo');

      if (this.preOrderInfo.goods && this.preOrderInfo.goods.every(e => e.gift_type && e.gift_type > -1)) {
        // -1-不赠送 1-集品豆 2-健康豆 3-集品券
        this.isCrowdActivitySign = true;
      } else if (this.preOrderInfo.pay_type == 7) {
        // 集品豆专区
        this.isCrowdActivitySign = true;
      }


      let coldDownStamp = moment.duration(this.preOrderInfo.expireTimestamp, 'seconds');

      let coldDownHours = coldDownStamp.hours();
      let coldDownMinutes = coldDownStamp.minutes();
      this.timeLimit = `${coldDownHours > 0 ? (coldDownHours + '小时') : ''}${coldDownMinutes || 1}分钟`;

      // #ifdef H5
      let isiOS = !!navigator.userAgent.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/);
      if(!isiOS) {
        if (this.$jwx && this.$jwx.isWechat()) {//检查是否是微信环境
          this.$jwx.initJssdk(data => {
            this.$jwx.hideMenu();
          })
        }
      }
      if (this.$jwx && this.$jwx.isWechat()) {//检查是否是微信环境
        let url = window.location.origin;
        this.$jwx.readySdk(() => {
          this.couldPay = true;
        })
        this.$jwx.initShare();
      }
      // #endif
      // #ifndef H5
      this.couldPay = true;
      // #endif

      // #ifdef MP-WEIXIN
      // 微信小程序订阅消息
      if(uni.getStorageSync('subscribeReject') && this.type == 1) {
        // 存在不接受局部/全部消息的情况
        if(uni.getStorageSync('subscribeReject') == 'part') {
          uni.showModal({
            title: '提示',
            content: '您有部分消息不接收或默认禁止该类别的消息推送，导致部分服务消息无法推送给您。为了后面您更好的体验，建议您前往 设置->订阅消息 开启相关服务消息的推送。',
            confirmText: '前往设置',
            success: res => {
              if(res.confirm) {
                uni.openSetting();
              }
            }
          })
        } else {
          uni.showModal({
            title: '提示',
            content: `您关闭了${this.$name}的消息提醒服务，无法给您推送对应的服务消息。为了后面您更好的体验，建议您前往 设置->订阅消息 开启服务消息的推送。`,
            confirmText: '前往设置',
            success: res => {
              if(res.confirm) {
                uni.openSetting();
              }
            }
          })
        }
        uni.removeStorageSync('subscribeReject');
      }
      // #endif
    },
    methods: {
      toIndex() {
        uni.reLaunch({
          url: '/pages/index/index'
        })
      },
      toPpylOrders() {
        uni.redirectTo({
          url: `/market-pages/pages/ppyl/orders/orders`
        })
      },
      goToOrder() {
        uni.redirectTo({
          url: `/pages/order-detail/order-detail?sn=${this.preParams.order_sn}`
        })
      },
      redirectToPpylTeam() {
        uni.redirectTo({
          url: `/market-pages/pages/ppyl/ppyl-team/ppyl-team?code=${this.preOrderInfo.area_code}&sn=${this.preParams.activity_sn}`
        })
      },

      repay() {
        let time = moment().format('x');
        if(time - this.preOrderInfo.time + 10 > 0) {
          // 提前10秒过期
          return uni.showToast({
            title: '订单已过期',
            mask: true,
            icon: 'none'
          })
        }

        // #ifdef H5
        let disabled = !this.couldPay;
        if(disabled) {
          uni.showToast({
            title: '加载配置中，请等几秒后再尝试支付哦',
            mask: true,
            icon: 'none'
          })
          return;
        }
        // #endif

        if(this.isPaying) return;
        this.isPaying = true;

        let params = {
          order_sn: this.preParams.order_sn,
          uid: uni.getStorageSync('userInfo').uid
        };
        this.$post('/order/again', params, res => {
          // #ifdef H5
          if (this.$jwx && this.$jwx.isWechat()) {//检查是否是微信环境
            this.$jwx.wxpay(res.data, wxmsg => {
              if(wxmsg == '{"errMsg":"chooseWXPay:ok"}') {

                setTimeout(() => {
                  uni.showToast({
                    title: '支付成功',
                    mask: true,
                    duration: 2000
                  })
                  this.type = 1;
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
            }, err => {})
          }
          // #endif
          // #ifndef H5
          let data = res.data;
          uni.requestPayment({
            provider: 'wxpay',
            timeStamp: data.timeStamp,
            nonceStr: data.nonceStr,
            package: data.package,
            signType: data.signType,
            paySign: data.paySign,
            success: res => {
              if(res.errMsg == 'requestPayment:ok') {
                setTimeout(() => {
                  uni.showToast({
                    title: '支付成功',
                    mask: true,
                    duration: 2000
                  })
                  this.type = 1;
                }, 180);

                // 微信小程序订阅消息
                // #ifdef MP-WEIXIN
                uni.requestSubscribeMessage({
                  tmplIds: data.templateId,
                  success: res => {
                    console.log(res);
                    uni.getSetting({
                      withSubscriptions: true,
                      success: setting => {
                        let subscribeList = setting.subscriptionsSetting;
                        if(!subscribeList.mainSwitch || Object.values(subscribeList.itemSettings).length > 0) {
                          let items = subscribeList.itemSettings, itemValues = [];  //订阅消息列表， 订阅消息默认值
                          if(items) itemValues = Object.values(items);
                          if(!subscribeList.mainSwitch || itemValues.includes('reject')) {
                            uni.showModal({
                              title: '提示',
                              content: '您有部分消息不接收或默认禁止该类别的消息推送，导致部分服务消息无法推送给您。为了后面您更好的体验，建议您前往 设置->订阅消息 开启相关服务消息的推送。',
                              success: res => {
                                if(res.confirm) {
                                  uni.openSetting();
                                }
                              }
                            })
                          }
                        }

                      }
                    })
                  },
                  fail: err => {
                    console.log('err',err);
                    if(err.errMsg == 'requestSubscribeMessage:fail The main switch is switched off') {
                      // 用户关闭了消息订阅
                      uni.showModal({
                        title: '提示',
                        content: `您关闭了${this.$name}的消息提醒服务，无法给您推送对应的服务消息。为了后面您更好的体验，建议您前往 设置->订阅消息 开启服务消息的推送。`,
                        success: res => {
                          if(res.confirm) {
                            uni.openSetting();
                          }
                        }
                      })
                    }
                  }
                })
                // #endif
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
            },
            fail: function (err) {
              setTimeout(() => {
                uni.showToast({
                  title: '支付失败',
                  icon: 'none',
                  mask: true,
                  duration: 2000
                })
              },this.$toastDelay)
            }
          })
          // #endif
          this.isPaying = false;
        }, err => {
          this.isPaying = false;
        })

      },
    }
  }
</script>
<style lang="scss" scoped>
@import 'pay-result.scss';
</style>