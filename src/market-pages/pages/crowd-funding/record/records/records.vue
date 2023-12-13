<template>
  <view class="flex-page">
    <view class="flex-page-content">
      <view class="page-header">
        <image class="page-header-bg" src="/market-pages/static/images/crowd_funding/records/bg.png"></image>
        <view class="page-header-card">
          <view class="page-header-card-today">
            <view class="money">{{ recordsData.historyLinkRecharge || 0 }}</view>
            <view class="title">今日新增业绩（元）</view>
          </view>
          <view class="page-header-card-bottom">
            <view class="card-item">
              <view class="money">{{ recordsData.canWithdrawPrice || 0 }}</view>
              <view class="title">可回收额度（元）</view>
            </view>
            <view class="card-item">
              <view class="money">{{ recordsData.freezePrice || 0 }}</view>
              <view class="title">冻结余额（元）</view>
            </view>
          </view>
        </view>
      </view>
      <item-tab ref="itemTab" :listNumber="3" :recordsData="recordsData"></item-tab>
    </view>
  </view>
</template>
<script>
import ItemTab from '../components/itemTab/itemTab.vue'
export default {
  components: { ItemTab },
  data() {
    return {
      recordsData: {},
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
    // 初始化数据
    init() {
      const params = {
        uid: uni.getStorageSync('userInfo').uid
      }
      this.$get('/user/withdrawDataPanel', params, res => {
        const data = res.data;
        const values = {}
        values.historyWithdraw = data.historyWithdraw
        values.historyRecharge = data.historyRecharge
        values.historyLinkRecharge = data.historyLinkRecharge
        values.canWithdrawPrice = data.canWithdrawPrice
        values.historyTransfer = data.historyTransfer
        values.freezePrice = data.freezePrice
        this.recordsData = values
      })
    }
  }
}
</script>
<style lang="scss" scoped>
@import 'records.scss';
</style>