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

      shopCarItem: [],
      fromShopcar: false
    }
  },
  onLoad(options) {
    this.sn = options.sn;

    if(uni.getStorageSync('shopCarItem')) {
      // 来自购物车
      this.shopCarItem = uni.getStorageSync('shopCarItem');
      uni.removeStorageSync('shopCarItem');
      if(this.shopCarItem.length > 0) this.fromShopcar = true;
    }

    this.tryTimeOut();
  },
  methods: {
    tryTimeOut() {
      this.askStatus(() => {
        if(this.resultType != 3) {
          return uni.redirectTo({
            url: `/market-pages/pages/agreement-pay/pay-result/pay-result?type=${this.resultType}`
          })
        } else {
          let timeSpend = moment().diff(this.enterTime, 'seconds');
          if(timeSpend >= this.overTimeLimit) {
            return uni.redirectTo({
              url: `/market-pages/pages/agreement-pay/pay-result/pay-result?type=${this.resultType}`
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
        order_sn: this.sn
      }
      this.$sget('/agreement/orderStatus', params, res => {
        if(res.data.order_status == 2) {
          this.resultType = 1;
          if(this.fromShopcar) this.deleteShopcarItem();
        } else if(res.data.order_status == -1) {
          this.resultType = 2;
        }
        if(handler && typeof handler == 'function') handler();
      }, err => {
        if(handler && typeof handler == 'function') handler();
      })
    },
    deleteShopcarItem() {
      let params = {
        uid: uni.getStorageSync('userInfo').uid,
        cart_sn: this.shopCarItem
      }
      // 静默删除
      this.$spost('/shopCart/delete', params, res => {})
    },
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