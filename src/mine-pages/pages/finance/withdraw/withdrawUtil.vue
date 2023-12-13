<template>
  <view class="flex-page">
    <view class="flex-page-content">
      <view class="balance">
        <view class="balance-val">
          <text class="balance-val-sign">￥</text>
          <text>{{userInfo.total_balance}}</text>
        </view>
        <view class="balance-title">当前余额 元</view>
      </view>

      <view class="withdraw-content">
        <!-- 只有回收到银行卡才需要银行卡相关板块 -->
        <view v-if="formData.type == 2" class="withdraw-content-box">
          <view class="withdraw-title-box">
            <view class="withdraw-title">回收到银行卡</view>
          </view>
          <view class="withdraw-bank" @tap="validSign">
            <block v-if="signData.status == 2">
              <view class="bankcard">
                <text>银行卡号：</text>
                <text class="bankcard-code">{{formData.bank_account}}</text>
              </view>
              <view class="bankcard-update-btn" @tap="showEditBankAccount">修改</view>
            </block>
            <block v-else>
              <view class="withdraw-bank-unsign">待签约</view>
              <image class="withdraw-bank-unsign-arrow" src="/static/images/more.png"></image>
            </block>
          </view>
        </view>

        <view class="withdraw-content-box">
          <view class="withdraw-title-box">
            <view class="withdraw-title">选择回收金额</view>
            <!-- <view class="withdraw-tips">回收金额需为50的整数倍数</view> -->
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
            </view>
          </view>
        </view>

        
        <view class="withdraw-content-box withdraw-price">
          <view class="withdraw-title-box">
            <view class="withdraw-title">输入回收金额</view>
          </view>
          <view class="withdraw-price-box">
            <view class="withdraw-price-sign">￥</view>
            <input class="withdraw-price-input" type="digit" placeholder="请填写" :value="formData.total_price" @input="updatePrice"/>
          </view>
          <!-- <view v-if="formData.total_price && formData.total_price !== ''" class="withdraw-handing-tips">
            扣除手续费<text class="withdraw-handing-val">{{handing}}</text>元
          </view> -->
        </view>

        
        <view class="withdraw-content-box withdraw-rule">
          <view class="withdraw-rule-box">
            1. 回收款项经审核后，发放到绑定的账户。<br/>
            2. 手续费500以下1%，500以上7%税点。<br/>
            3. 根据市场监管，未实名签约灵活用工的账户不能进行回收操作。<br/>
            4. 签约灵活用工的年龄要求:18-65周岁。
          </view>
        </view>

          
        <view class="pay-btn" :class="{'disabled': !allowPay}" @tap="widthdraw">
          申请回收
        </view>

        <view style="height: 10rpx;"></view>

      </view>
    </view>

    <view v-if="showPopup" class="bankcode-popup">
      <view class="bankcode-popup-mask"></view>
      <view class="bankcode-popup-wrapper">
        <view class="bankcode-popup-content">
          <image class="bankcode-popup-close" src="/static/images/icon_close_black.png" @tap="showPopup = false"></image>
          <view class="bankcode-popup-title">修改银行卡</view>
          <view class="bankcode-input-box">
            <view class="bankcode-input-label">修改卡号：</view>
            <input class="bankcode-input" type="number" placeholder="请填写本人银行卡号" :value="editing_bank_account" @input="updateEditingAccount"/>
          </view>
          <view class="confirm-bankcode-btn" @tap="confirmBankcode">确认修改</view>
        </view>
      </view>
    </view>

  </view>

</template>

<script>
import withdrawUtil from './withdrawUtil';

export default {
  data() {
    return {
      userInfo: uni.getStorageSync('userInfo'),
      formData: {
        type: 2,  //1微信2银行卡
        real_name: '',
        bank_account: uni.getStorageSync('bank_account') || '',
        total_price: ''
      },

      quiklySelectOptions: [
        {title: '50元', val: 50},
        {title: '100元', val: 100},
        {title: '300元', val: 300}
      ],
      quicklySelectIndex: null,

      showPopup: false,
  
      handing: 0,
      handing_scale: 0,

      signData: {},
      allowPay: false,
      editing_bank_account: ''
      
    }
  },
  onShareAppMessage() {
    let shareInfo = this.$getShareInfo();
    return shareInfo;
  },
  onLoad(options) {
    
  },
  onShow() {
    this.getUserInfo();
    if(this.formData.type == 2) {
      this.getSignData();
    } else {
      this.allowPay = true; //走微信不需要校验签约
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
        this.userInfo.total_balance = 0;
      })
    },
    getSignData() {
      withdrawUtil.getSignData({
        params: {
          uid: uni.getStorageSync('userInfo').uid
        }
      }, res => {
        this.signData = res.data.returnData;
        this.signData.related_user = res.data.related_user;
        this.formData.bank_account = this.signData.bankcard;
        if(this.signData.status != 2) {
        } else {
          this.allowPay = true;
        }
      }, err => {
        withdrawUtil.throwAllowPayError(this.formData.type);
      });
    },
    widthdraw() {
      if(!this.allowPay) {
        withdrawUtil.throwAllowPayError(this.formData.type, true);
        return;
      };

      let params = {
        real_name: this.formData.real_name || '', 
        total_price: this.formData.total_price,
        type: this.formData.type,
        uid: this.userInfo.uid
      };
      if(params.type == 2) params.bank_account = this.formData.bank_account; 
      //如果是有签约相关的
      if(this.signData) {
        if(this.signData.username) params.real_name = this.signData.username;
        if(this.signData.related_user) params.related_user = this.signData.related_user;
      }  

      // 不适用通用检查，将报错完善的提供
      if(!params.real_name || params.real_name === '') {
        return uni.showModal({
          title: '提示',
          content: '无真实姓名信息，请检查填写信息/签约状态',
          showCancel: false
        });
      }
      if(params.type == 2 && (!params.bank_account || params.bank_account === '')) {
        return uni.showModal({
          title: '提示',
          content: '无银行卡信息，请检查填写信息/签约状态',
          showCancel: false
        });
      }

      // if(params.type == 2) {
      //   if(!/^([1-9]{1})(\d{15}|\d{18})$/.test(params.bank_account)) {
      //     return uni.showModal({
      //       title: '提示',
      //       content: '银行卡号有误，一般为19位或者16位卡号，请检查',
      //       showCancel: false
      //     });
      //   }
      // }

      if(!params.total_price || params.total_price === '') {
        return uni.showModal({
          title: '提示',
          content: '请填写回收金额',
          showCancel: false
        });
      }
      if(!/^(\d|[1-9]\d+)(\.\d+)?$/.test(params.total_price)) {
        return uni.showModal({
          title: '提示',
          content: '回收金额要为正数哦',
          showCancel: false
        });
      }
      if(parseFloat(params.total_price) < 50) {
        return uni.showModal({
          title: '提示',
          content: '可回收金额须50元起',
          showCancel: false
        });
      }
      // else if(parseFloat(params.total_price) % 50 != 0) {
      //   return uni.showModal({
      //     title: '提示',
      //     content: '回收金额需要为50的倍数',
      //     showCancel: false
      //   });
      // } 
      else if(parseFloat(params.total_price) > this.userInfo.total_balance) {
        return uni.showModal({
          title: '提示',
          content: '你想回收的金额已超过可回收金额了哦，请检查',
          showCancel: false
        });
      }
      
      
      this.$post('/user/withdraw', params, res => {
        setTimeout(() => {
          uni.setStorageSync('bank_account', params.bank_account);
          uni.showToast({
            title: '已提交请等待审核',
            mask: true,
            duration: 4000
          })
          setTimeout(() => {
            uni.reLaunch({
              url: '/pages/me/me'
            })
          }, 4000)
        }, this.$toastDelay)
      })
    },

    validSign() {
      if(this.signData.status == 2) {
        return; //是有效的。不用管
      } else {
        uni.redirectTo({
          url: '/market-pages/pages/kuaishang-pay/sign/sign'
        })
      }
    },

    showEditBankAccount() {
      this.editing_bank_account = this.formData.bank_account;
      this.showPopup = true;
    },
    confirmBankcode() {
      
      if(!this.editing_bank_account || this.editing_bank_account === '') {
        return uni.showModal({
          title: '提示',
          content: '请填写本人银行卡号',
          showCancel: false,
          success: res => {}
        })
      }
      // if(!/^([1-9]{1})(\d{15}|\d{18})$/.test(this.editing_bank_account)) {
      //   return uni.showModal({
      //     title: '提示',
      //     content: '银行卡号有误，一般为19位或者16位卡号，请检查',
      //     showCancel: false,
      //     success: res => {}
      //   })
      // }
      this.formData.bank_account = this.editing_bank_account;
      this.showPopup = false;
    },

    // updateName: function(e) {
    //   this.formData.real_name = e.detail.value;
    // },
    updateEditingAccount(e) {
      this.editing_bank_account = e.detail.value;
    },
    updateBankAccount(e) {
      this.formData.bank_account = e.detail.value;
    },
    updatePrice: function(e) {
      this.formData.total_price = e.detail.value;
      this.reCalcValue();
    },
    quicklyUpdatePrice(index) {
      this.quicklySelectIndex = index;
      this.formData.total_price = this.quiklySelectOptions[index].val;
      this.reCalcValue();
    },
    reCalcValue() {
      if(!this.formData.total_price || this.formData.total_price === '') return this.handing = 0;
      let handing = parseFloat(this.formData.total_price) * this.userInfo.handing_scale;
      if(!handing && handing !== 0) return this.handing = 0;
      // handing = handing < 1 && handing !== 0 ? 1.00 : handing.toFixed(2);
      handing = handing.toFixed(2);
      this.handing = handing;
    }


    
  }
}
</script>

<style lang="scss" scoped>
  @import 'withdraw.scss';
  .form {
    padding-top: 20rpx;
  }
  .form-input {
    width: 100%;
    height: 2em;
    line-height: 2em;
  }
</style>