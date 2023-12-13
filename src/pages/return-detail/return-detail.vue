<template>
  <view class="uni-common-pb-withbtn">
    
    <!-- 页面内容 -->
    <view class="order-status-banner">
      <image class="order-status-bg" src="/static/images/bg/bg_status.png" mode="widthFix"></image>

      <!-- 未付款 -->
      <view v-if="order.after_status == 1" class="order-status-bar">
        <view class="order-status-text">等待客服处理</view>
        <!-- <view class="order-status-tips">还剩1天12小时22分</view> -->
      </view>
      <!-- 已付款 -->
      <view v-else-if="order.after_status == 2" class="order-status-bar">
        <view v-if="order.type == 1" class="order-status-text">商家已同意申请，等待退款</view>
        <view v-if="order.type != 1" class="order-status-text">请退货并填写物流信息</view>
        <!-- <view class="order-status-tips">还剩2天23小时</view> -->
      </view>
      <view v-else-if="order.after_status == 6" class="order-status-bar">
        <view v-if="order.type == 2" class="order-status-text">商家已收货，等待退款</view>
        <view v-if="order.type == 3" class="order-status-text">商家已收货，等待商家重新发货</view>
        <!-- <view class="order-status-tips">还剩2天23小时</view> -->
      </view>
      <!-- 已发货 -->
      <view v-else-if="order.after_status == 7 || order.after_status == 10" class="order-status-bar">
        <view class="order-status-text">退货/退款成功</view>
        <view class="order-status-tips">感谢您选择{{name}}！</view>
      </view>
      
      <!-- 已取消 -->
      <view v-else-if="order.after_status == -1" class="order-status-bar">
        <view class="order-status-text">您已取消申请</view>
        <view class="order-status-tips">感谢您选择{{name}}！</view>
      </view>
      <!-- 已取消 -->
      <view v-else class="order-status-bar">
        <view class="order-status-text">{{statusTexts[order.after_status]}}</view>
      </view>
    </view>

    <!-- 消费者地址 -->
    <view v-if="order.after_status == 1" class="return-status-info">
      <view class="return-status-title">您已成功发起申请，请耐心等待客服审核</view>
      <view class="return-status-tips">请保护好产品包装，谢绝货到付款，感谢您的配合</view>
    </view>
    <view v-if="order.after_status == 2" class="return-status-info">
      <view class="return-status-title">您的申请已通过审核，请尽早发货</view>
      <view class="return-status-tips">请保护好产品包装，谢绝货到付款，感谢您的配合</view>
    </view>
    <view v-if="order.after_status == 4 && order.type != 1" class="return-user-bar">
      <image class="return-address-icon" src="/static/images/car.png"></image>
      <view class="return-user-infos">
        <view class="return-user-baseinfo">
          <text class="return-user-name">{{order.seller_shipping_name}}</text>
          <text>{{order.seller_shipping_phone}}</text>
        </view>
        <view class="return-user-info">{{order.seller_shipping_address}}</view>
        <view class="return-user-info">备注：{{order.seller_remark}}</view>
        <text class="order-base-info-btn fixed" @tap="copyAddress(order)">复制信息</text>
      </view>
    </view>

    <!-- 订单商品列表 -->
    <view class="order-products">
      <view class="return-title">退款信息</view>
      <view class="shopcar-orders">
        <view class="shopcar-order">
          <view class="shopcar-order-img-box">
            <image class="shopcar-order-img" :src="order.goods.images" mode="widthFix"/>
          </view>
          
          <!-- 代付款的订单 -->
          <view class="shopcar-order-info">
            <view class="shopcar-order-top">
              <view class="shopcar-order-name-box">
                <view class="shopcar-order-name shopcar-order-name-flex">{{order.goods.title}}</view>
                <view class="shopcar-order-count-static">×{{order.goods.count}}</view>
              </view>
              <view class="shopcar-order-property">{{order.goods.attr}}</view>
            </view>
          </view>

        </view>
      </view>
    </view>

    <view class="order-base-infos">
      <view class="order-base-info">
        <view class="order-base-info-name">退款编号：</view>
        <view class="order-base-info-val">{{order.after_sale_sn}}</view>
        <view class="order-base-info-btn" @tap="copyOrderSn">复制</view>
      </view>
      <view class="order-base-info">
        <view class="order-base-info-name">申请时间：</view>
        <view class="order-base-info-val">{{order.create_time}}</view>
      </view>
      <view class="order-base-info">
        <view class="order-base-info-name">退款金额：</view>
        <view class="order-base-info-val">{{order.apply_price}}</view>
      </view>
      <view class="order-base-info">
        <view class="order-base-info-name">服务类型：</view>
        <view class="order-base-info-val">{{typeText[order.type]}}</view>
      </view>
      <view class="order-base-info">
        <view class="order-base-info-name">退款原因：</view>
        <view class="order-base-info-val">{{order.apply_reason}}</view>
      </view>
    </view>

    <view v-if="order.after_status == 3 || order.after_status == -2 || order.after_status == -3" class="order-base-infos" style="margin-top: 20rpx">
      <view class="order-base-info">
        <view class="order-base-info-name">商家依据：</view>
        <!-- <view v-if="order.detail[0]" class="order-base-info-val">{{order.detail[0].content}}</view> -->
        <view v-if="order.refuse_reason" class="order-base-info-val">{{order.refuse_reason}}</view>
        <view v-if="order.verify_reason" class="order-base-info-val">{{order.verify_reason}}</view>

      </view>
      <!-- <view v-if="order.detail[0] && order.detail[0].images" class="return-pictures">
        <view v-for="(item, index) in images" class="return-picture-item" :key="index">
          <view class="return-picture-box">
            <image class="return-picture" :src="item" mode="widthFix"></image>
          </view>
        </view>
      </view> -->
    </view>
     <view v-if="order.after_status == 8 || order.after_status == 9" class="order-base-infos" style="margin-top: 20rpx">
      <view class="order-base-info">
        <view class="order-base-info-name">物流公司：</view>
        <view class="order-base-info-val">{{order.change_shipping_company}}</view>
      </view>
      <view class="order-base-info">
        <view class="order-base-info-name">物流编号：</view>
        <view class="order-base-info-val">{{order.change_shipping_code}}</view>
      </view>
    </view>




    <view v-if="order.after_status == 1" class="order-ctrls">
      <view class="order-ctrl-info"></view>
      <view class="order-ctrl" @tap="cancelApply">撤销申请</view>
      <!-- <view class="order-ctrl primary" @tap="goToReturnEdit">修改申请</view> -->
    </view>

    <view v-if="order.after_status == 4" class="order-ctrls">
      <view class="order-ctrl-info"></view>
      <!-- <view class="order-ctrl" @tap="cancelApply">撤销申请</view> -->
      <view class="order-ctrl primary" @tap="goToReturnFillLogistics">填写物流</view>
    </view>
    <view v-if="order.after_status == 8" class="order-ctrls">
      <view class="order-ctrl-info"></view>
      <view class="order-ctrl primary" @tap="confirmGetDelivery">确认收到换货</view>
    </view>

  </view>

</template>

<script>
import h5Copy from '@/common/junyi-h5-copy.js';
import config from '@/config';
export default {
  data() {
    return {
      name: '',

      sn: null,
      order: {},
      statusTexts: {
        [1]: '申请中',
        [2]: '已同意',
        [3]: '商家不同意售后',
        [4]: '商家已同意，请您发货',
        [5]: '待商家收货',
        [6]: '商家已收货',
        [7]: '退款成功',
        [8]: '待收货',
        [9]: '已收货',
        [10]: '售后完成',
        [-1]: '已取消',
        [-2]: '商家拒绝收货',
        [-3]: '商家拒绝退款'
      },
      typeText: {
        [1]: '仅退款',
        [2]: '退货退款',
        [3]: '换货'
      },
    }
  },
  onLoad(options) {
    this.sn = options.sn;
    this.name = config.name;
    this.getData();
  },
  onShow() {
    setTimeout(() => {
      if(uni.getStorageSync('shouldReload')) {
        uni.removeStorageSync('shouldReload');
        this.getData();
      }
    }, 30)
  },
  methods: {
    getData() {
      let params = {
        after_sale_sn: this.sn
      };
      this.$get('/afterSale/info', params, res => {
        let order = res.data;
        order.goods.attr = Object.values(JSON.parse(order.goods.specs)).join('，');

        this.order = order;
      })
    },
    copyOrderSn() {
      let return_sn = this.order.after_sale_sn;
      // #ifdef H5
       let content = return_sn; // 复制内容，必须字符串，数字需要转换为字符串
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
        data: return_sn,
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

    goToReturnEdit(e) {
      let sn = e.currentTarget.dataset.sn;
      uni.navigateTo({
        url: `/pages/return-edit/return-edit?sn=${sn}`
      })
    },
    cancelApply() {
      uni.showModal({
        title: '提示',
        content: '您确定取消该申请吗？',
        success: res => {
          if(res.confirm) {
            let params = {
              after_sale_sn: this.order.after_sale_sn,
              uid: uni.getStorageSync('userInfo').uid
            }
            this.$post('/afterSale/cancel', params, res => {
              setTimeout(() => {
                uni.showToast({
                  title: '取消申请成功',
                  mask: true
                })
                setTimeout(() => {
                  this.getData();
                }, 1800)
              }, this.$toastDelay)
              
            })
            
            // this.getList();
          }
        }
      })
    },
    goToReturnFillLogistics() {
      uni.navigateTo({
        url: `/pages/return-fill-logistics/return-fill-logistics?sn=${this.sn}`
      })
    },
    confirmGetDelivery() {
      uni.showModal({
        title: '提示',
        content: '已收到换货商品，确认收货？',
        success: res => {
          if(res.confirm) {
            let params = {
              after_sale_sn: this.order.after_sale_sn
            }
            this.$post('/afterSale/confirm', params, res => {
              setTimeout(() => {
                uni.showToast({
                  title: '收货成功',
                  mask: true
                })
                setTimeout(() => {
                  this.getData();
                }, 1800)
              }, this.$toastDelay)
              
            })
            
            // this.getList();
          }
        }
      })
    }
  }
}
</script>
<style lang="scss" scoped>
  @import 'return-detail.scss';
</style>