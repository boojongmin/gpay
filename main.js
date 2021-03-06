var mapContainer = document.getElementById("map"), // 지도를 표시할 div
    mapOption = {
        center: new kakao.maps.LatLng(37.272985, 127.048362), // 지도의 중심좌표
        level: 3, // 지도의 확대 레벨
    };


var map = new kakao.maps.Map(mapContainer, mapOption);

// 마커를 클릭하면 장소명을 표출할 인포윈도우 입니다
var infowindow = new kakao.maps.InfoWindow({
    zIndex: 1,
    removable: true,
});

var markers = []; // 마커를 담을 배열입니다
var gpay_places = [];

// getCurrentLocation();

var geocoder = new kakao.maps.services.Geocoder();

var filename = "";
var category = "restaurant";



kakao.maps.event.addListener(map, 'center_changed', function() {

    var level = map.getLevel();
    var latlng = map.getCenter();

    getDisplayedPosition()

});



function getDisplayedPosition() {
    var p = map.getBounds();
    var x = (p.ea + p.ja) / 2;
    var y = (p.la + p.ka) / 2;

    geocoder.coord2Address(x, y, (x) => {
        try {
            // 축소를 계속하다보면 특정 레벨에서는 region_2depth_name에 구 정보를 보여주지 않아서 아래의 방어 로직 추가
            // "수원시 권선구" 이렇게 안나오고 "수원시" 이렇게 나옴.

            // if (x == undefined || x == undefined) return;
            let addr = x.address;
            if (Array.isArray(x)) {
                addr = x[0].address
            }
            // if (addr.region_2depth_name.split(" ").length == 1) return;

            const a =
                addr.region_1depth_name +
                "도" +
                addr.region_2depth_name.replace(" ", "") + addr.region_3depth_name;


            if (filename !== a) {
                filename = a;
                getData(category);
            }
        } catch (e) {
            console.log(e)
        }
    });
}

function refreshData() {}

getDisplayedPosition();

function removeMarker() {
    for (var i = 0; i < markers.length; i++) {
        markers[i].setMap(null);
    }
    markers = [];
    gpay_places = [];
    infowindow.close();
}

function changeMenuColor(category) {
    var menus = ["basket", "note", "hospital", "hair", "restaurant"]
    $.each(menus, function(i, menu) {
        if (category == menu) {
            $('#' + menu).css('background', 'silver');
        } else {
            $('#' + menu).css('background', 'white');
        }
    });
}

function getData(param) {
    category = param;

    // 선택된 메뉴 컬러를 변경 합니다.
    changeMenuColor(category);

    // 지도에 표시되고 있는 마커를 제거합니다
    removeMarker();

    var jsonLocation = "./json/basket.json";

    if (category != "") {
        jsonLocation = "./json/" + filename + "_" + category + ".json";
    }

    $.getJSON(jsonLocation, function(data) {
        $.each(data, function(i, item) {
            if (item.REFINE_WGS84_LAT != "" && item.REFINE_WGS84_LOGT != "") {
                savePlaces(item);
            }
        });

        $.each(gpay_places, function(i, ypay_place) {
            displayPlaces(ypay_place);
        });
    });
}

function savePlaces(item) {
    gpay_places.push({
        position: new kakao.maps.LatLng(
            item.REFINE_WGS84_LAT,
            item.REFINE_WGS84_LOGT
        ),
        items: item.items
            // CMPNM_NM: item.CMPNM_NM,
            // TELNO: item.TELNO,
            // REFINE_LOTNO_ADDR: item.REFINE_LOTNO_ADDR,
            // INDUTYPE_NM: item.INDUTYPE_NM,
    });
}

function displayPlaces(ypay_place) {

    // 마커를 생성하고 지도에 표시합니다
    var marker = new kakao.maps.Marker({
        position: ypay_place.position,
    });
    marker.setMap(map);
    markers.push(marker);

    // 마커에 클릭이벤트를 등록합니다
    kakao.maps.event.addListener(marker, "click", function() {
        // 마커를 클릭하면 장소명이 인포윈도우에 표출됩니다
        var html = ''
        for (var i = 0; i < ypay_place.items.length; i++) {
            var item = ypay_place.items[i]
            html += '<div style="padding:5px;font-size:12px;">' + item.CMPNM_NM + "<br>" +
                "<a href=tel:" + item.TELNO + ">" + item.TELNO + "</a>" +
                "<br>" +
                item.REFINE_LOTNO_ADDR +
                "<br>" +
                item.INDUTYPE_NM +
                "</div>"
        }

        infowindow.setContent(html);
        infowindow.open(map, marker);
    });
}