<template>
  <view class="flex-page">
    <scroll-view 
      class="tab-page-scroll" 
      scroll-y 
      :refresher-enabled="true" 
      :refresher-triggered="refreshing"
      @refresherrefresh="tryRefresh" 
      @refresherrestore="refreshPage" 
      @scrolltolower="getList(false)"
    >
    

      <view class="team-page-top">
        <block v-if="userInfo.uid">
          <!-- 个人简介 -->
          <view class="team-page-top-content">
            <view class="userinfo">
              <image class="user-avatar" :src="userInfo.avatarUrl || '/static/images/logo.png'" webp></image>
              <view class="userinfo-info">
                <view class="userinfo-info-item">
                  <view class="userinfo-name">{{userInfo.name || '游客'}}</view>
                  <view v-if="userInfo.vip_level" class="userinfo-state">{{userInfo.vip_name}}</view>
                  <view v-if="userInfo.team_vip_level" class="userinfo-state">{{userInfo.team_vip_name}}</view>
                </view>
                <view class="userinfo-info-item">
                  <view v-if="userInfo.phone" class="userinfo-phone">{{userInfo.phone}}</view>
                </view>
              </view>
              <view class="teams-info">
                <view class="teammate-num">{{TeamAllUserNumber || 0}}</view>
                <view class="teams-info-tips">团队总数</view>
              </view>

            </view>
            <view class="team-tabs">
              <view class="team-tab" :class="{'active': tabIndex == 3}" @tap="updateTabIndex(3)">普通盟主</view>
              <view class="team-tab" :class="{'active': tabIndex == 2}" @tap="updateTabIndex(2)">一星盟主</view>
              <view class="team-tab" :class="{'active': tabIndex == 1}" @tap="updateTabIndex(1)">二星盟主</view>
            </view>
          </view>
        </block>
      </view>
      

      <view class="team-info-totals">
        <view class="team-info-total" :class="{'team-info-total-active': selectSpecificType == 'today'}" @tap="updateSpecificType('today')">
          <view class="team-info-total-val">{{dataBoard.toady_team_number}}</view>
          <view class="team-info-total-title">
            <view class="team-info-total-title-tips">(今日新增)</view>
          </view>
        </view>
        <view class="team-info-total" :class="{'team-info-total-active': selectSpecificType == 'month'}" @tap="updateSpecificType('month')">
          <view class="team-info-total-val">{{dataBoard.month_team_number}}</view>
          <view class="team-info-total-title">
            <view class="team-info-total-title-tips">(本月新增)</view>
          </view>
        </view>
        <view class="team-info-total" :class="{'team-info-total-active': selectSpecificType == 'direct'}" @tap="updateSpecificType('direct')">
          <view class="team-info-total-val">{{dataBoard.direct_team_number}}</view>
          <view class="team-info-total-title">
            <view class="team-info-total-title-tips">(直属)</view>
          </view>
        </view>
      </view>


      <view class="fans-search-box">
        <label class="fans-search-label" for="fans-search">
          <input id="fans-search" class="fans-search-input" type="text" v-model="searchWord" :placeholder="'搜索关键字，点击小键盘的确定进行搜索'" placeholder-class="search-input-placeholder" @input="updateSearchWord" @confirm="confirmKeyword"/>
          <image class="fans-search-icon" src="/static/images/icon_search.png"></image>
        </label>
      </view>

      <view class="fans-list">
        <view v-for="item in dataList" class="fans-item" :key="item.uid" @tap="goToNext(item.uid)">
          <view class="fans-vision">
            <view class="fans-img-box">
              <image class="fans-img" :src="item.user_avatarUrl" mode="widthFix" lazy-load></image>
            </view>
            <view v-if="item.link_superior_user == userInfo.uid" class="fans-tag">直属</view>
          </view>
          <view class="fans-infos">
            <view class="fans-info">
              <view class="fans-userinfo">
                <view class="fans-name">{{item.user_name}}</view>
                <view v-if="item.vip_level" class="fans-state">{{item.vip_name}}</view>
                <view v-if="item.team_vip_level" class="fans-state">{{item.team_vip_name}}</view>
              </view>
              <view class="fans-timeinfo">
                团队总数：{{item.all_team_count || 0}}
              </view>
              <!-- <view class="fans-ctrls">
                <view class="fans-ctrl" @tap="goToAchievement(item)">晋级进度</view>
              </view> -->
            </view>
            <view v-if="item.user_phone" class="fans-info">
              <view class="fans-phone">{{item.user_phone}}</view>
            </view>
            <view class="fans-info">
              <view class="fans-join-time">加入时间：{{item.create_time}}</view>
            </view>
            <view v-if="item.link_superior_user" class="fans-info">
              <view class="fans-join-time">
                <text>邀请人：</text>
                <text>{{item.link_user_name}}</text>
                <text v-if="item.link_user_phone">({{item.link_user_phone}})</text>
              </view>
            </view>
            <view class="fans-info fans-wrap-info last">
              <view class="fans-relate-item" style="margin-right: 60rpx">销售总额:￥{{item.team_sales_price || '0.00'}}</view>
              <view class="fans-relate-item">月销售总额:￥{{item.month_team_sales_price || '0.00'}}</view>
              <view class="fans-relate-item" style="margin-right: 60rpx">日自购总额:￥{{item.today_buy_sales_price || '0.00'}}</view>
              <view class="fans-relate-item">月自购总额:￥{{item.month_buy_sales_price || '0.00'}}</view>
            </view>
          </view>
        </view>

        <view v-if="dataLoading" class="scroll-tips">加载中...</view>
        <view v-if="dataList.length > 0 && !dataLoading" class="scroll-tips">已经到底啦</view>
        <view v-if="dataList.length == 0 && !dataLoading" class="scroll-tips">暂无相关人员哦</view>
        
      </view>
      



    </scroll-view>
  </view>

</template>
<script>
import moment from 'moment';
export default {
  data() {
    return {
      userInfo: uni.getStorageSync('userInfo'),
      
      tabIndex: 3,
      currentPage: 1,
      pageTotal: 1,
      dataLoading: false,

      searchWord: '',
      keyword: '',
      isSearch: false,
      
      dataBoard: {},
      TeamAllUserNumber: 0,
      dataList: [],

      dataReqTask: null,
      summaryReqTask: null,

      isCtrl: false,
      

      refreshing: false,
      selectSpecificType: ''

      
    }
  },
  onShareAppMessage() {
    let shareInfo = this.$getShareInfo();
    return shareInfo;
  },
  onLoad(options) {
    this.getDataBoard();
    setTimeout(() => {
      this.getList();
    })
    
  },
  beforeDestroy () {
    if(this.dataReqTask) {
      this.dataReqTask.abort();
      this.dataReqTask = null;
      this.dataLoading = false;
    }
    if(this.summaryReqTask) {
      this.summaryReqTask.abort();
      this.summaryReqTask = null;
    }
  },
  
  methods: {
    getDataBoard(clearCache = false) {
      let params = {
        uid: uni.getStorageSync('userInfo').uid,
        searType: 2,  //查右上角数字与下面面板
        level: this.tabIndex
      }
      if(clearCache) params.clearCache = true;
      let summaryReqTask = this.$sget('/team/allTeamSummaryNew', params, res => {
        let data = res.data;
        this.dataBoard = data.summaryInfo || {};
        if(!this.TeamAllUserNumber) this.TeamAllUserNumber = data.summaryInfo.total_team_number || 0;
      })
      // 因为是需要验证uid的请求，因多请求因故，走promise异步
      summaryReqTask.then(request => {
        this.summaryReqTask = request;
      })
    },
    getList(clearCache = false) {
      if(this.currentPage > this.pageTotal || this.dataLoading) return;
      let params = {
        uid: uni.getStorageSync('userInfo').uid,
        level: this.tabIndex,
        searType: 3,  //团队列表
        page: this.currentPage
      }
      if(clearCache) params.clearCache = true;
      this.dataLoading = true;

      if(this.isSearch) {
        params.keyword = this.keyword;
      }

      if(this.selectSpecificType && this.selectSpecificType !== '') {
        if(this.selectSpecificType == 'today') {
          params.searType = 4;  //按日期筛选列表
          params.start_time = moment().format('YYYY-MM-DD 00:00:00');
          params.end_time = moment().format('YYYY-MM-DD 23:59:59');
        } else if(this.selectSpecificType == 'month') {
          params.searType = 4;  //按日期筛选列表
          params.start_time = moment(moment().format('YYYY-MM') + '-01').format('YYYY-MM-DD 00:00:00');
          params.end_time = moment(params.start_time).add('month', 1).add('days', -1).format('YYYY-MM-DD 23:59:59');
        } else if(this.selectSpecificType == 'direct') {
          params.link_uid = uni.getStorageSync('userInfo').uid;
        }
      }

      let dataReqTask = this.$sget('/team/allTeamNew', params, res => {
        this.dataLoading = false;
        this.currentPage += 1;
        let dataList = [];
        dataList = res.data.list || [];
        
        for(let i = 0; i < dataList.length; i++) {
          dataList[i].create_time = moment(dataList[i].create_time).format('YYYY.MM.DD');
          if(dataList[i].pUser) {
            dataList[i].link_user_name = dataList[i].pUser.name;
            dataList[i].link_user_phone = dataList[i].pUser.phone;
          }
        }
        
        this.dataList.push(...dataList);
        this.pageTotal = res.data.pageTotal;
      }, err => {
        this.dataLoading = false;
      })
      // 因为是需要验证uid的请求，因多请求因故，走promise异步
      dataReqTask.then(request => {
        this.dataReqTask = request;
      })
    },
    
    tryRefresh() {
      this.refreshing = true;
      
      this.currentPage = 1;
      this.pageTotal = 1;
      this.dataList = [];

      if(this.dataReqTask) {
        this.dataReqTask.abort();
        this.dataReqTask = null;
        this.dataLoading = false;
      }
      if(this.summaryReqTask) {
        this.summaryReqTask.abort();
        this.summaryReqTask = null;
      }

      setTimeout(() => {
        this.refreshing = false;
      }, 100)
    },
    refreshPage(e) {
      setTimeout(() => {
        this.getDataBoard(true);
        this.getList(true);
      }, 50);
    },

    reGetList() {
      this.currentPage = 1;
      this.pageTotal = 1;
      this.dataList = [];

      if(this.dataReqTask) {
        this.dataReqTask.abort();
        this.dataReqTask = null;
        this.dataLoading = false;
      }
      if(this.summaryReqTask) {
        this.summaryReqTask.abort();
        this.summaryReqTask = null;
      }

      this.getDataBoard();
      this.getList();
    },

    updateTabIndex(val) {
      this.tabIndex = val;
      this.selectSpecificType = '';
      this.keyword = '';
      this.searchWord = '';
      this.isSearch = false;
      this.reGetList();
    },
    updateSpecificType(val) {
      this.selectSpecificType = val;
      this.keyword = '';
      this.searchWord = '';
      this.isSearch = false;
      this.reGetList();
    },


    updateSearchWord(e) {
      this.searchWord = e.detail.value;
    },
    confirmKeyword(e) {
      this.keyword = this.searchWord;
      this.selectSpecificType = '';
      this.isSearch = true;
      this.reGetList();
    },

    goToNext(uid) {
      if(this.isCtrl) return this.isCtrl = false;
      uni.navigateTo({
        url: `/mine-pages/pages/team/teams-next/teams-next?uid=${uid}`
      });
    },
    goToAchievement(item) {
      this.isCtrl = true;
      uni.navigateTo({
        url: `/mine-pages/pages/achievement/user-achievement/user-achievement?uid=${item.uid}&level=${item.vip_level || item.level}`
      });
    }

    
  }
}
</script>

<style lang="scss" scoped>
  @import 'teams.scss';
</style>