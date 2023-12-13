<template>
  <view >
    <view class="total-wrapper">
      <image class="total-incomes-bg" src="/mine-pages/static/images/bg/bg_incomes.png"></image>
      <view class="total-content">
        <view class="total-box">
          <view class="total">
            <view class="total-val">
              <text>{{incomes.balance || '0.00'}}</text>
              <text class="total-val-sign">元</text>
            </view>
            <view class="total-title">可用余额</view>
          </view>
          <view class="to-withdraw-btn" @tap="goToWithdraws">
            回收记录
          </view>

        </view>
        <view class="income-total-ctrls">
          <view class="income-total-ctrl" @tap="goToWithdraw">回收</view>
        </view>
      </view>
      
    </view>

    <view class="entrance" @tap="goToIncomes">
      <view class="entrance-title-box">
        <view class="entrance-title">商城收益</view>
        <image class="entrance-arrow" src="/static/images/more.png"></image>
      </view>
      <view class="income-total-consoles">
        <view class="income-total-console">
          <view class="income-total-console-val">{{incomes.divideTodayInCome || 0}}</view>
          <view class="income-total-console-title">今日收益</view>
        </view>
        <view class="income-total-console">
          <view class="income-total-console-val">{{incomes.divideMonthInCome || 0}}</view>
          <view class="income-total-console-title">本月收益</view>
        </view>
        <view class="income-total-console">
          <view class="income-total-console-val">{{incomes.divideAllInCome || 0}}</view>
          <view class="income-total-console-title">累计收益</view>
        </view>
      </view>
    </view>

    
    <view class="entrance" @tap="goToPpylIncomes">
      <view class="entrance-title-box">
        <view class="entrance-title">拼团收益</view>
        <image class="entrance-arrow" src="/static/images/more.png"></image>
      </view>
      <view class="income-total-consoles">
        <view class="income-total-console">
          <view class="income-total-console-val">{{incomes.mhppTodayInCome || 0}}</view>
          <view class="income-total-console-title">今日收益</view>
        </view>
        <view class="income-total-console">
          <view class="income-total-console-val">{{incomes.mhppMonthInCome || 0}}</view>
          <view class="income-total-console-title">本月收益</view>
        </view>
        <view class="income-total-console">
          <view class="income-total-console-val">{{incomes.mhppAllInCome || 0}}</view>
          <view class="income-total-console-title">累计收益</view>
        </view>
      </view>
    </view>
    

    
  </view>

</template>

<script>
import mxDatetimePicker from '@/components/mx-datetimepicker/mx-datetimepicker.vue';
export default {
  components: {
    mxDatetimePicker
  },
  data() {
    return {
      userInfo: uni.getStorageSync('userInfo'),
      tabIndex: 0,

      incomes: {},
      
    }
  },
  onLoad(options) {
    this.getData();
  },
  methods: {
    getData() {
      let params = {
        uid: uni.getStorageSync('userInfo').uid
      }
      this.$get('/team/allInCome', params, res => {
        this.incomes = res.data;
      })
    },
    
    
    goToWithdraws() {
      uni.navigateTo({
        url: '/mine-pages/pages/finance/withdraws/withdraws'
      })
    },
    goToWithdraw() {
      uni.navigateTo({
        url: '/mine-pages/pages/finance/withdraw/withdraw'
      })
    },
    goToIncomes() {
      uni.navigateTo({
        url: '/mine-pages/pages/finance/incomes/incomes'
      })
    },
    goToPpylIncomes() {
      uni.navigateTo({
        url: '/market-pages/pages/ppyl/incomes/incomes'
      })
    },

    
  }
}
</script>

<style lang="scss" scoped>
  @import 'user-incomes.scss';
</style>