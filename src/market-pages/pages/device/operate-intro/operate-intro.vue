<template>
  <view class="flex-page">
    <view class="flex-page-content">
      <view class="page-img-box">
        <image class="page-img" :src="order.oper_image" mode="widthFix"></image>
      </view>
    </view>
    <view class="page-btns">
      <view v-if="order.phone" class="page-btn error" @tap="tryPhone">联系工作人员</view>
      <view class="page-btn" @tap="toIndex">已启动，离开</view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      sn: '',
      
      order: {
        oper_image: '',
        phone: null
      }

    }
  },
  onLoad(options) {
    if(options.sn) this.sn = options.sn;
    let order = uni.getStorageSync('order');
    this.order = order;
    uni.removeStorageSync('order');
      
  },
  methods: {
    toIndex() {
      uni.reLaunch({
        url: '/pages/index/index'
      })
    },
    tryPhone() {
      uni.makePhoneCall({
        phoneNumber: this.order.phone,
      });
    }
  }
}
</script>

<style lang="scss" scoped>
@import 'operate-intro.scss';
</style>