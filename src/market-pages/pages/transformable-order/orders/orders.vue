<template>
  <view class="flex-page">
    <view class="flex-page-content">
      <scroll-view 
        scroll-y 
        class="tab-page-scroll"
        @scrolltolower="getList"
      >
        <view class="orders">
          <view v-for="(item, index) in dataList" class="order" :key="index">
            <view class="order-baseinfo">
              <view class="order-sn">赠品编号：{{item.handsel_sn}}</view>
              <view class="order-status">{{statusTexts[item.operate_status]}}</view>
            </view>
            <view class="order-goods">
              <view class="order-goods-img-box">
                <image class="order-goods-img" :src="item.goods.main_image" webp lazy-load></image>
              </view>
              <view class="order-goods-info">
                <view class="order-goods-title">{{item.goods.title}}</view>
                <view class="order-goods-val">￥{{item.sale_price}}</view>
              </view>
            </view>
            <view class="order-extands">
              <view class="order-time">赠送时间：{{item.create_time}}</view>
              <view v-if="item.operate_status == 2" class="order-ctrls">
                <view class="order-ctrl" :class="{'disabled': item.operate_status != 2}" @tap="goToTransform(item, 1)">转售</view>
                <!-- <view class="order-ctrl" :class="{'disabled': item.operate_status != 2}" @tap="goToTransform(item, 2)">自提</view> -->
              </view>
            </view>
          </view>
        </view>

        <view v-if="dataList.length > 0 && currentPage > pageTotal && !dataLoading" class="scroll-tips" style="width: 100%">已经到底啦</view>
        <view v-if="dataList.length == 0 && currentPage > pageTotal && !dataLoading" class="scroll-tips" style="width: 100%">暂无相关商品哦</view>

      </scroll-view>
    </view>
  </view>
</template>
<script>
import moment from 'moment';
export default {
  data() {
    return {
      currentPage: 1,
      pageTotal: 1,
      dataLoading: false,

      dataList: [],
      statusTexts: {
        [1]: '已操作',
        [2]: '待操作'
      },
    }
  },
  onLoad() {
    this.getList();
  },
  methods: {
    getList() {
      if(this.currentPage > this.pageTotal) return;
      let params = {
        uid: uni.getStorageSync('userInfo').uid,
        page: this.currentPage
      }
      this.dataLoading = true;
      this.$get('/user/handselList', params, res => {
        
        this.dataLoading = false;
        this.currentPage += 1;

        let dataList = res.data.list || [];

        for(let i = 0; i < dataList.length; i++) {
          dataList[i].create_time = moment(dataList[i].create_time).format('YYYY-MM-DD');
        }

        this.dataList.push(...dataList);
        this.pageTotal = res.data.pageTotal;
      }, err => {
        this.dataLoading = false;
      })
    },
    goToTransform(item, type = 1) {
      if(item.operate_status != 2) return;  //已被操作过，不让继续操作了
      let url;
      switch(type) {
        case 1: 
          url = `/market-pages/pages/transformable-order/resale/resale?sn=${item.handsel_sn}`;
          break;
        case 2:
          url = `/market-pages/pages/transformable-order/pick-up/pick-up?sn=${item.handsel_sn}`;
          break;
        default:
          url = `/market-pages/pages/transformable-order/resale/resale?sn=${item.handsel_sn}`;
      }
      uni.setStorageSync('transformableOrder', item);
        
      uni.navigateTo({
        url: url
      });
        
    }
  }
}
</script>
<style lang="scss" scoped>
  @import 'orders.scss';
</style>