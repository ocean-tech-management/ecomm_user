<template>
  <view class="uni-common-pb-withbtn">
    <view class="sku-info-box">
      <view class="sku-image-box">
        <image class="sku-image" :src="afterSale.goods.images" mode="widthFix"></image>
      </view>
      <view class="sku-info">
        <view class="sku-name">{{afterSale.goods.title}}</view>
        <view class="sku-tips">{{afterSale.goods.attr}}</view>
      </view>
    </view>

    <view class="return-infos">
      <view class="return-info">
        <view class="return-label">物流状态</view>
        <view class="return-value">
          <view>{{logisticsStatusTexts[afterSale.buyer_received_goods]}}</view>
        </view>
      </view>
      
      <view class="return-info">
        <view class="return-label">售后说明</view>
        <view class="return-value">
          <view>{{afterSale.apply_reason}}</view>
        </view>
      </view>
      <view class="return-info">
        <view class="return-label">申请金额</view>
        <view class="return-value return-val">
          <view>￥{{afterSale.apply_price || '0.00'}}</view>
        </view>
      </view>
    </view>

    <view class="message-info">
      <view class="return-title">系统消息</view>
      <view class="message-content">{{msgInfo.content}}</view>
    </view>

    <view class="return-desc">
      <view class="return-label">回复信息</view>
      <input class="return-desc-input" type="text" maxlength="40" placeholder="请填写" :value="message" @input="updateMessage"/>
    </view>

    <view class="return-pictures-box">
      <view class="return-title">补充图片</view>
      <view class="return-pictures">
        <view v-if="images.length < 3" class="picture-uploader" @tap="uploadPicture">
          <image class="picture-uploader-icon" src="/static/images/time.png"></image>
          <view class="picture-uploader-text">上传凭证</view>
          <view class="picture-uploader-text">（最多3张）</view>
        </view>
        <view v-for="(item, index) in images" class="return-picture-item" :key="index">
          <view class="return-picture-box">
            <image class="return-picture" :src="item.url" mode="widthFix"></image>
          </view>
          <view class="return-picture-delete-box" :data-index="index" @tap="deletePicture">
            <image class="return-picture-delete" src="/static/images/delddre.png"></image>
          </view>
        </view>
      </view>
    </view>

    <view class="bottom-btns">
      <button class="bottom-btn contact-btn" open-type="contact">
        联系客服
      </button>
      <view class="bottom-btn confirm-btn" @tap="confirmInfo">
        提交回复
      </view>
    </view>




  </view>
</template>

<script>
import util from '@/common/util';
export default {
  data() {
    return {
      code: '',
      afterSale: {},
      msgInfo: {},

      message: '',
      images: [],
      logisticsStatusTexts: {
        [1]: '未收到货',
        [2]: '已收到货'
      }
    }
  },
  onLoad(options) {
    if(!options.code) {
      uni.showToast({
        title: '无效消息正在返回',
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
    this.code = options.code;
    this.getData();
    
    
  },
  methods: {
    getData() {
      let params = {
        msg_code: this.code,
        uid: uni.getStorageSync('userInfo').uid
      };
      this.$get('/afterSale/msgInfo', params, res => {
        let afterSale = res.data.afterInfo;
        afterSale.goods.attr = Object.values(JSON.parse(afterSale.goods.specs)).join('，');

        this.afterSale = afterSale;
        this.msgInfo = res.data.msgInfo;
      })
    },
    
    updateMessage(e) {
      this.message = e.detail.value;
    },


    uploadPicture() {
      uni.chooseImage({
        count: 1,
        success: (chooseImageRes) => {
          const tempFilePaths = chooseImageRes.tempFilePaths;

          let uploadTask = uni.uploadFile({
              url: `${util.serviceInfo.url}/upload/upload`, 
              filePath: tempFilePaths[0],
              name: 'file',
              header: {
                token: uni.getStorageSync('token').token
              },
              formData: {},
              success: (uploadFileRes) => {
                let res = JSON.parse(uploadFileRes.data);
                if(res && res.error_code == 0) {
                  let item = {
                    id: new Date().getTime(),
                    url: res.data
                  }
                  this.images.push(item);
                  uni.showToast({
                    title: '上传凭据成功',
                    mask: true
                  })
                } else {
                  console.log(res.msg);
                  uni.showModal({
                    title: '提示',
                    content: res.msg || '上传失败请重试',
                    showCancel: false
                  })
                }
              },
              fail: err => {
                console.log(err)
                uni.showToast({
                  title: '上传失败请重试',
                  icon: 'none'
                })
              }
          });
        }
      });
    },

    deletePicture(e) {
      let index= e.currentTarget.dataset.index;
      uni.showModal({
        title: '提示',
        content: '您确定删除该凭证图？',
        success: res => {
          if(res.confirm) {
            this.images.splice(index, 1);
            uni.showToast({
              title:'删除成功',
              mask: true
            })
          }
        }
      })
    },
    
    async confirmInfo() {
      let params = {
        after_sale_sn: this.afterSale.after_sale_sn,
        order_sn: this.afterSale.order_sn,
        msg_code: this.msgInfo.msg_code,
        uid: uni.getStorageSync('userInfo').uid,
        message: this.message,
        images: []
      }
      for(let i = 0; i < this.images.length; i++) {
        params.images.push(this.images[i].url)
      }

      if(!params.message || params.message.trim() === '') {
        return uni.showModal({
          title: '提示',
          content: '请填写回复信息哦',
          showCancel: false
        });
      }

      let data = null;
      await new Promise((resolve,reject) => {
        this.$post('/afterSale/msgSubmit', params, res => {
          data = res.data || {};
          resolve();
        }, err => {
          reject(err);
        });
      }).catch(err=>{console.log(err)});
      
      if(!data) return;
      setTimeout(() => {
        uni.showToast({
          title: '提交成功',
          mask: true,
          duration: 2000
        })
      }, this.$toastDelay)

      // 微信小程序订阅消息
      // #ifdef MP-WEIXIN
      if(data.templateId && data.templateId.length > 0) {
        uni.requestSubscribeMessage({
          tmplIds: data.templateId,
          success: res => { 
            let resItem = Object.values(res);
            if(!resItem.includes('reject')) return setTimeout(() => {
              uni.switchTab({
                url: '/pages/me/me',
                fail: err => {
                  console.log(err);
                }
              })
            }, 0);
            for(let i = 0; i < data.templateId.length; i++) {
              if(res[data.templateId[i]] == 'reject' || res[data.templateId[i]] == 'ban') {
                uni.showModal({
                  title: '提示',
                  content: '您有部分消息不接收或默认禁止该类别的消息推送，导致部分服务消息无法推送给您。为了后面您更好的体验，建议您前往 设置->订阅消息 开启相关服务消息的推送。',
                  confirmText: '前往设置',
                  success: res => {
                    if(res.confirm) {
                      uni.openSetting();
                    }
                  },
                  complete: res => {
                    setTimeout(() => {
                      uni.switchTab({
                        url: '/pages/me/me',
                        fail: err => {
                          console.log(err);
                        }
                      })
                    }, 0)
                  }
                })
                break;
              }
            }
          },
          fail: err => {
            console.log('err',err);
            if(err.errMsg == 'requestSubscribeMessage:fail The main switch is switched off') {
              uni.showModal({
                title: '提示',
                content: `您关闭了${this.$name}的消息提醒服务，无法给您推送对应的服务消息。为了后面您更好的体验，建议您前往 设置->订阅消息 开启服务消息的推送。`,
                confirmText: '前往设置',
                success: res => {
                  if(res.confirm) {
                    uni.openSetting();
                  }
                },
                complete: res => {
                  setTimeout(() => {
                    uni.switchTab({
                      url: '/pages/me/me',
                      fail: err => {
                        console.log(err);
                      }
                    })
                  }, 0)
                }

              })
            } else {
              setTimeout(() => {
                uni.switchTab({
                  url: '/pages/me/me',
                  fail: err => {
                    console.log(err);
                  }
                })
              }, 0)
            }
          }
        })
      } else {
        setTimeout(() => {
          uni.switchTab({
            url: '/pages/me/me',
            fail: err => {
              console.log(err);
            }
          })
        }, 1800)
      }
      // #endif
      // #ifndef MP-WEIXIN
      setTimeout(() => {
        uni.switchTab({
          url: '/pages/me/me',
          fail: err => {
            console.log(err);
          }
        })
      }, 1800)
      // #endif
      
    }
  }
  
}
</script>

<style lang="scss" scoped>
@import 'return-message.scss';
</style>