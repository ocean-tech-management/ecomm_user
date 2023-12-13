<template>
  <view class="auth-page">
    <view class="auth-info">
      <view>{{name}}向您申请获取您微信绑定号码的权限，以同步、绑定您在旧系统的相关数据。</view>
      <view class="auth-info-tips">如您不是旧系统用户，可直接点击“暂不提供”按钮跳过该流程</view>
    </view>
    <view class="auth-ctrls">
      <button class="auth-ctrl" open-type="getPhoneNumber" @getphonenumber="getUserPhone">授权同步</button>
      <view class="auth-ctrl reject" @tap="goToIndex">暂不提供</view>
    </view>
  </view>
</template>
<script>
export default {
  data() {
    return {
      name: '',
      wxCode: '',
      userInfo: uni.getStorageSync('userInfo')
    }
  },
  onLoad() {
    this.name = this.$name;
    this.getWxCode();
  },
  methods: {
    getWxCode() {
      uni.login({
        success: res => {
          let wechat = res;
          this.wxCode = wechat.code;
        }
      });
    },
    getUserPhone(info) {
      let data = info.detail;
      if(data.errMsg == 'getPhoneNumber:ok') {
        let params = {
          code: this.wxCode,
          crypt: {
            encryptedData: data.encryptedData,
            iv: data.iv
          }
        };
        this.$post('/wx/crypt', params, res => {
          if(res.data && res.data.purePhoneNumber) {
            this.userInfo.phone = res.data.purePhoneNumber;
            this.bindUser();
          }
        }, err => {
          this.getWxCode();
          uni.showToast({
            title: '授权失败请重试',
            mask: true,
            icon: 'none'
          })
        })
        
      } else {
        this.getWxCode();
        uni.showToast({
          title: '授权失败请重试',
          mask: true,
          icon: 'none'
        })
      }
    },
    bindUser() {
      let params = {
        phone: this.userInfo.phone,
        uid: this.userInfo.uid
      };
      this.$post('/user/sync', params, res => {
        uni.showToast({
          title: '同步成功',
          mask: true
        })
        setTimeout(() => {
          uni.removeStorageSync('userInfo');
          uni.removeStorageSync('token');
          uni.reLaunch({
            url: '/pages/index/index'
          })
        }, 1300)
      })
    },
  
    goToIndex() {
      uni.reLaunch({
        url: '/pages/index/index'
      })
    }
  }
}
</script>

<style lang="scss">
  @import 'auth-init-bind.scss';
</style>