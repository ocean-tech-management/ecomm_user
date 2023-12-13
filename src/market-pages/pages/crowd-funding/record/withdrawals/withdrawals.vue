<template>
  <view class="flex-page">
    <!-- 页面内容 -->
    <view class="flex-page-content">
      <!-- 常规图文列表 -->
      <view class="list-box">
        <scroll-view scroll-y class="tab-page-scroll" @scrolltolower="getList">
          <view class="incomes-list">
            <view v-for="item in dataList" class="income" :key="item.id">
              <view class="income-content">
                <view class="income-info">
                  <view class="income-desc">
                    <text>回收</text>
                    <block v-if="item.status == 1">
                      <block v-if="item.check_status == 1">
                        <text :class="paymentStatusClass[item.payment_status]">({{paymentStatusText[item.payment_status]}})</text>
                      </block>
                      <block v-else>
                        <text :class="checkStatusClass[item.check_status]">({{checkStatusText[item.check_status]}})</text>
                      </block>
                    </block>
                    <text v-if="item.status == 2" class="error-color">(已取消)</text>
                  </view>
                  <view class="income-desc-item">
                    <view v-if="item.order_sn" class="income-desc-orderid">{{item.order_sn}}</view>
                  </view>
                  <view class="income-create-time">申请时间：{{item.create_time}}</view>
                  <view v-if="item.check_time" class="income-create-time">审核时间：{{item.check_time}}</view>
                </view>
                <view class="income-other-desc">
                  <view :class="{'income-val': true, 'income-less': parseFloat(item.price) < 0}">{{item.price}}</view>
                  <view v-if="item.divide_price && item.divide_price != '0.00'" class="income-other-desc-item">
                    <view>（商城）{{item.divide_price}}</view>
                  </view>
                  <view v-if="item.ppyl_price && item.ppyl_price != '0.00'" class="income-other-desc-item">
                    <view>（拼团）{{item.ppyl_price}}</view>
                  </view>
                  <view v-if="item.handing_fee && item.handing_fee != '0.00'" class="income-other-desc-item">
                    <view>（手续费）{{item.handing_fee}}</view>
                  </view>
                </view>
              </view>
              <block v-if="item.check_status == 1">
                <view v-if="item.payment_status == 1" class="income-remark">
                  <text>温馨提示：</text>
                  <text>{{item.payment_remark || '已成功回收到账，请检查账户到账情况'}}</text>
                </view>
                <view v-if="item.payment_status == 2" class="income-remark">
                  <text>温馨提示：</text>
                  <text :class="paymentStatusClass[item.payment_status]">{{item.payment_remark || '银行处理中，请耐心等待'}}</text>
                </view>
                <view v-if="item.payment_status == -1" class="income-remark">
                  <text>温馨提示：</text>
                  <text :class="paymentStatusClass[item.payment_status]">{{item.payment_remark || '回收失败，请检查银行卡和真实姓名是否正确'}}</text>
                </view>
              </block>
              <block v-else>
                <view v-if="item.remark" class="income-remark">
                  <text>温馨提示：</text>
                  <text :class="checkStatusClass[item.check_status]">{{item.remark}}</text>
                </view>
              </block>
              <view class="income-remark">
                <text>温馨提示：</text>
                <text>回收失败金额会返回对应钱包</text>
              </view>
            </view>
          </view>
          <view v-if="dataList.length > 0 && currentPage > pageTotal && !listLoading" class="scroll-tips">已经到底啦</view>
          <view v-if="dataList.length == 0 && currentPage > pageTotal && !listLoading" class="scroll-tips">暂无记录哦</view>
        </scroll-view>
      </view>
    </view>
  </view>
</template>
<script>
import moment from 'moment';
export default {
  data() {
    return {
      userInfo: uni.getStorageSync('userInfo'),
      currentPage: 1,
      pageTotal: 1,
      listLoading: false,
      dataList: [],
      checkStatusText: {
        [1]: '已通过',
        [2]: '已驳回',
        [3]: '待审核'
      },
      checkStatusClass: {
        [1]: 'success-color',
        [2]: 'error-color',
        [3]: 'warning-color'
      },
      paymentStatusText: {
        [1]: '已到账',
        [2]: '银行处理中',
        [-1]: '回收失败'
      },
      paymentStatusClass: {
        [1]: 'success-color',
        [2]: 'warning-color',
        [-1]: 'error-color'
      },
      statusText: {
        [1]: '正常',
        [2]: '已取消'
      },
      timeType: 1 // 1-新增业绩 2-查看历史数据
    }
  },
  onShareAppMessage() {
    let shareInfo = this.$getShareInfo();
    return shareInfo;
  },
  onLoad(options) {
    if (options.type) this.timeType = options.type
    this.getList();
  },
  methods: {
    getList() {
      if(this.currentPage > this.pageTotal) return;
      let params = {
        uid: uni.getStorageSync('userInfo').uid,
        page: this.currentPage,
        time_type: this.timeType
      }
      this.listLoading = true;
      this.$get('/user/withdrawList', params, res => {
        this.listLoading = false;
        this.currentPage += 1;
        if(res.data.length == 0) return;
        let dataList = res.data.list;
        for(let i = 0; i < dataList.length; i++) {
          dataList[i].create_time = moment(dataList[i].create_time).format('MM-DD HH:mm');
          if(dataList[i].check_time) dataList[i].check_time = moment(dataList[i].check_time).format('MM-DD HH:mm');
        }

        this.dataList.push(...dataList);
        this.pageTotal = res.data.pageTotal;
      }, err => {
        this.listLoading = false;
      })
    }
  }
}
</script>
<style lang="scss" scoped>
@import "withdrawals.scss";
</style>