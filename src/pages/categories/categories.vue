<template>
  <view class="flex-page">
    <!-- #ifndef H5 -->
    <view class="flex-page-header" :style="'padding-top:' + nativeInfo.statusBarHeight + 'px'">
      <image class="index-user-avatar" src="/static/images/index/logo.png"></image>
    </view>
    <!-- #endif -->
    <!-- 页面内容 -->
    <view class="flex-page-content">
      <view v-if="dataList && dataList.length > 0" class="category-wrapper">
        <view class="category-parents">
          <view v-for="(item, index) in dataList" class="category-parent" :class="{ 'active': selectIndex == index }"
            :key="index" @tap="updateCategoryCode(index)">{{ item.name }}</view>
        </view>
        <scroll-view scroll-y class="category-child-scroll">
          <view class="category-list">
            <view v-for="item in dataList[selectIndex].child" class="category-item" :key="item.code"
              @tap="goToTypeProducts(item.code, item.name)">
              <view class="category-img-box">
                <image class="category-img" :src="item.icon" mode="widthFix" webp lazy-load></image>
              </view>
              <view class="category-name ellipsis-1">{{ item.name }}</view>
            </view>
          </view>
        </scroll-view>

      </view>

    </view>
  </view>
</template>

<script>
  export default {
    data() {
      return {
        nativeInfo: {
          width: 375, //页面宽度，单位px
          statusBarHeight: 20,  //状态栏高度，有一般为20px
          menuBottom: 0,  //胶囊下方位置，单位px
          menuLeft: 0,  //胶囊左侧位置，单位px
          bannerOffset: 0,  //搜索栏加状态栏高度
          radio: 2,  //rpx缩放倍数
          bannerBottom: 440 //banner底部位置，单位px
        },
        selectIndex: 0,
        currentPage: 1,
        pageTotal: 1,
        dataList: [],
        listLoading: false
      }
    },
    onShareAppMessage() {
      let userInfo = uni.getStorageSync('userInfo');
      let path = '/pages/index/index';
      if(userInfo.uid) path += `?link_uid=${userInfo.uid}`;
      return {
        title: `美丽生活，点击开启`,
        desc:  `集品严选`,
        // imageUrl: '/static/images/share.jpg',
        path: path
      }

    },
    onLoad(options) {
      this.getIndexInfo();
      this.getCategories();
    },
    methods: {
      /**
       * 获取窗口信息
       */
      getIndexInfo() {
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
      getCategories() {

        this.$get('/category/list', null, res => {
          this.dataList = res.data;
        })
      },
      updateCategoryCode(index) {
        this.selectIndex = index;
      },
      goToTypeProducts(code, name) {
        uni.navigateTo({
          url: `/pages/products/products?code=${code}&name=${name}`
        })
      },
    }
  }
</script>
<style lang="scss" scoped>
@import './categories.scss';
</style>