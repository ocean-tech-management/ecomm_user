<template>
  <view class="flex-page coupons-page">
    <view>
      <view class="tabs">
        <view :class="'tab ' + (tabIndex == 0 ? 'active' : '')" data-id="0" @tap="updateTabIndex">
          待领优惠券
        </view>
        <view :class="'tab ' + (tabIndex == 1 ? 'active' : '')" data-id="1" @tap="updateTabIndex">
          我的优惠券
        </view>

      </view>
    </view>
    <view class="tab-pages">

      
      <view class="tab-page" v-if="tabIndex == 0">
        <scroll-view scroll-y class="tab-page-scroll" @scrolltolower="getCoupons">
          <view class="coupons">
            <view v-for="(item, index) in coupons" class="coupon" :key="item.code" @tap="goToDetail(item.code, 'list')">
              <image class="coupon-bg" src="/static/images/bg_coupon.png" mode="widthFix"></image>
              <view class="coupon-content">
                <!-- u_type: 10 平台优惠券 -->
                <view v-if="item.u_type == 10" class="coupon-intro">
                  <view class="coupon-info">
                    <view class="coupon-name-with-tag">
                      <view class="coupon-tagname-name">全品类：{{item.name}}</view>
                    </view>
                    <view class="coupon-price-info">
                      <view class="coupon-limit-box">
                        <block v-if="item.type != 4 &&item.with_amount > 0">
                          满<text class="coupon-price-limit">{{item.with_amount}}</text>可用
                        </block>
                        <block v-else-if="item.type == 4">
                          最高抵扣<text class="coupon-price-limit">{{item.used_amount || 0}}</text>元
                        </block>
                      </view>
                      <view class="coupon-display-time">{{item.display_time}}</view>
                    </view>
                  </view>
                </view>
                <!-- u_type: 20 类目优惠券 -->
                <view v-if="item.u_type == 20" class="coupon-intro">
                  <view class="coupon-info">
                    <!-- <view class="coupon-name-with-tag">
                      <view class="coupon-tagname-category">指定类目</view>
                      <view class="coupon-tagname-name">{{item.name}}</view>
                    </view> -->
                    <view class="coupon-name">指定类目：{{item.name}}</view>
                    <view class="coupon-price-info">
                      <view class="coupon-limit-box">
                        <block v-if="item.type != 4 &&item.with_amount > 0">
                          满<text class="coupon-price-limit">{{item.with_amount}}</text>可用
                        </block>
                        <block v-else-if="item.type == 4">
                          最高抵扣<text class="coupon-price-limit">{{item.used_amount || 0}}</text>元
                        </block>
                      </view>
                      <view class="coupon-display-time">{{item.display_time}}</view>
                    </view>
                  </view>
                </view>
                
                <!-- u_type: 30 商品优惠券 -->
                <view v-if="item.u_type == 30" class="coupon-intro">
                  
                  <view class="coupon-info">
                    <view class="coupon-name">{{item.name}}</view>
                    <view class="coupon-price-info">
                      <view class="coupon-limit-box">
                        <block v-if="item.type != 4 &&item.with_amount > 0">
                          满<text class="coupon-price-limit">{{item.with_amount}}</text>可用
                        </block>
                        <block v-else-if="item.type == 4">
                          最高抵扣<text class="coupon-price-limit">{{item.used_amount || 0}}</text>元
                        </block>
                      </view>
                      <view class="coupon-display-time">{{item.display_time}}</view>
                    </view>
                  </view>
                </view>

                <view class="coupon-ctrl">
                  <view v-if="item.t_type != 4" class="coupon-price">
                    <text class="coupon-symbol">￥</text>
                    <text class="coupon-value">{{parseFloat(item.used_amount)}}</text>
                  </view>
                  <view v-if="item.type == 4" class="coupon-price coupon-discount">
                    <text class="coupon-value">{{parseFloat(item.with_discount) * 1000 / 100}}</text>
                    <text class="coupon-discount-symbol">折</text>
                  </view>
                  <!-- take_auth: 1可领 2不可领 -->
                  <view v-if="item.take_auth == 1" class="coupon-use-btn" :data-index="index" data-ctrl="ctrl" @tap="receiveCoupon">立即领取</view>
                </view>
              </view>

            </view>
          </view>
          
          <view v-if="currentPage > pageTotal && !couponLoading" class="scroll-tips">已经到底啦</view>
        </scroll-view>
      </view>
      
      <view class="tab-page" v-if="tabIndex == 1">
        <scroll-view scroll-y class="tab-page-scroll tab-page-scroll-mine" @scrolltolower="getCoupons">
          <view class="coupons  my-coupons">
            <view v-for="(item, index) in coupons" class="my-coupon" :key="item.uc_code" @tap="goToDetail(item.coupon_code, 'myself')">
              <view class="coupon">
                <image class="coupon-bg" src="/static/images/bg_mycoupon.png" mode="widthFix"></image>
                <view class="coupon-content">
                  <view class="coupon-intro my-coupon-intro">
                    <view class="coupon-info">
                      
                      <!-- u_type: 10 平台优惠券 -->
                      <view v-if="item.coupon_used == 10" class="coupon-name"><view class="coupon-tag-all">全品类</view>{{item.coupon.name}}</view>
                      <!-- u_type: 20 类目优惠券 -->
                      <view v-if="item.coupon_used == 20" class="coupon-name">指定类目：{{item.coupon.name}}</view>
                      <!-- u_type: 30 商品优惠券 -->
                      <view v-if="item.coupon_used == 30" class="coupon-name">指定商品：{{item.coupon.name}}</view>
                      <view class="my-coupon-price-info">
                        <view v-if="item.coupon.with_amount == 0">无使用限制</view>
                        <view v-if="item.coupon.with_amount > 0">超过<text class="coupon-price-limit">{{item.coupon.with_amount}}</text>可用</view>
                      </view>
                      <view class="coupon-validtime-info">
                        <view class="coupon-validtime">{{item.valid_start_time_sample}} - {{item.valid_end_time_sample}}</view>
                        <view class="coupon-more" data-ctrl="true" @tap="toggleCouponInfo(index)">
                          <image v-show="!item.extend" data-ctrl="true" class="coupon-more-icon" src="/static/images/extend.png"></image>
                          <image v-show="item.extend" data-ctrl="true" class="coupon-more-icon" src="/static/images/fold.png"></image>
                        </view>
                      </view>
                    </view>
                  </view>
                  <view class="coupon-ctrl my-coupon-ctrl" data-ctrl="true" @tap="toUse">
                    <view v-if="item.coupon_type != 4" class="coupon-price">
                      <text class="coupon-symbol">￥</text>
                      <text class="coupon-value">{{item.coupon.used_amount}}</text>
                    </view>
                    <view v-if="item.coupon_type == 4" class="coupon-price coupon-discount">
                      <text class="coupon-value">{{item.coupon.with_discount}}</text>
                      <text class="coupon-discount-symbol">折</text>
                    </view>
                    <view v-if="item.coupon_type == 4" class="coupon-discount-limit">
                      最高抵<text class="coupon-price-limit">{{item.coupon.used_amount || 0}}</text>
                    </view>
                    <view class="use-now">立即使用</view>
                  </view>
                </view>
              </view>
              <view v-show="item.extend" class="coupon-extend-info">
                
                <!-- u_type: 10 平台优惠券 -->
                <view v-if="item.coupon_used == 10" class="coupon-extend-item">
                  <view class="coupon-extend-item-label">类　　别：</view>
                  <view class="coupon-extend-item-value">全品类优惠券</view>
                </view>
                <!-- u_type: 20 类目优惠券 -->
                <view v-if="item.coupon_used == 20" class="coupon-extend-item">
                  <view class="coupon-extend-item-label">指定类目：</view>
                  <view class="coupon-extend-item-values">
                    <view v-for="(category, categoryIndex) in item.coupon.category_name" class="coupon-extend-item-value" :key="categoryIndex">{{category}}</view>
                  </view>
                </view>
                <!-- u_type: 30 商品优惠券 -->
                <view v-if="item.coupon_used == 30" class="coupon-extend-item">
                  <view class="coupon-extend-item-label">指定商品：</view>
                  <view class="coupon-extend-item-values">
                    <view v-for="(good, goodIndex) in item.coupon.goods_name" class="coupon-extend-item-value" :key="goodIndex">{{good}}</view>
                  </view>
                </view>
                <view class="coupon-extend-item">
                  <view class="coupon-extend-item-label">券　　号：</view>
                  <view class="coupon-extend-item-values">{{item.uc_code}}</view>
                </view>
                <view class="coupon-extend-item">
                  <view class="coupon-extend-item-label">有效时间：</view>
                  <view class="coupon-extend-item-values">{{item.valid_start_time}} - {{item.valid_end_time}}</view>
                </view>
              </view>
            </view>

          </view>
          
          <view v-if="coupons.length > 0 && currentPage > pageTotal && !couponLoading" class="scroll-tips">已经到底啦</view>
          <view v-if="coupons.length == 0 && currentPage > pageTotal && !couponLoading" class="scroll-tips">暂无优惠券哦</view>
        </scroll-view>
        <view class="coupons-page-btn" @tap="goToCouponsHistory">
          查看优惠券使用记录
        </view>
      </view>



    </view>
  </view>

</template>

<script>
import moment from 'moment';
export default {
  data() {
    return {
      couponsApis: {
        [0]: '/coupon/list',
        [1]: '/user/coupon'
      },
      currentPage: 1,
      pageTotal: 1,
      tabIndex: 0,
      coupons: [],
      couponLoading: false,
      isCtrl: false
    }
  },
  onShareAppMessage() {
    let shareInfo = this.$getShareInfo();
    return shareInfo;
  },
  onLoad(options) {
    if(options.me) this.tabIndex = 1;
    console.log(this.tabIndex);
    this.getCoupons();
  },
  methods: {
    getCoupons() {
      if(this.currentPage > this.pageTotal) return;
      let params = {
        page: this.currentPage,
        uid: uni.getStorageSync('userInfo').uid
      }
      this.couponLoading = true;
      this.$get(this.couponsApis[this.tabIndex], params, res => {
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
        if(this.tabIndex == 1) {
          for(let i = 0; i < list.length; i++) {
            if(list[i].coupon && list[i].coupon_type == 4) {
              list[i].coupon.with_discount = parseFloat(list[i].coupon.with_discount) * 1000 / 100 || 10;
              list[i].coupon.used_amount = parseFloat(list[i].coupon.used_amount) || 0;
            } else if(list[i].coupon && list[i].coupon_type != 4) {
              list[i].coupon.used_amount = parseFloat(list[i].coupon.used_amount) || 0;
            }
          }
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
      this.isCtrl = true;
      this.coupons[index].extend = !this.coupons[index].extend;
      this.$forceUpdate();
    },
    goToDetail(code, from = 'list') {
      if(this.isCtrl) {
        return setTimeout(() => {
          this.isCtrl = false;
        }, 50)
      }
      let url = `/pages/coupon-detail/coupon-detail?code=${code}`;
      if(from == 'myself') url += '&from=myself';
      uni.navigateTo({
        url: url
      })
    },
    toUse() {
      this.isCtrl = true;
      uni.switchTab({
        url: '/pages/index/index'
      })
    },
    goToCouponsHistory() {
      uni.navigateTo({
        url: `/pages/coupons-history/coupons-history`
      })
    },
    receiveCoupon(e) {
      this.isCtrl = true;
      let index = e.currentTarget.dataset.index;
      let code = this.coupons[index].code;
      let params = {
        code: code,
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
            this.getCoupon(code, res => {
              this.coupons[index].take_auth = res.data.take_auth;
            })
          }, 1800)
        }, this.$toastDelay)
        
      })
    },
    getCoupon(code, handler) {
      let params = {
        code: code,
        uid: uni.getStorageSync('userInfo').uid
      }
      this.$get('/coupon/info', params, res => {
        if(handler && typeof handler == 'function') handler(res);
      })
    }
  }
}
</script>

<style lang="scss" scoped>
  @import 'coupons.scss';
</style>