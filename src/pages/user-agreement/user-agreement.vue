<template>
  <view class="uni-common-pb-withbtn">
    <view class="user-agreement">
      <mp-html :content="user_agreement" :lazy-load="true"/>
    </view>
    <view class="bottom-btns">
      <view class="bottom-btn" @tap="backToPrev">同意并返回</view>
    </view>
  </view>
  
</template>
<script>
import mpHtml from '@/components/mp-html/mp-html';
export default {
  components: {
    mpHtml
  },
  data() {
    return {
      user_agreement: ''
    }
  },
  onLoad() {
    this.getData();
  },
  methods: {
    getData() {
      let params = {
        type: 4 //1基本信息，2大礼包入口图地址，3使用须知，4用户协议，5隐私政策， 6银行卡快捷支付用户协议 不传为全部返回
      }
      this.$get('/system/info', params, res => {
        this.user_agreement = res.data.user_agreement || '';
      })
    },
    backToPrev() {
      uni.navigateBack();
    }
  }
}
</script>

<style lang="scss">
page,
uni-page {
  background-color: #fff;
}

@import 'user-agreement.scss';
</style>