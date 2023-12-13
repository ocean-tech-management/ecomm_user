<template>
  <view class="flex-page">
    <!-- 页面内容 -->
    <view class="flex-page-content">
      <scroll-view scroll-y class="tab-page-scroll" @scrolltolower="getList">
        <view class="index-page-bg">

          <!-- <view style="padding-top: 30rpx;">新品</view> -->
          <view v-if="active && active.id" class="box-store-box">
            <view class="box-store-bg"></view>
            <view class="box-store-infos">
              <view class="box-store-content">
                <view class="box-store-thumb-box">
                  <image class="box-store-thumb" :src="active.background_image" webp></image>
                </view>
                <view class="box-store-info">
                  <view class="box-store-title">{{ active.title }}</view>
                  <view class="box-store-colddown-box">
                    <block v-if="active.activite_type == 3">
                      <view class="box-store-invalid">已失效</view>
                    </block>
                    <block v-else>
                      <view>{{ coldDownTypeTexts[active.activite_type] }}</view>
                      <view class="box-store-colddown-unit">{{ active.timeout[0] || 0 }}</view>
                      <view>天</view>
                      <view class="box-store-colddown-unit">{{ active.timeout[1] || 0 }}</view>
                      <view>:</view>
                      <view class="box-store-colddown-unit">{{ active.timeout[2] || 0 }}</view>
                      <view>:</view>
                      <view class="box-store-colddown-unit">{{ active.timeout[3] || 0 }}</view>
                    </block>
                  </view>
                </view>
              </view>
              <view class="box-store-desc">{{ active.desc }}</view>
            </view>
          </view>


          <!-- tab部分 -->
          <!-- <view class="tabs">
          <view :class="'tab ' + (tabIndex == 0 ? 'active' : '')" @tap="updateTabIndex(0)">
            全部
          </view>

          <view :class="'tab ' + (tabIndex == 1 ? 'active' : '')" @tap="updateTabIndex(1)">
            入账
          </view>
          <view :class="'tab ' + (tabIndex == 2 ? 'active' : '')" @tap="updateTabIndex(2)">
            支出
          </view>
        </view> -->

          <view class="product-list">

            <view v-for="item in dataList" class="product" :data-sn="item.goods_sn" :key="item.goods_sn"
              @tap="goToDetail">
              <view class="product-img-box">
                <image class="product-img" :src="item.image" mode="aspectFill" webp lazy-load></image>
              </view>
              <view class="product-info">
                <view class="product-title">
                  <image class="product-tag-icon" v-if="item.tag_icon" :src="item.tag_icon" mode="heightFix" webp
                    lazy-load></image>
                  <text>{{ item.title }}</text>
                </view>
                <view class="product-val-info">
                  <view class="product-val">
                    ¥{{ item.activity_price }}
                  </view>
                  <view v-if="item.market_price && item.market_price !== item.activity_price"
                    class="product-val-unactive">
                    {{ item.market_price }}
                  </view>
                </view>
              </view>
            </view>

          </view>
        </view>

      </scroll-view>

    </view>
  </view>
</template>
<script>
import moment from 'moment';

export default {
  data() {
    return {
      aId: null,
      start_time: moment(new Date()).format('YYYY-MM-DD HH:mm'),

      tabIndex: 0,

      currentPage: 1,
      pageTotal: 1,
      keyword: '',
      brandSpace: {},
      dataList: [],
      active: [],
      coldDownTypeTexts: {
        [1]: '距结束',
        [2]: '距开始',
        [3]: '已过期'
      },

      dataLoading: false,

      coldDownInterval: null

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

    this.aId = options.id || '';


    this.getList();
  },
  onShow() {
    if(this.active.id) {
      this.tryColdDown();
    }
  },
  onHide() {
    if(this.coldDownInterval) clearTimeout(this.coldDownInterval);
  },
  onUnload() {
    if(this.coldDownInterval) clearInterval(this.coldDownInterval);
  },
  methods: {
    getList() {
      if(this.currentPage > this.pageTotal) return;
      let params = {
        aId: this.aId,
        keyword: this.keyword,
        page: this.currentPage
      }
      this.dataLoading = true;
      this.$get('/home/activityInfo', params, res => {
        this.dataLoading = false;
        this.currentPage += 1;

        this.active = res.data.info;
        if(!this.hasLoad) this.hasLoad = true;
        this.limit_type = this.active.limit_type;
        uni.setNavigationBarTitle({
          title: this.active.title || '限时专场'
        })

        if(moment(this.active.start_time).diff(moment()) < 0) {
          if(moment(this.active.end_time).diff(moment()) < 0) {
            this.active.activite_type = 3;  //已过期
          } else {
            this.active.activite_type = 1;  //正常
          }
        } else {
          this.active.activite_type = 2;  //未开始
        }

        if(this.active.activite_type != 3) {
          this.coldDowning();
          if(!this.coldDownInterval) this.tryColdDown();
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


    tryColdDown() {
      if(this.coldDownInterval) clearTimeout(this.coldDownInterval);
      this.coldDownInterval = setTimeout(() => {
        this.coldDowning();
        this.tryColdDown();
      }, 1000)
    },
    coldDowning() {
      let date = moment().utc().utcOffset(480).format('YYYY-MM-DD HH:mm:ss');
      let active = this.active;
      if(this.active.activite_type == 3 && this.coldDownInterval) clearTimeout(this.coldDownInterval);  //过期不倒计时
      let timeSpan = 0;
      if(this.active.activite_type == 1) {
        timeSpan = moment(this.active.end_time).diff(moment(date), 'seconds');
      } else {
        timeSpan = moment(date).diff(moment(this.active.start_time), 'seconds');  //未开始就反过来计算
      }
      let duration = moment.duration(timeSpan, 'seconds');
      let timeout = [];
      timeout.push(duration.days() >= 10 ? duration.days() : `0${duration.days()}`);
      timeout.push(duration.hours() >= 10 ? duration.hours() : `0${duration.hours()}`);
      timeout.push(duration.minutes() >= 10 ? duration.minutes() : `0${duration.minutes()}`);
      timeout.push(duration.seconds() >= 10 ? duration.seconds() : `0${duration.seconds()}`);
      this.active.timeout = timeout;

    },

    reGetList() {
      this.currentPage = 1;
      this.pageTotal = 1;
      this.dataList = [];
      this.getList();
    },

    updateTabIndex(index) {
      this.tabIndex = index;
      this.reGetList();
    },

    goToDetail(e) {

      let sn = e.currentTarget.dataset.sn;
      uni.navigateTo({
        url: `/pages/product-detail/product-detail?sn=${sn}`
      })
    }
  }

}
</script>
<style lang="scss" scoped>
@import 'area.scss';
</style>