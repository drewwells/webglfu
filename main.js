var camera, scene, renderer,
    geometry, material, mesh;

function init() {

    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 1, 10000 );
    camera.position.z = 1000;
    scene.add( camera );

    geometry = new THREE.CubeGeometry( 200, 200, 200 );
    material = new THREE.MeshBasicMaterial( { color: 0xff0000, wireframe: true } );

    mesh = new THREE.Mesh( geometry, material );
    scene.add( mesh );

    renderer = new THREE.WebGLRenderer();
    renderer.setSize( 800, 400 );
    document.getElementById("content").appendChild( renderer.domElement );

}

var requestAnimationFrame = function(){};
if( 'mozRequestAnimationFrame' in window ){
    requestAnimationFrame = mozRequestAnimationFrame;
}
if( 'webkitRequestAnimationFrame' in window ){
    requestAnimationFrame = webkitRequestAnimationFrame;
}

function animate() {

    // Include examples/js/RequestAnimationFrame.js for cross-browser compatibility.
    requestAnimationFrame( animate );
    render();
}

function render() {

    mesh.rotation.x += 0.01;
    mesh.rotation.y += 0.02;

    renderer.render( scene, camera );

}

init();
animate();

