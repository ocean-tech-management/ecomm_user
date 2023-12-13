<template>
  <view class="system-intro-page">
    <image class="system-intro-img" src="https://oss.mhpp.vip/image/about_us.jpg" mode="widthFix" webp></image>
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
  @import 'about-us.scss';
</style>