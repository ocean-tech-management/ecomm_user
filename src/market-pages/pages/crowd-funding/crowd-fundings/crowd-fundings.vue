<template>
  <view class="flex-page">
    <view class="flex-page-content">
      <scroll-view 
        scroll-y 
        class="tab-page-scroll" 
        :refresher-enabled="true" 
        :refresher-triggered="refreshing"
        @refresherrefresh="tryRefresh"
        @scrolltolower="getList"
      >
        <view class="page-bg-box">
          <image v-if="systemInfos.banner" class="page-bg" :src="systemInfos.banner" mode="aspectFill" webp></image>
        </view>
        <view class="page-entrances">
          <view class="page-entrance" @tap="showPopup = true">
            <view class="page-entrance-bg-box">
              <image class="page-entrance-bg" src="/static/images/crowd_funding/entrace_1.png"></image>
            </view>
            <view class="page-entrance-title">规则说明</view>
          </view>
          <view class="page-entrance" @tap="goToOrders">
            <view class="page-entrance-bg-box">
              <image class="page-entrance-bg" src="/static/images/crowd_funding/entrace_2.png"></image>
            </view>
            <view class="page-entrance-title">参与记录</view>
          </view>
          <view class="page-entrance" @tap="undo">
            <view class="page-entrance-bg-box">
              <image class="page-entrance-bg" src="/static/images/crowd_funding/entrace_3.png"></image>
            </view>
            <view class="page-entrance-title">幸运抽奖</view>
          </view>
        </view>

        <view v-if="roundList && roundList.length > 0" class="page-area-tabs-box">
          <view class="page-area-tabs">
            <view 
              v-for="(item, index) in roundList" 
              class="page-area-tab" 
              :class="{'active': roundIndex == index}" 
              :key="index"
              @tap="updateRoundIndex(index)"
            >
              {{item.title}}
            </view>
          </view>
          
        </view>
        <view v-if="roundList && roundList.length > 0" class="page-status-tabs">
          <view class="page-status-tab" :class="{'active': statusIndex == 0}" @tap="updateStatusIndex(0)">
            消费认购
          </view>
          <view class="page-status-tab" :class="{'active': statusIndex == 2}" @tap="updateStatusIndex(2)">
            待发放
          </view>
          <view class="page-status-tab" :class="{'active': statusIndex == 1}" @tap="updateStatusIndex(1)">
            已完成
          </view>
          <view class="page-status-tab" :class="{'active': statusIndex == 3}" @tap="updateStatusIndex(3)">
            兑换失效
          </view>
          <view class="page-status-tab" :class="{'active': statusIndex == 5}" @tap="updateStatusIndex(5)">
            福利重启
          </view>
        </view>
        <view v-if="timeList && timeList.length > 0" class="page-time-tabs-box">
          <scroll-view class="page-time-tabs" :scroll-into-view="activeTimeTab" enable-flex scroll-x>
            <view 
              v-for="(item, index) in timeList" 
              :id="item.timeId"
              class="page-time-tab" 
              :class="{'active': item.status == 2}"
              :key="index"
            >
              <view class="page-time-tab-time">{{item.startTime}}</view>
              <view v-if="item.status == -1" class="page-time-tab-status">预约已结束</view>
              <view v-else-if="item.status == 1" class="page-time-tab-status ">
                距结束{{item.timeOut[0]}}:{{item.timeOut[1]}}:{{item.timeOut[2]}}
              </view>
              <view v-else-if="item.status == 2" class="page-time-tab-status">
                距开始{{item.timeOut[0]}}:{{item.timeOut[1]}}:{{item.timeOut[2]}}
              </view>
            </view>
          </scroll-view>
        </view>

        <view class="goods-list">
          <view v-for="(item, index) in dataList" class="goods-item" :key="index" @tap="goToGoods(index)">
            <view class="goods-img-box">
              <image class="goods-img" :src="item.background_image" mode="widthFix" lazy-load webp></image>
            </view>
            <view class="goods-infos">
              <view class="goods-title">{{item.activity_title}}{{item.round_number}}轮{{item.period_number}}期</view>
              <view class="goods-info">福利专享</view>
              <view class="goods-info">获得相应福利补贴</view>
              <view class="goods-extend-infos">
                <view class="goods-sales-infos">
                  <view class="goods-sales-info">
                    每人限购:{{item.join_min_amount}}-{{item.join_limit_amount}}
                  </view>
                  <view class="goods-process-box">
                    <view class="goods-process-bar">
                      <view class="goods-process-active" :style="'width: ' + item.schedule + '%'"></view>
                    </view>
                    <view class="goods-process-num">{{item.schedule}}%</view>
                  </view>
                </view>
                <view v-if="item.result_status == 4 && item.validResult == 'valid'" class="goods-ctrl">去认购</view>
                <view v-else-if="item.result_status == 4 && item.validResult == 'unstart'" class="goods-ctrl">查看</view>

                <!-- <view v-if="item.result_status == 4 && item.valid" class="goods-ctrl">去认购</view> -->
                <!-- <view v-if="item.result_status == 4 && item.valid && timeValid" class="goods-ctrl">去认购</view> -->
              </view>
            </view>

            <view class="goods-status" :class="resultClasses[item.result_status]">
              {{resultStatus[item.result_status]}}
            </view>

          </view>
        </view>
        <view style="height: 2rpx"></view>
      </scroll-view>

    </view>

    <view v-if="showPopup" class="rule-popup">
      <view class="rule-popup-mask"></view>
      <view class="rule-popup-box">
        <view class="rule-popup-title">福利区参与规则</view>
        <view class="rule-popup-content">
          <!-- <block v-if="systemInfos.rule"> -->
            <mp-html :content="systemInfos.rule" :lazy-load="true"/>
          <!-- </block> -->

        </view>
        <view class="game-rule-tips" @tap="toggleAccess">
          <view class="game-rule-select">
            <image v-if="hasAccess" class="game-rule-toggle-icon" src="/static/images/shopcar_select.png"></image>
            <image v-if="!hasAccess" class="game-rule-toggle-icon" src="/static/images/shopcar_unselect.png"></image>
          </view>
          <view class="game-rule-text">
            <text>我已阅读并同意</text>
            <text class="game-rule-entrance" @tap.stop="goToRule">《用户购买协议》</text>
          </view>
        </view>
        <view class="rule-popup-ctrl" @tap="accessRule">同意并继续</view>
      </view>
    </view>
  </view>
</template>
<script>
import moment from 'moment';
import mpHtml from '@/components/mp-html/mp-html';

export default {
  components: {
    mpHtml
  },
  data() {
    return {
      systemInfos: {
        banner: '',
        rule: ''
      },

      currentPage: 1,
      pageTotal: 1,


      roundList: [],
      roundIndex: 0,

      timeList: [],
      activeTimeTab: null,

      statusIndex: 0,

      dataList: [],
      dataLoading: false,
      refreshing: false,

      resultStatus: {
        [1]: '已完成',
        [2]: '发放中',  //待成功
        [3]: '已失效',
        [4]: '参与中',  //等待结果，抢购中
        [5]: '福利重启',
      },
      resultClasses: {
        [1]: 'info',
        [2]: 'waiting',  //待成功
        [3]: 'info',
        [4]: 'buying',  //等待结果，抢购中
        [5]: 'info',
      },

      showPopup: false,
      hasAccess: false, //是否同意协议

      stageTimeout: null,
      // timeValid: false,  //有没有存在合法的期有效时间
    }
  },
  onLoad() {
    this.getData();
    this.getRounds(() => {
      this.getList();
    });
  },
  onUnload() {
    if(this.stageTimeout) clearInterval(this.stageTimeout);
  },
  onHide() {
    if(this.stageTimeout) clearInterval(this.stageTimeout);
  },
  onShow() {
    if(this.timeList && this.timeList.length > 0) {
      this.timeOut();
    }
  },
  methods: {
    getData() {
      this.$get('/crowdFunding/config', null, res => {
        let systemInfos = res.data;
        if(systemInfos.rule && systemInfos.rule !== '') {
          systemInfos.rule = systemInfos.rule.replace(/(<img[\s\S]+?)/ig, '<img style="display: block; margin: 0; padding: 0; width:100%; font-size: 0;"');  //正则给图片加样式
        }
        this.systemInfos = systemInfos;
        // this.showPopup = true;
      })
    },

    getRounds(handing) {
      let params = {
      }
      this.$get('/crowdFunding/activityList', params, res => {

        if(!res.data || res.data.length == 0) {
          return setTimeout(() => {
            uni.showToast({
              title: '无有效寄售专区',
              icon: 'none',
              mask: true
            });
          }, 150)
        }
        let data = res.data;
        this.roundList = data;
        this.statusIndex = 0;

        if(handing && typeof handing == 'function') handing();
      })
    },
    getList() {
      if(this.currentPage > this.pageTotal) return;
      if(!this.roundList || this.roundList.length == 0) return uni.showToast({
        title: '当前无有效福利专区',
        icon: 'none',
        mask: true
      })
      let params = {
        activity_code: this.roundList[this.roundIndex].activity_code,
        page: this.currentPage,
      }
      if(this.statusIndex) params.result_status = this.statusIndex;
      this.dataLoading = true;
      this.$get('/crowdFunding/periodList', params, res => {
        this.dataLoading = false;
        this.currentPage += 1;

        if(!res.data.list || res.data.list.length == 0) return;
        let dataList = res.data.list;
        if(params.page == 1) {
          if(dataList[0].duration && dataList[0].duration.length > 0) {
            let timeList = [];
            let today = moment().format('YYYY-MM-DD'), getToday = false, todayIndex = 0;
            for(let i = 0; i < dataList[0].duration.length; i++) {
              let item = {};
              item.start_time = dataList[0].duration[i].start_time;
              item.end_time = dataList[0].duration[i].end_time;
              item.startTime = item.start_time ? moment(item.start_time).format('MM/DD日 HH:mm') : '';
              item.endTime = item.end_time ? moment(item.end_time).format('MM/DD日 HH:mm') : '';
              item.timeId = `time_${item.period_number}_${item.round_number}_${i}`;
              timeList.push(item);

              if(!getToday) {
                if(moment(item.start_time).format('YYYY-MM-DD') == today) {
                  todayIndex = i;
                  getToday = true;
                }
              }
            }
            this.timeList = timeList;
            this.$nextTick(() => {
              this.activeTimeTab = timeList[todayIndex].timeId;
            })
            this.timeOut();
          } else {
            this.timeList = 0;
            this.timeOut();
          }
          
        }

        for(let i = 0; i < dataList.length; i++) {
          if(dataList[i].join_min_amount) dataList[i].join_min_amount = parseInt(dataList[i].join_min_amount);
          if(dataList[i].join_limit_amount) dataList[i].join_limit_amount = parseInt(dataList[i].join_limit_amount);
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

      this.timeList = [];
      // this.timeValid = false; //重置期有效性到都无效

      this.dataList = [];
      this.getList();
    },
    tryRefresh() {
      this.refreshing = true;
      this.reGetList();
      setTimeout(() => {
        this.refreshing = false;
      }, 200);
    },

    timeOut() {
      this.timeOutHandler();
      this.stageTimeout = setInterval(() => {
        this.timeOutHandler();
      }, 1000)
    },

    timeOutHandler() {
      let date = moment().utc().utcOffset(480).format('YYYY-MM-DD HH:mm:ss');
      if(this.dataList && this.dataList.length > 0) {
        for(let i = 0; i < this.dataList.length; i++) {
          // 确定期是否在自身有效时间内
          // if(
          //   moment(this.dataList[i].end_time).diff(date, 'seconds') > 0 && 
          //   moment(this.dataList[i].start_time).diff(date, 'seconds') < 0
          // ) {
          //   this.dataList[i].valid = true;
          // } else {
          //   this.dataList[i].valid = false;
          // }
          if(
            moment(this.dataList[i].end_time).diff(date, 'seconds') > 0 && 
            moment(this.dataList[i].start_time).diff(date, 'seconds') < 0
          ) {
            this.dataList[i].validResult = 'valid';
          } else if(
            moment(this.dataList[i].start_time).diff(date, 'seconds') > 0
          ) {
            this.dataList[i].validResult = 'unstart';
          } else {
            this.dataList[i].validResult = 'novalid';
          }
        }
      }

      if(!this.timeList || this.timeList.length == 0) {
        // 如果没有开放时间限制，直接按期的有效期来
        // if(!this.timeValid) this.timeValid = true;
        return;
      }
      let timeList = this.timeList.slice(0);
      // 自行定义状态： -1失效 1进行中 2未开始
      for(let i = 0; i < timeList.length; i++) {
        if(moment(timeList[i].end_time).diff(date, 'seconds') < 0) {
          timeList[i].status = -1;
        } else if(moment(timeList[i].start_time).diff(date, 'seconds') > 0) {
          
          let hour = moment(timeList[i].start_time).diff(date, 'hours');
          let minute = (moment(timeList[i].start_time).diff(date, 'minutes')) % 60;
          let second = (moment(timeList[i].start_time).diff(date, 'seconds')) % 60;
          timeList[i].timeOut = [
            hour < 10 ? `0${hour}` : hour, 
            minute < 10 ? `0${minute}` : minute, 
            second < 10 ? `0${second}` : second
          ];
          timeList[i].status = 2;
        } else if(
            moment(timeList[i].end_time).diff(date, 'seconds') != 0 && 
            moment(timeList[i].start_time).diff(date, 'seconds') != 0
          ) {
            let hour = moment(timeList[i].end_time).diff(date, 'hours');
            let minute = (moment(timeList[i].end_time).diff(date, 'minutes')) % 60;
            let second = (moment(timeList[i].end_time).diff(date, 'seconds')) % 60;
            timeList[i].timeOut = [
              hour < 10 ? `0${hour}` : hour, 
              minute < 10 ? `0${minute}` : minute, 
              second < 10 ? `0${second}` : second
            ];
            timeList[i].status = 1;
            // this.timeValid = true;
        } else {
          if(this.stageTimeout) clearInterval(this.stageTimeout);
          setTimeout(() => {
            this.getRounds(() => {
              this.reGetList();
            });
          }, 1000)
        }
      }

      this.timeList = timeList;
    },


    updateRoundIndex(index) {
      if(this.roundIndex != index) {
        this.roundIndex = index;
        this.reGetList();
      }
    },
    updateStatusIndex(index) {
      if(this.statusIndex != index) {
        this.statusIndex = index;
        this.reGetList();
      }
    },

    toggleAccess() {
      this.hasAccess = !this.hasAccess;
    },
    accessRule() {
      if(!this.hasAccess) {
        return uni.showToast({
          title: '阅读并同意用户购买协议才可以参与活动',
          icon: 'none',
          mask: true
        })
      }
      this.showPopup = false;
    },
    
    goToGoods(index) {
      let item = this.dataList[index];
      if(item.result_status != 4) return;
      if(item.limit_type == 1 && item.start_time && item.end_time) {
        let date = moment().utc().utcOffset(480).format('YYYY-MM-DD HH:mm:ss');
        // if(moment(date).diff(item.start_time, 'seconds') < 0) {
        //   return uni.showToast({
        //     title: '未在认购有效期内',
        //     icon: 'none',
        //     mask: true
        //   })
        // }
        if(moment(date).diff(item.end_time, 'seconds') > 0) {
          return uni.showToast({
            title: '认购时间已过',
            icon: 'none',
            mask: true
          })
        }
      }
      // if(!this.timeValid) return uni.showToast({
      //   title: '未在有效期内',
      //   icon: 'none',
      //   mask: true
      // })
      uni.navigateTo({
        url: `/market-pages/pages/crowd-funding/goods/goods?code=${item.activity_code}&rNum=${item.round_number}&pNum=${item.period_number}`
      })
    },
    goToOrders() {
      uni.navigateTo({
        url: `/market-pages/pages/crowd-funding/orders/orders`
      })
    },
    goToRule() {
      uni.navigateTo({
        url: `/market-pages/pages/crowd-funding/rule/rule`
      })
    },
    undo() {
      uni.showToast({
        title: '即将开放敬请期待',
        icon: 'none',
        mask: true
      })
    },
  }
}
</script>
<style lang="scss" scoped>
@import 'crowd-fundings.scss';
</style>