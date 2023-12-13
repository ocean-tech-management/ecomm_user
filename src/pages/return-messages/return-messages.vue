<template>
  <view class="flex-page">
    <!-- 页面内容 -->
    <view class="flex-page-content">

      <!-- 名医讲堂，常规图文列表 -->
      <view class="message-box">
        <scroll-view 
          scroll-y 
          class="tab-page-scroll" 
          :refresher-enabled="true" 
          :refresher-triggered="refreshing"
          @refresherrefresh="reGetList"
        >
          <view class="message-list">
            <!-- 参考京东，多个商品也只显示一个 -->
            <view v-for="item in dataList" class="message" :key="item.msg_code" @tap="goToDetail(item.msg_code)">
              <view class="msg-icon-box">
                <image class="msg-icon" src="/static/images/msg_active.png"></image>
              </view>
              <view class="msg-info">
                <view class="msg-title-box">
                  <view class="msg-title">售后消息提醒</view>
                  <view class="msg-date">{{item.create_time}}</view>
                </view>
                <view class="msg-content">售后订单{{item.order_sn}}待处理</view>
              </view>
            </view>
          </view>
              
          <view v-if="dataList.length == 0  && !dataLoading" class="scroll-tips">暂无记录哦</view>

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

      refreshing: false,

      dataList: [],

      dataLoading: false,
    }
  },
  onShareAppMessage() {
    let shareInfo = this.$getShareInfo();
    return shareInfo;
  },
  onLoad() {
    this.getList();
  },
  methods: {
    getList() {
      let params = {
        uid: uni.getStorageSync('userInfo').uid,
        returnType: 3 //1数字，2列表，3最新一条
      }
      this.dataLoading = true;
      this.$get('/afterSale/msgList', params, res => {
        this.dataLoading = false;
        let dataList = res.data || [];

        for(let i = 0; i < dataList.length; i++) {
          dataList[i].create_time = moment().format('YYYY.MM.DD HH:mm');
        }

        this.dataList.push(...dataList);
      }, err => {
        this.dataLoading = false;
      })
    },
    reGetList() {
      this.refreshing = true;
      this.dataList = [];
      this.getList();
      setTimeout(() => {
        this.refreshing = false;
      }, 200)
    },
    goToDetail(code) {
      uni.navigateTo({
        url: `/pages/return-message/return-message?code=${code}`
      })
    }
  }
  
}
</script>
<style lang="scss" scoped>
@import 'return-messages.scss';
</style>