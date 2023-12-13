<template>
  <view class="flex-page">
    <scroll-view class="tab-page-scroll" scroll-y @scrolltolower="getList">

      <view class="team-page-top">
        <block v-if="nexterInfo.uid">
          <!-- 个人简介 -->
          <view class="team-page-top-content">
            <view class="userinfo">
              <image class="user-avatar" :src="nexterInfo.avatarUrl || '/static/images/logo.png'"></image>
              <view class="userinfo-infos">
                <view class="userinfo-base-info">
                  <view class="userinfo-info">
                    <view class="userinfo-info-item">
                      <view class="userinfo-name">{{nexterInfo.name || '游客'}}</view>
                      <view v-if="nexterInfo.vip_level" class="userinfo-state">{{nexterInfo.vip_name}}</view>
                      <view v-if="nexterInfo.team_vip_level" class="userinfo-state">{{nexterInfo.team_vip_name}}</view>
                    </view>
                    <view class="userinfo-info-item">
                      <view v-if="nexterInfo.phone" class="userinfo-phone">{{nexterInfo.phone}}</view>
                    </view>
                  </view>
                  <block v-if="nexterInfo">
                    <view class="teams-info">
                      <view class="teammate-num">{{TeamAllUserNumber || 0}}</view>
                      <view class="teams-info-tips">团队总人数</view>
                    </view>
                  </block>
                </view>
                <!-- <block v-if="nexterInfo">
                  <view class="teams-info-extends">
                    <view class="teams-info-extend">加入时间：{{nexterInfo.create_time}}</view>
                    <view v-if="nexterInfo.pUser" class="teams-info-extend">
                      <text>邀请人：{{nexterInfo.pUser.name}}</text>
                      <text v-if="nexterInfo.pUser.phone">（{{nexterInfo.pUser.phone}}）</text>
                    </view>
                  </view>
                </block> -->

              </view>
            </view>
              
            <view class="team-tabs">
              <view class="team-tab" :class="{'active': tabIndex == 3}" @tap="updateTabIndex(3)">TA的普通盟主</view>
              <view class="team-tab" :class="{'active': tabIndex == 2}" @tap="updateTabIndex(2)">TA的一星盟主</view>
              <view class="team-tab" :class="{'active': tabIndex == 1}" @tap="updateTabIndex(1)">TA的二星盟主</view>
            </view>
          </view>
        </block>
      </view>
      

      <view class="team-info-totals">
        <view class="team-info-total">
          <view class="team-info-total-val">{{dataBoard.userMonthOrderPrice || '0.00'}}</view>
          <view class="team-info-total-title">月销售总额</view>
        </view>
        <view class="team-info-total">
          <view class="team-info-total-val">{{dataBoard.userOrderPrice || '0.00'}}</view>
          <view class="team-info-total-title">销售总额</view>
        </view>
        <view class="team-info-total">
          <view class="team-info-total-val">{{dataBoard.TeamAllUserListNumber || '0'}}</view>
          <view class="team-info-total-title">总人数</view>
        </view>
      </view>

      <view class="fans-search-box">
        <label class="fans-search-label" for="fans-search">
          <input id="fans-search" class="fans-search-input" type="text" v-model="searchWord" :placeholder="'搜索关键字，点击小键盘的确定进行搜索'" placeholder-class="search-input-placeholder" @input="updateSearchWord" @confirm="confirmKeyword"/>
          <image class="fans-search-icon" src="/static/images/icon_search.png"></image>
        </label>
      </view>

      <view class="fans-list">
        <view v-for="item in dataList" class="fans-item" :key="item.uid">
          <view class="fans-vision">
            <view class="fans-img-box">
              <image class="fans-img" :src="item.user_avatarUrl" mode="widthFix" webp lazy-load></image>
            </view>
            <view v-if="item.link_superior_user == nexterInfo.uid" class="fans-tag">直属</view>
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
                <view class="fans-ctrl" @tap="goToAchievement(item)">查看业绩</view>
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
      uid: '',
      userInfo: uni.getStorageSync('userInfo'),
      
      tabIndex: 3,
      currentPage: 1,
      pageTotal: 1,
      dataLoading: false,

      searchWord: '',
      keyword: '',
      isSearch: false,
      allTeam: false,
      
      nexterInfo: {},
      dataBoard: {},
      TeamAllUserNumber: 0,
      dataList: [],
      memberTexts: {},

      dataReqTask: null,
      summaryReqTask: null,
    }
  },
  onShareAppMessage() {
    let shareInfo = this.$getShareInfo();
    return shareInfo;
  },
  onLoad(options) {
    if(!options.uid) {
      uni.showToast({
        title: '无效会员，正在返回首页',
        icon: 'none',
        mask: true
      })
      setTimeout(() => {
        uni.reLaunch({
          url: '/pages/index/index'
        })
      }, 1500);
      return;
    }
    this.uid = options.uid;
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
    getDataBoard() {
      let params = {
        uid: this.uid,
        searType: 2,  //查右上角数字与下面面板
        level: this.tabIndex
      }
      let summaryReqTask = this.$sget('/team/allTeamSummaryNew', params, res => {
        let data = res.data;
        this.nexterInfo = data.myInfo;
        this.dataBoard = data.summaryInfo || {};
        if(!this.TeamAllUserNumber) this.TeamAllUserNumber = data.summaryInfo.total_team_number || 0;
      })
      // 因为是需要验证uid的请求，因多请求因故，走promise异步
      summaryReqTask.then(request => {
        this.summaryReqTask = request;
      })
    },
    getList() {
      if(this.currentPage > this.pageTotal || this.dataLoading) return;
      let params = {
        uid: this.uid,
        level: this.tabIndex,
        searType: 3,  //团队列表
        page: this.currentPage
      }
      this.dataLoading = true;


      if(this.isSearch) {
        params.keyword = this.keyword;
      }

      let dataReqTask = this.$sget('/team/allTeamNew', params, res => {
        this.dataLoading = false;
        this.currentPage += 1;
        let dataList = [];
        dataList = res.data.list || [];

        this.dataBoard.TeamAllUserListNumber = res.data.totalUser || 0;
        this.dataBoard.userMonthOrderPrice = res.data.monthTeamPerformance;
        this.dataBoard.userOrderPrice = res.data.totalTeamPerformance;

        for(let i = 0; i < dataList.length; i++) {
          dataList[i].create_time = moment(dataList[i].create_time).format('YYYY.MM.DD');
          if(dataList[i].pUser) {
            dataList[i].link_user_name = dataList[i].pUser.name;
            dataList[i].link_user_phone = dataList[i].pUser.phone;
          }
        }
        
        this.dataList.push(...dataList);
        this.pageTotal = res.data.TeamAllUserPageNumber;
      }, err => {
        this.dataLoading = false;
      })
      // 因为是需要验证uid的请求，因多请求因故，走promise异步
      dataReqTask.then(request => {
        this.dataReqTask = request;
      })
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
      this.keyword = '';
      this.searchWord = '';
      this.isSearch = false;
      this.allTeam = false;
      this.reGetList();
    },
    updateAllTeam(val) {
      this.allTeam = val;
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
      this.isSearch = true;
      this.reGetList();
    },
    
    goToAchievement(item) {
      uni.navigateTo({
        url: `/mine-pages/pages/achievement/user-achievement/user-achievement?uid=${item.uid}&level=${item.vip_level || item.level}`
      });
    }

    
  }
}
</script>

<style lang="scss" scoped>
  @import 'teams-next.scss';
</style>