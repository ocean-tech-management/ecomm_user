<template>
  <view class="flex-page">
    <view class="header-bar">
      <!-- 过滤条 -->
      <view class="order-filters">
        <view class="order-filter-types">
          <view class="order-filter-type" :class="{ 'active': type == 1 }" @tap="updateType(1)">自购订单</view>
          <view class="order-filter-type" :class="{ 'active': type == 2 }" @tap="updateType(2)">团队订单</view>
        </view>
        <view class="hidden-price-trigger-box">
          <switch class="hidden-price-trigger" @change="toggleHiddenPrice" />
        </view>
      </view>
      <view class="order-extend-filters">
        <view class="order-extend-time-filter">
          <picker class="order-extend-time-quickly" :value="quicklyTimeIndex" :range="quicklyTimeVal"
            @change="updateQuicklyTime">
            <view class="order-extend-quickly-vals">
              <view class="order-extend-quickly-val">{{ quicklyTimeVal[quicklyTimeIndex] }}</view>
              <image class="order-extend-quickly-icon" src="/static/images/extend.png"></image>
            </view>
          </picker>
          <view class="order-extend-time-trigger" @tap="showPicker = true">
            <view class="order-extend-time-val">
              <view v-if="timeTexts && timeTexts.length > 0">
                {{ timeTexts[0] }} ~ {{ timeTexts[1] }}
              </view>
            </view>
            <view class="order-filter-time">
              <image class="filter-time-icon" src="/static/images/date_black.png"></image>
            </view>
          </view>
        </view>
        <view v-if="type == 1" class="order-filter-search" @tap="showSearch = true">
          <image class="filter-search-icon" src="/static/images/search.png"></image>
        </view>
      </view>

      <view v-if="type == 2" class="order-team-filters">
        <view class="order-team-filter-bar">
          <picker class="order-extend-status" :value="statusIndex" :range="statusVals" range-key="name"
            @change="updateStatusVal">
            <view class="order-extend-status-vals">
              <view class="order-extend-status-val">{{ statusVals[statusIndex].name }}</view>
              <image class="order-extend-quickly-icon" src="/static/images/extend.png"></image>
            </view>
          </picker>
          <view class="order-team-search-box">
            <label class="order-team-search-label" for="team-order-search">
              <image class="team-order-search-icon" src="/static/images/search.png"></image>
              <input id="team-order-search" class="team-order-search-input" type="text" placeholder="请输入搜索关键字"
                placeholder-class="search-input-placeholder" :value="searchWord" @input="updateSearchWord"
                @confirm="confirmKeyword" />
            </label>
          </view>
        </view>
      </view>

      <view class="order-search-bar" :class="{ 'not-show': !showSearch }">
        <label class="order-search-label" for="order-search">
          <image class="order-search-icon" src="/static/images/icon_search.png"></image>
          <input id="order-search" class="order-search-input" type="text" :placeholder="type == 1 ? '输入订单号' : '输入用户名,订单号'"
            placeholder-class="search-input-placeholder" :value="searchWord" @input="updateSearchWord"
            @confirm="confirmKeyword" />
        </label>
        <view class="order-search-cancel" @tap="showSearch = false">关闭</view>
      </view>

      <!-- 旧搜索，暂时不用 -->
      <!-- <view class="search-bar">
        <label class="search-bar-label" for="search">
          <image class="search-icon" src="/static/images/icon_search.png"></image>
          <input id="search" class="search-input" type="text" placeholder="搜索课程关键字" placeholder-class="search-input-placeholder" @input="updateSearchWord" @confirm="confirmKeyword"/>
        </label>
      </view> -->
      <!-- 导航条 -->
      <view v-if="type == 1" class="tabs">
        <view :class="'tab ' + (tabIndex == 0 ? 'active' : '')" data-id="0" @tap="updateTabIndex">
          全部
        </view>
        <view :class="'tab ' + (tabIndex == 1 ? 'active' : '')" data-id="1" @tap="updateTabIndex">
          待付款
        </view>
        <view :class="'tab ' + (tabIndex == 2 ? 'active' : '')" data-id="2" @tap="updateTabIndex">
          待发货
        </view>
        <view :class="'tab ' + (tabIndex == 3 ? 'active' : '')" data-id="3" @tap="updateTabIndex">
          已发货
        </view>
      </view>
      <view v-if="type == 2" class="team-tabs">
        <view :class="'team-tab ' + (tabIndex == 1 ? 'active' : '')" data-id="1" @tap="updateTabIndex">
          <view>直接销售</view>
          <view class="team-tab-num">({{ orderCount.direct || 0 }})</view>
        </view>
        <view :class="'team-tab ' + (tabIndex == 2 ? 'active' : '')" data-id="2" @tap="updateTabIndex">
          <view>团队订单</view>
          <view class="team-tab-num">({{ orderCount.all || 0 }})</view>
        </view>
        <view :class="'team-tab ' + (tabIndex == 0 ? 'active' : '')" data-id="0" @tap="updateTabIndex">
          <view>全部订单</view>
          <view class="team-tab-num">({{ orderCount.team || 0 }})</view>
        </view>
      </view>
    </view>
    <!-- 页面内容 -->
    <view class="flex-page-content">

      <view class="order-box">
        <scroll-view scroll-y class="tab-page-scroll" :refresher-enabled="true" :refresher-triggered="refreshing"
          @refresherrefresh="reGetList" @scrolltolower="getList">
          <view class="order-list">
            <template v-if="type == 1">
              <view v-for="order in orders" class="order" :data-sn="order.order_sn" :key="order.order_sn">
                <view class="team-order-item">
                  <view class="team-order-header" :data-sn="order.order_sn" @tap="goToDetail">
                    <view class="team-order-base-infos">
                      <view class="team-order-base-info-sm">
                        <view>{{ order.order_sn }}</view>
                        <view v-if="order.order_type == 2" class="pt-tag">拼团</view>
                      </view>
                    </view>
                    <view class="team-order-status medius">
                      <block v-if="order.order_status == 2">
                        <block v-if="order.order_type != 2">
                          {{ shippingStatusTexts[order.shipping_status] || '未发货' }}
                        </block>
                        <block v-else>
                          {{ order.pt ? orderTypeTexts[order.pt.activity_status] : '未发货' }}
                        </block>
                      </block>
                      <block v-else>
                        {{ statusTexts[order.order_status] }}
                      </block>
                    </view>
                  </view>
                  <view class="team-order-contents" :data-sn="order.order_sn" @tap="goToDetail">
                    <view v-for="(sku, skuIndex) in order.goods" class="team-order-content" :key="skuIndex">
                      <view class="team-order-item-img-box">
                        <image class="team-order-item-img" :src="sku.main_image" mode="widthFix" webp lazy-load></image>
                      </view>
                      <view class="team-order-item-info">
                        <view class="team-order-item-row">
                          <view class="team-order-item-title">{{ sku.title }}</view>
                          <view v-if="!hiddenPrice" class="team-order-item-price">
                            <text v-if="order.pay_type == 7" class="crowd-activity-sign">积分</text><template
                              v-else>￥</template>
                            {{ sku.price || '0.00' }}
                          </view>
                          <view v-else class="team-order-item-price">
                            <text v-if="order.pay_type == 7" class="crowd-activity-sign">积分</text><template
                              v-else>￥</template>
                            <text style="vertical-align: middle">*****</text>
                          </view>
                        </view>
                        <view class="team-order-item-row team-order-item-row-sm">
                          <view class="team-order-item-attr">{{ sku.property }}</view>
                          <view class="team-order-item-count">×{{ sku.count || 1 }}</view>
                        </view>

                        <view v-if="sku.after_status !== 1 && sku.after_status !== -1" class="team-order-item-row">
                          <view class="team-order-item-after">
                            {{ afterSaleTexts[sku.after_status] }}
                            <block v-if="sku.after_status == 4">
                              {{ sku.partAfterSale ? '，部分退款' : '' }}
                            </block>
                          </view>
                        </view>
                      </view>
                    </view>
                  </view>

                  <view class="team-order-extends">
                    <view class="order-item-val-info">
                      <!-- <view class="collage-tag-flex1">
                        <view class="collage-tag">拼团</view>
                      </view> -->
                      <view style="margin-right: 20rpx">共{{ order.goods.length }}件商品</view>
                      <view v-if="!hiddenPrice" class="order-item-val">
                        <text v-if="order.pay_type == 7" class="crowd-activity-sign">积分</text><template
                          v-else>￥</template>{{ order.real_pay_price || 0 }}
                      </view>
                      <view v-else class="order-item-val">
                        ￥<text style="vertical-align: middle">*****</text>
                      </view>
                    </view>
                    <view class="order-extends">
                      <view v-if="type == 1" class="order-ctrls">
                        <view v-if="order.order_status == 1" class="order-ctrl" :data-sn="order.order_sn"
                          @tap="askCancelOrder">取消订单</view>
                        <view v-if="order.order_status == 1" class="order-ctrl primary" :data-sn="order.order_sn"
                          @tap="goToDetail">立即支付</view>
                        <view v-if="order.order_status == 3" class="order-ctrl" :data-code="order.shipping_code"
                          :data-sn="order.order_sn" @tap="goToLogistics">查看物流</view>
                        <view v-if="order.order_status == 3 && order.isNormal" class="order-ctrl primary"
                          :data-sn="order.order_sn" @tap="confirmGet">确认收货</view>
                      </view>
                    </view>
                  </view>

                </view>
              </view>
            </template>

            <template v-if="type == 2">
              <view v-for="order in orders" class="order" :data-sn="order.order_sn" :key="order.order_sn">
                <view class="team-order-item" :data-sn="order.order_sn" @tap="goToDetail">
                  <view class="team-order-header">
                    <view class="team-order-base-infos">
                      <view class="team-order-base-info">
                        <view>订单号：{{ order.order_sn }}</view>
                        <view v-if="order.order_type == 2" class="pt-tag">拼团</view>
                      </view>
                      <view v-if="order.user_name" class="team-order-base-info">
                        <view class="team-order-username">客户：{{ order.user_name }}</view>
                        <view v-if="order.vip_name && order.vip_name !== ''" class="team-order-level">{{ order.vip_name }}
                        </view>
                      </view>
                      <view v-if="order.link_user_name" class="team-order-base-info">
                        <view class="team-order-username">归属：{{ order.link_user_name }}({{ order.link_user_phone }})
                        </view>
                        <view v-if="order.link_user_vip_name && order.link_user_vip_name !== ''" class="team-order-level">
                          {{ order.link_user_vip_name }}</view>
                      </view>
                    </view>
                    <view class="team-order-status">
                      <block v-if="order.order_status == 2">
                        <block v-if="order.order_type != 2">
                          {{ shippingStatusTexts[order.shipping_status] || '未发货' }}
                        </block>
                        <block v-else>
                          {{ order.pt ? orderTypeTexts[order.pt.activity_status] : '未发货' }}
                        </block>
                      </block>
                      <block v-else>
                        {{ statusTexts[order.order_status] }}
                      </block>
                    </view>
                  </view>
                  <view v-for="(sku, skuIndex) in order.goods" class="team-order-content" :key="skuIndex">
                    <view class="team-order-item-img-box">
                      <image class="team-order-item-img" :src="sku.main_image" mode="widthFix" webp lazy-load></image>
                    </view>
                    <view class="team-order-item-info">
                      <view class="team-order-item-row">
                        <view class="team-order-item-title">{{ sku.title }}</view>
                        <view v-if="!hiddenPrice" class="team-order-item-price">￥{{ sku.price || '0.00' }}</view>
                        <view v-else class="team-order-item-price">￥<text style="vertical-align: middle">*****</text>
                        </view>
                      </view>
                      <view class="team-order-item-row">
                        <view class="team-order-item-attr">{{ sku.property }}</view>
                        <view class="team-order-item-count">×{{ sku.count || 1 }}</view>
                      </view>
                      <view v-if="sku.after_status !== 1 && sku.after_status !== -1" class="team-order-item-row">
                        <view class="team-order-item-after">{{ afterSaleTexts[sku.after_status] }}</view>
                      </view>
                    </view>
                  </view>
                  <view class="team-order-extends">
                    <view class="team-order-time">{{ order.create_time }}</view>
                    <view v-if="!hiddenPrice" class="team-order-pay-info">
                      实付
                      <text class="team-order-price">
                        <text v-if="order.pay_type == 7" class="crowd-activity-sign">积分</text><template
                          v-else>￥</template>
                        {{ order.real_pay_price || 0 }}
                      </text>
                    </view>
                    <view v-else class="team-order-pay-info">
                      <text>实付</text>
                      <text class="team-order-price">
                        <text v-if="order.pay_type == 7" class="crowd-activity-sign">积分</text><template
                          v-else>￥</template>
                        <text style="vertical-align: middle">*****</text>
                      </text>
                    </view>
                    <view class="team-order-fare">（含运费￥{{ order.fare_price || 0 }}）</view>
                  </view>

                </view>
              </view>
            </template>
          </view>

          <view v-if="orderLoading" class="scroll-tips">加载中...</view>
          <view v-if="orders.length > 0 && currentPage > pageTotal && !orderLoading" class="scroll-tips">已经到底啦</view>
          <view v-if="orders.length == 0 && currentPage > pageTotal && !orderLoading" class="scroll-tips">暂无记录哦</view>

        </scroll-view>


      </view>
    </view>
    <mx-datetime-picker :show="showPicker" type="range" :value="timerange" :show-tips="true" :begin-text="'开始'"
      :end-text="'结束'" :show-seconds="true" @confirm="onSelectedTime" @cancel="onSelectedTime" />
  </view>
</template>
<script>
  import mxDatetimePicker from '@/components/mx-datetimepicker/mx-datetimepicker.vue';
  import moment from 'moment';
  export default {
    components: {
      mxDatetimePicker
    },
    data() {
      return {
        hiddenPrice: false,

        tabIndex: 0,

        type: 1,
        showSearch: false,
        searchWord: '',
        keyword: '',

        quicklyTimeVal: [
          '全部',
          '指定',
          '本周',
          '本月',
          '上月',
          '本年',
          '去年',
        ],
        quicklyTimeIndex: 0,
        statusVals: [{
            val: 0,
            name: '全部状态'
          }, {
            val: 1,
            name: '未支付'
          }, {
            val: 2,
            name: '待发货'
          }, {
            val: 3,
            name: '已发货'
          },
          // {
          //   val: 4,
          //   name: '已签收'
          // },
          {
            val: 5,
            name: '退货申请'
          }, {
            val: 6,
            name: '退货中'
          }, {
            val: 7,
            name: '退货成功'
          }, {
            val: 8,
            name: '已完成'
          }, {
            val: -1,
            name: '已取消'
          }, {
            val: -2,
            name: '已超时'
          }, {
            val: -3,
            name: '已关闭'
          }, {
            val: -4,
            name: '拼团失败'
          }
        ],
        statusIndex: 0,

        refreshing: false,

        apiList: {
          [1]: '/user/order',
          [2]: '/user/teamOrder',
          ['team']: '/user/teamAllOrder'
        },

        currentPage: 1,
        pageTotal: 1,
        keyword: '',
        orders: [],
        orderCount: {
          all: 0,
          direct: 0,
          total: 0
        },
        statusTexts: {
          [1]: '未支付',
          [2]: '待发货',
          [3]: '已发货',
          [4]: '已签收',
          [5]: '退货申请',
          [6]: '退货中',
          [7]: '退货成功',
          [8]: '已完成',
          [-1]: '已取消',
          [-2]: '已超时',
          [-3]: '已关闭',
          [-4]: '拼团失败'
        },
        shippingStatusTexts: {
          [1]: '未发货',
          [2]: '已备货',
          [3]: '已发货'
        },
        orderTypeTexts: {
          [1]: '拼团中',
          [2]: '未发货'
        },

        afterSaleTexts: {
          [1]: '正常',
          [2]: '申请售后中',
          [3]: '售后中',
          [4]: '售后成功',
          [5]: '售后被拒',
          [-1]: '用户取消售后'
        },
        orderLoading: false,
        orderRequestTask: null,
        teamOrderCountTask: null,

        // 时间控件
        showPicker: false,
        timerange: [],
        timeTexts: [],
        timeVals: []
      }
    },
    onShareAppMessage() {
      let shareInfo = this.$getShareInfo();
      return shareInfo;
    },
    onLoad(options) {
      if(options.id) this.tabIndex = options.id;
      this.getList();
    },
    methods: {
      getList() {
        if(this.currentPage > this.pageTotal || this.orderLoading) return;
        let params = {
          uid: uni.getStorageSync('userInfo').uid,
          keyword: this.keyword,
          page: this.currentPage
        }
        let url = this.apiList[this.type];
        if(this.type == 1) params.searType = this.tabIndex == 0 ? '' : this.tabIndex;
        if(this.type == 2) {
          params.orderUserType = this.tabIndex == 0 ? '' : this.tabIndex;
          params.searType = this.statusVals[this.statusIndex].val || '';
          if(this.tabIndex == 0) url = this.apiList['team'];
        }
        if(this.timeVals && this.timeVals.length == 2) {
          params.start_time = this.timeVals[0];
          params.end_time = this.timeVals[1];
        }
        this.orderLoading = true;
        let orderRequestTask = this.$sget(url, params, res => {
          this.orderLoading = false;
          this.currentPage += 1;
          if(!res.data.list || res.data.list.length == 0) return;
          let orders = res.data.list;
          for(let i = 0; i < orders.length; i++) {
            orders[i].isNormal = true;  //先假设订单是正常的
            for(let j = 0; j < orders[i].goods.length; j++) {
              let normalGoodsNum = 0;
              orders[i].goods[j].attr = JSON.parse(orders[i].goods[j].specs);
              orders[i].goods[j].property = Object.values(orders[i].goods[j].attr).join(' ');
              if(orders[i].goods[j].after_status == 1 || orders[i].goods[j].after_status == 5 || orders[i].goods[j].after_status == -1) {
                normalGoodsNum += 1;
              } else if(orders[i].goods[j].after_status == 2 || orders[i].goods[j].after_status == 3) {
                orders[i].isNormal = false; //全退
                break;
              } else {
                if(orders[i].goods[j].partAfterSale) normalGoodsNum += 1;
              }
              if(j == orders[i].goods.length - 1 && normalGoodsNum == 0) orders[i].isNormal = false; //钱全退光了
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

      getTeamOrderCount() {
        let params = {
          uid: uni.getStorageSync('userInfo').uid,
          keyword: this.keyword
        }

        params.searType = this.statusVals[this.statusIndex].val || '';

        if(this.timeVals && this.timeVals.length == 2) {
          params.start_time = this.timeVals[0];
          params.end_time = this.timeVals[1];
        }
        let teamOrderCountTask = this.$get('/user/teamOrderCount', params, res => {
          let data = res.data;
          this.orderCount = {
            all: data.all,
            direct: data.direct,
            team: data.team
          }

        })

        // 因为是需要验证uid的请求，因多请求因故，走promise异步
        teamOrderCountTask.then(request => {
          this.teamOrderCountTask = request;
        })
      },
      goToDetail(e) {
        let sn = e.currentTarget.dataset.sn;
        let url = `/pages/order-detail/order-detail?sn=${sn}`;
        if(this.type == 2) url += `&team=true`;
        uni.navigateTo({
          url: url
        })
      },
      reGetList() {
        this.refreshing = true;
        this.currentPage = 1;
        this.pageTotal = 1;
        this.orders = [];
        this.getList();
        if(this.type === 2) {
          this.getTeamOrderCount();
        }
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
        if(this.teamOrderCountTask) {
          this.teamOrderCountTask.abort();
          this.teamOrderCountTask = null;
          this.orderLoading = false;
        }
        this.reGetList();
      },

      updateQuicklyTime(e) {
        let index = e.detail.value;
        this.quicklyTimeIndex = index;
        let start_time = moment(this.timeTexts[0]).format('YYYY.MM.DD'), end_time = moment(this.timeTexts[1]).format('YYYY.MM.DD');
        if(index == 1) {
          start_time = moment();
          end_time = moment();
        } else if(index == 2) {
          start_time = moment().startOf("isoWeek");
          end_time = moment().endOf("isoWeek");
        } else if(index == 3) {
          start_time = moment().startOf("month");
          end_time = moment().endOf("month");
        } else if(index == 4) {
          start_time = moment().subtract(1, 'months').startOf("month");
          end_time = moment().subtract(1, 'months').endOf("month");
          console.log(moment('2020-02-28').subtract(1, 'months').startOf("month"));
        } else if(index == 5) {
          start_time = moment().startOf("year");
          end_time = moment().endOf("year");
        } else if(index == 6) {
          start_time = moment().subtract(1, 'years').startOf("year");
          end_time = moment().subtract(1, 'years').endOf("year");
        }

        if(this.quicklyTimeIndex == 0) {
          this.timeTexts = [];
          this.timeVals = [];
        } else {
          this.timeTexts = [moment(start_time).format('YYYY.MM.DD'), moment(end_time).format('YYYY.MM.DD')];
          this.timeVals = [moment(start_time).format('YYYY-MM-DD 00:00:00'), moment(end_time).format('YYYY-MM-DD 23:59:59')];
        }

        if(this.orderRequestTask) {
          this.orderRequestTask.abort();
          this.orderRequestTask = null;
          this.orderLoading = false;
        }
        if(this.teamOrderCountTask) {
          this.teamOrderCountTask.abort();
          this.teamOrderCountTask = null;
          this.orderLoading = false;
        }
        this.reGetList();
      },

      updateStatusVal(e) {
        let index = e.detail.value;
        this.statusIndex = index;

        if(this.orderRequestTask) {
          this.orderRequestTask.abort();
          this.orderRequestTask = null;
          this.orderLoading = false;
        }
        if(this.teamOrderCountTask) {
          this.teamOrderCountTask.abort();
          this.teamOrderCountTask = null;
          this.orderLoading = false;
        }
        this.reGetList();

      },

      updateType(val) {
        this.type = val;
        this.tabIndex = this.type == 2 ? 1 : 0;
        this.statusIndex = 0;
        this.searchWord = '';
        this.keyword = '';

        let timeIndex = this.type == 1 ? 0 : 3; //订单页默认全部，团队单默认本月
        this.updateQuicklyTime({
          detail: {
            value: timeIndex
          }
        })
        // if(this.orderRequestTask) {
        //   this.orderRequestTask.abort();
        //   this.orderRequestTask = null;
        //   this.orderLoading = false;
        // }
        // this.reGetList();
      },
      updateSearchWord(e) {
        this.searchWord = e.detail.value;
      },
      confirmKeyword(e) {
        this.keyword = this.searchWord;
        this.reGetList();
      },

      toggleHiddenPrice(e) {
        let hiddenPrice = e.detail.value;
        this.hiddenPrice = hiddenPrice;
      },

      askCancelOrder(e) {
        let order_sn = e.currentTarget.dataset.sn;

        uni.showModal({
          title: '提示',
          content: '您确定取消该订单吗？',
          success: res => {
            if(res.confirm) {
              let params = {
                uid: uni.getStorageSync('userInfo').uid,
                order_sn: order_sn
              }
              this.$post('/order/cancel', params, res => {
                setTimeout(() => {
                  uni.showToast({
                    title: '取消订单成功',
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
      confirmGet(e) {
        let sn = e.currentTarget.dataset.sn;
        uni.showModal({
          title: '提示',
          content: '温馨提示：完成确认收货后退换货通道将自动关闭，是否确认收货？',
          confirmText: '确认',
          success: res => {
            if(res.confirm) {
              let params = {
                uid: uni.getStorageSync('userInfo').uid,
                order_sn: sn
              }
              this.$post('/order/confirm', params, res => {
                setTimeout(() => {
                  uni.showToast({
                    title: '确认收货成功',
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
      goToLogistics(e) {
        let code = e.currentTarget.dataset.code;
        let sn = e.currentTarget.dataset.sn;
        if(code.split(',').length > 1) {
          uni.navigateTo({
            url: `/pages/logistics-list/logistics-list?code=${code}&sn=${sn}`
          })
        } else {
          uni.navigateTo({
            url: `/pages/logistics/logistics?code=${code}&sn=${sn}`
          })
        }

      },
      onSelectedTime(val) {
        this.showPicker = false;
        // return console.log(val);
        if(val) {
          this.timerange = val;
          let start_time = val.value[0], end_time = val.value[1];
          this.timeTexts = [moment(start_time).format('YYYY.MM.DD'), moment(end_time).format('YYYY.MM.DD')];
          this.timeVals = [moment(start_time).format('YYYY-MM-DD 00:00:00'), moment(end_time).format('YYYY-MM-DD 23:59:59')];
          this.quicklyTimeIndex = 1;
          this.reGetList();
        }
      }
    }
  }
</script>

<style lang="scss" scoped>
@import 'orders.scss';
</style>
