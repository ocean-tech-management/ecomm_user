<template>
  <view class="flex-page">
    <view class="flex-page-content">

      <view class="income-total-box">
        <image class="income-total-bg" src="/market-pages/static/images/ppyl/income_bg.png"></image>
        <view class="income-total">
          <view class="income-total-content">
            <view class="income-total-info">
              <view class="income-total-title">
                收益余额 元
              </view>
              <view class="income-total-val">
                {{incomes.balance || 0}}
              </view>
            </view>
          </view>
          <view class="income-total-types">
            <view class="income-total-type">
              <view class="income-total-type-title">累计收益</view>
              <view class="income-total-type-val">{{incomes.allInCome || 0}}</view>
            </view>
            <view class="income-total-type">
              <view class="income-total-type-title">已到账</view>
              <view class="income-total-type-val">{{incomes.arrivalInCome || 0}}</view>
            </view>
            <view class="income-total-type">
              <view class="income-total-type-title">待到账</view>
              <view class="income-total-type-val">{{incomes.frozenInCome || 0}}</view>
            </view>
          </view>
        </view>
      </view>

      <view class="income-tabs">
        <view class="income-tab" :class="{'active': tabIndex == 0}" data-id="0" @tap="updateTabIndex">
          今日
        </view>
        <view class="income-tab" :class="{'active': tabIndex == 1}" data-id="1" @tap="updateTabIndex">
          本月
        </view>
        <view class="income-tab" :class="{'active': tabIndex == 2}" data-id="2" @tap="updateTabIndex">
          本年
        </view>
        <view class="income-tab-range" @tap="chooseRange">
          <image class="income-tab-icon" src="/static/images/date_black.png"></image>
          <!-- <view>{{tabIndex == 3 ? '已选择' : '选择日期段'}}</view> -->
        </view>
      </view>
      <view v-if="tabIndex == 3" class="income-filter-times">
        <view class="income-filter-bg">
          <view class="income-filter">{{timeFilterTexts[0]}} ~ {{timeFilterTexts[1]}}</view>
        </view>
      </view>

      <view class="payment" @tap="goToRefundableOrders">
        <view class="payment-title">我的本金</view>
        <view class="payment-val">{{incomes.purchase_price || '0.00'}}</view>
        <view class="payment-ctrl">退回本金 ></view>
      </view>
        
      <view v-for="(item, index) in records" class="team-incomes" :key="index" @tap="goToIncomeList(item.type)">
        <view class="team-income-top">
          <view class="team-income-title">{{typeTexts[item.type]}}</view>
        </view>
        <view class="team-income-list">
          <view class="team-income-item">
            <view class="team-income-price">
              <view class="team-income-price-val">{{item.price || 0}}</view>
            </view>
            <view class="team-income-label">
              <view>总收益</view>
            </view>
          </view>
          <view class="team-income-item">
            <view class="team-income-price">
              <view class="team-income-price-val">{{item.number || 0}}</view>
            </view>
            <view class="team-income-label">
              <view>交易笔数</view>
            </view>
          </view>
          <image class="team-income-arrow" src="/static/images/more.png"></image>
        </view>
      </view>
      
      <view class="income-enters">
        <view class="income-enter">
          <view class="kv-item" @tap="goToIncomeList(0)">
            <view class="kv-key">交易明细</view>
            <view class="kv-val"></view>
            <image class="kv-arrow" src="/static/images/more.png"></image>
          </view>
        </view>
      </view>

    </view>


    <mx-datetime-picker :show="showPicker" type="range" :value="timerange" :show-tips="true" :begin-text="'开始'" :end-text="'结束'" :show-seconds="true" @confirm="onSelectedTime" @cancel="onSelectedTime" />
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

      timerange: [],
      timeTexts: [],
      timeFilterTexts: [],
      showPicker: false,
      tabIndex: 0,
      
      typeTexts: {
        [1]: '个人收益',
        [2]: '分享收益'
      },

      incomes: {},
      records: []

    }
  },
  onLoad() {
    
    // 默认选择本日的数据
    let today = moment(new Date()).format('YYYY-MM-DD');
    this.timeTexts = [moment(today).format('YYYY-MM-DD 00:00:00'), moment(new Date()).format('YYYY-MM-DD 23:59:59')]

    this.getFilterData();
  },
  onShow() {
    this.getData();
  },
  methods: {
    getData() {
      let params = {
        uid: uni.getStorageSync('userInfo').uid
      }
      this.$get('/ppyl/allInCome', params, res => {
        let incomes = res.data;
        this.incomes = incomes;
      })
    },
    getFilterData() {
      this.listLoading = true;
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
    
    updateTabIndex(e) {
      let id = e.currentTarget.dataset.id;
      this.tabIndex = id;

      // 处理时间
      if(this.tabIndex == 0) {
        // 今天
        let today = moment(new Date()).format('YYYY-MM-DD');
        this.timeTexts = [moment(today).format('YYYY-MM-DD 00:00:00'), moment(new Date()).format('YYYY-MM-DD 23:59:59')]
      } else if(this.tabIndex == 1) {
        // 本月
        let month = moment(new Date()).format('YYYY-MM') + '-01';
        this.timeTexts = [moment(month).format('YYYY-MM-DD 00:00:00'), moment(new Date()).format('YYYY-MM-DD 23:59:59')]
      } else if(this.tabIndex == 2) {
        // 今年
        let year = moment(new Date()).format('YYYY') + '-01-01';
        this.timeTexts = [moment(year).format('YYYY-MM-DD 00:00:00'), moment(new Date()).format('YYYY-MM-DD 23:59:59')]
      }

      this.getFilterData();
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

    goToIncomeList(type = 0) {
      uni.navigateTo({
        url: `/market-pages/pages/ppyl/income-list/income-list?type=${type}`
      })
    },
    goToRefundableOrders() {
      uni.navigateTo({
        url: '/market-pages/pages/ppyl/refundable-orders/refundable-orders'
      })
    }
  }
}
</script>
<style lang="scss" scoped>
@import './incomes.scss';
</style>