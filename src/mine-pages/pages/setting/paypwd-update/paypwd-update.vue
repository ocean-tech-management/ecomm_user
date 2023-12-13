<template>
  <view>    
    <view class="page-forms">
      <view class="page-form-item">
        <label for="old_pay_pwd" class="page-label">旧密码</label>
        <input id="old_pay_pwd" class="page-input" type="number" :password="true" maxlength="6" placeholder="请输入旧密码" v-model="formData.old_pay_pwd"/>
      </view>
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
      确认修改
    </view>


  </view>
</template>
<script>
import md5 from 'md5';
export default {
  data() {
    return {
      formData: {
        old_pay_pwd: '',
        pay_pwd: '',
        rePwd: ''
      }
    }
  },
  methods: {
    confirmSetting() {
      
      let params = {
        uid: uni.getStorageSync('userInfo').uid,
        old_pay_pwd: this.formData.old_pay_pwd,
        pay_pwd: this.formData.pay_pwd,
        rePwd: this.formData.rePwd
      }

      if(!params.old_pay_pwd || params.old_pay_pwd === '') {
        return uni.showModal({
            title: '提示',
            content: '请填写旧密码',
            showCancel: false
          });
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
      
      params.old_pay_pwd = md5(params.old_pay_pwd);
      params.pay_pwd = md5(params.pay_pwd);
      params.rePwd = md5(params.rePwd);

      this.$post('/user/updatePayPwd', params, res => {
        setTimeout(() => {
          uni.showToast({
            title: '修改密码成功',
            mask: true
          })
          setTimeout(() => {
            uni.navigateBack();
          }, 1500)
        }, this.$toastDelay)
        
          
      })

    }
  }
}
</script>
<style lang="scss" scoped>
  @import 'paypwd-update.scss';
</style>