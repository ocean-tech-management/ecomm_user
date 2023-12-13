<template>
  <view class="flex-page">
    <view class="page-infos">
      <view class="income-total-box">
        <image class="income-total-bg" src="/static/images/ppyl/cvip_card_decorate.png"></image>
        <view class="income-total">
          <view class="income-total-content">
            <view class="income-total-info">
              <view class="income-total-val">
                {{ incomes.balance || 0 }}
              </view>
              <view class="income-total-title">
                余额
              </view>
            </view>
          </view>
        </view>
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
              <view class="data-name">{{ changeTypeTexts[enterType][item.change_type] || '未知类型' }}</view>
              <view class="data-val">{{ item.price }}</view>
            </view>
            <view v-if="item.crowd_code && item.activity_name && item.crowd_round_number && item.crowd_period_number"
              class="data-row">
              <view class="data-info">{{ item.activity_name }}{{ item.crowd_round_number }}轮{{ item.crowd_period_number
              }}期
              </view>
            </view>
            <view class="data-row">
              <view class="data-info">{{ item.create_time }}</view>
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
      enterType: 1, // 进入页面类型 1-集品豆  2-礼品券
      navigationBarTitle: {
        [1]: '集品豆明细',
        [2]: '礼品券明细'
      },
      dataUrlList: {
        [1]: '/user/integral', // 集品豆
        [2]: '/user/ticket', // 礼品券
      },
      incomeUrlList: {
        [1]: '/user/integralIncome', // 集品豆
        [2]: '/user/ticketIncome' // 礼品券
      },

      // change_type传参 [集品豆/礼品券][tabIndex][change_type]
      changeTypeList: {
        [1]: {
          [1]: 5,
          [2]: 3
        },
        [2]: {
          [1]: 1,
          [2]: 3
        }
      },

      currentPage: 1,
      pageTotal: 1,
      // 日期选择
      timerange: [],
      timeTexts: [],
      timeFilterTexts: [],
      showPicker: false,
      // tabs
      tabIndex: 0,
      changeTypeArr: [
        { id: 1, text: '全部' },
        { id: 2, text: '收入记录', change_type: true },
        { id: 3, text: '使用记录', change_type: true }
      ],
      // 明细类型 [集品豆/礼品券][change_type]
      changeTypeTexts: {
        [1]: {
          [1]: '签到',
          [2]: '订单分润',
          [3]: '消费',
          [4]: '团队奖励',
          [5]: '福利奖励',
          [6]: '商城购物赠送',
          [7]: '后台充值集品券赠送',
          [8]: '后台系统操作',
        },
        [2]: {
          [1]: '回收分账',
          [2]: '订单分润',
          [3]: '消费',
          [4]: '团队奖励',
          [5]: '福利奖励',
          [6]: '商城购物赠送'
        }
      },
      crowdBalanceName: config.written.crowdBalanceName, // 集品券
      dataList: [],
      dataLoading: false,

      incomes: {
        balance: 0
      },
      records: []

    }
  },
  onLoad(options) {
    if (options.type) {
      this.enterType = options.type;
      uni.setNavigationBarTitle({
        title: this.navigationBarTitle[options.type] || '活动页面'
      })
    };
    // 默认选择本日的数据
    let today = moment(new Date()).format('YYYY-MM-DD');
    this.timeTexts = [moment(today).subtract(7, 'days').format('YYYY-MM-DD 00:00:00'), moment(today).format('YYYY-MM-DD 23:59:59')];
    this.timeFilterTexts = [moment(this.timeTexts[0]).format('YYYY.MM.DD'), moment(this.timeTexts[1]).format('YYYY.MM.DD')];
    this.getIncome()
  },
  onShow() {
    this.reGetList();
  },
  methods: {
    // 获取余额
    getIncome() {
      let params = {
        uid: uni.getStorageSync('userInfo').uid
      };
      this.$get((this.incomeUrlList[this.enterType] || this.incomeUrlList[1]), params, res => {
        const { balance } = res.data
        if (balance != 'null' && balance != 'undefined') this.incomes.balance = balance
      })
    },
    getList() {
      if(this.currentPage > this.pageTotal) return;
      let params = {
        uid: uni.getStorageSync('userInfo').uid,
        page: this.currentPage,
      };
      this.dataLoading = true;
      if(this.changeTypeArr[this.tabIndex].change_type && this.changeTypeList[this.enterType]) params.change_type = this.changeTypeList[this.enterType][this.tabIndex];
      this.$get((this.dataUrlList[this.enterType] || this.dataUrlList[1]), params, res => {
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
    // 选择tabs
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
@import './voucher-record.scss';
</style>