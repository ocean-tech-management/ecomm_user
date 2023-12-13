<template>
  <view class="flex-page">
    <!-- 确定了订单状态 -->
    <view class="flex-page-content">
      <view class="pay-result-banner">
        <view class="pay-result-content">
          <image class="pay-success-icon" src="/static/images/icon_pay_success.png"></image>
          <view class="pay-result-title">{{types[type]}}</view>
          <!-- 成功 -->
          <block v-if="type == 1">
            <view v-if="preOrderInfo.order_type != 4" class="pay-result-tips">我们的小哥哥正在马不停蹄的为您配货</view>
            <view v-else class="pay-result-tips">未拼中订单，随时可退还您的本金</view>
          </block>
          <!-- 失败 -->
          <view v-else-if="type == 2" class="pay-result-tips">
            未成功付款，请尝试重新下单
          </view>
          <!-- 超时 -->
          <view v-else-if="type == 3" class="pay-result-tips">
            支付超时，请留意签约银行卡扣款情况及商城订单状态
          </view>
          <view v-if="type == 1" class="pay-result-btns">
            <view v-if="preParams.order_sn && preOrderInfo.order_type != 4" class="pay-result-btn" @tap="goToOrder">查看订单</view>
          </view>
        </view>
      </view>

      <view class="order-user-bar">
        <view class="order-user-infos">
          <view class="order-user-base-info">{{preOrderInfo.shipping_phone}} {{preOrderInfo.shipping_name}}</view>
          <view class="order-user-info">{{preOrderInfo.shipping_address}}</view>
          <view class="order-user-realpay">
            实付：￥{{preOrderInfo.real_pay_price || '0.00'}}
          </view>
        </view>
      </view>
      
    </view>
    <view class="bottom-btns">
      <view v-if="preOrderInfo.order_type != 4" class="bottom-btn" @tap="toIndex">
        返回首页
      </view>
      <view v-else class="bottom-btn" @tap="toPpylOrders">返回拼团订单</view>
    </view>

  </view>
</template>
<script>
  export default {
    data() {
      return {
        hasLoad: false,

        type: 1, //1成功2失败3超时
        types: {
          [1]: '下单成功',
          [2]: '下单失败',
          [3]: '下单超时'
        },

        order: {},
        preOrderInfo: {},
        preParams: null,

        
      }
    },
    onShareAppMessage() {
      let shareInfo = this.$getShareInfo();
      return shareInfo;
    },
    onLoad(options) {
      if(options.type) this.type = options.type;
      this.preOrderInfo = uni.getStorageSync('preOrderInfo');
      this.preParams = uni.getStorageSync('preParams');
      if(!this.preOrderInfo || !this.preParams) {
        uni.reLaunch({
          url: '/pages/index/index'
        });
      }
      uni.removeStorageSync('preOrderInfo');
    },
    methods: {
      toIndex() {
        uni.reLaunch({
          url: '/pages/index/index'
        })
      },
      toPpylOrders() {
        uni.redirectTo({
          url: `/market-pages/pages/ppyl/orders/orders`
        })
      },
      goToOrder() {
        uni.redirectTo({
          url: `/pages/order-detail/order-detail?sn=${this.preParams.order_sn}`
        })
      },
      redirectToPpylTeam() {
        uni.redirectTo({
          url: `/market-pages/pages/ppyl/ppyl-team/ppyl-team?code=${this.preOrderInfo.area_code}&sn=${this.preParams.activity_sn}`
        })
      },
      
    }
  }
</script>
<style lang="scss" scoped>
  @import 'pay-result.scss';
</style>