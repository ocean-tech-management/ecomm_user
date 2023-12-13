<template>
  <view>    
    <view class="page-forms">
      <view class="page-form-item">
        <label for="sync_phone" class="page-label">手机号码</label>
        <input id="sync_phone" class="page-input" type="number" maxlength="11" placeholder="请输入手机号码" v-model="formData.sync_phone"/>
      </view>
      <view class="page-form-item">
        <label for="sync_pwd" class="page-label">登陆密码</label>
        <input id="sync_pwd" class="page-input" type="number" :password="true" maxlength="6" placeholder="请输入登陆密码" v-model="formData.sync_pwd"/>
      </view>
      <view class="page-form-item">
        <label for="code" class="page-label">验证码</label>
        <input id="code" class="page-input" type="number" maxlength="4" placeholder="请输入验证码" v-model="formData.code"/>
        <view class="code-btn" @click="codeBtn">{{codeTime}}</view>
      </view>
    </view>
    

    <view class="page-ctrl" @tap="confirmSync">
      确认同步
    </view>


  </view>
</template>
<script>
import md5 from 'md5';
export default {
  data() {
    return {
      formData: {
        sync_phone: '',
        sync_pwd: '',
        code: ''
      },

      couldSend: true,
      codeTime: "获取验证码",
      codeInterval: null,
    }
  },
  methods: {
    
    // 验证码获取点击事件
    codeBtn() {
      this.$nextTick(() => {
        let phone = this.formData.sync_phone;
        // 倒计时时间
        let currentTime = 60;
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
          phone: phone
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

    confirmSync() {
      
      let params = {
        openid: uni.getStorageSync('userInfo').openid,
        sync_phone: this.formData.sync_phone,
        sync_pwd: this.formData.sync_pwd,
        code: this.formData.code
      }

      if(!params.sync_phone || params.sync_phone === '') {
        return uni.showModal({
          title: '提示',
          content: '请填写主账号手机号码',
          showCancel: false
        });
      }
      if(!params.sync_pwd || params.sync_pwd === '') {
        return uni.showModal({
            title: '提示',
            content: '请填写登陆密码',
            showCancel: false
          });
      }
      if(!params.code || params.code === '') {
        return uni.showModal({
            title: '提示',
            content: '请填写验证码',
            showCancel: false
          });
      }

      params.sync_pwd = md5(params.sync_pwd);
      
      this.$post('/user/syncOtherAppUser', params, res => {
        setTimeout(() => {
          uni.showToast({
            title: '同步成功',
            mask: true,
            duration: 2500
          })
          setTimeout(() => {
            const _thirdEnv = uni.getStorageSync('_thirdEnv');

            uni.clearStorageSync();
            let storageTrigger = {
              address: false,
              shopcar: false,
              userType: false
            }
            uni.setStorageSync('storageTrigger', storageTrigger);

            // #ifdef H5
            if(_thirdEnv) uni.setStorageSync('_thirdEnv', _thirdEnv);  //设置第三方环境
            // #endif


            uni.reLaunch({
              url: '/pages/index/index'
            })
          }, 2500)
        }, this.$toastDelay)
        
          
      })

    }
  }
}
</script>
<style lang="scss" scoped>
  @import 'sync-main-account.scss';
</style>