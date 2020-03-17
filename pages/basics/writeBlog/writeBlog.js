var app = getApp()
const request = require('../../../utils/request.js');
import WxValidate from "../../../utils/WxValidate.js"

Page({

  /**
   * 页面的初始数据
   */
  data: {
    StatusBar: app.globalData.StatusBar,
    CustomBar: app.globalData.CustomBar,
    Custom: app.globalData.Custom,
    category:['1','2','3'],
    index: 0,
    imgList: [],

    
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.initValidate();// 初始化表单验证规则
    var url = app.globalData.url+'/wx/loadCategoryName'
    var token = app.globalData.token
    var param = {}
    request.requestGetApi(url,token,param,this,this.successCategory,this.failCategory)
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },
  // 底部框
  PickerChange(e) {
    // console.log(e);
    this.setData({
      index: e.detail.value
    })
  },
  // 图片的选择
  ChooseImage() {
    wx.chooseImage({
      count: 1, //默认9
      sizeType: ['original', 'compressed'], //可以指定是原图还是压缩图，默认二者都有
      sourceType: ['album'], //从相册选择
      success: (res) => {
        if (this.data.imgList.length != 0) {
          this.setData({
            imgList: this.data.imgList.concat(res.tempFilePaths)
          })
        } else {
          this.setData({
            imgList: res.tempFilePaths
          })
        }
      }
    });
  },
  ViewImage(e) {
    wx.previewImage({
      urls: this.data.imgList,
      current: e.currentTarget.dataset.url
    });
  },
  DelImg(e) {
    wx.showModal({
      title: '用户',
      content: '确定要删除这图片吗？',
      cancelText: '再看看',
      confirmText: '再见',
      success: res => {
        if (res.confirm) {
          this.data.imgList.splice(e.currentTarget.dataset.index, 1);
          this.setData({
            imgList: this.data.imgList
          })
        }
      }
    })
  },
  formSubmit(e){
    // console.log('form发生了submit事件，提交数据：',)
    let  form =  e.detail.value
    if (!this.WxValidate.checkForm(form)) {
      //表单元素验证不通过，此处给出相应提示
        let error = this.WxValidate.errorList[0];
        wx.showToast({
          title: `${error.msg} `,
          icon: 'none'
      })
      return false;

    }
        
    // form['openId'] = app.globalData.openId
    // var url = app.globalData.url+'/wx/addArticle'
    var token = app.globalData.token
    // request.requestPostApi(url,token,form,this,this.successAdd,this.failAdd)
    var img = wx.getStorageSync('img')
    wx.uploadFile({
      url: app.globalData.url+'/wx/uploadPicture',
      filePath: this.data.imgList[0],
      name: 'img',
      header: {
        'content-type': 'application/json',
        'W-TOKEN':token
       },
      formData: {
     
      },
      success: function (res) {
       console.log(res)
      }
     })
  },
  initValidate() {
    let rules = {
      title: {
        required: true,
        maxlength: 10
      }
      // ,
      // sex: {
      //   required: true,
      //   number: true
      // }
      // ,
      // birthDate: {
      //   required: true,
      //   dateISO: true,
      // }, 
      // Card: {
      //   required: false,
      //   idcard: true
      // }
    }

    let message = {
      title: {
        required: '请输入标题',
        maxlength: '标题不能超过10个字'
      }
      // ,
      // Card: {
      //   idcard: "请输入正确的身份证号码"
      // },
      // sex: {
      //   required: "请选择您的性别",
      //   number: '请您选择您的性别'
      // }
      // ,
      // birthDate: {
      //   required: "请选择出生年月",
      //   dateISO: "请选择出生年月",
      // },
    }
    //实例化当前的验证规则和提示消息
    this.WxValidate = new WxValidate(rules, message);
  },
  successCategory(res){
    // console.log(res)
    this.setData({
      category:res.data,
      // index: res.data.
    })
  },
  failCategory(res){
    console.log('failCategory')
  },
  successAdd(res){
    console.log(res)
  },
  failAdd(res){
    console.log('failAdd')
  }
})