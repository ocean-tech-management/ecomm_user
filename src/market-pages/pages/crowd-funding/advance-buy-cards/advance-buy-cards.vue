<template>
  <view class="flex-page">

    <!-- <view class="time-filter-bar">
      <view class="time-filter-trigger" @tap="chooseRange">
        <image class="time-filter-icon" src="/static/images/date_black.png"></image>
        <view class="time-filter-val" :class="{'time-filter-placeholder': timeFilterTexts.length != 2}">{{timeFilterTexts.length == 2 ? (timeFilterTexts[0] + ' ~ ' + timeFilterTexts[1]) : '开始时间~结束时间'}}</view>
        <image class="time-filter-search" src="/static/images/icon_search.png"></image>
      </view>
    </view>

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
    </view> -->

    <!-- 页面内容 -->
    <view class="flex-page-content">

      <view class="list-box">
        <scroll-view scroll-y class="tab-page-scroll" @scrolltolower="getList">
          <view class="incomes-list">
            <view v-for="(item, index) in dataList" class="income" :key="index">
              <view class="income-content">
                <view class="income-info">
                  <view class="data-row">
                    <view class="income-desc" :class="{ 'error-color': item.type == 1 }">
                      {{ typeText[item.type] }}
                    </view>
                    <view class="data-val">{{ item.number }}</view>
                  </view>
                  <view class="income-change-type">{{ changeTypeText[item.change_type] }}</view>
                  <view v-if="item.order_sn" class="income-order-sn">关联订单：{{ item.order_sn }}</view>
                  <view class="income-create-time">{{ item.create_time }}</view>

                </view>
              </view>

            </view>
          </view>

          <view v-if="dataList.length > 0 && currentPage > pageTotal && !listLoading" class="scroll-tips">已经到底啦</view>
          <view v-if="dataList.length == 0 && currentPage > pageTotal && !listLoading" class="scroll-tips">暂无记录哦</view>

        </scroll-view>
      </view>
    </view>
    <mx-datetime-picker :show="showPicker" type="range" :value="timerange" :show-tips="true" :begin-text="'开始'"
      :end-text="'结束'" :show-seconds="true" @confirm="onSelectedTime" @cancel="onSelectedTime" />

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
        [1]: '获得',
        [2]: '使用'
      },
      changeTypeText: {
        [1]: '商城订单购物赠送',
        [2]: '领取失败赠送',
        [3]: '特大福利赠送',
        [4]: '新人赠送',
        [5]: `使用${config.written.advanceBuyCardName}`,
        [6]: '系统赠送'
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
      this.$get('/crowdFunding/advanceCardDetail', params, res => {
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
@import 'advance-buy-cards.scss';
</style>