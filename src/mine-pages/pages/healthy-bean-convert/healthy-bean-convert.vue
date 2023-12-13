<template>
  <view class="flex-page">
    <view class="time-filter-bar">
      <view class="time-filter-trigger" @tap="chooseRange">
        <image class="time-filter-icon" src="/static/images/date_black.png"></image>
        <view class="time-filter-val" :class="{'time-filter-placeholder': timeFilterTexts.length != 2}">{{timeFilterTexts.length == 2 ? (timeFilterTexts[0] + ' ~ ' + timeFilterTexts[1]) : '开始时间~结束时间'}}</view>
        <image class="time-filter-search" src="/static/images/icon_search.png"></image>
      </view>
    </view>
    <view class="flex-page-content">

      <view class="list-box">
        <scroll-view scroll-y class="tab-page-scroll" @scrolltolower="getList">
          <view class="data-list">
            <view v-for="(item, index) in dataList" class="data-item" :key="index">
              <view class="data-header data-row">
                <view :class="['data-name', item.conver_status === 1 ? 'success' : item.conver_status === -1 ? 'error' : '']">{{converStatus[item.conver_status] || '未知类型'}}</view>
                <view class="data-val">{{item.balance}}</view>
              </view>
              <view class="data-row">
                <view class="data-info">转出手机: {{ item.transfer_from_user_phone || '-' }}</view>
                <view class="data-info ellipsis-1">转出用户: {{ item.transfer_from_name || '-' }}</view>
              </view>
              <view class="data-row">
                <view class="data-info">转入手机: {{ item.transfer_for_user_phone || '-' }}</view>
                <view class="data-info ellipsis-1">转入用户: {{ item.transfer_for_name || '-' }}</view>
              </view>
              <view class="data-row">
                <view class="data-info">转出时间: {{item.create_time}}</view>
              </view>
              <view class="data-row">
                <view class="data-info ellipsis-3">描述: {{item.remark}}</view>
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
import moment from "moment";
import mxDatetimePicker from '@/components/mx-datetimepicker/mx-datetimepicker.vue';
export default {
  components: {
    mxDatetimePicker
  },
  data() {
    return {
      timerange: [],
      timeTexts: [],
      timeFilterTexts: [],
      showPicker: false,

      currentPage: 1,
      pageTotal: 1,
      listLoading: false,
      dataList: [],

      converStatus: {
        [-1]: '失败',
        [1]: '成功'
      }
    }
  },
  onShareAppMessage() {
    let shareInfo = this.$getShareInfo();
    return shareInfo;
  },
  onLoad(options) {
    this.getList()
  },
  methods: {
    getList() {
      if(this.currentPage > this.pageTotal) return;
      let params = {
        uid: uni.getStorageSync('userInfo').uid,
        page: this.currentPage
      }
      if (this.timeTexts && this.timeTexts.length === 2) {
        params.start_time = moment(this.timeTexts[0]).format('YYYY-MM-DD 00:00:00')
        params.end_time = moment(this.timeTexts[1]).format('YYYY-MM-DD 23:59:59');
      }
      this.listLoading = true;
      this.$get('/healthy/converList', params, res => {
        this.listLoading = false;
        this.currentPage += 1;
        if(!res.data || res.data.length == 0) return;
        let dataList = res.data.list;
        for(let i = 0; i < dataList.length; i++) {
          dataList[i].create_time = moment(dataList[i].create_time).format('YYYY-MM-DD HH:mm:ss')
        }

        this.dataList.push(...dataList);
        this.pageTotal = res.data.pageTotal;
      }, err => {
        this.listLoading = false;
      })
    },chooseRange() {
      this.showPicker = true;
      this.$forceUpdate();
    },
    onSelectedTime(val) {
      this.showPicker = false;
      if(val) {
        this.timerange = val.value;
        this.timeTexts = [moment(val.value[0]).format('YYYY-MM-DD 00:00:00'), moment(val.value[1]).format('YYYY-MM-DD 23:59:59')];
        this.timeFilterTexts = [moment(val.value[0]).format('YYYY.MM.DD'), moment(val.value[1]).format('YYYY.MM.DD')];
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
@import 'healthy-bean-convert';
</style>