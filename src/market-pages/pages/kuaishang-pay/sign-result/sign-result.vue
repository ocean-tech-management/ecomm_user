<template>
  
  <view class="flex-page">

    <!-- 页面内容 -->
    <view class="flex-page-content">
      <view class="pay-result-banner">
        <view class="pay-result-content">
          <block v-if="signLoading">
            <view class="pay-result-title">查询签约状态中</view>
          </block>

          <block v-else>
            <block v-if="!signSuccess">
              <view class="pay-result-title">
                查询签约状态失败
              </view>
              <view class="pay-result-tips">可能您网络状态不佳，请重试</view>
            </block>
            <block v-else>
              <view class="pay-result-title">{{statusTexts[signData.status]}}</view>
              <view v-if="signData.status == 2" class="pay-result-tips">已签约成功，您可以使用签约的身份进行回收</view>
              <view v-else-if="signData.status" class="pay-result-tips">未成功签约，请重试</view>
            </block>
          </block>
        </view>
      </view>
    </view>
    <view class="bottom-btns">
      <view class="bottom-btn" @tap="toMe">
        返回个人中心
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      statusTexts: {
        [0]: '未认证签约',
        [1]: '未签约',
        [2]: '已签约'
      },
      signData: {},
      signLoading: true,
      signSuccess: false
    }
  },
  onLoad() {
    this.getData();
  },
  methods: {
    getData() {
      let params = {
        uid: uni.getStorageSync('userInfo').uid
      }
      this.$sget('/letfree/ContractInfo', params, res => {
        this.signData = res.data.returnData;
        if(this.signData.status == 2) this.signSuccess = true;
        this.signLoading = false;
      }, err => {
        this.signLoading = false;
      })
    },
    toMe() {
      uni.reLaunch({
        url: '/pages/me/me'
      })
    }
  }
}
</script>

<style lang="scss" scoped>
  @import 'sign-result.scss';
</style>