<template>
  <view>
    <view v-if="isAuth" class="sku-info-box">
      <view class="sku-image-box">
        <image class="sku-image" :src="afterSale.goods.images" mode="widthFix" webp></image>
      </view>
      <view class="sku-info">
        <view class="sku-name">{{afterSale.goods.title}}</view>
        <view class="sku-tips">{{afterSale.goods.attr}}</view>
      </view>
    </view>

    <view v-if="isAuth" class="return-selects">
      <block v-if="afterSale.order_type == 1 || afterSale.order_type == 2 || afterSale.order_type == 3">
        <!-- 拼拼商品不允许退货、退款 -->
        <view v-if="afterSale.goods.allow_after_type.includes('1')" class="return-select-item" data-type="1" @tap="goToReturnApplication">
          <image class="return-select-icon" src="/static/images/position.png"></image>
          <view class="return-select-info">
            <view class="return-select-title">我要退款（无需退货）</view>
            <view class="return-select-tips">没收到货，或与卖家协商同意不用退货只退款</view>
          </view>
          <image class="return-select-arrow" src="/static/images/more.png"></image>
        </view>
        <!-- 只有发货了才能退换货 -->
        <view v-if="afterSale.shipping_status > 2 && afterSale.goods.allow_after_type.includes('2')" class="return-select-item" data-type="2" @tap="goToReturnApplication">
          <image class="return-select-icon" src="/static/images/position.png"></image>
          <view class="return-select-info">
            <view class="return-select-title">我要退货退款</view>
            <view class="return-select-tips">已收到货，需要退还收到的货物</view>
          </view>
          <image class="return-select-arrow" src="/static/images/more.png"></image>
        </view>
      </block>
      <view v-if="afterSale.shipping_status > 2 && afterSale.goods.allow_after_type.includes('3')" class="return-select-item" data-type="3" @tap="goToReturnApplication">
        <image class="return-select-icon" src="/static/images/position.png"></image>
        <view class="return-select-info">
          <view class="return-select-title">我要换货</view>
          <view class="return-select-tips">已收到货，因尺码或质量问题需要换货物</view>
        </view>
        <image class="return-select-arrow" src="/static/images/more.png"></image>
      </view>
      <!-- <view class="return-select-item">
        <image class="return-select-icon" src="/static/images/position.png"></image>
        <view class="return-select-info">
          <view class="return-select-title">补寄</view>
          <view class="return-select-tips">补寄说明</view>
        </view>
        <image class="return-select-arrow" src="/static/images/more.png"></image>
      </view> -->
    </view>
    <view v-else class="no-auth">
      您无权限操作改页面
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      isAuth: true, // 是否有权限
      afterSale: {}
    }
  },
  onLoad() {
    let afterSale = uni.getStorageSync('afterSale');
    afterSale.goods.attr = Object.values(JSON.parse(afterSale.goods.specs)).join('、');
    if (!afterSale.goods.allow_after_type) {
      // 没有allow_after_type，就显示缺省页
      this.isAuth = false;
    } else {
      this.afterSale = afterSale;
    }
  },
  methods: {
    goToReturnApplication(e) {
      let type = e.currentTarget.dataset.type;
      uni.navigateTo({
        url: `/pages/return-application/return-application?type=${type}`
      })
    }
  }

}
</script>

<style lang="scss" scoped>
@import 'return-type.scss';
</style>