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
            
            <!-- 日期筛选，未拼中状态专有 -->
            <view class="order-extend-filters">
              <view class="order-extend-time-filter">
                <view class="order-extend-time-quickly">
                  <view class="order-extend-quickly-vals">
                    <view class="order-extend-quickly-val">选择日期</view>
                  </view>
                </view>
                <view class="order-extend-time-trigger" @tap="showPicker = true">
                  <view class="order-extend-time-val">
                    <view v-if="timeTexts">
                      {{timeTexts}}
                    </view>
                  </view>
                  <view class="order-filter-time">
                    <image class="filter-time-icon" src="/static/images/date_black.png"></image>
                  </view>
                </view>
              </view>
            </view>
            <view v-for="(order, index) in orders" class="order" :key="index">
              <view class="order-item">
                <view class="order-header">
                  <view class="order-base-infos">
                    <view class="order-base-info-sm">
                      <view>{{order.create_time}}</view>
                    </view>
                  </view>
                  <view class="order-status medius">
                    {{waitStatusTexts[order.wait_status]}} 
                  </view>
                </view>
                <view class="order-contents">
                  <view class="order-content" :key="skuIndex">
                    <view class="order-item-img-box">
                      <image class="order-item-img" :src="order.orderGoods.images" mode="widthFix" webp lazy-load></image>
                    </view>
                    <view class="order-item-info">
                      <view class="order-item-title">{{order.orderGoods.title}}</view>
                      <view class="order-item-vals">
                        <view class="order-item-val">￥{{order.real_pay_price || '0.00'}}</view>
                        <view v-if="order.orderGoods.market_price && order.orderGoods.market_price != order.orderGoods.price" class="order-item-val-unactive">￥{{order.orderGoods.market_price || '0.00'}}</view>
                      </view>
                    </view>
                    <view v-if="order.wait_status == 1" class="wait-order-ctrl" @tap="tryCancelWait(order.order_sn)">取消排队</view>
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
      <mx-datetime-picker :show="showPicker" type="date" :value="selectDate" :show-tips="true" :show-seconds="false" @confirm="onSelectedTime" @cancel="onSelectedTime" />
    </view>
  </view>
  
</template>
<script>
import mxDatetimePicker from '@/components/mx-datetimepicker/mx-datetimepicker.vue';
import moment from 'moment';
export default {
  components: {
    mxDatetimePicker
  },
  data() {
    return {
      refreshing: false,

      currentPage: 1,
      pageTotal: 1,

      orders: [],
      
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
    }
  },
  onLoad() {
    this.getList();
  },
  methods: {
    
    getList() {
      if(this.currentPage > this.pageTotal || this.orderLoading) return;
      let params = {
        uid: uni.getStorageSync('userInfo').uid,
        page: this.currentPage,
        wait_status: [2, 3],  //除了正在排队的
      }
      if(this.timeVals && this.timeVals !== '') {
        params.start_time = moment(this.timeVals).format('YYYY-MM-DD 00:00:00');
        params.end_time = moment(this.timeVals).format('YYYY-MM-DD 23:59:59');
      }
      this.orderLoading = true;
      let orderRequestTask = this.$spost('/ppyl/waitList', params, res => {
        this.orderLoading = false;
        this.currentPage += 1;
        if(!res.data.list || res.data.list.length == 0) return;
        let orders = res.data.list;

        this.orders.push(...orders);
        if(this.tabIndex == 1) this.coldDowning();
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
    
    onSelectedTime(val) {
      this.showPicker = false;
      if(val) {
        this.selectDate = moment(val.value).format('YYYY/MM/DD HH:mm:ss');
        this.timeTexts = moment(val.value).format('YYYY.MM.DD');
        this.timeVals = moment(val.value).format('YYYY/MM/DD');
        this.quicklyTimeIndex = 1;
        this.reGetList();
      }
    },


  }
}
</script>

<style lang="scss" scoped>
  @import 'wait-list.scss';
</style>