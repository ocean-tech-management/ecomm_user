<template>
  <view class="flex-page">
    <view class="flex-page-content">
      <image class="order-address-border" src="/static/images/border_addre.png"></image>
      <!-- 订单商品列表 -->
      <view class="order-products">
        <view class="shopcar-orders">
          <view class="shopcar-order">
            <view class="shopcar-order-img-box">
              <image class="shopcar-order-img" :src="order.goods.main_image" mode="widthFix" webp></image>
            </view>
            <view class="shopcar-order-info">
              <view class="shopcar-order-top">
                <view class="shopcar-order-name">{{order.goods.title}}</view>
              </view>
              <view class="shopcar-order-val-box">
                <view class="shopcar-order-val">￥{{order.sale_price || '0.00'}}</view>
                <view class="shopcar-order-count">×1</view>
              </view>

            </view>
          </view>
        </view>
      </view>

      <!-- 订单金额信息 -->
      <view class="order-infos">
        <view class="order-info">
          <view class="order-info-name">商品总价</view>
          <view class="order-info-val">¥{{order.sale_price || '0.00'}}</view>
        </view>
        <!-- <view class="order-info">
          <view class="order-info-name">运费</view>
          <view class="order-info-val">¥{{!order.fare || parseFloat(order.fare) == 0 ? '免邮费' : order.fare}}</view>
        </view> -->
      </view>
    </view>

    <view class="order-ctrls-box">
      <view class="order-payinfo">
        <text>应付款：</text>
        <text class="order-payinfo-val">￥{{order.sale_price}}</text>
      </view>
      <view class="order-ctrls">
        <button class="order-ctrl" open-type="share">转售分享</button>
      </view>
    </view> 

  </view>
</template>
<script>
import config from '@/config'
  export default {
    data() {
      return {

        order: {
        }
      }
    },
    async onShareAppMessage(e) {
      if(!this.order.uid || uni.getStorageSync('userInfo').uid != this.order.uid) {
        uni.showModal({
          title: '提示',
          content: '商品状态异常或您非商品拥有者，分享无效。',
          showCancel: false
        })
        return {
          title: config.written.shareTitle,
          desc: config.written.shareTitle,
          path: '/pages/index/index'
        }
      }
      let key = '';
      await this.createParams().then(res => {key = res.data});
      let target = `/market-pages/pages/transformable-order/pay-resale/pay-resale?key=${key}`;
      let path = `/pages/index/index?redirect=${encodeURIComponent(target)}&link_uid=${this.order.uid}`;
      let shareInfo = this.$getShareInfo();
      shareInfo.path = path;
      console.log(shareInfo);
      return shareInfo;
    },
    onLoad(options) {
      let item = uni.getStorageSync('transformableOrder') || {};
      uni.removeStorageSync('transformableOrder');
      if (!item.handsel_sn) {
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
      this.order = item;
    },
    methods: {
      createParams() {
        let params = {
          handsel_sn: this.order.handsel_sn,
          goods: [
            {
              goods_sn: this.order.goods_sn,
              sku_sn: this.order.sku_sn,
              number: 1 //只能是1
            }
          ],
          order_type: 5,
          pay_type: 2,  //1余额2现金
          uc_code: [],
          integral: 0,
          usedIntegralDis: 2,
          usedCouponDis: 1,
          readyType: 1    //1商品详情页触发，2预订单使用
        }
        let promise = new Promise((resolve, reject) => {
          this.$spost('/home/newDynamicParams', params, res => {
            resolve(res);
          }, err => {
            console.log(err);
            reject();
          });

        })
        return promise;
      }
      
    }
  }
</script>
<style lang="scss" scoped>
  @import 'resale.scss';
</style>