<template>
  <view class="uni-common-pb-withbtn">
    <view class="form">
      <view class="form-item">
        <input class="form-input" placeholder-class="address-placeholder" type="text" placeholder="姓名" maxlength="16" :value="address.name" @input="updateName"/>
      </view>
      <view class="form-item">
        <input class="form-input" placeholder-class="address-placeholder" type="number" placeholder="手机号码" maxlength="11" :value="address.phone" @input="updatePhone"/>
      </view>
      <view class="form-item" @tap="showMulLinkageThreePicker">
        <view v-if="!address.detail_area || address.detail_area === ''" class="form-input address-placeholder">省份、城市、区县</view>
        <view v-if="address.detail_area && address.detail_area !== ''" class="form-input">{{address.detail_area}}</view>
      </view>
      
      <view class="form-item">
        <input class="form-input" placeholder-class="address-placeholder" type="text" placeholder="详细地址，如楼盘门牌号等" :value="address.address" @input="updateDetailAddress"/>
      </view>

      
      <view class="address-bottom">
        <view class="address-ctrls">
          <view :class="{'address-ctrl': true, 'active': address.is_default == 1}" @tap="updateDefault">
            <image v-if="address.is_default == 1" class="address-default-icon" src="/static/images/icon_chose.png"></image>
            <image v-if="address.is_default != 1" class="address-default-icon" src="/static/images/icon_choise_no.png"></image>
            默认地址
          </view>
        </view>
          <view class="address-auto-fill" @tap="showAutoPopup = true">智能识别</view>
      </view>

    
    </view>

 
    <view class="bottom-btns">
      <view class="bottom-btn" @tap="addAddress">
        保存
      </view>
    </view>
    <!-- 省市区选择器 -->
    <mpvue-city-picker themeColor="$primary" ref="mpvueCityPicker" :pickerValueDefault="cityPickerValueDefault"
		 @onCancel="onCancel" @onConfirm="onConfirm"></mpvue-city-picker>

    <view class="auto-fill-popup" :class="{'auto-fill-popup-active': showAutoPopup}">
      <view class="auto-fill-popup-mask" @tap="showAutoPopup = false">
      </view>
      <view class="auto-fill-popup-content">
        <textarea 
          class="auto-fill-textarea" 
          placeholder-class="search-input-placeholder" 
          placeholder="请将信息复制并粘贴到此处，格式如 名称，手机号，省市区+详细地址" 
          @input="updateAutoInfo"/>  
        <view class="auto-fill-ctrl" @tap="confirmDiscern">
          智能识别
        </view>
      </view>
    </view>
  </view>

</template>

<script>
import AddressParse from 'common/address-parse/parse';
import mpvueCityPicker from 'components/mpvue-citypicker/mpvueCityPicker.vue'
import cityData from 'common/city.data.js';
export default {
  components: {
		mpvueCityPicker
  },
  data() {
    return {
      id: null,
      address: {
        name: '',
        phone: '',
        province: '',
        city: '',
        area: '',
        detail_area: '',
        address: '',
        post_code: '000000',
        is_default: true
      },

      showAutoPopup: false,
      autoInfo: '',


      mulLinkageTwoPicker: cityData,
      cityPickerValueDefault: [0, 0, 1],
      
    }
  },
  
  onShareAppMessage() {
    let shareInfo = this.$getShareInfo();
    return shareInfo;
  },
  onLoad(options) {
    if(!options.id) {
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
    
    // 将处理函数放进异步，防止onload两次
    setTimeout(() => {
      this.id = options.id;
      this.getData();
    }, 20);
  },
  onUnload() {
  },
  methods: {
    getData: function(){
      let params = {
        uid: uni.getStorageSync('userInfo').uid,
        id: this.id
      }
      this.$get('/address/info', params, res => {
        let address = res.data;
        address.detail_area = address.province + address.city + address.area;
        address.is_default = address.is_default == 1 ? true : false;
        this.address = address;

      })
    },
    addAddress: function() {
      let params = JSON.parse(JSON.stringify(this.address));
      params.uid = uni.getStorageSync('userInfo').uid;
      params.is_default = params.is_default ? 1 : 2;
      let paramValues = Object.values(params);
      for(let i = 0; i < paramValues.length; i++) {
        if(paramValues[i] == undefined || paramValues[i] == null || paramValues[i] === '') {
          return uni.showModal({
            title: '提示',
            content: '请填写完所有信息哦',
            showCancel: false
          });
        }
      }
      if(params.phone && !/^1[3456789]\d{9}$/.test(params.phone)) {
        return uni.showModal({
                title: '提示',
                content: '手机号码有误，请检查哦',
                showCancel: false
              });
      }
      this.$post('/address/update', params, res => {
        // 更新缓存触发器
        let storageTrigger = uni.getStorageSync('storageTrigger');
        storageTrigger.address = false;
        uni.setStorageSync('storageTrigger', storageTrigger);
        
        setTimeout(() => {
          uni.showToast({
            title: '编辑成功',
            mask: true
          })
        }, this.$toastDelay)
        setTimeout(()=> {
          uni.navigateBack();
        }, 1800)
      })

    },
    updateName: function(e) {
      this.address.name = e.detail.value;
    },
    updatePhone: function(e) {
      this.address.phone = e.detail.value;
    },

    
    updateAutoInfo(e) {
      this.autoInfo = e.detail.value;
    },
    confirmDiscern() {
      // 识别
      let discernResults = AddressParse.parse(this.autoInfo);
      console.log(discernResults);
      if(!discernResults || discernResults.length === 0) {
        return uni.showModal({
          title: '提示',
          content: '未识别到有效信息，请检查数据或者数据格式是否有误',
          showCancel: false
        })
      }
      let data = discernResults[0];
      if(!data.area || data.area === '') {
        return uni.showModal({
          title: '提示',
          content: '未识别到有效 县/区 的信息，请检查数据或者数据格式是否有误',
          showCancel: false
        })
      }
      this.address.name = data.name;
      this.address.phone = data.phone || data.mobile;
      this.address.detail_area = `${data.province}${data.city}${data.area}`;
      this.address.province = data.province;
      this.address.city = data.city;
      this.address.area = data.area;
      this.address.address = data.details;
      this.showAutoPopup = false;
    },

    // 三级联动选择
    showMulLinkageThreePicker() {
      this.$refs.mpvueCityPicker.show()
    },
    onCancel(e) {
      console.log(e);
    },
    onConfirm: function(e) {
      this.address.detail_area = e.label.split('-').join('');
      this.address.province = e.label.split('-')[0];
      this.address.city = e.label.split('-')[1];
      this.address.area = e.label.split('-')[2];
    },
    updateDetailAddress: function(e) {
      setTimeout(() => {
        this.address.address = e.detail.value;
      }, 0)
    },
    updateDefault() {
      this.address.is_default = !this.address.is_default;
    }


    
  }
}
</script>

<style lang="scss" scoped>
  @import 'address-edit.scss';
  .form-input {
    width: 100%;
    height: 2em;
    line-height: 2em;
  }
</style>