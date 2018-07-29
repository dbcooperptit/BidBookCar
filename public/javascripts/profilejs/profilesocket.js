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
            $("#book-bike").css('display','block');
            displayUser(data.user,data.newPost.createAt);
            displayPost(data.newPost);
            countDown(data.newPost.expiredTime);
            $('#id_post').val(data.newPost._id);
            $('#close-modal').click();
        });

        socket.on('error_post', data => {
            let err = $("#await-time").next();
            $(err).css('display','block');
            $(err).text(data.message);
        });

        socket.on('reconnect', () => {
            location.reload();
        });
    }
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
        '<p class="trip-info">' + post.status + '</p>'+
        '<p style="text-transform: uppercase; color: #333; font-weight: bold; font-size: 15px; margin-bottom: 15px; margin-top: 10px">'+
        '<i class="fa fa-times-circle" aria-hidden="true"></i>&nbsp;&nbsp;Thời gian đấu giá còn lại</p>' +
        '<span class="badge bg-red" id="count-downs"></span>';
    $("#post-book-bike .box-body .user-block").after(html);
};
var displayUser = (user,datePost) => {
    let html = '<div class="user-block">' +
        '<img class="img-circle img-bordered-sm" src="'+user.picture+'" alt="user image">' +
        '<span class="username">' +
        '<a href="#">'+user.fullName+'</a>' +
        '</span>' +
        '<span class="description">'+datePost+'</span>' +
        '</div>';
    $("#post-book-bike .box-body").append(html);
};

var countDown = (time) =>{
    var countDownDate = new Date(time ).getTime();

// Update the count down every 1 second
    var x = setInterval(function() {

        var now = new Date().getTime();

        // Find the distance between now an the count down date
        var distance = countDownDate - now;

        var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        var seconds = Math.floor((distance % (1000 * 60)) / 1000);

        // Display the result in the element with id="demo"
        document.getElementById("count-downs").innerHTML = minutes + "m " + seconds + "s ";

        // If the count down is finished, write some text
        if (distance < 0) {
            clearInterval(x);
            alert("expired time");
        }
    }, 1000);

};