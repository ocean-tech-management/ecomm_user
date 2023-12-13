<template>
  <view class="flex-page">
    <scroll-view class="tab-page-scroll" scroll-y @scrolltolower="getList">
      <view class="team-info-totals">
        <view v-for="(item, index) in dataBoard.today" class="team-info-total tab-1" :class="{'team-info-total-active': searTimeType == 1}" :key="index" @tap="updateSpecificType(1)">
          <view class="team-info-total-val">{{item.number || 0}}</view>
          <view class="team-info-total-title">今日新增</view>
        </view>
        <view v-for="(item, index) in dataBoard.month" class="team-info-total tab-2" :class="{'team-info-total-active': searTimeType == 2}" :key="index" @tap="updateSpecificType(2)">
          <view class="team-info-total-val">{{item.number || 0}}</view>
          <view class="team-info-total-title">本月新增</view>
        </view>
        <view v-for="(item, index) in dataBoard.all" class="team-info-total tab-3" :class="{'team-info-total-active': !searTimeType || searTimeType == ''}" :key="index" @tap="updateSpecificType('')">
          <view class="team-info-total-val">{{item.number || 0}}</view>
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
              <image class="fans-img" :src="item.avatarUrl" mode="widthFix" webp lazy-load></image>
            </view>
          </view>
          <view class="fans-infos">
            <view class="fans-info">
              <view class="fans-name">{{item.name}}</view>
              <!-- <view class="fans-state">{{item.vip_name}}</view>
              <view class="fans-ctrls">
                <view class="fans-ctrl" @tap="goToAchievement(item)">查看业绩</view>
              </view> -->
            </view>
            <view v-if="item.phone" class="fans-info">
              <view class="fans-phone">{{item.phone}}</view>
            </view>
            <view class="fans-info">
              <view class="fans-join-time">加入时间：{{item.create_time}}</view>
            </view>
            <view class="fans-info fans-wrap-info last">
              <view class="fans-relate-item" style="width: 100%;">购买总计：￥{{item.order_summary_sum || '0.00'}}</view>
            </view>
          </view>
        </view>

        <view v-if="dataList.length > 0 && !listLoading" class="scroll-tips">已经到底啦</view>
        <view v-if="dataList.length == 0 && !listLoading" class="scroll-tips">暂无相关人员哦</view>
        
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

      currentPage: 1,
      pageTotal: 1,
      listLoading: false,

      searchWord: '',
      keyword: '',

      dataList: [],
      memberTexts: {},
      dataBoard: {},

      searTimeType: ''
    }
  },
  onShareAppMessage() {
    let shareInfo = this.$getShareInfo();
    return shareInfo;
  },
  onLoad(options) {
    this.uid = this.userInfo.uid || null;
    if(!this.uid) return uni.reLaunch({
      url: '/pages/index/index'
    });
    this.getDataBoard();
    this.getLeaderTexts();
    this.getList();
    
  },
  methods: {
    getLeaderTexts() {
      this.$sget('/member/title', null, res => {
        let data = res.data;
        let memberTexts = {};
        for(let i = 0; i < data.length; i++) {
          memberTexts[data[i].level] = data[i].name;
        }
        this.memberTexts = memberTexts;
      })
    },
    getList() {
      if(this.currentPage > this.pageTotal || this.listLoading) return;
      let params = {
        uid: this.uid,
        page: this.currentPage,
        keyword: this.keyword
      }
      if(this.searTimeType && this.searTimeType !== '') params.searTimeType = this.searTimeType;

      this.listLoading = true;

      this.$get('/user/teamDirectNormalUser', params, res => {
        this.listLoading = false;
        this.currentPage += 1;
        let dataList = res.data.list || [];

        for(let i = 0; i < dataList.length; i++) {
          dataList[i].create_time = moment(dataList[i].create_time).format('YYYY.MM.DD')
        }
        
        this.dataList.push(...dataList);

        this.pageTotal = res.data.pageTotal;
        
      }, err => {
        this.listLoading = false;
      })
    },
    getDataBoard() {
      let params = {
        uid: uni.getStorageSync('userInfo').uid
      }
      this.$sget('/user/teamDirectNormalUserCount', params, res => {
        let data = res.data;
        this.dataBoard = data;
      })
    },
    reGetList() {

      this.currentPage = 1;
      this.pageTotal = 1;
      this.dataList = [];
      this.getList();
    },

    updateSpecificType(val) {
      this.searTimeType = val;
      this.keyword = '';
      this.searchWord = '';
      this.reGetList();
    },


    updateSearchWord(e) {
      this.searchWord = e.detail.value;
    },
    confirmKeyword(e) {
      this.keyword = this.searchWord;
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
  @import 'normal-users.scss';
</style>