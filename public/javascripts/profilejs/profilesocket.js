var bidSocket = {
    profileSoket: () => {
        var socket = io('/bidchannel', {transports: ['websocket']});
        socket.on('connect', () => {
            socket.emit('init_channel');
        });

        $("#caculator-money").click(evt => {
            let totalDistance = $("#distance-two-point").text().split(' ')[0];
            socket.emit("caculator_money", totalDistance);
        });

        socket.on('total_money', totalMoney => {
            $("#distance-money").text(totalMoney + " vnd");
        });

        $("#save_posts").click(evt => {
            let origin = $("#origin-input").val();
            let destination = $("#destination-input").val();
            let desciption = $("#destination-description").val();
            let awaittime = $("#await-time").val();
            let totalDistance = $("#distance-two-point").text().split(' ')[0];
            let money = $("#distance-money").text().split(' ')[0];
            let post = {
                origin: origin,
                desciption: desciption,
                destination: destination,
                awaittime: awaittime,
                totalDistance: totalDistance,
                money: money
            };
            console.log(post);
            socket.emit('bid_post', post);
        });

        socket.on("newPost", data => {
            $("#book-bike").css('display', 'block');
            displayBlockPost();
            displayUser(data.user, data.newPost.createAt, data.newPost._id);
            displayPost(data.newPost);
            countDown(data.newPost.expiredTime);
            $('#id_post').val(data.newPost._id);
            $('#close-modal').click();
        });

        $("#book-bike").on('click', '#add-new-status', (evt) => {
            let newStatus = $('#add-new-status').closest('.input-group').find('.form-control').val();
            let postId = $('#id_post').val();
            socket.emit('change_status_post', {newStatus: newStatus, postId: postId})
        });

        socket.on('error_change_status', data => {
            bootbox.alert({
                message: data,
                className: 'bb-alternate-modal'
            });
        });

        socket.on('success_change_status', data => {
            $('.trip-info').text(data.newStatus);
            $('#add-new-status').closest('.input-group').find('.form-control').val('');
        });

        $('#book-bike').on('click', '#end-timeout', function(evt){
            let value = $('#end-timeout').attr('data-value');
            let postId = $('#id_post').val();
            socket.emit('adjourn_post', {value: value, postId: postId});
        });

        socket.on('error_post', data => {
            let err = $("#await-time").next();
            $(err).css('display', 'block');
            $(err).text(data.message);
        });

        socket.on('success_adjourn', data => {
            console.log(data);
            if (data.isHidden) {
                $('#book-bike').css('display', 'none');
            } else {
                let newTime = data.expiredTime;
                countDown(newTime);
            };
        });

        socket.on('driverBidToUser', data => {
            console.log(data);
            showDialogNotify("Được cập nhật mới","Book Bike","info");
            displayListBid(data.allBid);
        });

        socket.on('chooseDriversToUser', data=>{
            dispalyModalBody(data);
            countDownProcessDeal(10);
        });

        $('#modal-info').on('click','.confirm_choose_bid',function(evt){
            let postId= $(this).attr('data-postId');
            let price= $(this).attr('data-price');
            let driverId= $(this).attr('data-driverId');

            let data = {
                postId: postId,
                bestPirceChoose: price,
                driverId: driverId
            };
            socket.emit('userConfirm',data);
            let htmlDeal = '<img src="/images/giphy_2.gif" class="img-responsive" style="height: 200px;width: 100%;">\n';
            $("#modal-info .modal-body").html(htmlDeal);
            $('#modal-info .modal-title').html('Quá trình giao dịch dang diễn ra ...');
        });

        socket.on('deal_build_error',data =>{
            $("#modal-info").modal('show');
            $("#modal-info .modal-body").html(data.message);
            $('#modal-info .modal-title').html('Thông báo');
        });

        socket.on('deal_build_success',data=>{
            $("#modal-info").modal('show');
            $("#modal-info .modal-body").html(data.message);
            $('#modal-info .modal-title').html('Thông báo');
        });

        $('#book-bike').on('click','.customer-choose-drivers', function () {
           let driverId = $(this).attr('data-driverId');
            let postId = $("#id_post").val();
           socket.emit('customer_choose_driver',driverId, postId);
           $("#modal-info").modal('show');
            let htmlDeal = '<img src="/images/giphy_2.gif" class="img-responsive" style="height: 200px;width: 100%;">\n';
            $('#modal-info .modal-body').html(htmlDeal);
            $("#modal-info .modal-title").text("Đang chờ phản hồi từ driver...");

        });

        socket.on('driver_busy_to_user',data=>{
            $("#modal-info").modal('show');
            let html = '<h2>'+data.message+'</h2>';
            $('#modal-info .modal-body').html(html);
            $("#modal-info .modal-title").text("Thông báo");
        });

        socket.on('driver_report_success',data=>{
            $("#modal-info").modal('show');
            showDetailOrder(data.orderNew);
            $("#book-bike").empty();
            $("#modal-info .modal-title").text("Thông báo");
        });

        socket.on('reconnect', () => {
            location.reload();
        });
    }
};
let displayBlockPost = () =>{
    let html =' <div class="col-md-8" id="post-book-bike">\n' +
        '    <div class="box box-success">\n' +
        '        <div class="box-header ui-sortable-handle" style="cursor: move;">\n' +
        '            <div class="box-tools pull-right" data-toggle="tooltip" title="Status">\n' +
        '                <i class="fa fa-comments-o"></i>\n' +
        '                <h3 class="box-title">Book Bike</h3>\n' +
        '            </div>\n' +
        '        </div>\n' +
        '        <div class="box-body">\n' +
        '\n' +
        '            <input id="id_post" type="hidden" value="" />\n' +
        '\n' +
        '            <span hidden="hidden" id="end-timeout"></span>\n' +
        '        </div>\n' +
        '        <div class="box-footer">\n' +
        '            <div class="input-group">\n' +
        '                <input class="form-control" placeholder="Type message...">\n' +
        '\n' +
        '                <div class="input-group-btn">\n' +
        '                    <button type="button" class="btn btn-success" id="add-new-status">\n' +
        '                        <i class="fa fa-plus"></i>\n' +
        '                    </button>\n' +
        '                </div>\n' +
        '            </div>\n' +
        '        </div>\n' +
        '    </div>\n' +
        '</div>\n' +
        '<div class="col-md-4">\n' +
        '    <div class="box" id="list-driver-bid">\n' +
        '    </div>\n' +
        '</div>';
    $('#book-bike').html(html);
};

var displayPost = (post) => {
    let html = '<p style="text-transform: uppercase; color: #333; font-weight: bold; font-size: 15px; margin-bottom: 15px; margin-top: 10px">' +
        '<i class="fa fa-motorcycle" aria-hidden="true"></i>' +
        '</i>&nbsp;&nbsp;Lộ trình</p>' +
        '<table class="table">' +
        '<tbody>' +
        '<tr style="text-align: center;">' +
        '<td>' +
        '<span><i class="fa fa-map-marker"aria-hidden="true"></i>' +
        '<b>Điểm đi</b>' +
        '</span>' +
        '</td>' +
        '<td><i class="fa fa-arrow-circle-right" aria-hidden="true"></i>' +
        '</td>' +
        '<td>' +
        '<span><i class="fa fa-map-marker" aria-hidden="true"></i>' +
        '<b>Điểm đến</b>' +
        '</span>' +
        '</td>' +
        '</tr>' +
        '<tr style="text-align: center;">' +

        '<td>' + post.location + '</td>' +
        '<td></td>' +
        '<td>' + post.destination + '</td>' +
        '</tr>' +
        '</tbody>' +
        '</table>' +
        '<p style="text-transform: uppercase; color: #333; font-weight: bold; font-size: 15px; margin-bottom: 15px; margin-top: 10px">' +
        '<i class="fa fa-usd" aria-hidden="true"></i>' +

        '</i>&nbsp;&nbsp;Giá</p>' +
        '<table class="table">' +
        '<tbody>' +
        '<tr style="text-align: center;">' +
        '<td>' +
        '<span><i class="fa fa-money" aria-hidden="true"></i></i>' +
        '<b>Nhà quản lí đề xuất</b>' +
        '</span>' +
        '</td>' +
        '<td>' +
        '<span><i class="fa fa-gg" aria-hidden="true"></i>' +
        '<b>Đơn vị</b></span>' +
        '</td>' +
        '</tr>' +
        '<tr style="text-align: center;">' +
        '<td>' +
        '<span class="badge bg-green">' + post.init_money + '</span>' +
        '</td>' +
        '<td>' +
        '<span class="badge bg-danger">VNĐ</span>' +
        '</td>' +
        '</tr>' +
        '</tbody>' +
        '</table>' +

        '<p style="text-transform: uppercase; color: #333; font-weight: bold; font-size: 15px; margin-bottom: 15px; margin-top: 10px">' +
        '<i class="fa fa-info-circle" aria-hidden="true"></i>&nbsp;&nbsp;Thôngtin tập trung</p>' +
        '<p class="trip-info">' + post.status + '</p>' +
        '<p style="text-transform: uppercase; color: #333; font-weight: bold; font-size: 15px; margin-bottom: 15px; margin-top: 10px">' +
        '<i class="fa fa-times-circle" aria-hidden="true"></i>&nbsp;&nbsp;Thời gian đấu giá còn lại</p>' +
        '<span class="badge bg-red" id="count-downs"></span>';
    $("#post-book-bike .box-body .user-block").after(html);
};

var displayUser = (user, datePost, postId) => {
    let html = '<div class="user-block">' +
        '<img class="img-circle img-bordered-sm" src="' + user.picture + '" alt="user image">' +
        '<span class="username">' +
        '<a href="#">' + user.fullName + '</a>' +
        '</span>' +
        '<span class="description">' + datePost + '</span>' +
        '</div>';
    $("#post-book-bike .box-body").append(html);
};

var displayListBid = (data) => {
    var trHtml = trListBid(data);
    var html = ' <div class="box-header">\n' +
        '                                                   <h3 class="box-title">List Driver BID</h3>\n' +
        '                                                    </div> <div class="box-body no-padding">\n' +
        '                                                        <table class="table table-striped">\n' +
        '                                                            <tbody>\n' +
        '                                                                <tr>\n' +
        '                                                                    <th style="width: 10px">#</th>\n' +
        '                                                                    <th>Tên tài xế</th>\n' +
        '                                                                    <th>Giá tiền</th>\n' +
        '                                                                    <th>Giờ đón</th>\n' +
        '                                                                    <th>Action</th>\n' +
        '                                                                </tr>\n' +
        trHtml +
        '                                                            </tbody>\n' +
        '                                                        </table>\n' +
        '                                                    </div>';
    $('#list-driver-bid').html(html);
};

var trListBid = (data) => {
    var html = '';
    //Top 1
    if(data.length>0) {
        html +=
            '<tr>\n' +
            '                                                                    <td>' + 0 + '</td>\n' +
            '                                                                    <td>' + data[0].fullName + '</td>\n' +
            '                                                                    <td>\n' +
            '                                                                        <span class="badge bg-red">' + data[0].price + ' VNĐ</span>\n' +
            '                                                                   </td>\n' +
            '                                                                    <td>\n' +
            '                                                                        <span class="badge bg-red">' + localDateTime(data[0].awaitTime) + '</span>\n' +
            '                                                                    </td>\n' +
            '                                                                    <td>\n' +
            '                                                                        <a class="badge bg-red customer-choose-drivers" data-driverId="'+data[0].driverId+'"> Chọn </a>\n' +
            '                                                                    </td>\n' +
            '                                                                </tr>\n';
    }
    //Top 2
    if(data.length>1) {
        html +=
            '<tr>\n' +
            '                                                                    <td>' + 1 + '</td>\n' +
            '                                                                    <td>' + data[1].fullName + '</td>\n' +
            '                                                                    <td>\n' +
            '                                                                        <span class="badge bg-warning">' + data[1].price + ' VNĐ</span>\n' +
            '                                                                   </td>\n' +
            '                                                                    <td>\n' +
            '                                                                        <span class="badge bg-warning">' + localDateTime(data[1].awaitTime) + '</span>\n' +
            '                                                                    </td>\n' +
            '                                                                    <td>\n' +
            '                                                                        <a class="badge bg-warning customer-choose-drivers" data-driverId="'+data[1].driverId+'"> Chọn </a>\n' +
            '                                                                    </td>\n' +
            '                                                                </tr>\n';
    }
    //Top 3
    if (data.length > 2) {
        html +=
            '<tr>\n' +
            '                                                                    <td>' + 2 + '</td>\n' +
            '                                                                    <td>' + data[2].fullName + '</td>\n' +
            '                                                                    <td>\n' +
            '                                                                        <span class="badge bg-aqua ">' + data[2].price + ' VNĐ</span>\n' +
            '                                                                   </td>\n' +
            '                                                                    <td>\n' +
            '                                                                        <span class="badge bg-aqua ">' + localDateTime(data[2].awaitTime) + '</span>\n' +
            '                                                                    </td>\n' +
            '                                                                    <td>\n' +
            '                                                                        <a class="badge bg-warning customer-choose-drivers" data-driverId="'+data[2].driverId+'"> Chọn </a>\n' +
            '                                                                    </td>\n' +
            '                                                                </tr>\n';
    }
    //Top 4-> n;
    if(data.length >3) {
        for (x = 3; x < data.length; x++) {

            html +=
                '<tr>\n' +
                '                                                                    <td>' + x + '</td>\n' +
                '                                                                    <td>' + data[x].fullName + '</td>\n' +
                '                                                                    <td>\n' +
                '                                                                        <span class="badge">' + data[x].price + ' VNĐ</span>\n' +
                '                                                                   </td>\n' +
                '                                                                    <td>\n' +
                '                                                                        <span class="badge">' + localDateTime(data[x].awaitTime) + '</span>\n' +
                '                                                                    </td>\n' +
                '                                                                    <td>\n' +
                '                                                                        <a class="badge customer-choose-drivers" data-driverId="'+data[x].driverId+'"> Chọn </a>\n' +
                '                                                                    </td>\n' +
                '                                                                </tr>\n';
        }
    }
    return html;
};

var dispalyModalBody = (data) =>{
    $('#modal-info').modal('show');
    var html = '<div class="box box-widget widget-user">\n' +
        '                                <!-- Add the bg color to the header using any of the bg-* classes -->\n' +
        '                                <div class="widget-user-header bg-aqua-active">\n' +
        '                                    <h3 class="widget-user-username">'+data.driverInfo.fullName+'</h3>\n' +
        '                                    <h5 class="widget-user-desc">BIKER</h5>\n' +
        '                                </div>\n' +
        '                                <div class="widget-user-image">\n' +
        '                                    <img class="img-circle" src="'+data.driverInfo.picture+'" alt="'+data.driverInfo.fullName+'">\n' +
        '                                </div>\n' +
        '                                <div class="box-footer">\n' +
        '                                    <div class="row">\n' +
        '                                        <div class="col-sm-4 border-right">\n' +
        '\n' +
        '                                        </div>\n' +
        '                                        <!-- /.col -->\n' +
        '                                        <div class="col-sm-4 border-right">\n' +
        '                                           <div class="description-block">\n' +
        '                                               <h5 class="description-header" style="color: #0c0c0c;">Thời gian giao dịch còn lại</h5>\n' +
        '<span class="time-deal badge badge-danger"></span>'+
        '                                            </div>\n' +
        '                                        </div>\n' +
        '                                        <!-- /.col -->\n' +
        '                                        <div class="col-sm-4 border-right">\n' +
        '                                             <a class="btn btn-success confirm_choose_bid" data-postId="'+data.postId+'" data-price="'+data.bestPirceChoose+'" data-driverId="'+data.driverInfo._id+'">Chọn tài xế</a>\n' +
        '                                        </div>\n' +
        '                                        <!-- /.col -->\n' +
        '                                    </div>\n' +
        '                                    <!-- /.row -->\n' +
        '                                </div>\n' +
        '                            </div>'

    $('#modal-info .modal-body').html(html);
}

var localDateTime = (time) =>{
    let convertTime = new Date(time);
    return convertTime.toLocaleTimeString();
};

var countDown = (time) => {
    var countDownDate = new Date(time).getTime();
    let differrence =0;
    $.ajax({
        url:'/getTimeServer',
        type:'GET',
        dataType:'json',
        success: function (data) {
            differrence = (new Date().getTime ())-  (new Date(data).getTime());
            console.log(data);
            console.log(differrence);
        } ,
        error: function (err) {
            console.log(err.responseText);
        }
    });

// Update the count down every 1 second
    var x = setInterval(function () {

        var now =(new Date().getTime()) - differrence;

        // Find the distance between now an the count down date
        var distance = countDownDate - now;

        var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        var seconds = Math.floor((distance % (1000 * 60)) / 1000);

        // Display the result in the element with id="demo"
       // document.getElementById("count-downs").innerHTML = minutes + "m " + seconds + "s ";
       //  if($("#count-downs").length < 1){
       //      clearInterval(x);
       //  }
        $("#count-downs").text( minutes + "m " + seconds + "s ");
        // If the count down is finished, write some text
        if (distance < 0) {
            clearInterval(x);
            bootbox.prompt({
                title: "Would you want to renew!",
                inputType: 'number',
                callback: function (result) {
                    let value = result == null ? 0 : result;
                    $('#end-timeout').attr('data-value', value);
                    $('#end-timeout').click();
                }
            });
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