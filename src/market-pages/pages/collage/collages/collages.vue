<template>
  <view class="flex-page">
    <view class="flex-page-content">
      <scroll-view class="collage-products" scroll-y @scrolltolower="getList">
        <!-- 空节点，做撑开空间用 -->
        <view class="collage-padding"></view>

        <view v-for="item in dataList" class="collage-product" :key="item.goods_sn" @tap="goToDetail(item.goods_sn, 2, item.activity_code)">
          <view class="collage-product-img-box">
            <!-- <view class="collage-product-type-tag">邀新团</view> -->
            <view v-if="item.stock <= 0" class="collage-product-sell-out">已售罄</view>
            <image class="collage-product-img" :src="item.image" mode="widthFix" webp lazy-load></image>
          </view>
          <view class="collage-product-info">
            <view class="collage-product-title">
              <text v-if="item.activity_price !== item.sale_price" class="collage-tag">优惠￥{{item.discount}}</text>
              <text>{{item.title}}</text>
            </view>
            <view class="collage-subtitle">
              {{item.sub_title}}
            </view>
            <view class="collage-info">
              <view class="collage-info-avatars">
                <image class="collage-product-avatar-default" src="/static/images/joiner.png" mode="widthFix"></image>
              </view>
              <view class="collage-info-number">等已拼团</view>
              <view class="collage-info-type">{{item.activity.group_number || 1}}人团</view>
            </view>
            <view class="collage-product-baseinfo">
              <view class="collage-product-vals">
                <view class="collage-product-val">¥{{item.activity_price}}</view>
                <view v-if="item.market_price && item.activity_price !== item.market_price" class="collage-product-val-unactive">¥{{item.market_price}}</view>
              </view>
              <view class="collage-product-ctrls">
                <view class="collage-product-ctrl">拼团</view>
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
export default {
  data() {
    return {
      activity_code: null,
      
      currentPage: 1,
      pageTotal: 1,
      keyword: '',
      dataList: [],
      active: {},
      limit_type: 2,
      
      dataLoading: false,
    }
  },
  onShareAppMessage() {
    let shareInfo = this.$getShareInfo();
    return shareInfo;
  },
  onLoad(options) {

    this.activity_code = options.code || null;

    uni.setNavigationBarTitle({
      title: options.name || '拼团页面'
    })
    this.getList();
  },
  methods: { 
    getList() {
      if(this.currentPage > this.pageTotal) return;
      let params = {
        page: this.currentPage
      }
      if(this.activity_code) params.activity_code = this.activity_code;
      this.dataLoading = true;
      this.$get('/pt/goodsList', params, res => {
        this.dataLoading = false;
        this.currentPage += 1;

        if(!res.data.list || res.data.list.length == 0) return;
        let dataList = res.data.list;
        for(let i = 0; i < dataList.length; i++) {
          let discount = parseFloat(dataList[i].sale_price) - parseFloat(dataList[i].activity_price);
          dataList[i].discount = discount.toFixed(2);
        }

        this.dataList.push(...dataList);
        this.pageTotal = res.data.pageTotal;
      }, err => {
        this.dataLoading = false;
      })
    },
    reGetList() {
      this.pageTotal = 1;
      this.currentPage = 1;
      this.dataList = [];
      this.getList();
    },
    updateTimeIndex(index) {
      this.timeIndex = index;
      this.start_time = this.times[this.timeIndex].time;
      this.reGetList();
    },

    goToDetail(sn, activity_type, activity_id) {
      let url = `/pages/product-detail/product-detail?sn=${sn}`;
      url += `&aType=${activity_type}&aId=${activity_id}`;
      uni.navigateTo({
        url: url
      })
    },
  }
}
</script>
<style lang="scss" scoped>
  @import 'collages.scss'
</style>