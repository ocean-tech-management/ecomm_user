<template>
  <view class="flex-page coupons-page">
    <view>
      <view class="tabs">
        <view :class="'tab ' + (tabIndex == 3 ? 'active' : '')" data-id="3" @tap="updateTabIndex">
          已使用
        </view>
        <view :class="'tab ' + (tabIndex == 4 ? 'active' : '')" data-id="4" @tap="updateTabIndex">
          已过期
        </view>

      </view>
    </view>
    <view class="tab-pages">

      
      <view class="tab-page">
        <scroll-view scroll-y class="tab-page-scroll" @scrolltolower="getCoupons">
          <view class="coupons my-coupon">
            <view v-for="item in coupons" class="coupon" :data-code="item.coupon_code" :key="item.coupon_code" @tap="goToDetail">
                <image class="coupon-bg" src="/static/images/bg_mycoupon2.png" mode="widthFix"></image>
                <view class="coupon-content">
                  <view class="coupon-intro">
                    <view class="coupon-info">
                      
                      <!-- u_type: 10 平台优惠券 -->
                      <view v-if="item.coupon_used == 10" class="coupon-name"><view class="coupon-tag-all">全品类</view>{{item.coupon.name}}</view>
                      <!-- u_type: 20 类目优惠券 -->
                      <view v-if="item.coupon_used == 20" class="coupon-name">指定类目：{{item.coupon.name}}</view>
                      <!-- u_type: 30 商品优惠券 -->
                      <view v-if="item.coupon_used == 30" class="coupon-name">指定商品：{{item.coupon.name}}</view>
                      <view class="coupon-price-info">
                        <view v-if="item.coupon.with_amount == 0">无使用限制</view>
                        <view v-if="item.coupon.with_amount > 0">超过<text class="coupon-price-limit">{{item.coupon.with_amount}}</text>可用</view>
                      </view>
                      <view class="coupon-validtime-info">
                        <view class="coupon-validtime">{{item.valid_start_time_sample}} - {{item.valid_end_time_sample}}</view>
                      </view>
                    </view>
                  </view>
                  <view class="coupon-ctrl">
                    <view v-if="item.coupon_type != 4" class="coupon-price">
                      <text class="coupon-symbol">￥</text>
                      <text class="coupon-value">{{parseFloat(item.coupon.used_amount)}}</text>
                    </view>
                    <view v-if="item.coupon_type == 4" class="coupon-price coupon-discount">
                      <text class="coupon-value">{{parseFloat(item.coupon.with_discount) * 1000 / 100}}</text>
                      <text class="coupon-symbol">折</text>
                    </view>
                    <view v-if="item.coupon_type == 4" class="coupon-discount-limit">
                      最高抵<text class="coupon-price-limit">{{item.coupon.used_amount || 0}}</text>
                    </view>
                    <!-- <view class="use-now">立即使用</view> -->
                  </view>
              </view>
              <image class="coupon-disable-tag" :src="'/static/images/imgs/watermark' + (tabIndex == 3 ? 1 : 2) + '.png'"></image>
            </view>

          </view>
          
          <view v-if="coupons.length > 0 && currentPage > pageTotal && !couponLoading" class="scroll-tips">已经到底啦</view>
          <view v-if="coupons.length == 0 && currentPage > pageTotal && !couponLoading" class="scroll-tips">暂无相关优惠券哦</view>
        </scroll-view>
      </view>



    </view>
  </view>

</template>

<script>
import moment from 'moment';
export default {
  data() {
    return {
      currentPage: 1,
      pageTotal: 1,
      tabIndex: 3,
      coupons: [],
      couponLoading: false
    }
  },
  onShareAppMessage() {
    let shareInfo = this.$getShareInfo();
    return shareInfo;
  },
  onLoad(options) {
    if(options.me) this.tabIndex = 1;
    this.getCoupons();
    
  },
  methods: {
    getCoupons() {
      if(this.currentPage > this.pageTotal) return;
      let params = {
        page: this.currentPage,
        uid: uni.getStorageSync('userInfo').uid,
        type: this.tabIndex
      }
      this.couponLoading = true;
      this.$get('/user/coupon', params, res => {
        this.couponLoading = false;
        this.currentPage += 1;
        if(res.data.length == 0) return;
        let list = res.data.list;
        for(let i = 0; i < list.length; i++) {
          let display_time = moment(list[i].end_time).diff(new Date(), 'days');
          if(display_time > 7) {
            list[i].display_time = `${moment(list[i].end_time).format('YYYY.MM.DD HH:mm')}过期`
          } else {
            list[i].display_time = `${display_time}天后过期`
          }
          list[i].valid_start_time_sample = moment(list[i].valid_start_time).format('YYYY.MM.DD');
          list[i].valid_end_time_sample = moment(list[i].valid_end_time).format('YYYY.MM.DD');
          list[i].valid_start_time = moment(list[i].valid_start_time).format('YYYY.MM.DD HH:mm');
          list[i].valid_end_time = moment(list[i].valid_end_time).format('YYYY.MM.DD HH:mm');
        }
        this.coupons.push(...list);
        this.pageTotal = res.data.pageTotal;
      })
    },
    updateTabIndex(e) {
      let id = e.currentTarget.dataset.id;
      this.tabIndex = id;
      this.currentPage = 1,
      this.pageTotal = 1;
      this.coupons = [],
      this.couponLoading = false
      this.getCoupons();
    },
    couponCondition(item) {
      if(parseFloat(item.with_amount) == 0) {
        return '无使用限制';
      } else {
        return `超过${item.with_amount}可用`
      }
    },
    toggleCouponInfo(index) {
      this.coupons[index].extend = !this.coupons[index].extend;
      this.$forceUpdate();
    },
    goToDetail(e) {
      if(e.target.dataset.ctrl) return;
      let code = e.currentTarget.dataset.code;
      uni.navigateTo({
        url: `/pages/coupon-detail/coupon-detail?code=${code}&from=list`
      })
    }
  }
}
</script>

<style lang="scss" scoped>
  @import 'coupons-history.scss';
</style>