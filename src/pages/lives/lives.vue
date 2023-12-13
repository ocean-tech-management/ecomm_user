<template>
  <view>
    <view class="live-list">
      <view v-for="item in lives" class="live-item" @tap="goToLive(item.roomid)" :key="item.roomid">
        <view class="live-img-box">
          <view v-if="item.replay && item.replay.length > 0" class="replay-tag">重播</view>
          <image class="live-img" :src="item.cover_img" mode="widthFix"></image>
        </view>
        <view class="live-info">
          <view class="live-name">{{item.name}}</view>
          <view class="live-user">主播：{{item.anchor_name}}</view>
        </view>
      </view>
    </view>
  </view>
</template>
<script>
export default {
  data() {
    return {
      lives: []
    }
  },onShareAppMessage() {
    let shareInfo = this.$getShareInfo();
    return shareInfo;
  },
  onLoad(options){
    this.getList();
  },
  methods: {
    getList() {

      this.$get('/live/list', null, res => {
        let lives = res.data;
        this.lives = lives;
      })
    },
    goToLive(roomid) {
      console.log(roomid);
      // let customParams = encodeURIComponent(JSON.stringify({ path: 'pages/index/index', pid: 1 })) // 开发者在直播间页面路径上携带自定义参数（如示例中的path和pid参数），后续可以在分享卡片链接和跳转至商详页时获取，详见【获取自定义参数】、【直播间到商详页面携带参数】章节（上限600个字符，超过部分会被截断）
      let customParams = '';
      uni.navigateTo({
          url: `plugin-private://wx2b03c6e691cd7370/pages/live-player-plugin?room_id=${roomid}&custom_params=${customParams}`
      })
    }
  }
}
</script>
<style lang="scss" scoped>
  @import 'lives.scss';
</style>