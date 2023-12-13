<template>
  <view class="uni-common-pb-withbtn">
    <view class="form">    
      <view class="form-item">
        <view class="form-label">真实姓名</view>
        <input class="form-input" type="text" placeholder="请填写" maxlength="16" :value="formData.real_name" @input="updateRealName"/>
      </view>
      <view class="form-item">
        <view class="form-label">手机号码</view>
        <input class="form-input" placeholder="请填写" maxlength="11" :value="formData.user_phone" @input="updatePhone"/>
      </view>
      <view class="form-tips">请注意：请使用正确的真实姓名与归属于真实姓名名下的正确手机号码</view>

    </view>


 
    <view class="bottom-btns">
      <view class="bottom-btn" @tap="tryToSign">
        前往签约
      </view>
    </view>
  </view>

</template>

<script>
export default {
  data() {
    return {
      
      userInfo: uni.getStorageSync('userInfo') || {},

      formData: {
        real_name: '',
        user_phone: ''
      }
    }
  },
  onShareAppMessage() {
    let shareInfo = this.$getShareInfo();
    return shareInfo;
  },
  onLoad(options) {
    if(!this.userInfo.uid) {
      return uni.showModal({
        title: '提示',
        content: '登陆信息失效或您尚未成为商城用户，即将离开该页面',
        showCancel: false,
        success: res => {
          if(res.confirm) {
            uni.reLaunch({
              url: '/pages/index/index'
            });
          }
        }
      })
    }
    if(uni.getStorageSync('signInfoStorage')) {
      this.formData.real_name = uni.getStorageSync('signInfoStorage').real_name || '';
      this.formData.user_phone = uni.getStorageSync('signInfoStorage').user_phone || '';
    }
  },
  onUnload() {
    if(this.codeInterval) clearInterval(this.codeInterval);
  },
  methods: {

    updateRealName: function(e) {
      this.formData.real_name = e.detail.value;
    },
    updatePhone: function(e) {
      this.formData.user_phone = e.detail.value;
    },
    tryToSign() {
      let params = {
        uid: this.userInfo.uid,
        ...this.formData
      }
      
      let paramValues = Object.values(params);
      for(let i = 0; i < paramValues.length; i++) {
        if(paramValues[i] == undefined || paramValues[i] == null || paramValues[i] === '') {
          return uni.showModal({
            title: '提示',
            content: '请填写完所有信息哦',
            showCancel: false
          });
        }
      }
      if(params.user_phone && !/^1[3456789]\d{9}$/.test(params.user_phone)) {
        return uni.showModal({
                title: '提示',
                content: '手机号码有误，请检查哦',
                showCancel: false
              });
      }
      uni.setStorageSync('signInfoStorage', params);
      this.$post('/letfree/buildContract', params, res => {
        setTimeout(() => {
          uni.showToast({
            title: '跳转中',
            mask: true,
            icon: 'none'
          })
        }, this.$toastDelay)
        setTimeout(()=> {
          
          // #ifndef H5
          uni.setStorageSync('redirectWebUrl', res.data.contract_url);
          uni.redirectTo({
            url: '/market-pages/pages/lexiaohuo-pay/sign/sign'
          })
          // #endif
          // #ifdef H5
          window.location.href = res.data.contract_url;
          // #endif
        }, 300)
      })
    },
    
  }
}
</script>

<style lang="scss" scoped>
  @import 'pre-sign.scss';
  .form {
    padding-top: 20rpx;
  }
  .form-input {
    width: 100%;
    height: 2em;
    line-height: 2em;
  }
</style>