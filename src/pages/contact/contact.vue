<template>
  <view style="padding-top: 10rpx">
    <view class="contact-img-box">
      <image class="contact-img" :src="servicer_background" mode="widthFix"></image>
    </view>
  </view>
</template>
<script>
export default {
  data() {
    return {
      servicer_background: ''
    }
  },
  onLoad(options) {
    this.getData();
  },
  methods: {
    
    getData() {
      let params = {
        type: 7 //1基本信息，2大礼包入口图地址，3使用须知，4用户协议，5隐私政策， 6银行卡快捷支付用户协议 7客服二维码 不传为全部返回
      }
      this.$get('/system/info', params, res => {
        this.servicer_background = res.data.servicer_background || '';
      })
    },

  }
}
</script>
<style lang="scss" scoped>
@import 'contact.scss';
</style>