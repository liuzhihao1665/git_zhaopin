//生产分享页面
const moment = require('moment');
Page({
  data: {
    avatarUrl: "", //app.globalData.userInfo.avatarUrl
    userInfo: "", //app.globalData.userInfo
    logged: false,
    takeSession: false,
    requestResult: '',
    resumeInfo: {
      "company": "XXXXXXXXXX公司",
      "resumeName": "机房运维工程师",
      "salary": "13-30K",
      "location": "南京", 
      "introduction": `1、IDC机房值守，接受机房规范培训；2、设备信息登记，设备变更记录，配合厂商做好设备故障的处理工作；3、做好机房巡视、报表反馈、应急处理等工作；4、撰写IDC巡检报告，定期汇报机房设备运行情况`,
      "requirement": `1)  第一时间工作响应，7*24工作保障，保证客户设备运行正常；2)  熟悉主流硬件产品，包括但不限于防火墙、交换机、路由器、服务器、存储，对硬件故障能快速定位，同时配合厂商做好排障工作；3） 熟悉IDC工作流程，对综合布线、设备变更、技术支持等工作了解，懂服务器上下架；4)  本科学历，3-5年工作经验，计算机相关专业毕业`,
      "picId": "",
      "picUrl": "",
      "codeId": "",
      "codeUrl": "",
      "updateTime": ""
    },
    src: "./img/tuceng.png",
    canvasStyle: {
      width: "375px",
      height: "1px"
    },
    db: {},
    pixelRatio: 2
  },
  companyFun: function(event) {
    this.setData({
      "resumeInfo.company": event.detail.value
    })
  },
  resumeNameFun: function(event) {
    this.setData({
      "resumeInfo.resumeName": event.detail.value
    })
  },
  salaryFun: function(event) {
    this.setData({
      "resumeInfo.salary": event.detail.value
    })
  },
  locationFun: function(event) {
    this.setData({
      "resumeInfo.location": event.detail.value
    })
  },
  requirementFun: function(event) {
    this.setData({
      "resumeInfo.requirement": event.detail.value
    })
  },
  introductionFun: function(event) {
    this.setData({
      "resumeInfo.introduction": event.detail.value
    })
  },
  //onShow
  onLoad: function() {
    
    let that = this;
    this.app = getApp();
    wx.getSystemInfo({
      success(res) {
        that.setData({
          "pixelRatio": res.pixelRatio
        })
        console.log(typeof res.pixelRatio)
      }
    })
    this.setData({
      logged: true,
      avatarUrl: this.app.globalData.userInfo.avatarUrl,
      userInfo: this.app.globalData.userInfo
    })

  },

  // 上传图片
  doUpload: function() {
    
    let that = this;
    // 选择图片
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: function(res) {
        
        wx.showLoading({
          title: '上传中',
        })
        const filePath = res.tempFilePaths[0];
        // 上传图片
        const cloudPath = 'my-image' +(new Date()).getTime()+ filePath.match(/\.[^.]+?$/)[0];
        wx.cloud.uploadFile({
          cloudPath,
          filePath,
          success: res => {
            
            console.log('[上传文件] 成功：', res);
            that.app.globalData.fileID = res.fileID;
            that.app.globalData.cloudPath = cloudPath;
            that.app.globalData.imagePath = filePath;
            that.setData({
              "resumeInfo.picId": res.fileID
            })
            wx.cloud.getTempFileURL({
              fileList: [res.fileID],
              success: res => {
                that.setData({
                  "src": res.fileList[0].tempFileURL
                })
              },
              fail: err => {
                // handle error
              }
            })
          },
          fail: e => {
            console.error('[上传文件] 失败：', e)
            wx.showToast({
              icon: 'none',
              title: '上传失败',
            })
          },
          complete: () => {
            wx.hideLoading()
          }
        })

      },
      fail: e => {
        console.error(e)
      }
    })
  },
  //根据图片id获取图片
  getAvaterInfo: function() { //图片id
    
    let that = this;
    wx.showLoading({
      title: '生成中...',
      mask: true,
    });
    wx.cloud.downloadFile({
      fileID: that.data.resumeInfo.picId,
      success: function(res) {
        if (res.statusCode === 200) {
          //海报底图url
          that.setData({
            "src": res.tempFilePath,
            "resumeInfo.picUrl": res.tempFilePath
          })
          //绘制canvas
          that.saveShareImg();
        } else {
          wx.showToast({
            title: '底图下载失败！',
            icon: 'none',
            duration: 2000,
            success: function() {
              // that.getQrCode(avaterSrc = "", cardInfo);//回调另一个图片下载
            }
          })
        }
      }
    })
  },
  //绘制canvas生产海报
  sharePosteCanvas: function(codeUrl) {
    let that = this;
    let ctx;
    var width, height, rate;
    var query = wx.createSelectorQuery();
    wx.getSystemInfo({
      success(res) {
        query.select('#container').boundingClientRect(function(rect) {
          
          rate = res.screenWidth / 750;
          let yrate = res.screenHeight / 1334;
          width = res.screenWidth;
          height = res.screenHeight;
          console.log(height)
          that.setData({
            "canvasStyle.height": height + "px",
            "canvasStyle.width": width + "px"
          });
          ctx = wx.createCanvasContext('myCanvas');
          var left = 0;
          ctx.setFillStyle('#fff');
          ctx.fillRect(0, 0, width, height);
          let x = 62 * rate;
          //底图
          if (that.data.resumeInfo.picUrl) {
            ctx.drawImage(that.data.resumeInfo.picUrl, left, 0, width, height);
            ctx.setFontSize(14);
            ctx.setFillStyle('#fff');
            ctx.setTextAlign('left');
          }
          debugger;
          //用户头像，用户名
          if (that.data.userInfo) {
            //真实环境放开
            wx.downloadFile({
              url: that.data.userInfo.avatarUrl,
              success: function(res) {
                let y = 70 * rate;
                // ctx.drawImage(res.tempFilePath, x, y - 20 * rate, 40 * rate, 40 * rate);
                ctx.save();
                ctx.beginPath(); //开始绘制
                //先画个圆   前两个参数确定了圆心 （x,y） 坐标  第三个参数是圆的半径  四参数是绘图方向  默认是false，即顺时针
                ctx.arc(40 * rate / 2 + x, 40 * rate / 2 + y - 20 * rate, 40 * rate / 2, 0, Math.PI * 2, false);
                ctx.clip(); //画好了圆 剪切  原始画布中剪切任意形状和尺寸。一旦剪切了某个区域，则所有之后的绘图都会被限制在被剪切的区域内 这也是我们要save上下文的原因
                ctx.drawImage(res.tempFilePath, x, y - 20 * rate, 40 * rate, 40 * rate); // 推进去图片，必须是https图片
                ctx.restore(); //恢复之前保存的绘图上下文 恢复之前保存的绘图上下午即状态 还可以继续绘制
                
                ctx.setFontSize(30 * rate);
                ctx.setFillStyle('#fff');
                ctx.setTextAlign('left');
                ctx.textAlign = "start";
                ctx.fillText(that.data.userInfo.nickName, 40 * rate + x, y + 15 * rate); //昵称
              },
              fail: function(fres) {

              }
            })

            //真实环境关闭
            // let y = 70 * rate;
            // ctx.drawImage(that.data.userInfo.avatarUrl, x, y - 20 * rate, 40 * rate, 40 * rate);
            // ctx.setFontSize(30 * rate);
            // ctx.setFillStyle('#fff');
            // ctx.setTextAlign('left');
            // ctx.textAlign = "start";
            // ctx.fillText(that.data.userInfo.nickName, 40 * rate + x, y + 15 * rate); //昵称
          }
          let twoX = 68 * rate; //二级距离
          if (that.data.resumeInfo.resumeName) {
            ctx.setFontSize(34 * rate);
            ctx.setFillStyle('#fff');
            ctx.setTextAlign('left');
            ctx.fillText(that.data.resumeInfo.resumeName, twoX, 334 * yrate, width); //职位名
            //TODO绘制岗位职责底下方块

          }
          ctx.setFontSize(32 * rate);
          ctx.fillText("岗位职责", twoX, 382 * yrate, width);
          //岗位职责描述
          let lastTop;
          if (that.data.resumeInfo.introduction) {
            ctx.setFontSize(30 * rate);
            ctx.setFillStyle('#fff');
            ctx.setTextAlign('left');
            const CONTENT_ROW_LENGTH = 42; // 正文 单行显示字符长度
            let arr = that.data.resumeInfo.introduction.split("；");
            let len = arr.length;
            lastTop = 430 * yrate;
            for (let i = 0; i < len; i++) {
              let [contentLeng, contentArray, contentRows] = that.textByteLength(arr[i], CONTENT_ROW_LENGTH);
              for (let m = 0; m < contentArray.length; m++) {
                ctx.fillText(contentArray[m], twoX, lastTop + m * 40 * yrate, width);
              }
              lastTop = (lastTop + contentArray.length * 42 * yrate);
            }
            // lastTop -= 42 * yrate;
            ctx.setFontSize(32 * rate);
          }
          ctx.fillText("岗位要求", twoX, lastTop, width);

          //岗位要求
          if (that.data.resumeInfo.requirement) {
            lastTop += 54 * yrate;
            ctx.setFontSize(30 * rate);
            ctx.setFillStyle('#fff');
            ctx.setTextAlign('left');
            const CONTENT_ROW_LENGTH = 42; // 正文 单行显示字符长度
            let arr = that.data.resumeInfo.requirement.split("；");
            let len = arr.length;
            for (let i = 0; i < len; i++) {
              let [contentLeng, contentArray, contentRows] = that.textByteLength(arr[i], CONTENT_ROW_LENGTH);
              for (let m = 0; m < contentArray.length; m++) {
                ctx.fillText(contentArray[m], twoX, lastTop + m * 40 * rate, width);
              }
              lastTop = (lastTop + contentArray.length * 40 * rate);
            }
          }
          //绘制二维码
          ctx.drawImage(codeUrl, width / 2 - 162 * rate / 2, height - 141, 162 * rate, 162 * rate);
          setTimeout(function () {
            ctx.draw(); //这里有个需要注意就是，这个方法是在绘制完成之后在调用，不然容易其它被覆盖。
            wx.hideLoading();
            let width1 = width * that.data.pixelRatio;
            let height1 = height * that.data.pixelRatio;
            console.log(width1 + '---' + height1)
            setTimeout(function () {
              wx.canvasToTempFilePath({
                canvasId: 'myCanvas',
                width: width,
                height: height,
                destWidth: width1,
                destHeight: height1,
                success: function (res) {
                  wx.hideLoading();
                  var tempFilePath = res.tempFilePath;
                  wx.saveImageToPhotosAlbum({
                    filePath: tempFilePath,
                    success(res) {
                      wx.showModal({
                        content: '图片已保存到相册，赶紧晒一下吧~',
                        showCancel: false,
                        confirmText: '好的',
                        confirmColor: '#333',
                        success: function (res) {
                          that.setData({
                            "canvasStyle.height": 0 + "px",
                            "canvasStyle.width": 0 + "px"
                          });
                        },
                        fail: function (res) { }
                      })
                    },
                    fail: function (res) {
                      wx.showToast({
                        title: res.errMsg,
                        icon: 'none',
                        duration: 2000
                      })
                    }
                  })
                }
              });
            }, 1000)
          }, 1000)
        }).exec()
      }
    })
  },
  textByteLength(text, num) { // text为传入的文本  num为单行显示的字节长度
    let strLength = 0; // text byte length
    let rows = 1;
    let str = 0;
    let arr = [];
    for (let j = 0; j < text.length; j++) {
      if (text.charCodeAt(j) > 255) {
        strLength += 2;
        if (strLength > rows * num) {
          strLength++;
          arr.push(text.slice(str, j));
          str = j;
          rows++;
        }
      } else {
        strLength++;
        if (strLength > rows * num) {
          arr.push(text.slice(str, j));
          str = j;
          rows++;
        }
      }
    }
    arr.push(text.slice(str, text.length));
    return [strLength, arr, rows] //  [处理文字的总字节长度，每行显示内容的数组，行数]
  },
  //点击保存到相册
  saveShareImg: function(ctx) {
    // ctx.draw();
    this.db = wx.cloud.database();
    var that = this;
    wx.showLoading({
      title: '正在保存',
      mask: true,
    })
    //存入数据库
    var nowTime = moment();
    this.db.collection('job').add({
        // data 字段表示需新增的 JSON 数据
        data: {
          company: this.data.resumeInfo.company,
          jobName: this.data.resumeInfo.resumeName,
          salary: this.data.resumeInfo.salary,
          location: this.data.resumeInfo.location,
          requirement: this.data.resumeInfo.requirement,
          detail: this.data.resumeInfo.introduction,
          picId: this.data.resumeInfo.picId,
          picUrl: this.data.resumeInfo.picUrl,
          updateTime: nowTime.valueOf(),
          yearMonthDay: nowTime.format("YYYY-MM-DD"),
          time: nowTime.format("hh:mm")
        }
      })
      .then(res => {
        console.log(res);
        that.db.collection('sharer').add({
          // data 字段表示需新增的 JSON 数据
          data: {
            jobID: res._id,
            shareID: that.app.globalData.userInfo.openid,
            updateTime: new Date().getTime()
          }
        }).then(res => {
          let pro = that.OngetAcode(res._id).then(function(res) {
            
            that.sharePosteCanvas(res);
          }).catch(function(reason) {
            wx.showModal({
              content: '二维码生成失败',
              showCancel: false,
              confirmText: '好的',
              confirmColor: '#333',
              success: function(res) {
                wx.hideLoading();
              },
              fail: function(res) {}
            })
          })
        })
      })
      .catch(console.error)
  },
  //获取二维码

  OngetAcode: function(id) {
    let that = this;
    return new Promise((resolve, rej) => {
      wx.cloud.callFunction({
        name: 'createCode',
        data: {
          scene: id,
          width: 150,
          page: 'pages/shareEnter/shareEnter'
        },
        success: res => {
          
          let manger = wx.getFileSystemManager();
          let picName = new Date().getTime() + that.app.globalData.userInfo.openid;
          manger.writeFile({
            //wx.env.USER_DATA_PATH 本地路径
            filePath: wx.env.USER_DATA_PATH + '/codeUrl' + picName + '.png',
            data: res.result,
            encoding: 'binary',
            success: res => {
              if (res.errMsg.includes('writeFile:ok')) {
                resolve(wx.env.USER_DATA_PATH + '/codeUrl' + picName + '.png')
              } else {
                rej('error')
              }
            },
            fail: err => {
              rej(err)
            }
          })
        },
        fail: err => {
          console.log(2)
          wx.showToast({
            title: '网络异常',
          })
        }
      })
    })
  }
})