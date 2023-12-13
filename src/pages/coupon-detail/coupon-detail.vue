<template>
  <view v-show="coupon.name" class="uni-common-pb-withbtn coupons-page">
    <!-- 优惠券卡片展示 -->
    <view class="coupons">
      <view class="coupon">
        <image class="coupon-bg" src="/static/images/bg_coupon.png" mode="widthFix"></image>
        <view class="coupon-content">
          <view class="coupon-intro">
            <view class="coupon-info">
              <view class="coupon-name">{{coupon.name}}</view>
              <view class="coupon-price-info">
                <view v-if="coupon.with_amount == 0">无使用限制</view>
                <view v-if="coupon.with_amount > 0">超过<text class="coupon-price-limit">{{coupon.with_amount}}</text>可用</view>
              </view>
            </view>
          </view>
          <view class="coupon-ctrl">
            <view v-if="coupon.type != 4" class="coupon-price">
              <text class="coupon-symbol">￥</text>              
              <text class="coupon-value">{{parseFloat(coupon.used_amount)}}</text>
            </view>
            <view v-if="coupon.type == 4" class="coupon-price coupon-discount">              
              <text class="coupon-value">{{parseFloat(coupon.with_discount) * 1000 / 100}}</text>
              <text class="coupon-discount-symbol">折</text>
            </view>
          </view>
        </view>
      </view>
    </view>

    <view class="coupon-detail-info">
      <view class="coupon-detail-item">
        <view class="coupon-detail-label">卡券名称</view>
        <view class="coupon-detail-value">{{coupon.name}}</view>
      </view>
      <view class="coupon-detail-item">
        <view class="coupon-detail-label">卡券类型</view>
        <view class="coupon-detail-value">{{coupon.u_name}}-{{coupon.t_name}}</view>
      </view>

      <view class="coupon-detail-item">
        <view class="coupon-detail-label">卡券内容</view>
        <view class="coupon-detail-value">{{couponTypeContent(coupon)}}</view>
      </view>
      <view class="coupon-detail-item" v-if="coupon.type == 4">
        <view class="coupon-detail-label">最高可抵</view>
        <view class="coupon-detail-value">
          <text class="coupon-price-limit">{{coupon.used_amount}}</text>
        </view>
      </view>

      <!-- 类目券 -->
      <view class="coupon-detail-item" v-if="coupon.used == 20">
        <view class="coupon-detail-label">适用类目</view>
        <view class="coupon-detail-value">
          <view v-for="item in coupon.category" class="coupon-detail-category" :key="item.code">{{item.name}}</view>
        </view>
      </view>
      <!-- 商品券 -->
      <view class="coupon-detail-item" v-if="coupon.used == 30">
        <view class="coupon-detail-label">适用商品</view>
        <view class="coupon-detail-value">
          <view v-for="item in coupon.goods" class="coupon-detail-category" :key="item.sku_sn">{{item.name}}</view>
        </view>
      </view>


      <view class="coupon-detail-item">
        <view class="coupon-detail-label">领取时间</view>
        <view class="coupon-detail-value">{{coupon.start_time}} 至 {{coupon.end_time}}</view>
      </view>
      
      
      <view class="coupon-detail-item">
        <view class="coupon-detail-label">使用限制</view>
        <view class="coupon-detail-value" v-if="coupon.with_amount == 0">无使用限制</view>
        <view class="coupon-detail-value" v-if="coupon.with_amount > 0">超过<text class="coupon-price-limit">{{coupon.with_amount}}</text>可用</view>
      </view>
       <view class="coupon-detail-item">
        <view class="coupon-detail-label">特殊</view>
        <view class="coupon-detail-value">
          <view>{{coupon.with_special == 1 ? '可用' : '不可用'}}于特殊商品</view>
        </view>
      </view>
      
      
      
    </view>
 
    <view v-if="coupon.take_auth == 1 && from == 'list'" class="bottom-btns">
      <view class="bottom-btn get-btn" @tap="receiveCoupon">
        领取使用
      </view>
    </view>
  </view>

</template>

<script>
export default {
  data() {
    return {
      from: 'list',
      
      coupon: {},
    }
  },
  onShareAppMessage() {
    let userInfo = uni.getStorageSync('userInfo');
    let shareInfo = {}

    let target = '/pages/coupons/coupons';
    let path = `/pages/index/index?redirect=${encodeURIComponent(target)}`;
    if(userInfo.uid) path += `&link_uid=${userInfo.uid}`;
    shareInfo = {
      title: `美丽生活，点击开启`,
      desc:  `厂盟口`,
      path: path
    }
    if(this.coupon && this.coupon.show_status == 1) {
      shareInfo = this.$getShareInfo();
      if(shareInfo.imageUrl) delete shareInfo.imageUrl;
    }
    
    if(this.from == 'myself') {
      shareInfo = {
        title: `美丽生活，点击开启`,
        desc:  `厂盟口`,
        imageUrl: '/static/images/share.jpg',
        path: `/pages/index/index?link_uid=${userInfo.uid}`
      }
    }

    return shareInfo;
  },
  onLoad(options) {
    if(!options.code) {
      uni.showToast({
        title: '不要尝试啦，正在返回首页',
        icon: 'none',
        mask: true
      })
      setTimeout(() => {
        uni.reLaunch({
          url: '/pages/index/index'
        })
      }, 1500);
      return;
    }
    if(options.from) this.from = options.from;
    this.getData(options.code)
  },
  methods: {
    getData: function(code){
      let params = {
        code: code,
        uid: uni.getStorageSync('userInfo').uid
      }
      this.$get('/coupon/info', params, res => {
        let coupon = res.data;
        if(coupon && coupon.goods && coupon.goods.length > 0) {
          for(let i = 0; i < coupon.goods.length; i++) {
            coupon.goods[i].name = coupon.goods[i].title;
            if(!coupon.goods[i].specs) continue;
            let specs = JSON.parse(coupon.goods[i].specs);
            let values = Object.values(specs);
            coupon.goods[i].name += `(${values.join('、')})`;
          }
        }
        this.coupon = coupon;
        setTimeout(() => {
          if(!this.coupon || !this.coupon.name) {
            uni.showToast({
              title: '优惠券已失效',
              icon: 'none',
              mask: true
            })
            setTimeout(() => {
              uni.navigateBack();
            }, 1500)
          }
        }, 50)
        
      })
    },
    couponTypeContent(item) {
      if(item.t_type == 1) {
        return `满${item.with_amount}减${item.used_amount}`
      } else if(item.t_type == 2) {
        return `满${item.with_amount}减${item.used_amount}`
      } else if(item.t_type == 3) {
        return `无门槛减${item.used_amount}`
      } else if(item.t_type == 4) {
        return `打折券${item.with_discount * 1000 / 100}折`
      } else if(item.t_type == 5) {
        return item.with_condition === 1 ? `满${item.with_amount}抵扣${item.used_amount}` : `抵扣${item.used_amount}`;
      } else {
        return ''
      }
    },
    receiveCoupon() {
      let params = {
        code: this.coupon.code,
        uid: uni.getStorageSync('userInfo').uid,
        take_number: 1
      }
      this.$post('/coupon/receive', params, res => {
        setTimeout(() => {
          uni.showToast({
            title: '领取成功',
            mask: true
          })
          setTimeout(() => {
            this.getData(this.coupon.code);
          }, 1800)
        }, this.$toastDelay)
        
      })
    }


    
  }
}
</script>

<style lang="scss" scoped>
  @import 'coupon-detail.scss';
</style>