<template>
  <view class="maintain-page">
    <view v-if="maintain.is_maintain">
      <view class="maintain-info">
        <view>{{name}}正在维护升级中</view>
        <view class="maintain-tips">
          给您带来不便敬请谅解
        </view>
      </view>
      <view v-if="maintain.start_time || maintain.end_time" class="maintain-duration-info">
        <view>维护升级时间</view>
        <view>{{maintain.start_time || '——'}} 至 {{maintain.end_time || '——'}}</view>
      </view>
    </view>

  </view>
</template>
<script>
import config from '@/config';

export default {
  data() {
    return {
      name: '',

      maintain: {}
    }
  },
  onShow() {
    this.getMaintain();
  },
  onLoad() {
    this.name = this.$name;
  },
  methods: {
    getMaintain() {
      this.$sgetCross(config.maintainFilePath, null, res => {
        if(res && res.data) {
          if(!res.data.is_maintain) {
            // 如果不是运维状态重置到[小程序首页, 微信公众号首页, 纯H5登录页]
            if (uni.getStorageSync('accessKey') == config.accessKey.H5) {
              return this.toLogin()
            }
            return this.toIndex();
          }
          this.maintain = res.data;
        } else {
          // 请求返回内容有问题也直接重置
          this.toIndex();
        }
      }, err => {
        // 请求失败也是直接重置
        console.log('在维护页面请求维护文件失败，原因：', err);
        this.toIndex();
      }, true)
    },
    toIndex() {
      uni.reLaunch({
        url: '/pages/index/index'
      });
    },
    toLogin() {
      uni.reLaunch({
        url: '/pages/login/login'
      });
    }
  }
}
</script>

<style lang="scss">
  @import 'maintain.scss';
</style>