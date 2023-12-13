<template>
  <view class="flex-page">
    <view id="page-search" class="page-search-box" :class="{'page-search-active': searchActive}" :style="'padding-top:' + nativeInfo.statusBarHeight + 'px'">
      <view class="page-search-native" :style="'width:' + (nativeInfo.menuLeft || 200) + 'px'">
        <view class="page-turnback" @tap="returnBack">
          <image class="page-turnback-icon" src="/static/images/icon_return_black.png" mode="heightFix"></image>
        </view>
        <view v-if="setNativeStyle" class="page-search-bar" @tap="goToSearch">
          <image v-show="searchActive" class="page-search-icon" src="/static/images/icon_search.png"></image>
          <image v-show="!searchActive" class="page-search-icon" src="/static/images/index_search.png"></image>
          <view class="page-search-input-static">搜索产品关键字</view>
        </view>
      </view>
    </view>
    
    <view class="flex-page-content">
      <scroll-view class="ppyl-products" scroll-y @scrolltolower="getList">
        <view class="ppyl-banners">
          <view :style="'height: ' + nativeInfo.menuBottom + 'px'"></view>
          <uni-swiper-dot class="swiper-wrapper" :info="banners" :current="swiperIndex" mode="default" :dots-styles="dotsStyles">
            <swiper class="swiper-box" autoplay circular @change="updateSwiperIndex">
              <block v-for="(item, index) in banners" :key="index">
                <swiper-item @tap="tryBanner(index)">
                  <view class="swiper-item">
                    <image class="swiper-img" :src="item.image" mode="aspectFill" webp></image>
                  </view>
                </swiper-item>
              </block>
              
            </swiper>
          </uni-swiper-dot>
          <view class="ppyl-tips-highlight">抢购进行中</view>
          <view class="ppyl-tips">{{joinNumber}}人正在疯抢</view>
        </view>
        
        <view class="ppyl-box">
          <view class="ppyl-tabs">
            <view 
              v-for="(item, index) in areas" 
              :class="{'ppyl-tab': true, 'highlight': item.highlight_status == 1, 'active': tabIndex == index}" 
              @tap="updateTabIndex(index)" 
              :key="index"
            >
              {{item.name}}
            </view>
          </view>
          
          <view class="ppyl-products">
            <view v-for="(item, index) in dataList" class="ppyl-product" :key="index" @tap="goToDetail(item.goods_sn)">
              <view class="ppyl-product-img-box">
                <image class="ppyl-product-img" :src="item.image" mode="widthFix" lazy-load webp></image>
              </view>
              <view class="ppyl-product-infos">
                <view class="ppyl-product-title">
                  <image class="ppyl-product-tag-icon" v-if="item.tag_icon" :src="item.tag_icon" mode="heightFix" webp lazy-load></image>
                  <text>{{item.title}}</text>
                </view>
                <view class="ppyl-discount-infos">
                  <image class="ppyl-discount-bg" src="/market-pages/static/images/ppyl/discount_bg.png"></image>
                  <view class="ppyl-origin-price">￥{{item.market_price || 0}}</view>
                  <view class="ppyl-discount-info">
                    <view class="ppyl-discount-title">直降</view>
                    <view class="ppyl-discount-val">￥{{item.discount || 0}}</view>
                    <view class="ppyl-now-price">￥{{item.activity_price || 0}}</view>
                  </view>
                  <view class="ppyl-callback-price">￥{{item.market_price || 0}}</view>

                  <view class="ppyl-callback-btn">
                    <image class="ppyl-callback-btn-img" src="/market-pages/static/images/ppyl/icon_wallet.png"></image>
                    <view class="ppyl-callback-btn-text">拼团赚钱</view>
                  </view>
                </view>
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
      code: null,
      
      nativeInfo: {
        width: 375, //页面宽度，单位px
        statusBarHeight: 20,  //状态栏高度，有一般为20px
        menuBottom: 0,  //胶囊下方位置，单位px
        menuLeft: 0,  //胶囊左侧位置，单位px
        bannerOffset: 0,  //搜索栏加状态栏高度
        radio: 2,  //rpx缩放倍数
        bannerBottom: 440 //banner底部位置，单位px
      },
      setNativeStyle: false,
      searchActive: false,
      
      currentPage: 1,
      pageTotal: 1,
      keyword: '',

      banners: [],
      swiperIndex: 0,
      dotsStyles: {
        backgroundColor: '#000',
        selectedBackgroundColor: '#ffde3d', //动态标记点
        width: 5,
        height: 5,
        border: '0',
        selectedBorder: '0',
        color: '#fff',
        bottom: 0
      },

      joinNumber: '···',
    
      limit_type: 2,
      
      areas: [],
      tabIndex: 0,

      dataList: [],
      dataLoading: false,
    }
  },
  onShareAppMessage() {
    let shareInfo = this.$getShareInfo();
    if(shareInfo.imageUrl) delete shareInfo.imageUrl;
    return shareInfo;
  },
  onLoad(options) {

    this.code = options.code || null;

    uni.setNavigationBarTitle({
      title: options.name || '厂盟口'
    })
    
    if(uni.getStorageSync('nativeInfo')) {
      this.nativeInfo = uni.getStorageSync('nativeInfo');
    } else {
      this.trySystemInfo();
    }
    this.setNativeStyle = true;

    this.getData();
    this.getBanners();
    this.getJoinNumber();
  },
  methods: { 
    trySystemInfo() {
      // #ifndef H5
      // 获取相关系统信息，为首页动效做准备
      let menu = uni.getMenuButtonBoundingClientRect();
      if(menu && menu.bottom) this.nativeInfo.menuBottom = menu.bottom;
      if(menu && menu.left) this.nativeInfo.menuLeft = menu.left;
      // #endif
      let system = uni.getSystemInfoSync();
      if(system && system.windowWidth) this.nativeInfo.width = system.windowWidth;
      if(system && system.statusBarHeight) this.nativeInfo.statusBarHeight = system.statusBarHeight;
      this.nativeInfo.radio = this.nativeInfo.width / 750;
      this.nativeInfo.bannerBottom = 880 * this.nativeInfo.radio;  //其中880是banner的高度880rpx

    },
    
    getData() {
      let params = {
        activity_code: this.code
      }
      this.$get('/ppyl/area', params, res => {
        this.areas = res.data || [];
        if(this.areas.length == 0) return;
        for(let i = 0; i < this.areas.length; i++) {
          if(this.areas[i].highlight_status == 1) {
            // 如果高亮，直接默认选中这个高亮项。多个也直接选第一个高亮项
            this.tabIndex = i;
            break;
          }
        }
        console.log(this.tabIndex);
        this.getList();
      })
    },
    getList() {
      if(this.currentPage > this.pageTotal) return;
      let params = {
        page: this.currentPage,
        area_code: this.areas[this.tabIndex].area_code
      }
      this.dataLoading = true;
      this.$get('/ppyl/goods', params, res => {
        this.dataLoading = false;
        this.currentPage += 1;

        if(!res.data.list || res.data.list.length == 0) return;
        let dataList = res.data.list;
        for(let i = 0; i < dataList.length; i++) {
          let discount = parseFloat(dataList[i].market_price) - parseFloat(dataList[i].activity_price);
          dataList[i].discount = discount.toFixed(2);
        }

        this.dataList.push(...dataList);
        this.pageTotal = res.data.pageTotal;
      }, err => {
        this.dataLoading = false;
      })
    },
    
    getBanners() {
      let params = {
        activity_code: this.code
      }
      this.$sget('/ppyl/banner', params, res => {
        this.banners = res.data || [];
      })
    },
    getJoinNumber() {
      let params = {
        activity_code: this.code
      }
      
      this.$sget('/ppyl/number', params, res => {
        this.joinNumber = res.data.joinAllNumber || 0;
      }, true)
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
    updateTabIndex(index) {
      this.tabIndex = index;
      this.reGetList();
    },

    
    updateSwiperIndex(e) {
      this.swiperIndex = e.detail.current;
    },

    goToDetail(sn) {
      let url = `/pages/product-detail/product-detail?sn=${sn}`;
      uni.navigateTo({
        url: url
      })
    },
    goToSearch() {
      uni.navigateTo({
        url: `/pages/search/search`
      }) 
    },
    returnBack() {
      uni.navigateBack({
        fail: err => {
          uni.switchTab({
            url: '/pages/index/index'
          })
        }
      });
    }
  }
}
</script>
<style lang="scss" scoped>
  @import 'ppyls.scss'
</style>