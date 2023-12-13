<template>
  <view class="flex-page">
    <view class="flex-page-content">
      <view class="page-img-box">
        <image class="page-img" :src="preOrder.desc" mode="widthFix"></image>
      </view>
    </view>
    <view class="page-btns">
      <view class="page-btn" @tap="showPayMenu">确定消费</view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      sn: '',
      
      preOrder: {
      },

      payTypes: [
        // 默认只给健康豆支付
        {
          id: 7,
          text: '健康豆支付'
        },
      ],
      allPayTypes: [
        {
          id: 2,
          text: '现金支付'
        },
        {
          id: 7,
          text: '健康豆支付'
        },
      ],
      
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
    let preOrder = uni.getStorageSync('preOrder');
    if(!preOrder || preOrder.combo_sn != options.sn) {
      return uni.showModal({
        title: '提示',
        content: '套餐无效或进入途径有误，即将离开该页面',
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
    this.preOrder = preOrder;
    uni.removeStorageSync('preOrder');
    this.initData();
  },
  methods: {
    initData() {

      if(this.preOrder.pay_type && this.preOrder.pay_type.length > 0) {
        let pay_type = this.preOrder.pay_type;
        let payTypes = [];
        for(let i = 0; i < pay_type.length; i++) {
          for(let j = 0; j < this.allPayTypes.length; j++) {
            if(pay_type[i] == this.allPayTypes[j].id) {
              payTypes.push(this.allPayTypes[j]);
              break;
            }
          }
        }
        this.payTypes = payTypes;
      }

    },
    showPayMenu() {
      let ablePayType = [];
      for(let i = 0; i < this.payTypes.length; i++) {
        ablePayType.push(this.payTypes[i].text)
      }
      uni.showActionSheet({
        itemList: ablePayType,
        itemColor: '#000000',
        success: (res) => {
          let index = res.tapIndex;
          this.payType = this.payTypes[index].id;
          this.tryCreateOrder();
        },
        fail: () => {},
        complete: () => {}
      });
        
    },

    
    tryCreateOrder() {
      if(this.paying) return;
      this.paying = true;
      let params = {
        uid: this.userInfo.uid,
        device_sn: this.preOrder.device_sn,
        combo_sn: this.preOrder.combo_sn,
        pay_type: this.payType
      };

      this.$post('/device/orderCreate', params, res => {
        if(params.pay_type == 2) {
          // #ifdef H5
          this.h5Pay(res);
          // #endif
          // #ifndef H5
          this.wxappPay(res);
          // #endif
        } else if(params.pay_type == 7) {
          setTimeout(() => {
            uni.showModal({
              title: '提示',
              content: '使用健康豆支付成功，点击确定前往机器操作说明页。请留意机器是否正常启动',
              showCancel: false,
              success: res => {
                // uni.navigateToMiniProgram({
                //   appId: 'wx9179668418f7b25f'
                // })
                
                uni.setStorageSync('order', {
                  oper_image: this.preOrder.oper_image,
                  phone: this.preOrder.concact_phone
                });
                uni.navigateTo({
                  url: `/market-pages/pages/device/operate-intro/operate-intro`
                })
              }
            })
            
            // uni.showModal({
            //   title: '提示',
            //   content: '支付成功，请留意机器是否正常启动',
            //   showCancel: false,
            //   success: res => {
            //   }
            // })
            this.paying = false;

          }, this.$toastDelay)
        }
      }, err => { 
        this.paying = false;
      })
    },

    h5Pay(res) {
      // h5给钱（走微信sdk）
      if (this.$jwx && this.$jwx.isWechat()) {//检查是否是微信环境
        this.$jwx.wxpay(res.data, wxmsg => {
          this.paying = false;

          if(wxmsg == '{"errMsg":"chooseWXPay:ok"}') {
            setTimeout(() => {
              uni.showModal({
                title: '提示',
                content: '支付成功，点击确定前往机器操作说明页。请留意机器是否正常启动',
                showCancel: false,
                success: res => {
                  // uni.navigateToMiniProgram({
                  //   appId: 'wx9179668418f7b25f'
                  // })
                  uni.setStorageSync('order', {
                    oper_image: this.preOrder.oper_image,
                    phone: this.preOrder.concact_phone
                  });
                  uni.navigateTo({
                    url: `/market-pages/pages/device/operate-intro/operate-intro`
                  })
                }
              })

            }, this.$toastDelay)
          } else {
            setTimeout(() => {
              uni.showToast({
                title: '支付失败请重试',
                mask: true,
                icon: 'none',
                duration: 4000
              })
            }, this.$toastDelay)
            
          }
          
        }, err => {
          this.paying = false;
        })
      }
    },
    wxappPay(res) {
      // 小程序或者app给钱，走支付平台统一接口
      let data = res.data;

      uni.requestPayment({
        provider: 'wxpay',
        timeStamp: data.timeStamp,
        nonceStr: data.nonceStr,
        package: data.package,
        signType: data.signType,
        paySign: data.paySign,
        success: res => {
          
          let wxpayRes = res;
          this.paying = false;
          setTimeout(() => {
            uni.showModal({
              title: '提示',
              content: '支付成功，点击确定前往机器操作说明页。请留意机器是否正常启动',
              showCancel: false,
              success: res => {
                // uni.navigateToMiniProgram({
                //   appId: 'wx9179668418f7b25f'
                // })
                
                uni.setStorageSync('order', {
                  oper_image: this.preOrder.oper_image,
                  phone: this.preOrder.concact_phone
                });
                uni.navigateTo({
                  url: `/market-pages/pages/device/operate-intro/operate-intro`
                })
              }
            })

          }, this.$toastDelay)

        },
        fail: err => {
          this.paying = false
          console.log(err);
          setTimeout(() => {
            uni.showToast({
              title: '支付失败请重试',
              mask: true,
              icon: 'none',
              duration: 4000
            })
          }, this.$toastDelay)
        }
      });
    }
  }
}
</script>

<style lang="scss" scoped>
@import 'combo.scss';
</style>