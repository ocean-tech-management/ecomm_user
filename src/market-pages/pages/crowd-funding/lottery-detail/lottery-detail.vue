<template>
  <view class="lottery-page">
    <view class="lottery-bg-box">
      <image class="lottery-bg" src="/market-pages/static/images/crowd_funding/lottery/bg.jpg"></image>
    </view>
    <view v-if="hasLoad" class="lottery-page-content">
      <view class="lottery-title-box">
        <image class="lottery-title" src="/market-pages/static/images/crowd_funding/lottery/lottery_title.png"></image>
      </view>
      <view class="lottery-infos">({{lottery.title}})</view>

      <view v-for="(item, index) in prizes" class="lottery-prize" :key="index">
        <view class="lottery-prize-info">
          <view class="lottery-prize-title">TOP{{item.winLevel}}</view>
          <view class="lottery-prize-val-name">{{ crowdBalanceName || '集品券' }}</view>
          <view class="lottery-prize-val">{{item.winPrices}}</view>
        </view>
        <view v-for="(winner, winnerIndex) in item.winners" class="lottery-winners" :key="winnerIndex">
          <view class="lottery-winner">
            <view class="lottery-winner-info">
              <view class="lottery-winner-name">{{winner.name}}</view>
              <view class="lottery-winner-phone">（{{winner.user_phone}}）</view>
            </view>
            <view class="lottery-winner-prize">{{winner.win_price || 0}}</view>
          </view>
        </view>
      </view>
      <view class="lottery-tips">
        PS: 每天发放上一期中奖名单<br />
        {{ crowdBalanceName || '集品券' }}自动进入您的集品券账户
      </view>
    </view>

    <view v-if="showPopup" class="lottery-popup">
      <view class="lottery-popup-mask"></view>
      <view class="lottery-popup-content">
        <view class="lottery-popup-infos">
          <view class="lottery-popup-img-box">
            <image class="lottery-popup-img" src="/market-pages/static/images/crowd_funding/lottery/prize_win.png">
            </image>
          </view>
          <view class="lottery-popup-title">恭喜您,中奖啦!</view>
          <view class="lottery-popup-tips">{{myPrize.win_price}}{{ $written.crowdBalanceName || '集品券' }}已转入您的账户</view>
          <view class="lottery-popup-ctrl" @tap="closePopupAndInit">查看中奖排名</view>
        </view>
        <view class="lottery-popup-close-box" @tap="closePopupAndInit">
          <image class="lottery-popup-close" src="/market-pages/static/images/crowd_funding/lottery/close.png"></image>
        </view>
      </view>

    </view>

  </view>
</template>
<script>
import config from '@/config';
export default {
  data() {
    return {
      crowdBalanceName: config.written.crowdBalanceName, // 集品券
      sn: '',
      lottery: {},
      prizes: [],

      userInfo: uni.getStorageSync('userInfo'),
      isWin: false,
      myPrize: {},
      showPopup: false,

      hasLoad: false
    }
  },
  onLoad(options) {
    if(!options.sn) {
      uni.showToast({
        title: '不要尝试啦，正在返回首页',
        icon: 'none',
        mask: true
      })
      setTimeout(() => {
        uni.reLaunch({
          url: '/pages/index/index'
        })
      }, 1500);
      return;
    }
    this.sn = options.sn;
    this.getData();
  },
  methods: {
    getData() {
      let params = {
        plan_sn: this.sn,
        uid: this.userInfo.uid
      }
      this.$get('/crowdFunding/lotteryWinInfo', params, res => {
        let data = res.data || {};
        this.lottery = data.planInfo || {};
        let prizes = [], winList = data.winList || [];
        for(let i = 0; i < winList.length; i++) {
          let list = winList[i] || [], winPrices = 0, winLevel = null;
          for(let j = 0; j < list.length; j++) {
            if(!winLevel) winLevel = list[j].win_level;
            winPrices += parseFloat(list[j].win_price || 0);
            list[j] = {
              ...list[j],
              ...list[j].user
            }
          }
          prizes.push({
            winLevel: winLevel,
            winPrices: winPrices.toFixed(2),
            winners: list
          })
        }
        this.prizes = prizes;

        if(data.userWinRes) {
          this.myPrize = data.userWinInfo;
          this.isWin = true;
          this.showPopup = true;
        } else {
          this.hasLoad = true;
        }
      })
    },

    closePopupAndInit() {
      this.showPopup = false;
      this.hasLoad = true;
    }

  }

}
</script>
<style>
page,
uni-page {
  background-color: #f6e9db;
}
</style>
<style lang="scss" scoped>
@import 'lottery-detail.scss';
</style>