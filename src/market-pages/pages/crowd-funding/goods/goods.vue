<template>
  <view class="flex-page">

    <view class="flex-page-content">
      <scroll-view scroll-y class="tab-page-scroll" :refresher-enabled="true" :refresher-triggered="refreshing"
        @refresherrefresh="reGetList" @scrolltolower="getList">
        <!-- 商品列表 -->
        <view class="goods-list">
          <view v-for="(item, index) in dataList" class="goods-item" :key="index" @tap="goToDetail(item.goods_sn)">
            <view class="goods-img-box">
              <image class="goods-img" :src="item.image" mode="widthFix" lazy-load webp></image>
            </view>
            <view class="goods-infos">
              <view class="goods-title">{{ item.title }}</view>
              <view class="goods-vals-infos">
                <view class="goods-vals">
                  <view class="goods-val"><text class="crowd-activity-sign">积分</text>{{ item.sale_price || '0.00' }}
                  </view>
                  <view v-if="item.market_price && item.market_price != item.sale_price" class="goods-val-unactive">
                    ￥{{ item.market_price || '0.00' }}
                  </view>
                </view>
                <view class="goods-ctrl">福利参与</view>
              </view>
            </view>
          </view>

          <view v-if="dataLoading" class="scroll-tips" style="width: 100%">加载中...</view>
          <view v-if="dataList.length > 0 && currentPage > pageTotal && !dataLoading" class="scroll-tips"
            style="width: 100%">已经到底啦</view>
          <view v-if="dataList.length == 0 && currentPage > pageTotal && !dataLoading" class="scroll-tips"
            style="width: 100%">暂无相关商品哦</view>
        </view>

      </scroll-view>

    </view>

  </view>
</template>
<script>
export default {
  data() {
    return {
      code: null,
      rNum: null,
      pNum: null,


      currentPage: 1,
      pageTotal: 1,

      dataList: [],
      dataLoading: false,
      refreshing: false
    }
  },
  onLoad(options) {
    if(!options.code || !options.rNum || !options.pNum) {
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

    this.code = options.code;
    this.rNum = options.rNum;
    this.pNum = options.pNum;

    this.getList();
  },
  methods: {

    getList() {

      if(this.currentPage > this.pageTotal) return;
      let params = {
        activity_code: this.code,
        round_number: this.rNum,
        period_number	: this.pNum,
        page: this.currentPage,
      }
      this.dataLoading = true;
      this.$get('/crowdFunding/goodsList', params, res => {
        this.dataLoading = false;
        this.currentPage += 1;

        if(!res.data.list || res.data.list.length == 0) return;
        let dataList = res.data.list;

        this.dataList.push(...dataList);
        this.pageTotal = res.data.pageTotal;
      }, err => {
        this.dataLoading = false;
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

    goToDetail(sn) {
      let url = `/pages/product-detail/product-detail?sn=${sn}`;
      uni.navigateTo({
        url: url
      })
    },
  }
}
</script>

<style lang="scss" scoped>
@import 'goods.scss';
</style>