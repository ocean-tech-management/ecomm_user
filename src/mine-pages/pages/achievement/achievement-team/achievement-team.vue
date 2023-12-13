<template>
  <view>
    <!-- <view class="achievement-totals">
      <view v-for="(item, index) in achievement" class="achievement-total" :key="index">
        <view class="achievement-total-val">{{item.nowNumber}}</view>
        <view class="achievement-total-title">{{item.title}}</view>
      </view>
    </view> -->

    <view v-if="userInfo.team_vip_level !== 1" class="achievement-tips">
      <view class="achievement-tips-title">下一等级 {{ nextLevel }}</view>
      <view v-if="userInfo.team_vip_level != 0" class="achievement-tips-text">您当前的等级为{{ userInfo.team_vip_name }}</view>
      <view v-else class="achievement-tips-text">您还不是团队业绩代理人</view>

    </view>

    <view class="achievement-progresses">
      <view v-for="(item, index) in achievement" class="achievement-progress" :key="index">
        <view class="achievement-progress-title">
          <text>{{ item.title }}</text>
          <text class="achievement-progress-aim">（{{ item.aimsNumber }}）</text>
        </view>
        <view class="achievement-progress-infos">
          <view class="progress-percent-bar">
            <view class="progress-percent" :style="'width: ' + item.progress + '%'"></view>
          </view>
          <view v-if="item.distance >= 0" class="progress-percent-info">还差{{ item.distance }}</view>
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
      this.$get('/team/teamPerformance', params, res => {
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
      this.$get('/teamMember/title', null, res => {
        let data = res.data;
        let memberTexts = {};
        const maxLevelMember = {}; // 在team_vip_level=0；拿最高等级
        for(let i = 0; i < data.length; i++) {
          memberTexts[data[i].level] = data[i].name;
          if (!maxLevelMember.level) {
            maxLevelMember.level = data[i].level;
            maxLevelMember.name = data[i].name;
          }
          if (data[i].level > maxLevelMember.level) {
            maxLevelMember.level = data[i].level;
            maxLevelMember.name = data[i].name;
          }
        }

        if(this.userInfo.team_vip_level === 0) {
          this.nextLevel = maxLevelMember.name;
        } else {
          this.nextLevel = memberTexts[this.userInfo.team_vip_level - 1];
        }
      })
    },
  }
}
</script>
<style lang="scss" scoped>
@import 'achievement-team.scss';
</style>
