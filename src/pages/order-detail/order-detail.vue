<template>
  <view class="uni-common-pb-withbtn">

    <!-- 页面内容 -->
    <view class="order-status-banner">
      <!-- <image class="order-status-bg" src="/static/images/bg/bg_status.png" mode="widthFix"></image> -->

      <!-- 未付款 -->
      <view v-if="order.order_status == 1" class="order-status-bar">
        <block v-if="!order.expire">
          <view class="order-status-text">等待买家付款</view>
          <view class="order-status-tips">剩{{ order.close_time }}自动关闭</view>
        </block>
        <!-- 失效 -->
        <block v-else>
          <view class="order-status-text">订单已失效</view>
          <view class="order-status-tips">如有需要请重新下单</view>
        </block>
      </view>
      <!-- 已付款 -->
      <view v-else-if="order.order_status == 2" class="order-status-bar">
        <block v-if="order.order_type != 2">
          <block v-if="order.shipping_status == 1">
            <view class="order-status-text">付款成功</view>
            <view v-if="order.order_type != 6" class="order-status-tips">我们的小哥哥们正在马不停蹄的为您配货</view>
          </block>
          <block v-else>
            <view class="order-status-text">商品备货中</view>
            <view class="order-status-tips">我们的小哥哥们正在准备为您发货</view>
          </block>
        </block>
        <block v-if="order.order_type == 2">
          <block v-if="order.pt.activity_status == 1">
            <view class="order-status-text">拼团中</view>
            <view class="order-status-tips">快邀请朋友参团吧。规定时间内未完成拼团，系统将自动退款</view>
          </block>
          <block v-if="order.pt.activity_status == 2 && order.shipping_status == 1">
            <view class="order-status-text">拼团成功</view>
            <view class="order-status-tips">我们的小哥哥们正在马不停蹄的为您配货</view>
          </block>
          <block v-if="order.pt.activity_status == 2 && order.shipping_status == 2">
            <view class="order-status-text">商品备货中</view>
            <view class="order-status-tips">我们的小哥哥们正在准备为您发货</view>
          </block>
        </block>
      </view>
      <!-- 已发货 -->
      <view v-else-if="order.order_status == 3" class="order-status-bar">
        <view class="order-status-text">卖家已发货</view>
        <view class="order-status-tips">发货一定时间后自动确认收货</view>
      </view>
      <!-- 已收货 -->
      <view v-else-if="order.order_status == 4" class="order-status-bar">
        <view class="order-status-text">已签收</view>
        <view class="order-status-tips">感谢您选择{{ systemName }}，欢迎再次光临！</view>
      </view>
      <!-- 已完成 -->
      <view v-else-if="order.order_status == 8" class="order-status-bar">
        <view class="order-status-text">交易完成</view>
        <view class="order-status-tips">感谢您选择{{ systemName }}，欢迎再次光临！</view>
      </view>
      <!-- 已取消 -->
      <view v-else-if="order.order_status == -1" class="order-status-bar">
        <view class="order-status-text">订单已被取消</view>
        <view class="order-status-tips">如有需要请重新下单</view>
      </view>
      <!-- 其他状态 -->
      <view v-else class="order-status-bar">
        <view class="order-status-text">{{ statusTexts[order.order_status] }}</view>
        <view class="order-status-tips">如有需要请重新下单</view>
      </view>
    </view>


    <block v-if="uid == order.uid || uid == order.link_superior_user">
      <!-- 发货后的物流信息 -->
      <!-- 只有一个 -->
      <view v-if="order.shipping_info && order.shipping_info.length == 1" class="order-logistics-bar"
        @tap="goToLogistics(order.shipping_info[0].shipping_code)">
        <image class="order-logistics-icon" src="/static/images/car.png"></image>
        <view class="order-logistics-infos">
          <view class="order-logistics-content">{{ order.shipping_info[0].items[0].content }}</view>
          <view class="order-logistics-time">{{ order.shipping_info[0].items[0].node_time }}</view>
        </view>
        <image class="order-logistics-more" src="/static/images/more.png"></image>
      </view>
      <!-- 拆单物流 -->
      <view v-if="order.shipping_info && order.shipping_info.length > 1" class="order-logistics-bar"
        @tap="goToLogistics(order.shipping_code)">
        <image class="order-logistics-icon" src="/static/images/car.png"></image>
        <view class="order-logistics-infos">
          <view class="order-logistics-content">该订单已拆成{{ order.shipping_info.length || 0 }}个包裹发出，点击此处可查看详情</view>
          <view class="order-logistics-time">{{ order.shipping_info[0].items[0].node_time }}</view>
        </view>
        <image class="order-logistics-more" src="/static/images/more.png"></image>
      </view>
      <view v-if="order.shipping_type === 2" class="order-logistics-bar">
        <image class="order-logistics-icon" src="/static/images/car.png"></image>
        <view class="order-logistics-infos">
          <view class="order-logistics-content">该订单无物流，如未收到商品请联系客服</view>
          <!-- <view class="order-logistics-time">{{order.shipping_info[0].items[0].node_time}}</view> -->
        </view>
      </view>
    </block>

    <!-- 消费者地址 -->
    <view v-if="order.order_type != 6" class="order-user-bar">
      <image class="order-address-icon" src="/static/images/position.png"></image>
      <view class="order-user-infos">
        <view class="order-user-baseinfo">
          <text class="order-user-name">{{ order.shipping_name }}</text>
          <text>{{ order.shipping_phone }}</text>
        </view>
        <view class="order-user-info">{{ order.shipping_address }}</view>
      </view>
    </view>

    <!-- 订单商品列表 -->
    <view class="order-products">
      <view class="shopcar-orders">
        <view v-for="(item, index) in order.goods" class="shopcar-order" :key="item.id" @tap="goToProduct(index)">
          <view class="shopcar-order-img-box">
            <image class="shopcar-order-img" :src="item.images" mode="widthFix" webp lazy-load></image>
          </view>

          <!-- 代付款的订单 -->
          <view v-if="order.order_status == 1" class="shopcar-order-info">
            <view class="shopcar-order-top">
              <view class="shopcar-order-name">{{ item.title }}</view>
              <view class="shopcar-order-property">{{ item.attr }}</view>
            </view>
            <view class="shopcar-order-val-box">
              <view class="shopcar-order-val" :class="{ 'shopcar-order-val-unactive': order.user.vip_level }">
                <text v-if="order.pay_type == 7" class="crowd-activity-sign">积分</text>
                <template v-else>￥</template>
                {{ item.price || '0.00' }}
              </view>
              <view v-if="item.member_price" class="shopcar-order-vip-val">
                <text>会员 </text>
                <text class="shopcar-order-val" :class="{ 'shopcar-order-val-unactive': !order.user.vip_level }">￥{{
                  item.member_price }}</text>
              </view>

              <view class="shopcar-order-count">×{{ item.count }}</view>
            </view>
          </view>

          <!-- 不是代付款的页面的订单内容 -->
          <view v-if="order.order_status != 1" class="shopcar-order-info">
            <view class="shopcar-order-top">
              <view class="shopcar-order-name-box">
                <view class="shopcar-order-name shopcar-order-name-flex">{{ item.title }}</view>
                <view class="shopcar-order-count-static">×{{ item.count }}</view>
              </view>
              <view class="shopcar-order-property">{{ item.attr }}</view>
            </view>
            <view class="shopcar-order-val-box">
              <view v-if="item.total_price" class="shopcar-order-real-val">
                <text>实付：</text>
                <text class="shopcar-order-val-real">
                  <text v-if="order.pay_type == 7" class="crowd-activity-sign">积分</text>
                  <template v-else>￥</template>
                  {{ item.total_price }}
                </text>
              </view>

              <block v-if="uid == order.uid && item.allow_after == 1">
                <!-- 已付款，待收货 或者售后过自己取消了, allow_after == 2不显示按钮 -->
                <block v-if="order.order_type == 1 || order.order_type == 2 || order.order_type == 3">
                  <!-- 非拼拼商品 -->
                  <block v-if="!(!item.allow_after_type.includes('1') && order.order_status == 2)">
                    <!--  针对集品券专区：刚购买未发货且只有仅退款就不显示按钮  -->
                    <view v-if="((order.order_status == 2 && (order.order_type != 2 || order.pt.activity_status == 2)) || order.order_status == 3 || order.order_status == 4) &&
                      (item.after_status == 1 || item.after_status == -1)
                      " class="shopcar-order-ctrl" :data-index="index" @tap="goToReturnType">
                      退换
                    </view>
                  </block>
                  <view v-if="item.after_status != 1 && item.after_status != -1">{{ afterSaleTexts[item.after_status] }}
                  </view>
                </block>
                <block v-else-if="order.order_type == 4 || order.order_type == 5 || order.order_type == 6">
                  <!-- 拼拼 -->
                  <view
                    v-if="(order.order_status == 3 || order.order_status == 4) && (item.after_status == 1 || item.after_status == -1)"
                    class="shopcar-order-ctrl" :data-index="index" @tap="goToReturnType">
                    退换
                  </view>
                  <view v-else-if="item.after_status != 1 && item.after_status != -1">
                    {{ afterSaleTexts[item.after_status] }}</view>
                </block>
                <!-- 已收货 -->
                <!-- <view v-if="item.order_status == 4" class="shopcar-order-ctrl">评价</view> -->
              </block>

            </view>
          </view>

        </view>
      </view>
    </view>

    <!-- 订单金额信息 -->
    <view class="order-infos">
      <view class="order-info">
        <view class="order-info-name">商品总价</view>
        <view class="order-info-val">{{ order.total_price || '0.00' }}</view>
      </view>
      <view class="order-info">
        <view class="order-info-name">运费</view>
        <view class="order-info-val">{{ order.total_price == '0.00' ? '免运费' : order.fare_price }}</view>
      </view>
      <view class="order-info">
        <view class="order-info-name">折扣</view>
        <view class="order-info-val">-¥{{ order.discount_price || '0.00' }}</view>
      </view>
      <!-- <view class="order-info">
        <view class="order-info-name">优惠券</view>
        <view class="order-info-val">-¥10.00</view>
      </view>
      <view class="order-info">
        <view class="order-info-name">促销活动</view>
        <view class="order-info-val">-¥5.00</view>
      </view> -->
    </view>
    <view class="order-info-total">
      <view class="order-info-total-name">实付总额</view>
      <view class="order-info-total-val">
        <text v-if="order.pay_type == 7" class="crowd-activity-sign">积分</text>
        <template v-else>￥</template>
        {{ order.real_pay_price || '0.00' }}
      </view>
    </view>

    <view class="order-base-infos">
      <view class="order-base-info">
        <view class="order-base-info-name">订单编号：</view>
        <view class="order-base-info-val">{{ order.order_sn }}</view>
        <view class="order-base-info-btn" @tap="copyOrderSn">复制</view>
      </view>
      <view class="order-base-info">
        <view class="order-base-info-name">创建时间：</view>
        <view class="order-base-info-val">{{ order.create_time }}</view>
      </view>
      <view v-if="order.order_type == 2" class="order-base-info">
        <view class="order-base-info-name">订单类型：</view>
        <view class="order-base-info-val">拼团订单</view>
      </view>
    </view>

    <block v-if="order.order_type != 6 && order.order_type != 7 && order.order_type != 8">
      <block v-if="uid == order.uid">
        <!-- 订单操作, 未付款 -->
        <view v-if="order.order_status == 1 && !order.expire" class="order-ctrls">
          <view class="order-ctrl-info">
            <text class="should-pay">¥{{ order.real_pay_price }}</text>
          </view>
          <view class="order-ctrl-sm" @tap="cancelOrder">
            取消订单
          </view>
          <view class="order-ctrl-sm primary" :class="{ 'disabled': !couldPay }" @tap="payOrder">
            付款
          </view>
        </view>

        <view v-if="order.order_status == 2 || order.order_status == 4 || order.order_status == 8" class="order-ctrls">
          <view class="order-ctrl-info"></view>
          <view v-if="order.order_type == 2 && order.order_status == 2" class="order-ctrl-sm primary"
            @tap="goToCollageDetail">
            拼团详情
          </view>
          <view class="order-ctrl-sm order-receipt-btn" @tap="toOrderReceipt">
            生成回执
          </view>
        </view>

        <view v-if="order.order_status == 3 && order.isNormal" class="confirm-complete-ctrls">
          <view class="order-ctrl-info"></view>
          <view class="order-ctrl-sm order-receipt-btn" @tap="toOrderReceipt">
            生成回执
          </view>
          <view class="confirm-complete-btn" @tap="confirmGet">
            确认收货
          </view>
        </view>
      </block>

      <block v-else>
        <view
          v-if="order.order_status == 2 || order.order_status == 4 || order.order_status == 8 || (order.order_status == 3 && order.isNormal)"
          class="order-ctrls">
          <view class="order-ctrl-info"></view>
          <view class="order-ctrl-sm order-receipt-btn" @tap="toOrderReceipt">
            生成回执
          </view>
        </view>

      </block>
    </block>

  </view>
</template>

<script>
import h5Copy from '@/common/junyi-h5-copy.js';
import moment from 'moment';

export default {
  data() {
    return {
      systemName: '我们商城',
      uid: '',
      sn: null,
      couldPay: false,
      order: {
      },
      statusTexts: {
        [1]: '未支付',
        [2]: '支付成功',
        [3]: '已发货',
        [4]: '已签收',
        [5]: '退货申请',
        [6]: '退货中',
        [7]: '退货成功',
        [8]: '已完成',
        [-1]: '已取消',
        [-2]: '已超时',
        [-3]: '已关闭',
        [-4]: '拼团失败，自动取消'
      },
      afterSaleTexts: {
        [1]: '正常',
        [2]: '申请售后中',
        [3]: '售后中',
        [4]: '售后成功',
        [5]: '售后被拒',
        [-1]: '用户取消售后'
      },

      isCtrl: false,
      isTeam: false
    }
  },
  // onShareAppMessage() {
  //   let shareInfo = this.$getShareInfo();
  //   return shareInfo;
  // },
  onLoad(options) {
    this.systemName = this.$name;
    this.sn = options.sn;
    this.isTeam = options.team || false;

    // #ifndef H5
    this.couldPay = true;
    // #endif

    this.uid = uni.getStorageSync('userInfo').uid;

    this.getOrder();
  },
  methods: {
    getOrder() {
      let params = {
        order_sn: this.sn
      };
      if(this.isTeam) params.needEncrypt = 1;
      this.$get('/order/info', params, res => {
        let order = res.data;
        order.isNormal = true;  //假设订单是正常订单
        let normalGoodsNum = 0; //正常商品数，非退售后或者部分金额退售后
        for(let i = 0; i < order.goods.length; i++) {
          order.goods[i].attr = Object.values(JSON.parse(order.goods[i].specs || {})).join('，');
          if(order.goods[i].after_status == 1 || order.goods[i].after_status == 5 || order.goods[i].after_status == -1) {
            normalGoodsNum += 1;
          } else if(order.goods[i].after_status == 2 || order.goods[i].after_status == 3) {
            order.isNormal = false; //全退
          } else {
            if(order.goods[i].partAfterSale) normalGoodsNum += 1;
          }
          if(i == order.goods.length - 1 && normalGoodsNum == 0) order.isNormal = false; //钱全退光了
        }

        if(order.order_status == 1) {
          // 2小时失效
          let close_time = moment(order.pay_time_out_time).format('x') - moment(new Date()).format('x');
          let close_duration = moment.duration(close_time);
          if(close_time >= 0) {
            order.close_time = `${close_duration.hours()}小时${close_duration.minutes()}分钟`;
          } else {
            order.expire = true;
          }
        }
        order.shipping_info = [];
        if(order.shipDetail) {
          let ship_codes = Object.keys(order.shipDetail || {});
          let ship_contents = Object.values(order.shipDetail || {});
          for(let i = 0; i < ship_codes.length; i++) {
            let item = {
              shipping_code: ship_codes[i],
              items: ship_contents[i]
            }
            order.shipping_info.push(item);
          }
        }
        this.order = order;
      })

    },
    copyOrderSn() {
      let order_sn = this.order.order_sn;
      // #ifdef H5
       let content = order_sn; // 复制内容，必须字符串，数字需要转换为字符串
       const result = h5Copy(content);
       if (result === true) {
         uni.showToast({
           title:'复制成功',
         })
       } else {
         uni.showToast({
           title:'复制失败',
           icon:'none'
         })
       }
      //  #endif
      // #ifndef H5
      uni.setClipboardData({
        data: order_sn,
        success: res => {
          uni.showToast({
            title:'复制成功',
          })
        },
        fail: err => {
          uni.showToast({
           title:'复制失败',
           icon:'none'
         })
        }
      })
      // #endif
    },
    cancelOrder() {
      uni.showModal({
        title: '提示',
        content: '您将取消该订单，是否继续？',
        success: res => {
          if(res.confirm) {
            let params = {
              uid: uni.getStorageSync('userInfo').uid,
              order_sn: this.order.order_sn
            }
            this.$post('/order/cancel', params, res => {
              setTimeout(() => {
                uni.showToast({
                  title: '取消订单成功',
                  mask: true
                })
              }, this.$toastDelay);
              setTimeout(() => {
                this.getOrder();
              }, 1800)
            })
          }
        }
      })
    },

    confirmGet() {
      uni.showModal({
        title: '提示',
        content: '温馨提示：完成确认收货后退换货通道将自动关闭，是否确认收货？',
        confirmText: '确认',
        success: res => {
          if(res.confirm) {
            let params = {
              uid: uni.getStorageSync('userInfo').uid,
              order_sn: this.order.order_sn
            }
            this.$post('/order/confirm', params, res => {
              setTimeout(() => {
                uni.showToast({
                  title: '确认收货成功',
                  mask: true
                })
              }, this.$toastDelay)
              setTimeout(() => {
                this.getOrder();
              }, 1800)
            })
          }
        }
      })
    },

    goToCollageDetail() {
      console.log(this.order)
      if(this.order.pt && this.order.pt.activity_code && this.order.pt.activity_sn) {
        uni.redirectTo({
          url: `/market-pages/pages/collage/collage-detail/collage-detail?code=${this.order.pt.activity_code}&&sn=${this.order.pt.activity_sn}&fromOrder=true`
        })
      }
    },

    toOrderReceipt() {
      let order = {
        order_sn: this.order.order_sn,
        goods: [],
        pay_time: this.order.pay_time,
        total_price: this.order.total_price,
        shipping_name: this.order.shipping_name,
        shipping_phone: this.order.shipping_phone,
        shipping_address: this.order.shipping_address,
      }
      for(let i = 0; i < this.order.goods.length; i++ ) {
        let item = this.order.goods[i];
        order.goods.push({
          title: item.title,
          images: item.images,
          attr: item.attr,
          price: item.sale_price,
          count: item.count,
          fare: item.total_fare_price || 0
        })
      }
      uni.setStorageSync('receipt', order);
      uni.navigateTo({
        url: `/mine-pages/pages/mine/order-receipt/order-receipt`
      })
    },
    goToLogistics(code) {
      if(code.split(',').length > 1) {
        uni.navigateTo({
          url: `/pages/logistics-list/logistics-list?code=${code}&sn=${this.order.order_sn}`
        })
      } else {
        uni.navigateTo({
          url: `/pages/logistics/logistics?code=${code}&sn=${this.order.order_sn}`
        })
      }
    },
    goToReturnType(e) {
      this.isCtrl = true;
      let index = e.currentTarget.dataset.index;
      let afterSale = {
        order_sn: this.sn,
        order_status: this.order.order_status,
        goods: JSON.parse(JSON.stringify(this.order.goods[index])),
        shipping_status: this.order.goods[index].shipping_status,
        relations: [],
        order_type: this.order.order_type
      };
      // 针对要退的商品进行可退金额的计算和处理
      let real_pay_price_origin = afterSale.goods.real_pay_price;
      let real_pay_price = afterSale.goods.real_pay_price;
      if(afterSale.goods.shipping_status != 1 && afterSale.goods.shipping_status != 2) {
        // 已经发货的话默认去掉运费
        real_pay_price = (parseFloat(afterSale.goods.real_pay_price) - parseFloat(afterSale.goods.total_fare_price)).toFixed(2);
      }

      afterSale.goods.real_pay_price_origin = real_pay_price_origin;
      afterSale.goods.real_pay_price = real_pay_price;

      for(let i = 0; i < this.order.goods.length; i++) {
        // 存实际支付，一起退的时候会用上
        let relation = JSON.parse(JSON.stringify(this.order.goods[i]));
        relation.real_pay_price_origin = relation.real_pay_price;
        if(relation.after_status == 1 || relation.after_status == -1) {
          if(index != i) afterSale.relations.push(relation);
        }
      }

      uni.setStorageSync('afterSale', afterSale);
      uni.navigateTo({
        url: `/pages/return-type/return-type`
      })
    },

    goToProduct(index) {
      let sn = this.order.goods[index].goods_sn;
      if(this.isCtrl) {
        return setTimeout(() => {
          this.isCtrl = false;
        }, this.$toastDelay)
      }
      uni.navigateTo({
        url: `/pages/product-detail/product-detail?sn=${sn}`
      })
    },

    payOrder() {
      let order = this.order;
      let close_time = moment(order.pay_time_out_time).format('x') - moment(new Date()).format('x');
      let close_duration = moment.duration(close_time);
      if(close_time < 0) {
        this.order.expire = true;
        return uni.showToast({
          title: '订单已过期',
          mask: true,
          icon: 'none'
        })
      }
      let params = {
        order_sn: this.sn,
        uid: uni.getStorageSync('userInfo').uid
      };
      this.$post('/order/again', params, res => {
        // #ifdef H5
        if (this.$jwx && this.$jwx.isWechat()) {//检查是否是微信环境
          this.$jwx.wxpay(res.data, wxmsg => {
            if(wxmsg == '{"errMsg":"chooseWXPay:ok"}') {

              setTimeout(() => {
                uni.showToast({
                  title: '支付成功',
                  mask: true,
                  duration: 2000
                })
                this.getOrder();
              },this.$toastDelay)
            } else {
              uni.showToast({
                title: '支付失败',
                icon: 'none',
                mask: true,
                duration: 2000
              })
            }

          }, err => {})
        }
        // #endif
        // #ifndef H5
        let data = res.data;
        uni.requestPayment({
            provider: 'wxpay',
            timeStamp: data.timeStamp,
            nonceStr: data.nonceStr,
            package: data.package,
            signType: data.signType,
            paySign: data.paySign,
            success: res => {
              if(res.errMsg == 'requestPayment:ok') {
                // 微信小程序订阅消息
                // #ifdef MP-WEIXIN
                uni.requestSubscribeMessage({
                  tmplIds: data.templateId,
                  success: res => {
                    console.log(res);
                    uni.getSetting({
                      withSubscriptions: true,
                      success: setting => {
                        let subscribeList = setting.subscriptionsSetting;
                        if(!subscribeList.mainSwitch || Object.values(subscribeList.itemSettings || {}).length > 0) {
                          let items = subscribeList.itemSettings, itemValues = [];  //订阅消息列表， 订阅消息默认值
                          if(items) itemValues = Object.values(items || {});
                          if(!subscribeList.mainSwitch || itemValues.includes('reject')) {
                            uni.showModal({
                              title: '提示',
                              content: '您有部分消息不接收或默认禁止该类别的消息推送，导致部分服务消息无法推送给您。为了后面您更好的体验，建议您前往 设置->订阅消息 开启相关服务消息的推送。',
                              confirmText: '前往设置',
                              success: res => {
                                if(res.confirm) {
                                  uni.openSetting();
                                }
                              }
                            })
                          }
                        }

                      }
                    })
                  },
                  fail: err => {
                    console.log('err',err);
                    if(err.errMsg == 'requestSubscribeMessage:fail The main switch is switched off') {
                      // 用户关闭了消息订阅
                      uni.showModal({
                        title: '提示',
                        content: `您关闭了${this.$name}的消息提醒服务，无法给您推送对应的服务消息。为了后面您更好的体验，建议您前往 设置->订阅消息 开启服务消息的推送。`,
                        confirmText: '前往设置',
                        success: res => {
                          if(res.confirm) {
                            uni.openSetting();
                          }
                        }
                      })
                    }
                  }
                })
                // #endif

                setTimeout(() => {
                  uni.showToast({
                    title: '支付成功',
                    mask: true,
                    duration: 2000
                  })
                  this.getOrder();
                }, 180)
              } else {
                uni.showToast({
                  title: '支付失败',
                  icon: 'none',
                  mask: true,
                  duration: 2000
                })
              }
            },
            fail: function (err) {
              uni.showToast({
                title: '支付失败',
                icon: 'none',
                mask: true,
                duration: 2000
              })
            }
        });
        // #endif
      })
    }
  }
}
</script>
<style lang="scss" scoped>
@import 'order-detail.scss';
</style>