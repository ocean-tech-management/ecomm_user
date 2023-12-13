<template>
  <view class="flex-page">
    <view class="order-tabs">
      <view class="order-tab" :class="{ 'active': tabIndex == 4 }" @tap="updateTab(4)">已抢购</view>
      <view class="order-tab" :class="{ 'active': tabIndex == 2 }" @tap="updateTab(2)">待发放</view>
      <view class="order-tab" :class="{ 'active': tabIndex == 1 }" @tap="updateTab(1)">已完成</view>
      <view class="order-tab" :class="{ 'active': tabIndex == 3 }" @tap="updateTab(3)">抢购失败</view>
      <view class="order-tab" :class="{ 'active': tabIndex == 5 }" @tap="updateTab(5)">重开结算</view>
    </view>
    <view class="flex-page-content">
      <view v-if="roundList && roundList.length > 0" class="category-wrapper">
        <view class="category-parents">
          <view v-for="(item, index) in roundList" class="category-parent"
            :class="{ 'active': roundIndex == index, 'pre-active': roundIndex - 1 == index, 'next-active': roundIndex + 1 == index }"
            :key="index" @tap="updateArea(index)">{{ item.title }}</view>
        </view>
        <!-- <scroll-view scroll-y class="category-child-scroll">
          <view class="category-list">
            <view v-for="item in dataList[roundIndex].child" class="category-item" :key="item.code"
              @tap="goToTypeProducts(item.code, item.name)">
              <view class="category-img-box">
                <image class="category-img" :src="item.icon" mode="widthFix" webp lazy-load></image>
              </view>
              <view class="category-name ellipsis-1">{{ item.name }}</view>
            </view>
          </view>
        </scroll-view> -->
        <scroll-view scroll-y class="category-child-scroll" :refresher-enabled="true" :refresher-triggered="refreshing"
          @refresherrefresh="tryRefresh" @scrolltolower="getList">
          <view class="category-list">
            <view v-for="(item, index) in dataList" class="goods-item" :key="index" @tap="goToOrderDetail(index)">
              <view class="goods-img-box">
                <image class="goods-img" :src="item.images" mode="widthFix" lazy-load webp></image>
              </view>
              <view class="goods-infos">
                <view class="goods-title">{{ item.activity_title }}{{ item.crowd_round_number }}轮{{
                  item.crowd_period_number
                }}期
                </view>
                <view class="goods-info">福利专享</view>
                <view class="goods-info">消费积分：{{ item.real_pay_price }}</view>
                <view class="goods-info">下单时间：{{ item.create_time }}</view>
                <view v-if="item.result_status == 2" class="goods-info highlight">第{{ item.will_success_period }}期认购满,
                  发放本期福利补贴
                </view>
                <view v-if="item.result_status == 5 && item.crowd_fuse_status == 1 && item.crowd_fuse_type != 88"
                  class="goods-info">
                  福利方案：{{ crowdFuseTypeTexts[item.crowd_fuse_type] }}
                </view>
                <block v-if="item.lottery_plan_sn">
                  <view v-if="item.lottery_status == 3 && !item.user_exist_lottery" class="lottery-ctrl"
                    @tap.stop="tryJoinLottery(index)">参与抽奖</view>
                  <view v-if="item.user_exist_lottery && item.user_lottery_status == 3 && item.coldDown != ''"
                    class="lottery-ctrl plain" @tap.stop="showTips('尚未开奖，请耐心等待')">开奖倒计时: {{ item.coldDown }}</view>
                  <view v-if="item.user_exist_lottery && item.user_lottery_status == 1" class="lottery-ctrl plain"
                    @tap.stop="goToLotteryDetail(index)">恭喜您中奖了</view>
                  <view v-if="item.user_exist_lottery && item.user_lottery_status == 2" class="lottery-ctrl plain"
                    @tap.stop="goToLotteryDetail(index)">遗憾您没中奖</view>
                  <view v-if="item.user_exist_lottery && item.user_lottery_status == 'lotterying'"
                    class="lottery-ctrl plain" @tap.stop="showTips('请刷新页面可查看开奖结果')">稍后刷新页面可查看开奖结果</view>
                  <view v-if="!item.user_exist_lottery && item.lottery_status != 3" class="lottery-ctrl plain"
                    @tap.stop="goToLotteryDetail(index)">查看抽奖结果</view>
                </block>
                <block v-if="item.result_status == 5 && item.crowd_fuse_status == 1 && item.crowd_fuse_type == 88">
                  <view class="break-ctrl" @tap.stop="goToFusePlan(index)">选择福利方案</view>
                </block>
              </view>

              <view class="goods-status" :class="resultClasses[item.result_status]">
                {{ resultStatus[item.result_status] }}
              </view>
            </view>
            <view v-if="dataLoading" class="scroll-tips">加载中...</view>
            <view v-if="dataList.length > 0 && currentPage > pageTotal && !dataLoading" class="scroll-tips">已经到底啦</view>
            <view v-if="dataList.length == 0 && currentPage > pageTotal && !dataLoading" class="scroll-tips">暂无记录哦</view>
          </view>
        </scroll-view>
      </view>
    </view>
    <!-- <view class="order-area-box">
      <picker class="order-area-picker" :value="roundIndex" :range="roundList" range-key="title" @change="updateArea">
        <view class="order-area">
          <view v-if="!roundIndex || roundIndex === 0" class="order-area-name tips">请选择商品区</view>
          <view v-else class="order-area-name">{{ roundList[roundIndex].title }}</view>
          <image class="order-area-arrow" src="/static/images/user_state_vip_arrow.png"></image>
        </view>
      </picker>
    </view>
    <view class="flex-page-content">

    </view> -->
  </view>
</template>
<script>
import moment from 'moment';
export default {
  data() {
    return {
      tabIndex: 4,

      roundIndex: 0,
      roundList: [{
        id: 0,
        title: '不限'
      }],

      currentPage: 1,
      pageTotal: 1,
      dataList: [],
      dataLoading: false,
      refreshing: false,

      resultStatus: {
        [1]: '已完成',
        [2]: '发放中',  //待成功
        [3]: '已失败',
        [4]: '参与中',  //等待结果，抢购中
        [5]: '福利重启',
      },
      resultClasses: {
        [1]: '',
        [2]: 'waiting',  //待成功
        [3]: '',
        [4]: 'buying',  //等待结果，抢购中
        [5]: '',
      },

      lotteryResults: {
        [1]: '已中奖',
        [2]: '未中奖',
        [3]: '待开奖'
      },

      crowdFuseTypeTexts: {
        [1]: '特大福利一',
        [2]: '特大福利二'
      },

      dataRequestTask: null,

      coldDownInterval: null,
      shouldReColdDown: false
    }
  },

  onLoad() {
    this.getRounds();
    this.getList();
  },
  onShow() {
    if(uni.getStorageSync('shouldReload')) {
      uni.removeStorageSync('shouldReload');
      this.reGetList();
    }
  },
  onHide() {
    if(this.coldDownInterval) clearInterval(this.coldDownInterval);
  },
  onUnload() {
    if(this.coldDownInterval) clearInterval(this.coldDownInterval);
  },
  methods: {

    getRounds() {
      let params = {
      }
      this.$sget('/crowdFunding/activityList', params, res => {

        if(!res.data || res.data.length == 0) return;
        let data = res.data;
        this.roundList.push(...data);
      })
    },

    getList() {
      if(this.dataLoading) return false;
      if(this.currentPage > this.pageTotal) return;
      let params = {
        keyword: '',
        crowd_result_status: this.tabIndex,
        uid: uni.getStorageSync('userInfo').uid,
        page: this.currentPage
      }
      if(this.roundList[this.roundIndex] && this.roundList[this.roundIndex].activity_code) params.crowd_activity_code = this.roundList[this.roundIndex].activity_code;
      this.dataLoading = true;
      let dataRequestTask = this.$sget('/crowdFunding/crowdOrderList', params, res => {
        this.dataLoading = false;
        this.currentPage += 1;
        if(res.data.length == 0) return;
        let dataList = res.data.list || [];
        for(let i = 0; i < dataList.length; i++) {
          dataList[i].coldDown = '';
        }
        this.dataList.push(...dataList);
        this.pageTotal = res.data.pageTotal;


        this.handingColdDown();
        this.initColdDown();

      }, err => {
        this.dataLoading = false;
      })

      // 因为是需要验证uid的请求，因多请求因故，走promise异步
      dataRequestTask.then(request => {
        this.dataRequestTask = request;
      })
    },
    reGetList() {
      this.shouldReColdDown = true;
      this.currentPage = 1;
      this.pageTotal = 1;
      this.dataList = [];
      this.getList();
    },
    initColdDown() {
      if(this.coldDownInterval) clearInterval(this.coldDownInterval);
      this.coldDownInterval = setInterval(() => {
        this.handingColdDown();
      }, 1000)
    },
    handingColdDown() {
      for(let i = 0; i < this.dataList.length; i++) {
        if(this.dataList[i].lottery_plan_sn && this.dataList[i].lottery_status == 3) {
          let date = moment().utc().utcOffset(480).format('YYYY-MM-DD HH:mm:ss');
          let timeSpan = moment(this.dataList[i].lottery_start_time).diff(date, 'seconds');
          let duration = moment.duration(timeSpan, 'seconds');
          if(duration <= 0) {
            this.dataList[i].user_lottery_status = 'lotterying';
            this.dataList[i].lottery_status = 'lotterying';
          } else {
            let coldDown = [];
            let hours = duration.hours();
            if(duration.days() && duration.days() > 0) hours += duration.days() * 24; //因为不显示日期，将日期加到小时中
            coldDown.push(hours >= 10 ? hours : `0${hours}`);
            coldDown.push(duration.minutes() >= 10 ? duration.minutes() : `0${duration.minutes()}`);
            coldDown.push(duration.seconds() >= 10 ? duration.seconds() : `0${duration.seconds()}`);
            this.dataList[i].coldDown = `${coldDown[0]}小时${coldDown[1]}分${coldDown[2]}秒`
          }
        }
      }
    },

    tryRefresh() {
      if(this.dataRequestTask) {
        this.dataRequestTask.abort();
        this.dataRequestTask = null;
        this.dataLoading = false;
      }
      this.refreshing = true;
      this.reGetList();
      setTimeout(() => {
        this.refreshing = false;
      }, 200)

    },

    updateArea(index) {
      if(this.dataRequestTask) {
        this.dataRequestTask.abort();
        this.dataRequestTask = null;
        this.dataLoading = false;
      }
      this.roundIndex = index || 0;

      this.reGetList();
    },

    updateTab(index) {
      if(this.tabIndex == index) return;
      if(this.dataRequestTask) {
        this.dataRequestTask.abort();
        this.dataRequestTask = null;
        this.dataLoading = false;
      }
      this.tabIndex = index;
      this.reGetList();
    },




    tryJoinLottery(index) {
      let params = {
        plan_sn: this.dataList[index].lottery_plan_sn,
        uid: uni.getStorageSync('userInfo').uid
      }
      this.$post('/crowdFunding/applyLottery', params, res => {
        uni.showModal({
          title: '参与成功',
          content: '请留意具体开奖时间，我们将在开奖时间之后公布结果',
          showCancel: false
        })
        this.reGetList();
      })
    },

    goToLotteryDetail(index) {
      let sn = this.dataList[index].lottery_plan_sn;
      uni.navigateTo({
        url: `/market-pages/pages/crowd-funding/lottery-detail/lottery-detail?sn=${sn}`
      })
    },
    goToOrderDetail(index) {
      let sn = this.dataList[index].order_sn;
      uni.navigateTo({
        url: `/pages/order-detail/order-detail?sn=${sn}`
      })
    },
    goToFusePlan(index) {
      let sn = this.dataList[index].order_sn;
      uni.navigateTo({
        url: `/market-pages/pages/crowd-funding/fuse-plan/fuse-plan?sn=${sn}`,
        fail: err => {
          console.log(err)
        }
      })
    },

    showTips(msg) {
      if(msg && typeof msg == 'string') {
        uni.showToast({
          title: msg,
          icon: 'none',
          mask: true
        })
      }
    }

  }
}
</script>
<style lang="scss" scoped>
@import 'orders.scss';
</style>