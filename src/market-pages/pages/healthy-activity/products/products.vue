<template>
  <view class="flex-page">
    <view class="search-bar">
      <label class="search-label" for="search">
        <image class="search-icon" src="/static/images/icon_search.png"></image>
        <input id="search" class="search-input" type="text" :value="searchWord" placeholder="搜索关键字" placeholder-class="search-input-placeholder" @input="updateSearchWord" @confirm="confirmKeyword"/>
      </label>
      <view class="search-cancel" @tap="confirmKeyword">搜索</view>
    </view>
    <!-- 页面内容 -->
    <view class="flex-page-content">
      <scroll-view 
        scroll-y 
        class="tab-page-scroll" 
        :refresher-enabled="true" 
        :refresher-triggered="refreshing"
        @refresherrefresh="reGetList"
        @scrolltolower="getList"
      >
        <!-- 商品列表 -->
        <view class="product-list">
          <view v-for="product in dataList" class="product-item" @tap="goToDetail(product.goods_sn)" :key="product.goods_sn">
            <view class="product-img-box">
              <view v-if="product.stock == 0" class="product-sell-out">已售罄</view>
              <image class="product-img" :src="product.image" mode="aspectFill" webp lazy-load></image>
            </view>
            <!-- <view class="product-subtitle">
              {{product.sub_title || ''}}
            </view> -->
            <view class="product-info">
              
              <view class="product-title">
                {{product.title}}
              </view>
              <!-- <view class="product-tag-box">
                <image class="product-tag-icon" v-if="product.tag_icon" :src="product.tag_icon" mode="heightFix" webp></image>
              </view> -->
              <view class="product-val-info">
                <view class="product-val">¥{{product.sale_price}}</view>
                <view v-if="product.market_price && product.market_price !== product.sale_price" class="product-val-unactive">
                  {{product.market_price}}
                </view>
              </view>

            </view>
          </view>

          <view v-if="dataLoading" class="scroll-tips" style="width: 100%">加载中...</view>
          <view v-if="dataList.length > 0 && currentPage > pageTotal && !dataLoading" class="scroll-tips" style="width: 100%">已经到底啦</view>
          <view v-if="dataList.length == 0 && currentPage > pageTotal && !dataLoading" class="scroll-tips" style="width: 100%">暂无相关商品哦</view>
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
      searchWord: '',
      keyword: '',
      dataList: [],

      productLeft: [],
      productRight: [],
      dataLoading: false,
      refreshing: false
    }
  },
  onShareAppMessage() {
    let shareInfo = this.$getShareInfo();
    return shareInfo;
  },
  onLoad(options) {
    
    if(options.keyword) {
      this.searchWord = options.keyword;
      this.keyword = options.keyword;
    }
    if(options.name) {
      uni.setNavigationBarTitle({
        title: options.name
      })
    }
    this.getList();
  },
  methods: {
    getList() {
      if(this.currentPage > this.pageTotal) return;
      let params = {
        keyword: this.keyword,
        page: this.currentPage
      }
      this.dataLoading = true;
      this.$sget('/home/exchangeList', params, res => {
        this.dataLoading = false;
        this.currentPage += 1;
        if(res.data.length == 0) return;
        
        this.dataList.push(...res.data.list);

        for(let i = 0; i < res.data.list.length; i++) {
          if(this.productLeft.length <= this.productRight.length) {
            this.productLeft.push(res.data.list[i]);
          } else {
            this.productRight.push(res.data.list[i]);
          }
        }

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
      this.productRight = [];
      this.productLeft = [];
      this.getList();
      setTimeout(() => {
        this.refreshing = false;
      }, 200)
    },

    
    updateSearchWord(e) {
      this.searchWord = e.detail.value;
    },
    confirmKeyword(e) {
      this.keyword = this.searchWord;
      this.reGetList();
    },

    goToDetail(sn) {
      this.validTourist(() => {
        uni.navigateTo({
          url: `/pages/product-detail/product-detail?sn=${sn}`
        })
      }, () => {
        uni.setStorageSync('authOriginPage', {
          type: 'navigateTo',
          page: `/pages/product-detail/product-detail?sn=${sn}`
        });
      })
    },
    
    // 验证游客身份，阻止进入下一级页面
    validTourist(callback, preHanlder) {
      let userInfo = uni.getStorageSync('userInfo');
      if(!userInfo || userInfo.need_auth) {
        // #ifndef H5
        uni.showModal({
          title: '提示',
          content: `为了更好的为您提供服务，${this.$name}需要您的身份信息授权。`,
          confirmText: '前往授权',
          success: res => {
            if(res.confirm) {
              if(preHanlder && typeof preHanlder == 'function') preHanlder();
              uni.reLaunch({
                url: '/pages/auth/auth'
              })
            }
          }
        })
        // #endif
        // #ifdef H5
        if(preHanlder && typeof preHanlder == 'function') preHanlder();
        window.location = '/';
        // #endif
      } else {
        if(callback && typeof callback == 'function') callback();
      }
    }
  }
  
}
</script>
<style lang="scss" scoped>
@import 'products.scss';
</style>
<style lang="scss">
  // uni-page,
  // page {
  //   background-color: #fff;
  // }
</style>