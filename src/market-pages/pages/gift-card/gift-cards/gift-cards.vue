<template>
  <view class="flex-page">
    <view class="flex-page-content">
      <scroll-view class="card-list" scroll-y @scrolltolower="getList">
        <!-- 空节点，做撑开空间用 -->
        <block v-if="dataList.length > 0">
          <view style="height: 1rpx"></view>
          <view v-for="(item, index) in dataList" class="card-item" :key="index">
            <view class="card-base-info">
              <block>
                <image class="card-bg" v-if="item.status != -1" src="/market-pages/static/images/gift_card/card_bg.png"></image>
                <image class="card-bg" v-if="item.status == -1" src="/market-pages/static/images/gift_card/card_invalid_bg.png"></image>
              </block>
              <view class="card-base-info-content">
                <view class="card-base-info-title">{{item.type ? cardInfos[item.type].name : cardInfos[1].name}}</view>
                <view class="card-sn">202948599308572</view>
                <view class="card-date">有效期限：{{item.start_time}}至{{item.end_time}}</view>
                <image 
                  class="card-more-icon" 
                  :class="{'active': item.showExtend}"
                  src="/static/images/more.png" 
                  @tap="toggleExtend(index)"
                ></image>

                <view v-if="item.status != -1" class="card-use-ctrl" @tap="goToDetail(item.order_sn)">去兑换</view>
              </view>
              <image v-if="item.status == -1" class="card-invalid-sign" src="/market-pages/static/images/gift_card/card_invalid_sign.png"></image>
            </view>
            <view class="card-extend-info" :class="{'active': item.showExtend}">
              <view class="card-extend-info-content">
                <view class="card-extend-title">说明：</view>
                <view class="card-goods-box">
                  <view v-for="(goods, goodsIndex) in item.goods" class="card-goods" :key="goodsIndex">
                    <view class="card-goods-title">{{goods.title}}</view>
                    <view class="card-goods-count">(12份)</view>
                  </view>
                </view>
              </view>
            </view>
          </view>
          <view v-if="dataList.length > 0 && currentPage > pageTotal && !dataLoading" class="scroll-tips" style="width: 100%">已经到底啦</view>
        </block>
        <block v-else-if="currentPage > pageTotal && !dataLoading">
          <view class="nodata-page">
            <view class="nodata-page-content">
              <image class="nodata-page-icon" src="/market-pages/static/images/gift_card/card_nodata.png" mode="widthFix"></image>
              <view class="nodata-page-title">您还没有礼品卡</view>
            </view>
          </view>
        </block>
      </scroll-view>

    </view>

    <view class="card-bottom-ctrls">
      <view class="card-bottom-ctrl" @tap="showExchange">兑换礼品卡</view>
    </view>

    <!-- 弹窗内容 -->
    <view v-show="exchangeVisible" class="card-popup">
      <view class="card-popup-mask" @tap="exchangeVisible = false"></view>
      <view class="card-popup-content">
        <view class="card-popup-data">
          <view class="card-popup-data-item">
            <view class="card-popup-title">兑换码</view>
            <input class="card-popup-input" v-model="exchangeData.code" maxlength="32" @input="updateCardCode" adjust-position />
          </view>
          <view class="card-popup-data-item">
            <view class="card-popup-title">密码</view>
            <input class="card-popup-input" maxlength="8" v-model="exchangeData.pwd" @input="updateCardPwd" adjust-position />
          </view>
        </view>
        <view class="card-popup-ctrls">
          <view class="card-popup-ctrl" @tap="tryExchange">立即兑换</view>  
        </view>
      </view>
    </view>

  </view>
</template>
<script>
import moment from 'moment';
export default {
  data() {
    return {
      activity_code: null,
      
      currentPage: 1,
      pageTotal: 1,
      keyword: '',
      dataList: [],
      active: {},
      limit_type: 2,

      cardInfos: {
        [1]: {
          name: '充值卡',
          type: 1
        },
        [2]: {
          name: '充值卡',
          type: 1
        }
      },

      exchangeData: {
        code: '',
        pwd: ''
      },
      exchangeVisible: false,
      
      dataLoading: false,
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
        page: this.currentPage
      }
      this.dataLoading = true;
      this.$get('/brandSpace/list', params, res => {
        this.dataLoading = false;
        this.currentPage += 1;

        // if(!res.data.list || res.data.list.length == 0) return;
        let dataList = res.data;
        for(let i = 0; i < dataList.length; i++) {
          dataList[i].start_time = moment(dataList[i].start_time).format('YYYY年MM月DD日');
          dataList[i].end_time = moment(dataList[i].end_time).format('YYYY年MM月DD日');
          dataList[i].showExtend = false;
        }
        this.dataList.push(...dataList);
        this.pageTotal = res.data.pageTotal;
      }, err => {
        this.dataLoading = false;
      })
    },
    reGetList() {
      this.pageTotal = 1;
      this.currentPage = 1;
      this.dataList = [];
      this.getList();
    },

    toggleExtend(index) {
      this.dataList[index].showExtend = !this.dataList[index].showExtend;
      console.log(this.dataList[index]);
    },

    goToDetail(sn) {
      uni.navigateTo({
        url: `/market-pages/pages/gift-card/gift-card-detail/gift-card-detail?sn=${sn}`
      })
    },

    updateCardCode(e) {
      this.exchangeData.code = e.detail.value;
    },
    updateCardPwd(e) {
      this.exchangeData.pwd = e.detail.value;
    },

    showExchange(e) {
      this.exchangeData = {
        code: '',
        pwd: ''
      };
      this.exchangeVisible = true;
    },
    tryExchange(e) {
      this.exchangeVisible = false;
    },
  }
}
</script>
<style lang="scss" scoped>
  @import 'gift-cards.scss'
</style>