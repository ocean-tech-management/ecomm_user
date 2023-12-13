<template>
  <view>
    <view class="transform-title">转出到可用余额</view>
    <view class="transform-box">
      <view class="transform-unit">￥</view>
      <view class="transform-input-box">
        <input class="transform-input" type="digit" :placeholder="'本次最多可转出' + userInfo.ppyl_balance + '元'" :value="transform_price" @input="updatePrice"/>
        <view v-if="transform_price !== ''" class="transform-clear" @tap="clearTransform">×</view>
      </view>
      <view class="transform-all" @tap="transformAll">全部</view>
    </view>
    <view :class="{'transform-btn': true, 'disabled': !valid}" @tap="confirmTransform">确认转出</view>
  </view>
</template>
<script>
export default {
  data() {
    return {
      userInfo: uni.getStorageSync('userInfo'),
      transform_price: '',
      valid: false,
      transformming: false
    }
  },
  onLoad() {
    this.getUserInfo();
  },
  methods: { 
    getUserInfo() {
      let params = {
        uid: uni.getStorageSync('userInfo').uid
      }
      this.$get('/user/info', params, res => {
        let userInfo = res.data;
        this.userInfo = userInfo;
      })
    },
    clearTransform() {
      this.transform_price = 0;
      this.reValid();
    },
    transformAll() {
      this.transform_price = this.userInfo.ppyl_balance || 0;
    },
    updatePrice(e) {
      this.transform_price = e.detail.value;
      this.reValid();
    },
    reValid() {
      if(!this.transform_price || this.transform_price == '' || parseFloat(this.transform_price) == 0) return this.valid = false;
      if(!/^(\d|[1-9]\d+)(\.\d+)?$/.test(this.transform_price)) return this.valid = false;
      let transform = parseFloat(this.transform_price) || 0;
      let rest = parseFloat(this.userInfo.ppyl_balance) || 0;
      if(transform > rest) return this.valid = false;

      this.valid = true;
    },
    confirmTransform() {
      if(this.transformming) return;
      this.transformming = true;
      if(!this.valid) {
        this.transformming = false;
        return uni.showModal({
          title: '提示',
          content: '提现金额超过可转换额度或者格式有误，请检查',
          showCancel: false,
          success: res => {}
        });
      }
      let params = {
        uid: this.userInfo.uid,
        price: this.transform_price
      }
      this.$post('/ppyl/transform', params, res => {
        this.transformming = false;
        setTimeout(() => {
          uni.showToast({
            title: '转换成功',
            mask: true
          })
        }, this.$toastDelay)
      }, err => {
        this.transformming = false;
      })
    }
  }
}
</script>
<style lang="scss" scoped>
@import 'transform.scss';
</style>