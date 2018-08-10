let timeoutDeal = null;
let bidSocket = {
    driverSocket: () => {
        var socket = io('/bidchannel', {transports: ['websocket']});

        socket.on('connect', () => {
            socket.emit('init_channel');
        });

        $('.content').on('click', '.send-bid', function (evt) {
            var post = $(this).closest('.block-post');
            var postId = $(post).attr('id');
            let bid = $(post).find('.driver-bid').val();
            let arrivalTime = $(post).find('.driver-arrival-time').val();
            socket.emit('driverBid', {postId: postId, bid: bid, arrivalTime: arrivalTime});
        });

        socket.on("driverIndexNewPost", data => {
            console.log(data);
            let title = data.user.fullName;
            let message = "Đã đăng bài mới";
            showDialogNotify(message,title,'info');
            showBlockPost(data);
        });

        socket.on('driverIndexError', data => {
            console.log(data);
            bootbox.alert({
                message: data.message,
                size: 'small'
            });
        });

        socket.on('status_to_driver', data => {
            $('.trip-info').text(data.newStatus);
        });

        socket.on('driverIndexSuccess', data => {
            console.log(data);
            $("#"+data.postId+'-best-price').text(data.bestPrice);
        });

        socket.on('adjourn_to_drivers', data => {
            console.log(data)
            if (!data.isHidden) {
                let postId = data.postId;
                $('#' + postId).css('display', 'block');
                $('#' + postId).find('.count-downs-expiredTime').attr('data-await-time', data.expiredTime);
                countDownsBlock(postId);
            }
            ;
        });

        socket.on('chooseUserToDriver', data => {
            console.log(data);
            $('#modal-info').modal('show');
            showChooseModal(data);
            showFooterModal(data);
            countDownProcessDeal(10)

        });

        $('#modal-info').on('click','.confirm_choose_bid',function (evt) {
            let postId= $(this).attr('data-postId');
            let price= $(this).attr('data-price');
            let userId= $(this).attr('data-userId');

            let data = {
                postId: postId,
                bestPirceChoose: price,
                userId: userId
            };
            socket.emit('driverConfirm',data);
            let htmlDeal = '<img src="/images/giphy_2.gif" class="img-responsive" style="height: 200px;width: 100%;">\n';
            $("#modal-info .modal-body").html(htmlDeal);
            $('#modal-info .modal-title').html('Quá trình giao dịch dang diễn ra ...');
            $('#modal-info .modal-footer').empty();
        });

        socket.on("deal_build_error",data=>{
            $("#modal-info").modal('show');
            $("#modal-info .modal-body").html(data.message);
            $('#modal-info .modal-title').html('Thông báo');
        });

        socket.on('deal_build_success',data=>{

            $("#modal-info").modal('show');
            $("#modal-info .modal-body").html(data.message);
            $('#modal-info .modal-title').html('Thông báo');
        });

        $('#modal-info').on('click','.not_choose_poster',function (evt) {
            socket.emit('decline_customer');
            $("#modal-info").modal('hide');
        });

        socket.on('decline_customer_success',data =>{
            if (data.message ==='success'){
                $('#modal-info').modal('hide');
            }
        });

        socket.on('send_request_to_driver',data=>{
            $('#modal-info').modal('show');
            console.log(data);
            showDealBodyModal(data);
            showDealFooterModal(data);
            countDownProcessDeal(10);
            timeoutReal(data.postInfo._id);
        });

        $('#modal-info').on('click','.decline-from-driver',function (evt) {
            let userId = $(this).attr('data-userId');
            socket.emit('decline_from_driver',userId);
            $("#modal-info").modal('hide');
        })

        $('#modal-info').on('click','.driver-send-report',function (evt) {
            let userId = $(this).attr('data-userId');
            let postId = $(this).attr('data-postId');
            socket.emit('driver_send_report',userId, postId);

        });

        socket.on('driver_report_success',data=>{
            $("#modal-info").modal("show");
            $("#modal-info .modal-title").text("Thông báo");
            $("#modal-info .modal-footer").empty();
            showDetailOrder(data.orderNew);
            $("#"+data.postId).remove();
            clearTimeout(timeoutDeal);

        });

        socket.on('reload_driver_activity',message=>{
            $.ajax({
                url:'/drivers/top',
                dataType:'json',
                type:'GET',
                success: function (data) {
                    console.log(data);
                    topDriver(data);
                },
                error: function (err) {
                    console.log(err.responseText);
                }
            })
        });
    }

};

let showUser = (user) => {
    let html = '<div class="user-block">\n' +
        '                                    <img class="img-circle img-bordered-sm" src="' + user.picture + '"\n' +
        '                                         alt="' + user.fullName + '">\n' +
        '                                    <span class="username">\n' +
        '                    <a href="#">' + user.fullName + '</a>\n' +
        '                  </span>\n' +
        '                                    <span class="description">' + user.createAt + '</span>\n' +
        '                                </div>'

    return html;
};

let showPost = (post) => {
    let html = '<p style="text-transform: uppercase; color: #333; font-weight: bold; font-size: 15px; margin-bottom: 15px; margin-top: 10px">\n' +
        '                                    <i class="fa fa-motorcycle" aria-hidden="true"></i>\n' +
        '                                    </i>&nbsp;&nbsp;Lộ trình</p>\n' +
        '                                <table class="table">\n' +
        '                                    <tbody>\n' +
        '                                    <tr style="text-align: center;">\n' +
        '                                        <td>\n' +
        '                                            <span><i class="fa fa-map-marker" aria-hidden="true"></i>\n' +
        '                                              <b>Điểm đi</b>\n' +
        '                                            </span>\n' +
        '                                        </td>\n' +
        '                                        <td><i class="fa fa-arrow-circle-right" aria-hidden="true"></i></td>\n' +
        '                                        <td>\n' +
        '                                            <span><i class="fa fa-map-marker" aria-hidden="true"></i>\n' +
        '                                              <b>Điểm đến</b>\n' +
        '                                            </span>\n' +
        '                                        </td>\n' +
        '                                    </tr>\n' +
        '                                    <tr style="text-align: center;">\n' +
        '\n' +
        '                                        <td>' + post.location + '</td>\n' +
        '                                        <td></td>\n' +
        '                                        <td>' + post.destination + '</td>\n' +
        '                                    </tr>\n' +
        '                                    </tbody>\n' +
        '                                </table>\n' +
        '                                <p style="text-transform: uppercase; color: #333; font-weight: bold; font-size: 15px; margin-bottom: 15px; margin-top: 10px">\n' +
        '                                    <i class="fa fa-usd" aria-hidden="true"></i>\n' +
        '\n' +
        '                                    </i>&nbsp;&nbsp;Giá</p>\n' +
        '                                <table class="table">\n' +
        '                                    <tbody>\n' +
        '                                    <tr style="text-align: center;">\n' +
        '                                        <td>\n' +
        '                                            <span><i class="fa fa-money" aria-hidden="true"></i></i>\n' +
        '                                                <b>Best BID</b>\n' +
        '                                            </span>\n' +
        '                                        </td>\n' +
        '                                        <td>\n' +
        '                                            <i class="fa fa-arrows-h"></i>\n' +
        '                                        </td>\n' +
        '                                        <td>\n' +
        '                        <span><i class="fa fa-gg" aria-hidden="true"></i>\n' +
        '                          <b>Đơn vị</b></span>\n' +
        '                                        </td>\n' +
        '                                    </tr>\n' +
        '                                    <tr style="text-align: center;">\n' +
        '                                        <td>\n' +
        '                                            <span class="badge bg-green" id="'+post._id+'-best-price">' + post.init_money + '</span>\n' +
        '                                        </td>\n' +
        '                                        <td>\n' +
        '                                        </td>\n' +
        '                                        <td>\n' +
        '                                            <span class="badge bg-red">VNĐ</span>\n' +
        '                                        </td>\n' +
        '                                    </tr>\n' +
        '                                    </tbody>\n' +
        '                                </table>\n' +
        '\n' +
        '                                <p style="text-transform: uppercase; color: #333; font-weight: bold; font-size: 15px; margin-bottom: 15px; margin-top: 10px">\n' +
        '                                    <i class="fa fa-info-circle" aria-hidden="true"></i>&nbsp;&nbsp;Thông tin tập trung\n' +
        '                                </p>\n' +
        '                                <p class="trip-info">' + post.status + '</p>\n' +
        '                                <p style="text-transform: uppercase; color: #333; font-weight: bold; font-size: 15px; margin-bottom: 15px; margin-top: 10px">\n' +
        '                                    <i class="fa fa-clock-o" aria-hidden="true"></i> Thời gian còn lại\n' +
        '                                </p>\n' +
        '                                <span class="badge bg-red count-downs-expiredTime" data-await-time="' + post.expiredTime + '"></span>'

    return html;
};

let showBlockPost = (data) => {
    let userHtml = showUser(data.user);
    let postHtml = showPost(data.newPost);
    console.log('New Post: ' + data.newPost._id);
    let html = '<div class="box box-danger block-post" id="' + data.newPost._id + '">\n' +
        '    <div class="box-header ui-sortable-handle" style="cursor: move;">\n' +
        '        <div class="box-tools pull-right" data-toggle="tooltip" title="Status">\n' +
        '            <i class="fa fa-comments-o"></i>\n' +
        '            <h3 class="box-title">Chat</h3>\n' +
        '        </div>\n' +
        '    </div>\n' +
        '    <div class="box-body">\n' +
        userHtml +
        postHtml +
        '    </div>\n' +
        '    <div class="box-footer">\n' +
        '        <label for="driver-bid" class="col-sm-2 control-label">BID</label>\n' +
        '        <div class="col-sm-2">\n' +
        '            <input type="number" class="form-control driver-bid" placeholder="BID">\n' +
        '        </div>\n' +
        '\n' +
        '        <label for="driver-arrival-time" class="col-sm-2 control-label">Thời gian tới</label>\n' +
        '        <div class="col-sm-2">\n' +
        '            <input type="number" class="form-control driver-arrival-time"  placeholder="Phút">\n' +
        '        </div>\n' +
        '        <div class="col-sm-3">\n' +
        '            <a type="submit" class="btn btn-danger pull-right btn-block btn-sm send-bid">Send</a>\n' +
        '        </div>\n' +
        '    </div>\n' +
        '</div>';
    $('.insert-after').after(html);
    countDownsBlock(data.newPost._id);

};

let showChooseModal = (data) => {

    let html = '<div class="table-responsive">\n' +
        '<table class="table no-margin">\n' +
        ' <thead>\n' +
        '<tr>\n' +
        '<th style="text-align:center;">Mục</th>\n' +
        '<th style="text-align:center;">Chi tiết</th>\n' +
        '</tr>\n' +
        '</thead>\n' +
        '<tbody>\n' +
        '<tr>\n' +
        '<td style="text-align:center;">Điểm đi</td>\n' +
        '<td style="text-align:center;">'+data.postInfo.location+'</td>\n' +
        '</tr>\n' +
        '<tr>\n' +
        '<td style="text-align:center;">Điểm đến</td>\n' +
        '<td style="text-align:center;">'+data.postInfo.destination+'</td>\n' +
        '</tr>\n' +
        '<tr>\n' +
        '<td style="text-align:center;">Giá</td>\n' +
        '<td style="text-align:center;">'+data.bestPirceChoose+'</td>         \n' +
        '</tr>\n' +
        '</tbody>\n' +
        '</table>\n' +
        '</div>';

    $('#modal-info .modal-body').html(html);
};

let showFooterModal = (data) =>{
    let html = ' <div class="row">\n' +
        '                <div class="col-sm-4 border-right">\n' +
        '                  <div class="description-block">\n' +
        '                    <a class="btn btn-danger not_choose_poster">Hủy</a>\n' +
        '                  </div>\n' +
        '                  <!-- /.description-block -->\n' +
        '                </div>\n' +
        '                <!-- /.col -->\n' +
        '                <div class="col-sm-4 border-right">\n' +
        '                  <div class="description-block">\n' +
        '                    <h5 class="description-header">Thời gian giao dịch còn lại</h5>\n' +
        '                    <span class="badge badge-danger time-deal"></span>'+
        '                  </div>\n' +
        '                  <!-- /.description-block -->\n' +
        '                </div>\n' +
        '                <!-- /.col -->\n' +
        '                <div class="col-sm-4">\n' +
        '                  <div class="description-block">\n' +
        '                    <a class="class btn btn-success confirm_choose_bid" data-postId="'+data.postInfo._id+'" data-price="'+data.bestPirceChoose+'" data-userId="'+data.userId+'">Đi chuyến này</a>\n' +
        '                  </div>\n' +
        '                  <!-- /.description-block -->\n' +
        '                </div>\n' +
        '                <!-- /.col -->\n' +
        '              </div>';
    $('#modal-info .modal-footer').html(html);
};

let countDownsBlock = (idPost) => {
    let expiredTime = $('#' + idPost).find('.count-downs-expiredTime').attr('data-await-time');
    var countDownDate = new Date(expiredTime).getTime();
    let differrence =0;
    $.ajax({
        url:'/getTimeServer',
        type:'GET',
        dataType:'json',
        success: function (data) {
            differrence = (new Date().getTime ()) -  (new Date(data).getTime());
        } ,
        error: function (err) {
            console.log(err.responseText);
        }
    });
// Update the count down every 1 second
    var x = setInterval(function () {

        var now = new Date().getTime() - differrence;

        // Find the distance between now an the count down date
        var distance = countDownDate - now;

        var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        var seconds = Math.floor((distance % (1000 * 60)) / 1000);

        // Display the result in the element with id="demo"
        //document.getElementById("count-downs").innerHTML = minutes + "m " + seconds + "s ";

        $('#' + idPost).find('.count-downs-expiredTime').text(minutes + "m " + seconds + "s ");
        // If the count down is finished, write some text
        if (distance < 0) {
            clearInterval(x);
            $('#' + idPost).css('display', 'none');
            console.log('expired');
        }
    }, 1000);
};

let countDownProcessDeal = (time) =>{
    let x = setInterval(()=>{
        time = time-1;
        $('#modal-info').find('.time-deal').text(time+' s');
        if (time<0){
            clearInterval(x);
        }
    },1000)
};

let timeoutReal = (postId) => {
    timeoutDeal = setTimeout(()=>{
        if ($('#'+postId).length>0) {
            $('#modal-info .decline-from-driver').click();
            $('#modal-info').modal('hide');
        }
    },15000);
}
//customize modal deal
let showDealBodyModal = (data)=>{
    let html ='<div class="box box-widget widget-user-2">\n' +
        '            <!-- Add the bg color to the header using any of the bg-* classes -->\n' +
        '            <div class="widget-user-header bg-yellow">\n' +
        '              <div class="widget-user-image">\n' +
        '                <img class="img-circle" src="'+data.userInfo.picture+'" alt="'+data.userInfo.fullName+'">\n' +
        '              </div>\n' +
        '              <!-- /.widget-user-image -->\n' +
        '              <h3 class="widget-user-username">'+data.userInfo.fullName+'</h3>\n' +
        '              <h5 class="widget-user-desc">Customer</h5>\n' +
        '            </div>\n' +
        '            <div class="box-footer no-padding">\n' +
        '              <ul class="nav nav-stacked">\n' +
        '                <li><a href="#">Điểm đi <span class="pull-right badge bg-blue">'+data.postInfo.location+'</span></a></li>\n' +
        '                <li><a href="#">Điểm đến <span class="pull-right badge bg-aqua">'+data.postInfo.destination+'</span></a></li>\n' +
        '                <li><a href="#">Tổng quãng đường <span class="pull-right badge bg-green">'+data.postInfo.totalDistance+'</span></a></li>\n' +
        '              </ul>\n' +
        '            </div>\n' +
        '          </div>'

    $('#modal-info .modal-body').html(html);
};

let showDealFooterModal = (data) =>{
    let html =' <div class="row">\n' +
        '                <div class="col-sm-4 border-right">\n' +
        '                  <div class="description-block">\n' +
        '                    <a class="btn btn-danger decline-from-driver" data-userId="'+data.userInfo._id+'">Từ chối</a>\n' +
        '                  </div>\n' +
        '                  <!-- /.description-block -->\n' +
        '                </div>\n' +
        '                <!-- /.col -->\n' +
        '                <div class="col-sm-4 border-right">\n' +
        '                  <div class="description-block">\n' +
        '                    <h5 class="badge bg-red time-deal"></h5>\n' +
        '                    <span class="description-text">Thời gian chờ còn lại</span>\n' +
        '                  </div>\n' +
        '                  <!-- /.description-block -->\n' +
        '                </div>\n' +
        '                <!-- /.col -->\n' +
        '                <div class="col-sm-4">\n' +
        '                  <div class="description-block">\n' +
        '                    <a class="btn btn-success driver-send-report" data-userId="'+data.userInfo._id+'" data-postId="'+data.postInfo._id+'">Đi ngay</a>\n' +
        '                  </div>\n' +
        '                  <!-- /.description-block -->\n' +
        '                </div>\n' +
        '                <!-- /.col -->\n' +
        '              </div>\n' +
        '              <!-- /.row -->'
    $('#modal-info .modal-footer').html(html);
};

let showDetailOrder = (data)=>{
    let html = '<div class="table-responsive">\n' +
        '<table class="table no-margin">\n' +
        ' <thead>\n' +
        '<tr>\n' +
        '<th style="text-align:center;">Mục</th>\n' +
        '<th style="text-align:center;">Chi tiết</th>\n' +
        '</tr>\n' +
        '</thead>\n' +
        '<tbody>\n' +
        '<tr>\n' +
        '<td style="text-align:center;">Điểm đi</td>\n' +
        '<td style="text-align:center;">'+data.location+'</td>\n' +
        '</tr>\n' +
        '<tr>\n' +
        '<td style="text-align:center;">Điểm đến</td>\n' +
        '<td style="text-align:center;">'+data.destination+'</td>\n' +
        '</tr>\n' +
        '<tr>\n' +
        '<td style="text-align:center;">Giá</td>\n' +
        '<td style="text-align:center;">'+data.price+'</td>\n' +
        '</tr>\n' +
        '</tbody>\n' +
        '</table>\n' +
        '</div>';
    $('#modal-info .modal-body').html(html);
};

//disconnect/connection
let topDriver = (data) =>{
    let liHtml = liData(data)
    let html =
        '            <div class="box-body">\n' +
        '              <ul class="products-list product-list-in-box">\n' +
        liHtml+
        '              </ul>\n' +
        '            </div>\n' ;
    $('#top-drivers-bid').html(html);
};

let liData = (listData)=>{
    let html='';
    listData.forEach(data=>{
        let value = data.activity === "Online"? 'success':'yellow';
        html +=
            '                <li class="item">\n' +
            '                  <div class="product-img">\n' +
            '                    <img src="'+data.driver.picture+'" alt="'+data.driver.fullName+'">\n' +
            '                  </div>\n' +
            '                  <div class="product-info">\n' +
            '                    <a href="javascript:void(0)" class="product-title">'+ data.driver.fullName +
            '                      <span class="label label-warning pull-right">'+data.total+'</span></a>\n' +
            '<span class="product-description">\n' +
            '<a href="#"><i class="fa fa-circle text-'+value+'"></i> '+data.activity+'</a>'+
            '                        </span>'+
            '                  </div>\n' +

            '                </li>\n';
    })
    return html;
};