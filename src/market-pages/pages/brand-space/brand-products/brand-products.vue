<template>
  <view class="flex-page">
    <!-- 页面内容 -->
    <view class="flex-page-content">
      <scroll-view 
        scroll-y 
        class="tab-page-scroll"
        @scrolltolower="getList"
      >

        <view class="join-products-bg-box">
          <image class="join-products-bg" :src="brandSpace.poster" mode="widthFix" webp lazy-load></image>
        </view>

        <view class="product-list">
         <view v-for="item in dataList" class="product" :data-sn="item.goods_sn" :key="item.goods_sn" @tap="goToDetail">
            <view class="product-img-box">
              <image class="product-img" :src="item.image" mode="aspectFill" webp lazy-load></image>
            </view>
            <view class="product-info">
              
              <view class="product-title">
                {{item.title}}
              </view>
              <view class="product-val-info">
                <view class="product-val">
                  ¥{{item.activity_price}}
                </view>
                <view v-if="item.market_price && item.market_price !== item.activity_price" class="product-val-unactive">
                  {{item.market_price}}
                </view>
              </view>
            </view>
            
          </view>
        </view>

      </scroll-view>

    </view>
  </view>
</template>
<script>

export default {
  data() {
    return {
      aId: null,

      currentPage: 1,
      pageTotal: 1,
      keyword: '',
      brandSpace: {},
      dataList: [],

      dataLoading: false,
      
    }
  },
  onShareAppMessage() {
    let shareInfo = this.$getShareInfo();

    return shareInfo;
  },
  onLoad(options) {
    this.aId = options.id || '';

    this.getList();
  },
  methods: {
    getUserInfo() {
      let params = {
        uid: uni.getStorageSync('userInfo').uid
      }
      this.$sget('/user/info', params, res => {
        let userInfo = res.data;
        uni.setStorageSync('userInfo', userInfo);
      })
    },
    getList() {
      if(this.currentPage > this.pageTotal) return;
      let params = {
        aId: this.aId,
        keyword: this.keyword,
        page: this.currentPage
      }
      this.dataLoading = true;
      this.$get('/home/activityInfo', params, res => {
        
        this.dataLoading = false;
        this.currentPage += 1;

        this.brandSpace = res.data.info;
        uni.setNavigationBarTitle({
          title: this.brandSpace.title || '品牌商品'
        })

        if(!res.data.goods.list || res.data.goods.list.length == 0) return;
        let dataList = res.data.goods.list;

        this.dataList.push(...dataList);
        this.pageTotal = res.data.goods.pageTotal;
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
    goToDetail(e) {
      
      let sn = e.currentTarget.dataset.sn;
      uni.navigateTo({
        url: `/pages/product-detail/product-detail?sn=${sn}`
      })
    }
  }
  
}
</script>
<style lang="scss" scoped>
@import 'brand-products.scss';
</style>
<style lang="scss">
  page,
  uni-page {
    background-color: #fff;
  }
</style>