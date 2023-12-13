<template>
  <view class="flex-page">
    <view class="step-tabs">
      <view :class="{'step-tab': true, 'active': stepType == 1}" @tap="toggleType(1)">用户足迹</view>
      <view :class="{'step-tab': true, 'active': stepType == 2}" @tap="toggleType(2)">我的足迹</view>
    </view>
    <!-- 页面内容 -->
    <view class="flex-page-content">

      <!-- 名医讲堂，常规图文列表 -->
      <view class="list-box">
        <scroll-view scroll-y class="tab-page-scroll" @scrolltolower="getList">
           <view v-if="stepType == 1" class="step-list">
            <view v-for="(item, index) in dataList" class="step" :key="index" @tap="goToStepsLinker(item.openid)">
              <view class="step-avatar-box">
                <image v-if="item.userInfo && item.userInfo.avatarUrl" class="step-avatar" :src="item.userInfo.avatarUrl" mode="widthFix"></image>
                <image v-else class="step-avatar" src="/static/images/logo.png" mode="widthFix"></image>
              </view>
              <view class="step-infos">
                <view v-if="item.userInfo && item.userInfo.name" class="step-username">
                  {{item.userInfo.name}}
                </view>
                <view v-else class="step-username">
                  游客
                </view>
                <view v-if="item.userInfo && item.userInfo.vip_level" class="step-info">
                  身份：{{memberTexts[item.userInfo.vip_level]}}
                </view>
                <view class="step-info">
                  <block>最新访问：</block>
                  <block v-if="item.type == 2">{{item.stepTitle}}</block>
                  <block v-else>{{typeTexts[item.type]}}</block>
                </view>
                <view class="step-info">
                  更新时间：{{item.enter_time}}
                </view>

                <view class="step-goods-imgs">
                  <view v-for="(goods, goodsIndex) in item.goodsArray" class="step-goods-img-box" :key="goodsIndex" @tap="goToProduct(goods.goods_sn)">
                    <image v-if="goods.goods_info" class="step-goods-img" :src="goods.goods_info.main_image" mode="widthFix" webp lazy-load></image>
                  </view>
                  <view class="step-goods-img-more">
                    <view>。。。</view>
                    <view style="margin-top: 3rpx">查看更多</view>
                  </view>
                </view>
              </view>

            </view>
          </view>
          <view v-if="stepType == 2" class="user-step-list">
            <block v-for="(data, dataIndex) in dataList" :key="dataIndex">
              <view class="step-date">{{data.date}}</view>
              <view v-for="(item, index) in data.goods" class="step" :key="index" @tap="goToProduct(item.goods_sn)">
                <view class="user-step-goods-img-box">
                  <image v-if="item.goods_info" class="user-step-goods-img" :src="item.goods_info.main_image" mode="widthFix" webp lazy-load></image>
                </view>
                <view class="user-step-goods-infos">
                  <view class="user-step-goods-title">
                    {{item.goods_info ? item.goods_info.title : '未知商品'}}
                  </view>
                  <view class="user-step-goods-info">
                    <view v-if="item.goods_info" class="user-step-goods-vals">
                      <view class="user-step-goods-val">¥{{item.goods_info.sale_price || '0.00'}}</view>
                      <view v-if="item.goods_info.market_price !== item.goods_info.sale_price" class="user-step-goods-val-unactive">¥{{item.goods_info.market_price || '0.00'}}</view>
                    </view>
                    <view class="user-step-goods-ctrl">立即购买</view>
                  </view>
                </view>
              </view>
            </block>
            
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
      stepType: 2,

      currentPage: 1,
      pageTotal: 1,
      listLoading: false,

      apiList: {
        [1]: '/behavior/linkList',
        [2]: '/behavior/list'
      },

      dataList: [],
      dataKeys: [],
      memberTexts: {},
      
      typeTexts: {
        [1]: '首页',
        [2]: '商品详情',
        [3]: '加购商品'
      },
      

      statusTexts: {
        [1]: '到账',
        [2]: '冻结中',
        [3]: '退款取消奖励',
        [-1]: '整单被删除'
      },
      
      isCtrl: false
      
    }
  },
  onLoad(options) {
    
    this.getList();
    this.getLeaderTexts();
  },
  methods: {
    reloadPage() {
      this.currentPage = 1;
      this.pageTotal = 1;
      this.dataList = [];
      this.dataKeys = [];
      this.getList();
    },
    getList() {
      if(this.currentPage > this.pageTotal) return;
      let params = {
        uid: uni.getStorageSync('userInfo').uid,
        start_time: moment().subtract(1, 'months').format('YYYY-MM-DD HH:mm:ss'),
        end_time: moment().format('YYYY-MM-DD HH:mm:ss'),
        page: this.currentPage
      }
      if(this.stepType == 2) params.type = 2; 
      this.listLoading = true;
      this.$get(this.apiList[this.stepType], params, res => {
        this.listLoading = false;
        this.currentPage += 1;
        let dataList = res.data.list;
        if(this.stepType == 1) {
          if(!dataList || dataList.length == 0) return;
          this.pageTotal = res.data.pageTotal;
        } else {
          dataList = res.data.list.list;
          if(!dataList || dataList.length == 0) return;
          this.pageTotal = res.data.list.pageTotal;
        }
        this.initData(dataList);

      }, err => {
        this.listLoading = false;
      })
    },
    initData(dataList) {
      if(this.stepType == 1) {
        // 关联用户的足迹
        for(let i = 0; i < dataList.length; i++) {
          if(dataList[i].type == 2) {
            if(dataList[i].goodsArray && dataList[i].goodsArray.length > 0) {
              dataList[i].stepTitle = dataList[i].goodsArray[0].goods_info.title || '商品详情';
            } else {
              dataList[i].stepTitle = '商品详情';
            }
          }
        }
        this.dataList.push(...dataList);
      } else {
        // 自己的足迹
        
        for(let i = 0; i < dataList.length; i++) {
          let item = dataList[i];
          let date = moment(item.enter_time).format('YYYY年MM月DD日');
          item.enter_time = moment(item.enter_time).format('YYYY.MM.DD HH:mm:ss');
          if(!this.dataKeys.includes(date)) {
            this.dataKeys.push(date);
            this.dataList.push({
              date: date,
              goods: [item]
            })
          } else {
            let index = this.dataKeys.indexOf(date);
            this.dataList[index].goods.push(item);
          }
        }
      }
    },
    getLeaderTexts() {
      this.$sget('/member/title', null, res => {
        let data = res.data;
        let memberTexts = {};
        for(let i = 0; i < data.length; i++) {
          memberTexts[data[i].level] = data[i].name;
        }
        this.memberTexts = memberTexts;
      }, true)
    },

    toggleType(type) {
      this.stepType = type;
      this.reloadPage();
    },

    goToProduct(sn) {
      this.isCtrl = true;
      if(!sn) return;
      uni.navigateTo({
        url: `/pages/product-detail/product-detail?sn=${sn}`
      })
    },

    goToStepsLinker(openid) {
      if(this.isCtrl) return this.isCtrl = false;
      uni.navigateTo({
        url: `/mine-pages/pages/step/steps-linker/steps-linker?openid=${openid}`
      })
    }

    
  }
}
</script>

<style lang="scss" scoped>
  @import 'steps.scss';
</style>