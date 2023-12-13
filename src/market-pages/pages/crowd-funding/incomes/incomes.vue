<template>
  <view class="flex-page">
    <view class="page-infos">
      <view class="income-total-box">
        <image class="income-total-bg" src="/static/images/ppyl/cvip_card_decorate.png"></image>
        <view class="income-total">
          <view class="income-total-content">
            <view class="income-total-info">
              <view class="income-total-val">
                {{ incomes.userBalance || 0 }}
              </view>
              <view class="income-total-title">
                收益余额 元
              </view>
            </view>
          </view>
          <view class="income-total-types">
            <view class="income-total-type">
              <view class="income-total-type-val">{{ incomes.todayIncome || 0 }}</view>
              <view class="income-total-type-title">今日收益</view>
            </view>
            <view class="income-total-type">
              <view class="income-total-type-val">{{ incomes.yesterdayIncome || 0 }}</view>
              <view class="income-total-type-title">昨日收益</view>
            </view>
            <view class="income-total-type">
              <view class="income-total-type-val">{{ incomes.allIncome || 0 }}</view>
              <view class="income-total-type-title">累计收益</view>
            </view>
          </view>

          <view v-if="incomes.userFuseBalance" class="income-total-extend">
            <view class="income-total-type-val">{{ incomes.userFuseBalance || 0 }}</view>
            <view class="income-total-type-title">待释放{{ crowdBalanceName || '集品券' }}</view>
          </view>

        </view>

        <view class="exchange-ctrl" @tap="showBalanceCtrls">回收</view>
      </view>

      <view class="order-tabs">
        <view class="order-tabs-wrapper">
          <view v-for="(item, index) in changeTypeArr" class="order-tab" :class="{ 'active': tabIndex == index }"
            @tap="updateTab(index)" :key="index">{{ item.text }}</view>
        </view>
      </view>

      <view class="income-filter-times" @tap="chooseRange">
        <view class="income-filter-val">{{ timeFilterTexts[0] }}</view>
        <view class="income-filter-concat">至</view>
        <view class="income-filter-val">{{ timeFilterTexts[1] }}</view>
        <image class="income-filter-icon" src="/static/images/date_black.png"></image>
      </view>
    </view>



    <view class="flex-page-content">
      <scroll-view scroll-y class="tab-page-scroll" @scrolltolower="getList">
        <view class="data-list">
          <view v-for="(item, index) in dataList" class="data-item" :key="index">
            <view class="data-row">
              <view class="data-row-title">
                <view v-if="item.change_type != 4" class="data-name">{{ changeTypeTexts[item.change_type] }}</view>
                <view v-else class="data-name">{{ item.is_grateful == 1 ? '感恩奖' : '福利补贴' }}</view>
                <view v-if="item.delay_reward_status && item.delay_reward_status != -1 && item.delay_reward_status != -2"
                  class="data-row-title-sub">
                  福利预售[{{ delayRewardStatusTexts[item.delay_reward_status] }}]</view>
              </view>
              <view class="data-val">{{ item.price }}</view>
            </view>
            <view v-if="item.crowd_code && item.activity_name && item.crowd_round_number && item.crowd_period_number"
              class="data-row">
              <view class="data-info">{{ item.activity_name }}{{ item.crowd_round_number }}轮{{ item.crowd_period_number
                              }}期
              </view>
            </view>
            <view v-if="item.change_type == 7" class="data-row">
              <view class="data-info">转赠给 {{ item.transfer_for_user_name }}（{{ item.transfer_for_user_phone }}）</view>
            </view>
            <view class="data-row">
              <view class="data-info">{{ item.create_time }}</view>
            </view>
            <view
              v-if="item.delay_reward_status && item.delay_reward_status != -1 && item.delay_reward_status != -2 && item.delay_reward_status != 2 && item.delay_arrival_time"
              class="data-row">
              <view class="data-info">{{ item.delay_reward_status == 1 ? '奖励发放时间: ' : '预计发放时间: ' }}</view>
            </view>
            <view class="data-row">
              <view class="data-info">{{ item.delay_arrival_time }}</view>
            </view>
          </view>

        </view>

        <view v-if="dataList.length > 0 && currentPage > pageTotal && !dataLoading" class="scroll-tips">已经到底啦</view>
        <view v-if="dataList.length == 0 && currentPage > pageTotal && !dataLoading" class="scroll-tips">暂无相关记录</view>


      </scroll-view>
    </view>

    <mx-datetime-picker :show="showPicker" type="range" :value="timerange" :show-tips="true" :begin-text="'开始'"
      :end-text="'结束'" :show-seconds="true" @confirm="onSelectedTime" @cancel="onSelectedTime" />
  </view>
</template>
<script>
import config from '@/config';
import mxDatetimePicker from '@/components/mx-datetimepicker/mx-datetimepicker.vue';
import moment from 'moment';
export default {
  components: {
    mxDatetimePicker
  },
  data() {
    return {
      currentPage: 1,
      pageTotal: 1,

      timerange: [],
      timeTexts: [],
      timeFilterTexts: [],
      showPicker: false,
      tabIndex: 0,

      changeTypeArr: [{
        id: 1,
        text: '全部'
      }, {
        id: 2,
        text: '收入记录',
        change_type: [3, 4]
      }, {
        id: 3,
        text: '使用记录',
        change_type: [2]
      }, {
        id: 4,
        text: '转出记录',
        change_type: [5, 6]
      }, {
        id: 5,
        text: '释放明细',
        change_type: [11]
      }, {
        id: 6,
        text: '预购记录',
        change_type: [1]
      },],
      changeTypeTexts: {
        [1]: '预购',
        [2]: '消费',
        [3]: '福利补贴',  //退回本金
        [4]: '奖励',  //奖金
        [5]: '转商城余额',
        [6]: '回收',
        [7]: '转赠他人',
        [8]: '转换到其他钱包',
        [9]: '收到他人转赠',
        [10]: '中奖',
        [11]: '特大福利分期返还',
        [12]: '后台转账',
        [13]: '售后退款'
      },
      // 预售订单状态
      delayRewardStatusTexts: {
        [1]: '已发放',
        [2]: '发放失败',
        [3]: '待发放',
        [-1]: '非预售订单',
        [-2]: '非预售订单',
      },
      crowdBalanceName: config.written.crowdBalanceName, // 集品券
      dataList: [],
      dataLoading: false,

      incomes: {},
      records: []

    }
  },
  onLoad() {
    // 默认选择本日的数据
    let today = moment(new Date()).format('YYYY-MM-DD');
    this.timeTexts = [moment(today).subtract(7, 'days').format('YYYY-MM-DD 00:00:00'), moment(today).format('YYYY-MM-DD 23:59:59')];
    this.timeFilterTexts = [moment(this.timeTexts[0]).format('YYYY.MM.DD'), moment(this.timeTexts[1]).format('YYYY.MM.DD')];

    this.getData();
  },
  onShow() {
    this.reGetList();
  },
  methods: {
    getData() {
      let params = {
        uid: uni.getStorageSync('userInfo').uid
      }
      this.$get('/crowdFunding/income', params, res => {
        let incomes = res.data;
        this.incomes = incomes;
      })
    },
    getList() {
      if(this.currentPage > this.pageTotal) return;
      let params = {
        uid: uni.getStorageSync('userInfo').uid,
        page: this.currentPage,
      }
      if(this.changeTypeArr[this.tabIndex].change_type) params.change_type = this.changeTypeArr[this.tabIndex].change_type;
      this.dataLoading = true;
      this.$post('/crowdFunding/balance', params, res => {
        this.dataLoading = false;
        this.currentPage += 1;

        if(!res.data.list || res.data.list.length == 0) return;
        let dataList = res.data.list;
        this.dataList.push(...dataList);
        this.pageTotal = res.data.pageTotal;
      })
    },
    reGetList() {
      this.currentPage = 1;
      this.pageTotal = 1;
      this.dataList = [];
      this.getList();
    },

    getFilterData() {
      let params = {
        uid: uni.getStorageSync('userInfo').uid
      }
      if(this.timeTexts && this.timeTexts.length == 2) {
        params.start_time = moment(this.timeTexts[0]).format('YYYY-MM-DD 00:00:00');
        params.end_time = moment(this.timeTexts[1]).format('YYYY-MM-DD 23:59:59');
      }
      this.$get('/ppyl/rewardSummaryGroup', params, res => {
        let records = res.data || [];
        if(records.length == 0) return;
        this.records = records;
      })
    },

    updateTab(index) {
      if(this.tabIndex == index) return;
      this.tabIndex = index;
      this.reGetList();
    },

    chooseRange() {
      this.showPicker = true;
      this.$forceUpdate();
    },
    onSelectedTime(val) {
      this.showPicker = false;
      if(val) {
        console.log(val);
        this.timerange = val;
        this.timeTexts = [moment(val.value[0]).format('YYYY-MM-DD 00:00:00'), moment(val.value[1]).format('YYYY-MM-DD 23:59:59')];
        this.timeFilterTexts = [moment(val.value[0]).format('YYYY.MM.DD'), moment(val.value[1]).format('YYYY.MM.DD')];
        this.tabIndex = 3;  //筛选时间
        this.getFilterData();
      }
    },

    showBalanceCtrls() {
      uni.navigateTo({
        url: '/market-pages/pages/crowd-funding/withdraw/withdraw'
      })
      // uni.showActionSheet({
      //   alertText: '请选择操作类型',
      //   itemList: [
      //     '预购',
      //     '回收',
      //     '转商城'
      //   ],
      //   itemColor: '#5e5e5e',
      //   success: res => {
      //     let index = res.tapIndex + 1;
      //     console.log(res);
      //     if(index == 0) {
      //       uni.navigateTo({
      //         url: '/market-pages/pages/crowd-funding/charge/charge'
      //       })
      //     } else if(index == 1) {
      //       uni.navigateTo({
      //         url: '/market-pages/pages/crowd-funding/withdraw/withdraw'
      //       })
      //     } else {
      //       this.undo();
      //     }
      //   }
      // })
    },

    goToIncomeList(type = 0) {
      uni.navigateTo({
        url: `/market-pages/pages/ppyl/income-list/income-list?type=${type}`
      })
    },
    goToRefundableOrders() {
      uni.navigateTo({
        url: '/market-pages/pages/ppyl/refundable-orders/refundable-orders'
      })
    },


    undo() {
      uni.showToast({
        title: '即将开放敬请期待',
        icon: 'none',
        mask: true
      })
    },
  }
}
</script>
<style lang="scss" scoped>
@import './incomes.scss';
</style>