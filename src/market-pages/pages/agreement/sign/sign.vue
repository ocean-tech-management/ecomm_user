<template>
  <view class="uni-common-pb-withbtn">
    <view v-if="agreementTitle" class="agreement-title">{{ agreementTitle }}</view>
    <mp-html :content="agreement_protocol" :lazy-load="true" class="agreement-content" />
    <view v-if="isDefaultView" class="default-view">
      暂无相关的协议~
    </view>
    <template v-else>
      <view v-if="signStatus" class="bottom-btns">
        <view class="bottom-btn disabled">{{ signStatus == 2 ? '您已拒绝协议' : '您已同意协议' }}</view>
      </view>
      <view v-else class="bottom-btns">
        <view class="bottom-btn btn-reject" @tap="rejectAgree">拒绝</view>
        <view v-if="!browseTime || browseTime <= 0" class="bottom-btn" @tap="confirmAgree">同意</view>
        <view v-if="browseTime && browseTime > 0" class="bottom-btn disabled">请阅读( {{ browseTime }} )秒</view>
      </view>
    </template>
  </view>
</template>
<script>
import mpHtml from '@/components/mp-html/mp-html';
export default {
  component: {
    mpHtml
  },
  data() {
    return {
      isDefaultView: false,
      agSn: '',
      agreementTitle: '',
      agreement_protocol: '',
      signStatus: '', // 签约状态
      browseTime: '', // 强制阅读时间 0-不限制

      coldDownInterval: null,
    }
  },
  onShareAppMessage() {
    let shareInfo = this.$getShareInfo();
    if(shareInfo.imageUrl) delete shareInfo.imageUrl;
    return shareInfo;
  },
  onLoad(options) {
    if(!options.ag_sn) {
      uni.showToast({
        title: '不要尝试啦，正在返回首页',
        icon: 'none',
        mask: true
      })
      setTimeout(() => {
        uni.reLaunch({
          url: '/pages/index/index'
        })
      }, 1500);
      return;
    }
    this.agSn = options.ag_sn;
    this.getUserAgreementInfo();
  },
  onHide() {
    if(this.coldDownInterval) clearInterval(this.coldDownInterval);
  },
  onUnload() {
    if(this.coldDownInterval) clearInterval(this.coldDownInterval);
  },
  methods: {
    /**
     * 获取用户签约协议详情
     */
    getUserAgreementInfo() {
      const params = {
        uid: uni.getStorageSync('userInfo').uid,
        ag_sn: this.agSn
      }
      this.$get('/userAgreement/info', params, res => {
        const data = res.data;
        if (data && !Array.isArray(data)) {
          this.agreementTitle = data.title;
          this.agreement_protocol = data.content;
          this.signStatus = data.sign_status;
          uni.setNavigationBarTitle({
            title: data.title
          });
        } else {
          this.getAgreementInfo()
        }
      })
    },
    /**
     * 获取协议详情
     */
    getAgreementInfo() {
      const params = {
        ag_sn: this.agSn
      }
      this.$get('/agreement/info', params, res => {
        const data = res.data;
        if (data && !Array.isArray(data)) {
          this.agreementTitle = data.title;
          this.agreement_protocol = data.content;
          this.browseTime = data.browse_time;
          if(this.browseTime && this.browseTime > 0) {
            this.initColdDownInterval();
          }
          uni.setNavigationBarTitle({
            title: data.title
          });
        } else {
          this.isDefaultView = true;
        }
      })
    },
    /**
     * 阅读计时
     */
    initColdDownInterval() {
      if(this.coldDownInterval) clearInterval(this.coldDownInterval);
      this.coldDownInterval = setInterval(() => {
        if (typeof this.browseTime == 'number' && this.browseTime > 0) {
          this.browseTime -= 1;
        } else {
          clearInterval(this.coldDownInterval);
        }
      }, 1000)
    },
    /**
     * 拒绝协议
     */
    rejectAgree() {
      uni.showModal({
        title: '提示',
        content: `是否拒绝该协议内容？`,
        showCancel: true,
        success: (e) => {
          if (e.confirm) {
            const params = {
              ag_sn: this.agSn,
              uid: uni.getStorageSync('userInfo').uid,
              sign_status: 2,
            }
            this.$post('/userAgreement/sign', params, () => {
              this.signStatus = 2;
              this.goToHome('已拒绝协议，正在返回首页');
            })
          }
        }
      });
    },
    /**
     * 同意签约协议
     */
    confirmAgree() {
      const params = {
        ag_sn: this.agSn,
        uid: uni.getStorageSync('userInfo').uid,
        sign_status: 1,
      }
      this.$post('/userAgreement/sign', params, () => {
        this.signStatus = 1;
        this.goToHome('已同意协议，正在返回首页');
      })
    },
    /**
     * 返回首页
     * @param {*} title
     */
    goToHome(title = '正在返回首页') {
      uni.showToast({
        title,
        icon: 'none',
        mask: true
      })
      setTimeout(() => {
        uni.reLaunch({
          url: '/pages/index/index'
        })
      }, 1500);
    }
  }
}
</script>
<style lang="scss" scoped>
@import 'sign.scss';
</style>