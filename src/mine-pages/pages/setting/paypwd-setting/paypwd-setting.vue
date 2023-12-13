<template>
  <view>    
    <view class="page-forms">
      <view class="page-form-item">
        <label for="pay_pwd" class="page-label">设置支付密码</label>
        <input id="pay_pwd" class="page-input" type="number" :password="true" maxlength="6" placeholder="请输入支付密码" v-model="formData.pay_pwd"/>
      </view>
      <view class="page-form-item">
        <label for="rePwd" class="page-label">确认支付密码</label>
        <input id="rePwd" class="page-input" type="number" :password="true" maxlength="6" placeholder="请再次输入支付密码" v-model="formData.rePwd"/>
      </view>
    </view>
    

    <view class="page-ctrl" @tap="confirmSetting">
      确认添加
    </view>


  </view>
</template>
<script>
import md5 from 'md5';
export default {
  data() {
    return {
      formData: {
        pay_pwd: '',
        rePwd: ''
      }
    }
  },
  methods: {
    confirmSetting() {
      
      let params = {
        uid: uni.getStorageSync('userInfo').uid,
        pay_pwd: this.formData.pay_pwd,
        rePwd: this.formData.rePwd
      }

      if(!params.pay_pwd || params.pay_pwd === '') {
        return uni.showModal({
            title: '提示',
            content: '请填写支付密码',
            showCancel: false
          });
      }
      if(!params.rePwd || params.rePwd === '') {
        return uni.showModal({
            title: '提示',
            content: '请填写确认支付密码',
            showCancel: false
          });
      }
      if(params.pay_pwd != params.rePwd) {
        return uni.showModal({
            title: '提示',
            content: '两次支付密码不一致',
            showCancel: false
          });
      }
      if(params.pay_pwd.length != 6) {
        return uni.showModal({
            title: '提示',
            content: '支付密码长度为6位，请检查',
            showCancel: false
          });
      }
      if(!/^[0-9]*$/.test(params.pay_pwd)) {
        return uni.showModal({
            title: '提示',
            content: '密码格式有误，必须是数字格式',
            showCancel: false
          });
      }

      params.pay_pwd = md5(params.pay_pwd);
      params.rePwd = md5(params.rePwd);
      
      this.$post('/user/updatePayPwd', params, res => {
        setTimeout(() => {
          uni.showToast({
            title: '设置密码成功',
            mask: true
          })
          setTimeout(() => {
            uni.setStorageSync('hasUpdatePayPwd', 1);
            uni.navigateBack();
          }, 1500)
        }, this.$toastDelay)
        
          
      })

    }
  }
}
</script>
<style lang="scss" scoped>
  @import 'paypwd-setting.scss';
</style>