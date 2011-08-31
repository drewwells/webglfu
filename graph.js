var arr = [
    0, 12,
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

        return cleanArr;
    }
    var matrix = prepareData( arr ),
        iindices = Math.floor( matrix.length / 3 );

    var graph = new PhiloGL.O3D.Model({
        vertices: matrix,
        colors: [ 1, 0, 0, 1 ],
        indices: [ ]//0, 3, iindices - 2 ]

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
                camera = app.camera,
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
            function drawScene(){

                gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT );
                //Draw triangle
                graph.position.set(-10, -6, -20);
                graph.rotation.set(0, rTri, 0);
                setupElement( graph );
                program.setBuffer('graph');
                gl.drawArrays( gl.TRIANGLE_STRIP, 0, Math.floor( graph.$verticesLength / 3 ));
                
                program.setBuffer('indices', {
                    value: graph.indices,
                    bufferType: gl.ELEMENT_ARRAY_BUFFER,
                    size: 1
                });
                gl.drawElements( gl.TRIANGLE_STRIP, graph.indices.length, gl.UNSIGNED_SHORT, 0 );

                // program.setBuffer('indices', {
                //     value: triangle.indices,
                //     bufferType: gl.ELEMENT_ARRAY_BUFFER,
                //     size: 1
                // });
                // gl.drawElements(gl.TRIANGLES, triangle.indices.length, gl.UNSIGNED_SHORT,0);

                //Draw square
                //square.position.set(1.5, 0, -7);
                //square.rotation.set(rSquare, 0, 0);
                //setupElement( square );
                //gl.drawArrays( gl.TRIANGLES, 0, triangle.$verticesLength / 3 );
                //These needed for cube
                // program.setBuffer('indices', {
                //     value: square.indices,
                //     bufferType: gl.ELEMENT_ARRAY_BUFFER,
                //     size: 1
                // });
                // gl.drawElements(gl.TRIANGLES, square.indices.length, gl.UNSIGNED_SHORT, 0);
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


