<template>
  <view>
    <view class="logistics-list-info">已分{{logistics.length || 0}}个包裹发出</view>
    <view class="logistics-list">

      <view v-for="item in logistics" class="logistics" :key="item.code" @tap="goToLogistics(item.code)">
        <view class="losgistics-top">
          <image class="logistics-icon" src="/static/images/box.png"></image>
          <view class="logistics-status">{{item.logistics[0].node_status}}</view>
          <view class="logistics-base-info">
            <text class="logistics-company">{{item.logistics[0].company_name}}：</text>
            <text class="logistics-code">{{item.logistics[0].shipping_code}}</text>
          </view>
        </view>
        <view class="logistics-last-info">{{item.logistics[0].content}}</view>
        <view v-if="goods[item.code]" class="logistics-sku-imgs">
          <view v-for="(sku, index) in goods[item.code].goods" class="logistics-sku-img-box" :key="index">
            <image class="logistics-sku-img" :src="sku.images" mode="widthFix" webp lazy-load></image>
          </view>
        </view>
        <view v-if="goods[item.code] && goods[item.code].goods" class="logistics-info">共{{goods[item.code].goods.length || 1}}件商品</view>
      </view>

    </view>
  </view>
</template>
<script>
export default {
  data() {
    return {
      shipping_code: '',
      order_sn: '',
      logistics: [],
      goods: {}
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
    this.getLogisticsProducts();
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
      })
    },
    getLogisticsProducts() {
      if(!this.shipping_code || this.shipping_code === '') return;
      let params = {
        shipping_code: this.shipping_code.split(','),
        order_sn: this.order_sn
      };
      this.$spost('/ship/goods', params, res => {
        this.goods = res.data;
      })
    },
    goToLogistics(code) {
      uni.navigateTo({
        url: `/pages/logistics/logistics?code=${code}&sn=${this.order_sn}`
      })
    }
  }
}
</script>
<style lang="scss" scoped>
  @import 'logistics-list.scss';
</style>