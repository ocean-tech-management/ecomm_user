<template>
  <view class="flex-page">
    <view class="flex-page-content">
      <block v-if="type == 1">
        <image class="order-address-border" src="/static/images/border_addre.png"></image>
        <!-- 消费者地址 -->
        <view v-if="!address && addressLoading" class="order-user-bar" @tap="goToAddresses">
          <view class="order-user-infos">
            <view class="order-user-info">暂无收货地址，前去添加</view>
          </view>
          <image class="order-user-more" src="/static/images/more.png"></image>
        </view>
        
        <view v-if="address" class="order-user-bar" @tap="goToAddresses">
          <view v-if="address.is_default == 1" class="order-user-tag">默认</view>
          <view class="order-user-infos">
            <view class="order-user-info">{{address.province}}{{address.city}}{{address.area}} {{address.address}}</view>
            <view class="order-user-base-info">{{address.phone}} {{address.name}}</view>
          </view>
          <image class="order-user-more" src="/static/images/more.png"></image>
        </view>

      </block>

      <view class="orders">
        <view v-for="(item, index) in orders" class="order" :class="{'active': selectShipping.includes(item.order_sn)}" :key="index" @tap="updateSelectShipping(index)">
          <view class="order-img-box">
            <image class="order-img" :src="item.orderGoods[0].images" mode="aspectFill"></image>
          </view>
          <view class="order-price">￥{{item.orderGoods[0].real_pay_price || '0.00'}}</view>
          <view class="order-price-unactive">￥{{item.orderGoods[0].sale_price || '0.00'}}</view>
        </view>
      </view>

      <view class="shipping-btn" :class="{'disabled': !isValid}" @tap="confirmSelect">
        {{type == 2 ? '寄售' : '发货'}}
      </view>

    </view>

  </view>
</template>
<script>
export default {
  data() {
    return {
      type: 1,  //1发货2寄售
      area_code: '',

      repurchase_condition: 1,
      shouldShippingNum: 0,
      orders: [],
      selectShipping: [],
      isValid: true, //现在都不需要校验了

      address: null,
      addressLoading: false,
    }
  },
  onLoad(options) {  
    if(options.type) this.type = options.type;
    if(uni.getStorageSync('opreateOrders')) {
      this.initData();
    } else {
      uni.showToast({
        title: '操作有误正在返回',
        icon: 'none',
        mask: true
      })
      setTimeout(() => {
        uni.switchTab({
          url: '/pages/index/index'
        })
      }, 1500)
      return;
    }
    uni.removeStorageSync('address');
    this.getAddress();
  },
  onShow() {
    setTimeout(() => {
      if(uni.getStorageSync('address')) {
        this.address = uni.getStorageSync('address');
        uni.removeStorageSync('address');
      }
    }, 10)
  },
  methods: {
    initData() {
      const opreateOrders = uni.getStorageSync('opreateOrders');
      this.area_code = opreateOrders.area_code;
      
      this.repurchase_condition = opreateOrders.repurchase_condition || 1;
      this.orders = opreateOrders.orders || [];
      this.repurchase_condition = opreateOrders.repurchase_condition || 1;
      let repurchase_number = opreateOrders.repurchase_number || 0;
      let groupNum = Math.floor(this.orders.length / this.repurchase_condition);  //总共几组够数的
      let groupShipping = this.repurchase_condition - repurchase_number;  //每组要发几个
      let restNum = this.orders.length - this.repurchase_condition * groupNum;  //剩下的不够数的，只能发
      this.shouldShippingNum = groupNum * groupShipping + restNum;  //应该发几个
    },
    getAddress() {
      let params = {
        uid: uni.getStorageSync('userInfo').uid
      }
      this.$get('/address/list', params, res => {
        let addresses = res.data;

        for(let i = 0; i < addresses.length; i++) {
          if(addresses[i].is_default) {
            this.address = addresses[i];
            break;
          }
        }
        if(!this.address && addresses.length > 0) this.address = addresses[0]; 
        this.addressLoading = true;
      })
    },

    goToAddresses() {
      uni.navigateTo({
        url: '/pages/addresses/addresses?type=select'
      })
    },

    updateSelectShipping(index) {
      // if(this.type == 1) return;  //发货不用选择
      return; //现在都不要校验了
      let order = this.orders[index];
      let order_sn = order.order_sn;
      let existIndex = this.selectShipping.indexOf(order_sn);
      if(existIndex >= 0) {
        this.selectShipping.splice(existIndex, 1);
      } else {
        if(this.selectShipping.length == this.shouldShippingNum) return;  //选够了
        this.selectShipping.push(order_sn);
      }
      if(this.selectShipping.length >= this.shouldShippingNum) {
        this.isValid = true;
      } else {
        this.isValid = false;
      }
    },
    confirmSelect() {
      if(this.type == 1 && (!this.address || !this.address.id)) {
        return uni.showToast({
          title: '请选择地址',
          mask: true,
          icon: 'none'
        })
      }

      let params = {
        uid: uni.getStorageSync('userInfo').uid,
        area_code: this.area_code,
        type: this.type,  //1发货2寄售3发货寄售混合
        order: []
      };

      if(this.type == 1) {
        
        let shipping_info = {
          address_id: this.address.id,
          shipping_address: `${this.address.province}${this.address.city}${this.address.area}${this.address.address}`,
          shipping_name: this.address.name,
          shipping_phone: this.address.phone,
          order_remark: ''
        }
        for(let i = 0; i < this.orders.length; i++) {
          let order = {
            order_sn: this.orders[i].order_sn,
            shipping_status: 1,
            sku_sn: this.orders[i].orderGoods[0].sku_sn,
            ...shipping_info
          }
          params.order.push(order)
        }
      } else if(this.type == 2) {
        for(let i = 0; i < this.orders.length; i++) {
          let order = {
            order_sn: this.orders[i].order_sn,
            shipping_status: 2,
            sku_sn: this.orders[i].orderGoods[0].sku_sn,
          }
          params.order.push(order)
        }
      }
      
      this.$post('/ppyl/winShipping', params, res => {
        // 更新缓存触发器
        uni.setStorageSync('shouldReload', true);
        
        setTimeout(() => {
          uni.showToast({
            title: '操作成功',
            duration: 2500,
            mask: true
          })
        }, this.$toastDelay)
        setTimeout(()=> {
          uni.navigateBack();
        }, 2800)
      })



    },
  }
}
</script>
<style lang="scss" scoped>
@import './order-opreate.scss';
</style>