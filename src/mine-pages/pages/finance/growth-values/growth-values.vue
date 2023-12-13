<template>
  <view class="flex-page">
    <view class="total-box">
      <image class="total-bg" src="/static/images/imgs/mypoints_banner.jpg"></image>
      <view class="total">
        <view class="total-vals">
          <view class="total-val-lg">
            {{userInfo.growthValues[0] || '0'}}
          </view>
          <view class="total-val-sm">
            .{{userInfo.growthValues[1] || '00'}}
          </view>
        </view>
        <view class="total-title">当前成长值</view>
      </view>
    </view>


    <!-- 页面内容 -->
    <view class="flex-page-content">

      <!-- 名医讲堂，常规图文列表 -->
      <view class="list-box">
        <scroll-view scroll-y class="tab-page-scroll" @scrolltolower="getList">
           <view class="growth-values-list">
            <view v-for="item in dataList" class="growth-value" :key="item.create_time">
              <view class="growth-value-info">
                <view class="growth-value-desc">
                  {{typeTexts[item.type]}}
                </view>
                <view v-if="item.order_sn" class="growth-value-desc">
                  {{item.order_sn}}
                </view>
                <view class="growth-value-create-time">{{item.create_time}}</view>
              </view>
              <view :class="{'growth-value-val': true, 'growth-value-less': item.surplus_growth_value < 0}">
                <view>{{item.growth_value_sign}}{{item.surplus_growth_value}}</view>
              </view>
             </view>
           </view>
          <view v-if="dataList.length > 0 && currentPage > pageTotal && !listLoading" class="scroll-tips">没有更多数据了</view>
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
      
      typeTexts: {
        [1]: '自购商品获得',
        [2]: '分享商品获赠',
        [3]: '系统调整',
        [4]: '系统赠送'
      },

      statusTexts: {
        [1]: '到账',
        [2]: '冻结中',
        [3]: '退款取消奖励',
        [-1]: '整单被删除'
      },
      
    }
  },
  onLoad(options) {
    this.userInfo.growthValues = this.userInfo.growth_value ? [this.userInfo.growth_value.split('.')[0] || '0', this.userInfo.growth_value.split('.')[1] || '00'] : '0.00';
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
        this.$get('/user/growthValue', params, res => {
          this.listLoading = false;
          this.currentPage += 1;
          if(res.data.length == 0) return;
          let dataList = res.data.list;
          for(let i = 0; i < dataList.length; i++) {
            dataList[i].create_time = moment(dataList[i].create_time).format('YYYY-MM-DD HH:mm:ss');
            if(!dataList[i].surplus_growth_value || parseFloat(dataList[i].surplus_growth_value) < 0) {
              dataList[i].growth_value_sign = '-';
            } else {
              dataList[i].growth_value_sign = '+';
            }
          }
          this.dataList.push(...dataList);
          this.pageTotal = res.data.pageTotal;
        }, err => {
          this.listLoading = false;
        })
      },

    
  }
}
</script>

<style lang="scss" scoped>
  @import 'growth-values.scss';
</style>