<template>
  <view class="flex-page">

    <!-- 时间筛选 -->
    <view class="time-filter-bar">
      <view class="time-filter-trigger" @tap="chooseRange">
        <image class="time-filter-icon" src="/static/images/date_black.png"></image>
        <view class="time-filter-val" :class="{'time-filter-placeholder': timeFilterTexts.length != 2}">{{timeFilterTexts.length == 2 ? (timeFilterTexts[0] + ' ~ ' + timeFilterTexts[1]) : '开始时间~结束时间'}}</view>
        <image class="time-filter-search" src="/static/images/icon_search.png"></image>
      </view>
    </view>

    <!-- tab部分 -->
    <view class="tabs">
      <view :class="'tab ' + (tabIndex == 0 ? 'active' : '')" data-id="0" @tap="updateTabIndex">
        全部
      </view>
      
      <view :class="'tab ' + (tabIndex == 1 ? 'active' : '')" data-id="1" @tap="updateTabIndex">
        收入
      </view>
      <view :class="'tab ' + (tabIndex == 2 ? 'active' : '')" data-id="2" @tap="updateTabIndex">
        支出
      </view>
    </view>
    
    <!-- 页面内容 -->
    <view class="flex-page-content">

      <view class="list-box">
        <scroll-view scroll-y class="tab-page-scroll" @scrolltolower="getList">
           <view class="incomes-list">
            <view v-for="(item, index) in dataList" class="income" :key="index">
              <view class="income-content">
                <view class="income-info">
                  <view class="income-desc" :class="{'warning-color': item.change_type == 4}">{{typeText[item.change_type]}} {{item.order_user_name ? ('-来自' + item.order_user_name) : ''}}</view>
                  <view class="income-create-time">{{item.create_time}}</view>
                  
                </view>
                <view :class="{'income-val': true, 'income-less': parseFloat(item.price) < 0}">
                  <view v-if="parseFloat(item.price) > 0">+{{item.price}}</view>
                  <view v-else>{{item.price}}</view>
                </view>
              </view>
              <view class="income-info-extend">
                <view v-if="item.order_sn" class="income-desc-item">
                  <view class="income-desc-orderid">{{item.order_sn}}</view>
                  <view v-if="item.divide_type" >订单金额：￥{{item.total_price || 0}}</view>
                </view>
              </view>
               
             </view>
           </view>

          <view v-if="dataList.length > 0 && currentPage > pageTotal && !listLoading" class="scroll-tips">已经到底啦</view>
          <view v-if="dataList.length == 0 && currentPage > pageTotal && !listLoading" class="scroll-tips">暂无记录哦</view>

        </scroll-view>
      </view>
    </view>
    <mx-datetime-picker :show="showPicker" type="range" :value="timerange" :show-tips="true" :begin-text="'开始'" :end-text="'结束'" :show-seconds="true" @confirm="onSelectedTime" @cancel="onSelectedTime" />

  </view>

</template>
<script>
import moment from 'moment';
import mxDatetimePicker from '@/components/mx-datetimepicker/mx-datetimepicker.vue';
import config from '@/config'
export default {
  components: {
    mxDatetimePicker
  },
  data() {
    return {
      userInfo: uni.getStorageSync('userInfo'),
      tabIndex: 0,
      currentPage: 1,
      pageTotal: 1,
      listLoading: false,

      timerange: [],
      timeTexts: [],
      timeFilterTexts: [],
      showPicker: false,

      dataList: [],
      typeText: {
        [1]: '订单分润',
        [2]: '会员分润',
        [3]: '消费',
        [4]: '用户回收',
        [5]: '退款',
        [6]: '取消分润',
        [7]: '教育奖金发放',
        [8]: '拼拼退款',
        [9]: '拼拼排队超时退款',
        [10]: '拼拼钱包转入',
        [11]: '拼拼分佣回收',
        [12]: '广宣奖',
        [13]: '商品感恩奖',
        [14]: '取消商品感恩奖',
        [15]: '广宣奖回收',
        [16]: '团队业绩奖励',
        [17]: '团队业绩奖励回收',
        [18]: '股东奖奖励',
        [19]: '股东奖回收',
        [20]: '区代奖励',
        [21]: '区代奖励回收',
        [22]: `${config.written.crowdBalanceName}转入`,
        [23]: '分润转入',
        [24]: '分润转出',
        [25]: '拼拼转入',
        [26]: '拼拼转出',
        [27]: '广宣奖转入',
        [28]: '广宣奖转出',
        [29]: '团队业绩奖转入',
        [30]: '团队业绩将转出',
        [31]: '股东奖转入',
        [32]: '股东奖转出',
        [33]: '区代奖转入',
        [34]: '区代奖转出'
      }
    }
  },
  onShareAppMessage() {
    let shareInfo = this.$getShareInfo();
    return shareInfo;
  },
  onLoad(options) {
    this.getList();
  },
  methods: {
    getList() {
      if(this.currentPage > this.pageTotal) return;
      let params = {
        uid: uni.getStorageSync('userInfo').uid,
        page: this.currentPage
      }
      if(this.tabIndex != 0) params.type = this.tabIndex;
      if(this.timeTexts.length == 2) {
        params.start_time = this.timeTexts[0];
        params.end_time = this.timeTexts[1];
      }
      this.listLoading = true;
      this.$get('/user/balance', params, res => {
        this.listLoading = false;
        this.currentPage += 1;
        if(res.data.length == 0) return;
        let dataList = res.data.list;
        for(let i = 0; i < dataList.length; i++) {
          dataList[i].create_time = moment(dataList[i].create_time).format('MM-DD HH:mm')
        }
        
        this.dataList.push(...dataList);
        this.pageTotal = res.data.pageTotal;
      }, err => {
        this.listLoading = false;
      })
    },
    updateTabIndex(e) {
      let id = e.currentTarget.dataset.id;
      this.tabIndex = id;
      this.currentPage = 1;
      this.pageTotal = 1;
      this.timerange = [];
      this.timeTexts = [];
      this.timeFilterTexts = [];
      this.dataList = [];
      this.getList();
    },

    chooseRange() {
      this.showPicker = true;
      this.$forceUpdate();
    },
    onSelectedTime(val) {
      this.showPicker = false;
      if(val) {
        this.timerange = val;
        this.timeTexts = [moment(val.value[0]).format('YYYY-MM-DD 00:00:00'), moment(val.value[1]).format('YYYY-MM-DD 23:59:59')];
        this.timeFilterTexts = [moment(val.value[0]).format('YYYY-MM-DD 00:00'), moment(val.value[1]).format('YYYY-MM-DD 23:59')];


        this.currentPage = 1;
        this.pageTotal = 1;
        this.dataList = [];
        this.getList();
      }
    }

    
  }
}
</script>

<style lang="scss" scoped>
  @import 'balance-list.scss';
</style>