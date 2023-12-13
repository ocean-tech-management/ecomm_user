<template>
  <view class="flex-page">
    <!-- 页面内容 -->
    <view class="flex-page-content">
      <!-- 常规图文列表 -->
      <view class="list-box">
        <scroll-view scroll-y class="tab-page-scroll" @scrolltolower="getList">
          <view class="data-list">
            <view v-for="(item, index) in dataList" class="data-item" :key="index">
              <view class="data-row">
                <view v-if="item.change_type != 4" class="data-name">{{changeTypeTexts[item.change_type]}}</view>
                <view v-else class="data-name">{{item.is_grateful == 1 ? '感恩奖' : '福利补贴'}}</view>
                <view class="data-val">{{item.price}}</view>
              </view>
              <view v-if="item.crowd_code && item.activity_name && item.crowd_round_number && item.crowd_period_number" class="data-row">
                <view class="data-info">{{item.activity_name}}{{item.crowd_round_number}}轮{{item.crowd_period_number}}期</view>
              </view>
              <view v-if="item.change_type == 7" class="data-row">
                <view class="data-info">转赠给 {{item.transfer_for_user_name}}（{{item.transfer_for_user_phone}}）</view>
              </view>
              <view class="data-row">
                <view class="data-info">{{item.create_time}}</view>
              </view>
            </view>

          </view>

          <view v-if="dataList.length > 0 && currentPage > pageTotal && !dataLoading" class="scroll-tips">已经到底啦</view>
          <view v-if="dataList.length == 0 && currentPage > pageTotal && !dataLoading" class="scroll-tips">暂无相关记录</view>
        </scroll-view>
      </view>
    </view>
  </view>
</template>
<script>
import moment from "moment";

export default {
  data() {
    return {
      source: '',
      sourceUrl: {
        'recharge': {url: '/user/rechargeList', title: '累计充值'}, // 充值
        'transfer': {url: '/user/transferList', title: '累计转出'} // 转出
      },
      currentPage: 1,
      pageTotal: 1,
      dataList: [],
      dataLoading: false,
      timeType: 1, // 1-新增业绩 2-查看历史数据
      changeTypeTexts: {
        [1]: '预购',
        [2]: '消费',
        [3]: '福利补贴',  //退回本金
        [4]: '奖励',  //奖金
        [5]: '转商城余额',
        [6]: '回收',
        [7]: '转赠他人',
        [8]: '转换到其他钱包',
        [9]: '收到他人转赠',
        [10]: '中奖',
        [11]: '特大福利分期返还'
      },
    }
  },
  onShareAppMessage() {
    let shareInfo = this.$getShareInfo();
    return shareInfo;
  },
  onLoad(options) {
    if (options.type) this.timeType = options.type
    if (options.source) {
      this.source = options.source
      uni.setNavigationBarTitle({
        title: this.sourceUrl[options.source].title || '累计充值'
      })
    }
  },
  onShow() {
    this.reGetList();
  },
  methods: {
    getList() {
      if(this.currentPage > this.pageTotal) return;
      let params = {
        uid: uni.getStorageSync('userInfo').uid,
        page: this.currentPage,
        time_type: this.timeType
      }
      this.dataLoading = true;
      this.$get((this.sourceUrl[this.source].url || this.sourceUrl.recharge.url), params, res => {
        this.dataLoading = false;
        this.currentPage += 1;

        if(!res.data.list || res.data.list.length == 0) return;
        let dataList = res.data.list;
        this.dataList.push(...dataList);
        console.log(this.dataList)
        this.pageTotal = res.data.pageTotal;
      })
    },
    reGetList() {
      this.currentPage = 1;
      this.pageTotal = 1;
      this.dataList = [];
      this.getList();
    },
  }
}
</script>
<style lang="scss" scoped>
@import "recharge.scss";
</style>