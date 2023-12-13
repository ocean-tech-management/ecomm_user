<template>
  <view class="flex-page">
    <view v-if="linkerInfo.uid && linkerInfo.lookOrder" class="step-tabs">
      <view :class="{'step-tab': true, 'active': tabIndex == 1}" @tap="toggleType(1)">浏览足迹</view>
      <view :class="{'step-tab': true, 'active': tabIndex == 2}" @tap="toggleType(2)">购买记录</view>
    </view>
    <view class="linker-info">
      <view class="linker-avatar-box">
        <image v-if="linkerInfo.avatarUrl" class="linker-avatar" :src="linkerInfo.avatarUrl" mode="widthFix"></image>
        <image v-else class="linker-avatar" src="/static/images/logo.png" mode="widthFix"></image>
      </view>
      <view class="linker-username">{{linkerInfo.name || '游客'}}</view>
    </view>
    <view class="filter-box">
      <view class="filter-date" @tap="showPicker = true">
        <view v-if="timeTexts && timeTexts.length > 0" class="filter-date-val">
          {{timeTexts[0]}} ~ {{timeTexts[1]}}
        </view>
        <view v-else class="filter-date-placeholder">选择起止时间</view>
        <image class="filter-date-icon" src="/static/images/date_black.png"></image>
      </view>
    </view>
    <!-- 页面内容 -->
    <view class="flex-page-content">

      <view class="list-box">
        <scroll-view scroll-y class="tab-page-scroll" @scrolltolower="getList">
          <view v-if="tabIndex == 1" class="user-step-list" >
            <block v-for="(data, dataIndex) in dataList" :key="dataIndex">
              <view class="step-date">{{data.date}}</view>
              <block v-for="(item, index) in data.goods" :key="index">
                <view v-if="item.type == 2 || item.type == 3" class="step" @tap="goToProduct(item.goods_sn)">
                  <view class="user-step-goods-img-box">
                    <image v-if="item.goods_info" class="user-step-goods-img" :src="item.goods_info.main_image" mode="widthFix" webp lazy-load></image>
                    <image v-if="item.type == 3" class="user-step-shopcar-icon" src="/static/images/step_shopcar.png"></image>
                  </view>
                  <view class="user-step-goods-infos">
                    <view class="user-step-goods-title">
                      {{item.goods_info ? item.goods_info.title : '未知商品'}}
                    </view>
                    <view v-if="item.goods_info" class="user-step-goods-info">
                      <view class="user-step-goods-vals">
                        <view class="user-step-goods-val">¥{{item.goods_info.sale_price || '0.00'}}</view>
                        <view v-if="item.goods_info.market_price !== item.goods_info.sale_price" class="user-step-goods-val-unactive">¥{{item.goods_info.market_price || '0.00'}}</view>
                      </view>
                      <button class="user-step-goods-ctrl" open-type="share" :data-data-index="dataIndex" :data-index="index" @tap="tryShare">
                        <image class="user-step-share" src="/static/images/btn_share_icon.png" mode="widthFix"></image>
                      </button>
                    </view>
                    <view class="user-step-time">
                      {{item.type == 3 ? '加购' : '访问'}}时间：{{item.enter_time}}
                    </view>
                  </view>
                </view>
                <view v-else class="user-step-other">
                  <view class="user-step-other-img-box">
                    <image class="user-step-other-img" src="/static/images/index.png"></image>
                  </view>
                  <view class="user-step-other-infos">
                    <view class="user-step-other-title">{{typeTexts[item.type]}}</view>
                    <view class="user-step-other-time">
                      访问时间：{{item.enter_time}}
                    </view>
                  </view>
                </view>
              </block>
              
            </block>
          </view>
          <view v-else class="user-step-list" >
            <block v-for="(data, dataIndex) in dataList" :key="dataIndex">
              <view class="step-date">{{data.date}}</view>
              <block v-for="(item, index) in data.goods" :key="index">
                <view class="step" @tap="goToProduct(item.goods_sn)">
                  <view class="user-step-goods-img-box">
                    <image v-if="item.goods_info" class="user-step-goods-img" :src="item.goods_info.main_image" mode="widthFix" webp lazy-load></image>
                  </view>
                  <view class="user-step-goods-infos">
                    <view class="user-step-goods-title">
                      {{item.goods_info ? item.goods_info.title : '未知商品'}}
                    </view>
                    <view v-if="item.goods_info" class="user-step-goods-info">
                      <view class="user-step-goods-vals">
                        <view class="user-step-goods-val">¥{{item.goods_info.sale_price || '0.00'}}</view>
                      </view>
                      <button class="user-step-goods-ctrl" open-type="share" :data-data-index="dataIndex" :data-index="index" @tap="tryShare">
                        <image class="user-step-share" src="/static/images/btn_share_icon.png" mode="widthFix"></image>
                      </button>
                    </view>
                    <view class="user-step-time">
                      访问时间：{{item.enter_time}}
                    </view>
                  </view>
                </view>
              </block>
              
            </block>
          </view>
          <view v-if="dataList.length > 0 && currentPage > pageTotal && !listLoading" class="scroll-tips">没有更多数据了</view>
          <view v-if="dataList.length == 0 && currentPage > pageTotal && !listLoading" class="scroll-tips">暂无记录哦</view>

        </scroll-view>
      </view>
    </view>

    <mx-datetime-picker :show="showPicker" type="range" :value="timerange" :show-tips="true" :begin-text="'开始'" :end-text="'结束'" :show-seconds="true" @confirm="onSelectedTime" @cancel="onSelectedTime" />


  </view>

</template>

<script>
import mxDatetimePicker from '@/components/mx-datetimepicker/mx-datetimepicker.vue';
import moment from 'moment';

export default {
  components: {
    mxDatetimePicker
  },
  data() {
    return {
      openid: null,
      linkerInfo: {},
      userInfo: uni.getStorageSync('userInfo'),

      currentPage: 1,
      pageTotal: 1,
      listLoading: false,

      tabIndex: 1,

      apiList: {
        [1]: '/behavior/list',
        [2]: '/user/teamMemberOrder'
      },

      dataList: [],
      dataKeys: [],
      memberTexts: {},
      shareInfo: {},
      
      typeTexts: {
        [1]: '进入小程序',
        [2]: '查看商品',
        [3]: '加购了商品'
      },
      
      statusTexts: {
        [1]: '到账',
        [2]: '冻结中',
        [3]: '退款取消奖励',
        [-1]: '整单被删除'
      },

      timeTexts: [
        moment().subtract(1, 'months').format('YYYY.MM.DD'),
        moment().format('YYYY.MM.DD')
      ],
      timeVals: [
        moment().subtract(1, 'months').format('YYYY-MM-DD HH:mm:ss'),
        moment().format('YYYY-MM-DD HH:mm:ss')
      ],
      timerange: [],
      showPicker: false,

      isCtrl: false
      
    }
  },
  
  onShareAppMessage(e) {
    if(e.from !== 'button') {
      let shareInfo = {
        title: '全球品牌·高端会员平台　　　100%正品承诺',
        desc: '全球品牌·高端会员平台　　　100%正品承诺',
        // imageUrl: '/static/images/share.jpg',
        path: `/pages/index/index?link_uid=${uni.getStorageSync('userInfo').uid}`
      }
      return shareInfo;
    } else {
      let sku = this.dataList[e.target.dataset.dataIndex].goods[e.target.dataset.index].goods_info;
      let target = `/pages/product-detail/product-detail?sn=${sku.goods_sn}`;
      let path = `/pages/index/index?redirect=${encodeURIComponent(target)}`;
      if(this.userInfo.uid) path += `&link_uid=${this.userInfo.uid}`;
      let shareInfo = {
        title: sku.title,
        desc: sku.title,
        imageUrl: sku.main_image,
        path: path
      }
      return shareInfo;
    }
    
  },
  onLoad(options) {
    if(!options.openid) {
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
    this.openid = options.openid;

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
      if(this.tabIndex == 1) {
        this.getSteps();
      } else {
        this.getOrders();
      }
    },
    getSteps() {
      let params = {
        openid: this.openid,
        userType: 2,  //1uid 2openid 3unionId
        page: this.currentPage,
        observer_uid: this.userInfo.uid
      }
      if(this.timeVals && this.timeVals.length == 2) {
        params.start_time = this.timeVals[0];
        params.end_time = this.timeVals[1];
      }
      this.listLoading = true;
      this.$get(this.apiList[this.tabIndex], params, res => {
        this.listLoading = false;
        this.currentPage += 1;
        if(!this.linkerInfo || !this.linkerInfo.name) this.linkerInfo = res.data.info;
        if(!res.data.list || res.data.list.list.length == 0) return;
        let dataList = res.data.list.list;
        for(let i = 0; i < dataList.length; i++) {
          let item = dataList[i];
          item.enter_time = moment(item.enter_time).format('YYYY.MM.DD HH:mm:ss');
          let date = moment(item.enter_time).format('YYYY年MM月DD日');
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
        this.pageTotal = res.data.list.pageTotal;
      }, err => {
        this.listLoading = false;
      })
    },
    getOrders() {
      let params = {
        keyword: '',
        page: this.currentPage,
        order_uid: this.linkerInfo.uid,
        observer_uid: this.userInfo.uid
      }
      if(this.timeVals && this.timeVals.length == 2) {
        params.start_time = this.timeVals[0];
        params.end_time = this.timeVals[1];
      }
      this.listLoading = true;
      this.$get(this.apiList[this.tabIndex], params, res => {
        this.listLoading = false;
        this.currentPage += 1;
        if(!res.data.list || res.data.list.length == 0) return;
        let dataList = res.data.list;
        for(let i = 0; i < dataList.length; i++) {
          for(let j = 0; j < dataList[i].goods.length; j++) {
            let item = {
              goods_info: dataList[i].goods[j],
              enter_time: moment(dataList[i].create_time).format('YYYY.MM.DD HH:mm:ss')
            };
            let date = moment(dataList[i].create_time).format('YYYY年MM月DD日');
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
        this.pageTotal = res.data.pageTotal;
      }, err => {
        this.listLoading = false;
      })
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

    toggleType(index) {
      this.tabIndex = index;
      this.reloadPage();
    },

    goToProduct(sn) {
      if(this.isCtrl) return this.isCtrl = false;
      if(!sn) return;
      uni.navigateTo({
        url: `/pages/product-detail/product-detail?sn=${sn}`
      })
    },

    onSelectedTime(val) {
      this.showPicker = false;
      if(val) {
        if(moment(val.value[1]).diff(moment(val.value[0]), 'days') > 31) {
          return uni.showToast({
            title: '最多查询31天哦',
            icon: 'none',
            mask: true
          })
        }
        this.timerange = val;
        let start_time = val.value[0], end_time = val.value[1];
        this.timeTexts = [moment(start_time).format('YYYY.MM.DD'), moment(end_time).format('YYYY.MM.DD')];
        this.timeVals = [moment(start_time).format('YYYY-MM-DD 00:00:00'), moment(end_time).format('YYYY-MM-DD 23:59:59')];
        this.reloadPage();
      }
    },

    tryShare() {
      this.isCtrl = true;
    }
    

  
    
  }
}
</script>

<style lang="scss" scoped>
  @import 'steps-linker.scss';
</style>