<template>
  <view class="flex-page">
    <view class="flex-page-content">
      <view class="page-img-box">
        <image class="page-img" :src="device.device_image" mode="widthFix"></image>
      </view>
      <view class="device-service-info" @tap="tryPhone">
        <text>设备启动异常？点击此处</text>
        <text class="try-contact">联系设备关联人员</text>
      </view>
      <view class="height: 100rpx"></view>
    </view>
    <view class="page-btns">
      <view class="page-btn" @tap="showPayMenu">选择套餐</view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      sn: '',
      
      device: {
        device_image: '',
        combos: []
      },
      
      userInfo: uni.getStorageSync('userInfo') || {}
    }
  },
  onLoad(options) {
    if(!this.userInfo.uid) {
      return uni.showModal({
        title: '提示',
        content: '登陆信息失效或您尚未成为商城用户，即将离开该页面',
        showCancel: false,
        success: res => {
          if(res.confirm) {
            uni.reLaunch({
              url: '/pages/index/index'
            });
          }
        }
      })
    }
    if(options.sn) this.sn = options.sn;
    this.getData();
  },
  methods: {
    getData() {
      let params = {
        uid: uni.getStorageSync('userInfo').uid,
        device_sn: this.sn
      }
      this.$get('/device/info', params, res => {
        this.device = res.data;
        if(!this.device.device_sn) {
          uni.showModal({
            title: '提示',
            content: '设备信息有误，点击“确定”离开本页',
            showCancel: false,
            success: res => {
              if(res.confirm) {
                uni.reLaunch({
                  url: '/pages/index/index'
                });
              }
            }
          })
        }

      })
    },
    showPayMenu() {
      if(!this.device.combo || this.device.combo.length == 0) return uni.showToast({
        title: '该商品无套餐可用',
        mask: true,
        icon: 'none'
      });
      let combosTitles = [];
      for(let i = 0; i < this.device.combo.length; i++) {
        combosTitles.push(this.device.combo[i].combo_title);
      }

      uni.showActionSheet({
        alertText: '选择套餐',
        itemList: combosTitles,
        itemColor: '#000000',
        success: (res) => {
          let index = res.tapIndex;
          this.confirmCombo(index);
        },
        fail: () => {},
        complete: () => {}
      });
        
    },

    confirmCombo(index) {
      let preOrder = {
        device_sn: this.device.device_sn,
        pay_type: this.device.pay_type,
        concact_phone: this.device.concact_phone,
        ...this.device.combo[index]
      }
      uni.setStorageSync('preOrder', preOrder);
      uni.navigateTo({
        url: `/market-pages/pages/device/combo/combo?sn=${preOrder.combo_sn}`
      })
    },
    tryPhone() {
      uni.makePhoneCall({
        phoneNumber: this.device.concact_phone
      });
    }

  }
}
</script>

<style lang="scss" scoped>
@import 'detail.scss';
</style>