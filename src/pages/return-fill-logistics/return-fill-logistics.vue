<template>
  <view class="uni-common-pb-withbtn">
    <view class="form">
      <view class="form-item">
        <view class="form-label">物流公司</view>
        <picker class="form-input" type="text" :range="companys" range-key="company" :value="logistics.shipping_code" @change="updateCompany">
          {{logistics.shipping_company_code ? logistics.shipping_company : '请选择'}}
        </picker>
      </view>    
      <view class="form-item">
        <view class="form-label">物流号码</view>
        <input class="form-input" type="text" placeholder="请填写" maxlength="20" :value="logistics.shipping_code" @input="updateLogisticsCode"/>
      </view>
    
    </view>

 
    <view class="bottom-btns">
      <view class="bottom-btn confirm-btn" @tap="confirmLogisticsCode">
        确认并提交
      </view>
    </view>
  </view>

</template>

<script>
export default {
  data() {
    return {
      logistics: {
        shipping_code: '',
        shipping_company: null,
        shipping_company_code: null
      },
      companys: [],
      companyIndex: 0
      
    }
  },
  onLoad(options) {
    this.logistics.after_sale_sn = options.sn;
    this.getServiceres();
  },
  methods: {
    getServiceres() {
      this.$get('/afterSale/shipCompany', null, res => {
        this.companys = res.data;
      })
    },
    confirmLogisticsCode: function() {
      let params = JSON.parse(JSON.stringify(this.logistics));
      let paramValues = Object.values(params);
      for(let i = 0; i < paramValues.length; i++) {
        if(paramValues[i] == undefined || paramValues[i] == null || paramValues[i] === '') {
          return uni.showModal({
            title: '提示',
            content: '请填写物流编号和勾选物流公司哦',
            showCancel: false
          });
        }
        if(!/^[a-zA-Z0-9]*$/.test(params.shipping_code)) {
          return uni.showModal({
            title: '提示',
            content: '物流编号格式有误哦，必须是大小写字母或数字',
            showCancel: false
          });
        }
      }

      this.$post('/afterSale/fillInShip', params, res => {
        setTimeout(() => {
          uni.showToast({
            title: '提交成功',
            mask: true
          })
        }, this.$toastDelay)
        setTimeout(()=> {
          //do something
          uni.setStorageSync('shouldReload', true);
          uni.navigateBack();
        }, 1800)
      })
    },
    updateLogisticsCode: function(e) {
      this.logistics.shipping_code = e.detail.value;
    },
    updateCompany(e) {
      this.companyIndex = e.detail.value;
      let logistics = JSON.parse(JSON.stringify(this.logistics));
      logistics.shipping_company = this.companys[this.companyIndex].company;
      logistics.shipping_company_code = this.companys[this.companyIndex].company_code;
      this.logistics = logistics;
    }


    
  }
}
</script>

<style lang="scss" scoped>
  @import 'return-fill-logistics.scss';
  .form {
    padding-top: 20rpx;
  }
  .form-input {
    width: 100%;
    height: 2em;
    line-height: 2em;
  }
</style>