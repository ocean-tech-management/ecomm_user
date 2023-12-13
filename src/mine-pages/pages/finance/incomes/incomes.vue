<template>
  <view >
    <view class="total-wrapper">
      <view class="total-content">
        <view class="total-box">
          <view class="total">
            <view class="total-val">{{balance.total_balance || '0.00'}}</view>
            <view class="total-title">可用余额 元</view>
          </view>
          <view class="withdraw-btn" @tap="goToWithdraw">回收</view>

        </view>
        <view class="income-other-totals">
          <view class="income-other-total">
            <view class="income-other-total-val">{{balance.divide_inCome_total || '0.00'}}</view>
            <view class="income-other-total-title">
              <view>累计总收益 元</view>
            </view>
          </view>
          <view class="income-other-total">
            <view class="income-other-total-val">{{balance.withdraw_total || '0.00'}}</view>
            <view class="income-other-total-title">
              <view>累计总回收 元</view>
            </view>
          </view>
          <view class="income-other-total" @tap="updateTipsVal('freeze')">
            <view class="income-other-total-val">{{balance.divide_fronzen_total || '0.00'}}</view>
            <view class="income-other-total-title">
              <view>未结算 元</view>
              <image class="income-info-help" src="/static/images/help.png" mode="widthFix"></image>
            </view>
            <view v-if="showTips == 'freeze'" class="income-info-tips-up">
              <view class="income-info-tips">未确认收货订单收益</view>
              <view class="tips-arrow-up"></view>
            </view>
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
        <image class="income-tab-icon" src="/static/images/date.png"></image>
        <!-- <view>{{tabIndex == 3 ? '已选择' : '选择日期段'}}</view> -->
      </view>
    </view>
    <view v-if="tabIndex == 3" class="income-filter-times">
      <view class="income-filter-bg">
        <view class="income-filter">{{timeFilterTexts[0]}} ~ {{timeFilterTexts[1]}}</view>
      </view>
    </view>

    <view class="team-incomes">
      <view class="team-income-top">
        <view class="team-income-title">销售利润</view>
        <view class="team-income-estimate">{{filterBalance.direct.will_income_total}}</view>
      </view>
      <view class="team-income-list">
        <view class="team-income-item" @tap="updateTipsVal('selfProfit')">
          <view class="team-income-price">
            <view class="team-income-price-val">{{filterBalance.direct.order_price}}</view>
          </view>
          <view class="team-income-label">
            <view>个人营业总额</view>
            <image class="team-income-help" src="/static/images/help.png" mode="widthFix"></image>
          </view>
          
          
          <view v-if="showTips == 'selfProfit'" class="income-info-tips-down">
            <view class="tips-arrow-down"></view>
            <view class="income-info-tips">自购实付总额+直接销售实付总额</view>
          </view>
        </view>
        <view class="team-income-item" @tap="updateTipsVal('selfTeamProfit')">
          <view class="team-income-price">
            <view class="team-income-price-val">{{filterBalance.direct.purchase_price}}</view>
          </view>
          <view class="team-income-label">
            <view>个人进货总额</view>
            <image class="team-income-help" src="/static/images/help.png" mode="widthFix"></image>
          </view>
          
          <view v-if="showTips == 'selfTeamProfit'" class="income-info-tips-down">
            <view class="tips-arrow-down"></view>
            <view class="income-info-tips">自购实付总额+直接销售进货总额</view>
          </view>
        </view>
        <view class="team-income-item team-income-item-sm">
          <view class="team-income-price">
            <view class="team-income-val">{{filterBalance.direct.pay_order_number}}</view>
          </view>
          <view class="team-income-label">订单数量</view>
        </view>
      </view>
    </view>
    <view v-if="filterBalance.indirect" class="team-incomes">
      <view class="team-income-top">
        <view class="team-income-title">教育奖金</view>
        <view class="team-income-estimate">{{filterBalance.indirect.will_income_total}}</view>
      </view>
      <view class="team-income-list">
        <view class="team-income-item">
          <view class="team-income-price">
            <view class="team-income-price-val">{{filterBalance.indirect.purchase_price}}</view>
          </view>
          <view class="team-income-label">进货总额</view>
        </view>
        <view class="team-income-item team-income-sm">
          <view class="team-income-price">
            <view class="team-income-val">{{filterBalance.indirect.pay_order_number}}</view>
          </view>
          <view class="team-income-label">订单数量</view>
        </view>
      </view>
    </view>
    <view v-if="filterBalance.grateful" class="team-incomes">
      <view class="team-income-top">
        <view class="team-income-title">感恩奖</view>
        <view class="team-income-estimate">{{filterBalance.grateful.will_income_total}}</view>
      </view>
      <view class="team-income-list">
        <view class="team-income-item">
          <view class="team-income-price">
            <view class="team-income-price-val">{{filterBalance.grateful.purchase_price}}</view>
          </view>
          <view class="team-income-label">进货总额</view>
        </view>
        <view class="team-income-item team-income-sm">
          <view class="team-income-price">
            <view class="team-income-val">{{filterBalance.grateful.pay_order_number}}</view>
          </view>
          <view class="team-income-label">订单数量</view>
        </view>
      </view>
    </view>
    
    <view class="income-enters">
      <view class="income-enter">
        <view class="kv-item" @tap="goToIncomeList">
          <view class="kv-key">收益明细</view>
          <view class="kv-val"></view>
          <image class="kv-arrow" src="/static/images/more.png"></image>
        </view>
      </view>
      <view class="income-enter">
        <view class="kv-item" @tap="goToBalanceList">
          <view class="kv-key">余额明细</view>
          <view class="kv-val"></view>
          <image class="kv-arrow" src="/static/images/more.png"></image>
        </view>
      </view>
      <view class="income-enter">
        <view class="kv-item" @tap="goToWithdraws">
          <view class="kv-key">回收记录</view>
          <view class="kv-val"></view>
          <image class="kv-arrow" src="/static/images/more.png"></image>
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
      userInfo: uni.getStorageSync('userInfo'),
      tabIndex: 0,


      timerange: [],
      timeTexts: [],
      timeFilterTexts: [],
      showPicker: false,

      balance: {},
      filterBalance: {
        all: {},
        direct: {}
      },

      showTips: '', //freeze冻结，selfProfit营业总额，selfTeamProfit进货总额
      
    }
  },
  onShareAppMessage() {
    let shareInfo = this.$getShareInfo();
    return shareInfo;
  },
  onLoad(options) {
    this.getData();

    // 默认选择本日的数据
    let today = moment(new Date()).format('YYYY-MM-DD');
    this.timeTexts = [moment(today).format('YYYY-MM-DD 00:00:00'), moment(new Date()).format('YYYY-MM-DD 23:59:59')]

    this.getFilterData();
  },
  methods: {
    getData() {
      let params = {
        uid: uni.getStorageSync('userInfo').uid
      }
      this.$get('/team/balanceAll', params, res => {
        this.balance = res.data;
      })
    },
    getFilterData() {
      let params = {
        uid: uni.getStorageSync('userInfo').uid,
        start_time: this.timeTexts[0],
        end_time: this.timeTexts[1]
      }
      this.$get('/team/willIncome', params, res => {
        this.filterBalance = res.data;
      })
    },
    updateTabIndex(e) {
      let id = e.currentTarget.dataset.id;
      this.tabIndex = id;
      // 处理时间
      if(this.tabIndex == 0) {
        // 今天
        let today = moment(new Date()).format('YYYY-MM-DD');
        this.timeTexts = [moment(today).format('YYYY-MM-DD 00:00:00'), moment(new Date()).format('YYYY-MM-DD 23:59:59')];
      } else if(this.tabIndex == 1) {
        // 本月
        let month = moment(new Date()).format('YYYY-MM') + '-01';
        this.timeTexts = [moment(month).format('YYYY-MM-DD 00:00:00'), moment(new Date()).format('YYYY-MM-DD 23:59:59')];
      } else if(this.tabIndex == 2) {
        // 今年
        let year = moment(new Date()).format('YYYY') + '-01-01';
        this.timeTexts = [moment(year).format('YYYY-MM-DD 00:00:00'), moment(new Date()).format('YYYY-MM-DD 23:59:59')];
      }

      this.getFilterData();
    },
    goToIncomeList() {
      uni.navigateTo({
        url: '/mine-pages/pages/finance/income-list/income-list'
      })
    },
    goToBalanceList() {
      uni.navigateTo({
        url: '/mine-pages/pages/finance/balance-list/balance-list'
      })
    },
    goToWithdraw() {
      uni.navigateTo({
        url: '/mine-pages/pages/finance/withdraw/withdraw'
      })
    },
    goToWithdraws() {
      uni.navigateTo({
        url: '/mine-pages/pages/finance/withdraws/withdraws'
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
        this.timeFilterTexts = [moment(val.value[0]).format('YYYY.MM.DD'), moment(val.value[1]).format('YYYY.MM.DD')];
        this.tabIndex = 3;  //筛选时间

        this.getFilterData();
      }
    },

    updateTipsVal(val) {
      if(this.showTips == val) return this.showTips = '';
      this.showTips = val;
    }

    
  }
}
</script>

<style lang="scss" scoped>
  @import 'incomes.scss';
</style>