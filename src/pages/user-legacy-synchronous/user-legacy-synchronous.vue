<template>
  <view class="flex-page">
    <view>
      <view class="tabs">
        <view :class="'tab ' + (tabIndex == 0 ? 'active' : '')" data-id="0" @tap="tabIndex = 0">
          用户ID同步
        </view>
        <view :class="'tab ' + (tabIndex == 1 ? 'active' : '')" data-id="1" @tap="tabIndex = 1">
          手机号同步
        </view>
        <view :class="'tab ' + (tabIndex == 2 ? 'active' : '')" data-id="2" @tap="tabIndex = 2">
          支付密码同步
        </view>
      </view>
    </view>
    <view class="tab-page">
      <view class="form">
        <block v-if="tabIndex == 0">
          <view class="form-item">
            <input v-model="loginInfo.user_share_id" class="form-input" type="text" placeholder="请输入用户ID"/>
          </view>
          <view class="form-tips">
            请到已有用户的个人中心里获取用户ID
          </view>
          <view class="form-item">
            <input v-model="loginInfo.pwd" class="form-input" placeholder="请输入登录密码" maxlength="18" type="password"/>
          </view>
        </block>
        <block v-if="tabIndex == 1">
          <view class="form-item">
            <input v-model="loginInfo.phone" class="form-input" placeholder="请输入手机号" maxlength="11"/>
          </view>
          <view class="form-item">
            <input v-model="loginInfo.phone_code" class="form-input" placeholder="请输入验证码" maxlength="4"/>
            <view class="code-btn" @click="codeBtn">{{codeTime}}</view>
          </view>
          <view class="form-item">
            <input v-model="loginInfo.pwd" class="form-input" placeholder="请输入登录密码" maxlength="18" type="password"/>
          </view>
        </block>
        <block v-if="tabIndex == 2">
          <view class="form-item">
            <input v-model="loginInfo.pay_share_id" class="form-input" type="text" placeholder="请输入用户ID" />
          </view>
          <view class="form-tips">
            请到已有用户的个人中心里获取用户ID
          </view>
          <view class="form-item">
            <input v-model="loginInfo.pay_pwd" class="form-input" placeholder="请输入支付密码" type="number" maxlength="6" password/>
          </view>
        </block>
        <view class="login-btn" @tap="goToLogin">
          同步
        </view>
      </view>
    </view>
  </view>
</template>
<script>
export default {
  data() {
    return {
      enterType: 1, // 1-首页登录 2-个人页-用户同步
      tabIndex: 0, // 0-用户ID登录 1-手机号登录 2-支付密码登录
      userInfo: {},
      loginInfo: {
        user_share_id: '', // 用户ID登录-share_id
        pay_share_id: '', // 支付密码登录-share_id
        phone: '',
        phone_code: '',
        pay_pwd: '',
        pwd: ''
      },
      verify: [['user_share_id', 'pwd'], ['phone', 'phone_code', 'pwd'], ['pay_share_id', 'pay_pwd']],
      // 手机验证
      couldSend: true,
      codeTime: "获取验证码",
      codeInterval: null,

      loading: false,

      h5SignData: {}, // 微信数据包
    }
  },
  onLoad(options) {
    this.enterType = options.type
    this.userInfo = uni.getStorageSync('userInfo');
    this.h5SignData = uni.getStorageSync('h5SignData');
  },
  onUnload() {
    if(this.codeInterval) clearInterval(this.codeInterval);
  },
  watch: {
    tabIndex() {
      this.loginInfo.pwd = ''
      this.loginInfo.pay_pwd = ''
    }
  },
  methods: {
    // 验证码获取点击事件
    codeBtn() {
      this.$nextTick(() => {
        let phone = this.loginInfo.phone;
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
          phone: this.loginInfo.phone
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
    verifyLogin(callback) {
      let loginInfo = this.loginInfo
      for (const i of this.verify[this.tabIndex]) {
        if (loginInfo[i] == undefined || loginInfo[i] == null || loginInfo[i] === '') {
          return uni.showModal({
            title: '提示',
            content: '请填写完所有信息哦',
            showCancel: false
          });
        }
      }
      if (this.tabIndex === 2) {
        if(loginInfo.pay_pwd.length != 6) {
          return uni.showModal({
            title: '提示',
            content: '支付密码长度为6位，请检查',
            showCancel: false
          });
        } else if (!/^[0-9]*$/.test(loginInfo.pay_pwd)) {
          return uni.showModal({
            title: '提示',
            content: '密码格式有误，必须是数字格式',
            showCancel: false
          });
        }
      } else {
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
      }
      callback && callback()
    },
    // 登录
    goToLogin() {
      this.verifyLogin(() => {
        const params = {
          type: this.tabIndex + 1
        };
        this.verify[this.tabIndex].forEach(e => {
          const name = e.match('share_id') ? 'share_id' : e
          params[name] = this.loginInfo[e];
        });
        //#ifdef H5
        if (this.enterType == 1) {
          // 首页登录
          params['bind_type'] = 1
          params['wx_data'] = this.h5SignData
          if (this.h5SignData.openid) params['openid'] = this.h5SignData.openid; // 当前账号的open_id
        } else if (this.enterType == 2) {
          params['platform'] = 'h5'; // 平台类型 传固定值：h5
          params['h5_share_id'] = this.userInfo.share_id; // 当前账号的share_id
          params['h5_openid'] = this.userInfo.openid; // 当前账号的open_id
        }
        //#endif
        if (this.userInfo.openid) params['openid'] = this.userInfo.openid; // 当前账号的open_id
        this.$post('/authPlayForm/loginType', params, res => {
          this.loading = false
          setTimeout(() => {
            uni.showToast({
              title: '同步成功',
              mask: true
            })
            setTimeout(() => {
              // #ifndef H5
              uni.reLaunch({
                url: '/pages/auth/auth?share_id=' + res.data.share_id
              });
              // #endif
              //#ifdef H5
              const info = res.data || {};
              const user = JSON.parse(JSON.stringify(this.userInfo));
              // 更新个人信息 uid avatarUrl等
              Object.keys(info).forEach(e => {
                if (user[e]) user[e] = info[e];
              })
              uni.setStorageSync('userInfo', user);
              uni.reLaunch({
                url: '/pages/index/index'
              })
              //#endif
            }, 1800)
          }, this.$toastDelay)
        }, rej => {
          if (rej.data.error_code === 8001) {
            if (this.userInfo.need_auth) {
              // 未登录
              uni.showModal({
                title: '提示',
                content: rej.data.msg,
                confirmText: '新用户',
                success: res => {
                  if(res.confirm) {
                    // #ifndef H5
                    uni.reLaunch({
                      url: '/pages/auth/auth'
                    })
                    // #endif
                    //#ifdef H5
                    uni.reLaunch({
                      url: '/pages/index/index'
                    })
                    //#endif
                  }
                }
              })
            } else {
              // 已登录
              uni.showModal({
                title: '提示',
                content: rej.data.msg,
                showCancel: false
              })
            }
          } else {
            uni.showModal({
              content: rej.data.msg,
              showCancel: false
            })
          }
        }, true);
      })
    }
  }
}
</script>
<style lang="scss">
@import "user-legacy-synchronous";
</style>