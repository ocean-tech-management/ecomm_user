<template>
  <view class="flex-page">
    <view class="flex-page-content">
      <view class="page-header">
        <image class="page-header-bg" src="/market-pages/static/images/crowd_funding/records/bg.png"></image>
        <view class="page-header-card">
          <item-tab :listNumber="2" :recordsData="recordsData"></item-tab>
        </view>
      </view>
    </view>
  </view>
</template>
<script>
import ItemTab from '../components/itemTab/itemTab.vue'
export default {
  components: { ItemTab },
  data() {
    return {
      recordsData: {}
    }
  },
  onLoad(options) {
    this.init()
  },
  onShareAppMessage() {
    let shareInfo = this.$getShareInfo();
    return shareInfo;
  },
  methods: {
    // 初始化
    init() {
      const params = {
        uid: uni.getStorageSync('userInfo').uid
      }
      this.$get('/user/historyWithdrawAndRecharge', params, res => {
        const data = res.data;
        const values = {}
        values.historyWithdraw = data.historyWithdraw
        values.historyRecharge = data.historyRecharge
        this.recordsData = values
      })
    }
  }
}
</script>
<style lang="scss">
@import 'history.scss';
</style>