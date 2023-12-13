<template>
  <view class="gauss-blur-canvas-box">
    <canvas 
      id="gauss-blur-canvas" 
      canvas-id="gauss-blur-canvas"
      class="gauss-blur" 
      type="2d"
      :style="{'width': width + 'px', 'height' : height + 'px'}"></canvas>
    <canvas 
      id="gauss-blur-canvas-ios" 
      canvas-id="gauss-blur-canvas-ios"
      class="gauss-blur" 
      :style="{'width': width + 'px', 'height' : height + 'px'}"></canvas>
  </view>
</template>

<script>
  export default {
    data() {
      return {
        // 平台，ios端需要使用旧接口，2d接口转图会有问题
        platform: "ios",
        // 压缩后最终返回的图片数据
        imageData: null,
        // 预期的图片宽度
        width: 375,
        // 预期的图片宽度
        height: 375
      }
    },
    mounted() {
      uni.getSystemInfo({
        success: (res) => {
          if (res.errMsg == "getSystemInfo:ok") {
            let systemInfo = res;
            // #ifdef MP-WEIXIN
            // 只有微信小程序分开手机系统渲染，因为有bug
            this.platform = systemInfo.platform;
            // #endif
            // #ifndef MP-WEIXIN
            // 不是微信的都按ios方案处理，webgl方案
            this.platform = 'ios';
            // #endif
          }
        }
      });
    },
    methods: {
      /**
       * @param img 图片数据
       * @param radius 模糊半径 {Int}
       * @return 高斯模糊处理后的图片数据
       */
      gaussBlur(img, radius) {
        let pixes = new Uint8ClampedArray(img.data); //图像像素点数据，一维数组，每四项表示一个像素点的 rgba
        const width = img.width;
        const height = img.height;
        let gaussMatrix = [], //权重矩阵
          gaussSum, //权重总和，以让高斯权重矩阵的权重和为0
          x, y,
          r, g, b, a,
          i, j, k,
          w;

        radius = Math.floor(radius);
        const sigma = radius;

        a = 1 / (Math.sqrt(2 * Math.PI) * sigma);
        b = -1 / (2 * sigma * sigma);

        //生成权重矩阵
        for (i = -radius; i <= radius; i++) {
          gaussMatrix.push(a * Math.exp(b * i * i));
        }

        //x 方向一维高斯运算
        for (y = 0; y < height; y++) {
          for (x = 0; x < width; x++) {
            r = g = b = a = gaussSum = 0;
            for (j = -radius; j <= radius; j++) {
              k = x + j;
              if (k >= 0 && k < width) {
                i = (y * width + k) * 4;
                w = gaussMatrix[j + radius];

                r += pixes[i] * w;
                g += pixes[i + 1] * w;
                b += pixes[i + 2] * w;
                a += pixes[i + 3] * w;

                gaussSum += w;
              }
            }

            i = (y * width + x) * 4;
            //计算加权均值
            img.data.set([r, g, b, a].map(v => v / gaussSum), i);
          }
        }

        pixes.set(img.data);

        //y 方向一维高斯运算
        for (x = 0; x < width; x++) {
          for (y = 0; y < height; y++) {
            r = g = b = a = gaussSum = 0;
            for (j = -radius; j <= radius; j++) {
              k = y + j;

              if (k >= 0 && k < height) {
                i = (k * width + x) * 4;
                w = gaussMatrix[j + radius];

                r += pixes[i] * w;
                g += pixes[i + 1] * w;
                b += pixes[i + 2] * w;
                a += pixes[i + 3] * w;

                gaussSum += w;
              }
            }
            i = (y * width + x) * 4;
            img.data.set([r, g, b, a].map(v => v / gaussSum), i);
          }
        }

        return img;
      },

      /**
       * 实际调用方法，根据平台选择不同方式
       * @param img 图片数据
       * @param r 模糊半径，数值越大越糊
       * @param w 图片尺寸，如不传则使用图片本身尺寸
       * @param h 图片尺寸，同上
       */
      blur(img, r, w, h) {
        return new Promise((resolve, reject) => {
          if (this.platform != "ios") {
            this.blurNotIOS(img, r, w, h).then(img => {
              resolve(img);
            }).catch(err => {
              reject(err)
            });
          } else {
            this.blurIOS(img, r, w, h).then(img => {
              resolve(img);
            }).catch(err => {
              reject(err)
            });
          }
        })
      },
      /**
       * @param img 图片数据
       * @param r 模糊半径，数值越大越糊
       * @param w 图片尺寸，如不传则使用图片本身尺寸
       * @param h 图片尺寸，同上
       */
      blurNotIOS(img, r, w, h) {
        return new Promise((resolve, reject) => {
          let scaleImg = null;  //压缩处理后的图片数据
          
          //如果不输入宽高，默认取图片宽高
          if(!w || !h) {
            this.width = img.width, this.height = img.height;
          } else {
            this.width = w, this.height = h;
          }

          const query = uni.createSelectorQuery().in(this);
          query
            .select("#gauss-blur-canvas")
            .fields({
              id: true,
              node: true,
              size: true,
            })
            .exec((res) => {
              const canvas = res[0].node;
              
              //因为懒, 就全Try了, 实际上只 Try跨域错误 即可
              try {
                //设置Canvas宽高,获取上下文
                canvas.width = w;
                canvas.height = h;
                let ctx = canvas.getContext('2d');

                ctx.drawImage(img, 0, 0, w, h);

                //提取图片信息
                let d = ctx.getImageData(0, 0, w, h);
                //进行高斯模糊
                let gd = this.gaussBlur(d, r, 0);

                //绘制模糊图像
                ctx.putImageData(gd, 0, 0);

                // 如果只是需要base64，解开下面的注释
                // resolve(canvas.toDataURL());

                // 返回小程序环境下的缓存地址
                uni.canvasToTempFilePath({
                  canvas: canvas,
                  fileType: "jpg",
                  success: (res) => {
                    resolve(res.tempFilePath);
                  },
                  fail: (err) => {
                    throw err;
                  },
                }, this);
                
              } catch (err) {
                reject(err);
              }
              scaleImg = img;
            })

        })
      },

      /**
       * @param img 图片数据
       * @param r 模糊半径，数值越大越糊
       * @param w 图片尺寸，如不传则使用图片本身尺寸
       * @param h 图片尺寸，同上
       */
      blurIOS(img, r, w, h) {
        return new Promise((resolve, reject) => {
          let scaleImg = null;  //压缩处理后的图片数据
          
          //如果不输入宽高，默认取图片宽高
          if(!w || !h) {
            this.width = img.width, this.height = img.height;
          } else {
            this.width = w, this.height = h;
          }
          
          try {
            let ctx = uni.createCanvasContext("gauss-blur-canvas-ios", this);
            ctx.drawImage(img, 0, 0, this.width, this.height); //渲染产品图
            
            ctx.draw(false, () => {
              // 第一次渲染，然后获取画布的像素数据
              uni.canvasGetImageData({
                canvasId: 'gauss-blur-canvas-ios',
                x: 0,
                y: 0,
                width: this.width,
                height: this.height,
                success: res => {
                  let d = res;
                  let gd = this.gaussBlur(d, r, 0);
                  // 将高斯模糊处理后的数据重新扔进画布渲染
                  uni.canvasPutImageData({
                    canvasId: 'gauss-blur-canvas-ios',
                    x: 0,
                    y: 0,
                    width: this.width,
                    height: this.height,
                    data: gd.data,
                    success: (res) => {
                      // 渲染
                      try {
                        // 返回小程序环境下的缓存地址
                        uni.canvasToTempFilePath({
                          canvasId: "gauss-blur-canvas-ios",
                          fileType: "jpg",
                          success: (res) => {
                            resolve(res.tempFilePath);
                          },
                          fail: (err) => {
                            console.log(err);
                            throw err;
                          },
                        }, this);
                      } catch(err) {
                        reject(err);
                      }
                      
                    },
                    fail(err) {
                      throw err;
                    }
                  }, this);
                  
                },
                fail(err) {
                  throw err;
                }
              }, this)

            });
            
          } catch (err) {
            reject(err);
          }
        })

      }

    }
  }
</script>

<style>
  .gauss-blur-canvas-box {
    position: fixed;
    top: 0;
    /*不让出现*/
    left: 101vw;
  }
  .gauss-blur {
    display: block;
  }
</style>