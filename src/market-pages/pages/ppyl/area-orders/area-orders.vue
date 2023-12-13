<template>
  <view class="flex-page">
    <view v-if="info && info.area_code" class="order-group">
      <view class="order-group-title">[{{info.area_name}}] 已拼中 {{info.all_number}} 件</view>
      <view class="order-group-times">
        <view class="order-group-createtime">起：{{info.lottery_time}}</view>
        <view class="order-group-endtime">止：——</view>
      </view>
      <view class="order-group-operate-infos">
        <view v-if="tabIndex == 3" class="order-group-operate-select" @tap="toggleAll">
          <image v-if="isAll" class="operate-toggle-icon" src="/static/images/shopcar_select.png"></image>
          <image v-if="!isAll" class="operate-toggle-icon" src="/static/images/shopcar_unselect.png"></image>
          <text>全选</text>
        </view>
        <view class="order-group-ctrls">
          <view class="order-group-ctrl" :class="{'disabled': !allowShipping}" @tap="toShipping">发货</view>
          <view class="order-group-ctrl" :class="{'disabled': !allowRepurchase}" @tap="toRepurchase">寄售</view>
        </view>
      </view>
      
      <!-- 导航条 -->
      <view class="tabs">
        <view :class="'tab ' + (tabIndex == 3 ? 'active' : '')" data-id="3" @tap="updateTabIndex">
          已拼中 {{info.wait_select_number || 0}}
        </view>
        <view :class="'tab ' + (tabIndex == 2 ? 'active' : '')" data-id="2" @tap="updateTabIndex">
          已寄售 {{info.repurchase_number || 0}}
        </view>
        <view :class="'tab ' + (tabIndex == 1 ? 'active' : '')" data-id="1" @tap="updateTabIndex">
          已发货 {{info.shipping_number || 0}}
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
              <view style="height: 1px"></view>
              <view v-if="tabIndex == 3" class="repurchase-capacity-box">
                <text>当前可寄售</text>
                <text class="repurchase-capacity">{{info.repurchase_capacity || 0}}件</text>
              </view>

              <view v-for="(order, index) in orders" class="order" :key="order.order_sn">
                <view class="order-item">
                  <view class="order-header">
                    <view class="order-base-infos">
                      <view class="order-base-info-sm">
                        <view>{{order.lottery_time}}</view>
                      </view>
                    </view>
                    <view class="order-status medius">
                      {{statusTexts[order.shipping_status]}} 
                    </view>
                  </view>
                  <view class="order-contents">
                    <view v-if="tabIndex == 3" class="order-select" @tap="SelectItem(index)">
                      <image v-show="selectOrders.indexOf(order.order_sn) >= 0" class="order-toggle-icon" src="/static/images/shopcar_select.png"></image>
                      <image v-show="selectOrders.indexOf(order.order_sn) < 0" class="order-toggle-icon" src="/static/images/shopcar_unselect.png"></image>
                    </view>
                    <view v-for="(sku, skuIndex) in order.orderGoods" class="order-content" :key="skuIndex">
                      <view class="order-item-img-box">
                        <image class="order-item-img" :src="sku.images" mode="widthFix" webp lazy-load></image>
                        <view v-if="tabIndex == 3 && sku.goods_status != 1" class="order-item-expire">失效</view>
                      </view>
                      <view class="order-item-info">
                        <view class="order-item-title">{{sku.title}}</view>
                        <view class="order-item-vals">
                          <view class="order-item-val">￥{{sku.real_pay_price || '0.00'}}</view>
                          <view v-if="sku.market_price && sku.market_price != sku.price" class="order-item-val-unactive">￥{{sku.market_price || '0.00'}}</view>
                        </view>
                      </view>
                    </view>
                  </view>

                  <view class="order-sn-box">
                    <view class="order-sn">订单号：{{order.order_sn}}</view>
                    <!-- <view class="order-sn-copy" @click="copyOrderSn(order.order_sn)">复制</view> -->
                    
                    <view v-if="tabIndex == 3" class="order-ctrls">
                      <view class="order-ctrl" :class="{'disabled': order.orderGoods[0].goods_status != 1}" @tap="tryQuicklyShipping(index)">发货</view>
                      <view class="order-ctrl" :class="{'disabled': !info.repurchase_capacity || info.repurchase_capacity == 0}" @tap="tryQuicklyRepurchase(index)">寄售</view>
                    </view>
                  </view>
                  
                </view>
              </view>


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
  export default {
    components: {
      mxDatetimePicker
    },
    data() {
      return {
        area_code: '',

        info: {},

        refreshing: false,
        
        statusTexts: {
          [1]: '已发货',
          [2]: '已回购',
          [3]: '已拼中'
        },
        currentPage: 1,
        pageTotal: 1,

        tabIndex: 3,

        orders: [],
        
        orderLoading: false,
        orderRequestTask: null,

        // 时间控件
        showPicker: false,
        
        touchIndex: 0,
        selectOrders: [],
        isAll: false,

        allowShipping: false,
        allowRepurchase: false,

        rewardPopupVisible: false,
        currentRewardIndex: 0
      }
    },
    onShareAppMessage() {
      let shareInfo = this.$getShareInfo();
      return shareInfo;
    },
    onLoad(options) {
      this.area_code = options.code;
      this.getInfo();
      this.getList();
    },  
    onShow() {
      if(uni.getStorageSync('shouldReload')) {
        uni.removeStorageSync('shouldReload');
        this.selectOrders = [];
        this.isAll = false;
        this.allowShipping = false;
        this.allowRepurchase = false;
        this.getInfo();
        this.reGetList();
      }
    },
    methods: {
      getList() {
        if(this.currentPage > this.pageTotal || this.orderLoading) return;
        let params = {
          page: this.currentPage,
          pageNumber: 20,
          uid: uni.getStorageSync('userInfo').uid,
          area_code: this.area_code,
          shipping_status: this.tabIndex || ''
        }
        this.orderLoading = true;
        let orderRequestTask = this.$sget('/ppyl/winInfo', params, res => {
          this.currentPage += 1;
          this.orderLoading = false;
          if(!res.data.list || res.data.list == 0) return;
          let orders = res.data.list;

          if(this.tabIndex == 3) {
            for(let index = 0; index < orders.length; index++) {
              for(let i = 0; i < orders[index].orderGoods.length; i++) {
                for(let j = 0; j < orders[index].nowGoods.length; i++) {
                  if(orders[index].orderGoods[i].sku_sn == orders[index].nowGoods[j].sku_sn) {
                    orders[index].orderGoods[i].goods_status = orders[index].nowGoods[j].status;
                    break;
                  }
                }
                if(!orders[index].orderGoods[i].goods_status) orders[index].orderGoods[i].goods_status = -1;
              }
            }
          }

          this.orders.push(...orders);
          this.pageTotal = res.data.pageTotal;
        }, err => {
          this.orderLoading = false;
        })
        // 因为是需要验证uid的请求，因多请求因故，走promise异步
        orderRequestTask.then(request => {
          this.orderRequestTask = request;
        })
      },
      
      
      getInfo() {
        let params = {
          uid: uni.getStorageSync('userInfo').uid,
          area_code: this.area_code
        }
        
        this.$post('/ppyl/win', params, res => {
          let infos = res.data;
          if(!infos || infos.length == 0) return;
          this.info = infos[0];
        })

      },
      
      
      SelectItem(index) {
        this.isCtrl = true;
        this.touchIndex = index;
        this.updateSelect({
          order_sn: this.orders[this.touchIndex].order_sn
        })
      },
      updateSelect(info) {
        setTimeout(() => {
          // 放异步，避免冒泡速度过快影响逻辑
          // if(this.isCtrl) return this.isCtrl = false;
          let order_sn = info.order_sn;
          let index = this.selectOrders.indexOf(order_sn);
          if(index >= 0) {
            this.selectOrders.splice(index, 1);
          } else {
            this.selectOrders.push(order_sn);
          }
          if(this.selectOrders.length == this.orders.length) {
            this.isAll = true;
          } else {
            this.isAll = false;
          }
          this.validAllowCtrl();
        }, 10)
        
      }, 
      toggleAll() {
        this.isAll = !this.isAll;
        if(this.isAll) {
          let selectOrders = [];
          for(let i = 0; i < this.orders.length; i++) {
            selectOrders.push(this.orders[i].order_sn);
          }
          this.selectOrders = selectOrders;
        } else {
          this.selectOrders = [];
        }
        this.validAllowCtrl();
      },
      validAllowCtrl() {
        if(
          this.selectOrders.length > 0 &&
          this.info.area.shipping_unit
        ) {
          console.log(this.selectOrders.length, this.info.area.shipping_unit, this.selectOrders.length % this.info.area.shipping_unit == 0)
          if(this.selectOrders.length % this.info.area.shipping_unit == 0) {
            // 选择数为单次发货整数倍时可发货
            this.allowShipping = true;
          } else {
            this.allowShipping = false;
          }
          if(this.selectOrders.length <= this.info.repurchase_capacity) {
            // 选择数小于可寄售数时可寄售
            this.allowRepurchase = true;
          } else {
            this.allowRepurchase = false;
          }
        } else {
          this.allowShipping = false;
          this.allowRepurchase = false;
        }
      },
      selectOrdersInfo() {
        let orders = [], validCount = 0;
        for(let i = 0; i < this.orders.length; i++) {
          if(this.selectOrders.includes(this.orders[i].order_sn)) {
            orders.push(this.orders[i]);
            validCount++;
            if(validCount == this.selectOrders.length) break; //不浪费资源了，直接到数就跳出
          }
        }
        return orders;
      },


      goToDetail(sn) {
        if(this.isCtrl) return this.isCtrl = false;
        let url = `/pages/order-detail/order-detail?sn=${sn}`;
        uni.navigateTo({
          url: url
        })
      },
      reGetList() {
        this.refreshing = true;
        this.currentPage = 1;
        this.pageTotal = 1;
        this.orders = [];
        this.selectOrders = [];
        this.isAll = false;
        this.allowShipping = false;
        this.allowRepurchase = false;
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
        this.reGetList();
      },
      toShipping() {
        if(this.selectOrders.length == 0 || this.selectOrders.length % this.info.area.shipping_unit != 0) {
          return uni.showModal({
            title: '提示',
            content: `选择订单数要为${this.info.area.shipping_unit}的整数倍`,
            showCancel: false
          });
        } else {
          let orders = this.selectOrdersInfo();
          for(let i = 0; i < orders.length; i++) {
            console.log(orders[i]);
            if(orders[i].orderGoods[0].goods_status != 1) {
              return uni.showModal({
                title: '提示',
                content: `选择的订单中存在已失效不可发货的订单，请检查`,
                showCancel: false
              });
            }
          }
        }
        const opreateOrders = {
          orders: this.selectOrdersInfo(),
          area_code: this.info.area_code,
          repurchase_condition: this.info.area.repurchase_condition,
          repurchase_number: this.info.area.repurchase_number
        }
        uni.setStorageSync('opreateOrders', opreateOrders);
        // type 1发货2寄售
        uni.navigateTo({
          url: '/market-pages/pages/ppyl/order-opreate/order-opreate?type=1'
        })
      },
      tryQuicklyShipping(index) {
        if(!this.orders[index] || this.orders[index].orderGoods[0].goods_status != 1) return;
        const opreateOrders = {
          orders: [this.orders[index]],
          area_code: this.info.area_code,
          repurchase_condition: this.info.area.repurchase_condition,
          repurchase_number: this.info.area.repurchase_number
        }
        uni.setStorageSync('opreateOrders', opreateOrders);
        // type 1发货2寄售
        uni.navigateTo({
          url: '/market-pages/pages/ppyl/order-opreate/order-opreate?type=1'
        })
      },


      toRepurchase() {
        if(this.selectOrders.length == 0) {
          return uni.showModal({
            title: '提示',
            content: `至少选择一笔订单进行操作`,
            showCancel: false
          });
        } else if(this.selectOrders.length > this.info.repurchase_capacity) {
          return uni.showModal({
            title: '提示',
            content: `已选择订单数超过可寄售数`,
            showCancel: false
          });
        }
        const opreateOrders = {
          orders: this.selectOrdersInfo(),
          area_code: this.info.area_code,
          repurchase_condition: this.info.area.repurchase_condition,
          repurchase_number: this.info.area.repurchase_number
        }
        uni.setStorageSync('opreateOrders', opreateOrders);
        // type 1发货2寄售
        uni.navigateTo({
          url: '/market-pages/pages/ppyl/order-opreate/order-opreate?type=2'
        })
      },
      tryQuicklyRepurchase(index) {
        if(this.info.repurchase_capacity == 0 || !this.orders[index]) return;
        const opreateOrders = {
          orders: [this.orders[index]],
          area_code: this.info.area_code,
          repurchase_condition: this.info.area.repurchase_condition,
          repurchase_number: this.info.area.repurchase_number
        }
        uni.setStorageSync('opreateOrders', opreateOrders);
        // type 1发货2寄售
        uni.navigateTo({
          url: '/market-pages/pages/ppyl/order-opreate/order-opreate?type=2'
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
  @import 'area-orders.scss';
</style>
