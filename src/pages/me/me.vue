<template>
  <view class="uni-common-page uni-common-pb">
    <view class="userinfo-box" :style="'padding-top:' + (nativeInfo.statusBarHeight + 40) + 'px'">
      <view class="userinfo-box-content">
        <view class="page-title" :style="'padding-top:' + (nativeInfo.statusBarHeight + 10) + 'px'">
          <!-- 个人中心 -->
        </view>
        <view class="userinfo">
          <image class="user-avatar" :src="userInfo.avatarUrl || '/static/images/logo.png'" @tap="tryUnlockEgg" webp>
          </image>
          <view class="userinfo-info">
            <view class="userinfo-info-item">
              <view class="userinfo-name">{{ userInfo.name || '游客' }}</view>
              <view class="userinfo-states">
                <view class="userinfo-state">{{ userInfo.vip_name }}</view>
                <view v-if="userInfo.team_vip_level" class="userinfo-state">{{ userInfo.team_vip_name }}</view>
              </view>
            </view>
            <!-- #ifndef H5 -->
            <view v-if="userInfo.need_auth" class="auth-ctrl" @tap="goToAuth">授权登录</view>
            <!--            <view v-else-if="userInfo.uid && userInfo.old_sync === 2" class="auth-ctrl" @tap="handlerSyncTrigger">老用户升级</view>-->
            <!-- #endif -->
            <!-- #ifdef H5 -->
            <!--            <view v-if="!userInfo.need_auth && !userInfo.primary_uid && userInfo.allow_sync_primary_account" class="auth-ctrl" @tap="goToSyncMainAccount">主账号同步</view>-->
            <!-- #endif -->
            <view v-if="userInfo.share_id" class="userinfo-userId" @tap="copyUserId('share_id')">
              <text>ID: {{ userInfo.share_id }}</text>
              <view class="copy">复制</view>
            </view>
          </view>
        </view>
        <view class="userinfo-blackboard-vip" @tap="goToCrowdFundingIncomes">
          <view class="userinfo-blackboard-vip-box">
            <view class="userinfo-blackboard-vip-item">
              <view class="userinfo-blackboard-val">
                {{ userInfo.crowd_balance || 0.00 }}
              </view>
              <view class="userinfo-blackboard-vip-title">{{ crowdBalanceName || '集品券' }}</view>
            </view>
            <view class="userinfo-blackboard-vip-item" @tap.stop="goToAdvanceBuyCards">
              <view class="userinfo-blackboard-val">
                {{ userInfo.advance_buy_card || 0 }}
              </view>
              <view class="userinfo-blackboard-vip-title">{{ advanceBuyCardName || '集品卡' }}</view>
            </view>
            <view class="userinfo-blackboard-vip-item" @tap.stop="goToBalanceRecord(1)">
              <view class="userinfo-blackboard-val">
                {{ userInfo.integral || 0.00 }}
              </view>
              <view class="userinfo-blackboard-vip-title">{{ integralName || '集品豆' }}</view>
            </view>
            <view class="userinfo-blackboard-vip-item" @tap.stop="goToHealthyBalances">
              <view class="userinfo-blackboard-val">
                {{ userInfo.healthy_balance || 0.00 }}
              </view>
              <view class="userinfo-blackboard-vip-title">健康豆</view>
            </view>
          </view>
        </view>
      </view>

      <view class="userinfo-blackboards" @tap="goToIncomes">
        <view class="userinfo-blackboard-box">
          <view class="userinfo-blackboard-item">
            <view class="userinfo-blackboard-val ">
              {{ incomeInfo.todayInCome || '' }}
            </view>
            <view class="userinfo-blackboard-title">今日收益</view>
          </view>
          <view class="userinfo-blackboard-item">
            <view class="userinfo-blackboard-val ">
              {{ incomeInfo.MonthInCome || '' }}
            </view>
            <view class="userinfo-blackboard-title">本月收益</view>
          </view>
          <view class="userinfo-blackboard-item">
            <view class="userinfo-blackboard-val ">
              {{ incomeInfo.allInCome || '' }}
            </view>
            <view class="userinfo-blackboard-title">累计收益</view>
          </view>
        </view>
      </view>
    </view>

    <view class="user-entrance-list">
      <view class="user-entrance-item" @tap="goToCrowdFundingOrders">
        <view class="user-entrance-title">福利参与记录</view>
        <image class="user-entrance-arrow" src="/static/images/more.png"></image>
      </view>
    </view>


    <!-- 猜你喜欢和全网热销 -->
    <view v-if="otherProducts[recommandTabIndex]" class="recommands">
      <view class="recommand-tabs">
        <view :class="{ 'recommand-tab': true, 'active': recommandTabIndex == 'other' }" data-val="other"
          @tap="updateRecommandTabIndex">猜你喜欢</view>
        <view :class="{ 'recommand-tab': true, 'active': recommandTabIndex == 'hot' }" data-val="hot"
          @tap="updateRecommandTabIndex">全网热销</view>
      </view>
      <!-- 动态标记点 -->
      <swiper class="recommand-swiper-box" autoplay circular indicator-dots indicator-color="#d8d8d8"
        indicator-active-color="#000">
        <swiper-item v-for="(swiper, index) in otherProducts.swiperLen[recommandTabIndex]" :key="index">
          <view class="recommand-list">
            <view v-for="item in otherProducts[recommandTabIndex]" class="recommand-item" :data-sn="item.goods_sn"
              @tap="goToProduct" :key="item.sku_sn">
              <view class="recommand-img-box">
                <image class="recommand-img" :src="item.main_image" mode="widthFix" webp lazy-load></image>
              </view>
              <view class="recommand-name">{{ item.title }}</view>
              <view v-if="recommandTabIndex == 'hot'" class="recommand-val">{{ item.sale_price }}</view>
              <view v-if="recommandTabIndex == 'other'" class="recommand-val">￥{{ item.sku_min }}</view>
            </view>
          </view>
        </swiper-item>
      </swiper>
    </view>

    <view class="me-grids">
      <view class="me-grid-toolbar" data-index="0" @tap="goToOrders()">
        <view class="me-grid-toolbar-title">商城订单</view>
        <view class="me-grid-toolbar-more">
          查看全部
          <image class="me-grid-arrow" src="/static/images/more.png"></image>
        </view>
      </view>
      <view class="me-grid-list">
        <view class="me-grid-item" data-index="1" @tap="goToOrders(1)">
          <view class="me-grid-img-box">
            <image class="me-grid-img" src="/static/images/orders/no_pay.png" webp></image>
            <view v-if="userInfo.orderNumber && userInfo.orderNumber.order && userInfo.orderNumber.order[1]"
              class="me-grid-corner">
              {{ userInfo.orderNumber.order[1] > 99 ? '···' : userInfo.orderNumber.order[1] }}
            </view>
          </view>
          <view class="me-grid-title">待付款</view>
        </view>
        <view class="me-grid-item" data-index="2" @tap="goToOrders(2)">
          <view class="me-grid-img-box">
            <image class="me-grid-img" src="/static/images/orders/has_pay.png" webp></image>
            <view v-if="userInfo.orderNumber && userInfo.orderNumber.order && userInfo.orderNumber.order[2]"
              class="me-grid-corner">
              {{ userInfo.orderNumber.order[2] > 99 ? '···' : userInfo.orderNumber.order[2] }}
            </view>
          </view>
          <view class="me-grid-title">待发货</view>
        </view>
        <view class="me-grid-item" data-index="3" @tap="goToOrders(3)">
          <view class="me-grid-img-box">
            <image class="me-grid-img" src="/static/images/orders/wait_logistics.png" webp></image>
            <view v-if="userInfo.orderNumber && userInfo.orderNumber.order && userInfo.orderNumber.order[3]"
              class="me-grid-corner">
              {{ userInfo.orderNumber.order[3] > 99 ? '···' : userInfo.orderNumber.order[3] }}
            </view>
          </view>
          <view class="me-grid-title">已发货</view>
        </view>
        <view class="me-grid-item" @tap="goToReturns">
          <view class="me-grid-img-box">
            <image class="me-grid-img" src="/static/images/orders/after_sale.png"></image>
          </view>
          <view class="me-grid-title">退款/售后</view>
        </view>
      </view>
    </view>


    <!-- 售后消息 -->
    <view v-if="newMsg && newMsg.msg_code" class="msg-box" @tap="goToReturnMsgs">
      <view class="msg-icon-box">
        <image class="msg-icon" src="/static/images/msg_active.png"></image>
      </view>
      <view class="msg-info">
        <view class="msg-title">售后消息提醒</view>
        <view class="msg-content">售后订单{{ newMsg.order_sn }}待处理</view>
      </view>
    </view>

    <view class="me-grids">
      <view class="me-grid-toolbar" data-index="0">
        <view class="me-grid-toolbar-title">会员管理</view>
      </view>
      <view class="me-grid-list">
        <view v-if="userInfo.vip_level" class="me-grid-item" @tap="goToIncomes">
          <image class="me-grid-img" src="/static/images/icon/myincome.png"></image>
          <view class="me-grid-title">我的收益</view>
        </view>
        <!-- #ifdef MP-WEIXIN -->
        <view class="me-grid-item" @tap="goToLives">
          <image class="me-grid-img" src="/static/images/icon/lives.png"></image>
          <view class="me-grid-title">直播购物</view>
        </view>
        <!-- #endif -->
        <view v-if="userInfo.vip_level" class="me-grid-item" @tap="goToTeams">
          <image class="me-grid-img" src="/static/images/icon/myteam.png"></image>
          <view class="me-grid-title">我的团队</view>
        </view>
        <view class="me-grid-item" @tap="goToNormals">
          <image class="me-grid-img" src="/static/images/icon/mynormals.png"></image>
          <view class="me-grid-title">VIP用户</view>
        </view>
        <view class="me-grid-item" @tap="goToAchievement">
          <image class="me-grid-img" src="/static/images/icon/achievement.png"></image>
          <view class="me-grid-title">会员晋级</view>
        </view>
        <view class="me-grid-item" @tap="goToAchievementTeam">
          <image class="me-grid-img" src="/static/images/icon/achievement_team.png"></image>
          <view class="me-grid-title">团队晋级</view>
        </view>
        <view class="me-grid-item" @tap="goToPoster">
          <image class="me-grid-img" src="/static/images/icon/myposter.png"></image>
          <view class="me-grid-title">我的海报</view>
        </view>
        <view class="me-grid-item" @tap="goToCoupons">
          <image class="me-grid-img" src="/static/images/icon/coupons.png"></image>
          <view class="me-grid-title">优惠券</view>
        </view>
      </view>
    </view>

    <view class="me-grids">
      <view class="me-grid-toolbar" data-index="0">
        <view class="me-grid-toolbar-title">我的账户</view>
      </view>
      <view class="me-grid-list">
        <view class="me-grid-item" @tap="goToAddresses">
          <image class="me-grid-img" src="/static/images/icon_mine/address.png"></image>
          <view class="me-grid-title">地址管理</view>
        </view>
        <view v-if="userInfo.healthy_balance && userInfo.healthy_balance > 0" class="me-grid-item"
          @tap="goToHealthyBeanConvert">
          <image class="me-grid-img" src="/static/images/icon_mine/translation.png"></image>
          <view class="me-grid-title">健康豆记录</view>
        </view>
        <!-- #ifndef MP-WEIXIN -->
        <view class="me-grid-item" @tap="goToContact">
          <image class="me-grid-img" src="/static/images/icon_mine/contact.png"></image>
          <view class="me-grid-title">联系客服</view>
        </view>
        <!-- #endif -->
        <!-- #ifdef MP-WEIXIN -->
        <button class="me-grid-item" open-type="contact">
          <image class="me-grid-img" src="/static/images/icon_mine/contact.png"></image>
          <view class="me-grid-title">联系客服</view>
        </button>
        <!-- #endif -->
        <view class="me-grid-item" @tap="goToSetting">
          <image class="me-grid-img" src="/static/images/icon_mine/setting.png"></image>
          <view class="me-grid-title">设置</view>
        </view>
        <view class="me-grid-item" @tap="goToPerfectInfo">
          <image class="me-grid-img" src="/static/images/icon_mine/perfect.png"></image>
          <view class="me-grid-title">更新信息</view>
        </view>
        <view class="me-grid-item" @tap="goToUnbindCard">
          <image class="me-grid-img" src="/static/images/icon_mine/bankcard.png"></image>
          <view class="me-grid-title">解绑银行卡</view>
        </view>
        <view class="me-grid-item" @tap="goToUpdatePayPwd">
          <image class="me-grid-img" src="/static/images/icon_mine/paypwd.png"></image>
          <view class="me-grid-title">支付密码</view>
        </view>
        <view class="me-grid-item" @tap="undo">
          <image class="me-grid-img" src="/static/images/icon_mine/help.png"></image>
          <view class="me-grid-title">帮助中心</view>
        </view>
        <view v-if="!userInfo.need_auth && userInfo.is_has === 0" class="me-grid-item" @tap="goToUserSynchronous">
          <image class="me-grid-img" src="/static/images/icon_mine/sync.png"></image>
          <view class="me-grid-title">用户同步</view>
        </view>
        <!-- #ifdef APP-PLUS -->
        <view class="me-grid-item" @tap="updateSystem">
          <image class="me-grid-img" src="/static/images/icon_mine/update.png"></image>
          <view class="me-grid-title">系统更新</view>
        </view>
        <!-- #endif -->
      </view>
    </view>
    <view class="support-by">
      <!-- #ifdef APP-PLUS -->
      {{ wgtinfo.version }}
      <!-- #endif -->
      <!-- #ifndef APP-PLUS -->
      1.0.0
      <!-- #endif -->
    </view>


    <view v-if="showPhonePopup" class="ask-phone-popup">
      <view class="ask-phone-mask" @tap="showPhonePopup = false"></view>
      <view class="ask-phone-content">
        <view class="ask-phone-title">请授权获取您的微信绑定手机号码</view>
        <button class="ask-phone-btn" open-type="getPhoneNumber" @getphonenumber="confirmBindPhone">
          授权
        </button>
      </view>
    </view>

    <view v-if="showUserPopup" class="ask-phone-popup">
      <view class="ask-phone-mask" @tap="showUserPopup = false"></view>
      <view class="ask-phone-content">
        <view class="ask-phone-title">请授权获取您的微信授权信息</view>
        <button class="ask-phone-btn" open-type="getUserInfo" @getuserinfo="confirmAuth">
          授权
        </button>
      </view>
    </view>
    <view v-if="showUserLoginPopup" class="ask-login-popup">
      <view class="ask-phone-mask" @tap="showUserLoginPopup = false"></view>
      <view class="ask-login-content">
        <button class="ask-login-btn" @tap="triggerUserSelect('new')">
          新用户
        </button>
        <view class="ask-login-btn-tips">新用户指在本平台没有账号的用户</view>
        <button class="ask-login-btn btn-legacy" @tap="triggerUserSelect('legacy')">
          已有用户
        </button>
        <view class="ask-login-btn-tips">已有账号指本平台存在已有账号的用户</view>
      </view>
    </view>
    <!-- #ifdef MP-WEIXIN -->
    <privacy-popup ref="privacyComponent" direction="middle"></privacy-popup>
    <!-- #endif -->
  </view>
</template>
<script>
  import config from '@/config';
  import h5Copy from '@/common/junyi-h5-copy.js';
  import moment from 'moment';
  // #ifdef APP-PLUS
  import wgtUpdate from '@/common/wgtUpdate';
  // #endif
  export default {
    data() {
      return {
        systemName: config.name,
        // 应用信息
        wgtinfo: {
          version: '', // 应用的版本名称 对应manifest.json中的version
          versionCode: '', // 应用的版本号
        },

        crowdBalanceName: config.written.crowdBalanceName,
        advanceBuyCardName: config.written.advanceBuyCardName,
        integralName: config.written.integralName,
        ticketBalance: config.written.ticketBalance,

        nativeInfo: {
          statusBarHeight: 20
        },

        hasLoad: false,

        userInfo: {},
        incomeInfo: {},
        newMsg: {},
        ppylOrderInfo: {},
        ppylIncomeInfos: {},

        haveRecommand: false,
        otherProducts: {},
        recommandTabIndex: 'other',

        eggTriggerNum: 0,
        eggLimit: 5,
        eggTimeout: null,

        memberTexts: {
        },
        showPhonePopup: false,
        showUserPopup: false,
        wxCode: '',
        showUserLoginPopup: false, // 用户同步弹窗
      }
    },
    onLoad() {
      let nativeInfo = uni.getStorageSync('nativeInfo');
      if(nativeInfo) this.nativeInfo = nativeInfo;
      let userInfo = uni.getStorageSync('userInfo');
      if(!userInfo.need_auth) {
        this.userInfo = userInfo;
        this.getUserInfo();
        this.sgetIncomeInfo();
        this.sgetNewMsg();
        this.sgetPpylOrderInfo();
        this.sgetPpylIncomeInfo();
        this.sgetRecommandProducts();
        setTimeout(() => {
          this.hasLoad = true;
        }, 0)
      } else {
        this.userInfo = userInfo;
      }
      // #ifdef APP-PLUS
      // 获取本地应用资源版本号
      plus.runtime.getProperty(plus.runtime.appid, (wgtinfo) => {
        this.wgtinfo.version = wgtinfo.version;
        this.wgtinfo.versionCode = wgtinfo.versionCode;
      })
      // #endif
    },
    onShow() {
      let userInfo = uni.getStorageSync('userInfo');
      if(this.hasLoad && userInfo.uid) {
        this.sgetUserInfo();
        this.sgetIncomeInfo();
        this.sgetNewMsg();
        this.sgetPpylOrderInfo();
        this.sgetPpylIncomeInfo();
        this.sgetRecommandProducts();
      }
      this.userInfo = uni.getStorageSync('userInfo');
    },
    onShareAppMessage() {
      let userInfo = uni.getStorageSync('userInfo');
      let path = '/pages/index/index';
      if(userInfo.uid) path += `?link_uid=${userInfo.uid}`;
      return {
        title: config.written.shareTitle,
        desc:  config.name,
        // imageUrl: '/static/images/share.jpg',
        path: path
      }
    },
    methods: {
      getUserInfo() {
        let params = {
          uid: uni.getStorageSync('userInfo').uid
        }
        this.$get('/user/info', params, res => {
          let data = res.data;
          //#ifdef H5
          data.real_uid = data.uid;
          if(data.primary_uid) data.uid = data.primary_uid; //同步过，改写uid
          // #endif
          let userInfo = data;
          userInfo.growth_value_simple = Math.floor(userInfo.growth_value_simple);
          if(userInfo.c_vip_level == 1) userInfo.cvipExpireTime = moment(userInfo.c_vip_time_out_time).format('YYYY.MM.DD');
          if(userInfo.openid && uni.getStorageSync('userInfo').openid) userInfo.openid = uni.getStorageSync('userInfo').openid // 当前user表的openid是没用的，所以用的应该是auth接口返回的openid
          this.userInfo = {
            ...userInfo
          };
          uni.setStorageSync('userInfo', this.userInfo);
        })
      },
      getIncomeInfo() {
        return;
        let params = {
          uid: uni.getStorageSync('userInfo').uid
        }
        this.$get('/team/allInCome', params, res => {
          this.incomeInfo = res.data;
          this.incomeInfo.todayInCome = this.incomeInfo.todayInCome ? this.incomeInfo.todayInCome.toString() : '';
          this.incomeInfo.MonthInCome = this.incomeInfo.MonthInCome ? this.incomeInfo.MonthInCome.toString() : '';
          this.incomeInfo.allInCome = this.incomeInfo.allInCome ? this.incomeInfo.allInCome.toString() : '';
          this.incomeInfo.todayInComeInfo = [this.incomeInfo.todayInCome.split('.')[0] || '0', this.incomeInfo.todayInCome.split('.')[1] || '00'];
          this.incomeInfo.MonthInComeInfo = [this.incomeInfo.MonthInCome.split('.')[0] || '0', this.incomeInfo.MonthInCome.split('.')[1] || '00'];
          this.incomeInfo.allInComeInfo = [this.incomeInfo.allInCome.split('.')[0] || '0', this.incomeInfo.allInCome.split('.')[1] || '00'];
        })
      },
      getLeaderTexts() {
        this.$get('/member/title', null, res => {
          let data = res.data;
          let memberTexts = {};
          for(let i = 0; i < data.length; i++) {
            memberTexts[data[i].level] = data[i].name;
          }
          this.memberTexts = memberTexts;
        })
      },
      sgetUserInfo() {
        let params = {
          uid: uni.getStorageSync('userInfo').uid
        }
        this.$sget('/user/info', params, res => {
          let data = res.data;
          //#ifdef H5
          data.real_uid = data.uid;
          if(data.primary_uid) data.uid = data.primary_uid; //同步过，改写uid
          // #endif
          let userInfo = data;
          userInfo.growth_value_simple = Math.floor(userInfo.growth_value_simple);
          if(userInfo.c_vip_level == 1) userInfo.cvipExpireTime = moment(userInfo.c_vip_time_out_time).format('YYYY.MM.DD');
          this.userInfo = {
            ...userInfo
          };
          uni.setStorageSync('userInfo', this.userInfo);
        })
      },
      sgetIncomeInfo() {
        let params = {
          uid: uni.getStorageSync('userInfo').uid
        }
        this.$sget('/team/allInCome', params, res => {
          this.incomeInfo = res.data;
          this.$set(this.incomeInfo, 'todayInCome', this.incomeInfo.todayInCome ? this.incomeInfo.todayInCome.toString() : '')
          this.$set(this.incomeInfo, 'MonthInCome', this.incomeInfo.MonthInCome ? this.incomeInfo.MonthInCome.toString() : '')
          this.$set(this.incomeInfo, 'allInCome', this.incomeInfo.allInCome ? this.incomeInfo.allInCome.toString() : '')
          this.$set(this.incomeInfo, 'todayInComeInfo', [this.incomeInfo.todayInCome.split('.')[0] || '0', this.incomeInfo.todayInCome.split('.')[1] || '00'])
          this.$set(this.incomeInfo, 'MonthInComeInfo', [this.incomeInfo.MonthInCome.split('.')[0] || '0', this.incomeInfo.MonthInCome.split('.')[1] || '00'])
          this.$set(this.incomeInfo, 'allInComeInfo', [this.incomeInfo.allInCome.split('.')[0] || '0', this.incomeInfo.allInCome.split('.')[1] || '00'])
        })
      },
      sgetPpylOrderInfo() {
        let params = {
          uid: uni.getStorageSync('userInfo').uid
        }
        this.$sget('/ppyl/orderSummary', params, res => {
          this.ppylOrderInfo = res.data;
        }, err => {}, true)
      },
      sgetPpylIncomeInfo() {
        let params = {
          uid: uni.getStorageSync('userInfo').uid
        }
        this.$sget('/ppyl/userRewardSummary', params, res => {
          this.ppylIncomeInfos = res.data;
        }, err => {}, true)
      },
      sgetNewMsg() {
        let params = {
          uid: uni.getStorageSync('userInfo').uid,
          returnType: 3 //1数字，2列表，3最新一条
        }
        this.$sget('/afterSale/msgList', params, res => {
          if(res.data && res.data.length > 0) {
            this.newMsg = res.data[0];
          } else {
            this.newMsg = {};
          }
        }, err => {}, true)
      },

      sgetRecommandProducts() {
        let params = {
          uid: uni.getStorageSync('userInfo').uid
        }
        this.$sget('/goods/recommendGoods', params, res => {
          let otherProducts = res.data;
          otherProducts.swiperLen = {
            hot: new Array(Math.ceil(otherProducts.hot.length / 3)),
            other: new Array(Math.ceil(otherProducts.other.length / 3))
          }
          if(
            (!otherProducts.hot || otherProducts.hot.length == 0) &&
            (!otherProducts.other || otherProducts.other.length == 0)
          ) {
            return this.haveRecommand = false;
          }
          this.otherProducts = otherProducts;
        }, err => {}, true)
      },

      updateRecommandTabIndex(e) {
        let val = e.currentTarget.dataset.val;
        this.recommandTabIndex = val;
      },

      // 彩蛋，10秒内点击5次头像清除所有缓存
      tryUnlockEgg() {

        this.eggTriggerNum += 1;
        if(!this.eggTimeout) {
          this.eggTimeout = setTimeout(() => {
            if(this.eggTriggerNum) this.eggTriggerNum = 0;
          }, 10000);
        } else {
          if(this.eggTriggerNum == this.eggLimit) {
            const _thirdEnv = uni.getStorageSync('_thirdEnv');

            clearTimeout(this.eggTimeout);
            uni.clearStorageSync();
            uni.showToast({
              title: '已清除缓存',
              mask: true
            })

            let storageTrigger = {
              address: false,
              shopcar: false,
              userType: false
            }
            uni.setStorageSync('storageTrigger', storageTrigger);

            // #ifdef H5
            if(_thirdEnv) uni.setStorageSync('_thirdEnv', _thirdEnv);  //设置第三方环境
            // #endif

            setTimeout(() => {
              // #ifdef H5
              window.location.replace('/');
              // #endif
              // #ifndef H5
              uni.reLaunch({
                url: '/pages/index/index'
              })
              // #endif
            }, 1800);
          }
        }
      },
      copyUserId(target = 'uid') {
        let uid = this.userInfo[target];
        // #ifdef H5
        let content = uid; // 复制内容，必须字符串，数字需要转换为字符串
        const result = h5Copy(content);
        if (result === true) {
          uni.showToast({
            title:'复制成功',
          })
        } else {
          uni.showToast({
            title:'复制失败',
            icon:'none'
          })
        }
        //  #endif
        // #ifndef H5
        uni.setClipboardData({
          data: uid,
          success: res => {
            uni.showToast({
              title:'复制成功',
            })
          },
          fail: err => {
            uni.showToast({
            title:'复制失败',
            icon:'none'
          })
          }
        })
        // #endif
      },

      getWxCode() {
        uni.login({
          success: res => {
            let wechat = res;
            this.wxCode = wechat.code;
          }
        });
      },
      // 授权
      goToAuth() {
        config.getPrivacy(() => {
          if (this.userInfo.is_has === 1) {
            // 当前账号有集品券、订单，则直接进行授权
            uni.reLaunch({
              url: '/pages/auth/auth'
            })
          } else {
            // 只有当前账号无集品券和订单的，纯小白号才能进行账号同步
            this.showUserLoginPopup = true
          }
        }, this)
      },
      // 选择用户
      triggerUserSelect(tab) {
        this.showUserLoginPopup = false
        if (tab === 'new') {
          // 新用户 --跳转到授权
          uni.reLaunch({
            url: '/pages/auth/auth'
          })
        } else if (tab === 'legacy') {
          uni.reLaunch({
            url: `/pages/user-legacy-synchronous/user-legacy-synchronous?type=1`
          })
        }
      },
      tryShowUserPopup() {
        // if(this.userInfo.phone) return;
        this.getWxCode();
        this.showUserPopup = true;
      },
      confirmAuth(e) {
        let data = e.detail;
        this.showUserPopup = false;
        if(e.detail.errMsg == 'getUserInfo:ok') {
          let params = {
            code: this.wxCode,
            crypt: {
              encryptedData: data.encryptedData,
              iv: data.iv
            }
          }
          this.$post('/wx/auth', params, res => {
            let data = res.data;
            //#ifdef H5
            data.real_uid = data.uid;
            if(data.primary_uid) data.uid = data.primary_uid; //同步过，改写uid
            // #endif
            this.userInfo = data;
            uni.setStorageSync('userInfo', data);
            uni.setStorageSync('token', {
              token: data.token,
              time: new Date().getTime()
            })
            if(this.userInfo.uid) this.getUserInfo();
          })

        } else {
          uni.showToast({
            title: '未授权成功请重试',
            icon: 'none',
            mask: true
          })
        }
      },

      goToSyncMainAccount() {

        uni.showModal({
          title: '提示',
          content: '检测到当前账户为全新账号，若您是平台老用户，点击确认按钮跳转至同步账号信息页面，请确认是否跳转',
          success: res => {
            if(res.confirm) {
              this.validTourist(() => {
                uni.navigateTo({
                  url: '/mine-pages/pages/setting/sync-main-account/sync-main-account'
                })
              }, () => {
                uni.setStorageSync('authOriginPage', {
                  type: 'navigateTo',
                  page: '/mine-pages/pages/setting/sync-main-account/sync-main-account'
                });
              })
            }
          }
        })
      },
      handlerSyncTrigger() {
        // #ifndef H5
        // if(this.userInfo.phone) return;
        this.getWxCode();
        this.showPhonePopup = true;
        // #endif

        // #ifdef H5
        uni.navigateTo({
          url: `/mine-pages/pages/setting/sync/sync`
        })
        // #endif
      },
      confirmBindPhone(info) {
        let data = info.detail;
        this.showPhonePopup = false;
        if(data.errMsg == 'getPhoneNumber:ok') {
            let params = {
              code: this.wxCode,
              crypt: {
                encryptedData: data.encryptedData,
                iv: data.iv
              }
            }

            this.$post('/wx/crypt', params, res => {

              if(res.data && res.data.purePhoneNumber) {
                this.userInfo.phone = res.data.purePhoneNumber;
                this.bindUser();
              }
            })


          } else {
            uni.showToast({
              title: '未获取成功请重试',
              icon: 'none',
              mask: true
            })
          }
      },
      bindUser() {
        let params = {
          phone: this.userInfo.phone,
          uid: this.userInfo.uid
        };
        this.$post('/user/sync', params, res => {
          if(res.data.changeUser) {
            if(res.data.userInfo && res.data.userInfo.uid) {
              const _thirdEnv = uni.getStorageSync('_thirdEnv');

              uni.clearStorageSync();
              let storageTrigger = {
                address: false,
                shopcar: false,
                userType: false
              }
              uni.setStorageSync('storageTrigger', storageTrigger);

              // #ifdef H5
              if(_thirdEnv) uni.setStorageSync('_thirdEnv', _thirdEnv);  //设置第三方环境
              // #endif

              uni.showToast({
                title: '同步成功重启中',
                mask: true
              })
              setTimeout(() => {
                uni.reLaunch({
                  url: '/pages/index/index'
                });
              }, 1500)

            }
          } else {
            uni.showModal({
              title: '提示',
              content: '您不是老用户。如果您是老用户，请联系客服处理',
              showCancel: false
            })
          }

        })
      },

      tryScanDeviceCode() {
        // 尝试扫码
        let result = '';

        // #ifndef H5
        uni.scanCode({
          success: res => {
            console.log('条码类型：' + res.scanType);
            console.log('条码内容：' + res.result);
            result = res.result;
            this.handlerScanResult(result);
          }
        });
        // #endif
        // #ifdef H5
        this.$jwx.scanCode(res => {
          result = res.resultStr; // 当needResult 为 1 时，扫码返回的结果
          this.handlerScanResult(result);
        })
        // #endif


      },
      handlerScanResult(result) {
        let params = {};  //扫码结果参数

        // 处理方法都是统一的
        let queryStart = result.indexOf('?');
        if(queryStart < 0) {
          return uni.showToast({
            title: '无效的内容',
            mask: true,
            icon: 'none'
          })
        }
        let query = result.slice(queryStart + 1, result.length); //获取第一个?后面的字符串，视为query
        let queryParams = query.split('&') || [];

        for(let i = 0; i < queryParams.length; i++) {
          let kv = queryParams[i].split('=');
          params[kv[0] || 'unknow'] = kv[1] || '';
        }

        if(!params.sn || params.sn === '') {
          return uni.showToast({
            title: '设备信息有误',
            mask: true,
            icon: 'none'
          })
        }
        uni.navigateTo({
          url: `/market-pages/pages/device/detail/detail?sn=${params.sn}`
        })

      },

      goToCoupons() {
        this.validTourist(() => {
          uni.navigateTo({
            url: '/pages/coupons/coupons?me=true'
          })
        }, () => {
          uni.setStorageSync('authOriginPage', {
            type: 'navigateTo',
            page: '/pages/coupons/coupons?me=true'
          });
        })
      },
      goToJoinProducts() {
        this.validTourist(() => {
          uni.navigateTo({
            url: `/pages/join-products/join-products`
          })
        }, () => {
          uni.setStorageSync('authOriginPage', {
            type: 'navigateTo',
            page: `/pages/join-products/join-products`
          });
        })
      },
      goToOrders(id) {
        let url = '/pages/orders/orders';
        if(id) url = `/pages/orders/orders?id=${id}`;
        this.validTourist(() => {

          uni.navigateTo({
            url: url
          })
        }, () => {
          uni.setStorageSync('authOriginPage', {
            type: 'navigateTo',
            page: url
          });
        })
      },
      goToPpylVip() {
        let url = '/market-pages/pages/ppyl/ppyl-vip/ppyl-vip';
        this.validTourist(() => {
          uni.navigateTo({
            url: url
          })
        }, () => {
          uni.setStorageSync('authOriginPage', {
            type: 'navigateTo',
            page: url
          });
        })
      },
      goToPpylOrders(id = 0) {
        let url = `/market-pages/pages/ppyl/orders/orders?id=${id}`;
        this.validTourist(() => {
          uni.navigateTo({
            url: url
          })
        }, () => {
          uni.setStorageSync('authOriginPage', {
            type: 'navigateTo',
            page: url
          });
        })
      },
      goToGetReward() {
        let url = '/market-pages/pages/ppyl/ppyl-rewards/ppyl-rewards';
        this.validTourist(() => {
          uni.navigateTo({
            url: url
          })
        }, () => {
          uni.setStorageSync('authOriginPage', {
            type: 'navigateTo',
            page: url
          });
        })
      },
      goToPpylIncomes() {
        let url = '/market-pages/pages/ppyl/incomes/incomes';
        this.validTourist(() => {
          uni.navigateTo({
            url: url
          })
        }, () => {
          uni.setStorageSync('authOriginPage', {
            type: 'navigateTo',
            page: url
          });
        })
      },
      goToReturnMsgs() {
        this.validTourist(() => {
          uni.navigateTo({
            url: '/pages/return-messages/return-messages'
          })
        }, () => {
          uni.setStorageSync('authOriginPage', {
            type: 'navigateTo',
            page: '/pages/return-messages/return-messages'
          });
        })
      },
      goToSetting() {
        this.validTourist(() => {
          uni.navigateTo({
            url: '/pages/setting/setting'
          })
        }, () => {
          uni.setStorageSync('authOriginPage', {
            type: 'navigateTo',
            page: '/pages/setting/setting'
          });
        })

      },
      goToPerfectInfo() {
        this.validTourist(() => {
          uni.navigateTo({
            url: '/pages/perfect-info/perfect-info'
          })
        })
      },
      // 支付密码
      goToUpdatePayPwd() {
        // pay_pwd_unset->没有支付密码
        const payPwdUrl = this.userInfo && this.userInfo.pay_pwd_unset ? `/mine-pages/pages/setting/paypwd-setting/paypwd-setting` : '/mine-pages/pages/setting/paypwd-update/paypwd-update';
        this.validTourist(() => {
          uni.navigateTo({
            url: payPwdUrl
          })
        }, () => {
          uni.setStorageSync('authOriginPage', {
            type: 'navigateTo',
            page: payPwdUrl
          });
        })

      },
      goToUnbindCard() {
        this.validTourist(() => {
          uni.navigateTo({
            url: '/market-pages/pages/agreement-pay/unbind/unbind'
          })
        }, () => {
          uni.setStorageSync('authOriginPage', {
            type: 'navigateTo',
            page: '/market-pages/pages/agreement-pay/unbind/unbind'
          });
        })
      },

      goToReturns() {
        this.validTourist(() => {
          uni.navigateTo({
            url: '/pages/returns/returns'
          })
        }, () => {
          uni.setStorageSync('authOriginPage', {
            type: 'navigateTo',
            page: '/pages/returns/returns'
          });
        })

      },
      goToUserIncomes() {
        this.validTourist(() => {
          uni.navigateTo({
            url: '/mine-pages/pages/finance/user-incomes/user-incomes'
          })
        }, () => {
          uni.setStorageSync('authOriginPage', {
            type: 'navigateTo',
            page: '/mine-pages/pages/finance/user-incomes/user-incomes'
          });
        })

      },
      goToIncomes() {
        this.validTourist(() => {
          uni.navigateTo({
            url: '/mine-pages/pages/finance/incomes/incomes'
          })
        }, () => {
          uni.setStorageSync('authOriginPage', {
            type: 'navigateTo',
            page: '/mine-pages/pages/finance/incomes/incomes'
          });
        })
      },
      goToTeams() {
        this.validTourist(() => {
          if(!this.userInfo.vip_level) {
            return uni.showToast({
              title: '您还不是会员',
              icon: 'none',
              mask: true
            })
          }
          // else if(this.userInfo.vip_level >= 3) {
          //   return uni.showToast({
          //     title: '会员等级不够',
          //     icon: 'none',
          //     mask: true
          //   })
          // }
          uni.navigateTo({
            url: '/mine-pages/pages/team/teams/teams'
          })
        })

      },
      goToNormals() {
        this.validTourist(() => {
          uni.navigateTo({
            url: '/mine-pages/pages/team/normal-users/normal-users'
          })
        })
      },
      goToPoints() {
        this.validTourist(() => {
          uni.navigateTo({
            url: '/mine-pages/pages/finance/my-points/my-points'
          })
        }, () => {
          uni.setStorageSync('authOriginPage', {
            type: 'navigateTo',
            page: '/pages/addresses/addresses'
          });
        })

      },
      goToAddresses() {
        this.validTourist(() => {
          uni.navigateTo({
            url: '/pages/addresses/addresses'
          })
        }, () => {
          uni.setStorageSync('authOriginPage', {
            type: 'navigateTo',
            page: '/pages/addresses/addresses'
          });
        })
      },
      // 健康豆操作
      goToHealthyBeanConvert() {
        this.validTourist(() => {
          uni.navigateTo({
            url: '/mine-pages/pages/healthy-bean-convert/healthy-bean-convert'
          })
        }, () => {
          uni.setStorageSync('authOriginPage', {
            type: 'navigateTo',
            page: '/mine-pages/pages/healthy-bean-convert/healthy-bean-convert'
          });
        })
      },
      // #ifndef MP-WEIXIN
      goToContact() {
        this.validTourist(() => {
          uni.navigateTo({
            url: '/pages/contact/contact'
          })
        }, () => {
          uni.setStorageSync('authOriginPage', {
            type: 'navigateTo',
            page: '/pages/contact/contact'
          });
        })
      },
      // #endif
      goToAchievement() {
        this.validTourist(() => {
          if(!this.userInfo.vip_level) {
            return uni.showToast({
              title: '您还不是会员',
              icon: 'none',
              mask: true
            })
          }
          uni.navigateTo({
            url: '/mine-pages/pages/achievement/achievement/achievement'
          })
        })
      },
      goToAchievementTeam() {
        this.validTourist(() => {
          if(!this.userInfo.vip_level) {
            return uni.showToast({
              title: '您还不是会员',
              icon: 'none',
              mask: true
            })
          }
          uni.navigateTo({
            url: '/mine-pages/pages/achievement/achievement-team/achievement-team'
          })
        })
      },
      goToMyCollages() {
        this.validTourist(() => {
          uni.navigateTo({
            url: '/market-pages/pages/collage/my-collages/my-collages'
          })
        }, () => {
          uni.setStorageSync('authOriginPage', {
            type: 'navigateTo',
            page: '/market-pages/pages/collage/my-collages/my-collages'
          });
        })

      },
      goToGiftCards() {
        this.validTourist(() => {
          uni.navigateTo({
            url: '/market-pages/pages/gift-card/gift-cards/gift-cards'
          })
        }, () => {
          uni.setStorageSync('authOriginPage', {
            type: 'navigateTo',
            page: '/market-pages/pages/gift-card/gift-cards/gift-cards'
          });
        })
      },
      goToLives() {
        this.validTourist(() => {
          uni.navigateTo({
            url: '/pages/lives/lives'
          })
        }, () => {
          uni.setStorageSync('authOriginPage', {
            type: 'navigateTo',
            page: '/pages/lives/lives'
          });
        })

      },
      goToPoster() {
        this.validTourist(() => {
          uni.navigateTo({
            url: '/mine-pages/pages/mine/user-poster/user-poster'
          })
        }, () => {
          uni.setStorageSync('authOriginPage', {
            type: 'navigateTo',
            page: '/mine-pages/pages/mine/user-poster/user-poster'
          });
        })
      },
      goToWithdraw() {
        this.validTourist(() => {
          uni.navigateTo({
            url: '/mine-pages/pages/finance/withdraw/withdraw'
          })
        }, () => {
          uni.setStorageSync('authOriginPage', {
            type: 'navigateTo',
            page: '/mine-pages/pages/finance/withdraw/withdraw'
          });
        })

      },
      goToGrowthValues() {
        this.validTourist(() => {
          uni.navigateTo({
            url: '/mine-pages/pages/finance/growth-values/growth-values'
          })
        }, () => {
          uni.setStorageSync('authOriginPage', {
            type: 'navigateTo',
            page: '/mine-pages/pages/finance/growth-values/growth-values'
          });
        })
      },
      goToTransformableOrders() {
        this.validTourist(() => {
          uni.navigateTo({
            url: '/market-pages/pages/transformable-order/orders/orders'
          })
        }, () => {
          uni.setStorageSync('authOriginPage', {
            type: 'navigateTo',
            page: '/market-pages/pages/transformable-order/orders/orders'
          });
        })
      },
      goToSteps() {
        this.validTourist(() => {
          uni.navigateTo({
            url: '/mine-pages/pages/step/steps/steps'
          })
        }, () => {
          uni.setStorageSync('authOriginPage', {
            type: 'navigateTo',
            page: '/mine-pages/pages/step/steps/steps'
          });
        })
      },

      goToCrowdFundingIncomes() {
        this.validTourist(() => {
          uni.navigateTo({
            url: '/market-pages/pages/crowd-funding/incomes/incomes'
          })
        }, () => {
          uni.setStorageSync('authOriginPage', {
            type: 'navigateTo',
            page: '/market-pages/pages/crowd-funding/incomes/incomes'
          });
        })
      },
      goToAdvanceBuyCards() {
        this.validTourist(() => {
          uni.navigateTo({
            url: '/market-pages/pages/crowd-funding/advance-buy-cards/advance-buy-cards'
          })
        }, () => {
          uni.setStorageSync('authOriginPage', {
            type: 'navigateTo',
            page: '/market-pages/pages/crowd-funding/advance-buy-cards/advance-buy-cards'
          });
        })
      },
      // 跳转-集品豆明细/礼品券明细
      goToBalanceRecord(index) {
        const url = `/market-pages/pages/crowd-funding/voucher-record/voucher-record?type=${index}`
        this.validTourist(() => {
          uni.navigateTo({
            url
          })
        }, () => {
          uni.setStorageSync('authOriginPage', {
            type: 'navigateTo',
            page: url
          });
        })
      },
      goToCrowdFundingOrders() {
        this.validTourist(() => {
          uni.navigateTo({
            url: '/market-pages/pages/crowd-funding/orders/orders'
          })
        }, () => {
          uni.setStorageSync('authOriginPage', {
            type: 'navigateTo',
            page: '/market-pages/pages/crowd-funding/orders/orders'
          });
        })
      },
      // 新增业绩
      goToIncreasedAchievement() {
        this.validTourist(() => {
          uni.navigateTo({
            url: '/market-pages/pages/crowd-funding/record/records/records'
          })
        }, () => {
          uni.setStorageSync('authOriginPage', {
            type: 'navigateTo',
            page: '/market-pages/pages/crowd-funding/record/records/records'
          });
        })
      },

      goToHealthyBalances() {
        this.validTourist(() => {
          uni.navigateTo({
            url: '/market-pages/pages/healthy-activity/healthy-balances/healthy-balances'
          })
        }, () => {
          uni.setStorageSync('authOriginPage', {
            type: 'navigateTo',
            page: '/market-pages/pages/healthy-activity/healthy-balances/healthy-balances'
          });
        })
      },


      goToProduct(e) {
        let sn = e.currentTarget.dataset.sn;
        uni.navigateTo({
          url: `/pages/product-detail/product-detail?sn=${sn}`
        })
      },

      goToAboutUs() {
        uni.navigateTo({
          url: '/pages/about-us/about-us'
        })
      },
      goToUserManual() {
        uni.navigateTo({
          url: '/pages/user-manual/user-manual'
        })
      },


      // 待完善
      undo() {
        uni.showToast({
          title: '即将开放敬请期待',
          icon: 'none',
          mask: true
        })
      },
      /**
       * 手动检查系统更新
       */
      updateSystem() {
        wgtUpdate.checkVersion()
      },
      // 用户同步
      goToUserSynchronous() {
        uni.navigateTo({
          url: '/pages/user-legacy-synchronous/user-legacy-synchronous?type=2'
        })
      },
      // 验证游客身份，阻止进入下一级页面
      validTourist(callback, preHanlder) {
        config.getPrivacy(() => {
          let userInfo = uni.getStorageSync('userInfo');
          if(!userInfo || userInfo.need_auth) {
            // #ifndef H5
            uni.showModal({
              title: '提示',
              content: `为了更好的为您提供服务，${this.$name}需要您的身份信息授权。`,
              confirmText: '前往授权',
              success: res => {
                if(res.confirm) {
                  if(preHanlder && typeof preHanlder == 'function') preHanlder();
                  uni.reLaunch({
                    url: '/pages/auth/auth'
                  })
                }
              }
            })
            // #endif
            // #ifdef H5
            if(preHanlder && typeof preHanlder == 'function') preHanlder();
            window.location = '/';
            // #endif
          } else {
            if(callback && typeof callback == 'function') callback();
          }
        }, this)
      }
    }
  }
</script>

<style lang="scss" scoped>
@import 'me.scss';
</style>