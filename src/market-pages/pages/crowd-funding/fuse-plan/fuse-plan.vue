<template>
  <view class="flex-page">
    <view class="flex-page-content">
      <view class="fuse-plan">
        <image v-if="simplifyName == 'ql' || simplifyName == 'beaugen'" class="fuse-plan-intro"
          src="/market-pages/static/images/crowd_funding/fuse_plan_intro_1000.jpg"></image>
        <image v-else class="fuse-plan-intro" src="/market-pages/static/images/crowd_funding/fuse_plan_intro.jpg"></image>
        <view class="fuse-plan-ctrls">
          <view class="fuse-plan-ctrl" @tap="tryFusePlan(1)">福利一</view>
          <view class="fuse-plan-ctrl" @tap="tryFusePlan(2)">福利二</view>

        </view>
      </view>
    </view>
  </view>
</template>
<script>
import config from '@/config'
export default {
  data(){
    return {
      sn: '',
      simplifyName: config.simplifyName || '',
    }
  },
  onLoad(options) {
    if(!options.sn) {
      uni.showToast({
        title: '不要尝试啦，正在返回首页',
        icon: 'none',
        mask: true
      })
      setTimeout(() => {
        uni.reLaunch({
          url: '/pages/index/index'
        })
      }, 1500);
      return;
    }
    this.sn = options.sn;
  },
  methods: {
    tryFusePlan(type) {

      let plans = {
        [1]: '特大福利一',
        [2]: '特大福利二'
      };
      uni.showModal({
        title: '提示',
        content: `是否确定选择${plans[type]}？`,
        success: res => {
          if(res.confirm) {
            let params = {
              order_sn: this.sn,
              uid: uni.getStorageSync('userInfo').uid,
              choose_type: 1, //订单处理类型，目前只有1
              type: type
            }
            this.$post('/crowdFunding/choosePeriodFusePlan', params, res => {
              setTimeout(() => {
                uni.showToast({
                  title: '操作成功',
                  icon: 'success',
                  mask: true
                })
                setTimeout(() => {
                  uni.setStorageSync('shouldReload', true);
                  uni.navigateBack();
                }, 1500)
              }, this.$toastDelay);
            })
          }
        }
      })

    }
  }
}
</script>
<style lang="scss" scoped>
@import 'fuse-plan.scss';
</style>