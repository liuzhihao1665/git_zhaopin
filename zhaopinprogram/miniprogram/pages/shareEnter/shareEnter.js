//分享和简历入口
const app = getApp()
const moment = require('moment');
Page({
  data: {
    avatarUrl: './user-unlogin.png',
    userInfo: {},
    logged: false,
    takeSession: false,
    requestResult: '',
    imageurl: '',
    parentID: '',
    resumeInfo: {},
    canvasStyle: {
      width: "375px",
      height: "1px"
    },
    bgurl: "./img/bg.png"
  },

  onLoad: function (options) {
    if (!wx.cloud) {
      wx.redirectTo({
        url: '../chooseLib/chooseLib',
      })
      return
    }
    if (decodeURIComponent(options.scene)){
    this._id = decodeURIComponent(options.scene);
    getApp().globalData.codeParam = this._id;
    wx.cloud.callFunction({
      name:'access_token',
      success:res=>{
        console.log(res)
      }
    })
    }
  },

  OngetUserInfo: function (e) {
    if(this._id=='undefined'){
      wx.showToast({
        title: '获取二维码信息失败',
        icon:'none'
      })
      return false
    }
    wx.getUserInfo({
      withCredentials: true,
      success: res => {
        wx.login({
          complete: result => {
            if (result.code) {
              let options={}
              Object.assign(options,res,result)
              wx.cloud.callFunction({
                name: 'getPhoneNum',
                data: {
                  options:options
                  },
                success:res=>{
                  // console.log(res)
                },
                fail:err=>{
                  console.log(err)
                },
                complete:res=>{
                  console.log(res)
                }
              })
            }
          }
        })
      }
    })
    // return false
    wx.showToast({
      title: '生成时间较长，请耐心等待...',
      icon:'none',
      duration:10000
    })
    if (!this.logged && e.detail.userInfo) {
      // 
      this.userInfo = e.detail.userInfo;
      this.setData({
        logged: true,
        avatarUrl: e.detail.userInfo.avatarUrl,
        userInfo: e.detail.userInfo
      })
      const db = wx.cloud.database();
      wx.cloud.callFunction({
        name: 'login',
        data: {}
      }).then(res => {
        this.openid = res.result.openid;
        db.collection('sharer').where({
          _id: this._id
        }).get().then(res => {
          this.parentID = res.data[0].shareID
          //获取分享扫描的二位码中的职位id
          this.jobID = res.data[0].jobID;
          if (res.data[0].shareID == this.openid) {
            wx.hideToast()
            wx.showModal({
              title: '提示框',
              content: '分享者不能识别自己分享的二维码',
            })
            throw new Error('error')
          }
          if (res.data.length > 0) {
            //审核当前用户是否分享过当前职位
            db.collection('sharer').where({
              jobID: this.jobID,
              shareID: this.openid
            }).get().then(res => {
              let _res = res;
              if (res.data.length > 0) {
                wx.hideToast()
                wx.showModal({
                  title: '警告框',
                  content: '您已分享过该职位，之后分享以第一次为准，是否继续分享',
                  cancelText: '否',
                  confirmText: '是',
                  success: res => {
                    if (res.confirm) {
                      this.id = _res.data[0]._id;
                      this.second_share = true
                      this.onCreateCanvas()
                      wx.showToast({
                        title: '生成时间较长，请耐心等待...',
                        icon: 'none',
                        duration:5000
                      })
                    }
                  }
                })
              } else {
                //未分享过，获取当前分享者当前职位的唯一分享id
                const db = wx.cloud.database();
                db.collection('sharer').add({
                  data: {
                    parentID: null,
                    shareID: this.openid,
                    jobID: null
                  }
                }).then(res => {
                  if (res.errMsg.includes('ok')) {
                    this.id = res._id;
                    this.onCreateCanvas()
                  } else {
                    throw new Error('分享失败')
                  }


                })
              }
            })
          }
        })
      }).catch(err => {
        console.log(1)
        console.log(err)
        wx.showToast({
          title: 'err',
        })
      })
    }
  },
  //生成海报
  onCreateCanvas: function () {
    console.log('11111s')
    //获取背景图路径
    const db = wx.cloud.database()
    const manger = wx.getFileSystemManager();
    db.collection('job').where({
      _id: this.jobID
    }).get().then(res => {
      // 
      if (res.data.length > 0) {
        console.log(1234564)
        this.bgImg = res.data[0].picId;
        const imgurl = res.data[0].picId
        return wx.cloud.downloadFile({
          fileID: imgurl
        })
      } else {
        throw new Error('二维码生成失败')
      }
    }).then(res => {
      // 
      this.bgImg = res.tempFilePath
      // this.setData({
      //   imageurl: res.tempFilePath
      // })
      return this.OngetAcode(this._id)
    }).then(res => {
      // 
      this.acodeUrl = res;
      // this.setData({
      //   imageurl: res
      // })
      db.collection('job').where({
        _id: this.jobID
      }).get().then(res => {
        if (res.data.length > 0) {
          this.resumeInfo = res.data[0];
          this.sharePosteCanvas()
          // var query = wx.createSelectorQuery()
          // query.select('#testCanvas').boundingClientRect((res) => {
          //   this.drawImages(res)
          // }).exec()
        } else {
          throw new Error('网络连接失败')
        }
      })
    }).catch(err => {
      console.log(err)
      wx.showToast({
        title: 'err',
      })
    })
  },
  //绘制canvas生产海报
  sharePosteCanvas: function () {
    let that = this;
    let ctx;
    var width, height, rate;
    var query = wx.createSelectorQuery();
    wx.getSystemInfo({
      success(res) {
        that.pixelRatio = res.pixelRatio;
        query.select('#testCanvas').boundingClientRect(function (rect) {
          // 
          rate = res.screenWidth / 750;
          let yrate = res.screenHeight / 1334;
          width = res.screenWidth;
          height = res.screenHeight;
          console.log(height)
          that.setData({
            "canvasStyle.height": height + "px",
            "canvasStyle.width": width + "px"
          });
          ctx = wx.createCanvasContext('testCanvas');
          var left = 0;
          ctx.setFillStyle('#fff');
          ctx.fillRect(0, 0, width, height);
          let x = 62 * rate;
          //底图
          if (that.resumeInfo.picUrl) {
            ctx.drawImage(that.bgImg, left, 0, width, height);
            ctx.setFontSize(14);
            ctx.setFillStyle('#fff');
            ctx.setTextAlign('left');
          }

          //用户头像，用户名
          if (that.userInfo) {
            //真实环境放开
            wx.downloadFile({
              url: that.userInfo.avatarUrl,
              success: function (res) {
                let y = 70 * rate;
                ctx.drawImage(res.tempFilePath, x, y - 20 * rate, 40 * rate, 40 * rate);
                // ctx.setFontSize(30 * rate);
                // ctx.setFillStyle('#fff');
                // ctx.setTextAlign('left');
                // ctx.textAlign = "start";
                // ctx.fillText(that.userInfo.nickName, 40 * rate + x, y + 15 * rate); //昵称
              },
              fail: function (err) {
                console.log(err)
              }
            })
            let y = 70 * rate;
            ctx.setFontSize(30 * rate);
            ctx.setFillStyle('#fff');
            ctx.setTextAlign('left');
            ctx.textAlign = "start";
            ctx.fillText(that.userInfo.nickName, 40 * rate + x, y + 15 * rate); //昵称

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
          if (that.resumeInfo.jobName) {
            ctx.setFontSize(34 * rate);
            ctx.setFillStyle('#fff');
            ctx.setTextAlign('left');
            ctx.fillText(that.resumeInfo.jobName, twoX, 334 * yrate, width); //职位名
            //TODO绘制岗位职责底下方块

          }
          ctx.setFontSize(32 * rate);
          ctx.fillText("岗位职责", twoX, 382 * yrate, width);
          //岗位职责描述
          let lastTop;
          if (that.resumeInfo.detail) {
            ctx.setFontSize(30 * rate);
            ctx.setFillStyle('#fff');
            ctx.setTextAlign('left');
            const CONTENT_ROW_LENGTH = 42; // 正文 单行显示字符长度
            let arr = that.resumeInfo.detail.split("；");
            let len = arr.length;
            lastTop = 430 * yrate;
            for (let i = 0; i < len; i++) {
              let [contentLeng, contentArray, contentRows] = that.textByteLength(arr[i], CONTENT_ROW_LENGTH);
              for (let m = 0; m < contentArray.length; m++) {
                ctx.fillText(contentArray[m], twoX, lastTop + m * 40 * yrate, width);
              }
              lastTop = (lastTop + contentArray.length * 42 * yrate);
            }
            lastTop -= 42 * yrate;
            ctx.setFontSize(32 * rate);
            ctx.fillText("岗位要求", twoX, lastTop, width);
          }

          //岗位要求
          if (that.resumeInfo.requirement) {
            lastTop += 54 * yrate;
            ctx.setFontSize(30 * rate);
            ctx.setFillStyle('#fff');
            ctx.setTextAlign('left');
            const CONTENT_ROW_LENGTH = 42; // 正文 单行显示字符长度
            let arr = that.resumeInfo.requirement.split("；");
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
          ctx.drawImage(that.acodeUrl, width / 2 - 162 * rate / 2, height - 141, 162 * rate, 162 * rate);
          setTimeout(function () {
            ctx.draw(); //这里有个需要注意就是，这个方法是在绘制完成之后在调用，不然容易其它被覆盖。
            let width1 = width * that.pixelRatio;
            let height1 = height * that.pixelRatio;
            console.log(width1 + '---' + height1)
            setTimeout(function () {
              wx.canvasToTempFilePath({
                canvasId: 'testCanvas',
                width: width,
                height: height,
                destWidth: width1,
                destHeight: height1,
                success: function (res) {
                  wx.hideToast();
                  var tempFilePath = res.tempFilePath;
                  // 
                  that.setData({
                    "canvasStyle.width": "0px"
                  })
                  wx.saveImageToPhotosAlbum({
                    filePath: tempFilePath,
                    success(res) {
                      if (!that.second_share) {
                        let db = wx.cloud.database();
                        // 
                        db.collection('sharer').doc(that.id).update({
                          data: {
                            parentID: that.parentID,
                            shareID: that.openid,
                            jobID: that.jobID,
                            updateTime: moment().valueOf()
                          },
                          fail: err => {
                            wx.showToast({
                              title: '数据库更新失败',
                            })
                          },
                          success: res => {
                            console.log(res)
                          }
                        })
                      }
                      wx.showModal({
                        content: '图片已保存到相册，赶紧晒一下吧~',
                        showCancel: false,
                        confirmText: '好的',
                        confirmColor: '#333',
                        success: function (res) {
                          if (res.confirm) { }
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
                },
                fail: err => {
                  console.log(err)
                  wx.showModal({
                    content: '抱歉，分享失败，请再试一次',
                    showCancel: false,
                    confirmText: '好的',
                    confirmColor: '#333',
                    success: function (res) {
                      that.setData({
                        model: {
                          isShow: false
                        }
                      })
                    },
                    fail: function (res) { }
                  })
                }
              });
            }, 1000)
          }, 1000)
        }).exec()
      }
    })
  },

  //获取二维码
  OngetAcode: function (id) {
    return new Promise((resolve, rej) => {
      // 
      wx.cloud.callFunction({
        name: 'createCode',
        data: {
          scene: id,
          width: 150,
          page: 'pages/shareEnter/shareEnter'
        },
        success: res => {
          if (res.result == null) {
            wx.showToast({
              title: '二维码生成失败',
            })
            // throw new Error('二维码生成失败')
          } else {
            const manger = wx.getFileSystemManager();
            let picName = wx.env.USER_DATA_PATH + '/codeUrl' + new Date().getTime() + this.openid + '.png';
            manger.writeFile({
              //wx.env.USER_DATA_PATH 本地路径
              filePath: picName,
              data: res.result,
              encoding: 'binary',
              success: res => {
                if (res.errMsg.includes('writeFile:ok')) {
                  resolve(picName)
                } else {
                  throw new Error('error')
                }
              },
              fail: err => {
                console.log(err)
                rej(err.errMsg)
              }
            })
          }
        },
        fail: err => {
          console.log(2)
          wx.showToast({
            title: 'err',
          })
        }
      })
    })
  },
  //把二维码放职位海报上
  drawImages: function (e) {
    // 
    const db = wx.cloud.database();
    db.collection('job').where({
      _id: this.jobID
    }).get().then(res => {
      if (res.data > 0) {
        this.setData({
          resumeInfo: res.data[0]
        })
      } else {
        throw new Error('网络连接失败')
      }
    }).catch(err => {
      wx.showToast({
        title: 'err',
      })
    })
    let that = this;
    let ctx = wx.createCanvasContext('testCanvas', this);
    let canvasw = e.width;
    let canvash = e.height;
    ctx.drawImage(this.bgImg, 0, 0, canvasw, canvash)
    let ww = 300 * wx.getSystemInfoSync().pixelRatio;
    let wh = 300 * wx.getSystemInfoSync().pixelRatio;
    ctx.drawImage(this.acodeUrl, 0, 0, ww, wh, 0, 0)
    ctx.save()
    setTimeout(() => {
      ctx.draw()
      wx.canvasToTempFilePath({
        canvasId: 'testCanvas',
        x: 0,
        y: 0,
        width: canvasw,
        height: canvash,
        destWidth: canvasw,
        destHeight: canvash,
        success: (res) => {
          // that.setData({
          //   imageurl: res.tempFilePath
          // })
          const manger = wx.getFileSystemManager();
          manger.removeSavedFile({
            filePath: this.acodeUrl,
            success: res => {
              console.log('二维码删除成功')
            },
            fail: err => {
              console.error(err)
            }
          })
          console.log(res)
        },
        fail: err => {
          console.log(err)
        }
      })
    }, 200)

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

  onCreatecode: function () {
    wx.navigateTo({
      url: '../resumeEnter/resumeEnter',
    })
    // let access_token = wx.cloud.callFunction({
    //   name: 'access_token'
    //   , success: res => {

    //     console.log(res)
    //   }
    // })
  }

})