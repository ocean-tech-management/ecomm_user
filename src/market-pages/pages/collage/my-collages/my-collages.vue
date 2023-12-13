<template>
  <view class="flex-page">
    <view class="flex-page-content">
      <scroll-view 
        scroll-y 
        class="collage-pages" 
        @scrolltolower="getList">
        <view class="collage-products">
          <view v-for="(item, index) in dataList" class="collage-product" :key="item.activity_sn" @tap="goToDetail(index)">
            <view class="collage-product-img-box">
              <view v-if="item.join_user_type && item.join_user_type != 1" class="collage-product-type-tag">{{joinUserTypes[item.join_user_type]}}</view>
              <image class="collage-product-img" :src="item.goods.image" mode="widthFix" webp lazy-load></image>
            </view>
            <view class="collage-product-info">
              <view class="collage-product-title">
                <text>{{item.goods.title}}</text>
              </view>
              <view class="collage-info">
                <!-- <view class="collage-info-avatars">
                  <image class="collage-product-avatar" src="/static/images/default_avatar.png" mode="widthFix"></image>
                  <image class="collage-product-avatar" src="/static/images/default_avatar.png" mode="widthFix"></image>
                </view> -->
                <view class="collage-info-number">已拼{{item.join_number_count || 1}}人</view>
                <view class="collage-info-type">{{item.group_number || 1}}人团</view>
              </view>
              <view class="collage-product-vals">
                <view class="collage-product-val">¥{{item.real_pay_price || '0.00'}}</view>
                <!-- <view class="collage-product-val-unactive">¥{{item.sale_price || '0.00'}}</view> -->
                <view class="collage-product-ctrls">
                  <view v-if="item.activity_status == 1 && item.pay_status == 1" class="error-color">未付款</view>
                  <view v-if="item.join_number_count < item.group_number && item.activity_status == 1 && item.pay_status == 2" class="collage-product-ctrl">邀拼团</view>
                  <view v-if="item.activity_status == 2" class="success-color">已拼团成功</view>
                  <view v-if="item.activity_status == 3" class="error-color">超时失败</view>
                  <view v-if="item.activity_status == -1" class="error-color">取消订单</view>
                  <view v-if="item.activity_status == -2" class="error-color">已退款</view>
                </view>
              </view>
            </view>
          </view>

        </view>

        <view v-if="dataList.length > 0 && currentPage > pageTotal && !dataLoading" class="scroll-tips">已经到底啦</view>
        <view v-if="dataList.length == 0 && currentPage > pageTotal && !dataLoading" class="scroll-tips">暂无记录哦</view>
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
      joinUserTypes: {
        [1]: '无限制',
        [2]: '邀新团',
        [3]: '回馈团'
      }
    }
  },
  onShareAppMessage() {
    let shareInfo = this.$getShareInfo();
    return shareInfo;
  },
  onLoad(options) {
    
    this.getList();
  },
  methods: { 
    getList() {
      if(this.currentPage > this.pageTotal) return;
      let params = {
        uid: uni.getStorageSync('userInfo').uid,
        keyword: '',
        page: this.currentPage
      }
      this.dataLoading = true;
      this.$get('/pt/myself', params, res => {
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

    goToDetail(index) {
      let code = this.dataList[index].activity_code;
      let sn = this.dataList[index].activity_sn
      uni.navigateTo({
        url: `/market-pages/pages/collage/collage-detail/collage-detail?sn=${sn}&code=${code}`
      })
    },
  }
}
</script>
<style lang="scss" scoped>
  @import 'my-collages.scss'
</style>