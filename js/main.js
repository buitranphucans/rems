/*
    Đây là trang Web từ dự án Trạm Quan Trắc Môi Trường Thời Gian Thực REMS.
    Hoàn toàn được thực hiện bởi Bùi Trần Phúc An.
    Nếu muốn xem thêm chi tiết hãy vào trang Web Github chính thức: 
    Lưu ý: Các dòng mã trên trang Web này có sự giúp đỡ của AI.
    Rất cảm ơn khi bạn đã ghé thăm trang Web!
*/

// Nhập các thư viện cần thiết cho Firebase.
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.13.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.13.0/firebase-analytics.js";
// Nhập thư viện Auththentication và Realtime Database.
import { getAuth, GoogleAuthProvider, signInWithPopup, signInWithRedirect, getRedirectResult } from "https://www.gstatic.com/firebasejs/12.13.0/firebase-auth.js";
import { getDatabase, ref, onValue } from "https://www.gstatic.com/firebasejs/12.13.0/firebase-database.js";
// Cấu hình Firebase.
const firebaseConfig = {
    apiKey: "AIzaSyDoQxAA16VliHVL69145HHuVcJMAOnMX-s",
    authDomain: "tram-quan-trac-moi-truong.firebaseapp.com",
    databaseURL: "https://tram-quan-trac-moi-truong-default-rtdb.firebaseio.com",
    projectId: "tram-quan-trac-moi-truong",
    storageBucket: "tram-quan-trac-moi-truong.firebasestorage.app",
    messagingSenderId: "803660430786",
    appId: "1:803660430786:web:d532b84b8b0e6c888baa5b",
    measurementId: "G-WY8338J0RY"
};

// Khởi tạo Firebase và hệ thống phân loại dữ liệu.
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
// Khởi tạo Authentication(Xác thực), Hệ thống Đăng Nhập hoặc Đăng Ký (signInWithPopup cho máy tính, signInWithRedirect cho điện thoại) và Realtime Database(Cơ sở dữ liệu được sử dụng).
const auth = getAuth(app);
//const provider = new GoogleAuthProvider();
const database = getDatabase(app);
/// Khu vực cho đăng nhập và đăng ký.

/// Khu vực cho biến toàn cục.
// Cảm biến
let nhietDoCVal = 0;
let nhietDoFVal = 0;
let doAmVal = 0;
let anhSangVal = 0;
let khongKhiVal = 0;
let muaVal = "";
let lastUpdate = "";
// Đặt các vị trí ban đầu.
let latitude = 10.600253;
let longitude = 105.83831;
let altitude = 14;
// Điểm và trạng thái.
let score;
let status = "";
let online;
// Biến cho tên trạm và mã trạm đang được sử dụng.
let tenTramHienTai = "Tram1";
let maTramHienTai = "";
// Biến cho phiên bản.
let version = "1.5";
/// Khu vực cho biểu đồ.
// Nhiệt độ C.
const ctxC = document.getElementById('nhietDoC_Chart'); // Biến lấy phần tử canvas có id "nhietDoC_Chart" để vẽ biểu đồ nhiệt độ C. Biến này sẽ được sử dụng để tạo biểu đồ bằng thư viện Chart.js.
const nhietDoC_Chart = new Chart(ctxC, { // Biến nhietDoC_Chart để tạo biểu đồ nhiệt độ C.
    type: 'line', // Đặt loại biểu đồ là biểu đồ đường (Line Chart).
    data: { // Dữ liệu cho biểu đồ.
        labels: [], // Mảng rỗng để lưu trữ nhãn cho trục x (thời gian cập nhật).
        datasets: [{ // Mảng chứa các tập dữ liệu (datasets) cho biểu đồ.
            label: 'Nhiệt độ C', // Chữ hiển thị trong chú thích của biểu đồ.
            data: [], // Mảng rỗng để lưu trữ giá trị nhiệt độ C sẽ được cập nhật từ Firebase.
            borderWidth: 2, // Bo viền của đường biểu đồ có độ dày là 2 pixel.

        }]
    },
    options: { // Cài đặt thông số biểu đồ.
        responsive: true, // Biểu đồ sẽ tự động điều chỉnh kích thước để phù hợp với kích thước của phần tử chứa nó.
        scales: { // Cài đặt cho các trục tọa đồ của biểu đồ.
            x: { // Trục x nằm ngang (thời gian cập nhật).
                title: { // Cài đặt tiêu đề cho trục x.
                    display: true, // Bật tính năng hiển thị chữ cho trục x.
                    text: 'Ngày/Tháng/Năm Giờ:Phút:Giây' // Đặt chữ là giá trị.
                }
            },
            y: { // Trục y nằm dọc (giá trị dữ liệu được cập nhật).
                beginAtZero: true, // Bắt đầu từ vị trí 0.
                title: { // Cài đặt tiêu đề cho trục y.
                    display: true,
                    text: 'Nhiệt độ °C'
                }
            }
        }
    }
});
// Nhiệt độ F.
const ctxF = document.getElementById('nhietDoF_Chart');
const nhietDoF_Chart = new Chart(ctxF, {
    type: 'line',
    data: {
        labels: [],
        datasets: [{
            label: 'Nhiệt độ F',
            data: [],
            borderWidth: 2,

        }]
    },
    options: {
        responsive: true,
        scales: {
            x: {
                title: {
                    display: true,
                    text: 'Ngày/Tháng/Năm Giờ:Phút:Giây'
                }
            },
            y: {
                beginAtZero: true,
                title: {
                    display: true,
                    text: 'Nhiệt độ °F'
                }
            }
        }
    }
});
// Độ ẩm.
const ctxAm = document.getElementById('doAm_Chart');
const doAm_Chart = new Chart(ctxAm, {
    type: 'line',
    data: {
        labels: [],
        datasets: [{
            label: 'Độ ẩm',
            data: [],
            borderWidth: 2,
        }]
    },
    options: {
        responsive: true,
        scales: {
            x: {
                title: {
                    display: true,
                    text: 'Ngày/Tháng/Năm Giờ:Phút:Giây'
                }
            },
            y: {
                beginAtZero: true,
                title: {
                    display: true,
                    text: 'Độ ẩm %'
                }
            }
        }
    }
});
// Ánh sáng.
const ctxSang = document.getElementById('anhSang_Chart');
const anhSang_Chart = new Chart(ctxSang, {
    type: 'line',
    data: {
        labels: [],
        datasets: [{
            label: 'Ánh sáng',
            data: [],
            borderWidth: 2,
        }]
    },
    options: {
        responsive: true,
        scales: {
            x: {
                title: {
                    display: true,
                    text: 'Ngày/Tháng/Năm Giờ:Phút:Giây'
                }
            },
            y: {
                beginAtZero: true,
                title: {
                    display: true,
                    text: 'Ánh sáng Lux'
                }
            }
        }
    }
});
// Không khí.
const ctxKhi = document.getElementById('khongKhi_Chart');
const khongKhi_Chart = new Chart(ctxKhi, {
    type: 'line',
    data: {
        labels: [],
        datasets: [{
            label: 'Không khí',
            data: [],
            borderWidth: 2,
        }]
    },
    options: {
        responsive: true,
        scales: {
            x: {
                title: {
                    display: true,
                    text: 'Ngày/Tháng/Năm Giờ:Phút:Giây'
                }
            },
            y: {
                beginAtZero: true,
                title: {
                    display: true,
                    text: 'Không khí PPM'
                }
            }
        }
    }
});

console.log(version); // In ra phiên bản của trang Web.
// Lấy dữ liệu từ trạm 1 đầu
loadStation("Tram1"); // Tải dữ liệu của trạm mặc định khi trang Web được mở.

const tramSelect = document.getElementById("tramSelect");
tramSelect.addEventListener("change", (event) => {
    tenTramHienTai = event.target.value; // Lấy giá trị trạm được chọn.
    loadStation(tenTramHienTai); // Gọi hàm để tải dữ liệu của trạm mới.
    // Xóa các biểu đồ khi đổi trạm tránh vẽ nhầm dữ liệu của trạm trước đó.
    // Biểu đồ nhiệt độ C.
    nhietDoC_Chart.data.labels = []; // (Biểu đồ nhiệc độ C).(dữ liệu).(bảng trục x là ngày tháng năm) = (rỗng).
    nhietDoC_Chart.data.datasets[0].data = []; // (Biểu đồ nhiệt độ C).(dữ liệu).(mảng chứa dữ liệu gồm trục y, cảm biến, bo viền).(dữ liệu) = (rỗng).
    nhietDoC_Chart.update(); // (Biểu đồ nhiệt độ C).(cập nhật).
    // Biểu đồ nhiệt độ F.
    nhietDoF_Chart.data.labels = [];
    nhietDoF_Chart.data.datasets[0].data = [];
    nhietDoF_Chart.update();
    // Biểu đồ độ ẩm.
    doAm_Chart.data.labels = [];
    doAm_Chart.data.datasets[0].data = [];
    doAm_Chart.update();
    // Biểu đồ ánh sáng.
    anhSang_Chart.data.labels = [];
    anhSang_Chart.data.datasets[0].data = [];
    anhSang_Chart.update();
    // Biểu đồ không khí.
    khongKhi_Chart.data.labels = [];
    khongKhi_Chart.data.datasets[0].data = [];
    khongKhi_Chart.update();
});

function loadStation(tenTram) {
    // console.log("Trạm hiện tại:", tenTram);
    const LastUpdateRef = ref(database, `/${tenTram}/CapNhat`);
    onValue(LastUpdateRef, (snapshot) => {
        lastUpdate = snapshot.val();

        if (lastUpdate === null) {
            console.log("Không có dữ liệu cập nhật");
        }
    });
    const onlineUpdateRef = ref(database, `/${tenTram}/Mo`);
    onValue(onlineUpdateRef, (snapshot) => {
        online = snapshot.val();
        if (online == 1) {
            document.getElementById("online").innerHTML = "Đang bật";
        } else {
            document.getElementById("online").innerHTML = "Đang tắt";
        }
    });
    // Cập nhật nhiệt độ C.
    const nhietDoCRef = ref(database, `/${tenTram}/NhietDoC`);
    onValue(nhietDoCRef, (snapshot) => {
        nhietDoCVal = Number(snapshot.val()); // Lấy giá trị nhiệt độ C từ Firebase và chuyển đổi sang kiểu số.
        document.getElementById("nhietDoC").innerHTML = nhietDoCVal + " °C"; // Hiển thị giá trị nhiệt độ C trên trang Web.
        // Cập nhật biểu đồ nhiệt độ C.
        // Nếu không có dữ liệu nhiệt độ C thì: ...
        if (nhietDoCVal === null) { 
            nhietDoC.innerHTML = "Không có dữ liệu nhiệt độ C"; // Hiển thị dòng "Không có dữ liệu nhiệt độ C" trên trang Web.
        }
        nhietDoC_Chart.data.labels.push(lastUpdate); // Thêm nhãn thời gian cập nhật vào biểu đồ nhiệt độ C.
        nhietDoC_Chart.data.datasets[0].data.push(nhietDoCVal); // Thêm giá trị nhiệt độ C vào biểu đồ.
        if (nhietDoC_Chart.data.labels.length > 10) { // Nếu số lượng nhãn trên biểu đồ vượt quá 10, loại bỏ nhãn cũ nhất và giá trị cũ nhất để giữ biểu đồ gọn gàng.
            nhietDoC_Chart.data.labels.shift();
            nhietDoC_Chart.data.datasets[0].data.shift();
        }
        nhietDoC_Chart.update(); // Cập nhật biểu đồ nhiệt độ C.
        calculateScore(); // Gọi hàm tính toán điểm môi trường dựa trên các giá trị cảm biến.
        updatePopup(); // Gọi hàm cập nhật Popup.
    });
    // Cập nhật nhiệt độ F.
    const nhietDoFRef = ref(database, `/${tenTram}/NhietDoF`);
    onValue(nhietDoFRef, (snapshot) => {
        nhietDoFVal = Number(snapshot.val());
        document.getElementById("nhietDoF").innerHTML = nhietDoFVal + " °F";
        // Cập nhật biểu đồ nhiệt độ F.
        if (nhietDoFVal === null) {
            nhietDoF.innerHTML = "Không có dữ liệu nhiệt độ F";
        }
        nhietDoF_Chart.data.labels.push(lastUpdate);
        nhietDoF_Chart.data.datasets[0].data.push(nhietDoFVal);
        if (nhietDoF_Chart.data.labels.length > 10) {
            nhietDoF_Chart.data.labels.shift();
            nhietDoF_Chart.data.datasets[0].data.shift();
        }
        nhietDoF_Chart.update();
        calculateScore();
        updatePopup();
    });
    // Cập nhật độ ẩm.
    const doAmRef = ref(database, `/${tenTram}/DoAm`);
    onValue(doAmRef, (snapshot) => {
        doAmVal = Number(snapshot.val());
        document.getElementById("doAm").innerHTML = doAmVal + " %";
        if (doAmVal === null) {
            doAm.innerHTML = "Không có dữ liệu độ ẩm";
        }
        doAm_Chart.data.labels.push(lastUpdate);
        doAm_Chart.data.datasets[0].data.push(doAmVal);
        if (doAm_Chart.data.labels.length > 10) {
            doAm_Chart.data.labels.shift();
            doAm_Chart.data.datasets[0].data.shift();
        }
        doAm_Chart.update();
        calculateScore();
        updatePopup();
    });
    // Cập nhật ánh sáng.
    const anhSangRef = ref(database, `/${tenTram}/AnhSang`);
    onValue(anhSangRef, (snapshot) => {
        anhSangVal = Number(snapshot.val());
        document.getElementById("anhSang").innerHTML = anhSangVal + " lux";
        // Cập nhật biểu đồ nhiệt độ C.
        if (anhSangVal === null) {
            anhSang.innerHTML = "Không có dữ liệu ánh sáng";
        }
        anhSang_Chart.data.labels.push(lastUpdate);
        anhSang_Chart.data.datasets[0].data.push(anhSangVal);
        if (anhSang_Chart.data.labels.length > 10) {
            anhSang_Chart.data.labels.shift();
            anhSang_Chart.data.datasets[0].data.shift();
        }
        anhSang_Chart.update();
        calculateScore();
        updatePopup();
    });
    // Cập nhật không khí.
    const khongKhiRef = ref(database, `/${tenTram}/PPM`);
    onValue(khongKhiRef, (snapshot) => {
        khongKhiVal = Number(snapshot.val());
        document.getElementById("khongKhi").innerHTML = khongKhiVal + " PPM";
        // Cập nhật biểu đồ nhiệt độ C.
        if (khongKhiVal === null) {
            khongKhi.innerHTML = "Không có dữ liệu không khí";
        }
        khongKhi_Chart.data.labels.push(lastUpdate);
        khongKhi_Chart.data.datasets[0].data.push(khongKhiVal);
        if (khongKhi_Chart.data.labels.length > 10) {
            khongKhi_Chart.data.labels.shift();
            khongKhi_Chart.data.datasets[0].data.shift();
        }
        khongKhi_Chart.update();

        calculateScore();
        updatePopup();
    });
    // Cập nhật mưa.
    const muaRef = ref(database, `/${tenTram}/Mua`);
    onValue(muaRef, (snapshot) => {
        muaVal = snapshot.val();
        document.getElementById("mua").innerHTML = muaVal;
        if (muaVal === true) { // Nếu giá trị = đúng thì: ...
            mua.innerHTML = "Có mưa"; // Hiển thị có mưa.
        }
        if (muaVal === false) { // Nếu giá trị mưa = không đúng thì: ...
            mua.innerHTML = "Không có mưa"; // Hiển thị không có mưa.
        } 
        if (muaVal === null) { // Nếu giá trị mưa = không xác định thì: ...
            mua.innerHTML = "Không có dữ liệu mưa"; // Hiển thị không có dữ liệu mưa.
        }
        
        calculateScore();
        updatePopup();
    });
    // Lấy dữ liệu GPS từ Firebase và cập nhật bản đồ nếu có dữ liệu mới.
    // Vĩ độ.
    const GPS_LatitudeRef = ref(database, `/${tenTramHienTai}/ViDo`);
    // Kinh độ.
    const GPS_LongitudeRef = ref(database, `/${tenTramHienTai}/KinhDo`);
    // Độ cao.
    const GPS_AltitudeRef = ref(database, `/${tenTramHienTai}/DoCao`);
    // Đọc vĩ độ.
    onValue(GPS_LatitudeRef, (snapshot) => {
        latitude = snapshot.val();
        updateMap();
        //  console.log("Vi do: ", latitude); // Lệnh in ra vĩ độ, giúp dễ dàng trong việc kiểm tra.
    });
    // Đọc kinh độ.
    onValue(GPS_LongitudeRef, (snapshot) => {
        longitude = snapshot.val();
        updateMap();
        //  console.log("Kinh do: ", longitude);
    });
    // Đọc độ cao.
    onValue(GPS_AltitudeRef, (snapshot) => {
        altitude = snapshot.val();
        updateMap();
        //  console.log("Độ cao: ", altitude);
    });

    //    calculateScore();
    //    updatePopup();
}


//// Dành cho phần bản đồ.
// Tạo map, thiết lập góc nhìn.
const map = L.map('map').setView([latitude, longitude], altitude);
// Tạo lớp bản đồ từ OpenStreetMap.
L.tileLayer(
    'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    {
        attribution: '&copy; OpenStreetMap contributors'
    },

).addTo(map);

// Tạo Marker.
const marker = L.marker([latitude, longitude]).addTo(map);
// Thiết kế một bảng nhỏ(Popup) có các dữ liệu cơ bản.
function updatePopup() {
    marker.bindPopup(`
    <div style="font-family: Arial; min-width: 220px;">
        <h3>Trạm Quan Trắc Môi Trường Thời Gian Thực REMS</h3>
        <hr>
            <b>- Vĩ độ:</b>
            ${latitude}
            <br>

            <b>- Kinh độ:</b>
            ${longitude}
            <br>

            <b>- Nhiệt độ C:</b>
            ${nhietDoCVal} °C
            <br>

            <b>- Nhiệt độ F:</b>
            ${nhietDoFVal} °F
            <br>

            <b>- Độ ẩm:</b>
            ${doAmVal} %
            <br>

            <b>- Không khí:</b>
            ${khongKhiVal} PPM
            <br>

            <b>- Điểm môi trường:</b>
            ${score}/100
            <br>

            <b>- Trạng thái:</b>
            ${status}
    </div>
    `)
}

// Dành cho chế độ Dark Mode.
const btn = document.getElementById('dark-mode');
const currentTheme = localStorage.getItem('theme');
// Kiểm tra nếu lần trước người dùng đã chọn Dark Mode, tự động bật lại.
if (currentTheme === 'dark') {
    document.body.classList.add('dark-mode');
}
// Lắng nghe hành động click chuột vào nút bấm.
btn.addEventListener('click', function () {
    // Tự động thêm class "dark" nếu chưa có, hoặc xóa đi nếu đã có.
    document.body.classList.toggle('dark-mode');
    // Kiểm tra trạng thái hiện tại để lưu vào bộ nhớ máy tính (localStorage).
    if (document.body.classList.contains('dark-mode')) {
        localStorage.setItem('theme', 'dark'); // Lưu trạng thái tối.
    } else {
        localStorage.setItem('theme', 'light'); // Lưu trạng thái sáng.
    }
});

// Hàm Update bản đồ và marker khi có dữ liệu mới.
function updateMap() {
    // Di chuyển marker.
    marker.setLatLng([latitude, longitude]);
    // Di chuyển camera.
    map.setView([latitude, longitude], altitude);

    updatePopup();
}
// Hàm tính toán điểm.
function calculateScore() {
    let warningMessages = [];
/*
    console.log("Đang tính điểm cho:", tenTramHienTai);
    console.log(nhietDoCVal, doAmVal, anhSangVal, khongKhiVal);
*/
/*  console.log("Tên trạm hiện tại: " + tenTramHienTai);
    console.log("Nhiệt độ:", nhietDoCVal);
    console.log("Nhiệt độ F:", nhietDoFVal);
    console.log("Độ ẩm:", doAmVal);
    console.log("Ánh sáng:", anhSangVal);
    console.log("PPM:", khongKhiVal); */

    score = 100; // Điểm tối đa là 100.
    // So sánh nhiệt độ.
    if (nhietDoCVal >= 40) {
        score -= 25;
        warningMessages.push("Nhiệt độ rất cao");
        document.getElementById("solution").innerHTML = "Tránh ra ngoài vào những ngày nắng nóng";
    }
    if (nhietDoCVal <= 27) {
        score -= 25;
        warningMessages.push("Nhiệt độ rất thấp");
        document.getElementById("solution").innerHTML = "Mặc thêm áo ấm và hạn chế ra ngoài vào những ngày lạnh";
    }
    // Độ ẩm.
    if (doAmVal <= 40) {
        score -= 25;
        warningMessages.push("Độ ẩm rất thấp");
        document.getElementById("solution").innerHTML = "Sử dụng kem dưỡng ẩm, uống nhiều nước hoặc sử dụng máy tạo độ ẩm để tăng độ ẩm trong không khí";
    }
    if (doAmVal >= 85) {
        score -= 25;
        warningMessages.push("Độ ẩm rất cao");
        document.getElementById("solution").innerHTML = "Đóng kín cửa sổ, dùng máy hút ẩm hoặc sử dụng điều hòa để giảm độ ẩm trong không khí";
    }
    // Ánh sáng.
    if (anhSangVal <= 200) {
        score -= 20;
        warningMessages.push("Ánh sáng yếu");
        document.getElementById("solution").innerHTML = "Trời tối, hãy bật đèn hoặc sử dụng đèn pin để đảm bảo an toàn khi di chuyển";
    }
    if (anhSangVal >= 200) {
        score -= 10;
        warningMessages.push("Ánh sáng mạnh");
        document.getElementById("solution").innerHTML = "Trời có nhiều nắng, hãy sử dụng kem chống nắng và đeo kính râm để bảo vệ da và mắt";
    }
    // Không khí.
    if (khongKhiVal >= 900) {
        score -= 30;
        warningMessages.push("Không khí ô nhiễm");
        document.getElementById("solution").innerHTML = "Mang thêm khẩu trang, hạn chế ra ngoài hoặc sử dụng máy lọc không khí trong nhà";
    }
/*  console.log(document.getElementById("score"));
    console.log(document.getElementById("status"));
    console.log("Score =", score);
    console.log("Status =", status); */

    // Các hiện tượng thời tiết.
    // Trời nắng gắt.
    if (nhietDoCVal >= 35 || doAmVal <= 50 || anhSangVal > 50000 || muaVal === false) {
        score -= 40;
        document.getElementById("weather").innerHTML = "Trời nắng gắt, hạn chế ra ngoài trời!";
    }
    // Trời mưa, bão.
    if (nhietDoCVal <= 29 || doAmVal >= 85 || anhSangVal <= 10000 || muaVal === true) {
        score -= 40;
        document.getElementById("weather").innerHTML = "Trời mưa lạnh, mặc thêm áo ấm nếu lạnh và hạn chế ra ngoài!";        
    }
    // Trời ẩm, nồm.
    if (nhietDoCVal >= 18 || doAmVal >= 90 || anhSangVal <= 5000 || muaVal === false)  {
        score -= 35;
        document.getElementById("weather").innerHTML = "Trời nồm có độ ẩm cao, nên sử dụng máy hút ẩm, cẩn thận khi di chuyển trên nền gạch trơn trượt!";
    }
    // Trời khô.
    if (nhietDoCVal >= 15 || doAm <= 40 || muaVal === false) {
        score -= 35;
        document.getElementById("weather").innerHTML = "Thời tiết khô, chú ý dưỡng ẩm da và uống nước nhiều hơn!";
    }
    // Không cho âm điểm.
    if (score < 0) {
        score = 0;
    }
    // Hiển thị điểm.
    document.getElementById("score").innerHTML = score + "/100";
    // Tính toán xếp loại.
    if (score >= 80) {
        status = "Môi Trường tốt";
    }
    else if (score >= 50) {
        status = "Môi trường trung bình";
    }
    else {
        status = "Môi trường tệ";
    }

    document.getElementById("status_2").innerHTML = warningMessages.join("<br>");
    // Hiển thị trạng thái.
    document.getElementById("status").innerHTML = status;
}

