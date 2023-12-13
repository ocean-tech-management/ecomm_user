<template>
  <view class="auth-page">
    <view class="auth-info">
      为了更好的服务您，{{ name }}需要向您发起个人信息的授权申请
    </view>
    <view class="auth-ctrls">
      <view class="auth-lincese">
        <view class="auth-lincese-select" @tap="toggleAccept">
          <image v-show="acceptLincese" class="auth-lincese-select-icon" src="/static/images/shopcar_select.png"></image>
          <image v-show="!acceptLincese" class="auth-lincese-select-icon" src="/static/images/shopcar_unselect.png">
          </image>
          <view>请仔细阅读</view>
        </view>
        <view class="auth-lincese-entrance" @tap="goToUserAgreement">《{{ name }}会员服务协议》</view>

      </view>
      <view class="auth-ctrl" @tap="tryUserProfile">同意申请</view>
      <view class="auth-ctrl reject" @tap="goToIndex">再考虑，暂不提供</view>
    </view>

  </view>
</template>
<script>
export default {
  data() {
    return {
      name: '',
      userInfo: '',

      acceptLincese: false,

      wxCode: '',
      shareId: '', // 用户ID
    }
  },
  onLoad(options) {
    if (options.share_id) this.shareId = options.share_id
    this.name = this.$name;
    this.getWxCode();
  },
  methods: {
    toggleAccept() {
      this.acceptLincese = !this.acceptLincese;
    },

    getWxCode() {
      uni.login({
        success: res => {
          let wechat = res;
          this.wxCode = wechat.code;
        }
      });
    },

    tryUserProfile() {
      if(!this.acceptLincese) {
        return uni.showModal({
          title: '提示',
          content: `请仔细阅读《${this.name}会员服务协议》，如已阅读完毕并同意协议请勾选按钮上方的选择框`,
          showCancen: false
        })
      }
      uni.getUserProfile({
        desc: '用于完善会员资料',
        success: e => {
          if(e.errMsg == 'getUserProfile:ok') {
            let params = {
              userProfile: e.userInfo
            };
            if (this.shareId) params.share_id = this.shareId;
            params.code = this.wxCode;

            if(!params.userProfile.nickName || params.userProfile.nickName == '微信用户') {
              params.userProfile.nickName = this.getRandomName();
              uni.setStorageSync('_defaultSystemUserName', params.userProfile.nickName);
            }


            if(uni.getStorageSync('link_uid')) params.link_user = uni.getStorageSync('link_uid');
            this.$post('/wx/authNew', params, res => {
              let data = res.data;
              //#ifdef H5
              data.real_uid = data.uid;
              if(data.primary_uid) data.uid = data.primary_uid; //同步过，改写uid
              // #endif
              this.userInfo = data;
              uni.setStorageSync('userInfo', data);
              uni.setStorageSync('token', {
                token: data.token,
                time: new Date().getTime()
              })
              uni.setStorageSync('code', this.wxCode);
              uni.redirectTo({
                url: '/pages/perfect-info/perfect-info?enterPage=auth'
              })
            }, err => {
              this.getWxCode();
            })

          }else {
            uni.showToast({
              title: '未授权成功请重试',
              icon: 'none',
              mask: true
            })
            this.getWxCode();
          }
        },
        fail: err => {
          uni.showToast({
            title: '未授权成功请重试',
            icon: 'none',
            mask: true
          })
          console.log(err);
          this.getWxCode();
        }
      })
    },

    getRandomName() {
      let realLength = 9;  //9位随机数
      let baseValue = Math.pow(10, realLength);
      let endValue = Math.pow(10, realLength + 1);
      let randomVal = parseInt(Math.random() * (endValue - baseValue));
      let to36Step = (baseValue + randomVal).toString(36);  //转成36进制，缩短长度
      return `用户${to36Step}`;
    },

    goToIndex() {
      uni.reLaunch({
        url: '/pages/index/index'
      })
    },

    goToUserAgreement() {
      uni.navigateTo({
        url: '/pages/user-agreement/user-agreement'
      })
    },
  }
}
</script>

<style lang="scss">
@import 'auth.scss';
</style>