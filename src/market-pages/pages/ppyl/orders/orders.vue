<template>
  <view class="flex-page">
    <view class="header-bar">
      <!-- 导航条 -->
      <view class="tabs">
        <view :class="'tab ' + (tabIndex == 0 ? 'active' : '')" data-id="0" @tap="updateTabIndex(0)">
          全部订单
        </view>
        <view :class="'tab ' + (tabIndex == 1 ? 'active' : '')" @tap="updateTabIndex(1)">
          进行中
        </view>
        <view :class="'tab ' + (tabIndex == 2 ? 'active' : '')" @tap="updateTabIndex(2)">
          已拼中
        </view>
        <view :class="'tab ' + (tabIndex == 3 ? 'active' : '')" @tap="updateTabIndex(3)">
          未拼中
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
            <block v-if="tabIndex == 0 || tabIndex == 1 || tabIndex == 3 || tabIndex == 4">

              <!-- 日期筛选，未拼中状态专有 -->
              <view v-if="tabIndex == 3" class="order-extend-filters">
                <view class="order-extend-time-filter">
                  <view class="order-extend-time-quickly">
                    <view class="order-extend-quickly-vals">
                      <view class="order-extend-quickly-val">选择日期</view>
                    </view>
                  </view>
                  <view class="order-extend-time-trigger" @tap="showPicker = true">
                    <view class="order-extend-time-val">
                      <view v-if="timeTexts">
                        {{timeTexts}}
                      </view>
                    </view>
                    <view class="order-filter-time">
                      <image class="filter-time-icon" src="/static/images/date_black.png"></image>
                    </view>
                  </view>
                </view>
              </view>

              <view v-for="(order, index) in orders" class="order" :key="index" @tap="goToDetail(index)">
                <view class="order-item">
                  <view class="order-header">
                    <view class="order-base-infos">
                      <view class="order-base-info-sm">
                        <view>{{order.create_time}}</view>
                      </view>
                    </view>
                    <view class="order-status medius">
                      <block v-if="order.activity_status == 2">
                        {{winStatusTexts[order.win_status]}}
                      </block>
                      <block v-else-if="order.activity_status != -3">
                        {{statusTexts[order.activity_status]}} 
                      </block>
                      <block v-else>
                        <block v-if="order.refund_status == 1">已退款</block>
                        <block v-if="order.refund_status == 2">未拼中</block>
                      </block>
                    </view>
                  </view>
                  <view class="order-contents">
                    <view class="order-content" :key="skuIndex">
                      <view class="order-item-img-box">
                        <image class="order-item-img" :src="order.goods.image" mode="widthFix" webp lazy-load></image>
                        <view v-if="order.is_auto_order == 1" class="order-item-expire">自动拼团</view>
                      </view>
                      <view class="order-item-info">
                        <view class="order-item-title">{{order.goods.title}}</view>
                        <view class="order-item-vals">
                          <view class="order-item-val">￥{{order.real_pay_price || '0.00'}}</view>
                          <view v-if="order.goods.market_price && order.goods.market_price != order.goods.price" class="order-item-val-unactive">￥{{order.goods.market_price || '0.00'}}</view>
                        </view>
                      </view>
                    </view>
                  </view>

                  <block v-if="tabIndex == 1">
                    <!-- 进行中的有倒计时 -->
                    <view class="order-sn-box">
                      <view class="order-sn">订单号：{{order.order_sn}}</view>
                      <view class="order-sn-copy" @click="copyOrderSn(order.order_sn)">复制</view>
                    </view>
                    
                    <view class="order-extends">
                      <view v-if="order.activity_status == 2 && order.win_status == 3" class="order-result-colddown">
                        <text>开奖倒计时：</text>
                        <text class="order-result-colddown-val">{{order.coldDown[0] || '——'}} : {{order.coldDown[1] || '——'}} : {{order.coldDown[2] || '——'}}</text>
                      </view>
                      <view class="order-ctrls">
                        <view v-if="order.activity_status ==  1 && order.auto_plan == 1" class="order-ctrl primary" @tap="tryCancelAutoJoin(order.order_sn)">停止自动拼团</view>
                        <view class="order-ctrl primary">查看详情</view>
                      </view>
                    </view>
                  </block>
                  <block v-else>
                    <view class="order-extends">
                      <view class="order-sn">{{order.order_sn}}</view>
                      
                      <view class="order-ctrls">
                        <block v-if="
                          order.can_operate_refund == 1 && 
                          order.pay_status == 2 && 
                          (
                            order.activity_status == 3 || 
                            (order.activity_status == 2 && order.win_status == 2) ||
                            order.activity_status == -3
                          ) &&
                          !order.opreating"
                        >
                          <view class="order-ctrl" @tap="tryValidReStart(index)">重开</view>
                          <!-- <view class="order-ctrl primary" @tap="tryRefund(index)">退回本金</view> -->
                        </block>
                        <block v-else>
                          <view v-if="order.auto_plan == 1 && order.activity_status == 1" class="order-ctrl primary" @tap="tryCancelAutoJoin(order.order_sn)">停止自动拼团</view>
                          <view v-if="order.activity_status == 1 || (order.activity_status == 2 && order.win_status == 3)" class="order-ctrl primary">查看详情</view>
                        </block>
                      </view>
                    </view>
                  </block>
                  
                </view>
              </view>
            </block>

            <!-- 已中奖，等待寄售/发货 -->
            <block v-else-if="tabIndex == 2">
              <view v-for="(item, index) in orders" class="order-group" :key="index">
                <view class="order-group-title">[{{item.area_name}}] 已拼中 {{item.all_number}} 件</view>
                <view class="order-group-times">
                  <view class="order-group-createtime">起：{{item.lottery_time}}</view>
                  <view class="order-group-endtime">止：——</view>
                </view>
                <view class="order-group-operate-infos">
                  <view class="order-group-operate-info">
                    <text>寄售：</text>
                    <text class="order-group-operate-val">{{item.repurchase_number || 0}}</text>
                  </view>
                  <view class="order-group-operate-info">
                    <text>发货：</text>
                    <text class="order-group-operate-val">{{item.shipping_number || 0}}</text>
                  </view>
                  <view class="order-group-ctrls">
                    <view class="order-group-ctrl" @tap="goToAreaOrders(item)">寄售/发货</view>
                  </view>
                </view>
                <view class="order-group-orders">
                  <view v-for="(goods, goodIndex) in item.winGoods" class="order-group-order" :key="goodIndex">
                    <image class="order-group-order-img" :src="goods.goodsInfo.image" mode="aspectFill" lazy-load webp></image>
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
      <view class="get-reward-content" @tap="goToPpylReward">
        <image class="get-reward-content-img" src="/static/images/share.jpg" mode="widthFix"></image>
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
        hiddenPrice: false,

        tabIndex: 1,

        refreshing: false,

        currentPage: 1,
        pageTotal: 1,
        apiList: {
          [0]: '/ppyl/order',
          [1]: '/ppyl/order',
          [2]: '/ppyl/win',
          [3]: '/ppyl/order',
          [4]: '/ppyl/order',
          [5]: '/ppyl/waitList'
        },

        orders: [],
        orderCount: {
          all: 0,
          direct: 0,
          total: 0
        },
        statusTexts: {
          [1]: '进行中',
          [2]: '拼团成功',
          [3]: '未成团',
          [-1]: '取消付款',
          [-2]: '已退款',
          [-3]: '未拼中'
        },
        winStatusTexts: {
          [1]: '已拼中',
          [2]: '未拼中',
          [3]: '开奖中'
        },
        
        waitStatusTexts: {
          [1]: '排队中',
          [2]: '排队完成',
          [3]: '超时未成功',
          [-1]: '取消付款',
          [-2]: '已退款'
        },
        orderLoading: false,
        orderRequestTask: null,

        readyNavigate: false, //去重开，防抖
        address: null,

        // 时间控件
        showPicker: false,

        selectDate: moment().format('YYYY/MM/DD HH:mm:ss'),
        timeTexts: moment().format('YYYY.MM.DD'),
        timeVals: moment().format('YYYY/MM/DD'),

        rewardPopupVisible: false,
        currentRewardIndex: 0,

        coldDownInterval: null,

        isCtrl: false
      }
    },
    onLoad(options) {
      if(options.id) this.tabIndex = parseInt(options.id);
      this.getList();
    },  
    onShow() {
      if(this.tabIndex == 1) {
        this.tryColdDown();
      } else {
        if(this.coldDownInterval) clearTimeout(this.coldDownInterval);
      }
      if(uni.getStorageSync('shouldReload')) {
        uni.removeStorageSync('shouldReload');
        this.reGetList();
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
          page: this.currentPage,
          ...this.buildParams()
        }
        this.orderLoading = true;
        let orderRequestTask = this.$spost(this.apiList[this.tabIndex], params, res => {
          this.orderLoading = false;
          this.currentPage += 1;
          if(!res.data.list || res.data.list.length == 0) return;
          let orders = res.data.list;

          this.orders.push(...orders);
          if(this.tabIndex == 1) this.coldDowning();
          this.pageTotal = res.data.pageTotal;
        }, err => {
          console.log(err);
          this.orderLoading = false;
        })
        // 因为是需要验证uid的请求，因多请求因故，走promise异步
        orderRequestTask.then(request => {
          this.orderRequestTask = request;
        })
      },
      buildParams() {
        let params = {};
        switch(this.tabIndex) {
          case 0: 
            //进行中
            params = {
            }
            break;
          case 1: 
            //进行中
            params = {
              activity_status: [1, 2],
              win_status: 3
            }
            break;

          case 2: 
            // 未拼中
            params = {
              win_status: 2,
              needGoodsInfo: 1
            }

            break;

          case 3: 
            params = {
              activity_status: -3
            }
            if(this.timeVals && this.timeVals !== '') {
              params.start_time = moment(this.timeVals).format('YYYY-MM-DD 00:00:00');
              params.end_time = moment(this.timeVals).format('YYYY-MM-DD 23:59:59');
            }
            // params.timeout_start_time = moment().subtract(3, 'days').format('YYYY-MM-DD 00:00:00');
            // params.timeout_end_time = moment().format('YYYY-MM-DD 23:59:59');
            break;

          case 4: 
            // 未成团
            params = {
              activity_status: 3
            }
            break;
          
          case 5: 
            params = {
              wait_status: [1]
            }
            break;

          default: 
            break;
        }
        return params;
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
            let coldDownHour = moment(order.end_time).diff(date, 'hours');
            let coldDownCountMinute = moment(order.end_time).diff(date, 'minutes', true) % 60;
            let coldDownCountSecond = moment(order.end_time).diff(date, 'seconds', true) % 60;
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
      updateTabIndex(index) {
        this.tabIndex = index;
        if(this.orderRequestTask) {
          this.orderRequestTask.abort();
          this.orderRequestTask = null;
          this.orderLoading = false;
        }
        this.reGetList();
        
        if(this.tabIndex == 1) {
          this.tryColdDown();
        } else {
          if(this.coldDownInterval) clearTimeout(this.coldDownInterval);
        }
      },

      updateStatusVal(e) {
        let index = e.detail.value;

        if(this.orderRequestTask) {
          this.orderRequestTask.abort();
          this.orderRequestTask = null;
          this.orderLoading = false;
        }
        this.reGetList();

      },

      toggleHiddenPrice(e) {
        let hiddenPrice = e.detail.value;
        this.hiddenPrice = hiddenPrice;
      },

      tryCancelWait(order_sn) {
        uni.showModal({
          title: '提示',
          content: '是否确定取消该排队订单？',
          success: res => {
            if(res.confirm) {
              let params = {
                uid: uni.getStorageSync('userInfo').uid,
                order_sn: order_sn
              }
              this.$post('/ppyl/cancelWait', params, res => {
                setTimeout(() => {
                  uni.showToast({
                    title: '取消排队成功',
                    mask: true
                  })
                }, this.$toastDelay)
                setTimeout(() => {
                  this.reGetList();
                }, 1800)
              })
            }
          }
        })
      },
      onSelectedTime(val) {
        this.showPicker = false;
        if(val) {
          this.selectDate = moment(val.value).format('YYYY/MM/DD HH:mm:ss');
          this.timeTexts = moment(val.value).format('YYYY.MM.DD');
          this.timeVals = moment(val.value).format('YYYY/MM/DD');
          this.quicklyTimeIndex = 1;
          this.reGetList();
        }
      },

      showRewardPopup(index) {
        this.currentRewardIndex = index;
        this.rewardPopupVisible = true;
      },

      // 退本金
      tryRefund(index) {
        if(this.orders[index].opreating) return;
        uni.showModal({
          title: '提示',
          content: '是否确定对该订单进行退本金操作？',
          success: res => {
            if(res.confirm) {
              this.orders[index].opreating = true;
              let params = {
                uid: uni.getStorageSync('userInfo').uid,
                order_sn: this.orders[index].order_sn
              }
              this.$post('/ppyl/refund', params, res => {
                setTimeout(() => {
                  uni.showToast({
                    title: '退回本金成功',
                    duration: 2500,
                    mask: true
                  })
                }, this.$toastDelay)
                setTimeout(() => {
                  this.reGetList();
                }, 2800)
              }, err => {
                this.orders[index].opreating = false;
              })
            }
          }
        })
      },
      // 参与拼拼
      tryValidReStart: async function(index) {
        if(!this.address) await this.getAddress();
        let order = this.orders[index];
        let params = {
          goods: [
            {
              activity_id: order.area_code,
              activity_sn: null,
              goods_sn: order.goods_sn,
              sku_sn: order.goods.sku_sn,
              number: 1 //只能是1
            }
          ],
          order_type: 4,
          uid: uni.getStorageSync('userInfo').uid,
          // ppyl_join_type: order.user_role || 2,  //1开团2拼团
          ppyl_join_type: 2,  //现在只有自动参
          pay_type: 4,  //1余额2现金4复用支付流水号
          pay_no: order.pay_no,
          pay_order_sn: order.order_sn,
          uc_code: [],
          integral: 0,
          usedIntegralDis: 2,
          usedCouponDis: 2,
          readyType: 1,    //1商品详情页触发，2预订单使用
          autoPpyl: false
        };
        if(this.address) params.city = this.address.city_code;
        if(this.address) params.province = this.address.province_code;
        if(this.address) params.area = this.address.area_code;
        
        if(order.attach_type && order.attach_type !== -1) params.attach_type = order.attach_type; //特殊要求

        let validParams = {
          area_code: order.area_code,
          activity_sn: null,
          uid: uni.getStorageSync('userInfo').uid,
          goods_sn: order.goods_sn,
          sku_sn: order.sku_sn,
          number: 1,
          autoPpyl: false
        }
        if(order.user_role == 1) {
          // 开团要验证
          this.$spost('/ppyl/startCheck', validParams, res => {
            this.readyAndPreOrder(params) 
          });
        } else {
          // 拼团就可以直接过，交给系统处理
          this.readyAndPreOrder(params)
        }
      },
      readyAndPreOrder(params) {
        // 预订单，去预订单页面
        if(this.readyNavigate) return;
        this.readyNavigate = true;
        this.$post('/order/ready', params, res => {
          let preOrder = res.data;
          let time = new Date().getTime();  //模拟一个id，用来做后续预订单页面的检索
          preOrder.id = time;
          uni.setStorageSync('preOrder', preOrder);
          uni.navigateTo({
            url: `/market-pages/pages/ppyl/re-start/re-start?id=${time}`
          })
          this.readyNavigate = false;
        }, err => {
          this.readyNavigate = false;
        });
      },
      getAddress() {
        const promise = new Promise((resolve, reject) => {
          // 如果本次小程序周期内缓存触发器已经触发，存有相关缓存，那么就不请求对应接口数据而直接使用缓存数据
          let storageTrigger = uni.getStorageSync('storageTrigger');
          let addresses = uni.getStorageSync('addresses');
          if(storageTrigger && storageTrigger.address && addresses && addresses.length > 0) {
            for(let i = 0; i < addresses.length; i++) {
              if(addresses[i].is_default == 1) this.address = addresses[i];
            }
            if(!this.address) this.address = addresses[0];
            return resolve();
          }

          let params = {
            uid: uni.getStorageSync('userInfo').uid
          }
          this.$get('/address/list', params, res => {
            let addresses = res.data;
            
            uni.setStorageSync('addresses', addresses);
            // 更新缓存触发器
            let currentStorageTrigger = uni.getStorageSync('storageTrigger'); //重新获取缓存触发器，避免其他接口进行操作时缓存数据相互覆盖
            currentStorageTrigger.address = true;
            uni.setStorageSync('storageTrigger', currentStorageTrigger);
            
            for(let i = 0; i < addresses.length; i++) {
              if(addresses[i].is_default == 1) this.address = addresses[i];
            }
            if(!this.address) this.address = addresses[0];
            resolve();
          }, err => {
            reject();
          })
        })
        return promise;
        
      },

      tryCancelAutoJoin(sn) {
        this.isCtrl = true;
        uni.showModal({
          title: '提示',
          content: '您将停止自动拼团，当前产品拼团结束后，将不再继续参团。是否继续？',
          success: res => {
            if(res.confirm) {
              let params = {
                uid: uni.getStorageSync('userInfo').uid,
                order_sn: sn
              };
              this.$post('/ppyl/cancelAuto', params, res => {
                setTimeout(() => {
                  uni.showToast({
                    title: '操作成功',
                    duration: 2500,
                    mask: true
                  })
                }, this.$toastDelay)
                setTimeout(() => {
                  this.reGetList();
                }, 2800)
              })
            }
          }
        })
      },
      
      
      goToDetail(index) {
        if(this.isCtrl) return this.isCtrl = false;
        let order = this.orders[index];
        if(order.activity_status == 1 || order.activity_status == 2) {
          // 进行中或者已成团
          let url = `/market-pages/pages/ppyl/ppyl-team/ppyl-team?code=${order.area_code}&sn=${order.activity_sn}`;
          uni.navigateTo({
            url: url
          })
        }
      },
      goToWaitList() {
        uni.navigateTo({
          url: '/market-pages/pages/ppyl/wait-list/wait-list'
        })
      },
      goToPpylReward() {
        uni.navigateTo({
          url: '/market-pages/pages/ppyl/ppyl-reward/ppyl-reward'
        })
      },
      goToAreaOrders(item) {
        uni.navigateTo({
          url: `/market-pages/pages/ppyl/area-orders/area-orders?code=${item.area_code}`
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
  @import 'orders.scss';
</style>
