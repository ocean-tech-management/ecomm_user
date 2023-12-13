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
        已到账
      </view>
      <view :class="'tab ' + (tabIndex == 2 ? 'active' : '')" data-id="2" @tap="updateTabIndex">
        冻结中
      </view>
      <view :class="'tab ' + (tabIndex == 3 ? 'active' : '')" data-id="3" @tap="updateTabIndex">
        已失效
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
                  <view class="income-desc" :class="{'warning-color': item.arrival_status == 2, 'error-color': item.arrival_status == 3}">
                    <block v-if="item.type != 3">{{item.type == 1 ? divideTypeText[item.divide_type] : typeText[item.type]}} {{item.order_user_name ? ('-来自' + item.order_user_name) : ''}}</block>
                    <block v-else>{{item.remark}} {{item.order_user_name ? ('-来自' + item.order_user_name) : ''}}</block>
                  </view>
                  <view class="income-create-time">{{item.create_time}}</view>
                  
                </view>
                <view>
                  <view class="income-status">{{statusText[item.arrival_status]}}</view>
                </view>
              </view>
              <view class="income-info-extend">
                <view v-if="item.order_sn" class="income-desc-item">
                  <view class="income-desc-orderid">{{item.order_sn}}</view>
                  <view v-if="item.order_sn" >分润奖金：￥<text class="income-val">{{item.real_divide_price || 0}}</text></view>
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
      statusText: {
        [1]: '已到账',
        [2]: '冻结中',
        [3]: '退款取消分润',
        [-1]: '整单被删除'
      },
      typeText: {
        [1]: '普通分销',
        [2]: '广宣奖',
        [3]: '感恩奖',
        [4]: '转售订单奖励'
      },
      divideTypeText: {
        [1]: '销售佣金',
        [2]: '教育奖金'
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
      if(this.tabIndex != 0) params.status = this.tabIndex;
      if(this.timeTexts.length == 2) {
        params.start_time = this.timeTexts[0];
        params.end_time = this.timeTexts[1];
      }
      this.listLoading = true;
      this.$get('/user/divide', params, res => {
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
  @import 'income-list.scss';
</style>