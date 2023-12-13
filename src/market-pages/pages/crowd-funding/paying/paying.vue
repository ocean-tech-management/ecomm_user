<template>
  <view class="loading-page">
    <view class="loading-icon-box">
      <image class="loading-icon" src="/static/images/icon_loading.png"></image>
    </view>
    <view class="loading-title">支付中...</view>
    <view class="loading-tips">正在链接到支付端口，请稍等</view>
  </view>
</template>
<script>
import moment from 'moment';
export default {
  data() {
    return {
      sn: null,
      resultTypeTimeout: null,
      enterTime: moment().format('YYYY-MM-DD HH:mm:ss'),

      resultType: 3,
      overTimeLimit: 120,  //120超时

    }
  },
  onLoad(options) {
    this.sn = options.sn;

    this.tryTimeOut();
  },
  methods: {
    tryTimeOut() {
      this.askStatus(() => {
        if(this.resultType == 3)  {
          let timeSpend = moment().diff(this.enterTime, 'seconds');
          if(timeSpend >= this.overTimeLimit) {
            return uni.showModal({
              title: '提示',
              content: `网络波动原因，请求超时。稍等片刻请留意您的${this.$written.crowdBalanceName}是否成功到账。如未到账且已扣款，请联系我们客服人员进行处理`,
              showCancel: false,
              confirmText: '返回首页',
              success: res => {
                uni.reLaunch({
                  url: '/pages/index/index'
                })
              }
            })
          }
        }
        this.resultTypeTimeout = setTimeout(() => {
          // 两秒后重启计时器
          this.tryTimeOut();
        }, 2000)
      })
    },
    askStatus(handler) {
      let params = {
        uid: uni.getStorageSync('userInfo').uid,
        order_sn: this.sn,
        order_channel: 2  //1普通订单，2充值订单
      }
      this.$sget('/agreement/orderStatus', params, res => {
        if(res.data.order_status == 2) {
          return uni.showModal({
            title: '提示',
            content: '充值成功，点击 “立即返回” 回到首页',
            showCancel: false,
            confirmText: '立即返回',
            success: res => {
              uni.reLaunch({
                url: '/pages/index/index'
              })
            }
          })
        } else if(res.data.order_status == -1) {
          return uni.showModal({
            title: '提示',
            content: '充值失败',
            showCancel: false,
            confirmText: '返回上页',
            success: res => {
              uni.navigateBack();
            }
          })
        }
        if(handler && typeof handler == 'function') handler();
      }, err => {
        if(handler && typeof handler == 'function') handler();
      })
    }
  }
}
</script>
<style>
  uni-page,
  page {
    background-color: #fff;
  }
</style>
<style lang="scss" scoped>
  @import 'paying.scss';
</style>