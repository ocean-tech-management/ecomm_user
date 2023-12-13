<template>
  <view class="flex-page">
    <view class="flex-page-content">
      <view class="balance">
        <view class="balance-val">
          <text class="balance-val-sign">￥</text>
          <text>{{userInfo.crowd_balance}}</text>
        </view>
        <view class="balance-title">当前余额 元</view>
      </view>

      <view class="withdraw-content">

        <view class="withdraw-content-box">
          <view class="withdraw-title-box">
            <view class="withdraw-title">选择预购金额</view>
          </view>
          <view class="withdraw-selects">
            <view 
              v-for="(item, index) in quiklySelectOptions" 
              class="withdraw-select" 
              :class="{'active': quicklySelectIndex == index}"
              :key="index" 
              @tap="quicklyUpdatePrice(index)"
            >
              {{item.title}}
              <image v-if="quicklySelectIndex == index" class="withdraw-icon" src="/static/images/item_select.png"></image>
            </view>
          </view>
        </view>

        
       
          
        <view class="pay-btn" @tap="tryActions">
          确定预购
        </view>

        <view style="height: 10rpx;"></view>

      </view>
    </view>

    <!-- 支付密码 -->
    <view v-if="showPayPwdPopup" class="pay-popup">
      <view class="pay-popup-mask"></view>
      <view class="pay-popup-wrapper">
        <view class="pay-popup-content">
          <view class="pay-popup-title">请输入支付密码</view>
          <view class="pay-popup-input-box">
            <input class="pay-popup-input" type="number" maxlength="6" :password="true" v-model="pay_pwd" @input="updatePayPwd"/>
          </view>
        </view>
      </view>
    </view>
    <!-- 验证码弹窗 -->
    <view v-if="showSmsCodePopup" class="pay-popup">
      <view class="pay-popup-mask"></view>
      <view class="pay-popup-wrapper">
        <view class="pay-popup-content">
          <view class="pay-popup-title">请输入验证码</view>
          <view class="pay-popup-input-box">
            <input class="pay-popup-input" type="number" maxlength="6" v-model="sms_code" @input="updateSmsCode"/>
          </view>
          <view class="pay-popup-tips">短信已发送对银行卡对应手机号码</view>
          <view class="pay-popup-code-btn" @tap="tryReCode">{{codeTimeText}}</view>

          <view class="pay-popup-close" @tap="cancelVerify">×</view>
        </view>
      </view>
    </view>



  </view>

</template>

<script>
import md5 from 'md5';
export default {
  data() {
    return {
      paying: false,
      payType: 2, //2微信支付，6银行卡支付

      userInfo: uni.getStorageSync('userInfo'),

      quilySelectBases : [200, 400, 600, 800, 1000, 1500, 2000, 2500, 3000, 3500, 4000, 4500],
      quiklySelectOptions: [
      ],
      quicklySelectIndex: 0,

      showPopup: false,
  
      handing: 0,
      handing_scale: 0,
      
      toSelectBank: false,
      // 协议支付板块
      order_sn: null, //协议支付带sn查询
      bankInfo: null,
      allowPayPwd: true,
      showPayPwdPopup: false,
      pay_pwd: '',
      allowSms: true,
      showSmsCodePopup: false,
      sms_code: '',


      // 验证码
      couldSend: true,
      codeTimeText: "重新发送",
      currentTime: 0,
      codeInterval: null,
    }
  },
  onLoad(options) {
    let quiklySelectOptions = [];
    for(let i = 0; i < this.quilySelectBases.length; i++) {
      let len = Math.floor(Math.log10(this.quilySelectBases[i])) || 0; //确定基底，10的n次幂
      // len = len - 1;  //往下减一位
      let offsetBase = Math.pow(10, len); //确定基底值
      let offset = Math.random() * offsetBase / 2; //偏移量，除以2只取 0-0.5 之间的值不至于溢出进位
      let val = (offset + this.quilySelectBases[i]).toFixed(2); //最终结果
      quiklySelectOptions.push({
        title: val,
        val: val
      })
    };
    this.quiklySelectOptions = quiklySelectOptions;
  },
  onShow() {
    this.getUserInfo();
    if(this.toSelectBank) {
      this.toSelectBank = false;
      if(uni.getStorageSync('selectedBank')) {
        // 存在选择银行的情况，赋值并移除缓存
        this.bankInfo = uni.getStorageSync('selectedBank');
        uni.removeStorageSync('selectedBank');
        this.tryShowPayPwdPopup();
      } else {
        uni.showToast({
          title: '未选择银行卡',
          mask: true,
          icon: 'none'
        })
      }
    }
  },
  onUnload() {
  },
  methods: {
    getUserInfo() {
      let params = {
        uid: uni.getStorageSync('userInfo').uid
      }
      this.$sget('/user/info', params, res => {
        let data = res.data;
        //#ifdef H5
        data.real_uid = data.uid;
        if(data.primary_uid) data.uid = data.primary_uid; //同步过，改写uid
        // #endif
        let userInfo = data;
        this.userInfo = userInfo;
        this.handing_scale = (parseFloat(userInfo.handing_scale * 10000) / 100).toFixed(1);
        uni.setStorageSync('userInfo', this.userInfo);
      }, err => {
        this.userInfo.crowd_balance = 0;
      })
    },

    quicklyUpdatePrice(index) {
      if(this.quicklySelectIndex != index) this.quicklySelectIndex = index;
    },

    tryActions() {
      
      uni.showActionSheet({
        alertText: '请选择支付方式',
        itemList: [
          '现金支付',
          '银行卡协议支付'
        ],
        itemColor: '#5e5e5e',
        success: res => {
          let index = res.tapIndex;
          if(index == 0) {
            this.payType = 2;
            this.tryCharge();
          } else if(index == 1) {
            this.payType = 6;
            this.toSelectBank = true;
            uni.navigateTo({
              url: `/market-pages/pages/agreement-pay/bankcards/bankcards`
            })
          }
        }
      })
    },
    tryCharge() {
      if(this.paying) return;
      this.paying = true;
      let params = {
        uid: this.userInfo.uid,
        price: this.quiklySelectOptions[this.quicklySelectIndex].val,
        pay_type: this.payType
      };
      if(params.pay_type == 6) {
        // 协议支付，塞东西
        params.sign_no = this.bankInfo.sign_no;
        params.pay_pwd = md5(this.pay_pwd);
      }

      this.$post('/crowdFunding/recharge', params, res => {
        if(params.pay_type == 2) {
          
          // #ifdef H5
          this.h5Pay(res);
          // #endif
          // #ifndef H5
          this.wxappPay(res);
          // #endif
        } else if(params.pay_type == 6) {
          this.agreementPayAskSmscode(res);
        }
      }, err => { 
        this.paying = false;
      })
    },

    
    h5Pay(res) {
      // h5给钱（走微信sdk）
      if (this.$jwx && this.$jwx.isWechat()) {//检查是否是微信环境
        this.$jwx.wxpay(res.data, wxmsg => {
          this.paying = false;

          if(wxmsg == '{"errMsg":"chooseWXPay:ok"}') {
            setTimeout(() => {
              uni.showToast({
                title: '充值成功返回中',
                mask: true,
                duration: 4000
              })
              setTimeout(() => {
                uni.reLaunch({
                  url: '/pages/me/me'
                })
              }, 4000)
            }, this.$toastDelay)
          } else {
            setTimeout(() => {
              uni.showToast({
                title: '支付失败请重试',
                mask: true,
                icon: 'none',
                duration: 4000
              })
            }, this.$toastDelay)
            
          }
          
        }, err => {
          this.paying = false;
        })
      }
    },
    wxappPay(res) {
      // 小程序或者app给钱，走支付平台统一接口
      let data = res.data;

      uni.requestPayment({
        provider: 'wxpay',
        timeStamp: data.timeStamp,
        nonceStr: data.nonceStr,
        package: data.package,
        signType: data.signType,
        paySign: data.paySign,
        success: res => {
          
          let wxpayRes = res;
          this.paying = false;
          setTimeout(() => {
            uni.showToast({
              title: '充值成功返回中',
              mask: true,
              duration: 4000
            })
            setTimeout(() => {
              uni.reLaunch({
                url: '/pages/me/me'
              })
            }, 4000)
          }, this.$toastDelay)

        },
        fail: err => {
          this.paying = false
          console.log(err);
          setTimeout(() => {
            uni.showToast({
              title: '支付失败请重试',
              mask: true,
              icon: 'none',
              duration: 4000
            })
          }, this.$toastDelay)
        }
      });
    },

    // 协议支付
    tryShowPayPwdPopup() {
      if(this.userInfo.pay_pwd_unset) {
        uni.showModal({
          title: '提示',
          content: '您未设置过支付密码，需要设置支付密码后才可以使用银行卡协议支付',
          confirmText: '立即前往',
          success: res => {
            if(res.confirm) {
              uni.navigateTo({
                url: `/mine-pages/pages/setting/paypwd-setting/paypwd-setting`
              })
            }
          }
        })
      } else {
        this.allowPayPwd = true;
        this.pay_pwd = '';
        this.showPayPwdPopup = true;
      }
      this.paying = false;
    },
    updatePayPwd(e) {
      if(!this.allowPayPwd) return;  //防止同时请求多遍【手机自动输入】
      this.pay_pwd = e.detail.value;
      if(this.pay_pwd.length == 6) {
        this.allowPayPwd = false;
        this.showPayPwdPopup = false;
        this.tryCharge();
      }
    },
    updateSmsCode(e) {
      if(!this.allowSms) return;  //防止同时请求多遍【手机自动输入验证码】
      this.sms_code = e.detail.value;
      if(this.sms_code.length == 6) {
        this.allowSms = false;
        this.showSmsCodePopup = false;

        let params = {
          uid: uni.getStorageSync('userInfo').uid,
          order_sn: this.order_sn,
          sms_code: this.sms_code,
          order_channel: 2  //1普通订单，2充值订单
        }
        this.paying = true;
        this.$post('/agreement/verifyPaySms', params, res => {
          
          uni.redirectTo({
            url: `/market-pages/pages/crowd-funding/paying/paying?sn=${this.order_sn}`
          })
          this.paying = false;
        }, err => {
          this.paying = false;
          this.showSmsCodePopup = false;
        })
      }
      
    },
    cancelVerify() {
      this.showSmsCodePopup = false;
    },
    // 验证码倒计时
    tryReCode() {
      if(this.currentTime > 0) return;
      let params = {
        uid: uni.getStorageSync('userInfo').uid,
        order_sn: this.order_sn,
        sign_no: this.bankInfo.sign_no
      }
      this.$post('/agreement/paySmsAgain', params, res => {
        this.sms_code = '';
        setTimeout(() => {
          uni.showToast({
            title: '发送成功',
            icon: 'success',
            mask: true
          })
          this.currentTime = 60;
          this.tryCodeColdDown();
          this.handlerCodeColdDown();
        }, this.$toastDelay);
      })
    },
    tryCodeColdDown() {
      // 倒计时
      this.codeInterval = setInterval(() => {
        this.handlerCodeColdDown();
      }, 1000)
    },
    handlerCodeColdDown() {
      this.currentTime--;
      this.codeTimeText = this.currentTime + "秒";
      this.couldSend = false;
      if (this.currentTime <= 0) {
        if(this.codeInterval) clearInterval(this.codeInterval);
        this.codeTimeText = "重新发送";
        this.currentTime = 0;
        this.couldSend = true;
      }
    },
    agreementPayAskSmscode(res) {
      this.order_sn = res.data.order_sn;
      this.allowSms = true;
      this.sms_code = '';
      
      if(this.codeInterval) clearInterval(this.codeInterval);
      this.currentTime = 60;
      this.tryCodeColdDown();
      this.handlerCodeColdDown();

      this.showSmsCodePopup = true;
    },
    
  }
}
</script>

<style lang="scss" scoped>
  @import 'charge.scss';
  .form {
    padding-top: 20rpx;
  }
  .form-input {
    width: 100%;
    height: 2em;
    line-height: 2em;
  }
</style>