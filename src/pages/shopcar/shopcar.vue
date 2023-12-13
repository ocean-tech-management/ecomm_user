<template>
  <view class="flex-page shopcar-page">
    <!-- 页面内容 -->
    <view class="flex-page-content">
      <scroll-view v-if="dataList.length > 0" scroll-y class="tab-page-scroll">
        <view class="shopcar-tips ellipsis-1">
          <image src="/static/images/shop_car/shopcar_tips.png" class="shopcar-tips-image"></image>您的订单需要多仓分发，请注意查收快递哦
        </view>
        <view class="shopcar-orders">
          <view v-for="(item, index) in dataList" class="shopcar-order-box" :class="{ 'show-ctrl': item.showCtrl }"
            :data-idx="index" :key="item.cart_sn" @touchstart="handleTouchStart" @touchmove="handleTouchMove"
            @touchend="handleTouchEnd">
            <view class="shopcar-order">
              <!-- 正常的勾选的购物车项 -->
              <view v-if="item.goods.status == 1" class="shopcar-order-select" @tap="SelectItem(index)">
                <image v-show="selectOrders.indexOf(item.cart_sn) >= 0" class="shopcar-toggle-icon"
                  src="/static/images/shop_car/shopcar_select.png"></image>
                <image v-show="selectOrders.indexOf(item.cart_sn) < 0" class="shopcar-toggle-icon"
                  src="/static/images/shop_car/shopcar_unselect.png"></image>
              </view>
              <!-- 无效的购物车项 -->
              <view v-if="item.goods.status != 1" class="shopcar-order-status-box">
                <view v-if="item.goods.status == -10087" class="shopcar-order-status">售罄</view>
                <view v-else class="shopcar-order-status">无效</view>
              </view>
              <view class="shopcar-order-img-box">
                <image class="shopcar-order-img" :src="item.goods.image" mode="widthFix" webp lazy-load></image>
              </view>
              <view class="shopcar-order-info" :class="{ 'shopcar-order-unactive': item.goods.status != 1 }">
                <view class="shopcar-order-name ellipsis-2">{{ item.goods.title }}</view>
                <view class="shopcar-order-property">
                  <view class="shopcar-order-property-text" v-if="item.goods.status == 1 || item.goods.status == -10087"
                    :data-sn="item.goods_sn" @tap="showSkuCtrl">
                    <text>{{ item.property }} </text>
                    <image class="shopcar-order-property-sign" src="/static/images/me_more.png"></image>
                  </view>
                  <!-- 无效时不让更改 -->
                  <view v-else class="shopcar-order-property-text-static">{{ item.property }} </view>
                </view>

                <!-- 下单状态 -->
                <view class="shopcar-order-val-box">
                  <!-- 该系统没有会员价 -->
                  <!-- <view class="shopcar-order-val" :class="{'shopcar-order-val-unactive': userInfo.vip_level}">￥{{item.sale_price || '0.00'}}</view>
                  <view v-if="item.member_price" class="shopcar-order-vip-val">
                    <text class="shopcar-order-vip-tips">会员</text>
                    <text class="shopcar-order-val" :class="{'shopcar-order-val-unactive': !userInfo.vip_level}"> ￥{{item.member_price}}</text>
                  </view> -->
                  <view class="shopcar-order-val">￥{{ item.goods.sale_price || '0.00' }}</view>
                  <view class="shopcar-order-count-box">
                    <view class="shopcar-order-count">×{{ item.number }}</view>
                  </view>
                </view>

                <view v-if="item.goods.status == -10086" class="shopcar-order-rebuy">
                  <view class="shopcar-order-rebuy-btn">重新购买</view>
                </view>

              </view>
            </view>
            <view class="shopcar-delete" :data-sn="item.cart_sn" :data-index="index" @tap="deleteSelect">
              <image class="shopcar-delete-img" src="/static/images/del_w.png" mode="widthFix" />
            </view>
          </view>

        </view>
        <view style="height: 20rpx;"></view>
      </scroll-view>
      <view v-if="dataList.length == 0 && !dataLoading" class="scroll-tips">暂无记录哦</view>
    </view>

    <!-- 购物车下单操作， 只有存在有效商品时才显示 -->
    <view v-if="validList.length > 0" class="shopcar-ctrls">
      <view class="shopcar-toggle-all" @tap="toggleAll">
        <image v-show="isAll" class="shopcar-toggle-icon" src="/static/images/shop_car/shopcar_select.png"></image>
        <image v-show="!isAll" class="shopcar-toggle-icon" src="/static/images/shop_car/shopcar_unselect_ctrls.png">
        </image>
        <view class="shopcar-toggle-all-text">全选</view>
      </view>
      <view class="shopcar-all-info">
        <!-- <text>总计：</text> -->
        ￥{{ totalPrice || '0.00' }}
        <!-- <view class="shopcar-all-tips">不含满减优惠，不含运费</view> -->
      </view>
      <view class="bottom-btn shopcar-ctrl-btn" @tap="createOrder">
        下单
      </view>
    </view>

    <!-- 购物车信息调整操作 -->
    <view v-show="showSku" class="sku-popup-box">
      <view class="popup-mask" @tap="showSku = false"></view>
      <view v-if="sku" class="sku-popup-content">
        <view class="sku-info">
          <view class="sku-img-box">
            <image class="sku-img" :src="sku.image" mode="widthFix" webp></image>
          </view>
          <view class="sku-info-content">
            <view class="sku-title">{{ sku.title }}</view>
            <view class="sku-vals">
              <view class="sku-val-item">
                <view class="sku-val">￥{{ sku.sale_price || '0.00' }}</view>

              </view>
              <!-- 系统没有会员价了现在 -->
              <!-- <view class="sku-val-item sku-val-vip-item">
                <view class="sku-val-name">会员</view>
                <view class="sku-val">￥{{sku.member_price || '0.00'}}</view>
              </view> -->
            </view>
            <view class="sku-selected">
              <text>已选：</text>
              <text class="sku-selected-attr">{{ sku.path }}</text>
            </view>
          </view>
          <!-- 关闭sku操作弹窗按钮 -->
          <view class="sku-close" @tap="showSku = false">×</view>
        </view>
        <view class="sku-list">
          <view v-for="(skuItem, skuKey) in skuAttrs" class="sku-list-item" :key="skuKey">
            <view class="sku-title">{{ skuKey }}</view>
            <view class="sku-attr-list">
              <view v-for="(attr, attrIndex) in skuItem" :class="{
                'sku-attr-item': true,
                'selected': skuAttrSelected.attr[skuKey] == attr,
                'disabled': skuAllowSelected[skuKey].indexOf(attr) < 0
              }" :key="attrIndex" @tap="updateAttr(skuKey, attr, skuAllowSelected[skuKey].indexOf(attr) >= 0)">
                {{ attr }}</view>
            </view>
          </view>


          <view class="sku-number">
            <view class="sku-number-title">数量</view>
            <view class="sku-number-ctrls">
              <view class="sku-number-ctrl" @tap="deleteSkuSelectNum">-</view>
              <view class="sku-number-ctrl" @tap="tryShowEditNum">{{ sku.select_num }}</view>
              <view class="sku-number-ctrl" @tap="addSkuSelectNum">+</view>
            </view>
          </view>

        </view>
        <view class="confirm-btn-box">
          <block v-if="sku.stock > 0">
            <view v-if="sku.order_type == 3" class="bottom-btn btn-disbled">
              礼包商品不允许加购物车
            </view>
            <view v-else-if="sku.isLimit" class="bottom-btn btn-disbled">
              <block v-if="sku.limitActivityType == 'nostart'">{{ sku.start_time }}开始活动</block>
              <block v-else>非活动时间</block>
            </view>
            <view v-else class="bottom-btn" @tap="confirmSkuInfo">
              确定
            </view>
          </block>
          <block v-else>
            <view class="bottom-btn btn-disbled">
              已售罄
            </view>
          </block>

        </view>
      </view>
    </view>

    <view v-if="handingSelectNumberVisible" class="edit-num-popup">
      <view class="edit-num-popup-mask"></view>
      <view class="edit-num-popup-content">
        <view class="edit-num-popup-title">填写数量</view>
        <view class="edit-num-input-box">
          <input class="edit-num-input" type="number" maxlength="6" placeholder="请输入" :value="handingSelectNumber"
            @input="updateHandingSelectNumber" @confirm="confirmHandingSelectNumber" />
        </view>
        <!-- <view class="edit-num-input-tips">剩余库存：{{sku.stock || 0}}</view> -->
        <view class="edit-num-popup-ctrls">
          <view class="edit-num-popup-ctrl" @tap="handingSelectNumberVisible = false">取消</view>
          <view class="edit-num-popup-ctrl primary" @tap="confirmHandingSelectNumber">确定</view>
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
      address: null,  //地址，现在启用邮费模板，需要以地址做支撑

      userInfo: uni.getStorageSync('userInfo'),
      touchInfo: {
        start: 0,
        current: 0,
        end: 0,
        index: 0,
        showCtrl: false
      },
      touchIndex: 0,
      isCtrl: false,
      selectOrders: [],
      hasSelect: false,
      isAll: false,
      totalPrice: 0,

      dataList: [],
      validList: [],
      dataLoading: false,

      // 购物车项信息调整，sku调整
      showSku: false,
      product: null,
      sku: {},  //当前匹配到的的sku
      skuItems: [], //sku项，用来遍历sku可能属性路径
      skuAttrs: {}, //sku的属性键值对 {sku属性名: sku属性值}
      skuResults: [], //属性对应sku的相关结果
      skuPerhapsPath: [], //所有可用sku的的可能属性路径
      skuConnect: '，', //sku属性连接符，v3，不是逗号，用来拼接sku属性组合
      skuAttrSelected: [], //选中的sku信息，用来渲染页面sku属性高亮与否
      skuAttrValSelected: [], //选中的sku信息，用来判断处理相关选中与否的逻辑
      skuAllowSelected: [],  //允许选择的属性项，用来渲染页面sku属性可选与否

      handingSelectNumber: 0,
      handingSelectNumberVisible: false,
    }
  },

  onShareAppMessage() {
    let userInfo = uni.getStorageSync('userInfo');
    let path = '/pages/index/index';
    if(userInfo.uid) path += `?link_uid=${userInfo.uid}`;
    return {
      title: `美丽生活，点击开启`,
      desc:  `集品严选`,
      // imageUrl: '/static/images/share.jpg',
      path: path
    }
  },
  onLoad() {
  },
  onShow() {
    if(!this.userInfo.need_auth) {
      this.reGetList();
      this.getAddress();
    }
  },
  methods: {
    getAddress(handler) {
      let params = {
        uid: uni.getStorageSync('userInfo').uid
      }
      this.$sget('/address/list', params, res => {
        let addresses = res.data;
        if(!addresses || addresses.length == 0) {
          return;
        }

        for(let i = 0; i < addresses.length; i++) {
          if(addresses[i].is_default == 1) this.address = addresses[i];
        }
        if(!this.address) this.address = addresses[0];
        if(handler && typeof handler == 'function') handler();
      })
    },

    /**
    * @status -10086活动商品已失效 -10087已售罄
    */
    getList() {
      let params = {
        uid: uni.getStorageSync('userInfo').uid
      }
      this.dataLoading = true;
      this.$sget('/shopCart/list', params, res => {
        this.dataLoading = false;
        this.currentPage += 1;
        let dataList = res.data;

        let validList = [], invalidList = [];
        for(let i = 0; i < dataList.length; i++) {
          dataList[i].attr = JSON.parse(dataList[i].specs);
          dataList[i].property = Object.values(dataList[i].attr).join(',');
          dataList[i].showCtrl = false;
          dataList[i].attach_type = dataList[i].goods.attach_type;

          if(dataList[i].goods.status == 1) {
            // 只有商品状态正常才需要检查
            if(dataList[i].goods.stock <= 0) {
              dataList[i].goods.status = -10087;  //-10087也是自己定的特殊值，表示售罄
            }

            if(dataList[i].activity_sign) {
              // 如果存在活动标志，证明是从活动里加的
              if(
                !dataList[i].activity ||
                dataList[i].activity == [] ||
                !dataList[i].activity_goods ||
                dataList[i].activity_goods == []
              ) {
                // 如果检查不到活动或者检查不到活动商品，那就是有问题的
                dataList[i].goods.status = -10086;  //-10086是前端自己定的一个特殊值，表示是活动商品但无效
              } else {
                if(!dataList[i].activity_goods.goodsSpu) {
                  // 找不到对应的活动商品信息
                  dataList[i].goods.status = -10086;
                } else {
                  let date = moment().utc().utcOffset(480).format('YYYY-MM-DD HH:mm:ss');
                  if(
                    moment(date).diff(dataList[i].activity_goods.goodsSpu.start_time) < 0 ||
                    moment(date).diff(dataList[i].activity_goods.goodsSpu.end_time) > 0
                  ) {
                    // 未开售或者活动已结束
                    dataList[i].goods.status = -10086;
                  }
                }
              }
            }
          }

          if(dataList[i].goods && dataList[i].goods.status == 1) {
            validList.push(dataList[i]);
          } else {
            invalidList.push(dataList[i]);
          }
        }

        let shopcarList = [];
        shopcarList.push(...validList, ...invalidList);
        this.dataList = shopcarList;
        this.validList = validList;
        this.isAll = false;
        this.toggleAll();

        uni.setStorageSync('shopcar', this.dataList);  //缓存购物车信息，以备缓存信息使用
        // 更新缓存触发器
        let currentStorageTrigger = uni.getStorageSync('storageTrigger'); //重新获取缓存触发器，避免其他接口进行操作时缓存数据相互覆盖
        currentStorageTrigger.shopcar = true;
        uni.setStorageSync('storageTrigger', currentStorageTrigger);
      }, err => {
        this.dataLoading = false;
        console.log(err);
      })
    },
    reGetList() {
      this.touchInfo = {
        start: 0,
        current: 0,
        end: 0,
        index: 0,
        showCtrl: false
      };
      this.touchIndex = 0;
      this.dataList = [];
      this.selectOrders = [];
      this.hasSelect = false;
      this.isAll = false;
      this.totalPrice = 0;
      this.getList();
    },
    updateSelect(info) {
      setTimeout(() => {
        // 放异步，避免冒泡速度过快影响逻辑
        // if(this.isCtrl) return this.isCtrl = false;
        let cart_sn = info.cart_sn;
        let index = this.selectOrders.indexOf(cart_sn);
        if(index >= 0) {
          this.selectOrders.splice(index, 1);
        } else {
          this.selectOrders.push(cart_sn);
        }
        this.hasSelect = this.selectOrders.length > 0 ? true : false;
        // 当选中项与有效列表长度一致时，为全选
        if(this.selectOrders.length == this.validList.length) {
          this.isAll = true;
        } else {
          this.isAll = false;
        }
        this.updateOrderPrice();
      }, 10)

    },
    toggleAll() {
      this.isAll = !this.isAll;
      if(this.isAll) {
        let selectOrders = [];
        for(let i = 0; i < this.validList.length; i++) {
          selectOrders.push(this.validList[i].cart_sn);
        }
        this.selectOrders = selectOrders;
      } else {
        this.selectOrders = [];
      }
      this.hasSelect = this.selectOrders.length > 0 ? true : false;

      this.updateOrderPrice();
    },
    SelectItem(index) {
      this.isCtrl = true;
      this.touchIndex = index;
      this.updateSelect({
        cart_sn: this.dataList[this.touchIndex].cart_sn
      })

    },
    updateOrderPrice() {
      let price = 0;
      let isVip = uni.getStorageSync('userInfo').vip_level ? true : false;
      for(let i = 0; i < this.dataList.length; i++) {
        if(!this.selectOrders.includes(this.dataList[i].cart_sn)) continue;
        // let usePrice = isVip ? parseFloat(this.dataList[i].member_price) : parseFloat(this.dataList[i].sale_price);  //无会员价
        let usePrice = parseFloat(this.dataList[i].goods.sale_price);
        price += usePrice * this.dataList[i].number;
      }
      this.totalPrice = price.toFixed(2);
    },

    handleTouchStart(e) {
      this.touchInfo = {
        start: e.touches[0].pageX,
        current: e.touches[0].pageX,
        end: e.touches[0].pageX,
        drag: false
      }
      this.touchIndex = e.currentTarget.dataset.idx;
    },
    handleTouchMove(e) {
      this.touchInfo.current = e.touches[0].pageX;
      if(this.touchInfo.current - this.touchInfo.start > 30) {
        this.dataList[this.touchIndex].showCtrl = false;
        this.touchInfo.drag = true;
      } else if(this.touchInfo.current - this.touchInfo.start < -30) {
        this.dataList[this.touchIndex].showCtrl = true;
        this.touchInfo.drag = true;
      }
      this.$forceUpdate();
    },
    handleTouchEnd(e) {
      setTimeout(() => {
        if(this.isCtrl) return this.isCtrl = false;
        if(!this.touchInfo.drag) {
          // 现在跳转商品
          // this.updateSelect({
          //   cart_sn: this.dataList[this.touchIndex].cart_sn
          // })
          uni.navigateTo({
            url: `/pages/product-detail/product-detail?sn=${this.dataList[this.touchIndex].goods_sn}`
          })
        }
      }, 50)


    },

    // sku的相关操作
    showSkuCtrl(e) {
      // 缓存打开来源： 购物车或者直接购买
      this.isCtrl = true;
      let params = {
        uid: uni.getStorageSync('userInfo') && uni.getStorageSync('userInfo').uid ? uni.getStorageSync('userInfo').uid : null,
        goods_sn: e.currentTarget.dataset.sn
      }
      // 获取产品信息，显示弹窗
      this.$get('/goods/info', params, res => {
        this.product = res.data;
        if(!this.product.shopSku || this.product.shopSku.length == 0) {
          return uni.showToast({
            title: '商品异常',
            mask: true
          })
        }
        for(let i = 0; i < this.product.shopSku.length; i++) {
          this.product.shopSku[i].attr = this.product.shopSku[i].specs;
          if(this.product.shopSku[i].sku_sn == this.dataList[this.touchIndex].sku_sn) {
            let item = this.product.shopSku[i];
            this.product.shopSku.splice(i, 1);
            this.product.shopSku.unshift(item);
          }
        }

        this.calcSkuItems();
        this.calcSkuAllPath();
        this.updateSkuSelected();
        this.sku = JSON.parse(JSON.stringify(this.skuResults[0]));

        this.showSku = true;

      })
    },

    // sku相关操作开始
    calcSkuItems() {
      let skus = this.product.shopSku;
      let skuAttrs = {};
      let skuItems = [];
      let skuResults = [];
      for(let i = 0; i < skus.length; i++) {
        skus[i].attr = JSON.parse(skus[i].attr);  //将存储起来的属性格式化

        // 计算每个属性的键与值群，用来渲染规格列表
        let skuKey = Object.keys(skus[i].attr);
        let skuVal = Object.values(skus[i].attr);
        for(let j = 0; j < skuKey.length; j++) {
          if(!skuAttrs[skuKey[j]]) {
            // 属性键还不存在，新建一个键
            skuAttrs[skuKey[j]] = [];
            skuAttrs[skuKey[j]].push(skuVal[j]);
          } else {
            // 键已存在，判断值存在与否，若未存在，加入对应键值对中
            if(!skuAttrs[skuKey[j]].includes(skuVal[j])) skuAttrs[skuKey[j]].push(skuVal[j]);
          }
        }

        // 计算sku结果列表，包含规格与对应id与其他信息
        let result = JSON.parse(JSON.stringify(skus[i].attr));
        result.sku_sn = skus[i].sku_sn;
        result.activity_sign = skus[i].activity_sign;
        result.goods_sn = skus[i].goods_sn; //和购买流程有出入，保留goods_sn做sku属性更改用
        result.title = skus[i].title;
        result.image = skus[i].image;
        result.path = skuVal.join(this.skuConnect);
        result.sale_price = skus[i].sale_price;
        // result.member_price = skus[i].member_price;  //无会员价
        result.stock = skus[i].stock;
        result.free_shipping = skus[i].free_shipping;
        result.fare = skus[i].fare;
        result.select_num = this.dataList[this.touchIndex].number || 1;

        // 在此处兼容商品是否参加活动
        result.exist_activity = skus[i].exist_activity;
        result.activity_info = skus[i].activity_info;
        // 如果存在活动，
        if(result.exist_activity) {
          // 检查是不是团长礼包
          if(skus[i].activity_info.a_type == 2) {
            result.order_type = 3; //团长升级单
          }
        }
        if(skus[i].activity_info && skus[i].activity_info.id) {
          let date = moment().utc().utcOffset(480).format('YYYY-MM-DD HH:mm:ss');
          let startDate = moment(skus[i].start_time).format('YYYY-MM-DD HH:mm:ss');
          let endDate = moment(skus[i].end_time).format('YYYY-MM-DD HH:mm:ss');
          if(moment(startDate).diff(moment(date)) > 0) {
            result.isLimit = true;
            result.start_time = moment(skus[i].start_time).format('MM月DD号HH:mm');
            result.start_time_val = skus[i].start_time;
            result.limitActivityType = 'nostart';
          } else if(moment(date).diff(moment(endDate)) > 0) {
            result.isLimit = true;
            result.limitActivityType = 'expire';
          }
        }

        skuResults.push(result);

        // 计算sku的有效path
        skuItems.push({
          path: skuVal.join(this.skuConnect),
          sku: skus[i].sku_sn
        });

      }
      this.skuAttrs = skuAttrs;
      this.skuItems = skuItems;
      this.skuResults = skuResults;
      // 设置初始sku选中值
      this.skuAttrSelected = {
        sku_sn: this.product.shopSku[0].sku_sn,
        attr: this.product.shopSku[0].attr
      }
      this.skuAttrValSelected = Object.values(this.skuAttrSelected.attr);
    },
    calcSkuAllPath(arr) {
      let skuPath = [];
      let originSkus = [];
      // 遍历出所有可能存在的path
      for(let i = 0; i < this.skuItems.length; i++) {
        let currentSkuItem = this.skuItems[i];
        let currentSkuPath = currentSkuItem.path;
        var skuVal = currentSkuPath.split(this.skuConnect);
        // 计算该sku项能有多少个幂积（可能路径）
        let allResult = this.calcSkuPath(skuVal);
        for(let j = 0; j < allResult.length; j++) {
          let result = allResult[j];
          let resultKey = allResult[j].join(this.skuConnect);
          // 如果幂积键已存在，则直接将对应sku加入到幂积值中
          if(this.skuPerhapsPath[resultKey]) {
            this.skuPerhapsPath[resultKey].skus.push(currentSkuItem.sku)
          } else {
            // 不存在，创建对应键
            this.skuPerhapsPath[resultKey] = {
              skus: [currentSkuItem.sku]
            }
          }
        }
      }
    },
    // 计算sku的幂积，参考https://www.cnblogs.com/soul-wonder/p/9732921.html
    calcSkuPath(arr) {

      let skuPath = [[]];
      for (let i=0; i < arr.length; i++) {
          for (let j = 0, len = skuPath.length; j < len; j++) {
              skuPath.push(skuPath[j].concat(arr[i]));
          }
      }
      return skuPath;
    },
    // 切换属性
    updateAttr(key, val, isAllow) {
      let isActive = this.skuAttrSelected.attr[key] == val;   //是否当前已经是选中项
      let skuAttrSelectedLast = JSON.parse(JSON.stringify(this.skuAttrSelected));
      let skuAttrValSelectedLast = JSON.parse(JSON.stringify(this.skuAttrValSelected));

      // 如果是选中项，那么不做任何处理。如果不是选中项，那么切换sku属性组合
      if (!isActive) {
          this.skuAttrSelected.attr[key] == val;
          this.skuAttrValSelected = Object.values(this.skuAttrSelected.attr);

          this.handleUpdate(key, val, skuAttrSelectedLast);
          // this.updateSkuSelected()
      }
    },
    handleUpdate(key, val, lastData) {
      let skuAttrSelected = this.skuAttrSelected;
      skuAttrSelected.sku_sn = null;
      let keys = Object.keys(this.skuAttrSelected.attr);
      for(let i = 0; i < keys.length; i++) {
        if(keys[i] != key) {
          skuAttrSelected.attr[keys[i]] = '';
        } else {
          skuAttrSelected.attr[keys[i]] = val;
        }
      }
      // 去掉其他的选择，更新整个sku选中项
      this.skuAttrSelected = skuAttrSelected;
      this.skuAttrValSelected = Object.values(this.skuAttrSelected.attr);
      this.updateSkuSelected();

      /**
       * 恢复原来已选属性
       * 遍历所有非当前属性行
       *   1. 与 lastData(skuAttrSelectedLast) 对比
       *   2. 如果要恢复的属性存在（非 disable）且 和当前*未高亮行*已选择属性的*可组合*），高亮原来已选择的属性且更新
       *   3. 否则什么也不做
       */
      for (var i = 0; i < keys.length; i++) {
        var currentKey = keys[i]
        if (currentKey == key) continue;  //对于操作的那项不做任何处理

        // 如果上一次选中的属性在允许选中列表中，将上一次选项值赋值给当前属性
        if(this.skuAllowSelected[currentKey].indexOf(lastData.attr[currentKey]) >= 0) {
          this.skuAttrSelected.attr[currentKey] = lastData.attr[currentKey];
          this.skuAttrValSelected = Object.values(this.skuAttrSelected.attr);
          this.updateSkuSelected();
        }
      }

      if(!this.skuAttrValSelected.includes('')) this.confirmSku();
    },
    // 更新选中的信息
    updateSkuSelected() {
      let keys = Object.keys(this.skuAttrs);
      let skuAllowSelected = {};
      for (let i = 0; i < keys.length; i++) {
        let key = keys[i];
        let data = this.skuAttrs[key];
        let validSelected = this.skuAttrValSelected.slice();
        skuAllowSelected[key] = [];
        for (let j = 0; j < data.length; j++) {
            let attr = data[j];

            // 被选中的值对应的属性默认是允许被选中的
            if (this.skuAttrValSelected[i] == attr) {
              skuAllowSelected[key].push(attr);
              continue;
            }
            // 未被选中的值需要做判断
            validSelected[i] = attr;

            let currValidPath = this.trimSpliter(validSelected.join(this.skuConnect), this.skuConnect);
            // 检查path是否在全部可能path中
            if (this.skuPerhapsPath[currValidPath]) {
            // console.log(currValidPath)
              skuAllowSelected[key].push(attr); //在path中，允许选中
            }
        }
      }
      this.skuAllowSelected = skuAllowSelected;
    },
    trimSpliter(str, spliter) {
      // 用来分割、拼接选中各个sku属性值——>path
      // ⊙abc⊙ => abc
      // ⊙a⊙⊙b⊙c⊙ => a⊙b⊙c
      var reLeft        = new RegExp('^' + spliter + '+', 'g');
      var reRight       = new RegExp(spliter + '+$', 'g');
      var reSpliter = new RegExp(spliter + '+', 'g');
      return str.replace(reLeft, '')
          .replace(reRight, '')
          .replace(reSpliter, spliter)
    },
    // 当所有的attr都有选中值的时候，检查到底是哪个sku被选中了
    confirmSku() {
      let path = this.skuAttrValSelected.join(this.skuConnect);
      for(let i = 0; i < this.skuResults.length; i++) {
        if(this.skuResults[i].path == path) {
          let sku = this.skuResults[i];
          this.sku = JSON.parse(JSON.stringify(sku));
        }
      }

      //拿一下sku的信息做信息展示用
      this.product.sale_price = this.sku.sale_price;
      // this.product.member_price = this.sku.member_price; //无会员价
      this.product.path = this.sku.path;
    },
    addSkuSelectNum() {
      if(this.sku.select_num >= this.sku.stock) {
        return uni.showToast({
          title: '超过商品库存',
          mask: true,
          icon: 'none'
        })
      }
      this.sku.select_num += 1;
    },
    deleteSkuSelectNum() {
      if(this.sku.select_num == 1) {
        return uni.showToast({
          title: '最少得选购一件哦',
          mask: true,
          icon: 'none'
        })
      }
      this.sku.select_num -= 1;
    },
    tryShowEditNum() {
      // 手动输入下单数量
      this.handingSelectNumber = this.sku.select_num;
      this.handingSelectNumberVisible = true;
    },
    updateHandingSelectNumber(e) {
      // 确认输入多少
      this.handingSelectNumber = e.detail.value;
    },
    confirmHandingSelectNumber() {
      let handingSelectNumber = parseInt(this.handingSelectNumber);
      if(!(/^([1-9][0-9]*)$/.test(handingSelectNumber))) {
        return uni.showToast({
          title: '请输入大于0的有效整数',
          icon: 'none',
          mask: true
        })
      } else if(handingSelectNumber > this.sku.stock) {
        return uni.showToast({
          title: '数量超过库存了',
          icon: 'none',
          mask: true
        })
      }
      this.sku.select_num = handingSelectNumber;
      this.handingSelectNumberVisible = false;
    },
    // sku相关操作结束

    // 确认选中sku的相关信息，更新购物车
    confirmSkuInfo() {

      let params = {
        cart_sn: this.dataList[this.touchIndex].cart_sn,
        uid: uni.getStorageSync('userInfo').uid,
        goods_sn: this.sku.goods_sn,
        activity_sign: this.dataList[this.touchIndex].activity_sign,
        sku_sn: this.sku.sku_sn,
        number: this.sku.select_num
      };

      // 获取产品信息，显示弹窗
      this.$post('/shopCart/update', params, res => {
        setTimeout(() => {
          uni.showToast({
            title: '修改商品成功',
            mask: true
          })
          setTimeout(() => {
            this.showSku = false;

            this.reGetList();
          }, 1800)
        }, 180)
      })

    },



    deleteSelect(e) {
      this.isCtrl = true;
      let sn = e.currentTarget.dataset.sn;
      let index = e.currentTarget.dataset.index;
      // 暂时直接就删除
      // uni.showModal({
      //   title: '提示',
      //   content: '您将删除选中购物车物品，是否继续？',
      //   success: res => {
      //     if(res.confirm) {
            let params = {
              uid: uni.getStorageSync('userInfo') && uni.getStorageSync('userInfo').uid ? uni.getStorageSync('userInfo').uid : null,
              cart_sn: [sn]
            }
            // 获取产品信息，显示弹窗
            this.$post('/shopCart/delete', params, res => {
              setTimeout(() => {
                this.dataList.splice(index, 1);
                uni.showToast({
                  title: '删除商品成功',
                  mask: true
                })
                setTimeout(() => {
                  this.reGetList();
                }, 1800)
              }, 180)
            })
      //     }
      //   }
      // })

    },
    createOrder() {
      if(this.dataLoading) return;
      if(this.selectOrders.length == 0) {
        uni.showToast({
          title: '请选择商品哦',
          icon: 'none',
          mask: true
        })
        return;
      }

      let goods = [];
      for(let i = 0; i < this.dataList.length; i++) {
        if(!this.selectOrders.includes(this.dataList[i].cart_sn)) continue;
        goods.push({
          goods_sn: this.dataList[i].goods_sn,
          activity_id: this.dataList[i].activity_sign,
          sku_sn: this.dataList[i].sku_sn,
          number: this.dataList[i].number,
          attach_type: this.dataList[i].attach_type || -1
        });
      }
      let params = {
        goods: goods,
        uid: uni.getStorageSync('userInfo').uid,
        uc_code: [],
        integral: 0,
        usedIntegralDis: 2,
        usedCouponDis: 1,
        // pay_type: 2,
        readyType: 1,    //1商品详情页触发，2预订单使用
        order_type: 1
      }

      if(this.address) {
        params.city = this.address.city_code;
        params.province = this.address.province_code;
        params.area = this.address.area_code;
        // 拼接地址，保税仓可能要用到
        params.shipping_address_detail = {
          Province: this.address.province,
          City: this.address.city,
          Area: this.address.area,
          ProvinceId: this.address.province_code,
          CityId: this.address.city_code,
          AreaId: this.address.area_code,
          address: this.address.address,
        }
      }

      params.attach_type = -1;
      for(let i = 0; i < params.goods.length; i++) {
        if(params.goods[i].attach_type && params.goods[i].attach_type !== -1) {
          if(params.goods[i].attach_type > params.attach_type) params.attach_type = params.goods[i].attach_type; //特殊要求
        }
      }

      this.$spost('/order/ready', params, res => {
        let preOrder = res.data;
        let time = new Date().getTime();  //模拟一个id，用来做后续预订单页面的检索
        preOrder.id = time;
        uni.setStorageSync('preOrder', preOrder);
        uni.setStorageSync('shopCarItem', this.selectOrders);
        uni.navigateTo({
          url: `/pages/pre-order/pre-order?id=${time}`
        })
      });

    }
  }
}
</script>
<style lang="scss" scoped>
@import 'shopcar.scss';
</style>