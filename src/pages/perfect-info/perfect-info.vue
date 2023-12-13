<template>
  <view class="flex-page">
    <view class="flex-page-content">
      <view class="form">   
        <!-- #ifdef MP-WEIXIN -->
        <view class="form-item">
          <view class="form-label">修改头像</view>
          <view class="avatar-wrapper">
            <button class="avatar-btn" open-type="chooseAvatar" @chooseavatar="onChooseAvatar">
              <image class="avatar" :src="userInfo.avatarUrl"></image>
            </button> 
          </view>
        </view>
        <view class="form-item">
          <view class="form-label">用户昵称</view>
          <input class="form-input" type="nickname" maxlength="28" placeholder="请输入昵称" v-model="userInfo.name" @change="handlerNickname"/>
        </view>
        <!-- #endif -->
        <!-- #ifndef MP-WEIXIN -->
        <view class="form-item">
          <view class="form-label">修改头像</view>
          <view class="avatar-wrapper" @tap="trySelectAvatar">
            <view class="avatar-btn">
              <image class="avatar" :src="userInfo.avatarUrl"></image>
            </view>
          </view>
        </view>
        <view class="form-item">
          <view class="form-label">用户昵称</view>
          <input class="form-input" maxlength="28" placeholder="请输入昵称" v-model="userInfo.name"/>
        </view>
        <!-- #endif -->
      </view>
      <view v-if="enterPage == 'auth'" class="perfect-ctrls">
        <view class="perfect-ctrl" @tap="askConfirmInfo">提交</view>
        <view class="perfect-ctrl reject" @tap="goToIndex">再考虑，暂不完善</view>
        <view class="perfect-ctrls-tips">为了更好的服务您，请您完善个人信息</view>
      </view>

    </view>

    <view v-if="enterPage == 'me'" class="bottom-btns">
      <view class="bottom-btn" @tap="confirmInfo">确认修改</view>
    </view>

  </view>
</template>
<script>
import util from '@/common/util';
import moment from 'moment';
export default {
  data() {
    return {
      enterPage: 'me',
      userInfo: {
        uid: null,
        avatarUrl: '',
        name: ''
      },
      confirmLock: false
    }
  },
  onLoad(options) {
    if(options.enterPage) this.enterPage = options.enterPage;
    let userInfo = uni.getStorageSync('userInfo');
    this.userInfo = {
      uid: userInfo.uid,
      avatarUrl: userInfo.avatarUrl || '',
      name: userInfo.name || ''
    }
    if(this.userInfo.name === '') {
      this.userInfo.name = this.getRandomName();
      uni.setStorageSync('_defaultSystemUserName', this.userInfo.name);
    }
  },
  methods: {
    getRandomName() {
      let realLength = 9;  //9位随机数
      let baseValue = Math.pow(10, realLength);
      let endValue = Math.pow(10, realLength + 1);
      let randomVal = parseInt(Math.random() * (endValue - baseValue)); 
      let to36Step = (baseValue + randomVal).toString(36);  //转成36进制，缩短长度
      return `用户${to36Step}`;
    },
    onChooseAvatar(e) {
      let path = e.detail.avatarUrl;
      if(!/.(jpg|jpeg|png|JPG|JPEG|PNG)$/.test(path)) { 
        uni.showToast({
          title: '头像格式有误，请重新选择',
          icon: 'none'
        })
        return;
      }
      this.uploadAvatar(path);
    },
    trySelectAvatar() {
      uni.chooseImage({
        count: 1,
        success: (chooseImageRes) => {
          let path = chooseImageRes.tempFilePaths[0];
          // #ifdef H5
          let file = chooseImageRes.tempFiles[0];
          if (file.type != 'image/png' && file.type != 'image/jpeg' && file.type != 'image/jpg') {
            uni.showToast({
              title: '头像格式有误，请重新选择',
              icon: 'none'
            })
            return;
          }
          // #endif
          this.uploadAvatar(path);
        }
      })
    },
    uploadAvatar(path) {
      let uploadTask = uni.uploadFile({
          url: `${util.serviceInfo.url}/upload/upload`, 
          filePath: path,
          name: 'file',
          header: {
            token: uni.getStorageSync('token').token
          },
          formData: {},
          success: (uploadFileRes) => {
            let res = JSON.parse(uploadFileRes.data);
            if(res && res.error_code == 0) {
              this.userInfo.avatarUrl = res.data;
              uni.showToast({
                title: '选择成功',
                mask: true
              })
            } else {
              console.log(res.msg);
              uni.showModal({
                title: '提示',
                content: res.msg || '选择失败请重试',
                showCancel: false
              })
            }
          },
          fail: err => {
            console.log(err)
            uni.showToast({
              title: '选择失败请重试',
              icon: 'none'
            })
          }
      });
    },
    handlerNickname(e) {
      this.userInfo.name = e.detail.value;
    },
    askConfirmInfo() {
      let _defaultSystemUserName = uni.getStorageSync('_defaultSystemUserName');
      if(_defaultSystemUserName && _defaultSystemUserName == this.userInfo.name) {
        uni.showModal({
          title: '提示',
          content: '为了您更好的体验, 建议修改自定义的昵称和头像',
          confirmText: '立即修改',
          cancelText: '继续保存',
          success: res => {
            if(res.confirm) {
            } else {
              this.confirmInfo();
            }
          }
        })
      } else {
        this.confirmInfo();
      }
    },
    confirmInfo() {
      if(this.confirmLock) return;
      this.confirmLock = true;
      this.$nextTick(() => {
        if(!this.userInfo.avatarUrl || this.userInfo.avatarUrl === '') {
          uni.showToast({
            title: '请选择头像',
            icon: 'none'
          })
          return this.confirmLock = false;
        }
        if(!this.userInfo.name || this.userInfo.name === '') {
          uni.showToast({
            title: '请填写昵称',
            icon: 'none'
          })
          return this.confirmLock = false;
        } else if(this.userInfo.name.length < 2) {
          uni.showToast({
            title: '昵称过短',
            icon: 'none'
          })
          return this.confirmLock = false;
        } else if(this.userInfo.name.length > 28) {
          uni.showToast({
            title: '昵称过长',
            icon: 'none'
          })
          return this.confirmLock = false;
        }
        let params = {
          ...this.userInfo
        }
        this.$post('/user/updateNicknameOrAvatarUrl', params, res => {
          setTimeout(() => {
            uni.showToast({
              title: '修改成功',
              mask: true
            })
            setTimeout(() => {
              this.handlerUpdateSuccess();
            }, 1500)
          }, this.$toastDelay)
        }, err => {
          this.confirmLock = false;
        })
      })
    },
    handlerUpdateSuccess() {
      if(this.enterPage == 'me') {
        uni.navigateBack();
      } else {
        uni.reLaunch({
          url: '/pages/index/index'
        })
      }
    },

    
    goToIndex() {
      uni.reLaunch({
        url: '/pages/index/index'
      })
    },
  }
}
</script>
<style lang="scss" scoped>
@import 'perfect-info.scss';
</style>