<template>
  <view class="flex-page">
    
    <!-- 页面内容 -->
    <view class="flex-page-content">
      <scroll-view v-if="addresses.length > 0" scroll-y class="tab-page-scroll">
        <view class="addresses">
            <view v-for="(item, index) in addresses" class="address" :data-id="item.id" :data-idx="index" :key="index" @tap="confirmAddress">
              <view class="address-userinfo">
                <view class="address-username">{{item.name}}</view>
                <view class="address-phone">{{item.phone}}</view>
              </view>
              <view class="address-info">
                <view v-if="item.is_default === 1" class="address-default-tag">默认</view>
                {{item.province}}{{item.city}}{{item.area}} {{item.address}}
              </view>
              <view class="address-bottom">
                <view class="address-ctrls">
                  <view :class="{'address-ctrl': true, 'active': item.is_default === 1}" :data-index="index" @tap="updateDefault">
                    <image v-if="item.is_default === 1" class="address-default-icon" src="/static/images/icon_chose.png"></image>
                    <image v-if="item.is_default !== 1" class="address-default-icon" src="/static/images/icon_choise_no.png"></image>
                    默认地址
                  </view>
                </view>
                <view class="address-ctrl-btn" :data-id="item.id" @tap="goToEditAddress">
                  <image class="address-ctrl-icon" src="/static/images/editaddr.png"></image>
                </view>
                <view class="address-ctrl-btn" :data-id="item.id" @tap="deleteAddress">
                  <image class="address-ctrl-icon" src="/static/images/delddre.png"></image>
                </view>
              </view>
                
            </view>
        </view>
      </scroll-view>
      
      <view v-if="addresses.length == 0 && addressLoading" class="scroll-tips">还没有收货地址哦</view>
    </view>
    <view class="bottom-btns">
      <view class="bottom-btn" @tap="goToAddAddress">
        +添加新地址
      </view>
    </view>

    
  </view>
</template>

<script>
export default {
  data() {
    return {
      type: 'manage',
      addresses: [],
      addressLoading: false,
      isCtrl: false
    }
  },
  onShareAppMessage() {
    let shareInfo = this.$getShareInfo();
    return shareInfo;
  },
  onShow() {
    this.getData();
  },
  onLoad(options) {
    if(options.type) {
      this.type = options.type;
    }
  },
  methods: {
    getData() {
      // 如果本次小程序周期内缓存触发器已经触发，存有相关缓存，那么就不请求对应接口数据而直接使用缓存数据
      let storageTrigger = uni.getStorageSync('storageTrigger');
      let addresses = uni.getStorageSync('addresses');
      if(storageTrigger && storageTrigger.address && addresses && addresses.length > 0) {
        this.addresses = addresses;
        this.addressLoading = false;
        return;
      }
      let params = {
        uid: uni.getStorageSync('userInfo').uid
      }
      this.$get('/address/list', params, res => {
        this.addresses = [];
        let addresses = res.data;
        this.addresses = addresses;
        this.$forceUpdate();
        this.addressLoading = true;

        
        uni.setStorageSync('addresses', this.addresses);
        // 更新缓存触发器
        storageTrigger.address = true;
        uni.setStorageSync('storageTrigger', storageTrigger);
      })
    },
    goToEditAddress(e) {
      this.isCtrl = true;
      let id = e.currentTarget.dataset.id;
      uni.navigateTo({
        url: `/pages/address-edit/address-edit?id=${id}`
      })

    },
    goToAddAddress() {
      uni.navigateTo({
        url: '/pages/address-add/address-add'
      })
    },
    updateDefault(e) {
      this.isCtrl = true;
      let index = e.currentTarget.dataset.index;
      let params = JSON.parse(JSON.stringify(this.addresses[index]));
      delete(params.create_time);
      if(params.is_default == 1) return;
      params.is_default = 1;
      params.uid = uni.getStorageSync('userInfo').uid;
      uni.showModal({
        title: '提示',
        content: '确定将其设置为默认地址吗',
        success: res => {
          if(res.confirm) {
            this.$post('/address/update', params, res => {
              // 更新缓存触发器
              let storageTrigger = uni.getStorageSync('storageTrigger');
              storageTrigger.address = false;
              uni.setStorageSync('storageTrigger', storageTrigger);
              setTimeout(() => {
                uni.showToast({
                  title: '设置成功',
                  mask: true
                })
                setTimeout(() => {
                  this.getData();
                }, 1800)
              }, this.$toastDelay)
            })
          }
        }
      })
    },
    deleteAddress(e) {
      this.isCtrl = true;
      let id = e.currentTarget.dataset.id;
      uni.showModal({
        title: '提示',
        content: '确定删除该地址吗？',
        success: res => {
          if(res.confirm) {
            let params = {
              uid: uni.getStorageSync('userInfo').uid,
              id: id
            }
            this.$get('/address/delete', params, res => {
              // 更新缓存触发器
              let storageTrigger = uni.getStorageSync('storageTrigger');
              storageTrigger.address = false;
              uni.setStorageSync('storageTrigger', storageTrigger);

              setTimeout(() => {
                uni.showToast({
                  title: '删除成功',
                  mask: true
                })
                setTimeout(() => {
                  this.getData();
                }, 1800)
              }, this.$toastDelay)
            })
          }
        }
      })
    },
    confirmAddress(e) {
      setTimeout(() => {
        if(this.isCtrl) return this.isCtrl = false;
        if(this.type == 'select') {
          // 选择后返回
          let index = e.currentTarget.dataset.idx;
          uni.setStorageSync('address', this.addresses[index]);
          uni.navigateBack();
        } else {
          let id = e.currentTarget.dataset.id;
          uni.navigateTo({
            url: `/pages/address-edit/address-edit?id=${id}`
          })
        }
        
      }, 10)
    }
  }

}
</script>

<style lang="scss" scoped>
  @import 'addresses.scss';
</style>