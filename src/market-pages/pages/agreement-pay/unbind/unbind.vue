<template>
  
  <view class="bank-page">
    <block v-if="hasLoad && dataList.length > 0">
      <view class="banks">
        <view v-for="(item, index) in dataList" class="bank" :key="index">
          <view class="bank-info">
            {{item.bank_name}}({{item.bank_card}})
          </view>
          <view class="unbind-ctrl" @tap="tryUnbind(index)">解约</view>
        </view>
      </view>
    </block>
    <block v-else-if="hasLoad && dataList.length == 0">
      <view class="bank-nodata">
        <view class="bank-nodata-tips">
          您暂未签协议绑定银行卡
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

    }
  },
  onLoad() {
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
  
        this.hasLoad = true;
      })
    },
    tryUnbind(index) {
      uni.showModal({
        title: '提示',
        content: '您正在进行解绑银行卡操作，解绑后您需重新绑定银行卡才可以使用协议付款功能，请确认',
        success: res => {
          if(res.confirm) {
            let params = {
              uid: uni.getStorageSync('userInfo').uid,
              card_sn: this.dataList[index].card_sn
            }
            this.$post('/agreement/unSign', params, res => {
              setTimeout(() => {
                uni.showToast({
                  title: '操作成功',
                  mask: true
                })
                setTimeout(() => {
                  this.getBanks();
                }, 1600)
              }, this.$toastDelay)
            })
          }
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
@import 'unbind.scss';
</style>