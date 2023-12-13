<template>
  <view class="flex-page">
    <view class="flex-page-content">

      <template v-if="preOrder.order_type != 6">
        <!-- 消费者地址 -->
        <view v-if="!address && addressLoading" class="order-user-bar" @tap="goToAddresses">
          <view class="order-user-infos">
            <view class="order-user-info">暂无收货地址，前去添加</view>
          </view>
          <image class="order-user-more" src="/static/images/more.png"></image>
        </view>


        <view v-if="address" class="order-user-bar" @tap="goToAddresses">
          <view v-if="address.is_default == 1" class="order-user-tag">默认</view>
          <view class="order-user-infos">
            <view class="order-user-info">{{ address.province }}{{ address.city }}{{ address.area }} {{ address.address }}
            </view>
            <view class="order-user-base-info">{{ address.phone }} {{ address.name }}</view>
          </view>
          <image class="order-user-more" src="/static/images/more.png"></image>
        </view>
      </template>

      <image class="order-address-border" src="/static/images/border_addre.png"></image>

      <!-- 订单商品列表 -->
      <view v-if="preOrder.goods" class="order-products">
        <view class="shopcar-orders">
          <view v-for="(item, index) in preOrder.goods" class="shopcar-order" :data-id="item.id" :data-idx="index"
            :key="item.id">
            <view class="shopcar-order-img-box">
              <image class="shopcar-order-img" :src="item.image" mode="widthFix" webp></image>
            </view>
            <view class="shopcar-order-info">
              <view class="shopcar-order-top">
                <view class="shopcar-order-name">{{ item.title }}</view>
                <view class="shopcar-order-property">{{ item.attr }}</view>
              </view>
              <view class="shopcar-order-val-box">
                <!-- 当前无会员价板块 -->
                <!-- <view class="shopcar-order-val" :class="{'shopcar-order-val-unactive': preOrder.user.vip_level}">￥{{item.price || '0.00'}}</view>
                <view v-if="item.member_price" class="shopcar-order-vip-val">
                  <text>会员 </text>
                  <text class="shopcar-order-val" :class="{'shopcar-order-val-unactive': !preOrder.user.vip_level}">￥{{item.member_price}}</text>
                </view> -->
                <view class="shopcar-order-val">
                  <text v-if="isCrowdActivitySign" class="crowd-activity-sign">积分</text><template v-else>￥</template>{{
                    item.price || '0.00' }}
                </view>
                <view class="shopcar-order-count">×{{ item.number }}</view>
              </view>

            </view>
          </view>
        </view>
      </view>

      <view class="order-infos">
        <picker :value="payTypeIndex" :range="payTypes" range-key="text" @change="updatePayType">
          <view class="order-info">
            <view class="order-info-name">支付方式</view>
            <view class="order-info-val highlight">
              <view>{{ payTypeTexts[preOrder.pay_type] }}</view>
            </view>
            <image class="order-info-arrow" src="/static/images/more.png"></image>
          </view>
        </picker>
        <block v-if="preOrder.pay_type == 6">
          <!-- 协议支付才显示银行卡相关信息 -->
          <view v-if="bankInfo" class="order-info" @tap="goToBankList">
            <view class="bank-select-box">
              <image class="bank-select-icon" src="/static/images/shopcar_select.png"></image>
            </view>
            <view class="bank-info">{{ bankInfo.bank_name }}({{ bankInfo.bank_card }})</view>
            <image class="order-info-arrow" src="/static/images/more.png"></image>
          </view>
          <view v-else class="bank-nodata" @tap="goToBankList">
            <view class="bank-nodata-icon-box">
              <image class="bank-nodata-icon" src="/static/images/icon_add.png"></image>
            </view>
            <view class="bank-nodata-tips">去签约银行卡</view>
          </view>
        </block>
      </view>

      <!-- 订单金额信息 -->
      <view v-if="preOrder.order_type != 4" class="order-infos">
        <view class="order-info" @tap="selectCoupon">
          <view class="order-info-name">优惠券</view>
          <view class="order-info-val">{{ selectCouponCodes.length > 0 ? ('已选择' + selectCouponCodes.length + '张优惠券') :
            '未选择优惠券' }}</view>
        </view>
      </view>

      <!-- 订单金额信息 -->
      <view class="order-infos">
        <view class="order-info">
          <view class="order-info-name">商品总价</view>
          <view class="order-info-val"><text v-if="isCrowdActivitySign" class="crowd-activity-sign">积分</text><template
              v-else>¥</template>{{ preOrder.order_amount || '0.00' }}</view>
        </view>
        <view class="order-info">
          <view class="order-info-name">运费</view>
          <view class="order-info-val">¥{{ !preOrder.fare || parseFloat(preOrder.fare) == 0 ? '免邮费' : preOrder.fare }}
          </view>
        </view>
        <view class="order-info">
          <view class="order-info-name">会员折扣</view>
          <view class="order-info-val">-¥{{ preOrder.memberDis || '0.00' }}</view>
        </view>
        <view class="order-info">
          <view class="order-info-name">优惠券</view>
          <view class="order-info-val">-¥{{ preOrder.couponDis || '0.00' }}</view>
        </view>
        <!-- <view class="order-info">
          <view class="order-info-name">促销活动</view>
          <view class="order-info-val">-¥5.00</view>
        </view> -->
        <!-- <view class="order-info-total">
          <view class="order-info-total-name">应付总额</view>
          <view class="order-info-total-val">¥293.00</view>
        </view> -->

      </view>

      <block v-if="preOrder.attach_type">
        <view class="attach-infos">
          <block v-if="preOrder.attach_type >= 1">
            <view class="attach-info">
              <view class="attach-label">真实姓名</view>
              <input class="attach-input" placeholder="请填写真实姓名" v-model="attach.real_name" @input="updateRealName" />
            </view>
            <view class="attach-info">
              <view class="attach-label">身份证号</view>
              <input class="attach-input" type="idcard" placeholder="请填写身份证号" maxlength="18" v-model="attach.id_card"
                @input="updateIdCard" />
            </view>
          </block>
          <block v-if="preOrder.attach_type >= 2">
            <view class="attach-info">
              <view class="attach-label">身份证正面</view>
              <view class="pichture-uploader-box">
                <view class="picture-uploader" @tap="uploadIdCard('front')">
                  <view class="picture-uploader-default" v-if="!attach.id_card_front">
                    <image class="picture-uploader-icon" src="/static/images/time.png"></image>
                    <view class="picture-uploader-text">上传正面图</view>
                  </view>
                  <image v-else class="idcard-picture" :src="attach.id_card_front" mode="widthFix"></image>
                </view>
              </view>

            </view>
            <view class="attach-info">
              <view class="attach-label">身份证反面</view>
              <view class="pichture-uploader-box">
                <view class="picture-uploader" @tap="uploadIdCard('back')">
                  <view class="picture-uploader-default" v-if="!attach.id_card_back">
                    <image class="picture-uploader-icon" src="/static/images/time.png"></image>
                    <view class="picture-uploader-text">上传反面图</view>
                  </view>
                  <image v-else class="idcard-picture" :src="attach.id_card_back" mode="widthFix"></image>
                </view>
              </view>
            </view>
          </block>
        </view>
      </block>
      <view v-if="preOrder.attach_type && preOrder.attach_type !== -1"
        style="padding: 5rpx 30rpx; font-size: 24rpx; color: #f00;">
        因商品特殊性，需要补充上面的相关信息哈
      </view>

      <view v-show="!showCoupons" class="order-desc-box">
        <textarea class="order-desc-textarea" placeholder-class="search-input-placeholder" placeholder="可在此处留下您的备注信息哦"
          @input="updateDesc" />
      </view>

      <!-- 优惠券 -->
      <view v-show="showCoupons" class="discount-popup">
        <view class="popup-mask" @tap="confirmCoupon"></view>
        <view class="discounts">
          <view class="popup-title">选择优惠券</view>
          <view class="popup-close-icon" @tap="confirmCoupon">×</view>
          <view class="discounts-content">
            <label v-for="(item, index) in coupons"
              :class="{ 'discount': true, 'disabled': item.use_status == 2, 'should-replace': validShouldReplace(item) }"
              :key="item.uc_code" :data-index="index" @tap="updateSelectCoupons">
              <image class="coupon-bg" src="/static/images/btn_cuepon.png"></image>
              <view class="discount-content">
                <!-- 区分打折和定额 -->
                <view v-if="item.coupon.type != 4" class="conpon-price-box">
                  <view class="coupon-price">
                    <text class="coupon-symbol">￥</text>
                    <text class="coupon-value">{{ item.coupon.used_amount }}</text>
                  </view>
                </view>
                <view v-if="item.coupon.type == 4" class="conpon-price-box">
                  <view class="coupon-price">
                    <text class="coupon-value">{{ item.coupon.with_discount * 1000 / 100 }}</text>
                    <text class="coupon-symbol">折</text>
                  </view>
                  <view class="coupon-discount-limit">
                    最高抵{{ item.used_amount || 0 }}
                  </view>
                </view>

                <view class="coupon-info">
                  <view class="coupon-name">{{ item.coupon.name }}</view>
                  <view class="coupon-extra-info">
                    <view class="coupon-expire-time">{{ item.valid_end_time }}</view>
                    <image v-show="!isSelectCoupon(item) && item.use_status == 1" class="coupon-checkbox"
                      src="/static/images/icon_choise_no.png"></image>
                    <image v-show="isSelectCoupon(item) && item.use_status == 1" class="coupon-checkbox"
                      src="/static/images/icon_chose.png"></image>
                  </view>
                </view>
              </view>

            </label>


            <label class="discount discount-flex-center" @tap="resetSelectCoupon">
              <view class="discount-key">不使用优惠券</view>
              <image v-if="selectCouponCodes.length > 0" class="coupon-checkbox" src="/static/images/icon_choise_no.png">
              </image>
              <image v-if="selectCouponCodes.length == 0" class="coupon-checkbox" src="/static/images/icon_chose.png">
              </image>
            </label>
          </view>
          <view class="confirm-btn-box">
            <view class="bottom-btn" @tap="confirmCoupon">
              确认
            </view>
          </view>
        </view>
      </view>
    </view>


    <!-- 支付密码 -->
    <view v-if="showPayPwdPopup" class="pay-popup">
      <view class="pay-popup-mask"></view>
      <view class="pay-popup-wrapper">
        <view class="pay-popup-content">
          <view class="pay-popup-title">请输入支付密码</view>
          <view class="pay-popup-tips">金额：{{ preOrder.realPayPrice }}元</view>
          <view class="pay-popup-input-box">
            <input class="pay-popup-input" type="number" maxlength="6" :password="true" v-model="pay_pwd"
              @input="updatePayPwd" />
          </view>
        </view>
      </view>
    </view>

    <!-- 验证码弹窗 -->
    <view v-if="showSmsCodePopup" class="pay-popup">
      <view class="pay-popup-mask"></view>
      <view class="pay-popup-wrapper">
        <view class="pay-popup-content">
          <view class="pay-popup-title">请输入验证码</view>
          <view class="pay-popup-input-box">
            <input class="pay-popup-input" type="number" maxlength="6" v-model="sms_code" @input="updateSmsCode" />
          </view>
          <view class="pay-popup-tips">短信已发送对银行卡对应手机号码</view>
          <view class="pay-popup-code-btn" @tap="tryReCode">{{ codeTimeText }}</view>

          <view class="pay-popup-close" @tap="cancelVerify">×</view>
        </view>
      </view>
    </view>



    <!-- 结账操作 -->
    <view class="order-ctrls">
      <view class="order-ctrl-info">
        <text>应付款：</text>
        <text class="should-pay"><text v-if="isCrowdActivitySign" class="crowd-activity-sign">积分</text><template
            v-else>¥</template>{{ preOrder.realPayPrice }}</text>
      </view>
      <view v-if="preOrder.realPayPrice == '0.00'" class="order-ctrl-btn"
        :class="{ 'disabled': preOrder.pay_type == 2 && !couldPay }" @tap="payOrder">立即下单</view>
      <block v-else>
        <view v-if="preOrder.pay_type != 6" class="order-ctrl-btn"
          :class="{ 'disabled': preOrder.pay_type == 2 && !couldPay }" @tap="payOrder">立即支付</view>
        <view v-else class="order-ctrl-btn" @tap="tryShowPayPwdPopup">生成订单</view>
      </block>
    </view>




  </view>
</template>

<script>
import util from '@/common/util';
import moment from 'moment';
import md5 from 'md5';
import config from '@/config';
export default {
  data() {
    return {
      address: null,
      userInfo: uni.getStorageSync('userInfo'),
      addressLoading: false,
      preOrder: {},
      order_remark: '',
      couldPay: false,
      paying: false,

      fromShopcar: false,
      shopCarItem: [],

      attach: {
        real_name: '',
        id_card: '',
        id_card_front: null,
        id_card_back: null
      },

      // 优惠券板块
      showCoupons: false,
      coupons: null,
      selectCoupons: [],
      selectCouponCodes: [],
      selectCouponLimit: false,

      isCrowdActivitySign: false, // 是否从福利页面进入的福利订单

      payTypeIndex: 0,
      payTypes: [
        // 默认只给微信支付
        {
          id: 2,
          text: '微信支付'
        }
      ],
      allPayTypes: [
        {
          id: 2,
          text: '微信支付'
        },
        {
          id: 1,
          text: '余额支付'
        },
        {
          id: 5,
          text: `${config.written.crowdBalanceName}支付`
        },
        {
          id: 6,
          text: '银行卡协议支付'
        },
        {id: 7, text: `${config.written.integralName}支付`},
        {id: 8, text: `${config.written.ticketBalance}支付`},
      ],
      payTypeTexts: {
        [1]: '余额支付',
        [2]: '微信支付',
        [5]: `${config.written.crowdBalanceName}支付`,
        [6]: '银行卡协议支付',
        [7]: `${config.written.integralName}支付`, // 集品豆订单 order_type = pay_type = 7
        [8]: `${config.written.ticketBalance}支付` // 礼品券订单 order_type = pay_type = 8
      },

      bankInfo: null,
      allowPayPwd: true,
      showPayPwdPopup: false,
      pay_pwd: '',
      allowSms: true,
      showSmsCodePopup: false,
      sms_code: '',

      // 验证码
      couldSend: true,
      codeTimeText: "重新发送",
      currentTime: 0,
      codeInterval: null,
    }
  },
  onShareAppMessage() {
    let shareInfo = this.$getShareInfo();
    return shareInfo;
  },
  onLoad(options) {

    let preOrder = uni.getStorageSync('preOrder');
    if(preOrder) {
      for(let i = 0; i < preOrder.goods.length; i++) {
        preOrder.goods[i].attr = Object.values(JSON.parse(preOrder.goods[i].specs || {})).join('，');
      }
      // 福利订单: -1-不赠送 1-集品豆 2-健康豆 3-集品券
      this.isCrowdActivitySign = preOrder.order_type == 6; // 福利商品
      this.isCrowdActivitySign = preOrder.pay_type == 7; // 集品豆专区
      this.preOrder = preOrder;
      if(this.preOrder.pay_type == 6 && !this.bankInfo) {
        this.getBanks();
      }

      this.preOrder = preOrder;
      if(preOrder.allow_pay_type) {
        let payTypes = [];
        for(let i = 0; i < this.allPayTypes.length; i++) {
          let item = JSON.parse(JSON.stringify(this.allPayTypes[i]));
          if(preOrder.allow_pay_type.includes(item.id)) {
            payTypes.push(item);
          }
        }
        this.payTypes = payTypes;
        if(payTypes.length > 1) {
          for(let i = 0; i < payTypes.length; i++) {
            if(preOrder.pay_type == payTypes[i].id) {
              this.payTypeIndex = i;
            }
          }
        }
      }
    }
    if(!options.id || options.id != this.preOrder.id) {
      uni.showToast({
        title: '订单已失效',
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

    if(this.preOrder.attach_type && this.preOrder.attach_type >= 1) {
      if(uni.getStorageSync('attach')) {
        let attach = uni.getStorageSync('attach');
        this.attach = {
          real_name: attach.real_name,
          id_card: attach.id_card,
          id_card_front: attach.id_card_front,
          id_card_back: attach.id_card_back
        }
      }
      if(!uni.getStorageSync('hasAttachTips')) {
        uni.showModal({
          title: '提示',
          content: '你选择的商品需要提供真实姓名、身份证号等信息才可以购买，请您在备注板块上方补充相关信息再下单哈。（一定时间内不再提醒）',
          showCancel: false,
          success: res => {
            uni.setStorageSync('hasAttachTips', true);
          }
        })
      }
    }

    if(uni.getStorageSync('shopCarItem')) {
      // 来自购物车
      this.shopCarItem = uni.getStorageSync('shopCarItem');
      uni.removeStorageSync('shopCarItem');
      if(this.shopCarItem.length > 0) this.fromShopcar = true;
    }

    // #ifdef H5
    let isiOS = !!navigator.userAgent.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/);
    if(!isiOS) {
      if (this.$jwx && this.$jwx.isWechat()) {//检查是否是微信环境
        this.$jwx.initJssdk(data => {
          this.$jwx.hideMenu();
        })
      }
    }
    if (this.$jwx && this.$jwx.isWechat()) {//检查是否是微信环境
      let url = window.location.origin;
      this.$jwx.readySdk(() => {
        this.couldPay = true;
      })
      this.$jwx.initShare();
    }
    // #endif
    // #ifndef H5
    this.couldPay = true;
    // #endif
    uni.removeStorageSync('address');
    this.getAddress();

    if(this.preOrder.CouponDisArr) {
      this.initSelectCoupons();
    }
  },
  onUnload() {
    if(this.codeInterval) clearInterval(this.codeInterval)
  },
  onShow() {
    setTimeout(() => {
      if(uni.getStorageSync('address') && this.preOrder.order_type != 6) {
        this.address = uni.getStorageSync('address');
        uni.removeStorageSync('address');
        this.getPreOrder();
      } else if(uni.getStorageSync('hasUpdatePayPwd')) {
        // 更新密码也预订单走一遍，确定已经更新完成
        uni.removeStorageSync('hasUpdatePayPwd');
        this.getPreOrder();
      }
    }, 10)
    if(uni.getStorageSync('selectedBank')) {
      // 存在选择银行的情况，赋值并移除缓存
      this.bankInfo = uni.getStorageSync('selectedBank');
      uni.removeStorageSync('selectedBank');
    }
  },
  methods: {
    getPreOrder(handler) {
      let params = {
        goods: this.preOrder.goods,
        uid: uni.getStorageSync('userInfo').uid,
        pay_type: this.preOrder.pay_type,
        integral: 0,
        usedIntegralDis: 2,
        uc_code: this.selectCouponCodes,
        usedCouponDis: this.selectCouponCodes.length == 0 ? 2 : 1,

        order_type: this.preOrder.order_type,
        city: this.address ? this.address.city_code : null,
        province: this.address ? this.address.province_code : null,
        area: this.address ? this.address.area_code : null,
        shipping_address_detail: this.address ? {
          Province: this.address.province,
          City: this.address.city,
          Area: this.address.area,
          ProvinceId: this.address.province_code,
          CityId: this.address.city_code,
          AreaId: this.address.area_code,
          address: this.address.address,
        } : null,
        readyType: 2    //1商品详情页触发，2预订单使用
      }

      if(this.preOrder.pt_join_type) params.pt_join_type = this.preOrder.pt_join_type;
      if(this.preOrder.attach_type) params.attach_type = this.preOrder.attach_type;

      if(this.preOrder.ppyl_join_type) params.ppyl_join_type = this.preOrder.ppyl_join_type;
      if(this.preOrder.ppyl_join_type == 2) params.activity_sn = this.preOrder.activity_sn;
      if(this.preOrder.ppyl_join_type) params.autoPpyl = this.preOrder.autoPpyl;

      // 保留预订单时的使用积分状态
      this.integralInitStatus = this.integral;  //因为现在积分计算不出发更新预订单，只有在更改优惠券才更新预订单
      this.$spost('/order/ready', params, res => {
        this.preOrder = res.data;
        // 存原来的数值以便计算
        let realPayPrice = parseFloat(this.preOrder.realPayPrice);
        let allDisPrice = parseFloat(this.preOrder.allDisPrice);
        this.preOrder.realPayPriceOrigin = realPayPrice;
        this.preOrder.allDisPriceOrigin = allDisPrice;

        this.usedIntegral = 0;

        // 计算显示用的值
        if(this.preOrder.userAllIntegral / 100 < realPayPrice) {
          this.usedIntegral = this.preOrder.userAllIntegral;
        } else if(this.preOrder.userAllIntegral / 100 >= realPayPrice) {
          this.usedIntegral = realPayPrice * 100;
        };
        this.integralDis = (this.usedIntegral / 100).toFixed(2);

        // -1-不赠送 1-集品豆 2-健康豆 3-集品券
        this.isGiftTypeActive = this.preOrder.goods.every(e => e.gift_type && e.gift_type > -1)

        if(this.preOrder.pay_type == 6 && !this.bankInfo) {
          this.getBanks();
        }

        if(handler && typeof handler == 'function') handler(res);
      })
    },
    getAddress() {
      let params = {
        uid: uni.getStorageSync('userInfo').uid
      }
      this.$get('/address/list', params, res => {
        let addresses = res.data;
        if(this.preOrder.city) {
          for(let i = 0; i < addresses.length; i++) {
            if(addresses[i].city_code == this.preOrder.city) {
              this.address = addresses[i];
              break;
            }
          }
        } else {
          for(let i = 0; i < addresses.length; i++) {
            if(addresses[i].is_default) {
              this.address = addresses[i];
              break;
            }
          }
        }
        if(!this.address && addresses.length > 0) this.address = addresses[0];
        this.addressLoading = true;
      })
    },

    updatePayType(e) {
      let index = e.detail.value;
      this.preOrder.pay_type = this.payTypes[index].id;
      this.getPreOrder();

      if(this.preOrder.pay_type == 6 && !this.bankInfo) {
        this.getBanks();
      }
    },

    // 其他信息补充
    // 上传身份证图
    uploadIdCard(direction = 'front') {
      uni.chooseImage({
        success: (chooseImageRes) => {
          const tempFilePaths = chooseImageRes.tempFilePaths;

          let uploadTask = uni.uploadFile({
              url: `${util.serviceInfo.url}/upload/certificate`,
              filePath: tempFilePaths[0],
              name: 'file',
              header: {
                token: uni.getStorageSync('token').token
              },
              formData: {},
              success: (uploadFileRes) => {
                let res = JSON.parse(uploadFileRes.data);
                if(res && res.error_code == 0) {
                  if(direction == 'front') {
                    this.attach.id_card_front = res.data;
                  } else {
                    this.attach.id_card_back = res.data;
                  }
                  uni.showToast({
                    title: '上传成功',
                    mask: true
                  })
                }
              },
              fail: res => {
                uni.showToast({
                  title: '上传失败请重试',
                  icon: 'none'
                })
              }
          });
        }
      });
    },
    // 更新真实姓名
    updateRealName(e) {
      this.attach.real_name = e.detail.value;
    },
    // 更新身份证号
    updateIdCard(e) {
      this.attach.id_card = e.detail.value;
    },
    // 更新备注
    updateDesc(e) {
      this.order_remark = e.detail.value;
    },

    // 优惠券板块
    initSelectCoupons() {
      for(let i = 0; i < this.preOrder.CouponDisArr.length; i++) {
        this.selectCoupons.push(this.preOrder.CouponDisArr[i]);
        this.selectCouponCodes.push(this.preOrder.CouponDisArr[i].coupon_uc_code);
      }
    },
    isSelectCoupon(item) {
      return this.selectCouponCodes.includes(item.uc_code);
    },
    // 检查互斥状态
    validShouldReplace(item) {
      if(this.isSelectCoupon(item)) return false; //已包含的不用蒙版
      if(!this.selectCoupons[0]) return false; //还没选中任何券不用蒙版
      if(this.selectCoupons[0].select_type == 1) {
        return true;  //选中的券为互斥券直接蒙版
      } else if(this.selectCoupons[0].select_type == 2) {
        if(item.select_type == 2) {
          // 选中叠加券，可叠加的那些券可以选中
          return false;
        } else {
          return true;
        }
      }
    },
    getselectCouponLimit() {
      this.selectCouponLimit = false;
      if(this.selectCoupons.length == 0) return this.selectCouponLimit = false;
      for(let i = 0; i < this.selectCoupons.length; i++) {
        if(this.selectCoupons[i].select_type == 1) {
          this.selectCouponLimit = true;
          break;
        }
      }
    },
    selectCoupon() {
      if(!this.coupons) {
        let params = {
          order_amount: this.preOrder.order_amount,
          goods: this.preOrder.goods,
          uid: uni.getStorageSync('userInfo').uid
        }
        this.$post('/order/coupon', params, res => {
          this.coupons = res.data;
          for(let i = 0; i < this.coupons.length; i++) {
            this.coupons[i].coupon.used_amount = parseFloat(this.coupons[i].coupon.used_amount);
          }
          this.showCoupons = true;
        })
      } else {
        this.showCoupons = true;
      }
    },
    updateSelectCoupons(e) {
      let index = e.currentTarget.dataset.index;
      if((!index && index !== 0) || this.coupons[index].use_status != 1) {
        // 优惠券不可用
        uni.showToast({
          title: this.coupons[index].invalid_reason || '优惠券不可用',
          mask: true,
          icon: 'none'
        })
        return;
      }
      // 已存在直接去掉选中
      if(this.selectCouponCodes.includes(this.coupons[index].uc_code)) {
        let position = this.selectCouponCodes.indexOf(this.coupons[index].uc_code);
        this.selectCouponCodes.splice(position, 1);
        this.selectCoupons.splice(position, 1);

        return this.getselectCouponLimit();
      }
      // select_type: 1不可叠加  2可叠加。 1和2不可叠加
      if(this.coupons[index].select_type == 1) {
        // 现在直接重置选中列表
        this.selectCouponCodes = [];
        this.selectCoupons = [];

        this.selectCouponCodes.push(this.coupons[index].uc_code);
        this.selectCoupons.push(this.coupons[index]);
        this.selectCouponLimit = true;

      } else if(this.coupons[index].select_type == 2) {
        // 检索有没有不能叠加的。有的话移除
        for(let i = 0; i < this.selectCoupons.length; i++) {
          if(this.selectCoupons[i].select_type == 1) {
            this.selectCouponCodes.splice(i, 1);
            this.selectCoupons.splice(i, 1);
            break;
          }
        }
        this.selectCouponCodes.push(this.coupons[index].uc_code);
        this.selectCoupons.push(this.coupons[index]);
      }
      this.getselectCouponLimit();
    },
    resetSelectCoupon() {
      this.selectCouponCodes = [];
      this.selectCoupons = [];
      this.selectCouponLimit = false;
    },
    confirmCoupon() {
      this.getPreOrder();
      this.showCoupons = false;
    },


    // 协议支付的下单流程
    getBanks() {
      let params = {
        uid: uni.getStorageSync('userInfo').uid,
        page: 1
      }
      this.$get('/user/bankCardList', params, res => {
        let dataList = [];
        if(res.data && res.data.list) dataList = res.data.list;
        if(dataList.length > 0) {
          this.bankInfo = {
            sign_no: dataList[0].sign_no,
            bank_name: dataList[0].bank_name,
            bank_card: dataList[0].bank_card
          }
        }
      })
    },
    tryShowPayPwdPopup() {
      if(this.preOrder.pay_pwd_unset) {
        uni.showModal({
          title: '提示',
          content: '您未设置过支付密码，需要设置支付密码后才可以使用银行卡协议支付',
          confirmText: '立即前往',
          success: res => {
            if(res.confirm) {
              uni.navigateTo({
                url: `/mine-pages/pages/setting/paypwd-setting/paypwd-setting`
              })
            }
          }
        })
      } else if(!this.bankInfo) {
        uni.showModal({
          title: '提示',
          content: '您未选择签约银行卡或未签约，请前往签约或选择',
          confirmText: '立即前往',
          success: res => {
            if(res.confirm) {
              this.goToBankList();
            }
          }
        })
      } else {
        this.allowPayPwd = true;
        this.pay_pwd = '';
        this.showPayPwdPopup = true;
      }
      this.paying = false;
    },
    updatePayPwd(e) {
      if(!this.allowPayPwd) return;  //防止同时请求多遍【手机自动输入】
      this.pay_pwd = e.detail.value;
      if(this.pay_pwd.length == 6) {
        this.allowPayPwd = false;
        this.showPayPwdPopup = false;
        this.payOrder();
      }
    },
    updateSmsCode(e) {
      if(!this.allowSms) return;  //防止同时请求多遍【手机自动输入验证码】
      this.sms_code = e.detail.value;
      if(this.sms_code.length == 6) {
        this.allowSms = false;
        this.showSmsCodePopup = false;

        let data = uni.getStorageSync('preParams');
        let params = {
          uid: uni.getStorageSync('userInfo').uid,
          order_sn: data.order_sn,
          sms_code: this.sms_code,
          order_channel: 1  //1普通订单，2充值订单
        }
        this.paying = true;
        this.$post('/agreement/verifyPaySms', params, res => {

          uni.setStorageSync('shopCarItem', this.shopCarItem);
          uni.redirectTo({
            url: `/market-pages/pages/agreement-pay/paying/paying?sn=${data.order_sn}`
          })
        }, err => {
          // 出错了因为汇聚失败就是失败，没得重发
          uni.redirectTo({
            url: `/market-pages/pages/agreement-pay/pay-result/pay-result?type=2`
          })
          this.showSmsCodePopup = false;
        })
      }

    },
    cancelVerify() {
      this.showSmsCodePopup = false;
      // 关闭弹窗当下单失败处理
      uni.redirectTo({
        url: `/market-pages/pages/agreement-pay/pay-result/pay-result?type=2`
      })
    },
    // 验证码倒计时
    tryReCode() {
      if(this.currentTime > 0) return;
      let data = uni.getStorageSync('preParams');
      let params = {
        uid: uni.getStorageSync('userInfo').uid,
        order_sn: data.order_sn,
        sign_no: this.bankInfo.sign_no
      }
      this.$post('/agreement/paySmsAgain', params, res => {
        this.sms_code = '';
        setTimeout(() => {
          uni.showToast({
            title: '发送成功',
            icon: 'success',
            mask: true
          })
          this.currentTime = 60;
          this.tryCodeColdDown();
          this.handlerCodeColdDown();
        }, this.$toastDelay);
      })
    },
    tryCodeColdDown() {
      // 倒计时
      this.codeInterval = setInterval(() => {
        this.handlerCodeColdDown();
      }, 1000)
    },
    handlerCodeColdDown() {
      this.currentTime--;
      this.codeTimeText = this.currentTime + "秒";
      this.couldSend = false;
      if (this.currentTime <= 0) {
        if(this.codeInterval) clearInterval(this.codeInterval);
        this.codeTimeText = "重新发送";
        this.currentTime = 0;
        this.couldSend = true;
      }
    },


    // 支付
    payOrder() {
      // if(!uni.getStorageSync('userInfo').vip_level && !uni.getStorageSync('link_uid')) {
      //   return uni.showModal({
      //     title: '提示',
      //     content: '仅限会员使用，没有推荐人或推荐人非代理人身份暂无法购买哦',
      //     showCancel: false
      //   })
      // }

      if(this.paying) return;
      // #ifdef H5
      let disabled = !this.couldPay && this.preOrder.pay_type == 2; //只有微信支付才校验
      if(disabled) {
        uni.showToast({
          title: '加载配置中，请等几秒后再尝试支付哦',
          mask: true,
          icon: 'none'
        })
        return;
      }
      // #endif
      if((!this.address || !this.address.id) && this.preOrder.order_type != 6) {
        return uni.showToast({
          title: '请选择地址',
          mask: true,
          icon: 'none'
        })
      }

      if(this.preOrder.attach_type) {
        if(this.preOrder.attach_type >= 1) {
          let addressName = this.address.name.replace(/\s+/g,"");
          let realName = this.attach.real_name.replace(/\s+/g,"");
          if(realName == '') {
            return uni.showToast({
              title: '请填写真实姓名',
              mask: true,
              icon: 'none'
            })
          } else if(realName != addressName) {
            return uni.showModal({
              title: '提示',
              content: '请如实填写身份证姓名，身份证姓名必须和收货人姓名一致。',
              showCancel: false
            })
          }
          if(this.attach.id_card === '') {
            return uni.showToast({
              title: '请填写身份证号',
              mask: true,
              icon: 'none'
            })
          }
          if(!/(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/.test(this.attach.id_card)) {
            return uni.showToast({
              title: '身份证号格式有误',
              mask: true,
              icon: 'none'
            })
          }
        }
        if(this.preOrder.attach_type >= 2) {
          if(!this.attach.id_card_front || !this.attach.id_card_back) {
            return uni.showToast({
              title: '请传身份证正反面',
              mask: true,
              icon: 'none'
            })
          }
        }
      }
      let uc_code = [];
      for(let i = 0; i < this.preOrder.CouponDisArr.length; i++) {
        uc_code.push(this.preOrder.CouponDisArr[i].coupon_uc_code);
      }
      let params = {
        uid: uni.getStorageSync('userInfo').uid,
        belong: 1, //1商城2课程
        user_phone: uni.getStorageSync('userInfo').phone,
        used_integral: this.preOrder.usedIntegral,
        total_price: this.preOrder.order_amount,
        fare_price: this.preOrder.fare,
        discount_price: this.preOrder.allDisPrice,
        real_pay_price: this.preOrder.realPayPrice,
        goods: this.preOrder.goods,
        uc_code: uc_code,
        pay_type: this.preOrder.pay_type,

        order_remark: this.order_remark,
        order_link_user: uni.getStorageSync('link_uid') || null,

        order_type: this.preOrder.order_type,
      }
      if (this.preOrder.order_type != 6) {
        // order_type = 6是福利订单，不需要填写地址
        params.address_id = this.address.id;
        params.shipping_address = `${this.address.province}${this.address.city}${this.address.area}${this.address.address}`;
        params.shipping_name = this.address.name;
        params.shipping_phone = this.address.phone;
        params.city = this.address.city_code;
        params.province = this.address.province_code;
        params.area = this.address.area_code;
        params.shipping_address_detail = this.preOrder.shipping_address_detail;
        params.address_area = `${this.address.province}${this.address.city}${this.address.area}`;
      }
      if(this.preOrder.attach_type && this.preOrder.attach_type === 1) {
        params.attach = this.attach;
        params.attach.real_name = this.attach.real_name.replace(/\s+/g,"");
        delete params.attach.id_card_front;
        delete params.attach.id_card_back;
      } else if(this.preOrder.attach_type && this.preOrder.attach_type === 2) {
        params.attach = this.attach;
        params.attach.real_name = this.attach.real_name.replace(/\s+/g,"");
      }

      // if(this.preOrder.activity_id) params.activity_id = this.preOrder.activity_id;
      if(this.preOrder.pt_join_type) params.pt_join_type = this.preOrder.pt_join_type;
      if(this.preOrder.pt_join_type == 2) params.activity_sn = this.preOrder.activity_sn;

      if(this.preOrder.ppyl_join_type) params.ppyl_join_type = this.preOrder.ppyl_join_type;
      if(this.preOrder.ppyl_join_type == 2) params.activity_sn = this.preOrder.activity_sn;
      if(this.preOrder.ppyl_join_type) params.autoPpyl = this.preOrder.autoPpyl;

      if(params.pay_type == 6) {
        // 协议支付，塞东西
        params.sign_no = this.bankInfo.sign_no;
        params.pay_pwd = md5(this.pay_pwd);
      }

      uni.setStorageSync('preOrderInfo', params);
      this.paying = true;

      let time = moment();
      this.$post('/order/create', params, res => {

        // 更新过期时间
        time = time.add(res.data.expireTimestamp || 120, 'seconds').format('x');
        params.time = time;
        params.expireTimestamp = res.data.expireTimestamp || 120;
        uni.setStorageSync('preOrderInfo', params);


        // 更新身份证缓存
        let oldAttach = uni.getStorageSync('attach');
        if(this.preOrder.attach_type && this.preOrder.attach_type !== -1) {
          let attach = {
            real_name: this.attach.real_name || (oldAttach.real_name || ''),
            id_card: this.attach.id_card || (oldAttach.id_card || ''),
            id_card_front: this.attach.id_card_front || (oldAttach.id_card_front || ''),
            id_card_back: this.attach.id_card_back || (oldAttach.id_card_back || '')
          }
          uni.setStorageSync('attach', attach);
        }

        // 更新预订单响应数据
        uni.setStorageSync('preParams', res.data);

        if(params.real_pay_price == '0.00') {
          // 不用钱
          this.freePay(res);
        } else if(params.pay_type == 1) {
          // 余额支付
          this.balancePay(res);
        } else if(params.pay_type == 5 || params.pay_type == 7 || params.pay_type == 8) {
          // 集品券/集品豆/礼品券支付
          this.crowdBalancePay(res);
        } else if(params.pay_type == 6) {
          // 协议支付
          this.agreementPayAskSmscode(res);
        } else {
          // 给钱，分情况给

          // #ifdef H5
          this.h5Pay(res);
          // #endif
          // #ifndef H5
          this.wxappPay(res);
          // #endif
        }

      }, err => {
        this.paying = false;
      })

    },
    freePay() {
      // 不用钱
      uni.removeStorageSync('preOrder');
      if(this.fromShopcar) this.deleteShopcarItem();
      uni.showToast({
        title: '下单成功',
        mask: true,
        duration: 2000
      })
      // 微信小程序订阅消息
      // #ifdef MP-WEIXIN
      this.subscribeMsg(data, () => {
        setTimeout(() => {
          let url = '/pages/pay-result/pay-result';
          if(this.preOrder.order_type == 2) url = `/market-pages/pages/collage/collage-detail/collage-detail?code=${this.preOrder.goods[0].activity_id}&sn=${data.activity_sn}`;
          uni.redirectTo({
            url: url
          })
        }, 1800);
      })
      // #endif
      // #ifndef MP-WEIXIN
      setTimeout(() => {
        let url = '/pages/pay-result/pay-result';
        if(this.preOrder.order_type == 2) url = `/market-pages/pages/collage/collage-detail/collage-detail?code=${this.preOrder.goods[0].activity_id}&sn=${data.activity_sn}`;
        uni.redirectTo({
          url: url
        })
      }, 1800);
      // #endif

    },
    balancePay(res) {
      let data = res.data;
      if(data.complete_pay == true) {
        uni.removeStorageSync('preOrder');
        if(this.fromShopcar) this.deleteShopcarItem();

        // 微信小程序订阅消息
        // #ifdef MP-WEIXIN
        this.subscribeMsg(data, () => {
          setTimeout(() => {
            let url = '/pages/pay-result/pay-result';
            if(this.preOrder.order_type == 2) {
              url = `/market-pages/pages/collage/collage-detail/collage-detail?code=${this.preOrder.goods[0].activity_id}&sn=${data.activity_sn}`;
            } else if(this.preOrder.order_type == 4) {
              if(data.activity_sn) {
                url = `/market-pages/pages/ppyl/ppyl-team/ppyl-team?code=${this.preOrder.goods[0].activity_id}&sn=${data.activity_sn}`
              }
            }

            uni.redirectTo({
              url: url
            })
          }, 10);
        })
        // #endif
        // #ifndef MP-WEIXIN
        setTimeout(() => {
          let url = '/pages/pay-result/pay-result';
          if(this.preOrder.order_type == 2) {
            url = `/market-pages/pages/collage/collage-detail/collage-detail?code=${this.preOrder.goods[0].activity_id}&sn=${data.activity_sn}`;
          } else if(this.preOrder.order_type == 4) {
            if(data.activity_sn) {
              url = `/market-pages/pages/ppyl/ppyl-team/ppyl-team?code=${this.preOrder.goods[0].activity_id}&sn=${data.activity_sn}`
            }
          }

          uni.redirectTo({
            url: url
          })
        }, 10);
        // #endif
      } else {
        setTimeout(() => {
          uni.redirectTo({
            url: '/pages/pay-result/pay-result?type=2'
          })
        }, 10);
        return;
      }
    },
    crowdBalancePay(res) {
      let data = res.data;
      if(data.complete_pay == true) {
        uni.removeStorageSync('preOrder');
        if(this.fromShopcar) this.deleteShopcarItem();

        // 微信小程序订阅消息
        // #ifdef MP-WEIXIN
        this.subscribeMsg(data, () => {
          setTimeout(() => {
            let url = '/pages/pay-result/pay-result';
            if(this.preOrder.order_type == 2) {
              url = `/market-pages/pages/collage/collage-detail/collage-detail?code=${this.preOrder.goods[0].activity_id}&sn=${data.activity_sn}`;
            } else if(this.preOrder.order_type == 4) {
              if(data.activity_sn) {
                url = `/market-pages/pages/ppyl/ppyl-team/ppyl-team?code=${this.preOrder.goods[0].activity_id}&sn=${data.activity_sn}`
              }
            }

            uni.redirectTo({
              url: url
            })
          }, 10);
        })
        // #endif
        // #ifndef MP-WEIXIN
        setTimeout(() => {
          let url = '/pages/pay-result/pay-result';
          if(this.preOrder.order_type == 2) {
            url = `/market-pages/pages/collage/collage-detail/collage-detail?code=${this.preOrder.goods[0].activity_id}&sn=${data.activity_sn}`;
          } else if(this.preOrder.order_type == 4) {
            if(data.activity_sn) {
              url = `/market-pages/pages/ppyl/ppyl-team/ppyl-team?code=${this.preOrder.goods[0].activity_id}&sn=${data.activity_sn}`
            }
          }

          uni.redirectTo({
            url: url
          })
        }, 10);
        // #endif
      } else {
        setTimeout(() => {
          uni.redirectTo({
            url: '/pages/pay-result/pay-result?type=2'
          })
        }, 10);
        return;
      }
    },
    h5Pay(res) {
      // h5给钱（走微信sdk）
      if (this.$jwx && this.$jwx.isWechat()) {//检查是否是微信环境
        this.$jwx.wxpay(res.data, wxmsg => {

          uni.removeStorageSync('preOrder');
          if(this.fromShopcar) this.deleteShopcarItem();
          if(wxmsg == '{"errMsg":"chooseWXPay:ok"}') {
            setTimeout(() => {
              uni.showToast({
                title: '支付成功',
                mask: true,
                duration: 2000
              })
              setTimeout(() => {
                let url = '/pages/pay-result/pay-result';
                if(this.preOrder.order_type == 2) {
                  url = `/market-pages/pages/collage/collage-detail/collage-detail?code=${this.preOrder.goods[0].activity_id}&sn=${data.activity_sn}`;
                } else if(this.preOrder.order_type == 4 && this.preOrder.ppyl_join_type == 1) {
                  url = `/market-pages/pages/ppyl/ppyl-team/ppyl-team?code=${this.preOrder.goods[0].activity_id}&sn=${data.activity_sn}`
                }
                uni.redirectTo({
                  url: url
                })
              }, 1800);
            },this.$toastDelay)
          } else {
            setTimeout(() => {
              uni.showToast({
                title: '支付失败',
                icon: 'none',
                mask: true,
                duration: 2000
              })
              setTimeout(() => {
                uni.redirectTo({
                  url: '/pages/pay-result/pay-result?type=2'
                })
              }, 1800);
            },this.$toastDelay)

          }

        }, err => {
          this.paying = false;
        })
      }
    },
    wxappPay(res) {
      // 小程序或者app给钱，走支付平台统一接口
      let data = res.data;
      let params = {}
      // #ifdef APP-PLUS
      const orderInfo = {}
      orderInfo.appid = data.appid; // 微信开放平台审核通过的应用APPID(请登录open.weixin.qg.com查看注意与公众号的APPID不同)
      orderInfo.partnerid = data.partnerid; // 微信支付分配的商户号
      orderInfo.prepayid = data.prepayid; // 微信返回的支付交易会话ID
      orderInfo.package = 'Sign=WXPay'; // 暂填写固定值Sign=WXPav
      orderInfo.noncestr = data.noncestr; // 随机字符串，不长于32位。推荐随机数生成算法
      orderInfo.timestamp = data.timestamp; // 时间戳
      orderInfo.sign = data.sign; // 签名，详见签名生成算法注意: 签名方式一定要与统一下单接口使用的-致
      params = {
        provider: 'wxpay',
        orderInfo
      }
      // #endif
      // #ifndef APP-PLUS
      params.provider = 'wxpay';
      params.timeStamp = data.timeStamp;
      params.nonceStr = data.nonceStr;
      params.package = data.package;
      params.signType = data.signType;
      params.paySign = data.paySign;
      // #endif
      uni.requestPayment({
        ...params,
        success: res => {

          let wxpayRes = res;
          // 微信小程序订阅消息
          // #ifdef MP-WEIXIN
          this.subscribeMsg(data, () => {
            this.toResult(wxpayRes, data);
          })
          // #endif
          // #ifndef MP-WEIXIN
          this.toResult(wxpayRes, data);
          // #endif

        },
        fail: err => {
          console.log(err);
          if(this.fromShopcar) this.deleteShopcarItem();
          uni.removeStorageSync('preOrder');
          setTimeout(() => {
            uni.redirectTo({
              url: '/pages/pay-result/pay-result?type=2'
            })
          }, 10);
        }
      });
    },

    subscribeMsg(data, handler) {
      uni.requestSubscribeMessage({
        tmplIds: data.templateId,
        success: res => {
          let resItem = Object.values(res || {});
          if(!resItem.includes('reject')) return;
          uni.getSetting({
            withSubscriptions: true,
            success: setting => {
              console.log('success');
              let subscribeList = setting.subscriptionsSetting;
              if(!subscribeList.mainSwitch || Object.values(subscribeList.itemSettings || {}).length > 0) {
                let items = subscribeList.itemSettings, itemValues = [];  //订阅消息列表， 订阅消息默认值
                if(items) itemValues = Object.values(items || {});
                if(!subscribeList.mainSwitch || itemValues.includes('reject')) {
                  uni.setStorageSync('subscribeReject', 'part');  //局部消息被拒绝
                }
              }

            },
            fail: err => {
              console.log(err);
            }
          })
        },
        fail: err => {
          console.log('err',err);
          if(err.errMsg == 'requestSubscribeMessage:fail The main switch is switched off') {
            uni.setStorageSync('subscribeReject', 'all');  //用户关闭了整个消息推送
          }
        },
        complete: res => {
          if(handler && typeof handler == 'function') handler();
        }
      })
    },

    agreementPayAskSmscode(res) {
      this.allowSms = true;
      this.sms_code = '';

      this.currentTime = 60;
      this.tryCodeColdDown();
      this.handlerCodeColdDown();

      this.showSmsCodePopup = true;
    },

    toResult(res, data) {
      console.log(res, data);
      uni.removeStorageSync('preOrder');
      if(this.fromShopcar) this.deleteShopcarItem();
      if(res.errMsg == 'requestPayment:ok') {
        setTimeout(() => {
          let url = '/pages/pay-result/pay-result';
          if(this.preOrder.order_type == 2) {
            url = `/market-pages/pages/collage/collage-detail/collage-detail?code=${this.preOrder.goods[0].activity_id}&sn=${data.activity_sn}`;
          } else if(this.preOrder.order_type == 4 && this.preOrder.ppyl_join_type == 1) {
            if(data.activity_sn) {
              url = `/market-pages/pages/ppyl/ppyl-team/ppyl-team?code=${this.preOrder.goods[0].activity_id}&sn=${data.activity_sn}`
            }
          }
          uni.redirectTo({
            url: url
          })
        }, 10);
      } else {
        setTimeout(() => {
          uni.redirectTo({
            url: '/pages/pay-result/pay-result?type=2'
          })
        }, 10);
        return;
      }

    },

    deleteShopcarItem() {
      let params = {
        uid: uni.getStorageSync('userInfo').uid,
        cart_sn: this.shopCarItem
      }
      // 静默删除
      this.$spost('/shopCart/delete', params, res => {})
    },
    goToAddresses() {
      uni.navigateTo({
        url: '/pages/addresses/addresses?type=select'
      })
    },
    goToBankList() {
      uni.navigateTo({
        url: `/market-pages/pages/agreement-pay/bankcards/bankcards`
      })
    }
  }
}
</script>
<style lang="scss" scoped>
@import 'pre-order.scss';
</style>