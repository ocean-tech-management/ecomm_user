<template>
  <view class="flex-page">
    <view class="flex-page-content">
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

      <image class="order-address-border" src="/static/images/border_addre.png"></image>

      <!-- 订单商品列表 -->
      <view v-if="order.goods" class="order-products">
        <view class="shopcar-orders">
          <view v-for="(item, index) in order.goods" class="shopcar-order" :data-id="item.id" :data-idx="index"
            :key="item.id">
            <view class="shopcar-order-img-box">
              <image class="shopcar-order-img" :src="item.image" mode="widthFix" webp></image>
            </view>
            <view class="shopcar-order-info">
              <view class="shopcar-order-top">
                <view class="shopcar-order-name">{{item.title}}</view>
                <view class="shopcar-order-property">{{item.attr}}</view>
              </view>
              <view class="shopcar-order-val-box">
                <view class="shopcar-order-val">￥{{item.price || '0.00'}}</view>
                <view class="shopcar-order-count">×{{item.number}}</view>
              </view>

            </view>
          </view>
        </view>
      </view>

      <!-- 订单金额信息 -->
      <view class="order-infos">
        <view class="order-info">
          <view class="order-info-name">商品总价</view>
          <view class="order-info-val">¥{{order.order_amount || '0.00'}}</view>
        </view>
        <view class="order-info">
          <view class="order-info-name">运费</view>
          <view class="order-info-val">¥{{!order.fare || parseFloat(order.fare) == 0 ? '免邮费' : order.fare}}</view>
        </view>
      </view>

      <view class="order-desc-box">
        <textarea class="order-desc-textarea" placeholder-class="search-input-placeholder" placeholder="可在此处留下您的备注信息哦" @input="updateDesc"/>
      </view>
    </view>

    

    <view class="order-ctrls-box">
      <view class="order-payinfo">
      </view>
      <view class="order-ctrls">
        <view class="order-ctrl" @tap="confirmPickup">确认自提</view>
      </view>
    </view> 
  </view>
</template>
<script>
import config from '@/config'
export default {
  data() {
    return {
      sn: null,
      
      address: null,
      userInfo: uni.getStorageSync('userInfo'),
      addressLoading: false,

      order_remark: '',

      order: {
        "order_amount": "48.60",
        "fare": "0.00",
        "member_price": 48.6,
        "uid": '22222',
        "goods": [{
          "goods_sn": "0013000266350",
          "sku_sn": "6635060501",
          "number": 1,
          "activity_id": 117,
          "total_price": "48.60",
          "category_code": "0013",
          "price": "48.60",
          "member_price": "48.60",
          "title": "洛瑞琳水杨酸祛痘冷敷凝胶1ml*30支/盒",
          "specs": "{\"规格（护肤）\":\"1ml*30支\\/盒\"}",
          "image": "https://oss-cm.andyoudao.cn/image/20220307180255354530.jpg",
          "total_fare_price": 0,
          "scale": [],
          "scaleForInt": 1,
          "memberDis": "0.00",
          "couponDis": 0,
          "integralDis": "0.00",
          "allDisPrice": "0.00",
          "realPayPrice": "48.60"
        }],
        "realPayPrice": "48.60",
        "pay_type": "4",
        "id": 1647933641753
      }
    }
  },
  onShareAppMessage(e) {
    if(!this.order.uid || this.userInfo.uid != this.order.uid) {
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
    let target = `/market-pages/pages/transformable-order/pay-resale/pay-resale?sn=${this.sn}`;
    let path = `/pages/index/index?redirect=${encodeURIComponent(target)}&link_uid=${this.order.uid}`;
    let shareInfo = this.$getShareInfo();
    shareInfo.path = path;
    console.log(shareInfo);
    return shareInfo;
  },
  onLoad(options) {
    if (!options.sn) {
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
    
    this.getAddress();
  },
  methods: {

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
    
    // 更新备注
    updateDesc(e) {
      this.order_remark = e.detail.value;
    },

    goToAddresses() {
      uni.navigateTo({
        url: '/pages/addresses/addresses?type=select'
      })
    },

    confirmPickup() {
      if(!this.address || !this.address.id) {
        return uni.showToast({
          title: '请选择收货地址',
          mask: true,
          icon: 'none'
        })
      }
      let params = {

      }
      this.$post('/order/create', params, res => {

        // 更新过期时间
        time = time.add(res.data.expireTimestamp || 120, 'seconds').format('x');
        params.time = time;
        params.expireTimestamp = res.data.expireTimestamp || 120;
        uni.setStorageSync('preOrderInfo', params);

        // 更新预订单响应数据
        uni.setStorageSync('preParams', res.data);

        if(params.real_pay_price == '0.00') {
          // 不用钱
          this.freePay(res);
        } else if(params.pay_type == 1) {
          // 余额支付
          this.balancePay(res);
        } else {
          // 给钱，分情况给
          
          // #ifdef H5
          this.h5Pay(res);
          // #endif
          // #ifndef H5
          this.wxappPay(res);
          // #endif
        }

      }, err => {
        this.paying = false;
      })
    },
    freePay() {
      // 不用钱
      uni.removeStorageSync('preOrder');
      uni.showToast({
        title: '下单成功',
        mask: true,
        duration: 2000
      })
      // 微信小程序订阅消息
      // #ifdef MP-WEIXIN
      this.subscribeMsg(data, () => {
        setTimeout(() => {
          let url = '/pages/pay-result/pay-result';
          uni.redirectTo({
            url: url
          })
        }, 1800);
      })
      // #endif
      // #ifndef MP-WEIXIN
      setTimeout(() => {
        let url = '/pages/pay-result/pay-result';
        uni.redirectTo({
          url: url
        })
      }, 1800);
      // #endif
      
    },
    balancePay(res) {
      let data = res.data;
      if(data.complete_pay == true) {
        uni.removeStorageSync('preOrder');
        
        // 微信小程序订阅消息
        // #ifdef MP-WEIXIN
        this.subscribeMsg(data, () => {
          setTimeout(() => {
            let url = '/pages/pay-result/pay-result';
            
            uni.redirectTo({
              url: url
            })
          }, 10);
        })
        // #endif
        // #ifndef MP-WEIXIN
        setTimeout(() => {
          let url = '/pages/pay-result/pay-result';
          
          uni.redirectTo({
            url: url
          })
        }, 10);
        // #endif
      } else {
        setTimeout(() => {
          uni.redirectTo({
            url: '/pages/pay-result/pay-result?type=2'
          })
        }, 10);
        return;
      }
    },
    h5Pay(res) {
      // h5给钱（走微信sdk）
      if (this.$jwx && this.$jwx.isWechat()) {//检查是否是微信环境
        this.$jwx.wxpay(res.data, wxmsg => {
          this.paying = false;

          uni.removeStorageSync('preOrder');
          if(wxmsg == '{"errMsg":"chooseWXPay:ok"}') {
            setTimeout(() => {
              uni.showToast({
                title: '支付成功',
                mask: true,
                duration: 2000
              })
              setTimeout(() => {
                let url = '/pages/pay-result/pay-result';

                uni.redirectTo({
                  url: url
                })
              }, 1800);
            },this.$toastDelay)
          } else {
            setTimeout(() => {
              uni.showToast({
                title: '支付失败',
                icon: 'none',
                mask: true,
                duration: 2000
              })
              setTimeout(() => {
                uni.redirectTo({
                  url: '/pages/pay-result/pay-result?type=2'
                })
              }, 1800);
            },this.$toastDelay)
            
          }
          
        }, err => {
          this.paying = false;
        })
      }
    },
    wxappPay(res) {
      // 小程序或者app给钱，走支付平台统一接口
      let data = res.data;

      uni.requestPayment({
        provider: 'wxpay',
        timeStamp: data.timeStamp,
        nonceStr: data.nonceStr,
        package: data.package,
        signType: data.signType,
        paySign: data.paySign,
        success: res => {
          
          let wxpayRes = res;
          this.paying = false;
          // 微信小程序订阅消息
          // #ifdef MP-WEIXIN
          this.subscribeMsg(data, () => {
            this.toResult(wxpayRes, data);
          })
          // #endif
          // #ifndef MP-WEIXIN
          this.toResult(wxpayRes, data);
          // #endif

        },
        fail: err => {
          console.log(err);
          uni.removeStorageSync('preOrder');
          setTimeout(() => {
            uni.redirectTo({
              url: '/pages/pay-result/pay-result?type=2'
            })
          }, 10);
        }
      });
    },
  }
  
}
</script>
<style lang="scss" scoped>
@import 'pick-up.scss';
</style>