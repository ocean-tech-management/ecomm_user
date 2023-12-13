<template>
  <view class="sign-page">
    <view class="sign-forms">
      <view class="sign-form-item">
        <label for="real_name" class="sign-label">持卡人姓名</label>
        <input id="real_name" class="sign-input" maxlength="12" placeholder="请输入持卡人姓名" v-model="formData.real_name"/>
      </view>
      <view class="sign-form-item">
        <label for="bank_card_no" class="sign-label">银行卡号</label>
        <input id="bank_card_no" class="sign-input" type="number" placeholder="请输入银行卡号" v-model="formData.bank_card_no"/>
      </view>
      <!-- <view class="sign-form-item">
        <label for="bank" class="sign-label">选择银行</label>
        <picker id="bank" class="sign-picker" :value="bankIndex" :range="banks" range-key="name" @change="updateBank">
          <view class="sign-picker-content">
            <view v-if="banks[bankIndex].roomid" class="sign-picker-name">{{banks[bankIndex].name}}</view>
            <view v-else class="sign-picker-placeholder">请选择发卡行</view>
            <image class="sign-picker-arrow" src="/static/images/more.png"></image>
          </view>
        </picker>
      </view> -->
      <view class="sign-form-item">
        <label for="card" class="sign-label">选择卡片类型</label>
        <picker id="card" class="sign-picker" :value="cardIndex" :range="cards" range-key="text" @change="updateCard">
          <view class="sign-picker-content">
            <view v-if="cards[cardIndex].val" class="sign-picker-name">{{cards[cardIndex].text}}</view>
            <view v-else class="sign-picker-placeholder">请选择卡片类型</view>
            <image class="sign-picker-arrow" src="/static/images/more.png"></image>
          </view>
        </picker>
      </view>
      <view v-if="cards[cardIndex].val == 2" class="sign-form-item">
        <label for="expire_date" class="sign-label">信用卡有效期</label>
        <input id="expire_date" class="sign-input" maxlength="24" placeholder="年份/月份，示例：22/02" v-model="formData.expire_date"/>
      </view>
      <view v-if="cards[cardIndex].val == 2" class="sign-form-item">
        <label for="cvv" class="sign-label">信用卡安全码</label>
        <input id="cvv" class="sign-input" type="number" maxlength="4" placeholder="一般为卡片后面数字的后三位" v-model="formData.cvv"/>
      </view>
    </view>


    <view class="sign-forms">
      <view class="sign-form-item">
        <label for="id_card" class="sign-label">身份证号码</label>
        <input id="id_card" class="sign-input" type="idcard" maxlength="18" placeholder="请输入身份证号码" v-model="formData.id_card"/>
      </view>
      <view class="sign-form-item">
        <label for="bank_phone" class="sign-label">预留手机号</label>
        <input id="bank_phone" class="sign-input" type="number" maxlength="11" placeholder="请输入预留手机号" v-model="formData.bank_phone"/>
      </view>
      <view class="sign-form-item">
        <label for="sms_code" class="sign-label">验证码</label>
        <input id="sms_code" class="sign-input" type="number" maxlength="6" placeholder="请输入验证码" v-model="formData.sms_code"/>
        <view class="get-code" :class="{'able': couldSend}" @tap="getCode">
          {{codeTime}}
        </view>
      </view>
    </view>

    <view class="sign-ctrl" @tap="confirmData">
      确认添加
    </view>
    <view class="sign-license" @tap="toggleAcceptLicense">
      <view class="sign-license-accept">
        <image v-if="acceptLicense" class="sign-license-accept-icon" src="/static/images/shopcar_select.png"></image>
        <image v-else class="sign-license-accept-icon" src="/static/images/shopcar_unselect.png"></image>
      </view>
      <view class="sign-license-tips">
        我已阅读并同意协议<text class="link-color" @tap.stop="goToAgreementPayRule">《签约协议》</text>
      </view>
    </view>

    <view style="height: 140rpx;"></view>

  </view>
</template>
<script>

export default {
  data() {
    return {
      banks: [],
      bankIndex: 0,
      cards: [{
        val: 1,
        text: '借记卡'
      }, {
        val: 2,
        text: '信用卡'
      }],
      cardIndex: 0,

      formData: {
        real_name: '',
        id_card: '',
        bank_card_no: '',
        bank_phone: '',
        expire_date: '',
        sms_code: '',
        cvv: '' //信用卡安全码，一般是背后卡片后三位
      },
      card_sn: null,

      acceptLicense: false,

      couldSend: true,
      codeTime: "获取验证码",
      currentTime: 0,
      codeInterval: null,
    }
  },
  onLoad() {
    this.getValidBanks();
  },
  onUnload() {
    if(this.codeInterval) clearInterval(this.codeInterval)
  },
  methods: {
    getValidBanks() {
      let params = {
        uid: uni.getStorageSync('userInfo').uid
      }
      this.$get('/live/list', params, res => {
        this.banks = res.data || [];
        this.bankIndex = 0;
      })
    },

    confirmData() {
      let params = {
        card_sn: this.card_sn,
        sms_code: this.formData.sms_code
      }
      if(!params.card_sn || params.card_sn === '') {
        return uni.showModal({
          title: '提示',
          content: '未成功下发过短信验证码，请检查。请注意，如有数据变更请重新发送短信验证码',
          showCancel: false
        })
      }
      if(!params.sms_code || params.sms_code === '') {
        return uni.showModal({
          title: '提示',
          content: '请填写短信验证码',
          showCancel: false
        })
      }
      if(!this.acceptLicense) {
        return uni.showModal({
          title: '提示',
          content: '阅读并同意《签约协议》才可以进行进行签约操作',
          showCancel: false
        })
      }

      this.$post('/agreement/contract', params, res => {
        setTimeout(() => {
          uni.showToast({
            title: '签约成功',
            icon: 'success',
            mask: true
          })
          setTimeout(() => {
            uni.navigateBack();
          }, 1500)
        }, this.$toastDelay);
      })

    },

    // 验证码获取点击事件
    getCode(e) {
      if(this.currentTime > 0) return;
      let params = {
        uid: uni.getStorageSync('userInfo').uid,
        real_name: this.formData.real_name,
        id_card: this.formData.id_card,
        bank_card_no: this.formData.bank_card_no.replace(/\s/g,""),
        bank_phone: this.formData.bank_phone,
        card_type: this.cards[this.cardIndex].val
      }
      if(params.card_type == 2) {
        params.expire_date = this.formData.expire_date;
        params.cvv = this.formData.cvv;
      }

      let paramValues = Object.values(params);
      for(let i = 0; i < paramValues.length; i++) {
        if(paramValues[i] == undefined || paramValues[i] == null || paramValues[i] === '') {
          return uni.showModal({
            title: '提示',
            content: '请填写验证码栏上面所有信息',
            showCancel: false
          })
        }
      }
      if(!/(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/.test(params.id_card)) {
        return uni.showToast({
          title: '身份证号格式有误',
          mask: true,
          icon: 'none'
        })
      }
      if (!(/^1[3456789]\d{9}$/.test(params.bank_phone))) {
        return uni.showModal({
          title: '提示',
          content: '手机号码有误，请检查',
          showCancel: false
        });
      }
      if(!/^[0-9]*$/.test(params.bank_card_no)) {
        return uni.showModal({
            title: '提示',
            content: '银行卡格式有误，必须是数字格式',
            showCancel: false
          });
      }

      this.$post('/agreement/signSms', params, res => {
        this.card_sn = res.data.card_sn;
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
      this.codeTime = this.currentTime + "秒";
      this.couldSend = false;
      if (this.currentTime <= 0) {
        if(this.codeInterval) clearInterval(this.codeInterval);
        this.codeTime = "重新发送";
        this.currentTime = 0;
        this.couldSend = true;
      }
    },

    toggleAcceptLicense() {
      this.acceptLicense = !this.acceptLicense;
    },

    updateBank(e) {
      this.bankIndex = e.detail.value;
    },
    updateCard(e) {
      this.cardIndex = e.detail.value;
    },

    goToAgreementPayRule() {
      uni.redirectTo({
        url: `/market-pages/pages/agreement-pay/rule/rule?type=6`
      })
    }
  }
}
</script>

<style lang="scss" scoped>
@import 'sign.scss';
</style>