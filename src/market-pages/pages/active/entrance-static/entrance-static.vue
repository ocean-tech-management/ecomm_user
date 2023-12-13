<template>
  <view class="flex-page">
    <view class="flex-page-content">
      <view class="rush-products">
        <!-- 空节点，做撑开空间用 -->
        <image class="rush-product-poster" :src="entrance.background" mode="widthFix" lazy-load></image>
      </view>
    </view>
  </view>
</template>
<script>
import moment from 'moment';
export default {
  data() {
    return {
      id: null,

      entrance: {}
    }
  },
  onShareAppMessage() {
    let shareInfo = this.$getShareInfo();
    return shareInfo;
  },
  onLoad(options) {
    if(!options.id) {
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

    this.id = options.id;

    this.getData();
  },
  methods: {
    getData() {
      let params = {
        id: this.id
      }
      this.$get('/home/entrance', params, res => {
        this.entrance = res.data;
      })
    },

  }
}
</script>
<style lang="scss" >
  @import 'entrance-static.scss';
</style>