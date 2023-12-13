<template>
  <view class="flex-page">
    <view class="header-bar">
      <!-- 导航条 -->
      <view class="tabs">
        <view :class="'tab ' + (tabIndex == 1 ? 'active' : '')" data-id="1" @tap="updateTabIndex">
          个人收益红包
        </view>
        <view :class="'tab ' + (tabIndex == 2 ? 'active' : '')" data-id="2" @tap="updateTabIndex">
          分享收益红包
        </view>
      </view>

      <!-- 订单提醒 -->
      <view v-if="tabIndex == 1 && userInfo.c_vip_level == 1 && rewardInfos.wait_arrival_number > 0" class="order-msgs">
        <view class="order-msg">尊敬的CVIP，您当前有{{rewardInfos.wait_arrival_number}}个红包待领取</view>
        <view class="order-msg-ctrls">
          <view class="order-msg-ctrl" @tap="quilyGetRewards">一键领取</view>
        </view>
      </view>
      <view v-if="tabIndex == 2 && (rewardInfos.wait_activation_number || (rewardInfos.wait_arrival_number > 0 && userInfo.c_vip_level == 1))" class="order-msgs">
        <view class="order-msg">
          <block v-if="rewardInfos.wait_activation_number > 0">{{rewardInfos.wait_activation_number}}个待激活</block>
          <block v-if="rewardInfos.wait_activation_number > 0 && rewardInfos.wait_arrival_number > 0 && userInfo.c_vip_level == 1">，</block>
          <block v-if="rewardInfos.wait_arrival_number > 0 && userInfo.c_vip_level == 1">{{rewardInfos.wait_arrival_number}}个待领取</block>
        </view>
        <view class="order-msg-ctrls">
          <view v-if="rewardInfos.wait_activation_number > 0" class="order-msg-ctrl" @tap="toIndex">批量激活</view>
          <view class="order-msg-ctrl" v-if="rewardInfos.wait_arrival_number > 0 && userInfo.c_vip_level == 1" @tap="quilyGetRewards">
            一键领取
          </view>
        </view>
      </view>
      
    </view>
    <!-- 页面内容 -->
    <view class="flex-page-content">

      <view class="order-box">
        <scroll-view 
          scroll-y 
          class="tab-page-scroll" 
          :refresher-enabled="true" 
          :refresher-triggered="refreshing"
          @refresherrefresh="reGetList" 
          @scrolltolower="getList">
          <view class="order-list">
            <block v-if="tabIndex == 1">
              <view v-for="(order, index) in orders" class="order" :key="order.order_sn">
                <view class="order-item">
                  <view class="order-header">
                    <view class="order-base-infos">
                      <view class="order-base-info-sm">
                        <view>{{order.create_time}}</view>
                      </view>
                      <view class="order-reward-price">￥{{order.reward_price || '0.00'}}</view>
                    </view>
                    <view class="order-status medius">
                      {{arrivalStatusTexts[order.arrival_status]}} 
                    </view>
                  </view>
                  <view class="order-contents">
                    <view class="order-content">
                      <view class="order-item-img-box">
                        <image class="order-item-img" :src="order.orderGoods.images" mode="widthFix" webp lazy-load></image>
                      </view>
                      <view class="order-item-info">
                        <view class="order-item-title">{{order.orderGoods.title}}</view>
                        <view class="order-item-vals">
                          <view class="order-item-val">￥{{order.total_price || '0.00'}}</view>
                          <!-- <view v-if="order.orderGoods.market_price && order.orderGoods.market_price != order.orderGoods.price" class="order-item-val-unactive">￥{{order.orderGoods.market_price || '0.00'}}</view> -->
                        </view>
                      </view>
                    </view>
                  </view>
                  
                  <view v-if="order.arrival_status == 3" class="order-get-reward" @tap="showRewardPopup(index)">
                    <image class="order-get-reward-img" src="/static/images/ppyl/icon_reward.png"></image>
                  </view>

                  <view class="order-sn-box">
                    <view class="order-sn">订单号：{{order.order_sn}}</view>
                    <view class="order-sn-copy" @click="copyOrderSn(order.order_sn)">复制</view>
                  </view>
                  
                </view>
              </view>
            </block>
            
            <block v-if="tabIndex == 2">
              <view v-for="(order, index) in orders" class="other-order" :key="index">
                <view class="other-order-reward-infos">
                  <view class="other-order-reward">
                    <view class="other-order-val">¥ {{order.reward_price}}</view>
                    <view v-if="order.arrival_status != 3" class="other-order-reward-info">距失效还剩： {{order.coldDown[0] || '——'}} : {{order.coldDown[1] || '——'}} : {{order.coldDown[2] || '——'}}</view>
                    <view class="other-order-reward-info">来自：{{order.orderUser.name}}</view>
                    <view class="other-order-reward-info">
                      <text>订单号：{{order.order_sn}}</text>
                      <text class="order-sn-copy" @tap="copyOrderSn(order.order_sn)">复制</text>
                    </view>
                  </view>
                  <view class="other-order-reward-extend">
                    <view v-if="order.arrival_status == 2" class="other-order-reward-ctrl">冻结中</view>
                    <view v-else-if="order.freed_status == 2" class="other-order-reward-ctrl" @tap="couldNotActivite">待激活</view>
                    <view v-else-if="order.arrival_status == 3" class="other-order-get-reward" @tap="showRewardPopup(index)">
                      <image class="other-order-get-reward-img" src="/static/images/ppyl/icon_reward.png"></image>
                    </view>
                  </view>
                </view>
                <view class="other-order-contents"> 
                  <view class="other-order-content">
                    <view class="other-order-item-img-box">
                      <image class="other-order-item-img" :src="order.orderGoods.images" mode="widthFix" webp lazy-load></image>
                    </view>
                    <view class="other-order-item-info">
                      <view class="other-order-item-title">{{order.orderGoods.title}}</view>
                      <view class="other-order-item-vals">
                        <view class="other-order-item-val">￥{{order.total_price || '0.00'}}</view>
                        <!-- <view v-if="order.orderGoods.market_price && order.orderGoods.market_price != order.orderGoods.real_pay_price" class="other-order-item-val-unactive">￥{{order.orderGoods.market_price || '0.00'}}</view> -->
                      </view>
                    </view>
                  </view>
                </view>

              </view>

            </block>
          </view>
          <view v-if="orderLoading" class="scroll-tips">加载中...</view>
          <view v-if="orders.length > 0 && currentPage > pageTotal && !orderLoading" class="scroll-tips">已经到底啦</view>
          <view v-if="orders.length == 0 && currentPage > pageTotal && !orderLoading" class="scroll-tips">暂无记录哦</view>

        </scroll-view>
      </view>
    </view>

    <view v-if="rewardPopupVisible == true" class="get-reward-popup">
      <view class="get-reward-popup-bg" @tap="rewardPopupVisible = false"></view>
      <view class="get-reward-content" @tap="tryGetReward">
        <image class="get-reward-content-img" src="/market-pages/static/images/ppyl/popup_bg.png" mode="widthFix"></image>
      </view>
    </view>

    <mx-datetime-picker :show="showPicker" type="date" :value="selectDate" :show-tips="true" :show-seconds="false" @confirm="onSelectedTime" @cancel="onSelectedTime" />
  </view>
</template>
<script>
  import h5Copy from '@/common/junyi-h5-copy.js';

  import mxDatetimePicker from '@/components/mx-datetimepicker/mx-datetimepicker.vue';
  import moment from 'moment';
  export default {
    components: {
      mxDatetimePicker
    },
    data() {
      return {

        tabIndex: 1,
        userInfo: uni.getStorageSync('userInfo'),

        refreshing: false,

        currentPage: 1,
        pageTotal: 1,
        
        orders: [],
        rewardInfos: {
          wait_activation_number: 0,
          wait_arrival_number: 0
        },

        arrivalStatusTexts: {
          [1]: '已到账',
          [2]: '冻结中',
          [3]: '待领取',
          [-1]: '被删除',
          [-2]: '已超时',
        },

        orderLoading: false,
        orderRequestTask: null,
        infosRequestTask: null,

        rewardPopupVisible: false,
        currentRewardIndex: 0,

        coldDownInterval: null
      }
    },
    onShareAppMessage() {
      let shareInfo = this.$getShareInfo();
      return shareInfo;
    },
    onLoad(options) {
      if(options.id) this.tabIndex = options.id;
      this.getList();
      this.getRewardInfos();
    }, 
    onShow() {
      if(this.tabIndex == 2) {
        this.tryColdDown();
      } else {
        if(this.coldDownInterval) clearTimeout(this.coldDownInterval);
      }
    }, 
    onHide() {
      if(this.coldDownInterval) clearTimeout(this.coldDownInterval);
    }, 
    onUnload() {
      if(this.coldDownInterval) clearInterval(this.coldDownInterval);
    },
    methods: {
      getList() {
        if(this.currentPage > this.pageTotal || this.orderLoading) return;
        let params = {
          uid: uni.getStorageSync('userInfo').uid,
          type: this.tabIndex,
          page: this.currentPage
        }
        if(this.timeVals && this.timeVals.length == 2) {
          params.start_time = this.timeVals[0];
          params.end_time = this.timeVals[1];
        }
        this.orderLoading = true;
        let orderRequestTask = this.$sget('/ppyl/reward', params, res => {
          this.orderLoading = false;
          this.currentPage += 1;
          if(!res.data.list || res.data.list.length == 0) return;
          let orders = res.data.list;

          this.orders.push(...orders);
          if(this.tabIndex == 2) this.coldDowning();
          this.pageTotal = res.data.pageTotal;
        }, err => {
          this.orderLoading = false;
        })
        // 因为是需要验证uid的请求，因多请求因故，走promise异步
        orderRequestTask.then(request => {
          this.orderRequestTask = request;
        })
      },
      getRewardInfos() {
        let params = {
          uid: uni.getStorageSync('userInfo').uid,
          type: this.tabIndex
        }
        
        let infosRequestTask = this.$sget('/ppyl/rewardCount', params, res => {
          let data = res.data || {};
          this.rewardInfos = {
            wait_activation_number: data.wait_activation_number ? parseInt(data.wait_activation_number) : 0,
            wait_arrival_number: data.wait_arrival_number ? parseInt(data.wait_arrival_number) : 0
          }
        })
        
        // 因为是需要验证uid的请求，因多请求因故，走promise异步
        infosRequestTask.then(request => {
          this.infosRequestTask = request;
        })
      },

      tryColdDown() {
        if(this.coldDownInterval) clearTimeout(this.coldDownInterval);
        this.coldDownInterval = setTimeout(() => {
          this.coldDowning();
          this.tryColdDown();
        }, 1000)
      },
      coldDowning() {
        if(this.orders.length > 0) {
          let waitDeleteIndexs = [];
          let date = moment().utc().utcOffset(480).format('YYYY-MM-DD HH:mm:ss');
          for(let i = 0; i < this.orders.length; i++) {
            let order = this.orders[i];
            if(order.arrival_status != 3) continue;
            let coldDownHour = moment(order.freed_limit_end_time).diff(date, 'hours');
            let coldDownCountMinute = moment(order.freed_limit_end_time).diff(date, 'minutes', true) % 60;
            let coldDownCountSecond = moment(order.freed_limit_end_time).diff(date, 'seconds', true) % 60;
            if(coldDownCountSecond < 0) {
              waitDeleteIndexs.unshift(i);
              continue; //因为小于0了，该活动就该失效啦。查看下一个
            }
            coldDownCountMinute = Math.floor(coldDownCountMinute);
            coldDownCountSecond = Math.floor(coldDownCountSecond);
            this.orders[i].coldDown = [
              coldDownHour < 10 ? ('0' + coldDownHour) : coldDownHour,
              coldDownCountMinute < 10 ? ('0' + coldDownCountMinute) : coldDownCountMinute,
              coldDownCountSecond < 10 ? ('0' + coldDownCountSecond) : coldDownCountSecond
            ];
          }

          for(let i = 0; i < waitDeleteIndexs.length; i++) {
            this.orders.splice(waitDeleteIndexs[i], 1);
          }
        }

      },

      reGetList() {
        this.refreshing = true;
        this.currentPage = 1;
        this.pageTotal = 1;
        this.orders = [];
        this.getList();
        setTimeout(() => {
          this.refreshing = false;
        }, 200)
      },
      updateTabIndex(e) {
        let id = e.currentTarget.dataset.id;
        this.tabIndex = id;
        if(this.orderRequestTask) {
          this.orderRequestTask.abort();
          this.orderRequestTask = null;
          this.orderLoading = false;
        }
        if(this.infosRequestTask) {
          this.infosRequestTask.abort();
          this.infosRequestTask = null;
        }
        this.reGetList();
        this.getRewardInfos();

        if(this.tabIndex == 2) {
          this.tryColdDown();
        } else {
          if(this.coldDownInterval) clearTimeout(this.coldDownInterval);
        }
      },
      

      couldNotActivite() {
        uni.showModal({
          title: '提示',
          content: '有效时间内完成一次拼拼成团即可激活该奖励',
          showCancel: false,
          success: res => {}
        })
      },
      showRewardPopup(index) {
        this.currentRewardIndex = index;
        this.rewardPopupVisible = true;
      },
      tryGetReward() {
        let params = {
          uid: uni.getStorageSync('userInfo').uid,
          orders: [
            {
              order_sn: this.orders[this.currentRewardIndex].order_sn,
              type: this.orders[this.currentRewardIndex].type
            }
          ]
        }
        this.$post('/ppyl/receiveReward', params, res => {
          this.rewardPopupVisible = false;
          this.orders[this.currentRewardIndex].arrival_status = 1;
          uni.setStorageSync('getReward', this.orders[this.currentRewardIndex]);
          if(this.rewardInfos.wait_arrival_number) this.rewardInfos.wait_arrival_number = parseInt(this.rewardInfos.wait_arrival_number) - 1;
          uni.navigateTo({
            url: '/market-pages/pages/ppyl/ppyl-reward/ppyl-reward'
          })
        })
      },

      toIndex() {
        uni.switchTab({
          url: '/pages/index/index'
        });
      },
      quilyGetRewards() {
        let params = {
          uid: uni.getStorageSync('userInfo').uid,
          type: this.tabIndex
        }
        this.$post('/ppyl/quicklyReward', params, res => {
          uni.showToast({
            title: '一键领取成功',
            mask: true
          })
          this.reGetList();
          this.getRewardInfos();
        })
      },

      
      copyOrderSn(order_sn) {
        // #ifdef H5
        let content = order_sn; // 复制内容，必须字符串，数字需要转换为字符串
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
          data: order_sn,
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

    }
  }
</script>

<style lang="scss" scoped>
  @import 'ppyl-rewards.scss';
</style>
