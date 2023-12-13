<template>
  <view class="flex-page">
    <!-- 时间筛选 -->
    <view class="time-filter-bar">
      <view class="time-filter-trigger" @tap="chooseRange">
        <view class="time-filter-val" :class="{'time-filter-placeholder': timeFilterTexts.length != 2}">{{timeFilterTexts.length == 2 ? (timeFilterTexts[0] + ' ~ ' + timeFilterTexts[1]) : '开始时间~结束时间'}}</view>
        <image class="time-filter-icon" src="/static/images/date_black.png"></image>
      </view>
    </view>
    <view class="flex-page-content">
      <scroll-view scroll-y class="page-scroll" @scrolltolower="getList">
        <view class="incomes-list">
          <view v-for="(item, index) in dataList" class="income" :key="index">
            <view class="income-content">
              <view class="income-info">
                <view class="income-desc">{{changeTypeTexts[item.change_type]}}</view>
                <view class="income-val">{{item.price}}</view>
              </view>
              <view class="income-info">
                <view class="income-create-time">{{item.create_time}}</view>
                <view class="income-status"></view>
              </view>
            </view>
            
          </view>
        </view>

      <view v-if="dataList.length > 0 && currentPage > pageTotal && !listLoading" class="scroll-tips">已经到底啦</view>
      <view v-if="dataList.length == 0 && currentPage > pageTotal && !listLoading" class="scroll-tips">暂无记录哦</view>

    </scroll-view>

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
      currentPage: 1,
      pageTotal: 1,
      listLoading: false,

      timerange: [],
      timeTexts: [],
      timeFilterTexts: [],
      showPicker: false,

      dataList: [],
      changeTypeTexts: {
        [1]: '成团奖励',
        [2]: '转出成余额'
      },
    }
  },
  onLoad(options) {
    this.getList();
  },
  methods: {
    
    getList() {
      if(this.currentPage > this.pageTotal) return;
      let params = {
        uid: uni.getStorageSync('userInfo').uid,
        type: 2,  //1收益2支出
        page: this.currentPage
      }
      if(this.timeTexts.length == 2) {
        params.start_time = this.timeTexts[0];
        params.end_time = this.timeTexts[1];
      }
      this.listLoading = true;
      this.$get('/ppyl/balance', params, res => {
        this.listLoading = false;
        this.currentPage += 1;
        if(res.data.length == 0) return;
        let dataList = res.data.list;
        
        this.dataList.push(...dataList);
        this.pageTotal = res.data.pageTotal;
      }, err => {
        this.listLoading = false;
      })
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
@import './transform-records.scss';
</style>