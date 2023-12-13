<template>
  <view class="flex-page">
    <view class="flex-page-content">
      <scroll-view 
        scroll-y 
        class="page-scroll" 
        :refresher-enabled="true" 
        :refresher-triggered="refreshing"
        @refresherrefresh="reGetList" 
        @scrolltolower="getList">

        <view class="records">
          <view v-for="(item, index) in dataList" class="record" :key="index">
            <view class="record-baseinfo">
              <view class="record-sn">订单编号：{{item.order_sn}}</view>
              <view class="record-status">{{payStatusTexts[item.pay_status]}}</view>
            </view>
            <view class="record-content">
              <view class="record-infos">
                <view class="record-goods-info">
                  <view class="record-goods-img-box">
                    <image class="record-goods-img" src="/market-pages/static/images/ppyl/cvip.png"></image>
                  </view>
                  <view class="record-goods-name">{{item.buy_combo_name}}</view>
                </view>
                <view v-if="item.pay_status == 2" class="record-info">购买时间：{{item.pay_time}}</view>
                <view class="record-info">套餐时长：{{item.time_span}}</view>
              </view>
              <view class="record-vals">
                <view class="record-val">￥{{item.real_pay_price || 0}}</view>
                <view class="record-val-unactive">￥{{item.market_price || 0}}</view>
              </view>
            </view>
          </view>
        </view>

        <view v-if="dataList.length > 0 && currentPage > pageTotal && !listLoading" class="scroll-tips">已经到底啦</view>
        <view v-if="dataList.length == 0 && currentPage > pageTotal && !listLoading" class="scroll-tips">暂无记录哦</view>


      </scroll-view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      payStatusTexts: {
        [1]: '交易关闭',
        [2]: '交易完成'
      },

      refreshing: false,
      currentPage: 1,
      pageTotal: 1,

      listLoading: false,
      dataList: [],

    }
  },
  onLoad(options) {
    this.getList();
  },
  methods: {
    
    getList() {
      if(this.currentPage > this.pageTotal) return;
      let params = {
        uid: uni.getStorageSync('userInfo').uid,
        page: this.currentPage
      }
      this.listLoading = true;
      this.$get('/ppyl/CVIPOrderList', params, res => {
        this.listLoading = false;
        this.currentPage += 1;

        if(!res.data.list || res.data.list.length == 0) return;
        let dataList = res.data.list;

        for(let i = 0; i < dataList.length; i++) {
          let time = [], restTime = dataList[i].buy_expire_time;

          let days = Math.floor(parseInt(restTime) / 86400);
          if(days > 0) {
            time.push(`${days}天`);
            restTime -= days * 86400; //取余数
          }
          if(restTime > 0) {
            let hours = Math.floor(parseInt(restTime) / 3600);
            time.push(`${hours}小时`);
            restTime -= hours * 3600; //取余数
          }
          if(restTime > 0) {
            let mins = Math.floor(parseInt(restTime) / 60);
            time.push(`${mins}分钟`);
            restTime -= mins * 60; //取余数
          }
          if(restTime > 0) {
            let seconds = parseInt(restTime);
            time.push(`${seconds}秒`);
          }


          dataList[i].time_span = time.join('');
        }

        this.dataList.push(...dataList);
        this.pageTotal = res.data.pageTotal;
      }, err => {
        this.listLoading = false;
      })
    },
    reGetList() {
      this.refreshing = true;
      this.currentPage = 1;
      this.pageTotal = 1;
      this.dataList = [];
      this.getList();
      setTimeout(() => {
        this.refreshing = false;
      }, 200)
    },
  }
}
</script>
<style lang="scss" scoped>
@import './vip-records.scss';
</style>