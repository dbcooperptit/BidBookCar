let bidSocket = {
    driverSocket: () => {
        var socket = io('/bidchannel', {transports: ['websocket']});
        socket.on('connect', () => {
            socket.emit('init_channel');
        });
        $('.content').on('click','.send-bid', function(evt){
            var post = $(this).closest('.block-post');
            var postId = $(post).attr('id');
            let bid = $(post).find('.driver-bid').val();
            let arrivalTime = $(post).find('.driver-arrival-time').val();
            socket.emit('driverBid',{postId: postId, bid: bid, arrivalTime:arrivalTime});
        });
        socket.on("driverIndexNewPost",data =>{
            console.log(data);
            showBlockPost(data);
        });

        socket.on('driverIndexError',data =>{
            console.log(data);
            bootbox.alert({
                message: data.message,
                size: 'small'
            });
        });

        socket.on('driverIndexSuccess',data =>{
            console.log(data);
        })
    }

};

let showUser = (user) => {
    let html = '<div class="user-block">\n' +
        '                                    <img class="img-circle img-bordered-sm" src="'+user.picture+'"\n' +
        '                                         alt="'+user.fullName+'">\n' +
        '                                    <span class="username">\n' +
        '                    <a href="#">'+user.fullName+'</a>\n' +
        '                  </span>\n' +
        '                                    <span class="description">'+user.createAt+'</span>\n' +
        '                                </div>'

    return html;
};

let showPost = (post) =>{
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
        '                                        <td>'+post.location+'</td>\n' +
        '                                        <td></td>\n' +
        '                                        <td>'+post.destination+'</td>\n' +
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
        '                                            <span class="badge bg-green">'+post.price+'</span>\n' +
        '                                        </td>\n' +
        '                                        <td>\n' +
        '                                        </td>\n' +
        '                                        <td>\n' +
        '                                            <span class="badge bg-danger">VNĐ</span>\n' +
        '                                        </td>\n' +
        '                                    </tr>\n' +
        '                                    </tbody>\n' +
        '                                </table>\n' +
        '\n' +
        '                                <p style="text-transform: uppercase; color: #333; font-weight: bold; font-size: 15px; margin-bottom: 15px; margin-top: 10px">\n' +
        '                                    <i class="fa fa-info-circle" aria-hidden="true"></i>&nbsp;&nbsp;Thông tin tập trung\n' +
        '                                </p>\n' +
        '                                <p class="trip-info">'+post.status+'</p>\n' +
        '                                <p style="text-transform: uppercase; color: #333; font-weight: bold; font-size: 15px; margin-bottom: 15px; margin-top: 10px">\n' +
        '                                    <i class="fa fa-clock-o" aria-hidden="true"></i> Thời gian còn lại\n' +
        '                                </p>\n' +
        '                                <span class="badge bg-red count-downs-expiredTime" data-await-time="'+post.expiredTime+'"></span>'

    return html;
};

let showBlockPost = (data) =>{
    let userHtml = showUser(data.user);
    let postHtml = showPost(data.newPost);
    let html = '<div class="box box-danger block-post" id="'+data.newPost._id+'">\n' +
        '    <div class="box-header ui-sortable-handle" style="cursor: move;">\n' +
        '        <div class="box-tools pull-right" data-toggle="tooltip" title="Status">\n' +
        '            <i class="fa fa-comments-o"></i>\n' +
        '            <h3 class="box-title">Chat</h3>\n' +
        '        </div>\n' +
        '    </div>\n' +
        '    <div class="box-body">\n' +
                userHtml+
                postHtml+
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

let countDownsBlock = (idPost) =>{
  let expiredTime = $('#'+idPost).find('.count-downs-expiredTime').attr('data-await-time');
  var countDownDate = new Date(expiredTime ).getTime();

// Update the count down every 1 second
    var x = setInterval(function() {

        var now = new Date().getTime();

        // Find the distance between now an the count down date
        var distance = countDownDate - now;

        var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        var seconds = Math.floor((distance % (1000 * 60)) / 1000);

        // Display the result in the element with id="demo"
        //document.getElementById("count-downs").innerHTML = minutes + "m " + seconds + "s ";
        $('#'+idPost).find('.count-downs-expiredTime').text( minutes + "m " + seconds + "s ");
        // If the count down is finished, write some text
        if (distance < 0) {
            // clearInterval(x);
            // bootbox.prompt({
            //     title: "Would you want to renew!",
            //     inputType: 'number',
            //     callback: function (result) {
            //         let value = result == null ? 0: result;
            //         $('#end-timeout').attr('data-value',value);
            //         $('#end-timeout').click();
            //     }
            // });
            console.log('expired');
        }
    }, 1000);
};