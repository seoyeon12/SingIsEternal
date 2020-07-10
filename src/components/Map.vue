<template>
  <div>
      <button id="toggle_btn" v-bind:class="[isActive ? 'show' : 'hide']" @click="toggleClass()">교통정보</button>
      <button id="reserch_btn" @click="clikckReloaad()">현 지도 기준 재검색</button>
      <span id="datetime_now">  현재 {{ hour }}시 {{ minute }}분입니다. </span>

      <div class="map_wrap">
        <div id="map"></div>
        <div id="menu_wrap" class="bg_white">
            <ul id="placesList"></ul>
            <div id="pagination"></div>
        </div>
      </div>
  </div>
</template>

<script>
export default {
  data () {
    return {
      isActive: false,
      map: null,
      lat: 36.871400,
      lon: 128.601400,
      error: '',
      keyword: '동전노래방',
      infowindow: '',
      markers: {},
      nowMarker: null,
      hour: 0,
      minute: 0,
      openHour: 23,
      openMinute: 0,
      closeHour: 3,
      closeMinute: 0
    }
  },
  mounted () {
    if (window.kakao && window.kakao.maps) {
      this.initMap()
    } else {
      const script = document.createElement('script')
      /* global kakao */
      script.onload = () => kakao.maps.load(this.initMap)
      script.src = 'http://dapi.kakao.com/v2/maps/sdk.js?autoload=false&appkey=f4593708888a850d18fda43ff85bafc3&libraries=services,clusterer'
      document.head.appendChild(script)
    }
  },
  methods: {
    // Map Init Methods
    initMap () {
      // console.log(this.lat, this.lon)
      this.init()

      // Checking the Geolocation
      if (navigator.geolocation) {
        console.log('=== Geolocation is supported.===')
        navigator.geolocation.getCurrentPosition(this.showPosition)
      } else {
        this.error = 'Geolocation is not supported.'
      }
    },
    init () {
      console.log('=== init Map ===')
      var container = document.getElementById('map')
      var options = {
        center: new kakao.maps.LatLng(this.lat, this.lon),
        level: 5
      }
      this.map = new kakao.maps.Map(container, options)
    },
    // 현재 위치 지도 Center 설정 Methods
    showPosition (position) {
      this.lat = position.coords.latitude
      this.lon = position.coords.longitude

      this.map.setCenter(new kakao.maps.LatLng(this.lat, this.lon))
      this.getTime() // 현재 시간 세팅
      this.displayMarker(this.lat, this.lon)
      this.singingRoom()
    },
    // 노래방 검색
    singingRoom () {
      // 장소 검색 객체를 생성
      var ps = new kakao.maps.services.Places()
      // 검색 결과 목록이나 마커를 클릭했을 때 장소명을 표출할 인포윈도우를 생성
      this.infowindow = new kakao.maps.InfoWindow({
        zIndex: 1
      })

      // console.log(this.lat, this.lon)
      var options = {
        location: new kakao.maps.LatLng(this.lat, this.lon),
        // location: new kakao.maps.LatLng(35.866172, 128.549906), // TEST Code
        useMapCenter: true,
        radius: 2000 // 2km 내외
      }
      // 장소검색 객체를 통해 키워드로 장소검색을 요청
      ps.keywordSearch(this.keyword, this.placesSearchCB, options)
    },
    // 장소검색이 완료됐을 때 호출되는 콜백함수
    placesSearchCB (data, status, pagination) {
      if (status === kakao.maps.services.Status.OK) {
        // 정상적으로 검색이 완료 시 검색 목록과 마커를 표출
        this.displayPlaces(data)
        // 페이지 번호를 표출
        this.displayPagination(pagination)
      } else if (status === kakao.maps.services.Status.ZERO_RESULT) {
        alert('검색 결과가 존재하지 않습니다.')
      } else if (status === kakao.maps.services.Status.ERROR) {
        alert('검색 결과 중 오류가 발생했습니다.')
      }
    },
    // 검색 결과 목록과 마커를 표출 함수
    displayPlaces (places) {
      var listEl = document.getElementById('placesList')
      var menuEl = document.getElementById('menu_wrap')
      var fragment = document.createDocumentFragment()
      var bounds = new kakao.maps.LatLngBounds()

      // 검색 결과 목록에 추가된 항목을 제거
      this.removeAllChildNods(listEl)
      // 지도에 표시되고 있는 마커를 제거
      this.removeMarker()

      for (var i = 0; i < places.length; i++) {
        // 마커를 생성, 지도 표시
        var placePosition = new kakao.maps.LatLng(places[i].y, places[i].x)
        //// 영업시간 TEST Code
          this.openHour = Math.floor(Math.random() * 24) + 1; // 1~24까지 랜덤 시간 발생 시키기
          // this.openMinute = Math.floor(Math.random() * 59) + 1; // 1~59까지 랜덤 분 발생 시키기
          this.openMinute = 0
          this.closeHour = this.openHour + 5; // 오픈 시간 + 5시간
          // this.closeMinute = this.openMinute - 10; // 오픈 분 - 10분
          this.closeMinute = 0
          if(this.closeHour > 24){ this.closeHour -= 24; } // 24가 넘어갈 시 -24
          if(this.closeMinute > 60){ this.closeMinute -= 60; } // 60가 넘어갈 시 -60
        ////
        var marker = this.addMarker(placePosition)
        var itemEl = this.getListItem(i, places[i]) // 검색 결과 항목 Element를 생성

        // 검색된 장소 위치를 기준으로 지도 범위를 재설정
        // LatLngBounds 객체에 좌표를 추가
        bounds.extend(placePosition);

        // 마커와 검색결과 항목에 mouseover 시
        // 해당 장소에 인포윈도우에 장소명을 표시
        // mouseout 했을 때는 인포윈도우를 닫기
        (function (marker, title) {
          kakao.maps.event.addListener(marker, 'mouseover', function () {
            // this.displayInfowindow(marker, title); //ERROR
            var content = '<div style="padding:5px;z-index:1;">' + title + '</div>'

            // 만약 indowindow를 못 찾는 거라면?
            this.infowindow.setContent(content)
            this.infowindow.open(this.map, marker)
          })

          kakao.maps.event.addListener(marker, 'mouseout', function () {
            this.infowindow.close() // ERROR
          })

          itemEl.onmouseover = function () {
            // this.displayInfowindow(marker, title); //ERROR
            var content = '<div style="padding:5px;z-index:1;">' + title + '</div>'

            this.infowindow.setContent(content)
            this.infowindow.open(this.map, marker)
          }

          itemEl.onmouseout = function () {
            this.infowindow.close() // ERROR
          }
        })(marker, places[i].place_name)

        fragment.appendChild(itemEl)
      }

      // 검색결과 항목들을 검색결과 목록 Elemnet에 추가
      listEl.appendChild(fragment)
      menuEl.scrollTop = 0

      // 검색된 장소 위치를 기준으로 지도 범위 재설정
      this.map.setBounds(bounds)
    },
    // 검색결과 항목을 Element로 반환하는 함수입니다
    getListItem (index, places) {
      var el = document.createElement('li')
      //   var itemStr = '<span class="markerbg marker_' + (index + 1) + '"></span>' +
      //         '<div class="info">' +
      //         '   <h3>' + places.place_name + '</h3>'
      var itemStr ='<div class="info"> <h3>' + places.place_name + '</h3>'

      if (places.road_address_name) {
        itemStr += '    <span>' + places.road_address_name + '</span><br>' +
                '   <span class="jibun gray">' + places.address_name + '</span>'
      } else {
        itemStr += '    <span>' + places.address_name + '</span>'
      }

      itemStr += '  <span class="tel">' + places.phone + '</span>' +
            '</div>'

      el.innerHTML = itemStr
      el.className = 'item'

      return el
    },
    // 마커를 생성하고 지도 위에 마커를 표시하는 함수입니다
    addMarker (position) {

      var imageSrc = 'marker_sing.png'
      // 마커 이미지 url, 스프라이트 이미지를 사용
      // TEST CODE
      // 시간, 분을 넘겨주고 true(영업 중), false(영업 X)를 반환 받는다.
      if(this.checkOpen()){
        imageSrc = 'marker_sing.png'
      }else{
        imageSrc = 'marker_sing_gray.png'
      }
      
      var imageSize = new kakao.maps.Size(64, 69) // 마커 이미지의 크기
      var imgOptions = {
        offset: new kakao.maps.Point(27, 69) // 마커 좌표에 일치시킬 이미지 내에서의 좌표
      }
      
      var markerImage = new kakao.maps.MarkerImage(imageSrc, imageSize, imgOptions)
      var marker = new kakao.maps.Marker({
        position: position, // 마커의 위치
        image: markerImage
      })

      marker.setMap(this.map) // 지도 위에 마커 표출
      this.markers.push(marker) // 배열에 생성된 마커 추가

      return marker
    },
    // 지도 위에 표시되고 있는 마커를 모두 제거합니다
    removeMarker () {
      for (var i = 0; i < this.markers.length; i++) {
        this.markers[i].setMap(null)
      }
      this.markers = []
    },
    // 검색결과 목록 하단에 페이지번호를 표시 함수
    displayPagination (pagination) {
      var paginationEl = document.getElementById('pagination')
      var fragment = document.createDocumentFragment()
      var i

      // 기존에 추가된 페이지번호를 삭제
      while (paginationEl.hasChildNodes()) {
        paginationEl.removeChild(paginationEl.lastChild)
      }

      for (i = 1; i <= pagination.last; i++) {
        var el = document.createElement('a')
        el.href = '#'
        el.innerHTML = i

        if (i === pagination.current) {
          el.className = 'on page'
        } else {
          el.className = 'page'
          el.onclick = (function (i) {
            return function () {
              pagination.gotoPage(i)
            }
          })(i)
        }

        fragment.appendChild(el)
      }
      paginationEl.appendChild(fragment)
    },
    // 현재 Error
    // 검색결과 목록 또는 마커를 클릭 시 호출 함수 인포윈도우 장소명 표시
    displayInfowindow (marker, title) {
      var content = '<div style="padding:5px;z-index:1;">' + title + '</div>'

      this.infowindow.setContent(content)
      this.infowindow.open(this.map, marker)
    },
    // 검색결과 목록의 자식 Element를 제거 함수
    removeAllChildNods (el) {
      while (el.hasChildNodes()) {
        el.removeChild(el.lastChild)
      }
    },
    // 교통정보 toggle Methods
    toggleClass () {
      this.isActive = !this.isActive
      if (this.isActive === true) {
        this.map.addOverlayMapTypeId(kakao.maps.MapTypeId.TRAFFIC)
      } else if (this.isActive === false) {
        this.map.removeOverlayMapTypeId(kakao.maps.MapTypeId.TRAFFIC)
      } else {
        console.log("Error::Wasn't Working isActive")
      }
    },
    // 현재 위치 마커생성 함수
    displayMarker (lat, lon) {
      // 마커 생성
      console.log("현재위치 : " + lat + lon)
      this.nowMarker = new kakao.maps.Marker({
        map: this.map,
        position: new kakao.maps.LatLng(lat, lon)
        // position: new kakao.maps.LatLng(35.866172, 128.549906)// TEST Code
      })

      this.nowMarker.setMap(this.map)
    },
    // 현 위치로 재검색 버튼클릭 시
    clikckReloaad () {
      // 기존의 있던 중앙 마커 삭제
      this.nowMarker.setMap(null)

      var center = this.map.getCenter()
      this.lat = center.getLat()
      this.lon = center.getLng()
      console.log(this.lat)
      console.log(this.lon)

      this.displayMarker(this.lat, this.lon)
      this.singingRoom()
    },
    // 현재 시간 조회
    getTime () {
      let today = new Date() 
      this.hour = today.getHours()
      this.minute = today.getMinutes()
      console.log( "현재 시간 : " + this.hour + ':' + this.minute)
    },
    // 영업시간에 따른 영업여부 (파라메터 : 닫는 시간)
    // 영업 중 => return true, 아니면 => return false
    checkOpen() {
      this.getTime()
      console.log( "오픈시간 : 닫는시간 " + this.openHour + ':' + this.closeHour)
      //오픈시간 <= 현시간 <= 닫는시간
      if(this.openHour <= this.hour && this.hour <= this.closeHour){
        console.log("INIT HOUR");
        //오픈분 <= 현 분 <= 닫는분
        // if(this.openMinute <= this.minute && this.minute <= this.closeMinute){
        //   console.log("INIT MIN");
        //   return true
        // }else{
        //   return false
        // }
        return true
      }else{
        return false
      }
    }
  }
}
</script>

<style>
#toggle_btn, #reserch_btn{
  padding: 10px 20px;
  margin-left: 10px;
  margin-bottom: 10px;
}
.map_wrap{
  position: relative;
  width: 100%;
  height: 90%;
}
#map{
  width: 100%;
  height: 100%;
}
#menu_wrap {
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  width: 250px;
  margin: 10px 0 30px 10px;
  padding: 5px;
  overflow-y: auto;
  background: rgba(255, 255, 255, 0.7);
  z-index: 1;
  font-size: 12px;
  border-radius: 10px;
}

.bg_white {
    background: #fff;
}
#menu_wrap hr {
  display: block;
  height: 1px;
  border: 0;
  border-top: 2px solid #5F5F5F;
  margin: 3px 0;
}
#menu_wrap .option {
  text-align: center;
}
#menu_wrap .option p {
  margin: 10px 0;
}
#menu_wrap .option button {
  margin-left: 5px;
}
#placesList{
  padding: 0;
}
#placesList li {
  list-style: none;
}
#placesList .item {
  position: relative;
  border-bottom: 1px solid #888;
  overflow: hidden;
  cursor: pointer;
  min-height: 65px;
}
#placesList .item span {
  display: block;
  margin-top: 4px;
}
#placesList .item h5,
#placesList .item .info {
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
}
/* #placesList .item .info {
  padding: 10px 0 10px 55px;
} */
#placesList .info .gray {
  color: #8a8a8a;
}
#placesList .info .jibun {
  padding-left: 26px;
  background: url(https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/places_jibun.png) no-repeat;
}
#placesList .info .tel {
  color: #009900;
}
/* #placesList .item .markerbg {
  float: left;
  position: absolute;
  width: 36px;
  height: 37px;
  margin: 10px 0 0 10px;
  background: url(https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/marker_number_blue.png) no-repeat;
} */

#pagination {
  margin: 10px auto;
  text-align: center;
}
.page {
  display: inline-block;
  line-height: 30px;
  margin-right: 10px;
}
.on {
  font-weight: bold;
  cursor: default;
  color: #777;
}

/* #placesList .item .marker_1 {
    background-position: 0 -10px;
}
#placesList .item .marker_2 {
    background-position: 0 -56px;
}
#placesList .item .marker_3 {
    background-position: 0 -102px
}
#placesList .item .marker_4 {
    background-position: 0 -148px;
}
#placesList .item .marker_5 {
    background-position: 0 -194px;
}
#placesList .item .marker_6 {
    background-position: 0 -240px;
}
#placesList .item .marker_7 {
    background-position: 0 -286px;
}
#placesList .item .marker_8 {
    background-position: 0 -332px;
}
#placesList .item .marker_9 {
    background-position: 0 -378px;
}
#placesList .item .marker_10 {
    background-position: 0 -423px;
}
#placesList .item .marker_11 {
    background-position: 0 -470px;
}
#placesList .item .marker_12 {
    background-position: 0 -516px;
}
#placesList .item .marker_13 {
    background-position: 0 -562px;
}
#placesList .item .marker_14 {
    background-position: 0 -608px;
}
#placesList .item .marker_15 {
    background-position: 0 -654px;
} */
</style>