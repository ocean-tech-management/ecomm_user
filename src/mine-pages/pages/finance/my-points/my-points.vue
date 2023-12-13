<template>
  <view class="flex-page">
    <view class="total-box">
      <image class="total-bg" src="/static/images/imgs/mypoints_banner.jpg"></image>
      <view class="total">
        <view class="total-val">
          <view class="total-val-point">{{userInfo.integral}}</view>
          <view class="total-val-as-money">￥{{userInfo.integral / 100}}</view>
        </view>
        <view class="total-title">积分余额</view>
      </view>
    </view>


    <!-- 页面内容 -->
    <view class="flex-page-content">

      <!-- 名医讲堂，常规图文列表 -->
      <view class="list-box">
        <scroll-view scroll-y class="tab-page-scroll" @scrolltolower="getList">
           <view class="incomes-list">
            <view v-for="item in dataList" class="income" :key="item.create_time">
               <view class="income-info">
                <view class="income-desc">{{typeText[item.change_type]}} {{item.order_user_name ? ('-来自' + item.order_user_name) : ''}}</view>
                <view class="income-desc-item">
                   <view v-if="item.order_sn" class="income-desc-orderid">订单号：{{item.order_sn}}</view>
                 </view>
                <view class="income-create-time">{{item.create_time}}</view>
               </view>
               <view :class="{'income-val': true, 'income-less': item.integral < 0}">
                 <view>{{item.integral}}</view>
                 
                <view v-if="item.order_sn" class="income-desc-orderval">￥{{item.total_price || 0}}</view>
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
      integral: 0, 
      dataList: [],
      typeText: {
        [1]: '签到',
        [2]: '订单分润',
        [3]: '消费'
      }
      
    }
  },
  onShareAppMessage() {
    let shareInfo = this.$getShareInfo();
    return shareInfo;
  },
  onLoad(options) {
    this.getList();
  },
  methods: {
    getList() {
        if(this.currentPage > this.pageTotal) return;
        let params = {
          uid: uni.getStorageSync('userInfo').uid,
          page: this.currentPage
        }
        this.listLoading = true;
        this.$get('/user/integral', params, res => {
          this.listLoading = false;
          this.currentPage += 1;
          if(res.data.length == 0) return;
          let dataList = res.data.list;
          for(let i = 0; i < dataList.length; i++) {
            dataList[i].create_time = moment(dataList[i].create_time).format('MM-DD HH:mm')
          }
          this.dataList.push(...dataList);
          this.integral = res.data.integral.total_integral;
          this.pageTotal = res.data.pageTotal;
        }, err => {
          this.listLoading = false;
        })
      },

    
  }
}
</script>

<style lang="scss" scoped>
  @import 'my-points.scss';
</style>