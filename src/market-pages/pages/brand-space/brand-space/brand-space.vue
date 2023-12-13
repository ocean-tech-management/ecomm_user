<template>
  <view class="flex-page">
    <!-- 页面内容 -->
    <view class="flex-page-content">
      <scroll-view 
        scroll-y 
        class="tab-page-scroll"
      >

        <view class="brand-list">
          <view v-for="brand in dataList" class="brand-item" :key="brand.id">
            <view class="brand-bg-box" @tap="goToBrandProducts(brand.id)">
              <image class="brand-bg" :src="brand.poster" mode="widthFix" webp lazy-load></image>
              <view class="brand-bg-btn">进入品牌 ></view>
            </view>
            <view class="brand-products">
              <view class="brand-product-list">
                <view v-for="item in brand.goods" class="product" :data-sn="item.goods_sn" :key="item.goods_sn" @tap="goToDetail">
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

      currentPage: 1,
      pageTotal: 1,
      keyword: '',
      dataList: [],

      dataLoading: false,
      
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
      let params = {
        keyword: this.keyword,
        page: this.currentPage
      }
      this.dataLoading = true;
      this.$get('/brandSpace/list', params, res => {
        this.dataLoading = false;
        if(!res.data || res.data.length == 0) return;
        let dataList = res.data;

        this.dataList.push(...dataList);
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
    },
    goToBrandProducts(id) {
      uni.navigateTo({
        url: `/market-pages/pages/brand-space/brand-products/brand-products?id=${id}`
      })
    }
  }
  
}
</script>
<style lang="scss" scoped>
@import 'brand-space.scss';
</style>

<style lang="scss">
  page,
  uni-page {
    background-color: #fff;
  }
</style>