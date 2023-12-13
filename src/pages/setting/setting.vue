<template>
  <view class="uni-common-pb-withbtn">
    <view class="form">
      <view class="form-item">
        <view class="form-label">用户姓名</view>
        <input class="form-input" type="text" placeholder="请填写" maxlength="8" :value="userInfo.name"
          @input="updateName" />
      </view>
      <!-- #ifndef H5 -->
      <!-- 非h5，走平台授权 -->
      <view class="form-item" @tap="tryShowPhonePopup">
        <view class="form-label">手机号码</view>
        <view class="form-input static">{{ userInfo.phone || '点击此处填写' }}</view>
      </view>
      <!-- #endif -->

      <!-- #ifdef H5 -->
      <view class="form-item">
        <view class="form-label">手机号码</view>
        <input class="form-input" placeholder="请填写" maxlength="11" v-model="userInfo.phone" />
      </view>
      <view class="form-item">
        <view class="form-label">验证码</view>
        <input class="form-input" placeholder="请填写" maxlength="4" v-model="userInfo.code" />
        <view class="code-btn" @click="codeBtn">{{ codeTime }}</view>
      </view>
      <!-- #endif -->


      <!-- <view v-if="originPhone" class="form-item">
        <view class="form-label">手机号码</view>
        <view class="form-input static">{{userInfo.phone}}</view>
      </view>
      <view v-if="!originPhone" class="form-item">
        <view class="form-label">手机号码</view>
        <input class="form-input" type="number" placeholder="请填写" maxlength="11" :value="userInfo.phone" @input="updatePhone"/>
      </view> -->
      <!-- <view class="form-item">
        <view class="form-label">当前关联人</view>
        <view class="form-input">{{link_uid}}</view>
      </view> -->
      <!-- <view class="form-item">
        <view class="form-label">所在住址</view>
        <input class="form-input" type="text" placeholder="请填写" maxlength="32" :value="userInfo.address" @input="updateAddress"/>
      </view> -->

    </view>

    <view v-if="showPhonePopup" class="ask-phone-popup">
      <view class="ask-phone-mask" @tap="showPhonePopup = false"></view>
      <view class="ask-phone-content">
        <view class="ask-phone-title">请授权获取您的微信绑定手机号码</view>
        <button class="ask-phone-btn" open-type="getPhoneNumber" @getphonenumber="getUserPhone">
          授权
        </button>
      </view>
    </view>


    <view class="bottom-btns">
      <view class="bottom-btn" @tap="updateInfo">
        确认修改
      </view>
    </view>
    <!-- #ifdef MP-WEIXIN -->
    <privacy-popup ref="privacyComponent"></privacy-popup>
    <!-- #endif -->
  </view>
</template>

<script>
import config from '@/config';
export default {
  data() {
    return {
      fromVipRule: false,
      userInfo: {
        name: '',
        phone: '',
        address: '',
        // #ifdef H5
        code: '',
        // #endif
      },
      originPhone: null,

      couldSend: true,
      codeTime: "获取验证码",
      codeInterval: null,

      systemName: '系统',
      showPhonePopup: false,

      link_uid: '',
      wxCode: ''
    }
  },
  onShareAppMessage() {
    let shareInfo = this.$getShareInfo();
    return shareInfo;
  },
  onLoad(options) {

    this.systemName = config.name;

    this.link_uid = uni.getStorageSync('link_uid') || '';

    let userInfo = uni.getStorageSync('userInfo');
    this.fromVipRule = uni.getStorageSync('fromVipRule');
    uni.removeStorageSync('fromVipRule');

    this.userInfo = {
      uid: userInfo.uid,
      name: userInfo.name || '',
      phone: userInfo.phone || '',
      address: userInfo.address || '',
      // #ifdef H5
      code: '',
      // #endif
    }
    this.originPhone = userInfo.phone || null;
  },
  onUnload() {
    if(this.codeInterval) clearInterval(this.codeInterval);
  },
  methods: {
    tryShowPhonePopup() {
      if(this.userInfo.phone) return;
      uni.login({
        success: res => {
          let wechat = res;
          this.wxCode = wechat.code;
        }
      });
      config.getPrivacy(() => {
        this.showPhonePopup = true;
      }, this)
    },

    // #ifdef H5

    // 验证码获取点击事件
    codeBtn() {
      this.$nextTick(() => {
        var phone = this.userInfo.phone;
        // 倒计时时间
        var currentTime = 60;
        // 倒计时期间不执行下步
        if (!this.couldSend) return;
        // 判断手机号码是否符合条件
        if (!(/^1[3456789]\d{9}$/.test(phone))) {
            return uni.showModal({
                    title: '提示',
                    content: '手机号码有误，请检查哦',
                    showCancel: false
                  });
        }

        let params = {
          phone: this.userInfo.phone
        }

        this.$get('/login/code', params, res => {
          setTimeout(() => {
            uni.showToast({
              title: '发送成功',
              icon: 'success',
              mask: true
            })
            // 倒计时
            this.codeInterval = setInterval(() => {
                currentTime--;
                this.codeTime = currentTime + "秒";
                this.couldSend = false;
                if (currentTime <= 0) {
                    if(this.codeInterval) clearInterval(this.codeInterval);
                    this.codeTime = "重新发送";
                    this.couldSend = true;
                }
            }, 1000)
          }, 150);
        })

      })

    },
    // #endif


    updateInfo: function() {
      let params = JSON.parse(JSON.stringify(this.userInfo));
      if(params.phone == this.originPhone) {
        delete(params.phone);
        // #ifdef H5
        delete(params.code);
        // #endif
      }
      // 不提交地址
      delete(params.address);
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
      if(params.phone && !/^1[3456789]\d{9}$/.test(params.phone)) {
        return uni.showModal({
                title: '提示',
                content: '手机号码有误，请检查哦',
                showCancel: false
              });
      }
      this.$post('/user/update', params, res => {
        setTimeout(() => {
          uni.showToast({
            title: '修改成功',
            mask: true
          })
        }, this.$toastDelay)
        setTimeout(()=> {
          if(!this.fromVipRule) {
            uni.switchTab({
              url: '/pages/me/me',
              success: res => {}
            })
          } else {
            let userInfo = uni.getStorageSync('userInfo');
            if(res.data.changeUser) {
              // 同步了数据
              userInfo = res.data.userInfo;
              //#ifdef H5
              userInfo.real_uid = userInfo.uid;
              if(userInfo.primary_uid) userInfo.uid = userInfo.primary_uid; //同步过，改写uid
              // #endif
              userInfo.change = true;
            } else {
              userInfo.phone = this.userInfo.phone;
            }
            uni.setStorageSync('userInfo', userInfo);
            uni.navigateBack();
          }

        }, 1800)
      })
    },
    updateName: function(e) {
      this.userInfo.name = e.detail.value;
    },
    updatePhone: function(e) {
      this.userInfo.phone = e.detail.value;
    },
    updateAddress: function(e) {
      this.userInfo.address = e.detail.value;
    },

    getUserPhone(info) {
      this.showPhonePopup = false;
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
          }
        })

      }
    }

  }
}
</script>

<style lang="scss" scoped>
@import 'setting.scss';

.form {
  padding-top: 20rpx;
}

.form-input {
  width: 100%;
  height: 2em;
  line-height: 2em;
}
</style>