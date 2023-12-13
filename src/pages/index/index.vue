<template>
  <view class="flex-page">
    <!-- 搜索，假 -->
    <view id="page-search" class="page-search-box" :class="{ 'page-search-active': searchActive }"
      :style="'padding-top:' + nativeInfo.statusBarHeight + 'px'">
      <view class="page-search-native" :style="'width:' + (nativeInfo.menuLeft ? (nativeInfo.menuLeft + 'px') : '100%')">
        <view class="index-userinfo" @tap="switchMe">
          <image class="index-user-avatar" src="/static/images/index/logo.png"></image>
        </view>
        <view v-if="setNativeStyle" class="page-search-bar" @tap="goToSearch">
          <!-- <image v-show="searchActive" class="page-search-icon" src="/static/images/icon_search.png"></image> -->
          <image class="page-search-icon" src="/static/images/index_search.png"></image>
          <view class="page-search-input-static">搜索产品关键字</view>
        </view>
      </view>
    </view>

    <!-- 页面内容 -->
    <view class="flex-page-content">

      <scroll-view scroll-y class="tab-page-scroll" @scroll="scrolling" :scroll-top="scrollTop" @scrolltolower="getList"
        :refresher-enabled="true" :refresher-triggered="refreshing" @refresherrefresh="tryRefresh"
        @refresherrestore="refreshPage">
        <view class="index-page-bg" :style="'padding-top:' + nativeInfo.statusBarHeight + 'px'">
          <view class="index-page-main-content">
            <!-- banner -->
            <view class="page-swiper-box">
              <view class="page-swiper-bg"></view>
              <uni-swiper-dot class="swiper-wrapper" :info="banners" :current="swiperIndex" mode="default"
                :dots-styles="dotsStyles">
                <swiper class="swiper-box" autoplay circular interval="4500" @change="updateSwiperIndex">
                  <template v-for="(item, index) in banners">
                    <swiper-item @tap="tryBanner(index)" :key="index">
                      <view class="swiper-item">
                        <image class="swiper-img" :src="item.image" mode="widthFix" webp></image>
                      </view>
                    </swiper-item>
                  </template>

                </swiper>
              </uni-swiper-dot>
            </view>
            <!-- 功能入口 -->
            <view class="homepage-enters">
              <view v-for="(item, index) in entrances" class="homepage-enter-item" :key="index" @tap="tryEntrance(item)">
                <view class="homepage-enter-icon-box">
                  <image class="homepage-enter-icon" :src="item.icon" webp></image>
                </view>
                <view class="function-grid-title">{{ item.name }}</view>
              </view>
            </view>

            <!-- 多宫格 -->
            <template v-if="activeList.otherActivity && activeList.otherActivity.length > 0">
              <view class="quadrangle-block">
                <view class="quadrangle-header">
                  <image mode="scaleToFill" src="/static/images/index/other_activity.png" class="quadrangle-header-image">
                  </image>
                </view>
                <view class="quadrangle-body">
                  <view class="quadrangle-col">
                    <template v-for="(item, index) in activeList.otherActivity">
                      <view class="quadrangle-item" :key="index" @tap="tryQuadrangle(item)">
                        <image class="quadrangle-item-img" :src="item.background_image" mode="aspectFill" webp></image>
                      </view>
                      <!-- <image v-if="index % 2 === 0" src="/static/images/index/bias.png" class="quadrangle-item-bias">
                    </image> -->
                      <view v-if="index % 2 === 1 || activeList.otherActivity.length === 1" class="quadrangle-item-empty">
                      </view>
                    </template>
                  </view>
                </view>
              </view>
            </template>
            <view
              v-if="activeList.limit_buys && activeList.limit_buys.timeList && activeList.limit_buys.timeList.length > 0"
              class="activity-block">
              <view class="limit-rush-title-box">
                <view class="activity-block-bar">
                  <view class="activity-block-title limit-rush-title">{{ activeList.limit_buys.title }}</view>
                </view>
                <view class="index-limit-timeline">
                  <view class="tab-timelimit-nodes">
                    <view v-for="(item, index) in activeList.limit_buys.timeList" class="tab-timelimit-node"
                      :class="{ 'active': limitTimeIndex == index }" :key="index" @tap="updateTimeIndex(index)">
                      <block v-if="limitTimeIndex == index && item.start">
                        <view class="tab-timelimit-node-time">{{ item.coldDown }}</view>
                        <view class="tab-timelimit-node-status">{{ item.timeNode }}抢购中</view>
                      </block>
                      <block v-else>
                        <view class="tab-timelimit-node-time">{{ item.timeText }}</view>
                        <view class="tab-timelimit-node-status">{{ item.start ? '距本场结束' : (item.timeNode + '未开始') }}
                        </view>
                      </block>
                    </view>
                  </view>
                </view>
              </view>
              <view class="limit-rush-box">
                <view class="limit-rush-list">
                  <block v-for="(item, index) in activeList.limit_buys.goods" :key="item.goods_sn">
                    <view v-if="limitBuysMore || (!limitBuysMore && index < 3)" class="limit-rush-item"
                      @tap="goToDetail(item.goods_sn, 1, activeList.limit_buys.id)">
                      <view class="limit-rush-img-box">
                        <view v-if="item.goods_stock_sum == 0" class="limit-rush-sell-out">已售罄</view>
                        <image class="limit-rush-img" :src="item.image" mode="aspectFill" webp lazy-load></image>
                        <block v-if="item.start">
                          <!-- 倒计时只有开始时才是有效的 -->
                          <view v-if="activeList.limit_buys.limit_type === 1 && item.coldDown"
                            class="limit-type-timeouts">
                            <!-- 需要显示倒计时，目前只显示1天内的倒计时，逻辑见请求回调 -->
                            <!-- <text>距结束</text> -->
                            <text class="limit-type-timeout">{{ item.coldDown[0] }}</text>
                            <text>天</text>
                            <text class="limit-type-timeout">{{ item.coldDown[1] }}</text>
                            <text>:</text>
                            <text class="limit-type-timeout">{{ item.coldDown[2] }}</text>
                            <text>:</text>
                            <text class="limit-type-timeout highlight">{{ item.coldDown[3] }}</text>
                          </view>
                        </block>
                      </view>
                      <view class="limit-rush-info">
                        <view class="index-rush-product-title">{{ item.title }}</view>
                        <!-- 销售进度条 -->
                        <view class="index-rush-percent-box">
                          <view class="index-rush-percent">
                            <view class="index-rush-percent-rate" :style="'width: ' + (item.salePercentage || 0) + '%;'">
                            </view>
                          </view>
                          <view class="tab-timelimit-percent-info">已抢{{ item.spu_sale_number || 0 }}件</view>
                        </view>
                        <view class="index-rush-baseinfo">
                          <view class="index-rush-vals">
                            <view class="index-rush-val">¥{{ item.activity_price }}</view>
                            <view v-if="item.market_price" class="index-rush-val-unactive">¥{{ item.market_price }}</view>
                          </view>
                          <block v-if="item.goods_stock_sum > 0">
                            <view class="index-rush-ctrl" :class="{ 'active': item.start }">
                              {{ item.start ? '立即抢购' : '即将开始' }}
                            </view>
                          </block>
                          <block v-else>
                            <view class="index-rush-ctrl disabled">
                              已抢光
                            </view>
                          </block>
                        </view>

                      </view>
                    </view>
                  </block>
                </view>
                <block v-if="activeList.limit_buys.goods && activeList.limit_buys.goods.length > 3">
                  <view class="activity-more" @tap="toggleMoreLimitBuy">
                    <text>{{ limitBuysMore ? '收起' : '查看更多' }}</text>
                    <image v-if="limitBuysMore" class="activity-more-icon" src="/static/images/fold.png"></image>
                    <image v-else class="activity-more-icon" src="/static/images/extend.png"></image>
                  </view>
                </block>
                <view v-if="activeList.limit_buys.goods && activeList.limit_buys.goods.length === 0"
                  class="index-worth-tips">
                  无相关活动商品</view>
              </view>
            </view>
            <!-- 今日特卖 -->
            <view v-if="specialAreas && specialAreas.length > 0" class="beOnSale-container">
              <view class="beOnSale-header">
                <image src="/static/images/index/be_on_sale.png" class="beOnSale-header-image"></image>
              </view>
              <view v-for="(item, index) in specialAreas" :key="index" class="beOnSale-wrap">
                <image src="/static/images/index/be_on_sale_bg.png" class="beOnSale-bg"></image>
                <view class="beOnSale-view">
                  <view class="beOnSale-view-header" @tap="goToSpecialArea(item.id)">
                    <view class="beOnSale-view-info">
                      <!-- <image class="beOnSale-view-img" :src="item.background_image" mode="aspectFill" webp lazy-load> -->
                      <!-- </image> -->
                      <view class="beOnSale-view-title ellipsis-1">
                        <text class="title">{{ item.title + ' ' + '/' + ' ' }}</text>
                        {{ item.all_number || 0 }}件单品
                      </view>
                    </view>
                    <!-- <view class="beOnSale-product-count">
                      {{ item.all_number || 0 }}件单品
                    </view> -->
                  </view>
                  <view class="box-store-products">
                    <view class="box-store-product-gallery">
                      <view v-for="(goods, index) in item.goods" class="box-store-product" :key="index"
                        @tap="goToDetail(goods.goods_sn)">
                        <view class="box-store-product-img-box">
                          <image class="box-store-product-img" :src="goods.image" mode="aspectFill" webp lazy-load>
                          </image>
                        </view>
                        <view class="box-store-product-title ellipsis-1">{{ goods.title }}</view>
                        <view class="box-store-product-vals">
                          <view class="box-store-product-val">￥{{ goods.sale_price || 0 }}</view>
                          <view v-if="goods.market_price && goods.market_price != goods.sale_price"
                            class="box-store-product-val-unactive">
                            ￥{{ goods.market_price || 0 }}
                          </view>
                        </view>
                      </view>
                    </view>
                  </view>
                  <view class="box-store-extends">
                    <view class="box-store-ctrls">
                      <!-- <view class="box-store-ctrl" @tap="goToSpecialArea(item.id)">
                        进入会场

                      </view> -->
                      <image class="box-store-ctrl-img" src="/static/images/index/goToHuiChange.png" mode="scaleToFill"
                        @tap="goToSpecialArea(item.id)" />
                    </view>
                  </view>
                </view>
              </view>
            </view>

            <!-- 吸顶tabs不放在邻近，因会受父容器transform影响 -->
            <view id="type-tabs" class="type-tabs">
              <image src="/static/images/index/type_tabs_mask.png" class="type-tabs-mask"></image>
              <view class="type-tab-scroll" :class="{ 'type-tab-scroll-not-enough': categories.length < 1 }">
                <view class="type-tab" :class="{ 'active': typeTabIndex == -1 }" :data-index="-1"
                  @tap="updateTypeTabIndex">
                  <view class="type-tab-title">全部</view>
                </view>
                <view v-for="(item, index) in categories" class="type-tab" :class="{ 'active': typeTabIndex == index }"
                  :data-index="index" :key="index" @tap="updateTypeTabIndex">
                  <view class="type-tab-title">{{ item.name }}</view>
                </view>
              </view>
            </view>

            <!-- 商品列表 -->
            <view class="product-list" :class="{ 'has-init': productInit }">
              <view class="product-list-col-left">
                <view v-for="product in productLeft" class="product-item" @tap="goToDetail(product.goods_sn)"
                  :key="product.goods_sn">
                  <view class="product-img-box">
                    <view v-if="product.stock == 0" class="product-sell-out">已售罄</view>
                    <image class="product-img" :src="product.main_image" mode="aspectFill" webp lazy-load></image>
                  </view>
                  <!-- <view class="product-subtitle">
                    {{product.sub_title || ''}}
                  </view> -->
                  <view class="product-info">

                    <view class="product-title">
                      {{ product.title }}
                    </view>
                    <!-- <view class="product-tag-box">
                      <image class="product-tag-icon" v-if="product.tag_icon" :src="product.tag_icon" mode="heightFix" webp></image>
                    </view> -->
                    <view class="product-val-info">
                      <view class="product-val">¥{{ product.sku_min }}</view>
                      <view v-if="product.market_price_min && product.market_price_min !== product.sku_min"
                        class="product-val-unactive">
                        {{ product.market_price_min }}
                      </view>
                    </view>

                  </view>
                </view>
              </view>
              <view class="product-list-col-right">
                <view v-for="product in productRight" class="product-item" @tap="goToDetail(product.goods_sn)"
                  :key="product.goods_sn">
                  <view class="product-img-box">
                    <view v-if="product.stock == 0" class="product-sell-out">已售罄</view>
                    <image class="product-img" :src="product.main_image" mode="aspectFill" webp lazy-load></image>
                  </view>
                  <!-- <view class="product-subtitle">
                    {{product.sub_title || ''}}
                  </view> -->
                  <view class="product-info">

                    <view class="product-title">
                      {{ product.title }}
                    </view>
                    <!-- <view class="product-tag-box">
                      <image class="product-tag-icon" v-if="product.tag_icon" :src="product.tag_icon" mode="heightFix" webp></image>
                    </view> -->
                    <view class="product-val-info">
                      <view class="product-val">¥{{ product.sku_min }}</view>
                      <view v-if="product.market_price_min && product.market_price_min !== product.sku_min"
                        class="product-val-unactive">
                        {{ product.market_price_min }}
                      </view>
                    </view>
                  </view>
                </view>
              </view>

            </view>
            <view v-if="productLoading" class="scroll-tips" style="width: 100%">加载中...</view>
            <view v-if="products.length > 0 && currentPage > pageTotal && !productLoading" class="scroll-tips"
              style="width: 100%">已经到底啦</view>
            <view v-if="products.length == 0 && currentPage > pageTotal && !productLoading" class="scroll-tips"
              style="width: 100%">暂无相关商品哦</view>
          </view>
        </view>
      </scroll-view>
    </view>

    <!-- 吸顶效果，不适合放在上面的scroll-view中，因为会受到父容器的transform影响 -->
    <view v-if="showAniTab" class="type-tabs-ani" :class="{ 'type-tabs-ani-active': showAniTab }"
      :style="'top:' + nativeInfo.bannerOffset + 'px'">
      <view class="type-tab-scroll-ani">
        <view class="type-tab-ani" :class="{ 'active': typeTabIndex == -1 }" :data-index="-1" @tap="updateTypeTabIndex">
          <view class="type-tab-title">全部</view>
        </view>
        <view v-for="(item, index) in categories" class="type-tab-ani" :class="{ 'active': typeTabIndex == index }"
          :data-index="index" :key="index" @tap="updateTypeTabIndex">
          <view class="type-tab-title">{{ item.name }}</view>
        </view>
      </view>
    </view>

    <view v-if="showScreen" class="screen-banner">
      <view class="screen-banner-box">
        <view class="screen-banner-content">
          <image class="screen-banner-img" :src="screenBanner.image" @tap="goToScreenDirect" webp></image>
          <image class="screen-banner-close" src="/static/images/poster_close.png" @tap="showScreen = false"></image>
        </view>
      </view>
    </view>
    <!-- #ifdef H5-->
    <view v-if="showUserLoginPopup" class="ask-login-popup">
      <view class="ask-phone-mask"></view>
      <view class="ask-login-content">
        <button class="ask-login-btn" @tap="triggerUserSelect('new')">
          新用户
        </button>
        <view class="ask-login-btn-tips">新用户指在本平台没有账号的用户</view>
        <button class="ask-login-btn btn-legacy" @tap="triggerUserSelect('legacy')">
          已有用户
        </button>
        <view class="ask-login-btn-tips">已有账号指本平台存在已有账号的用户</view>
      </view>
    </view>
    <!-- #endif-->
    <!-- #ifdef MP-WEIXIN -->
    <privacy-popup ref="privacyComponent" direction="middle"></privacy-popup>
    <!-- #endif -->
  </view>
</template>
<script>
import config from '@/config';
// #ifdef H5
import '@/common/super-app/AppSdk1.0.1';  //引入超a
// #endif

import { getClient } from '@/common/clientShare';
import uniSwiperDot from '@/components/uni-swiper-dot/uni-swiper-dot.vue';
import moment from 'moment';
  export default {
    components: {
      uniSwiperDot
    },
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
        setNativeStyle: false,  //显示、隐藏搜索框，因第一次加载不清楚搜索框要多长
        searchActive: false,  //给搜索框容器加/减背景，滚动到880rpx的时候触发

        userInfo: {},

        currentPage: 1,
        pageTotal: 1,
        products: [],
        productLeft: [],
        productRight: [],
        productLoading: false,
        productRequestTask: null,

        banners: [],
        entrances: [],
        memberBackground: {},
        brandSpaceBackGround: '',
        screenBanner: {},
        showScreen: false,

        activeList: {},

        ppyls: [],

        specialAreas: [],

        categories: [],
        typeTabIndex: -1,
        tabTop: null,
        currentScrollTop: 0,
        scrollTop: null,
        showAniTab: false,

        dotsStyles: {
          backgroundColor: '#fff',
          selectedBackgroundColor: '#000', //动态标记点
          border: '0',
          selectedBorder: '0',
          color: '#fff',
          bottom: 30
        },
        swiperIndex: 0,

        newplayerRecommendDotsStyles: {
          backgroundColor: '#000',
          selectedBackgroundColor: '#ffde3d', //动态标记点
          width: 5,
          height: 5,
          border: '0',
          selectedBorder: '0',
          color: '#fff',
          bottom: 0
        },
        newplayerRecommendIndex: 0,

        specialAreaTabIndex: 1, //1正在抢购、2最后疯抢

        limitTimeIndex: 0,  //限量抢购的tabindex
        limitBuysMore: true, //是否显示全秒杀商品

        topLoad: false,
        activeLoad: false,

        hasLoad: false,
        reloadList: false,

        productInit: false, //是不是加载过商品列表了，如果是意味着滚到过底部，给一个默认列表容器高。 这参数会在refresh时重置

        refreshing: false,

        coldDownInterval: null,

        //#ifdef H5
        showUserLoginPopup: false,
        h5SignData: [], // 微信数据包
        loadOptions: {},
        // #endif

      }
    },
    onShareAppMessage() {
      return new Promise(async (resolve) => {
        let userInfo = uni.getStorageSync('userInfo');
        let path = '/pages/index/index';
        if(userInfo.uid) path += `?link_uid=${userInfo.uid}`;
        const data = await getClient()
        resolve({
          title: data.share_title || config.written.shareTitle,
          desc:  data.share_desc || config.name,
          // imageUrl: '/static/images/share.jpg',
          imageUrl: data.share_image || '/static/images/share.jpg',
          path: path
        })
      })
    },
    onNavigationBarButtonTap(e) {
      let userInfo = uni.getStorageSync('userInfo');
      let path = `http://wx-jpzx.xmsuiwei.top/pages/index/index`;
      if(userInfo.uid) path += `?link_uid=${userInfo.uid}`;
      console.log('path', path);
      Promise.resolve().then(async () => {
        const data = await getClient()
        uni.share({
          provider: "weixin",
          scene: "WXSceneSession",
          title: data.share_title || config.written.shareTitle,
          summary: data.share_desc || config.name,
          imageUrl: data.share_image || '/static/images/share.jpg',
          type: 0,
          href: path,
          success: function (res) {
            console.log("success:" + JSON.stringify(res));
          },
          fail: function (err) {
            console.log("fail:" + JSON.stringify(err));
          }
        });
      })
    },
    onLoad(options) {
      console.log('options', options);
      if(options._thirdEnv) uni.setStorageSync('_thirdEnv', options._thirdEnv);  //设置第三方环境

      this.getIndexInfo();

      if(options.link_uid) uni.setStorageSync('link_uid', options.link_uid);

      if (!uni.getStorageSync('accessKey')) config.setAccessKey()
      // #ifndef H5
      if(options.scene) {
        // 通过二维码进来的
        let sceneParams = options.scene.split('%26'); //0商品sn,1关联用户uid
        if(sceneParams[1] && sceneParams[1] != 'Nope') uni.setStorageSync('link_uid', sceneParams[1]);
      }
      // #endif
      let userInfo = uni.getStorageSync('userInfo');
      if(userInfo.uid) this.userInfo = userInfo;
      // #ifdef H5
      // 首先检查进来时有没有带code，有的话是微信登陆       ----H5逻辑
      if(!options.code) {
        // 无code检查是否有用户缓存
        if(!userInfo.uid) {
          // 无缓存去授权登陆
          var uri = encodeURIComponent(window.location.href.split('#')[0]); //获取当前url然后传递给后台获取授权和签名信息
          if (this.$jwx && this.$jwx.isWechat()) {//检查是否是微信环境
            this.$jwx.initJssdk(data => {
              window.location.replace(`https://open.weixin.qq.com/connect/oauth2/authorize?appid=${data.appId}&redirect_uri=${uri}&response_type=code&scope=snsapi_userinfo&state=STATE#wechat_redirect`);
            })
          } else {
            // 不是微信环境
            let _thirdEnv = uni.getStorageSync('_thirdEnv');
            if(window && _thirdEnv == 'superApp' || uni.getStorageSync('accessKey') === this.$accessKey.SuperApp) {
              // 超级app环境
              if(!window.super_app_get_auth) {
                // 提供方法给超级app使用
                window.super_app_get_auth = data => {
                  console.log('超a授权信息：', data);
                  this.tryLoginBySuperApp(data, (resData) => {
                    if (resData.isChose) {
                      // h5弹出登录弹窗
                      this.showUserLoginPopup = true
                      this.h5SignData = {
                        nickName: resData.nickName,
                        avatarUrl: resData.avatarUrl,
                        phone: resData.phone,
                        ...data
                      }
                      uni.setStorageSync('h5SignData', {
                        avatarUrl: resData.avatarUrl,
                        nickName: resData.nickName,
                      });
                    } else {
                      this.initIndexLogic(options);
                    }
                  });
                }
              }
              if(AppSdk) {
                // AppSdk.config({debug: true}) //调试模式
                try {
                  AppSdk.get_auth('super_app_get_auth', this.$superApp.platform_num);   //超a登录
                } catch (e) {
                  // 纯H5端点击了超A的链接
                }
              }
            }
          }
          return;
        } else {
          // 有缓存直接使用缓存
          this.initIndexLogic(options);
        }

      } else {
        if (uni.getStorageSync('accessKey') !== this.$accessKey.H5) {
          // 非纯H5
          // 有code检查是不是被使用过了
          if(options.code != uni.getStorageSync('code')) {
            // 没使用的话重新走授权
            this.loadOptions = options
            this.getAuth({
              code: options.code
            }, () => {
              this.initIndexLogic(options);
            });
          } else {
            // 没使用再检查用户缓存
            if(!userInfo.uid) {
              // 无缓存重新刷新页面走授权
              // #ifdef H5
              if(options.shareSpu) uni.setStorageSync('shareSpu', options.shareSpu);
              window.location.replace('/');
              return;
              // #endif
            } else {
              // 有缓存则正常使用缓存
              this.initIndexLogic(options);
            }
          }
        }
      }
      // #endif

      // #ifndef H5
      //                          -----非H5逻辑
      if(!userInfo.uid) {
        if (uni.getStorageSync('accessKey') == this.$accessKey['APP-PLUS']) {
          uni.reLaunch({
            url: '/pages/login/login'
          })
        } else {
          this.getWxInfo(() => {
            this.initIndexLogic(options);
          })
        }
      } else {
        this.initIndexLogic(options);
      }
      // #endif

      setTimeout(() => {
        this.hasLoad = true;
      }, 50)
    },
    onShow() {
      // #ifndef H5
      // 重新切换到首页的时候激活，当且仅当非H5情况启用。H5直接强制跳转授权，无需兼容游客身份
      if(this.hasLoad) {
        this.initColdDownInterval();
        let userInfo = uni.getStorageSync('userInfo');
        this.userInfo = userInfo;
        // 游客身份需要重新验证下，确保拿到最新的基础身份信息
        if(!userInfo.uid) {
          if (uni.getStorageSync('accessKey') == this.$accessKey['APP-PLUS']) {
            uni.reLaunch({
              url: '/pages/login/login'
            })
          } else {
            this.getWxInfo(() => {
              this.initIndexLogic({});
            })
          }
        } else {
          this.initIndexLogic({});
        }
      }
      // #endif
      let systemInfo = uni.getStorageSync('systemInfo');
      if(!systemInfo) {
        uni.getSystemInfo({
          success: res => {
            if(res.errMsg == 'getSystemInfo:ok') {
              systemInfo = res;
              systemInfo.isShort = systemInfo.windowWidth / systemInfo.windowHeight < 0.6 ? false : true;
              uni.setStorageSync('systemInfo', systemInfo);
            }
          }
        })
      }
    },
    onHide() {
      if(this.coldDownInterval) clearInterval(this.coldDownInterval);
    },
    methods: {

      // 首页鉴权完成后逻辑
      initIndexLogic(options) {
        if(options.link_uid) {
          // #ifdef H5
          this.bindSharer(options.link_uid);
          // #endif
        }

        this.initRenderData();

        //异步延后执行
        // 看下需不需要跳转详情页
        setTimeout(() => {
          let userInfo = uni.getStorageSync('userInfo');
          // 扫码进来额外跳转，小程序专属
          // #ifndef H5
          if(options.scene) {
            // 通过二维码进来的
            let sceneParams = options.scene.split('%26'); //0商品sn,1关联用户uid
            if(sceneParams[0] && sceneParams[0] != 'Nope') {
              uni.setStorageSync('shareSpu', sceneParams[0]);
            }
            if(sceneParams[2]) {
              uni.setStorageSync('shareSpuAinfo', sceneParams[2]);
            }
          }
          // #endif

          if(options.shareSpu) {
            uni.setStorageSync('shareSpu', options.shareSpu);
            // #ifdef H5
            window.location.replace('/');
            return;
            // #endif
          }
          if(userInfo.uid && uni.getStorageSync('shareSpu')) {
            let shareSpu = uni.getStorageSync('shareSpu');
            let shareSpuAinfo = uni.getStorageSync('shareSpuAinfo');
            let url = `/pages/product-detail/product-detail?sn=${shareSpu}`;
            if(shareSpuAinfo) {
              this.getAsync(shareSpuAinfo, aInfo => {
                if(aInfo) {
                  if(aInfo.aType) url += `&aType=${aInfo.aType}`;
                  if(aInfo.aId) url += `&aId=${aInfo.aId}`;
                }
                uni.removeStorageSync('shareSpu');
                uni.removeStorageSync('shareSpuAinfo');
                uni.navigateTo({
                  url: url
                })
              })
            } else {
              uni.removeStorageSync('shareSpu');
              uni.removeStorageSync('shareSpuAinfo');
              uni.navigateTo({
                url: url
              })
            }
            // #ifndef H5
            return;
            // #endif
          }


          // 跳转指定页
          if(options.redirect) {
            uni.setStorageSync('redirect', options.redirect);
            // #ifdef H5
            window.location.replace('/');
            return;
            // #endif
          }
          // #ifdef H5
          if (uni.getStorageSync('redirect_url') && uni.getStorageSync('accessKey') == this.$accessKey['H5-WEIXIN'] && !userInfo.need_auth) { // 检查是否是微信环境 是否已授权登录完
            // h5端在1000101，1000102，500101，1500112，404010出现账号问题，微信公众号端重新授权后，重新进入离开的页面
            const redirect_url = uni.getStorageSync('redirect_url')
            uni.removeStorageSync('redirect_url')
            if (config.tabBarPage.includes(redirect_url)) {
              uni.reLaunch({
                url: redirect_url
              })
            } else {
              uni.navigateTo({
                url: redirect_url
              })
            }

          }
          // #endif
          if(uni.getStorageSync('redirect') && (userInfo.uid || /%2Fpages%2Fjoin-products%2Fjoin-products/.test(uni.getStorageSync('redirect')))) {
            let url = uni.getStorageSync('redirect');

            uni.removeStorageSync('redirect');
            uni.navigateTo({
              url: decodeURIComponent(url),
              fail: err => {
                console.log(err);
              }
            })
            // #ifndef H5
            return;
            // #endif
          }

          if((options.scene || options.shareSpu || options.redirect) && !userInfo.uid) {
            uni.showModal({
              title: '提示',
              content: '您还不是本平台用户，可以点击“前往授权”按钮去授权后，回来查看分享内容/扫码内容哦',
              confirmText: "前往授权",
              success: res => {
                if(res.confirm) {
                  uni.reLaunch({
                    url: '/pages/auth/auth'
                  })
                }
              }
            })
          } else if(uni.getStorageSync('authOriginPage') && userInfo.uid) {
            if(uni.getStorageSync('authOriginPage').type == 'navigateTo') {
              uni.navigateTo({
                url: uni.getStorageSync('authOriginPage').page
              });
            } else if(uni.getStorageSync('authOriginPage').type == 'switchTab') {
              uni.switchTab({
                url: uni.getStorageSync('authOriginPage').page
              });
            }
            uni.removeStorageSync('authOriginPage');
          }
        }, 100)

      },
      initRenderData() {
        // #ifdef MP-WEIXIN
        let firstPageData = uni.getStorageSync('firstPageData');
        if(firstPageData) {
          this.getHomeTop(firstPageData);
          this.getActives(firstPageData);
          uni.removeStorageSync('firstPageData');
        } else {
          this.getHomeTop();
          this.getActives();
        }
        // #endif
        // #ifndef MP-WEIXIN
        this.getHomeTop();
        this.getActives();
        // #endif

      },
      tryRefresh() {
        this.refreshing = true;
        this.tabTop = null;

        this.topLoad = false;
        this.activeLoad = false;

        this.currentPage = 1;
        this.pageTotal = 1;
        this.products = [];
        this.productLeft = [];
        this.productRight = [];
        this.productInit = false;

        setTimeout(() => {
          this.refreshing = false;
        }, 100)
      },
      refreshPage(e) {
        setTimeout(() => {
          this.initRenderData();
        }, 50);
      },

      getIndexInfo() {
        // #ifndef H5 || APP-PLUS
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
        this.$nextTick(() => {
          let query = uni.createSelectorQuery();
          query.select('#page-search').boundingClientRect(rect => {
            if(rect) this.nativeInfo.bannerOffset = rect.height;
          }).exec();
        })

        uni.setStorageSync('nativeInfo', this.nativeInfo);

        this.setNativeStyle = true; //尺寸查询完毕
      },

      // 获取用户基本信息
      getAuth(paramsValues = {}, callback) {
        const code = paramsValues.code
        let params = {
          ...paramsValues
        }
        if(uni.getStorageSync('link_uid')) params.link_user = uni.getStorageSync('link_uid');

        //#ifndef H5
        let url = '/wx/authNew';  //非h5，授权流程
        //#endif
        //#ifdef H5
        let url = '/wx/newAuthPublic';  //h5，通过其他方式换取授权
        //#endif
        this.$post(url, params, res => {
          if(res.data) {
            if(res.data.need_auth) {

              this.userInfo = res.data;
              // 存用户数据，不强制跳转验证页
              uni.setStorageSync('userInfo', res.data);
              uni.setStorageSync('token', {
                token: res.data.token,
                time: new Date().getTime()
              })
              // this.initRenderData();
              if(callback && typeof callback == 'function') callback();
            } else if (res.data.isChose) {
              // h5弹出登录弹窗
              this.showUserLoginPopup = true
              this.h5SignData = res.data.wxData // 微信数据包
              uni.setStorageSync('h5SignData', this.h5SignData);
            } else {
              let data = res.data;
              //#ifdef H5
              data.real_uid = data.uid;
              if(data.primary_uid) data.uid = data.primary_uid; //同步过，改写uid
              // #endif
              this.userInfo = data;
              uni.setStorageSync('userInfo', data);
              uni.setStorageSync('token', {
                token: data.token,
                time: new Date().getTime()
              })
              uni.setStorageSync('code', code);
              if (this.$jwx && this.$jwx.isWechat()) {
                this.$jwx.initShare();
              }
              if(callback && typeof callback == 'function') callback();
              //#ifdef H5
              if(data.primary_uid) this.sgetUserInfo();
              // #endif
            }
          }

        }, err => {
          if (err.data && err.data.error_code && this.$jwx && this.$jwx.isWechat()) {//检查是否是微信环境
            var uri = encodeURIComponent(window.location.origin);
            this.$jwx.initJssdk(data => {
              window.location.replace(`https://open.weixin.qq.com/connect/oauth2/authorize?appid=${data.appId}&redirect_uri=${uri}&response_type=code&scope=snsapi_userinfo&state=STATE#wechat_redirect`);
            })
          }
        })
      },
      sgetUserInfo() {
        let params = {
          uid: uni.getStorageSync('userInfo').uid
        }
        this.$sget('/user/info', params, res => {
          let data = res.data;
          //#ifdef H5
          data.real_uid = data.uid;
          if(data.primary_uid) data.uid = data.primary_uid; //同步过，改写uid
          // #endif
          let userInfo = data;
          this.userInfo = userInfo;
          uni.setStorageSync('userInfo', this.userInfo);
        })
      },
      getWxInfo(handler) {
        uni.login({
          provider: 'weixin',
          success: res => {
            this.getAuth({
              code: res.code
            }, handler);
          },
          fail: err => {
            uni.showModal({
              title: '提示',
              content: '获取微信服务出了点小问题，请过几分钟后打开小程序重试',
              showCancel: false
            })
          }
        })
      },

      // #ifdef H5
      tryLoginBySuperApp(data, handler) {
        let params = {
          ...data
        }
        this.$post('/superApp/auth', params, res => {
          let data = res.data;
          //#ifdef H5
          data.real_uid = data.uid;
          if(data.primary_uid) data.uid = data.primary_uid; //同步过，改写uid
          // #endif
          let userInfo = data;
          this.userInfo = userInfo;
          uni.setStorageSync('userInfo', data);
          uni.setStorageSync('token', {
            token: data.token,
            time: new Date().getTime()
          })

          if(handler && typeof handler == 'function') handler(data);
        })
      },

      // 超级app换授权，现在交给后台去拿了。不做相关配置
      async trySuperAppAuth(authData) {
        if(!authData.code) return;  //没拿到授权
        let authRequsetParams = {
          user_id: authData.user_id,  //认他返回的吧
          platform_num: authData.platform_num,  //认他返回的吧
        }
        await this.getSuperAppCode(authRequsetParams).then(data => {
          console.log('超a的code请求：', data);
          authRequsetParams = {
            code: data.token_code,
            user_id: data.user_id,
            app_label: data.app_label,
            platform_num: authData.platform_num,  //认他返回的吧
            platform_secret: authData.platform_secret
          }
        });
        await this.getSuperAppToken(authRequsetParams).then(data => {
          console.log('超a的token请求：', data);
          authRequsetParams = {
            token: data.token,
            nick_name: data.nick_name,
            phone: data.phone,
            platform_num: authData.platform_num,  //认他返回的吧
            user_id: authData.user_id,  //认他返回的吧
          }
        });

        this.getUserInfoBySuperAppAuth(authRequsetParams);
      },
      getSuperAppCode(params) {
        let promise = new Promise((resolve, reject) => {
          this.$superApp.post('/api/auth/get_auth_code.html', params, res => {
            let data = res.data;
            resolve(data);
          }, err => {
            reject(err);
          })
        })
        return promise;
      },
      getSuperAppToken(params) {
        // 要注意，虽然是token，但实际上超a的get_platform_token是提供了nick_name和phone的基本信息的
        let promise = new Promise((resolve, reject) => {
          this.$superApp.post('/api/auth/get_platform_token.html', params, res => {
            let data = res.data;
            resolve(data);
          }, err => {
            reject(err);
          })
        })
        return promise;
      },
      async signWithSuperApp(superAppParams) {
        await this.getSuperAppInfo(superAppParams).then(data => {

          console.log('超a的userInfo请求：', data);
          let params = {
            phone: superAppParams.phone,
            userProfile: {
              nickname: data.nick_name,
              headimgurl: data.header_image,
              link_user_phone: data.recomd_phone,
            }
          }

          this.$get('/superApp/auth', params, res => {
            setTimeout(() => {
              uni.showToast({
                title: '操作成功',
                icon: 'success',
                mask: true
              })
              setTimeout(() => {
                // #ifdef H5
                window.location.replace('/', true);
                // #endif
                // #ifndef H5
                uni.reLaunch({
                  url: '/pages/index/index'
                })
                // #endif
              }, 1500)
            }, this.$toastDelay);
          })

        });
      },
      getSuperAppInfo(params) {
        let promise = new Promise((resolve, reject) => {
          this.$superApp.post('/api/auth/get_user_info.html', params, res => {
            let data = res.data;
            resolve(data);
          }, err => {
            reject(err);
          })
        })
        return promise;
      },

      getUserInfoBySuperAppAuth(superAppParams) {
        let params = {
          phone: superAppParams.phone
        }
        this.$get('/superApp/auth', params, res => {
          if(res.data && res.data.need_auth) {
            uni.showModal({
              title: '提示',
              content: '这是您第一次进入本商城，商城将复用当前您的APP用户信息',
              showCancel: false,
              success: res => {
                this.signWithSuperApp(superAppParams);
              }
            })
            return;
          }
          let data = res.data;
          //#ifdef H5
          data.real_uid = data.uid;
          if(data.primary_uid) data.uid = data.primary_uid; //同步过，改写uid
          // #endif
          let userInfo = data;
          this.userInfo = userInfo;
          uni.setStorageSync('userInfo', data);
          uni.setStorageSync('token', {
            token: data.token,
            time: new Date().getTime()
          })
        })
      },
      // #endif


      getAsync(key, handler) {
        let params = {
          key: key
        }
        this.$spost('/home/dynamicParams', params, res => {
          if(handler && typeof handler == 'function') handler(res.data || false);
        }, err => {
          if(handler && typeof handler == 'function') handler();
        }, true)
      },
      bindSharer(link_uid) {
        let params = {
          link_uid: link_uid,
          uid: uni.getStorageSync('userInfo').uid
        }
        this.$spost('/user/bind', params, res => {})
      },

      getHomeTop(firstPageData = false) {
        if(firstPageData && firstPageData.top) {
          return this.initTopData(firstPageData.top);
        }
        this.$get('/home/top', null, res => {
          let data = res.data;
          this.initTopData(data);
        }, err => {
          this.topLoad = true;
          this.initTabFixed();
        })
      },
      initTopData(data) {
        let hasLoad = this.screenBanner && this.screenBanner.image ? true : false;

        this.banners = data.banner || [];
        let memberBackground = {};
        for(let i = 0; i < data.memberBackground.length; i++) {
          memberBackground[data.memberBackground[i].level] = data.memberBackground[i].background;
        }
        this.memberBackground = memberBackground || {};
        uni.setStorageSync('memberBackground', memberBackground);
        this.entrances = data.entrance || [];
        this.brandSpaceBackGround = data.brandSpaceBackGround || '';
        this.screenBanner = data.screenBanner.image ? data.screenBanner : {};
        let screenBanner = uni.getStorageSync('screenBanner') || {};
        if(this.screenBanner.image && !hasLoad) {
          this.showScreen = true;

          // // 12小时内不再显示
          // let date = moment().utc().utcOffset(480).format('YYYY-MM-DD HH:mm:ss');
          // let lastDate = screenBanner.date ? moment(screenBanner.date).format('YYYY-MM-DD HH:mm:ss') : null;
          // if(!lastDate || moment(date).diff(lastDate, 'hours') > 11) {
          //   this.showScreen = true;
          //   this.screenBanner.date = date;
          //   uni.setStorageSync('screenBanner', this.screenBanner);
          // }
        }

        this.topLoad = true;
        this.initTabFixed();
      },

      getActives(firstPageData = false) {
        if(firstPageData && firstPageData.list) {
          return this.initListData(firstPageData.list);
        }
        this.$get('/home/list', null, res => {
          let data = res.data;
          this.initListData(data);

        }, err => {
          this.activeLoad = true;
          this.initTabFixed();
        })
      },

      initListData(data) {
        let activeList = {};

        for(let i = 0; i < data.activity.length; i++) {
          if(data.activity[i].id == 1) {
            activeList.limit_buys = data.activity[i];
            if(!activeList.limit_buys.timeList) activeList.limit_buys.timeList = [];

            for(let i = 0; i < activeList.limit_buys.timeList.length; i++) {
              if(activeList.limit_buys.timeList[i].is_selected == 1) {
                this.limitTimeIndex = i;
                activeList.limit_buys.timeList[i].cd = activeList.limit_buys.cd;
              }
              // 显示昨天明天明天
              activeList.limit_buys.timeList[i].timeText = moment(activeList.limit_buys.timeList[i].time).format('MM/DD');
              if(activeList.limit_buys.timeList[i].start_time_node) {
                activeList.limit_buys.timeList[i].timeNode = moment(activeList.limit_buys.timeList[i].start_time_node).format('HH:mm');
              } else {
                activeList.limit_buys.timeList[i].timeNode = '00:00';
              }
            }

          }
        }


        let ppyls = data.ppyl || [];
        this.ppyls = ppyls;

        let specialAreas = data.specialArea || [];
        this.specialAreas = specialAreas;

        let pt = data.pt || [];
        for(let i = 0; i < pt.length; i++) {
          for(let j = 0; j < pt[i].goods.length; j++) {
            let discount = parseFloat(pt[i].goods[j].sale_price) - parseFloat(pt[i].goods[j].activity_price);
            pt[i].goods[j].discount = discount.toFixed(2);
          }
        }
        activeList.pt = pt;

        let brandSpace = data.brandSpace || [];
        activeList.brandSpace = brandSpace;

        let otherActivity = [];
        if(data.otherActivity && data.otherActivity.length > 0) {
          for(let i = 0; i < data.otherActivity.length; i++) {
            otherActivity.push(data.otherActivity[i]);
          }
        }
        activeList.otherActivity = otherActivity;


        this.activeList = activeList;
        this.categories = data.category;


        this.activeLoad = true;
        this.initTabFixed();
        this.tryColdDown(true); //先执行一遍初始化倒计时样式显示
        this.initColdDownInterval();  //初始化倒计时触发器

      },

      getActiveInfos(activityKey, aId) {
        let params = {
          aId: aId,
          keyword: ''
        }
        params.start_time = this.activeList[activityKey].timeList[this.limitTimeIndex].time;

        this.$get('/home/activityInfo', params, res => {
          this.activeList[activityKey].goods = res.data.goods;
          this.activeList[activityKey].timeList[this.limitTimeIndex].cd = res.data.cd;
          this.tabTop = null;
          this.initTabFixed();
          this.tryColdDown();
        })
      },


      getSpecialAreas(type) {
        let params = {
          type: type
        }

        this.$get('/specialArea/list', params, res => {
          this.specialAreas = res.data || [];
          this.tabTop = null;
          this.initTabFixed();
          this.tryColdDown();
        })
      },

      getList() {
        if(this.productLoading) return;
        if(this.currentPage > this.pageTotal) return;
        let params = {
          keyword: '',
          category_code: this.categories[this.typeTabIndex] ? this.categories[this.typeTabIndex].code : null,
          page: this.currentPage
        }
        if(!params.category_code) delete(params.category_code);
        this.productLoading = true;
        this.productRequestTask = this.$sget('/goods/list', params, res => {
          this.productLoading = false;
          if(!this.productInit) this.productInit = true;
          this.currentPage += 1;
          if(res.data.length == 0) {
            this.initTabFixed(() => {
              this.scrollTop = this.scrollTop == this.tabTop + 16 ? this.tabTop + 15 : this.tabTop + 16;
            });
            return;
          };

          this.products.push(...res.data.list);

          for(let i = 0; i < res.data.list.length; i++) {
            if(this.productLeft.length <= this.productRight.length) {
              this.productLeft.push(res.data.list[i]);
            } else {
              this.productRight.push(res.data.list[i]);
            }
          }

          this.pageTotal = res.data.pageTotal;

          this.initTabFixed(() => {
            this.scrollTop = this.scrollTop == this.tabTop + 16 ? this.tabTop + 15 : this.tabTop + 16;
          });


        }, err => {
          this.productLoading = false;
          this.initTabFixed(() => {
            this.scrollTop = this.scrollTop == this.tabTop + 16 ? this.tabTop + 15 : this.tabTop + 16;
          });
        })
      },
      reGetList() {
        this.reloadList = true;
        this.currentPage = 1;
        this.pageTotal = 1;
        this.products = [];
        this.productLeft = [];
        this.productRight = [];
        this.getList();
      },

      initColdDownInterval() {
        if(this.coldDownInterval) clearInterval(this.coldDownInterval);
        this.coldDownInterval = setInterval(() => {
          this.tryColdDown();
        }, 1000)
      },
      tryColdDown(forceInitTab = false) {
        let areas = JSON.parse(JSON.stringify(this.specialAreas || []));
        if(areas.length == 0 && this.coldDownInterval) return clearInterval(this.coldDownInterval);
        for(let i = areas.length - 1; i >= 0; i--) {
          let date = moment().utc().utcOffset(480).format('YYYY-MM-DD HH:mm:ss');
          let timeSpan = moment(areas[i].end_time).diff(moment(date), 'seconds');
          if(timeSpan <= 0) {
            areas.splice(i, 1);
          } else {
            let duration = moment.duration(timeSpan, 'seconds');
            let timeout = [];
            timeout.push(duration.days() >= 10 ? duration.days() : `0${duration.days()}`);
            timeout.push(duration.hours() >= 10 ? duration.hours() : `0${duration.hours()}`);
            timeout.push(duration.minutes() >= 10 ? duration.minutes() : `0${duration.minutes()}`);
            timeout.push(duration.seconds() >= 10 ? duration.seconds() : `0${duration.seconds()}`);
            areas[i].timeout = timeout;
            // let time_texts = [];
            // if(duration.days() > 0) time_texts.push(`${duration.days()}天`);
            // if(duration.hours() > 0) time_texts.push(`${duration.hours()}小时`);
            // if(duration.minutes() > 0) time_texts.push(`${duration.minutes()}分钟`);
            // // if(duration.seconds() > 0) time_texts.push(`${duration.seconds()}秒`); //不显示秒了
            // areas[i].coldDown = time_texts;
          }

        }

        this.specialAreas = areas;

        let activeList = JSON.parse(JSON.stringify(this.activeList || {}));
        let hasSplice = false;  //是否有某些项是被删掉了，如果有的话可能会影响吸顶效果，需要额外处理
        let activityKeys = Object.keys(activeList);  //获取所有活动键
        let activityValues = Object.values(activeList);  //获取所有活动对应值
        for(let i = 0; i < activityKeys.length; i++) {
          if(!activityValues[i] || activityValues[i].length == 0) continue; //这个活动里面没有任何信息，空的。直接检查下一个

          let date = moment().utc().utcOffset(480).format('YYYY-MM-DD HH:mm:ss');
          if(Array.isArray(activityValues[i])) {  //检查是不是数组
            // 是数组轮询内部数组项
            for(let j = 0; j < activityValues[i].length; j++) {
              if(!activityValues[i][j].limit_type || activityValues[i][j].limit_type !== 1) continue;  //无时间限制不处理，跳出
              if(!activityValues[i][j].goods) continue;   //底下无商品，直接跳过
              for(let k = activityValues[i][j].goods.length - 1; k >= 0; k--) {  //轮询产品
                // 以下对产品的截止时间进行格式化操作
                let activityGoods = activityValues[i][j].goods[k];

                let startSpan = moment(date).diff(activityGoods.start_time);
                // 如果小于0，就是没有开始
                if(startSpan < 0) {
                  activityValues[i][j].goods[k].start = false;
                } else {
                  activityValues[i][j].goods[k].start = true;
                }

                let timeSpan = moment(activityGoods.end_time).diff(date, 'seconds');
                let duration = moment.duration(timeSpan, 'seconds');
                if(duration <= 0) {
                  activityValues[i][j].goods.splice(k, 1);
                  hasSplice = true; //该重新确定吸顶触发条件啦
                  continue; //因为小于0了，该活动就该失效啦。查看下一个
                }
                let coldDown = [];
                coldDown.push(duration.days() >= 10 ? duration.days() : `0${duration.days()}`);
                coldDown.push(duration.hours() >= 10 ? duration.hours() : `0${duration.hours()}`);
                coldDown.push(duration.minutes() >= 10 ? duration.minutes() : `0${duration.minutes()}`);
                coldDown.push(duration.seconds() >= 10 ? duration.seconds() : `0${duration.seconds()}`);
                activityValues[i][j].goods[k].coldDown = coldDown;

              }
            }
          } else {
            // 如果不是数组，就是对象。不用轮询多一层
            if(!activityValues[i].goods) continue;
            if(!activityValues[i].limit_type || activityValues[i].limit_type !== 1) continue;  //无时间限制不处理，跳出
            for(let k = activityValues[i].goods.length - 1; k >= 0; k--) {
              // 以下对产品的截止时间进行格式化操作
              let activityGoods = activityValues[i].goods[k];

              let startSpan = moment(date).diff(activityGoods.start_time);
              // 如果小于0，就是没有开始
              if(startSpan < 0) {
                activityValues[i].goods[k].start = false;
              } else {
                activityValues[i].goods[k].start = true;
              }

              let timeSpan = moment(activityGoods.end_time).diff(date, 'seconds');
              let duration = moment.duration(timeSpan, 'seconds');
              if(duration <= 0) {
                activityValues[i].goods.splice(k, 1);
                hasSplice = true; //该重新确定吸顶触发条件啦
                continue; //因为小于0了，该活动就该失效啦。查看下一个
              }
              let coldDown = [];
              coldDown.push(duration.days() >= 10 ? duration.days() : `0${duration.days()}`);
              coldDown.push(duration.hours() >= 10 ? duration.hours() : `0${duration.hours()}`);
              coldDown.push(duration.minutes() >= 10 ? duration.minutes() : `0${duration.minutes()}`);
              coldDown.push(duration.seconds() >= 10 ? duration.seconds() : `0${duration.seconds()}`);
              activityValues[i].goods[k].coldDown = coldDown;
            }
          };
          activeList[activityKeys[i]] = activityValues[i];
        }

        // 限购的时间检验
        if(activeList.limit_buys) {
          let date = moment().utc().utcOffset(480).format('YYYY-MM-DD HH:mm:ss');
          for(let i = 0; i < activeList.limit_buys.timeList.length; i++) {
            // 检查是否开始
            // let time = moment(activeList.limit_buys.timeList[i].time).diff(moment(date));
            let time = moment(activeList.limit_buys.timeList[i].start_time_node).diff(moment(date));

            if(time < 0 && !activeList.limit_buys.timeList[i].start) {
              activeList.limit_buys.timeList[i].start = true;
            }
          }
          // 更新选中那个时间的显示
          if(
            activeList.limit_buys.timeList[this.limitTimeIndex] &&
            activeList.limit_buys.timeList[this.limitTimeIndex].cd &&
            activeList.limit_buys.timeList[this.limitTimeIndex].start
          ) {
            let timeSpan = moment(activeList.limit_buys.timeList[this.limitTimeIndex].cd).diff(date, 'seconds');
            let duration = moment.duration(timeSpan, 'seconds');
            if(duration <= 0) {
              activeList.limit_buys.timeList[this.limitTimeIndex].coldDown = moment(activeList.limit_buys.timeList[this.limitTimeIndex].time).format('MM/DD');
            } else {
              let coldDown = [];
              let hours = duration.hours();
              if(duration.days() && duration.days() > 0) hours += duration.days() * 24; //因为不显示日期，将日期加到小时中
              coldDown.push(hours >= 10 ? hours : `0${hours}`);
              coldDown.push(duration.minutes() >= 10 ? duration.minutes() : `0${duration.minutes()}`);
              coldDown.push(duration.seconds() >= 10 ? duration.seconds() : `0${duration.seconds()}`);
              activeList.limit_buys.timeList[this.limitTimeIndex].coldDown = coldDown.join(':');
            }

          }
        }

        this.activeList = activeList;   //检查完数据的活动商品列表

        if(hasSplice || forceInitTab) {
          this.tabTop = null;
          this.initTabFixed();
        }

      },

      initTabFixed(hasLoadHandler) {
        if(!this.tabTop) {
          // $nextTick,确保计算位置发生在页面渲染完成时
          if(!this.topLoad || !this.activeLoad) return;
          this.$nextTick(() => {
            setTimeout(() => {
              let query = uni.createSelectorQuery();
              query.select('#type-tabs').boundingClientRect(rect => {
                if(rect) this.tabTop = this.currentScrollTop + rect.top - this.nativeInfo.bannerOffset; //在旧有基础上加上搜索栏高度
              }).exec();

            }, 50)

          })
        } else {
          if(this.reloadList && hasLoadHandler && typeof hasLoadHandler == 'function') {
            this.reloadList = false;
            hasLoadHandler();
          }
        }
      },

      scrolling(e) {
        if(this.tabTop && !this.reloadList) {
          if(e.detail.scrollTop >= this.tabTop) {
            if(!this.showAniTab) {
              this.showAniTab = true;
              // 动态标记点
              // uni.setNavigationBarColor({
              //   backgroundColor: '#ffffff',
              //   frontColor: '#000000'
              // })
            }
          } else {
            if(this.showAniTab) {
              this.showAniTab = false;
              // 动态标记点
              // uni.setNavigationBarColor({
              //   backgroundColor: '#871e0a',
              //   frontColor: '#ffffff'
              // })
            }
          }
        }

        if(!this.searchActive && e.detail.scrollTop >= this.nativeInfo.bannerBottom) {
          this.searchActive = true;
        } else if(this.searchActive && e.detail.scrollTop < this.nativeInfo.bannerBottom) {
          this.searchActive = false;
        }

        this.currentScrollTop = e.detail.scrollTop;
      },
      updateTimeIndex(index) {
        if(this.limitTimeIndex == index) return;
        this.limitTimeIndex = index;
        this.getActiveInfos('limit_buys', this.activeList.limit_buys.id);
      },
      toggleMoreLimitBuy() {
        this.limitBuysMore = !this.limitBuysMore;
        this.$nextTick(() => {
          this.tabTop = null;
          this.initTabFixed();
        })
      },

      updateStoreTabIndex(index) {
        this.specialAreaTabIndex = index;
        // do something
        this.getSpecialAreas(index);
      },


      updateTypeTabIndex(e) {
        this.typeTabIndex = e.currentTarget.dataset.index;

        if(this.productRequestTask) {
          this.productRequestTask.abort();
          this.productRequestTask = null;
          this.productLoading = false;
        }
        // this.scrollTop = this.scrollTop == this.tabTop ? this.tabTop - 1 : this.tabTop;

        this.reGetList();
      },

      updateSwiperIndex(e) {
        this.swiperIndex = e.detail.current;
      },
      updateNewplayerRecommendIndex(e) {
        this.newplayerRecommendIndex = e.detail.current;
      },

      tryBanner(index) {
        this.banners[index].url_type = this.banners[index].type;  //调整跳转类型与入口一致
        this.tryEntrance(this.banners[index]);
      },

      tryQuadrangle(item) {
        if(item.type == -1) return;
        let url = `/market-pages/pages/active/actives/actives?id=${item.url_content}&limit_type=${item.limit_type}`;
        if(item.type == 1) url = `/market-pages/pages/active/actives/actives?id=${item.id}&limit_type=${item.limit_type}`;
        this.validTourist(() => {
          uni.navigateTo({
            url: url
          })
        }, () => {
          uni.setStorageSync('authOriginPage', {
            type: 'navigateTo',
            page: url
          });
        })
      },

      tryEntrance(item) {
        if(item.url_type == -1) return this.undo();
        let url = '/pages/products/products';
        if(item.url_type == 2) {
          url = `/pages/product-detail/product-detail?sn=${item.content}`;
        } else if(item.url_type == 3) {
          url = '/pages/coupons/coupons'
        } else if(item.url_type == 4) {
          url = `/pages/coupon-detail/coupon-detail?code=${item.content}`
        } else if(item.url_type == 6) {
          url = `/market-pages/pages/active/actives/actives?id=${item.content}`
        } else if(item.url_type == 7) {
          url = '/pages/join-products/join-products'
        } else if(item.url_type == 8) {
          url = `/market-pages/pages/brand-space/brand-space/brand-space`
        } else if(item.url_type == 9) {
          url = `/market-pages/pages/brand-space/brand-products/brand-products?id=${item.content}`
        } else if(item.url_type == 10) {
          url = `/market-pages/pages/active/actives/actives?id=${item.content}`
        } else if(item.url_type == 11) {
          url = `/market-pages/pages/active/entrance-static/entrance-static?id=${item.id}`  //入口处这个很特殊，请留意
        } else if(item.url_type == 12) {
          url = `/pages/lives/lives`
        } else if(item.url_type == 13) {
          url = `plugin-private://wx2b03c6e691cd7370/pages/live-player-plugin?room_id=${item.content}&custom_params=`
        } else if(item.url_type == 19) {
          url = `/market-pages/pages/ppyl/ppyls/ppyls?code=${item.content}`
        } else if(item.url_type == 22) {
          url = `/market-pages/pages/special-area/area/area?id=${item.content}`
        } else if(item.url_type == 23) {
          url = `/market-pages/pages/agreement/sign/sign?ag_sn=${item.content}`
        } else if(item.url_type == 709394001) {
          url = `/market-pages/pages/ppyl/ppyl-vip/ppyl-vip`
        } else if(item.url_type == 709394002) {
          url = `/market-pages/pages/healthy-activity/products/products`
        }
        this.validTourist(() => {
          uni.navigateTo({
            url: url
          })
        }, () => {
          uni.setStorageSync('authOriginPage', {
            type: 'navigateTo',
            page: url
          });
        })
      },

      goToScreenDirect() {
        this.showScreen = false;
        if(this.screenBanner.type == 1) return;
        this.screenBanner.url_type = this.screenBanner.content_type;  //调整跳转类型与入口一致
        this.tryEntrance(this.screenBanner);

      },
      switchMe() {
        uni.switchTab({
          url: `/pages/me/me`
        })
      },
      goToSearch() {
        this.validTourist(() => {
          uni.navigateTo({
            url: `/pages/search/search`
          })
        }, () => {
          uni.setStorageSync('authOriginPage', {
            type: 'navigateTo',
            page: `/pages/search/search`
          });
        })
      },
      goToDetail(sn, activity_type, activity_id) {
        let url = `/pages/product-detail/product-detail?sn=${sn}`;
        if(activity_type) url += `&aType=${activity_type}&aId=${activity_id}`;
        uni.navigateTo({
          url: url
        })
      },

      goToActives(id) {
        this.validTourist(() => {
          uni.navigateTo({
            url: `/market-pages/pages/active/actives/actives?id=${id}`
          })
        })
      },
      goToPPYL(code) {
        let url = `/market-pages/pages/ppyl/ppyls/ppyls?code=${code}`;
        this.validTourist(() => {
          uni.navigateTo({
           url: url
          })
        }, () => {
          uni.setStorageSync('authOriginPage', {
            type: 'navigateTo',
            page: url
          });
        })
      },
      goToSpecialArea(id) {
        let url = `/market-pages/pages/special-area/area/area?id=${id}`;
        this.validTourist(() => {
          uni.navigateTo({
           url: url
          })
        }, () => {
          uni.setStorageSync('authOriginPage', {
            type: 'navigateTo',
            page: url
          });
        })
      },
      undo() {
        uni.showToast({
          title: '即将开放敬请期待',
          icon: 'none',
          mask: true
        })
      },
      // 选择用户
      triggerUserSelect(tab) {
        this.showUserLoginPopup = false
        if (tab === 'new') {
          // 新用户 --跳转到授权
          //#ifdef MP-WEIXIN
          uni.reLaunch({
            url: '/pages/auth/auth'
          })
          //#endif
          //#ifdef H5
          if (this.$jwx && this.$jwx.isWechat()) {
            const params = {
              userChose: 1,
              wx_data: this.h5SignData
            };
            this.getAuth(params, () => {
              this.initIndexLogic(this.loadOptions);
            });
          } else {
            let _thirdEnv = uni.getStorageSync('_thirdEnv');
            if (window && _thirdEnv == 'superApp') {
              const param = {
                user_id: this.h5SignData.user_id,
                code: this.h5SignData.code,
                app_label: this.h5SignData.app_label,
                phone: this.h5SignData.phone,
                userProfile: {
                  nickName: this.h5SignData.nickName,
                  avatarUrl: this.h5SignData.avatarUrl
                }
              }
              this.tryLoginBySuperApp(param, (resData) => {
                if (resData.isChose) {
                  // h5弹出登录弹窗
                  this.showUserLoginPopup = true;
                  uni.setStorageSync('h5SignData', {
                    avatarUrl: resData.avatarUrl,
                    nickName: resData.nickName,
                  });
                } else {
                  this.initIndexLogic(this.loadOptions);
                }
              });
            }
          }
          //#endif
        } else if (tab === 'legacy') {
          uni.reLaunch({
            url: `/pages/user-legacy-synchronous/user-legacy-synchronous?type=1`
          })
        }
      },
      // 验证游客身份，阻止进入下一级页面
      validTourist(callback, preHanlder) {
        config.getPrivacy(() => {
          let userInfo = uni.getStorageSync('userInfo');
          if(userInfo.need_auth) {
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
          } else {
            if(callback && typeof callback == 'function') callback();
          }
        }, this)
      },
    }
  }
</script>

<style lang="scss" scoped>
@import 'index.scss';

.store {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;

}
</style>


