<template>
  <view class="flex-page" :class="'usertype-bg-' + vip_level">
    <!-- 页面内容 -->
    <view class="flex-page-content">
      <scroll-view 
        scroll-y 
        class="tab-page-scroll">

        <view v-if="activityInfos.poster && activityInfos.poster !== ''" class="join-products-bg-box">
          <image class="join-products-bg" :src="activityInfos.poster" webp lazy-load></image>
        </view>

        <view class="join-products-title">
          <view>{{title}}</view>
        </view>
        <view class="product-list">
          <view v-for="item in dataList" class="product" :key="item.goods_sn" @tap="goToDetail(item.goods_sn, 1, item.activity_id)">
            <view class="product-img-box">
              <image class="product-img" :src="item.image" mode="widthFix" webp lazy-load></image>
              <view class="product-baseinfo">
                <view class="product-title">{{item.title}}</view>
                <view v-if="item.sub_title" class="product-subtitle">{{item.sub_title}}</view>
              </view>
            </view>
            <view class="product-infos">
              <view class="product-info">
                <view class="product-vals">
                  <view class="product-val-title">限时活动价:</view>
                  <view class="product-val-sign">￥</view>
                  <view class="product-val">{{item.activity_price || '0.00'}}</view>
                </view>
                <view v-if="item.market_price && item.activity_price !== item.market_price" class="product-vals unactive">
                  <view class="product-val-title">原价:</view>
                  <view class="product-val-sign">￥</view>
                  <view class="product-val">{{item.market_price || '0.00'}}</view>
                </view>
              </view>
              <view v-if="item.is_start" class="product-ctrl">立即购买</view>
              <view v-else class="product-ctrl disabled">即将开卖</view>
            </view>
            
          </view>
        </view>

      </scroll-view>

    </view>
  </view>
</template>
<script>
import moment from 'moment';

export default {
  data() {
    return {
      vip_level: 0,
      title: 'LV1直升礼包专区',

      dataList: [],
      activityInfos: {
        poster: ''
      },

      dataLoading: false,
      
    }
  },
  onShareAppMessage() {
    let userInfo = uni.getStorageSync('userInfo');
    let shareInfo = this.$getShareInfo();
    // 普通人能推普通人
    // if(!userInfo.vip_level) {
    //   shareInfo = {
    //     title: `美丽生活，点击开启`,
    //     desc:  `厂盟口`,
    //     path: `/pages/index/index`
    //   }
    //   uni.showModal({
    //     title: '提示',
    //     content: '分享无效。您的身份不是VIP或其他代理人身份，他人将无法通过您分享出来的消息进入该列表并与你创建关联关系。请注意',
    //     showCancel: false
    //   })
    // }
    console.log(shareInfo);


    return shareInfo;
  },
  onLoad(options) {
    if(options.vip_level) this.vip_level = options.vip_level;
    if(this.vip_level == 3) {
      this.title = 'LV2直升礼包专区'
    } else if(this.vip_level == 0) {
      this.title = 'LV1直升礼包专区'
    }
    uni.setNavigationBarTitle({
      title: this.title
    })
    if(uni.getStorageSync('userInfo').uid) {
      this.getUserInfo();
    }
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
        uid: uni.getStorageSync('userInfo').uid,
        vip_level: this.vip_level
      }
      this.dataLoading = true;
      this.$get('/home/memberActivity', params, res => {
        this.dataLoading = false;
        if(res.data.info) this.activityInfos.poster = res.data.info.poster;
        if(!res.data || res.data.goods.length == 0) return;
        let dataList = res.data.goods;
        for(let i = 0; i < dataList.length; i++) {
          dataList[i].is_start = moment(dataList[i].start_time).diff(moment()) < 0 ? true : false;
        }
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
    goToDetail(sn, activity_type, activity_id) {
      if(uni.getStorageSync('userInfo').need_auth) {
        return uni.showModal({
          title: '提示',
          content: `为了更好的为您提供服务，${this.$name}需要您的身份信息授权。`,
          confirmText: '前往授权',
          success: res => {
            if(res.confirm) {
              uni.setStorageSync('redirect', '%2Fpages%2Fjoin-products%2Fjoin-products');
              uni.reLaunch({
                url: '/pages/auth/auth'
              })
            }
          }
        })
      }
      // if(uni.getStorageSync('userInfo').vip_level && (uni.getStorageSync('userInfo').vip_level < this.vip_level || this.vip_level == 0)) {
      //   return uni.showModal({
      //     title: '提示',
      //     content: '您不符合活动的相关要求，无法参与活动哦',
      //     showCancel: false
      //   })
      // } else if (uni.getStorageSync('userInfo').vip_level === 0 && this.vip_level > 0) {
      //   let link_uid = uni.getStorageSync('userInfo').link_superior_user;
      //   if(!link_uid) link_uid = uni.getStorageSync('link_uid');
      //   if(!link_uid) {
      //     return uni.showModal({
      //       title: '提示',
      //       content: '该直升大礼包要求有绑定上级或者从高级别会员分享链接中进入小程序才可以购买哦',
      //       showCancel: false
      //     })
      //   }
      // }
      let url = `/pages/product-detail/product-detail?sn=${sn}`;
      if(activity_type) url += `&aType=${activity_type}&aId=${activity_id}`;
      uni.navigateTo({
        url: url
      })
    }
  }
  
}
</script>

<style lang="scss" scoped>
@import 'join-products.scss';
</style>