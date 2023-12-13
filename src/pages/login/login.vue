<template>
  <view class="flex-page">
    <view :class="['login-page', shortScreen && loginType == 2 ? 'login-page-scroll' : '']">
      <image class="page-logo" src="/static/images/logo.png"></image>
      <block v-if="loginType == 1">
        <view class="login-select">
          <view :class="['login-select-item', active == 1 ? 'active' : '']" @tap="toggleActive(1)">密码登录</view>
          <view :class="['login-select-item', active == 2 ? 'active' : '']" @tap="toggleActive(2)">验证码登录</view>
        </view>
        <view class="login-page-content">
          <label for="phone" class="login-input-item">
            <view class="login-input-title">手机号</view>
            <input id="phone" class="login-input" maxlength="11" type="digit" placeholder="请输入手机号"
              v-model="formData.phone" @confirm="tryLogin" />
          </label>
          <label v-if="active == 1" for="pwd" class="login-input-item">
            <view class="login-input-title">密码</view>
            <input id="pwd" class="login-input" maxlength="18" type="password" placeholder="请输入密码" v-model="formData.pwd"
              @confirm="tryLogin" />
          </label>
          <label v-if="active == 2" for="pwd" class="login-input-item">
            <view class="login-input-title">验证码</view>
            <view class="form-code">
              <input v-model="formData.phone_code" class="login-input" placeholder="请输入验证码" maxlength="4"
                @confirm="tryLogin" />
              <view class="code-btn" @click="codeBtn">{{ codeTime }}</view>
            </view>
          </label>
          <view class="login-ctrls">
            <view class="login-ctrl" @tap="tryLogin">登陆</view>
          </view>
        </view>
        <view class="login-new" @tap.stop="toggleType(2)">我是新用户</view>
      </block>
      <block v-if="loginType == 2">
        <view class="login-page-content">
          <label for="phone" class="login-input-item">
            <view class="login-input-title">手机号</view>
            <input id="phone" class="login-input" maxlength="11" type="digit" placeholder="请输入手机号"
              v-model="formData.phone" @confirm="tryLogin" />
          </label>
          <label for="pwd" class="login-input-item">
            <view class="login-input-title">验证码</view>
            <view class="form-code">
              <input v-model="formData.phone_code" class="login-input" placeholder="请输入验证码" maxlength="4"
                @confirm="tryLogin" />
              <view class="code-btn" @click="codeBtn">{{ codeTime }}</view>
            </view>
          </label>
          <label for="pwd" class="login-input-item">
            <view class="login-input-title">密码</view>
            <input id="pwd" class="login-input" maxlength="18" type="password" placeholder="请输入密码" v-model="formData.pwd"
              @confirm="tryLogin" />
          </label>
          <label for="pwd" class="login-input-item">
            <view class="login-input-title">确认密码</view>
            <input id="pwd" class="login-input" maxlength="18" type="password" placeholder="请输入密码"
              v-model="formData.re_pwd" @confirm="tryLogin" />
          </label>
          <label for="name" class="login-input-item">
            <view class="login-input-title">昵称</view>
            <input id="name" class="login-input" type="text" placeholder="请输入昵称" v-model="formData.name"
              @confirm="tryLogin" />
          </label>
          <label class="login-input-item">
            <view class="login-input-title">头像</view>
            <view v-if="!formData.avatarUrl" class="picture-uploader" @tap="uploadPicture">
              <image class="picture-uploader-icon" src="/static/images/default_avatar_1.png"></image>
            </view>
            <view v-else-if="formData.avatarUrl" class="return-picture-item">
              <view class="return-picture-box">
                <image class="return-picture" :src="formData.avatarUrl" mode="widthFix"></image>
              </view>
              <view class="return-picture-delete-box" @tap="deletePicture">
                <image class="return-picture-delete" src="/static/images/delddre.png"></image>
              </view>
            </view>
          </label>
          <view class="login-ctrls">
            <view class="login-ctrl" @tap="tryLogin">登陆</view>
          </view>
        </view>
        <view class="login-new" @tap.stop="toggleType(1)">我是老用户</view>
      </block>
    </view>
  </view>
</template>

<script>
import { JSEncrypt } from 'jsencrypt';
import util from '@/common/util';
export default {
  data() {
    return {
      shortScreen: false, // 短屏幕  兼容注册时的样式

      isCanLogin: true, // 是否允许登录
      loginType: 1, // 1-登录 2-注册
      active: 1,
      formData: {},
      // 手机验证
      couldSend: true,
      codeTime: "获取验证码",
      codeInterval: null,

      // 登录错误次数，当前页面生命周期内，连续错5次，禁止登录10分钟
      loginErrorTimeOut: null,
      loginErrorValues: 0,
    }
  },
  onLoad() {
    // #ifdef APP-PLUS
    if (uni.getStorageSync('login')) {
      this.active = 1
      this.formData = uni.getStorageSync('login').formData || {avatarUrl: ''};
      this.loginType = uni.getStorageSync('login').type || 1;
    }
    // #endif
  },
  onShow() {
    if (this.loginErrorTimeOut) clearTimeout(this.loginErrorTimeOut)
    let systemInfo = uni.getStorageSync('systemInfo');
    if(!systemInfo) {
      uni.getSystemInfo({
        success: res => {
          if(res.errMsg == 'getSystemInfo:ok') {
            systemInfo = res;
            systemInfo.isShort = systemInfo.windowWidth / systemInfo.windowHeight < 0.6 ? false : true;
            this.shortScreen = systemInfo.windowHeight < 896 ? true : false;
            uni.setStorageSync('systemInfo', systemInfo);
          }
        }
      })
    } {
      this.shortScreen = uni.getStorageSync('systemInfo').windowHeight < 896;
    }
  },
  onHide() {
    // #ifdef APP-PLUS
    const loginVO = uni.getStorageSync('login') || {};
    loginVO.formData = this.formData;
    uni.setStorageSync('login', loginVO)
    // #endif
    if(this.loginErrorTimeOut) clearTimeout(this.loginErrorTimeOut);
  },
  onUnload() {
    // #ifdef APP-PLUS
    const loginVO = uni.getStorageSync('login') || {};
    loginVO.formData = this.formData;
    uni.setStorageSync('login', loginVO)
    // #endif
    if(this.loginErrorTimeOut) clearInterval(this.loginErrorTimeOut);
  },
  methods: {
    // 切换登录/注册
    toggleType(type) {
      this.active = 1
      this.formData = {}
      this.loginType = type;
      // #ifdef APP-PLUS
      const loginVO = uni.getStorageSync('login') || {};
      loginVO.type = type;
      loginVO.formData = {};
      this.formData.phone = '';
      this.formData.pwd = '';
      this.formData.phone_code = '';
      this.formData.phone_code = '';
      this.formData.pwd = '';
      this.formData.re_pwd = '';
      this.formData.name = '';
      this.formData.avatarUrl = '';
      uni.setStorageSync('login', loginVO)
      // #endif
    },
    // 切换登录方式
    toggleActive(type) {
      this.active = type
      this.formData = {}
    },
    tryLogin() {
      this.verifyLogin(() => {
        this.handleLogin()
      })
    },
    // 注册/登录
    handleLogin() {
      if (!this.isCanLogin) {
        return uni.showModal({
          title: '提示',
          content: '您的信息输入有误，等10分钟后再重试',
          showCancel: false
        });
      }
      const url = this.loginType == 1 ? '/wx/webLogin' : '/wx/webRegister';
      const params = {
        ...this.formData,
      }
      if (this.loginType == 1) params.type = this.active;
      if (params.pwd) params.pwd = this.encrypt(params.pwd);
      if (params.re_pwd) params.re_pwd = this.encrypt(params.re_pwd);
      this.$post(url, params, res => {
        if(res.data && res.data.uid) {
          uni.setStorageSync('userInfo', res.data);
          uni.setStorageSync('token', {
            token: res.data.token,
            time: new Date().getTime()
          })
        }
        uni.reLaunch({
          url: '/pages/index/index'
        });
      }, rej => {
        const data = rej.data
        if (this.loginErrorValues > 5) {
          // 疑似撞库行为
          this.isCanLogin = false
          this.loginErrorTimeOut = setTimeout(() => {
            this.isCanLogin = true
          }, 600000)
        }
        console.log(this.loginErrorValues)
        if (data.error_code === 14001) this.loginErrorValues++
      })
    },
    // 登录验证
    verifyLogin(callback) {
      let loginInfo = this.formData;
      const verify =
          this.loginType == 1 ?
              this.active == 1 ? ['phone', 'pwd'] :
                  ['phone', 'phone_code'] :
              ['phone', 'phone_code', 'pwd', 're_pwd', 'name', 'avatarUrl'];
      for (const i of verify) {
        if (loginInfo[i] == undefined || loginInfo[i] == null || loginInfo[i] === '') {
          return uni.showModal({
            title: '提示',
            content: '请填写完所有信息哦',
            showCancel: false
          });
        }
      }
      if(loginInfo.phone && !/^1[3456789]\d{9}$/.test(loginInfo.phone)) {
        return uni.showModal({
          title: '提示',
          content: '手机号格式有误，请检查',
          showCancel: false
        });
      }
      if ((this.loginType == 1 && this.active == 1) || this.loginType == 2) {
        if(loginInfo.pwd.length < 4) {
          return uni.showModal({
            title: '提示',
            content: '密码长度过短，请输入4-18位密码',
            showCancel: false
          });
        }
        if(loginInfo.pwd.length > 18) {
          return uni.showModal({
            title: '提示',
            content: '密码长度过长，请输入4-18位密码',
            showCancel: false
          });
        }
        if(!/^[a-zA-Z0-9]*$/.test(loginInfo.pwd)) {
          return uni.showModal({
            title: '提示',
            content: '密码格式有误，必须是大小写字母或数字',
            showCancel: false
          });
        }
        if (this.loginType == 2 && (loginInfo.pwd != loginInfo.re_pwd)) {
          return uni.showModal({
            title: '提示',
            content: '确认密码与密码不一致，请重新确认',
            showCancel: false
          });
        }
      }
      callback && callback()
    },
    // 上传头像
    uploadPicture () {
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
          this.uploadAvatar(path)
        }
      });
    },
    /**
     * 上传头像
     * @param {Object} path
     */
    uploadAvatar(path) {
      uni.uploadFile({
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
            this.formData.avatarUrl = res.data;
            this.$set(this.formData, 'avatarUrl', res.data);
            this.$forceUpdate();
            uni.showToast({
              title: '上传头像成功',
              mask: true
            })
          } else {
            console.log(res.msg);
            uni.showModal({
              title: '提示',
              content: res.msg || '上传失败请重试',
              showCancel: false
            })
          }
        },
        fail: err => {
          console.log(err)
          uni.showToast({
            title: '上传失败请重试',
            icon: 'none'
          })
        }
      });
    },
    // 删除图片
    deletePicture() {
      this.$set(this.formData, 'avatarUrl', '')
    },
    // 验证码获取点击事件
    codeBtn() {
      this.$nextTick(() => {
        let phone = this.formData.phone;
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
          phone: this.formData.phone
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
    // 加密
    encrypt(pwd) {
      const publicKey = 'MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQC8T8oNn3oXHon7IOPHBxxq8peAAp/4n4YvrOhcltVsfuJ6uW+3TkpwPHWX65e1TIJh3+562YbkzjUH4l/oU7Nt1qKwGrihQLglTjYf9T5A5sA8KeP2WModKudMBUSr+x4gxp9dS4zsi3wbIQh5sxjPgi1exVOu9dVjzdtEGntKewIDAQAB';
      const encryptor = new JSEncrypt();
      encryptor.setPublicKey(publicKey);
      return encryptor.encrypt(pwd)
    },
    decrypt(ipwd) {
      const privateKey = 'MIICdQIBADANBgkqhkiG9w0BAQEFAASCAl8wggJbAgEAAoGBALxPyg2fehceifsg48cHHGryl4ACn/ifhi+s6FyW1Wx+4nq5b7dOSnA8dZfrl7VMgmHf7nrZhuTONQfiX+hTs23WorAauKFAuCVONh/1PkDmwDwp4/ZYyh0q50wFRKv7HiDGn11LjOyLfBshCHmzGM+CLV7FU6711WPN20Qae0p7AgMBAAECgYBUnWWlCWvKx6YoeXbgD4ntZGQ+2O8YwFWDRqaCNCRiRAFwM7LHIx6/n+sXAH2CsYZEhGKcQPIkDaQ2jrmZo0KT6URls0UR/5otAkFbp0zchGxaYUlZP6ZBUXFLJ0bd8dg6T/Lg+JApEfLbXBzp4A8entdIqXeYkx7CQyFES4N8AQJBAPo6yt5iL//Q1MxRF+HQOhyDDUq5HMqg4Rfy32/b7FaTSOgk9dNb/U6HdNhbVNUVna0V/XWQawzuJo1eQAq7uDsCQQDAp3hCbwQYQJJmFx+B3WgS+hTP+U+RFhncISwKKO3ihiXCZ+WYup8901w53FBcKS2tZgqUrlBnjYwZ3AVpL9LBAkBSNlbI0cGrbtU7e7k4+8zb6ULItiD7gffygl1exwbTOvjNLLeHhcWns2F0ZC1vBPcVExB/O7+wM95+u+SWoi5ZAkAm+Hl6LszMPxueLSVBdtEbrZzSKSNwPOFERy2KbJcaUHqI5c1q5K1bq0qnpapXyjikL9UKGGzJVbe2b2xkx7jBAkA+D58i6Qw9JQpVmp6+Ssi3h1N7rtUsnIRyS6iPZ/FSrdf3ed+pSi1uSJ1cRTKDr7sbL+S+ndLP08eWHTraCyo4';
      const encryptor = new JSEncrypt();
      encryptor.setPrivateKey(privateKey);
      return encryptor.decrypt(ipwd);
    }
  }
}
</script>

<style lang="scss" scoped>
@import 'login.scss';
</style>