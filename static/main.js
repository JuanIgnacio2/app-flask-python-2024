/*Función para mostrar mapa*/
function initMap(){
    const coord = {lat:-32.98080397024727, lng:-68.65150534717168};
    const map = new google.maps.Map(document.getElementById("map"), {
        zoom: 10,
        center:coord,
    });
    const marker = new google.maps.Marker({
        position: coord,
        map : map,
    })
}