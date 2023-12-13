<template>
  <view class="bank-page">
    <block v-if="hasLoad && dataList.length > 0">
      <view class="banks">
        <view v-for="(item, index) in dataList" class="bank" :key="index" @tap="updateSelected(index)">
          <view class="bank-info">
            {{item.bank_name}}({{item.bank_card}})
          </view>
          <view class="bank-select-box">
            <image v-if="selected.sign_no == item.sign_no" class="bank-select-icon" src="/static/images/shopcar_select.png"></image>
            <image v-else class="bank-select-icon" src="/static/images/shopcar_unselect.png"></image>
          </view>
        </view>
        <view class="bank-confirm-ctrl" @tap="confirmSelected">
          确定
        </view>
      </view>
    </block>
    <block v-else-if="hasLoad && dataList.length == 0">
      <view class="bank-nodata">
        <view class="bank-nodata-tips">
          您暂未签协议绑定银行卡
        </view>
        <view class="bank-nodata-ctrl" @tap="goToSignBank">
          <view class="bank-nodata-icon-box">
            <image class="bank-nodata-icon" src="/static/images/icon_add.png"></image>
          </view>
          <view class="bank-nodata-ctrl-text">添加银行卡</view>
        </view>
      </view>
    </block>
  </view>
</template>
<script>
export default {
  data() {
    return {
      dataList: [],
      hasLoad: true,

      selected: {
        sign_no: null,
        bank_name: null,
        bank_card: null
      }
    }
  },
  onShow() {
    this.getBanks();
  },
  methods: {
    getBanks() {
      let params = {
        uid: uni.getStorageSync('userInfo').uid
      }
      this.hasLoad = false;
      this.$get('/user/bankCardList', params, res => {
        this.dataList = res.data || [];
  
        if(this.dataList.length > 0) {
          let selected = {
            sign_no: this.dataList[0].sign_no,
            bank_name: this.dataList[0].bank_name,
            bank_card: this.dataList[0].bank_card
          }
          for(let i = 0; i < this.dataList.length; i++) {
            if(this.dataList.is_default) {
              selected = {
                sign_no: this.dataList[i].sign_no,
                bank_name: this.dataList[i].bank_name,
                bank_card: this.dataList[i].bank_card
              }
              break;
            }
          }
          this.selected = selected;
        }
        this.hasLoad = true;
      })
    },
    updateSelected(index) {
      this.selected = {
        sign_no: this.dataList[index].sign_no,
        bank_name: this.dataList[index].bank_name,
        bank_card: this.dataList[index].bank_card
      }
    },
    confirmSelected() {
      uni.setStorageSync('selectedBank', this.selected);
      uni.navigateBack();
    },

    goToSignBank() {
      uni.navigateTo({
        url: '/market-pages/pages/agreement-pay/sign/sign'
      })
    }
  }
}
</script>
<style lang="scss" scoped>
@import 'bankcards.scss';
</style>