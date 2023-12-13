<template>
  <view class="order-page">
    <swiper v-if="logistics.length > 1" class="swiper-box" :current="swiperIndex" @change="updateSwiperIndex">
      <swiper-item v-for="item in logistics" :key="item.code">

        <view class="swiper-item">
          <view class="logistics-info-box">
            <image class="logistics-info-bg" src="/static/images/bg/bg_logistics.png"></image>
            <view class="logistics-info">
              <image class="logistics-info-icon" src="/static/images/logistics_car.png"></image>
              <view class="logistics-info-content">
                <view class="logistics-servicer-info">
                  <view class="logistics-servicer-title">物流状态：</view>
                  <view class="logistics-servicer logistics-status">{{item.logistics[0].node_status}}</view>
                </view>
                <view class="logistics-servicer-info">
                  <view class="logistics-servicer-title">承运公司：</view>
                  <view class="logistics-servicer">{{item.logistics[0].company_name}}</view>
                </view>
                <view class="logistics-servicer-info">
                  <view class="logistics-servicer-title">物流单号：</view>
                  <view class="logistics-servicer">{{item.code}}</view>
                  <image class="logistics-copy" src="/static/images/copy.png" :data-code="item.code" @tap="tryCopy"></image>
                </view>
              </view>
              
            </view>
          </view>
          <view class="logistics-list">
            <view class="logistics-list-title">物流跟踪</view>
            <view>
              <view v-for="(logisticsItem, logisticsIndex) in item.logistics" class="logistics-item" :key="logisticsItem.id">
                <view class="logistics-icon-box">
                  <view class="logistics-line-prev" :class="{'transparent-line': logisticsIndex == 0}"></view>
                  <view class="logistics-dot" :class="{'first-dot': logisticsIndex == 0}"></view>
                  <view class="logistics-line-next" :class="{'transparent-line': logisticsIndex == currentLogistics.logistics.length - 1}"></view>
                </view> 
                <view class="logistics-content">
                  <view class="logistics-title">{{logisticsItem.content}}</view>
                  <view class="logistics-date">{{logisticsItem.node_time}}</view>
                </view>
              </view>
            </view>
          </view>
        </view>

        
      </swiper-item>
    </swiper>
    <view v-show="logistics.length > 1 && swiperIndex > 0" class="logistics-swiper-ctrl-prev">
      <image class="logistics-ctrl-icon" src="/static/images/swiper_prev.png" @tap="swiperToPrev"></image>
    </view>
    <view v-show="logistics.length > 1 && swiperIndex < currentLogistics.logistics.length - 1" class="logistics-swiper-ctrl-next">
      <image class="logistics-ctrl-icon" src="/static/images/swiper_next.png" @tap="swiperToNext"></image>
    </view>

    <!-- 只有一个的时候 -->
    <view v-if="logistics.length == 1">
      <view v-if="currentLogistics.logistics" class="logistics-info-box">
          <image class="logistics-info-bg" src="/static/images/bg/bg_logistics.png"></image>
          <view class="logistics-info">
            <image class="logistics-info-icon" src="/static/images/logistics_car.png"></image>
            <view class="logistics-info-content">
              <view class="logistics-servicer-info">
                <view class="logistics-servicer-title">物流状态：</view>
                <view class="logistics-servicer logistics-status">{{currentLogistics.logistics[0].node_status}}</view>
              </view>
              <view class="logistics-servicer-info">
                <view class="logistics-servicer-title">承运公司：</view>
                <view class="logistics-servicer">{{currentLogistics.logistics[0].company_name}}</view>
              </view>
              <view class="logistics-servicer-info">
                <view class="logistics-servicer-title">物流单号：</view>
                <view class="logistics-servicer">{{currentLogistics.code}}</view>
                <image class="logistics-copy" src="/static/images/copy.png" :data-code="currentLogistics.code" @tap="tryCopy"></image>
              </view>
            </view>
            
          </view>
        </view>
        <view class="logistics-list">
          <view class="logistics-list-title">物流跟踪</view>
          <view>
            <view v-for="(logisticsItem, logisticsIndex) in currentLogistics.logistics" class="logistics-item" :key="logisticsItem.id">
              <view class="logistics-icon-box">
                <view class="logistics-line-prev" :class="{'transparent-line': logisticsIndex == 0}"></view>
                <view class="logistics-dot" :class="{'first-dot': logisticsIndex == 0}"></view>
                <view class="logistics-line-next" :class="{'transparent-line': logisticsIndex == currentLogistics.logistics.length - 1}"></view>
              </view> 
              <view class="logistics-content">
                <view class="logistics-title">{{logisticsItem.content}}</view>
                <view class="logistics-date">{{logisticsItem.node_time}}</view>
              </view>
            </view>
          </view>
        </view>
    </view>

    <!-- 没有物流信息的时候 -->
    <view v-if="hasLoad && logistics.length == 0">
      <view class="logistics-info-box">
          <image class="logistics-info-bg" src="/static/images/bg/bg_logistics.png"></image>
          <view class="logistics-info">
            <image class="logistics-info-icon" src="/static/images/logistics_car.png"></image>
            <view class="logistics-info-content">
              <view class="logistics-servicer-info">
                <view class="logistics-servicer-title">物流状态：</view>
                <view class="logistics-servicer logistics-status">未更新</view>
              </view>
              <view class="logistics-servicer-info">
                <view class="logistics-servicer-title">承运公司：</view>
                <view class="logistics-servicer">未更新</view>
              </view>
              <view class="logistics-servicer-info">
                <view class="logistics-servicer-title">物流单号：</view>
                <view class="logistics-servicer">{{shipping_code}}</view>
                <image class="logistics-copy" src="/static/images/copy.png" :data-code="shipping_code" @tap="tryCopy"></image>
              </view>
            </view>
            
          </view>
        </view>
        <view class="logistics-list">
          <view class="logistics-list-title">物流跟踪</view>
          <view class="logistics-nodata">
            平台已发货，物流更新可能存在延迟，请耐心等待
          </view>
        </view>
    </view>

    

  </view>
    
    

</template>

<script>
import h5Copy from '@/common/junyi-h5-copy.js';
export default {
  data() {
    return {
      shipping_code: null,
      logistics: [],
      order_sn: '',
      currentLogistics: {},
      swiperIndex: 0,
      hasLoad: false
    }
  },
  onShareAppMessage() {
    let shareInfo = this.$getShareInfo();
    return shareInfo;
  },
  onLoad(options) {
    this.shipping_code = options.code;
    this.order_sn = options.sn;
    if(!this.shipping_code) {
      return uni.reLaunch({
        url: '/pages/index/index'
      })
    }
    this.getData();
  },
  methods: {
    getData() {
      let params = {
        shipping_code: this.shipping_code
      };
      this.$get('/ship/info', params, res => {
        let logistics = [];
        let keys = Object.keys(res.data);
        let values = Object.values(res.data);
        for(let i = 0; i < keys.length; i++) {
          let item = {
            code: keys[i],
            logistics: values[i]
          }
          logistics.push(item);
        }
        this.logistics = logistics;
        this.currentLogistics = this.logistics[0];
        this.hasLoad = true;
      }, err => {
        this.hasLoad = true;
      })
    },
    swiperToPrev() {
      let swiperIndex = this.swiperIndex - 1;
      this.swiperIndex = swiperIndex;
    },
    swiperToNext() {
      let swiperIndex = this.swiperIndex + 1;
      this.swiperIndex = swiperIndex;
    },
    updateSwiperIndex(e) {
      setTimeout(() => {
        this.swiperIndex = e.detail.current;
      }, 20)
    },

    tryCopy(e) {
      let code = e.currentTarget.dataset.code;
      // #ifdef H5
       let content = code; // 复制内容，必须字符串，数字需要转换为字符串
       const result = h5Copy(content);
       if (result === true) {
         uni.showToast({
           title:'复制成功',
         })
       } else {
         uni.showToast({
           title:'复制失败',
           icon:'none'
         })
       }
      //  #endif
      // #ifndef H5
      uni.setClipboardData({
        data: code,
        success: res => {
          uni.showToast({
            title:'复制成功',
          })
        },
        fail: err => {
          uni.showToast({
           title:'复制失败',
           icon:'none'
         })
        }
      })
      // #endif
    }
  }

}
</script>
<style>
  /* #ifndef H5 */
  page {
    height: 100vh;
  }
  /* #endif */
</style>
<style lang="scss" scoped>
  @import 'logistics.scss';
</style>