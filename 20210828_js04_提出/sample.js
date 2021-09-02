//---------現在位置が取得成功時に実行する関数--------
let map;
function mapsInit(position) {
  const lat = position.coords.latitude;
  const lon = position.coords.longitude;  
  map = new Microsoft.Maps.Map('#myMap', {
          center: new Microsoft.Maps.Location(lat, lon), 
          mapTypeId: Microsoft.Maps.MapTypeId.load, 
          zoom: 15 
      });
  pushpin(lat,lon,map);
}

//-----現在地にピンを描画--------------
function pushpin(la,lo,now){
  let location = new Microsoft.Maps.Location(la,lo)
  let pin = new Microsoft.Maps.Pushpin(location, {
  color: 'red',            
  draggable:false,          
  enableClickedStyle:true, 
  enableHoverStyle:true,   
  visible:true             
  });
  now.entities.push(pin);
};

//---------現在位置が取得失敗時に実行する関数--------
function mapsError(error) {
let e = "";
if (error.code == 1) { 
  e = "位置情報が許可されてません";
}
if (error.code == 2) { 
  e = "現在位置を特定できません";
}
if (error.code == 3) { 
  e = "位置情報を取得する前にタイムアウトになりました";
}
alert("エラー：" + e);
};

//-----------------現在地取得と地図描画-----------
function GetMap() {
navigator.geolocation.getCurrentPosition(mapsInit, mapsError);
}

function mapsInit(position) {
    const lat = position.coords.latitude;
    const lon = position.coords.longitude;  
    map = new Microsoft.Maps.Map('#myMap', {
            center: new Microsoft.Maps.Location(lat, lon), 
            mapTypeId: Microsoft.Maps.MapTypeId.load, 
            zoom: 15 
        });
    pushpin(lat,lon,map);
  
  //----------------Direction Moduleの入手-----------------
  //------------------------------------------------------
    Microsoft.Maps.loadModule('Microsoft.Maps.Directions', function () {
          directionsManager = new Microsoft.Maps.Directions.DirectionsManager(map);
    directionsManager.setRenderOptions({itineraryContainer:'#directionsItinerary'});
          directionsManager.showInputPanel('directionsPanel');
      });
  //------------------------------------------------------
  }
  //--------------------ルート記録スタート-------------------
let watchID;
let startWatch;
let key=0;
$("#start_btn").on('click',function(){
  localStorage.clear();
  let lat;
  let lon;
  watchID = navigator.geolocation.watchPosition(function(pos){
  lat = pos.coords.latitude;
  lon = pos.coords.longitude;
  },mapsError);
  startWatch=setInterval(function(){
    let value = lat+","+lon;
    localStorage.setItem(key,value);
    key++;
  },5000);
})

//--------------------ルート記録ストップ-------------------
$("#stop_btn").on('click',function(){
    clearInterval(startWatch);
    navigator.geolocation.clearWatch(watchID);
    let run_record="";
    for(i=0;i<(localStorage.length-1);i++){
        let data=localStorage.getItem(i);
        run_record += data+":"; 
    };
    run_record+=localStorage.getItem(key);
    key+=1;
    localStorage.setItem(key,run_record);
})

$("#write_btn").on('click',function(){
    //-----01:localStorageより座標データ束の取得--------------      
    let data1 = (localStorage.getItem(key)).split(":"); 
    data1.pop();
    let data2=[];
    //---------------02:座標データを25個に調整-------------
    if(data1.length>25){
      data2.push(data1[0]);
      if(data1.length%25 != 0){
        let num1=data1.length/25;
        let count=1;
        while(count<24){
          data2.push(data1[Math.round(count*num1)]);
          count++;
        }
        data2.push(data1.slice(-1)[0]);
      }else{
        let num2=data1.length/25;
        for(i=num2;i<25;i+num2){
          data2.push(data1[i]);
        }
      }        
    }else{
      data2=data1;
    }
    //--------------03:中継点の座標データを追加----------------
    for(i=0;i<data2.length;i++){
      let array = (data2[i]).split(",");
      let lati=array[0];
      let long=array[1];
      Waypoint = new Microsoft.Maps.Directions.Waypoint({ location:new Microsoft.Maps.Location(lati,long)});
      directionsManager.addWaypoint(Waypoint);
    } 

    //------------04:描画ルートを歩行ルートに指定--------------
    let mode= Microsoft.Maps.Directions.RouteMode.walking;
        directionsManager.setRequestOptions({
        routeMode: mode
    });

    //------------05:地図へルートを描画-----------------------
    directionsManager.calculateDirections();    
})
function mapsInit(position) {
    const lat = position.coords.latitude;
    const lon = position.coords.longitude;  
    map = new Microsoft.Maps.Map('#myMap', {
            center: new Microsoft.Maps.Location(lat, lon), 
            mapTypeId: Microsoft.Maps.MapTypeId.load, 
            zoom: 15,
   //----------①地図上の機能ボタンを非表示-------------//
            showZoomButtons:false,    
            showMapTypeSelector:false,
            showScalebar:false,
            showTermsLink:false
        });
    pushpin(lat,lon,map);
  
    Microsoft.Maps.loadModule('Microsoft.Maps.Directions', function () {
          directionsManager = new Microsoft.Maps.Directions.DirectionsManager(map);
    directionsManager.setRenderOptions({itineraryContainer:'#directionsItinerary'});
  //----------②input Panelの消去---------------//
  //----------③中継点の座標ピンの非表示-------------//
    directionsManager.setRenderOptions({
              firstWaypointPushpinOptions:{visible:true},
              lastWaypointPushpinOptions:{visible:true},
              waypointPushpinOptions:{visible:false}
          });  
      });
  }