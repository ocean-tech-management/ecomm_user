<template>
  <view>
    <view class="reward-content">
      <view class="reward-content-title">
        奖励红包
      </view>
    </view>

    <view class="reward-infos">
      <view class="reward-val-box">
        <text class="reward-val">{{reward.real_reward_price}}</text>
        <text>元</text>
      </view>
      <view class="reward-success">领取成功</view>
      <view class="reward-success-tips">红包已领取，可到收益中心查看</view>
    </view>


  </view>
</template>
<script>
export default {
  data() {
    return {
      reward: {}
    }
  },
  onLoad() {
    let reward = uni.getStorageSync('getReward');
    if(!reward) return uni.showModal({
      title: '提示',
      content: '奖励信息有误，点击确定返回首页',
      showCancel: false,
      success: res => {
        uni.switchTab({
          url: '/pages/index/index'
        })
      }
    })
    this.reward = reward;
  },
  methods: {
  }
}
</script>
<style lang="scss" scoped>
@import './ppyl-reward.scss';
</style>