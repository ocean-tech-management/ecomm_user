<template>
  <view class="flex-page">
    <!-- 页面内容 -->
    <view class="flex-page-content">

      <!-- 名医讲堂，常规图文列表 -->
      <view class="order-box">
        <scroll-view 
          scroll-y 
          class="tab-page-scroll" 
          :refresher-enabled="true" 
          :refresher-triggered="refreshing"
          @refresherrefresh="reGetList" 
          @scrolltolower="getList">
          <view class="order-list">
            <!-- 参考京东，多个商品也只显示一个 -->
            <view v-for="order in dataList" class="order" :data-sn="order.after_sale_sn" :key="order.after_sale_sn">
              <view class="order-item" :data-sn="order.after_sale_sn" @tap="goToDetail">
                <view class="order-item-img-box">
                  <image class="order-item-img" :src="order.goods_images" mode="widthFix" webp lazy-load></image>
                </view>
                <view class="order-item-info">
                  <view class="order-item-title">{{order.goods_title}}</view>
                  <view class="order-item-val-info">
                    退款：￥{{order.apply_price || '0.00'}}
                  </view>
                </view>
              </view>
              <view class="return-info" :data-sn="order.after_sale_sn" @tap="goToDetail">
                <view class="return-status" :class="{'useful-info': order.after_status == 1}">{{statusTexts[order.after_status]}}</view>
                <view v-if="order.after_status == 1" class="return-tips-useful">
                  <!-- 商家将在<text class="useful-info">{{order.hardcode_time}}</text>内处理 -->
                  商家将尽快处理您的申请
                </view>
                <view v-if="order.after_status == 2" class="return-tips">
                  已退款{{order.returnPrice || '0.00'}}
                </view>
              </view>
              <view class="order-extends">
                <view class="order-status">{{typeText[order.type]}}</view>
                <view class="order-ctrls">
                  <!-- <view v-if="order.after_status == 1" class="order-ctrl" :data-sn="order.after_sale_sn" @tap="toReturnEdit">修改申请</view> -->
                  <view v-if="order.after_status == 1" class="order-ctrl primary" :data-sn="order.after_sale_sn" @tap="askCancel">取消申请</view>
                  <!-- <view v-if="order.after_status == 7" class="order-ctrl" :data-sn="order.after_sale_sn" @tap="goToReturnComment">售后评价</view> -->
                </view>
              </view>
            </view>
            
          </view>
              
          <view v-if="dataList.length > 0 && currentPage > pageTotal && !dataLoading" class="scroll-tips">已经到底啦</view>
          <view v-if="dataList.length == 0 && currentPage > pageTotal && !dataLoading" class="scroll-tips">暂无记录哦</view>

        </scroll-view>


      </view>
    </view>
  </view>
</template>
<script>
export default {
  data() {
    return {
      currentPage: 1,
      pageTotal: 1,

      refreshing: false,

      dataList: [],
      statusTexts: {
        [1]: '申请中',
        [2]: '已同意',
        [3]: '不同意',
        [4]: '待发货',
        [5]: '商家待收货',
        [6]: '商家已收货',
        [7]: '退款成功',
        [8]: '待收货',
        [9]: '已收货',
        [10]: '售后完成',
        [-1]: '已取消',
        [-2]: '拒绝收货',
        [-3]: '拒绝退款'
      },
      typeText: {
        [1]: '仅退款',
        [2]: '退货退款',
        [3]: '换货'
      },

      dataLoading: false,
      isCtrl: false,
    }
  },
  onShareAppMessage() {
    let shareInfo = this.$getShareInfo();
    return shareInfo;
  },
  onLoad() {
    this.getList();
  },
  methods: {
    getList() {
      if(this.currentPage > this.pageTotal) return;
      let params = {
        uid: uni.getStorageSync('userInfo').uid,
        keyword: this.keyword || '',
        page: this.currentPage
      }
      this.dataLoading = true;
      this.$get('/afterSale/list', params, res => {
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
    toReturnEdit(e) {
      this.isCtrl = true;
      let sn = e.currentTarget.dataset.sn;
      uni.navigateTo({
        url: '/pages/return-edit/return-edit'
      })
    },
    askCancel(e) {
      this.isCtrl = true;
      let sn = e.currentTarget.dataset.sn;
      uni.showModal({
        title: '提示',
        content: '您确定取消该申请吗？',
        success: res => {
          if(res.confirm) {
            let params = {
              after_sale_sn: sn,
              uid: uni.getStorageSync('userInfo').uid
            }
            this.$post('/afterSale/cancel', params, res => {
              setTimeout(() => {
                uni.showToast({
                  title: '取消申请成功',
                  mask: true
                })
                setTimeout(() => {
                  this.dataList = [];
                  this.currentPage = 1;
                  this.pageTotal = 1;
                  this.getList();
                }, 1800)
              }, this.$toastDelay)
              
            })
            
            // this.getList();
          }
        }
      })
    },
    goToReturnComment() {

    },
    goToDetail(e) {
      setTimeout(() => {
        if(this.isCtrl) return this.isCtrl = false;
        let sn = e.currentTarget.dataset.sn;
        uni.navigateTo({
          url: `/pages/return-detail/return-detail?sn=${sn}`
        })
      }, 20)
    }
  }
  
}
</script>
<style lang="scss" scoped>
@import 'returns.scss';
</style>