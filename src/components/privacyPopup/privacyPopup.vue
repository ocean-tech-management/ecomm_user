<template>
  <cover-view v-if="show" :class="[direction == 'middle' ? 'dialog--middle' : 'dialog--bottom']" class="dialog">
    <cover-view class="dialog-content">
      <cover-view class="dialog-header">
        <cover-view class="dialog-header__title">隐私保护指引</cover-view>
      </cover-view>
      <cover-view class="dialog-body">
        <cover-view class="dialog-body__content">
          <cover-view
            class="dialog-body__content-text">感谢选择我们的小程序，我们非常重视您的个人信息安全和隐私保护，根据最新法律要求，使用我们的产品前，请仔细阅读以下指引以便我们向您提供更优质的服务！</cover-view>
        </cover-view>
        <cover-view class="dialog-body__content">
          <cover-view class="dialog-body__content-text" style="color: #1cc790;"
            @tap="openPrivacyContract">《用户隐私保护指引》</cover-view>
        </cover-view>
        <cover-view class="dialog-body__content">
          我们将尽力保护您的个人信息及合法权益，感谢您的信任！
        </cover-view>
      </cover-view>
      <cover-view class="dialog-footer">
        <cover-view id="disagree-btn" type="default" class="dialog-footer__button" @tap="handleAgree">拒绝</cover-view>
        <button id="agree-btn" type="default" open-type="agreePrivacyAuthorization"
          class="dialog-footer__button dialog-footer__button--agree"
          @agreeprivacyauthorization="handleAgree">同意并继续</button>
      </cover-view>
    </cover-view>
  </cover-view>
</template>
<script>
export default {
  props: {
    direction: {
      type: String,
      default: 'bottom'
    }
  },
  data() {
    return {
      title: "用户隐私保护提示",
      desc1: "感谢选择我们的小程序，我们非常重视您的个人信息安全和隐私保护，根据最新法律要求，使用我们的产品前，请仔细阅读“",
      urlTitle: "《用户隐私保护指引》",
      desc2: "",
      show: false,
    }
  },
  methods: {
    handleAgree() {
      this.show = false;
      this.$emit('confirm')
    },
    openPrivacyContract() {
      wx.openPrivacyContract({
        success: res => {
          console.log('openPrivacyContract success')
        },
        fail: res => {
          console.error('openPrivacyContract fail', res)
        }
      })
    }
  }
}
</script>
<style lang="scss" scoped>
.dialog {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 5000;
  display: flex;
  flex-direction: column;

  background-color: rgba(0, 0, 0, .5);

  .dialog-content {
    min-height: 510rpx;
    max-height: 75%;
    line-height: 1.4;
    background-color: #fff;
    color: #191919;
    overflow: hidden;
    padding: 0 48rpx;
    box-sizing: border-box;
    display: -webkit-box;
    display: -webkit-flex;
    display: flex;
    -webkit-box-orient: vertical;
    -webkit-box-direction: normal;
    -webkit-flex-direction: column;
    flex-direction: column;
    outline: 0;

    .dialog-content--middle {}

    .dialog-header {
      min-height: 118rpx;
      display: -webkit-box;
      display: -webkit-flex;
      display: flex;
      -webkit-box-align: center;
      -webkit-align-items: center;
      align-items: center;
      justify-content: center;
      -webkit-flex-shrink: 0;
      flex-shrink: 0;

      .dialog-header__title {
        display: block;
        color: #000;
        font-weight: 600;
        font-size: 30rpx;
      }
    }

    .dialog-body {
      -webkit-box-flex: 1;
      -webkit-flex: 1;
      flex: 1;
      min-height: 0;
      overflow-y: auto;
      word-wrap: break-word;
      -webkit-hyphens: auto;
      hyphens: auto;
      padding-bottom: 112rpx;
      font-size: 24rpx;

      .dialog-body__content {
        padding-top: 32rpx;
        font-size: 28rpx;
        color: rgba(0, 0, 0, 0.5);
        line-height: 1.4;
        white-space: normal;
        vertical-align: middle;

        .dialog-body__content-text {
          white-space: break-spaces;
        }
      }
    }

    .dialog-footer {
      padding: 0 0 128rpx;
      display: flex;
      justify-content: center;
      text-align: center;

      .dialog-footer__button {
        position: relative;
        display: block;
        min-width: 88rpx;
        padding: 16rpx 48rpx;
        box-sizing: border-box;
        font-weight: 500;
        font-size: 28rpx;
        text-align: center;
        text-decoration: none;
        border: 1px solid #908d8d;
        color: #908d8d;
        line-height: 1.88235294;
        border-radius: 16rpx;
        -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
        -webkit-user-select: none;
        user-select: none;

        &--agree {
          flex: 1;
          margin-left: 26rpx;
          border: none;
          background-color: #1BCE7C;
          color: #fff;
        }
      }
    }
  }

  &--middle {
    justify-content: center;
    align-items: center;

    .dialog-content {
      width: 90%;
      max-width: 800rpx;
      border-radius: 24rpx;
    }
  }

  &--bottom {
    justify-content: flex-end;

    .dialog-content {
      border-top-left-radius: 24rpx;
      border-top-right-radius: 24rpx;
    }
  }
}
</style>