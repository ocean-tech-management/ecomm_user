<template>
  <view class="system-intro-page">
    <image class="system-intro-img" src="https://oss.mhpp.vip/image/user_manual.png" mode="widthFix" webp></image>
  </view>
</template>
<script>

export default {
  data() {
    return {
      systemInfo: {}
    }
  },
  onShareAppMessage() {
    let shareInfo = this.$getShareInfo();
    if(shareInfo.imageUrl) delete shareInfo.imageUrl;
    return shareInfo;
  },
  onLoad() {
  },
  methods: {
  }
}
</script>

<style lang="scss">
  @import 'user-manual.scss';
</style>