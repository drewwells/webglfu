var arr = [
    1, 10,
    2, 8,
    3, 13,
    4, 7,
    5, 12,
    6, 6,
    7, 8,
    8, 12,
    9, 4,
    10, 8
];

arr = (function( seed, length, max ){
    var arr = [];
    max = max || 100;
    for( var i = seed; i < length; i++ ){
        arr.push( i, Math.floor( Math.random() * 100 ) );
    }
    return arr;
})( 0, 70 );

function webGLStart() {
    
    function prepareData( arr ){
        var z = 0, i = 0, cleanArr = [];
        for( i = 0; i < arr.length; i = i + 1 ){
            if( i === 0 ){
                cleanArr.push( arr[i], 0, 0 );
            }
            if( i && i % 2 === 0 ){
                cleanArr.push( z );
            }

            cleanArr.push ( arr[i] );
        }
        cleanArr.push( z );
        cleanArr.push( arr[ arr.length - 2 ], 0, 0 );

        return injectPoints( cleanArr );
    }

    //Inject points so every point is ( start, pt, end )
    function injectPoints( arr ){

        var ret = [];

        for( var i = 0, l = arr.length / 3; i < l; i = i + 1 ){
            ret.push( arr[ i*3 ], 0, arr[ i*3 + 2 ],
                    arr[ i*3 ], arr[ i*3 + 1 ], arr[ i*3 + 2 ]);
        }

        return ret;
    }
    
    var matrix = prepareData( arr ),
        iindices = Math.floor( matrix.length / 3 ),
        indices = [];//prepareIndices( matrix );

    var graph = new PhiloGL.O3D.Model({
        vertices: matrix,
        colors: [ 1, 0, 0, 1 ],
        indices: []//indices

    });

    PhiloGL('canvas', {
        program: {
            from: 'ids',
            vs: 'shader-vs',
            fs: 'shader-fs'
        },
        onError: function() {
            console.log( this, arguments );

        },
        onLoad: function(app) {
            var gl = app.gl,
                canvas = app.canvas,
                program = app.program,
                camera = new PhiloGL.Camera( 45, .4/*canvas.width / canvas.height*/, 0.1, 1000 ),//app.camera,
                view = new PhiloGL.Mat4(),
                rTri = 0, rSquare = 0;

            gl.viewport(0, 0, canvas.width, canvas.height);
            gl.clearColor( 211/255, 200/255, 184/255, 1);
            gl.clearDepth(1);
            gl.enable(gl.DEPTH_TEST);
            gl.depthFunc(gl.LEQUAL);
            
            //gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
            camera.view.id();

            function setupElement( elem ){
                //update element matrix
                elem.update();
                //get new view matrix out of element and camera matrices
                view.mulMat42( camera.view, elem.matrix );
                //set buffers with element data
                program.setBuffers({
                    'aVertexPosition': {
                        value: elem.vertices,
                        size: 3
                    },
                    'aVertexColor': {
                        value: elem.colors,
                        size: 4
                    }
                });
                program.setUniform('uMVMatrix', view);
                program.setUniform('uPMatrix', camera.projection);
            }
            console.log( 'Rendered: ', Math.floor( graph.$verticesLength / 3 ) * 3 );
            var camx = -33, camy = -80, camz = -200;
            function drawScene(){

                gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT );
                //Draw triangle
                //camy = camy - 0.1;
                //console.log( camx, camy, camz );
                graph.position.set(camx, camy, camz);
                graph.rotation.set(0, rTri, 0);
                setupElement( graph );
                program.setBuffer('graph');
                gl.drawArrays( gl.TRIANGLE_STRIP, 0, Math.floor( graph.$verticesLength / 3 ));
                
                program.setBuffer('indices', {
                    value: graph.indices,
                    bufferType: gl.ELEMENT_ARRAY_BUFFER,
                    size: 1
                });
                gl.drawElements( gl.TRIANGLES, graph.indices.length, gl.UNSIGNED_SHORT, 0 );

            }

            function animate(){
                //rTri = rTri + 0.05;
                rSquare = rSquare + 0.1;
            }
            (function tick(){

                drawScene();
                animate();
                setTimeout(tick,1000/24);
            })();
            //drawScene();
        }
    });
}


