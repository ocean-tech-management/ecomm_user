<template>
  <view class="flex-page">
    <!-- 页面内容 -->
    <view class="flex-page-content">

      <view class="order-box">
        <scroll-view 
          scroll-y 
          class="tab-page-scroll" 
          :refresher-enabled="true" 
          :refresher-triggered="refreshing"
          @refresherrefresh="reGetList" 
          @scrolltolower="getList">
          <view class="order-list">
            <view v-for="(order, index) in orders" class="order" :key="index" @tap="goToDetail(index)">
              <view class="order-item">
                <view class="order-header">
                  <view class="order-base-infos">
                    <view class="order-base-info-sm">
                      <view>{{order.create_time}}</view>
                    </view>
                  </view>
                  <view class="order-status medius">
                    <block v-if="order.activity_status == 2">
                      {{winStatusTexts[order.win_status]}}
                    </block>
                    <block v-else-if="order.activity_status != -3">
                      {{statusTexts[order.activity_status]}} 
                    </block>
                    <block v-else>
                      <block v-if="order.refund_status == 1">已退款</block>
                      <block v-if="order.refund_status == 2">未拼中</block>
                    </block>
                  </view>
                </view>
                <view class="order-contents">
                  <view class="order-content" :key="skuIndex">
                    <view class="order-item-img-box">
                      <image class="order-item-img" :src="order.goods.image" mode="widthFix" webp lazy-load></image>
                    </view>
                    <view class="order-item-info">
                      <view class="order-item-title">{{order.goods.title}}</view>
                      <view class="order-item-vals">
                        <view class="order-item-val">￥{{order.real_pay_price || '0.00'}}</view>
                        <view v-if="order.goods.market_price && order.goods.market_price != order.goods.price" class="order-item-val-unactive">￥{{order.goods.market_price || '0.00'}}</view>
                      </view>
                    </view>
                  </view>
                </view>                    
                <view class="order-extends">
                  <view class="order-sn">{{order.order_sn}}</view>
                  <view class="order-ctrls">
                    <block v-if="order.can_operate_refund == 1 && order.pay_status == 2 && !order.opreating">
                      <view class="order-ctrl primary" @tap="tryRefund(index)">退回本金</view>
                    </block>
                  </view>
                </view>
              </view>
            </view>


          </view>
              
          <view v-if="orderLoading" class="scroll-tips">加载中...</view>
          <view v-if="orders.length > 0 && currentPage > pageTotal && !orderLoading" class="scroll-tips">已经到底啦</view>
          <view v-if="orders.length == 0 && currentPage > pageTotal && !orderLoading" class="scroll-tips">暂无记录哦</view>

        </scroll-view>


      </view>
    </view>

    <view v-if="rewardPopupVisible == true" class="get-reward-popup">
      <view class="get-reward-popup-bg" @tap="rewardPopupVisible = false"></view>
      <view class="get-reward-content" @tap="goToPpylReward">
        <image class="get-reward-content-img" src="/static/images/share.jpg" mode="widthFix"></image>
      </view>
    </view>

    
  </view>
</template>
<script>
  import h5Copy from '@/common/junyi-h5-copy.js';

  import moment from 'moment';
  export default {
    data() {
      return {

        refreshing: false,

        currentPage: 1,
        pageTotal: 1,

        orders: [],
        statusTexts: {
          [1]: '进行中',
          [2]: '拼团成功',
          [3]: '未成团',
          [-1]: '取消付款',
          [-2]: '已退款',
          [-3]: '未拼中退款'
        },
        winStatusTexts: {
          [1]: '已拼中',
          [2]: '未拼中',
          [3]: '开奖中'
        },
        
        waitStatusTexts: {
          [1]: '排队中',
          [2]: '排队完成',
          [3]: '超时未成功',
          [-1]: '取消付款',
          [-2]: '已退款'
        },
        orderLoading: false,
        orderRequestTask: null,

        // 时间控件
        showPicker: false,

        selectDate: moment().format('YYYY/MM/DD HH:mm:ss'),
        timeTexts: moment().format('YYYY.MM.DD'),
        timeVals: moment().format('YYYY/MM/DD'),

        rewardPopupVisible: false,
        currentRewardIndex: 0,

        coldDownInterval: null
      }
    },
    onLoad(options) {
      this.getList();
    },  
    onShow() {
    },
    onHide() {
      if(this.coldDownInterval) clearTimeout(this.coldDownInterval);
    }, 
    onUnload() {
      if(this.coldDownInterval) clearInterval(this.coldDownInterval);
    },
    methods: {
      getList() {
        if(this.currentPage > this.pageTotal || this.orderLoading) return;
        let params = {
          uid: uni.getStorageSync('userInfo').uid,
          page: this.currentPage,
          activity_status: [3, -3],
          pay_status: 2,
          can_operate_refund: 1,
          refund_status: 2
        }
        this.orderLoading = true;
        let orderRequestTask = this.$post('/ppyl/order', params, res => {
          this.orderLoading = false;
          this.currentPage += 1;
          if(!res.data.list || res.data.list.length == 0) return;
          let orders = res.data.list;

          this.orders.push(...orders);
          this.pageTotal = res.data.pageTotal;
        }, err => {
          console.log(err);
          this.orderLoading = false;
        })
        // 因为是需要验证uid的请求，因多请求因故，走promise异步
        orderRequestTask.then(request => {
          this.orderRequestTask = request;
        })
      },

      reGetList() {
        this.refreshing = true;
        this.currentPage = 1;
        this.pageTotal = 1;
        this.orders = [];
        this.getList();
        setTimeout(() => {
          this.refreshing = false;
        }, 200)
      },

      // 退本金
      tryRefund(index) {
        if(this.orders[index].opreating) return;
        uni.showModal({
          title: '提示',
          content: '是否确定对该订单进行退本金操作？',
          success: res => {
            if(res.confirm) {
              this.orders[index].opreating = true;
              let params = {
                uid: uni.getStorageSync('userInfo').uid,
                order_sn: this.orders[index].order_sn
              }
              this.$post('/ppyl/refund', params, res => {
                setTimeout(() => {
                  uni.showToast({
                    title: '退回本金成功',
                    duration: 2500,
                    mask: true
                  })
                }, this.$toastDelay)
                setTimeout(() => {
                  this.reGetList();
                }, 2800)
              }, err => {
                this.orders[index].opreating = false;
              })
            }
          }
        })
      },

      copyOrderSn(order_sn) {
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

    }
  }
</script>

<style lang="scss" scoped>
  @import 'refundable-orders.scss';
</style>
