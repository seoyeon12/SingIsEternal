<template>
  <div>
      <button id="toggle_btn" v-bind:class="[isActive ? 'show' : 'hide']" @click="toggleClass()">교통정보 보기</button>
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
      lat: 36.871400, // 현 위치 (기본값 : 36.871400)
      lon: 128.601400, // 현 위치 (기본값 : 128.601400)
      error: '',
      keyword: '동전노래방', // 검색 키워드
      infowindow: '', // 인포윈도우
      markers: {}, // 검색 결과 마커
      nowMarker: null, // 현 위치 마커
      hour: 0, // 현 시간
      minute: 0, // 현 분
      openHour: 23, // 오픈 시간 (기본값 : 23)
      closeHour: 3, // 닫는 시간 (기본값 : 3)
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
    // 1
    // Map Init Methods
    initMap () {

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
    // 2 (geolocation가 지원된다면)
    // 현재 위치 지도 Center 설정 Methods
    showPosition (position) {
      this.lat = position.coords.latitude
      this.lon = position.coords.longitude

      this.map.setCenter(new kakao.maps.LatLng(this.lat, this.lon))
      this.getTime() // 현재 시간 세팅
      this.displayMarker(this.lat, this.lon) // 현재 위치 마커생성 함수
      this.singingRoom() // 노래방 검색
    },
    // 3 , (10-1)
    // 현재 시간 알기
    getTime () {
      let today = new Date() 
      this.hour = today.getHours()
      this.minute = today.getMinutes()
    },
    // 4
    // 현재 위치 마커생성 함수
    displayMarker (lat, lon) {
      this.nowMarker = new kakao.maps.Marker({
        map: this.map,
        position: new kakao.maps.LatLng(lat, lon)
      })
      this.nowMarker.setMap(this.map)
    },
    // 5
    // 노래방 검색
    singingRoom () {
      // 장소 검색 객체를 생성
      var ps = new kakao.maps.services.Places()
      // 장소 검색 options
      var bound = this.get_bounds()
      var options = {
        location: new kakao.maps.LatLng(this.lat, this.lon),
        useMapCenter: true, // 현재 적용된 Map의 중심좌표 사용여부
        page: 5, // 검색할 페이지 개수는 5페이지.
        bounds: bound // 현재 지도의 level 즉, 확대 정도를 기준으로 검색
        // radius: 2000 // 2km 내외로 검색
      }
      // 인포윈도우 생성
      this.infowindow = new kakao.maps.InfoWindow({zIndex: 1});
      // 장소검색 객체를 통해 키워드로 장소검색을 요청 (성공시 6(placesSearchCB)으로)
      ps.keywordSearch(this.keyword, this.placesSearchCB, options)
    },
    get_bounds () {
      var bounds = this.map.getBounds();
      return bounds;
    },
    // 6
    // 장소검색 완료 시 호출되는 콜백함수
    placesSearchCB (data, status, pagination) {
      if (status === kakao.maps.services.Status.OK) {
        // 검색이 OK 시 검색 목록과 마커 표출 (7,displayPlaces)
        this.displayPlaces(data)
        // 페이지 번호 표출 (7-1,displayPagination)
        this.displayPagination(pagination)
      } else if (status === kakao.maps.services.Status.ZERO_RESULT) {
        alert('검색 결과가 존재하지 않습니다.')
      } else if (status === kakao.maps.services.Status.ERROR) {
        alert('검색 결과 중 오류가 발생했습니다.')
      }
    },
    // 7
    // 검색 결과 목록과 마커 표출 함수
    displayPlaces (places) {
      var listEl = document.getElementById('placesList')
      var menuEl = document.getElementById('menu_wrap')
      var fragment = document.createDocumentFragment()
      // (marker에 따른 지도 적용) 
      // var bounds = new kakao.maps.LatLngBounds()

      // 검색 결과 목록에 추가된 항목 제거 (8, removeAllChildNods)
      this.removeAllChildNods(listEl)
      // 지도에 표시되고 있는 마커 제거 (9, removeMarker)
      this.removeMarker()

      var infoWindowThis = this.infowindow // this.infowindow 설정
      var mapThis = this.map // this.map 설정

      for (var i = 0; i < places.length; i++) {
        // 마커를 생성, 지도 표시
        var placePosition = new kakao.maps.LatLng(places[i].y, places[i].x)

        //// 영업시간 TEST Code
          this.openHour = Math.floor(Math.random() * 24) + 1; // 1~24까지 랜덤 시간 발생 시키기
          this.closeHour = this.openHour + 5; // 오픈 시간 + 5시간
          if(this.closeHour > 24){ this.closeHour -= 24; } // 24가 넘어갈 시 -24
        ////

        // 마커 생성 및 지도 위 마커표시 함수 (10, addMarker)
        var marker = this.addMarker(placePosition)
        // 검색 결과 항목 Element 생성 함수 (11, getListItem)
        var itemEl = this.getListItem(i, places[i]);

        // (marker에 따른 지도 적용) 검색된 장소 위치 기준 지도 범위 재설정, LatLngBounds 객체에 좌표 추가
        // bounds.extend(placePosition);

        // 마커와 검색결과 항목에 mouseover, mouseout 시
        // 해당 장소의 인포윈도우에 장소명을 표시 및 닫기
        (function (marker, title) {
          // marker 마우스 오버 아웃 이벤트
          kakao.maps.event.addListener(marker, 'mouseover', function () {
            var content = '<div class="infowindows">' + title + '</div>'

            infoWindowThis.setContent(content)
            infoWindowThis.open(mapThis, marker)
          })

          kakao.maps.event.addListener(marker, 'mouseout', function () {
            infoWindowThis.close()
          })

          // 검색목록 마우스 오버 아웃 이벤트
          itemEl.onmouseover = function () {
            var content = '<div class="infowindows">' + title + '</div>'

            infoWindowThis.setContent(content)
            infoWindowThis.open(mapThis, marker)
          }

          itemEl.onmouseout = function () {
            infoWindowThis.close() 
          }
        })(marker, places[i].place_name)

        fragment.appendChild(itemEl)
      }

      // 검색결과 항목들을 검색결과 목록 Elemnet에 추가
      listEl.appendChild(fragment)
      menuEl.scrollTop = 0

      // (marker에 따른 지도 적용) 검색된 장소 위치를 기준으로 지도 범위 재설정
      // this.map.setBounds(bounds)
    },
    // 7-1
    // 검색결과 목록 하단 페이지번호 표시 함수
    displayPagination (pagination) {
      var paginationEl = document.getElementById('pagination')
      var fragment = document.createDocumentFragment()
      var i

      // 기존에 추가된 페이지번호 삭제
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
    // 8
    // 검색결과 목록의 자식 Element 제거(검색 결과 목록에 추가된 항목 제거) 함수
    removeAllChildNods (el) {
      while (el.hasChildNodes()) {
        el.removeChild(el.lastChild)
      }
    },
    // 9
    // 지도 위 표시되고 있는 마커 모두 제거 함수
    removeMarker () {
      for (var i = 0; i < this.markers.length; i++) {
        this.markers[i].setMap(null)
      }
      this.markers = []
    },
    // 10
    // 마커 생성 및 지도 위 마커 표시 함수
    addMarker (position) {
      // 마커 이미지 url, 퍼블릭 이미지 사용
      var imageSrc = 'marker_sing.png'
      // 시간, 분을 넘겨주고 true(영업 중), false(영업 X)를 반환 받는다.
      // 10-1, checkOpen 
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

      marker.setMap(this.map) // 지도 위 마커 표출
      this.markers.push(marker) // 배열에 생성된 마커 추가

      return marker
    },
    // 10-1
    // 영업시간에 따른 영업여부 (파라메터 : 닫는 시간)
    // 영업 중 => return true, 아니면 => return false
    checkOpen() {
      // 3
      this.getTime()

      console.log( "오픈시간 : 닫는시간 " + this.openHour + ':' + this.closeHour)
      //오픈시간 <= 현시간 <= 닫는시간
      if(this.openHour <= this.hour && this.hour <= this.closeHour){
        return true
      }else{
        return false
      }
    },
    // 11
    // 검색결과 항목을 Element로 반환하는 함수
    getListItem (index, places) {
      var el = document.createElement('li')
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
    // 교통정보 toggle 버튼 클릭 시
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
    // 현 위치로 재검색 버튼 클릭 시
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

.infowindows{
  padding:5px;
  z-index:1;
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
}
</style>