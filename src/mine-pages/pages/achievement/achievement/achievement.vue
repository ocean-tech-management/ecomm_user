<template>
  <view>
    <!-- <view class="achievement-totals">
      <view v-for="(item, index) in achievement" class="achievement-total" :key="index">
        <view class="achievement-total-val">{{item.nowNumber}}</view>
        <view class="achievement-total-title">{{item.title}}</view>
      </view>
    </view> -->

    <view v-if="userInfo.vip_level !== 1" class="achievement-tips">
      <view class="achievement-tips-title">下一等级 {{nextLevel}}</view>
      <view class="achievement-tips-text">您当前的等级为{{userInfo.vip_name}}</view>
    </view>

    <view class="achievement-progresses">
      <view v-for="(item, index) in achievement" class="achievement-progress" :key="index">
        <view class="achievement-progress-title">
          <text>{{item.title}}</text>
          <text class="achievement-progress-aim">（{{item.aimsNumber}}）</text> 
        </view>
        <view class="achievement-progress-infos">
          <view class="progress-percent-bar">
            <view class="progress-percent" :style="'width: ' + item.progress + '%'"></view>
          </view>
          <view v-if="item.distance >= 0" class="progress-percent-info">还差{{item.distance}}</view>
          <view v-if="item.distance < 0" class="progress-percent-info">已达标</view>
        </view>
      </view>
    </view>
  </view>
</template>
<script>
export default {
  data() {
    return {
      achievement: [],
      memberTexts: {},

      userInfo: uni.getStorageSync('userInfo'),
      nextLevel: ''
    }
  },onShareAppMessage() {
    let shareInfo = this.$getShareInfo();
    return shareInfo;
  },
  onLoad(options){
    this.getData();
    this.getLeaderTexts();
  },
  methods: {
    getData() {
      let params = {
        uid: uni.getStorageSync('userInfo').uid
      }
      this.$get('/team/performance', params, res => {
        let achievement = res.data;
        for(let i = 0; i < achievement.length; i++) {
          achievement[i].progress = parseFloat(achievement[i].nowNumber) / parseFloat(achievement[i].aimsNumber) * 100;
          if(achievement[i].progress > 100) achievement[i].progress = 100;
          achievement[i].distance = parseFloat(achievement[i].aimsNumber) - parseFloat(achievement[i].nowNumber);
          if(/^(([^0][0-9]+|0)\.([0-9]*))$/.test(achievement[i].distance)) {
            achievement[i].distance = achievement[i].distance.toFixed(2);
          }
        }
        this.achievement = achievement;
      })
    },
    
    getLeaderTexts() {
      this.$get('/member/title', null, res => {
        let data = res.data;
        let memberTexts = {};
        for(let i = 0; i < data.length; i++) {
          memberTexts[data[i].level] = data[i].name;
        }
        
        if(this.userInfo.vip_level === 0) {
          this.nextLevel = memberTexts[3];
        } else {
          this.nextLevel = memberTexts[this.userInfo.vip_level - 1];
        }
      })
    },
  }
}
</script>
<style lang="scss" scoped>
  @import 'achievement.scss';
</style>
