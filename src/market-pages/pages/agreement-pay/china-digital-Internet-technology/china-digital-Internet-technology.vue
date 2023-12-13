<template>
  <view class="uni-common-pb-withbtn">
    <view class="form">
      <view class="form-item">
        <view class="form-label">用户姓名</view>
        <input class="form-input" type="text" placeholder="请填写" maxlength="8" :value="userInfo.name"
          @input="updateName" />
      </view>
      <view class="form-item">
        <view class="form-label">身份证号</view>
        <input class="form-input" type="text" placeholder="请填写" @input="updateNo" :value="userInfo.no" />
      </view>

      <view class="form-item">
        <view class="form-label">银行卡号</view>
        <input class="form-input" type="text" placeholder="请填写" @input="updateBank_account"
          :value="userInfo.bank_account" />
      </view>

      <view class="form-item">
        <view class="form-label">手机号码</view>
        <input class="form-input" placeholder="请填写" @input="updateMobile" maxlength="11" v-model="userInfo.mobile" />
      </view>
      <view class="form-item">
        <view class="form-label">验证码</view>
        <input class="form-input" placeholder="请填写" maxlength="4" v-model="userInfo.code" />
        <view class="code-btn" @click="codeBtn">{{ codeTime }}</view>
      </view>
    </view>
    <view class="tips">
      请保证四要素均为同一实名用户, 因您提供的签约信息不实或不匹配, 造成的一切损失将由您自行承担。
      <view style="margin-top: 6rpx">若后续四要素信息发生变更, 请及时联系平台客服处理。</view>
    </view>
    <!-- 协议 -->
    <view class="agreement">
      <view @tap="showPopup = true" class="agreement-text">绑定前请先查看协议
        <text class="agreement-text-i">《中数科签约协议》</text>
      </view>
    </view>

    <view v-if="showPopup" class="rule-popup">
      <view class="rule-popup-mask"></view>
      <view class="rule-popup-box">
        <view class="rule-popup-title">中数科签约协议</view>
        <view class="rule-popup-content">
          <!-- <block v-if="systemInfos.rule"> -->
          <mp-html :content="systemInfos.rule" :lazy-load="true" />
          <!-- </block> -->
        </view>
        <view class="game-rule-tips" @tap="toggleAccess">
          <view class="game-rule-select">
            <image v-if="hasAccess" class="game-rule-toggle-icon" src="/static/images/shopcar_select.png"></image>
            <image v-if="!hasAccess" class="game-rule-toggle-icon" src="/static/images/shopcar_unselect.png"></image>
          </view>
          <view class="game-rule-text">
            <text>我已阅读并同意</text>
            <text class="game-rule-entrance" @tap.stop="goToRule">《中数科签约协议》</text>
          </view>
        </view>
        <view class="rule-popup-ctrl" @tap="accessRule">同意并继续</view>
      </view>
    </view>

    <view class="bottom-btns">
      <button class="bottom-btn" :disabled="btnDisabled" @tap="submitInfo">
        确认绑定
      </button>
    </view>
  </view>
</template>

<script>
import config from "@/config";
export default {
  data() {
    return {
      fromVipRule: false,
      userInfo: {
        name: "",
        mobile: "",
        no: "",
        bank_account: "",
        // #ifdef H5
        code: "",
        // #endif
      },
      btnDisabled: true,
      systemInfos: {
        banner: "",
        rule: "",
      },

      showPopup: false,
      hasAccess: false, //是否同意协议

      couldSend: true,
      codeTime: "获取验证码",
      codeInterval: null,
    };
  },
  onShareAppMessage() {
    let shareInfo = this.$getShareInfo();
    return shareInfo;
  },
  onLoad(options) {
    this.getInfo();
  },
  onUnload() {
    if (this.codeInterval) clearInterval(this.codeInterval);
  },
  methods: {
    toggleAccess() {
      this.hasAccess = !this.hasAccess;
      this;
    },
    getInfo() {
      let params = {
        from: "db",
        type: 8, //1基本信息，2大礼包入口图地址，3使用须知，4用户协议，5隐私政策， 6银行卡快捷支付用户协议 不传为全部返回
      };
      this.$get("/system/info", params, (res) => {
        this.systemInfos.rule = res.data.agreement_zsk;
      });
    },
    goToRule() {
      uni.navigateTo({
        url: `/market-pages/pages/agreement-pay/rule/rule?type=8`,
      });
    },
    accessRule() {
      if (!this.hasAccess) {
        return uni.showToast({
          title: "阅读并同意用户购买协议才可以参与活动",
          icon: "none",
          mask: true,
        });
      }
      this.btnDisabled = false;
      this.showPopup = false;
    },
    // 验证码获取点击事件
    codeBtn() {
      this.$nextTick(() => {
        var mobile = this.userInfo.mobile;
        // 倒计时时间
        var currentTime = 60;
        // 倒计时期间不执行下步
        if (!this.couldSend) return;
        // 判断手机号码是否符合条件
        if (!/^1[3456789]\d{9}$/.test(mobile)) {
          return uni.showModal({
            title: "提示",
            content: "手机号码有误，请检查哦",
            showCancel: false,
          });
        }
        let params = {
          phone: this.userInfo.mobile,
        };

        this.$get("/login/code", params, (res) => {
          setTimeout(() => {
            uni.showToast({
              title: "发送成功",
              icon: "success",
              mask: true,
            });
            // 倒计时
            this.codeInterval = setInterval(() => {
              currentTime--;
              this.codeTime = currentTime + "秒";
              this.couldSend = false;
              if (currentTime <= 0) {
                if (this.codeInterval) clearInterval(this.codeInterval);
                this.codeTime = "重新发送";
                this.couldSend = true;
              }
            }, 1000);
          }, 150);
        });
      });
    },
    submitInfo: function () {
      let paramValues = Object.values(this.userInfo);
      for (let i = 0; i < paramValues.length; i++) {
        if (
          paramValues[i] == undefined ||
          paramValues[i] == null ||
          paramValues[i] === ""
        ) {
          return uni.showModal({
            title: "提示",
            content: "请填写完所有信息哦",
            showCancel: false,
          });
        }
      }
      if (
        this.userInfo.mobile &&
        !/^1[3456789]\d{9}$/.test(this.userInfo.mobile)
      ) {
        return uni.showModal({
          title: "提示",
          content: "手机号码有误，请检查哦",
          showCancel: false,
        });
      }
      this.userInfo.uid = uni.getStorageSync("userInfo").uid;
      this.$post(
        `/zsk/ContractAdd?uid=${this.userInfo.uid}`,
        this.userInfo,
        (res) => {
          if (res.data) {
            uni.navigateBack({ delta: 1 });
          }
        }
      );
    },
    updateName: function (e) {
      this.userInfo.name = e.detail.value;
    },
    updateMobile: function (e) {
      this.userInfo.mobile = e.detail.value;
    },
    updateNo: function (e) {
      this.userInfo.no = e.detail.value;
    },
    updateBank_account: function (e) {
      this.userInfo.bank_account = e.detail.value;
    },
  },
};
</script>

<style lang="scss" scoped>
@import "china-digital-Internet-technology.scss";

.form {
  padding-top: 20rpx;
}

.form-input {
  width: 100%;
  height: 2em;
  line-height: 2em;
}
</style>
