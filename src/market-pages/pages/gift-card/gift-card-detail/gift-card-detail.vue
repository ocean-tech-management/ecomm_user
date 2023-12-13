<template>
  <view class="flex-page">
    <view class="flex-page-content">
      <view class="gift-tips">以下产品暂不支持退款，如果遇破损请联系售后。</view>
      <view class="goods-list">
        <view v-for="(item, index) in giftCardInfo.validGoods" class="goods-item" :key="index">          
          <!-- 正常的勾选的购物车项 -->
          <view class="gift-select" @tap="SelectItem(index)">
            <image v-show="selectGoods.indexOf(item.goods_sn) >= 0" class="gift-select-icon" src="/static/images/shopcar_select.png"></image>
            <image v-show="selectGoods.indexOf(item.goods_sn) < 0" class="gift-select-icon" src="/static/images/shopcar_unselect.png"></image>
          </view>
          <view class="gift-img-box">
            <image class="gift-img" :src="item.image" mode="widthFix" webp lazy-load></image>
          </view>
          <view class="gift-info" :class="{'gift-unactive': item.goods.status != 1}">
            <view class="gift-name">{{item.title}}</view>
            <view class="gift-property">
              <view class="gift-property-text-static">{{item.attr}} </view>
              <view class="gift-property-count-static">
                <block v-if="item.allCount && item.allCount != item.stock">共{{item.allCount}}份/剩{{item.stock}}个</block>
                <block v-else>共{{item.stock}}份</block>
              </view>
            </view>

            <!-- 下单状态 -->
            <view class="gift-number-ctrls-box">
              <view class="sku-number-ctrls">
                <view class="sku-number-ctrl" @tap="deleteSkuSelectNum(index)">-</view>
                <view class="sku-number-ctrl">{{item.number}}</view>
                <view class="sku-number-ctrl" @tap="addSkuSelectNum(index)">+</view>
              </view>
            </view>
            
          </view>
        </view>
      </view>

      <view v-if="giftCardInfo.inValidGoods && giftCardInfo.inValidGoods.length > 0" class="gift-type-title">已领取产品</view>
      <view class="goods-list">
        <view v-for="(item, index) in giftCardInfo.inValidGoods" class="goods-item" :key="index">          
          <!-- 正常的勾选的购物车项 -->
          <view class="gift-select"></view>
          <view class="gift-img-box">
            <image class="gift-img" :src="item.image" mode="widthFix" webp lazy-load></image>
          </view>
          <view class="gift-info" :class="{'gift-unactive': item.goods.status != 1}">
            <view class="gift-name">{{item.title}}</view>
            <view class="gift-property">
              <view class="gift-property-text-static">{{item.attr}} </view>
              <view class="gift-property-count-static">
                <block>共{{item.used}}份</block>
              </view>
            </view>
          </view>
          <image class="gift-used-sign" src="/market-pages/static/images/gift_card/gift_has_been_used.png"></image>
        </view>
      </view>

    </view>

  </view>
</template>
<script>
export default {
  data() {
    return {
      giftCardInfo: {
        validGoods: {},
        inValidGoods: {}
      },

      selectGoods: [],
      hasSelect: false,
      isAll: false,
    }
  },
  onShareAppMessage() {
    let shareInfo = this.$getShareInfo();
    return shareInfo;
  },
  onLoad(options) {
    this.getData();
  },
  methods: {    
    getData() {
      let params = {
        uid: uni.getStorageSync('userInfo').uid
      }
      this.$get('/user/info', params, res => {
        let giftCardInfo = res.data;
        giftCardInfo.validGoods = [{
          goods_sn: '12312312',
          image: 'https://oss.mten.andyoudao.cn/image/20201230163706275341.jpg',
          title: '阿斯达所大所',
          attr: '发送打火机',
          allCount: 7,
          stock: 5,
          used: 2,
          number: 1
        },{
          goods_sn: '111111',
          image: 'https://oss.mten.andyoudao.cn/image/20201230163706275341.jpg',
          title: '空记录改',
          attr: '给你',
          stock: 3,
          number: 1
        }]
        giftCardInfo.inValidGoods = [{
          goods_sn: '12312312',
          image: 'https://oss.mten.andyoudao.cn/image/20201230163706275341.jpg',
          title: '阿斯达所大所',
          attr: '发送打火机',
          allCount: 7,
          used: 2,
          count: 2
        }]
        this.giftCardInfo = giftCardInfo;
      })
    }, 
    
    SelectItem(index) {
      this.isCtrl = true;
      this.updateSelect({
        goods_sn: this.giftCardInfo.validGoods[index].goods_sn
      })
      
    },
    
    updateSelect(info) {
      let goods_sn = info.goods_sn;
      let index = this.selectGoods.indexOf(goods_sn);
      if(index >= 0) {
        this.selectGoods.splice(index, 1);
      } else {
        this.selectGoods.push(goods_sn);
      }
      this.hasSelect = this.selectGoods.length > 0 ? true : false;
      
    }, 

    
    addSkuSelectNum(index) {
      if(this.giftCardInfo.validGoods[index].number >= this.giftCardInfo.validGoods[index].stock) {
        return uni.showToast({
          title: '超过商品库存',
          mask: true,
          icon: 'none'
        })
      }
      this.giftCardInfo.validGoods[index].number += 1;
    },
    deleteSkuSelectNum(index) {
      if(this.giftCardInfo.validGoods[index].number == 1) {
        return;
      }
      this.giftCardInfo.validGoods[index].number -= 1;
    },
  }
}
</script>
<style lang="scss" scoped>
  @import 'gift-card-detail.scss'
</style>