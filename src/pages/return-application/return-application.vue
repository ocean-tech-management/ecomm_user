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
      <picker class="return-info-picker" :value="logisticsTypeIndex" :range="logistics" range-key="text" @change="updateLogistics">
        <view class="return-info">
          <view class="return-label">物流状态</view>
          <view class="return-value">
            <view>{{returnInfo.logisticsStatusText ? returnInfo.logisticsStatusText : '请选择'}}</view>
          </view>
          <image class="return-select-arrow" src="/static/images/more.png"></image>
        </view>
      </picker>
      <picker class="return-info-picker" :value="returnInfo.reason" :range="reasons" range-key="text" @change="updateReason">
        <view class="return-info">
          <view class="return-label">售后原因</view>
          <view class="return-value">
              <view>{{returnInfo.reasonText ? returnInfo.reasonText : '请选择'}}</view>
          </view>
          <image class="return-select-arrow" src="/static/images/more.png"></image>
        </view>
      </picker>
      <view v-if="afterSale.type != 3 && (afterSale.goods.shipping_status == 1 || afterSale.goods.shipping_status == 2)" class="return-info">
        <view class="return-label-box">
          <view class="return-label">
            <text>退款金额</text>
            <text class="return-val">￥{{afterSale.goods.real_pay_price || '0.00'}}</text>
          </view>
          <view class="return-tips">不可修改，最多￥{{afterSale.goods.real_pay_price_origin || '0.00'}}，含发货邮费￥{{afterSale.goods.total_fare_price || '0.00'}}</view>
        </view>
      </view>
    </view>

    <block v-if="afterSale.type != 3 && (afterSale.goods.shipping_status != 1 && afterSale.goods.shipping_status != 2)">
      <label class="return-input-info">
        <view class="return-input-label">退款金额</view>
        <view class="return-input-value">
          <input class="return-val-input" v-model="afterSale.goods.real_pay_price" type="digit"/>
        </view>
      </label>
      <view class="return-input-tips">最多可退￥{{afterSale.goods.real_pay_price_origin || '0.00'}}，含发货邮费￥{{afterSale.goods.total_fare_price || '0.00'}}</view>
    </block>

    <view class="return-desc">
      <view class="return-label">退款说明</view>
      <input class="return-desc-input" type="text" maxlength="40" placeholder="请填写" :value="returnInfo.apply_reason" @input="updateDesc"/>
    </view>

    <view class="return-pictures-box">
      <view class="return-title">退款补充</view>
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

    <view v-if="afterSale.relations && afterSale.relations.length > 0" class="return-pictures-box">
      <view class="return-title">您还需退这些产品吗？</view>
      <view class="return-others">
        <view v-for="(item, index) in afterSale.relations" class="return-other-item" :data-index="index" :key="item.sku_sn" @tap="toggleSelect">
          <view class="other-thumb-box">
            <image class="other-thumb" :src="item.images" mode="widthFix"></image>
          </view>
          <view class="return-other-val">￥{{item.real_pay_price || '0.00'}}</view>
            <image v-if="selectOthers.indexOf(item.sku_sn) < 0" class="other-select" src="/static/images/icon_choise_no.png"></image>
            <image v-if="selectOthers.indexOf(item.sku_sn) >= 0" class="other-select" src="/static/images/icon_chose.png"></image>

        </view>
      </view>
    </view>

    <view class="bottom-btns">
      <view class="bottom-btn confirm-btn" @tap="confirmInfo">
        提交
      </view>
    </view>


  </view>
</template>

<script>
import util from '@/common/util';
export default {
  data() {
    return {
      afterSale: {},
      relations: [],
      selectOthers: [],
      selectOthersPrices: [],
      logisticsTypeIndex: null,
      returnInfo: {
        logisticsStatus: null,
        logisticsStatusText: '',
        reason: null,
        reasonText: '',
        apply_reason: '',
        type: 1
      },
      images: [],
      reasons: [
        {
          id: 1,
          text: '误拍'
        },
        {
          id: 2,
          text: '质量问题'
        },
        {
          id: 3,
          text: '与实物不符'
        },
        {
          id: 4,
          text: '已与客服成功沟通退售后'
        },
      ],
      logistics: [
        {
          id: 1,
          text: '已收到货'
        },
        {
          id: 2,
          text: '未收到货'
        },
      ]
    }
  },
  onLoad(options) {
    let afterSale = uni.getStorageSync('afterSale');
    afterSale.goods.attr = Object.values(JSON.parse(afterSale.goods.specs)).join('、');
    afterSale.type = options.type;
    if(afterSale.type == 3) afterSale.goods.real_pay_price = '0.00';
    this.afterSale = afterSale;

    if(options.type == 1) {
      this.logisticsTypeIndex = 1;
    } else {
      this.logisticsTypeIndex = 0;
    }
    this.returnInfo.logisticsStatus = this.logistics[this.logisticsTypeIndex].id;
    this.returnInfo.logisticsStatusText = this.logistics[this.logisticsTypeIndex].text;
    this.returnInfo.type = options.type;
  },
  methods: {
    toggleSelect(e) {
      let index = e.currentTarget.dataset.index;
      let sku_sn = this.afterSale.relations[index].sku_sn;
      if(this.selectOthers.indexOf(sku_sn) >= 0) {
        this.selectOthers.splice(this.selectOthers.indexOf(sku_sn), 1);
        this.selectOthersPrices.splice(this.selectOthers.indexOf(sku_sn), 1)
      } else {
        this.selectOthers.push(sku_sn);
        this.selectOthersPrices.push(this.afterSale.relations[index].real_pay_price)
      }
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

    updateDesc(e) {
      this.returnInfo.apply_reason = e.detail.value;
    },
    updateReason(e) {
      let index = e.detail.value;
      this.returnInfo.reason = this.reasons[index].id;
      this.returnInfo.reasonText = this.reasons[index].text;
    },
    updateLogistics(e) {
      let index = e.detail.value;
      this.returnInfo.logisticsStatus = this.logistics[index].id;
      this.returnInfo.logisticsStatusText = this.logistics[index].text;
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
        order_sn: this.afterSale.order_sn,
        goods: [],
        type: this.returnInfo.type,
        apply_reason: `${this.returnInfo.reasonText ? this.returnInfo.reasonText : ''}${this.returnInfo.apply_reason && this.returnInfo.apply_reason !== '' ? ('，' + this.returnInfo.apply_reason) : ''}`,
        received_goods_status: this.returnInfo.logisticsStatus,
        images: []
      }
      params.goods.push({
        sku_sn: this.afterSale.goods.sku_sn,
        apply_price: parseFloat(this.afterSale.goods.real_pay_price).toFixed(2)
      });
      for(let i = 0; i < this.selectOthers.length; i++) {
        params.goods.push({
          sku_sn: this.selectOthers[i],
          apply_price: this.selectOthersPrices[i]
        })
      }
      for(let i = 0; i < this.images.length; i++) {
        params.images.push(this.images[i].url)
      }
      if(!this.returnInfo.reasonText || this.returnInfo.reasonText == '') {
        return uni.showModal({
          title: '提示',
          content: '请勾选售后原因哦',
          showCancel: false
        });
      }
      if(!/^(\d|[1-9]\d+)(\.\d+)?$/.test(this.afterSale.goods.real_pay_price)) {
        return uni.showModal({
          title: '提示',
          content: '退款金额要为最小0的数字哦，请检查填入值和格式哦',
          showCancel: false
        });
      } if(parseFloat(this.afterSale.goods.real_pay_price) > parseFloat(this.afterSale.goods.real_pay_price_origin)) {
        return uni.showModal({
          title: '提示',
          content: '退款金额超过可退金额，请检查',
          showCancel: false
        });
      } else if(parseFloat(this.afterSale.goods.real_pay_price) < 0) {
        return uni.showModal({
          title: '提示',
          content: '退款金额要大于0哦，请检查',
          showCancel: false
        });
      }

      let paramValues = Object.values(params);
      for(let i = 0; i < paramValues.length; i++) {
        if(paramValues[i] == undefined || paramValues[i] == null || paramValues[i] === '' || params.apply_reason === '') {
          return uni.showModal({
            title: '提示',
            content: '请填写、勾选完所有信息，并提供最少一张凭证图哦',
            showCancel: false
          });
        }
      }

      let data = null;
      await new Promise((resolve,reject) => {
        this.$post('/afterSale/create', params, res => {
          data = res.data || {};
          resolve();
        }, err => {
          reject(err);
        });
      }).catch(err=>{console.log(err)})
      
      if(!data) return;
      setTimeout(() => {
        uni.showToast({
          title: '提交成功',
          mask: true,
          duration: 2000
        })
        
        setTimeout(() => {
          uni.switchTab({
            url: '/pages/me/me',
            fail: err => {
              console.log(err);
            }
          })
        }, 1800)
      }, this.$toastDelay)
      // 微信小程序订阅消息
      // #ifdef MP-WEIXIN
      uni.requestSubscribeMessage({
        tmplIds: data.templateId,
        success: res => { 
          let resItem = Object.values(res);
          if(!resItem.includes('reject')) return;
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
              }
            })
          }
        }
      })
      // #endif
      
    }
  }
  
}
</script>

<style lang="scss" scoped>
@import 'return-application.scss';
</style>