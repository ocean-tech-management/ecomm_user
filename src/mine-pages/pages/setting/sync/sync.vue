<template>
  <view class="uni-common-pb-withbtn">
    <view class="form">    
      <view class="form-item">
        <view class="form-label">用户姓名</view>
        <view class="form-input static">{{userInfo.name}}</view>
      </view>
      <view class="form-item">
        <view class="form-label">手机号码</view>
        <input class="form-input" placeholder="请填写" maxlength="11" v-model="userInfo.phone"/>
      </view>
      
      <view class="form-item">
        <view class="form-label">验证码</view>
        <input class="form-input" placeholder="请填写" maxlength="4" v-model="userInfo.code"/>
        <view class="code-btn" @click="codeBtn">{{codeTime}}</view>
      </view>

    
    </view>
 
    <view class="bottom-btns">
      <view class="bottom-btn" @tap="trySync">
        同步老用户
      </view>
    </view>
  </view>

</template>

<script>
export default {
  data() {
    return {
      userInfo: {
        name: '',
        phone: '',
        code: ''
      },
      
      couldSend: true,
      codeTime: "获取验证码",
      codeInterval: null
    }
  },
  onShareAppMessage() {
    let shareInfo = this.$getShareInfo();
    return shareInfo;
  },
  onLoad(options) {

    let userInfo = uni.getStorageSync('userInfo');

    this.userInfo = {
      uid: userInfo.uid,
      name: userInfo.name || '',
      phone: userInfo.phone || '',
      code: ''
    }
  },
  onUnload() {
    if(this.codeInterval) clearInterval(this.codeInterval);
  },
  methods: {
    
    // 验证码获取点击事件
    codeBtn: function(e) {
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

    },
    
    trySync: function() {
      let params = JSON.parse(JSON.stringify(this.userInfo));
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
      this.$post('/user/sync', params, res => {
        setTimeout(() => {
          uni.showToast({
            title: '修改成功',
            mask: true
          })
        }, this.$toastDelay)
        setTimeout(()=> {
          uni.showToast({
            title: '同步成功重启中',
            mask: true
          })
          setTimeout(() => {
            uni.reLaunch({
              url: '/pages/index/index'
            });
          }, 1500)
        }, 1800)
      })
    },

    
  }
}
</script>

<style lang="scss" scoped>
  @import 'sync.scss';
  .form {
    padding-top: 20rpx;
  }
  .form-input {
    width: 100%;
    height: 2em;
    line-height: 2em;
  }
</style>