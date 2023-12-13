<template>
  <view class="flex-page">

    <block v-if="hasLoad && active.goods_show_form != 2">
      <view class="flex-page-content">
        <scroll-view class="activity-products" scroll-y @scrolltolower="getList">
          <!-- 空节点，做撑开空间用 -->
          <image class="activity-product-poster" :src="active.poster" mode="widthFix" webp lazy-load></image>

          <view v-if="times && times.length > 0" class="rush-timelines">
            <view v-for="(item, index) in times" class="rush-timeline" :class="{ 'active': timeIndex == index }"
              :key="index" @tap="updateTimeIndex(index)">
              <block v-if="timeIndex == index && item.start">
                <view class="rush-timeline-time">{{ item.coldDown }}</view>
                <view class="rush-timeline-status">{{ item.timeNode }}抢购中</view>
              </block>
              <block v-else>
                <view class="rush-timeline-time">{{ item.timeText }}</view>
                <view class="rush-timeline-status">{{ item.start ? '距本场结束' : (item.timeNode + '未开始') }}</view>
              </block>
            </view>
          </view>

          <view v-for="item in dataList" class="activity-product" :key="item.goods_sn" @tap="goToDetail(item.goods_sn)">
            <view class="activity-product-img-box">
              <view v-if="item.goods_stock_sum == 0" class="activity-product-sell-out">已售罄</view>
              <image class="activity-product-img" :src="item.image" mode="widthFix" webp lazy-load></image>
            </view>
            <view class="activity-product-content">
              <view class="activity-product-title-box">
                <view class="activity-product-title">{{ item.title }}</view>
              </view>
              <view v-if="getIsZoneActive(item.activity_id)" class="activity-product-infos" style="margin-top: 90rpx;">
                <view class="rush-product-info">
                  <view :class="['rush-product-val', isCrowdActivitySign ? 'price-integral' : '']">
                    <text v-if="isCrowdActivitySign" class="crowd-activity-sign">积分</text><text v-else>￥</text>
                    {{ item.activity_price || '0.00' }}
                  </view>
                </view>
                <view class="activity-product-val-ctrl">
                  <block v-if="item.goods_stock_sum > 0">
                    <template v-if="isCrowdActivitySign">
                      <view v-if="limit_type == 1 && times.length > 0" class="activity-product-ctrl">
                        {{ item.is_start ? '换购' : '即将开始' }}
                      </view>
                      <view v-else class="activity-product-ctrl">
                        换购
                      </view>
                    </template>
                    <template v-else>
                      <view v-if="limit_type == 1 && times.length > 0" class="activity-product-ctrl">
                        {{ item.is_start ? '兑换' : '即将开始' }}
                      </view>
                      <view v-else class="activity-product-ctrl">
                        兑换
                      </view>
                    </template>
                  </block>
                  <block v-else>
                    <view class="activity-product-ctrl disabled">
                      {{ isCrowdActivitySign ? '已换购光' : '已兑换光' }}
                    </view>
                  </block>
                </view>
              </view>
              <view v-else class="activity-product-infos">
                <view class="activity-product-info">
                  <view :class="['activity-product-val', isCrowdActivitySign ? 'price-integral' : '']">
                    <text v-if="isCrowdActivitySign" class="crowd-activity-sign">积分</text><text v-else>￥</text>
                    {{ item.sale_price || '0.00' }}
                  </view>
                  <view :class="['activity-product-val-unactive', isCrowdActivitySign ? 'price-integral' : '']">
                    <text v-if="isCrowdActivitySign" class="crowd-activity-sign">积分</text><text v-else>￥</text>
                    {{ item.market_price || '0.00' }}
                  </view>
                </view>
                <view class="activity-product-val-ctrl">
                  <block v-if="item.goods_stock_sum > 0">
                    <view v-if="limit_type == 1 && times.length > 0" class="activity-product-ctrl">
                      {{ item.is_start ? '立即抢购' : '即将开始' }}
                    </view>
                    <view v-else class="activity-product-ctrl">
                      立即抢购
                    </view>
                  </block>
                  <block v-else>
                    <view class="activity-product-ctrl disabled">
                      已抢光
                    </view>
                  </block>
                </view>
              </view>
            </view>
          </view>

          <view v-if="dataList.length > 0 && currentPage > pageTotal && !dataLoading" class="scroll-tips">已经到底啦</view>
          <!-- <view v-if="dataList.length == 0 && currentPage > pageTotal && !dataLoading" class="scroll-tips">暂无记录哦</view> -->


        </scroll-view>
      </view>
    </block>

    <block v-if="hasLoad && active.goods_show_form == 2">
      <!-- 特殊样式 -->
      <view class="flex-page-content" :style="'background-color:' + (active.background_color || '#ffffff')">
        <scroll-view scroll-y class="tab-page-scroll" @scrolltolower="getList">

          <view v-if="active.poster && active.poster !== ''" class="activity-products-bg-box">
            <image class="activity-products-bg" :src="active.poster" mode="widthFix" webp lazy-load></image>
          </view>

          <view v-if="times && times.length > 0" class="rush-timelines">
            <view v-for="(item, index) in times" class="rush-timeline" :class="{ 'active': timeIndex == index }"
              :key="index" @tap="updateTimeIndex(index)">
              <block v-if="timeIndex == index && item.start">
                <view class="rush-timeline-time">{{ item.coldDown }}</view>
                <view class="rush-timeline-status">{{ item.timeNode }}抢购中</view>
              </block>
              <block v-else>
                <view class="rush-timeline-time">{{ item.timeText }}</view>
                <view class="rush-timeline-status">{{ item.start ? '距本场结束' : (item.timeNode + '未开始') }}</view>
              </block>
            </view>
          </view>

          <view class="rush-product-list">
            <view v-for="item in dataList" class="rush-product" :key="item.goods_sn"
              @tap="goToDetail(item.goods_sn, 1, item.activity_id)">
              <view class="rush-product-img-box">
                <view v-if="item.goods_stock_sum == 0" class="activity-product-sell-out">已售罄</view>
                <image class="rush-product-img" :src="item.image" webp lazy-load></image>
              </view>
              <view class="rush-product-content">
                <view class="rush-product-baseinfo">
                  <view class="rush-product-title">{{ item.title }}</view>
                </view>
                <view v-if="getIsZoneActive(item.activity_id)" class="rush-product-infos" style="margin-top: 90rpx;">
                  <view class="rush-product-info">
                    <view :class="['rush-product-val', isCrowdActivitySign ? 'price-integral' : '']">
                      <text v-if="isCrowdActivitySign" class="crowd-activity-sign">积分</text><text v-else>￥</text>
                      {{ item.activity_price || '0.00' }}
                    </view>
                  </view>
                  <block v-if="item.goods_stock_sum > 0">
                    <template v-if="isCrowdActivitySign">
                      <view v-if="limit_type == 1 && times.length > 0" class="rush-product-ctrl">
                        {{ item.is_start ? '换购' : '即将开始' }}
                      </view>
                      <view v-else class="rush-product-ctrl">
                        换购
                      </view>
                    </template>
                    <template v-else>
                      <view v-if="limit_type == 1 && times.length > 0" class="rush-product-ctrl">
                        {{ item.is_start ? '兑换' : '即将开始' }}
                      </view>
                      <view v-else class="rush-product-ctrl">
                        兑换
                      </view>
                    </template>
                  </block>
                  <block v-else>
                    <view class="rush-product-ctrl disabled">
                      {{ isCrowdActivitySign ? '已换购光' : '已兑换光' }}
                    </view>
                  </block>
                </view>
                <view v-else class="rush-product-infos">
                  <view class="rush-product-info">
                    <view :class="['rush-product-val', isCrowdActivitySign ? 'price-integral' : '']">
                      <text v-if="isCrowdActivitySign" class="crowd-activity-sign">积分</text><text v-else>￥</text>
                      {{ item.activity_price || '0.00' }}
                    </view>
                    <view :class="['rush-product-val-unactive', isCrowdActivitySign ? 'price-integral' : '']">
                      <text v-if="isCrowdActivitySign" class="crowd-activity-sign">积分</text><text v-else>￥</text>
                      {{ item.market_price || '0.00' }}
                    </view>
                  </view>
                  <block v-if="item.goods_stock_sum > 0">
                    <view v-if="limit_type == 1 && times.length > 0" class="rush-product-ctrl">
                      {{ item.is_start ? '立即购买' : '即将开卖' }}
                    </view>
                    <view v-else class="rush-product-ctrl">
                      立即抢购
                    </view>
                  </block>
                  <block v-else>
                    <view class="rush-product-ctrl disabled">
                      已抢光
                    </view>
                  </block>
                </view>
              </view>

            </view>
          </view>

          <view v-if="dataList.length > 0 && currentPage > pageTotal && !dataLoading" class="scroll-tips">已经到底啦</view>
          <!-- <view v-if="dataList.length == 0 && currentPage > pageTotal && !dataLoading" class="scroll-tips">暂无记录哦</view> -->

        </scroll-view>

      </view>
    </block>
  </view>
</template>
<script>
import moment from 'moment';
export default {
  data() {
    return {
      aId: null,
      isCrowdActivitySign: false,
      hasLoad: false,
      start_time: moment(new Date()).format('YYYY-MM-DD HH:mm'),

      currentPage: 1,
      pageTotal: 1,
      keyword: '',
      dataList: [],
      active: {},
      limit_type: 2,

      dataLoading: false,

      times: [],
      timeIndex: 0,

      coldDownInterval: null,
      // 赠送数量字典
      giftTypeDict: {
        [1]: '集品豆',
        [2]: '健康豆',
        [3]: '集品券'
      },
    }
  },
  onShareAppMessage() {
    let shareInfo = this.$getShareInfo();
    return shareInfo;
  },
  onLoad(options) {
    if(!options.id) {
      uni.showToast({
        title: '不要尝试啦，正在返回首页',
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

    this.aId = options.id;
    this.limit_type = options.limit_type || 2;
    if (options.title && options.title.length < 12) uni.setNavigationBarTitle({
      title: options.title
    })
    this.getList();
  },
  onShow() {
    if(this.hasLoad && this.times.length > 0) {
      this.initColdDownInterval();
    }
  },
  onHide() {
    if(this.coldDownInterval) clearInterval(this.coldDownInterval);
  },
  onUnload() {
    if(this.coldDownInterval) clearInterval(this.coldDownInterval);
  },
  methods: {
    // 判断是否集品券、集品豆、礼品券专区
    getIsZoneActive(activityId) {
      const ids = [120, 121, 122]
      if (!ids.includes(activityId)) return false
      return true
    },
    getList() {
      if(this.currentPage > this.pageTotal) return;
      let params = {
        aId: this.aId,
        keyword: this.keyword,
        page: this.currentPage
      }
      if(this.limit_type == 1 && this.times.length > 0) params.start_time = this.start_time;
      this.dataLoading = true;
      this.$get('/home/activityInfo', params, res => {
        this.dataLoading = false;
        this.currentPage += 1;

        if(!this.hasLoad) {
          this.active = res.data.info;
          this.isCrowdActivitySign = [7].includes(Number(this.active.allow_pay_type));
          this.limit_type = this.active.limit_type;
          uni.setNavigationBarTitle({
            title: this.active.title || '活动页面'
          })

          if(this.limit_type == 1 && this.times.length == 0) {
            this.times = res.data.timeList;
            for(let i = 0; i < this.times.length; i++) {
              if(this.times[i].is_selected == 1) {
                this.timeIndex = i;
              }

              // 显示昨天明天明天
              this.times[i].timeText = moment(this.times[i].time).format('MM/DD');
              if(this.times[i].start_time_node) {
                this.times[i].timeNode = moment(this.times[i].start_time_node).format('HH:mm');
              } else {
                this.times[i].timeNode = '00:00';
              }
              if(!this.times) this.times = [];

            }
            if(this.times.length > 0) {
              this.tryColdDown();
              this.initColdDownInterval();
            }
          }

          this.hasLoad = true;
        }
        if(this.limit_type == 1 && this.times.length > 0) {
          this.times[this.timeIndex].cd = res.data.cd;
          this.tryColdDown();
        }

        if(!res.data.goods.list || res.data.goods.list.length == 0) return;
        let dataList = res.data.goods.list;

        for(let i = 0; i < dataList.length; i++) {
          dataList[i].is_start = !dataList[i].start_time || moment(dataList[i].start_time).diff(moment()) < 0 ? true : false;
        }
        this.dataList.push(...dataList);
        this.pageTotal = res.data.goods.pageTotal;
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
    updateTimeIndex(index) {
      if(this.timeIndex == index) return;
      this.timeIndex = index;
      this.start_time = this.times[this.timeIndex].time;
      this.reGetList();
    },

    initColdDownInterval() {
      if(this.coldDownInterval) clearInterval(this.coldDownInterval);
      this.coldDownInterval = setInterval(() => {
        this.tryColdDown();
      }, 1000)
    },
    tryColdDown() {
      // 限购的时间检验
      if(this.times) {
        let date = moment().utc().utcOffset(480).format('YYYY-MM-DD HH:mm:ss');
        for(let i = 0; i < this.times.length; i++) {
          // 检查是否开始
          // let time = moment(this.times[i].time).diff(moment(date));
          let time = moment(this.times[i].start_time_node).diff(moment(date));

          if(time < 0 && !this.times[i].start) {
            this.times[i].start = true;
          }
        }
        // 更新选中那个时间的显示
        if(
          this.times[this.timeIndex].cd &&
          this.times[this.timeIndex].start
        ) {
          let timeSpan = moment(this.times[this.timeIndex].cd).diff(date, 'seconds');
          let duration = moment.duration(timeSpan, 'seconds');
          if(duration <= 0) {
            this.times[this.timeIndex].coldDown = moment(this.times[this.timeIndex].time).format('MM/DD');
          } else {
            let coldDown = [];
            let hours = duration.hours();
            if(duration.days() && duration.days() > 0) hours += duration.days() * 24; //因为不显示日期，将日期加到小时中
            coldDown.push(hours >= 10 ? hours : `0${hours}`);
            coldDown.push(duration.minutes() >= 10 ? duration.minutes() : `0${duration.minutes()}`);
            coldDown.push(duration.seconds() >= 10 ? duration.seconds() : `0${duration.seconds()}`);
            this.times[this.timeIndex].coldDown = coldDown.join(':');
            this.times = this.times.slice(0); //强制触发刷新操作
          }

        }
      }

    },


    goToDetail(sn) {
      // if(this.limit_type == 1 && this.times.length > 0) {
      //   let date = new Date();
      //   let time = moment(this.times[this.timeIndex].time).diff(moment(date));
      //   if(time > 0) return uni.showToast({
      //     title: '抢购未开始',
      //     mask: true,
      //     icon: 'none'
      //   })
      // }

      let url = `/pages/product-detail/product-detail?sn=${sn}`;
      url += `&aType=1&aId=${this.active.id}`;
      uni.navigateTo({
        url: url
      })
    },
  }
}
</script>
<style lang="scss" >
@import 'actives.scss';
</style>