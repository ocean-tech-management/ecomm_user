<template>
  <view class="user-entrance-list">
    <view v-if="listNumber === 3" class="user-entrance-item" @tap="checkHistoricalData">
      <view class="user-entrance-title">查看历史数据</view>
      <view class="user-entrance-right">
        <image class="user-entrance-arrow" src="/static/images/more.png"></image>
      </view>
    </view>
    <view v-if="listNumber === 2 || listNumber === 3" class="user-entrance-item" @tap="goToPage(1)">
      <view class="user-entrance-title">累计回收</view>
      <view class="user-entrance-right">
        <view class="money">¥{{ recordsData.historyWithdraw || 0 }}</view>
        <image class="user-entrance-arrow" src="/static/images/more.png"></image>
      </view>
    </view>
    <view v-if="listNumber === 2 || listNumber === 3" class="user-entrance-item" @tap="goToPage(2)">
      <view class="user-entrance-title">累计充值</view>
      <view class="user-entrance-right">
        <view class="money">¥{{ recordsData.historyRecharge || 0 }}</view>
        <image class="user-entrance-arrow" src="/static/images/more.png"></image>
      </view>
    </view>
    <view v-if="listNumber === 3" class="user-entrance-item" @tap="goToPage(3)">
      <view class="user-entrance-title">累计转出</view>
      <view class="user-entrance-right">
        <view class="money">¥{{ recordsData.historyTransfer || 0 }}</view>
        <image class="user-entrance-arrow" src="/static/images/more.png"></image>
      </view>
    </view>
  </view>
</template>
<script>
export default {
  data() {
    return {}
  },
  props: {
    // 显示列数 2-累计回收+累计充值  3-历史记录+累计回收+累计充值
    listNumber: {
      type: Number,
      default: 0
    },
    recordsData: {
      type: Object,
      default() {
        return {
          historyWithdraw: 0,
          historyRecharge: 0,
          historyTransfer: 0
        }
      }
    }
  },
  onLoad(options) {
  },
  methods: {
    // 初始化
    init() {

    },
    // 修改bar的title
    setNavigationBarTitle(title) {
      uni.setNavigationBarTitle({
        title: title || '新增业绩'
      })
    },
    // 查看历史数据
    checkHistoricalData() {
      uni.navigateTo({
        url: '/market-pages/pages/crowd-funding/record/history/history'
      })
    },
    goToPage(tabIndex) {
      const type = this.listNumber === 3 ? 1 : 2
      const url = {
        1: `/market-pages/pages/crowd-funding/record/withdrawals/withdrawals?type=${type}`, // 累计回收
        2: `/market-pages/pages/crowd-funding/record/recharge/recharge?type=${type}&source=recharge`, // 累计充值
        3: `/market-pages/pages/crowd-funding/record/recharge/recharge?type=${type}&source=transfer` // 累计转出
      }
      if (!url[tabIndex]) return
      uni.navigateTo({ url: url[tabIndex] })
    },
  }
}
</script>
<style lang="scss">
@import 'itemTab.scss';
</style>