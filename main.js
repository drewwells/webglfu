var arr = [ 
    0, 0,
    1, 10,
    1, 0,
        2, 8,
    2, 0,
    3, 13,
    3, 0,
    4, 7,
    4, 0,
    5, 12,
    5, 0,
    6, 6,
    6, 0,
    7, 8,
    7, 0,
    8, 12,
    8, 0,
    9, 4,
    9, 0,
    10, 8,
    10, 0
          ];



function webGLStart() {
    var z = 0, i = 0, cleanArr = [];
    for( i = 0; i < arr.length; i = i + 1 ){

        if( i && i % 2 === 0 ){
            cleanArr.push( z );
        }

        cleanArr.push ( arr[i] );
    }

    if( i && i % 2 === 0 ){ cleanArr.push( z ); }

    var graph = new PhiloGL.O3D.Model({
        vertices: cleanArr,
        colors: [ 1, 0, 0, 1 ]

    });
    var triangle = new PhiloGL.O3D.Model({
        vertices: [
            //right
                   0, 1, 0, //tl
                   0, 1, -1,//tr
                   1, -1, -1,//br
                   1, -1, 0,//bl
            //bottom
                   1, -1, 0,  //tl
                   1, -1, -1, //tr
                   -1, -1, -1,//br
                   -1, -1, 0, //bl
            //left
            //        0, 1, -1,
            //        0, 1, 0,
            //        -1, -1, 0,
            //        -1, -1, -1,
            // //front
            //        0, 1, 0, 
            //        1, -1, 0,
            //        -1, -1, 0, 
            // //back
            //        0, 1, -1, 
            //        1, -1, -1,
            //        -1, -1, -1 
                  ],
        //Define triangles to fill squares above
        indices: [ 0, 1, 2,  0, 2, 3, //right
                   4, 6, 7,  4, 5, 6, //bottom

                    8,10,11,  8, 9,10, //left
                   10,12,9
                   // 12,13,14, //front
                   // 15,16,17 //back
                 ],
        colors: [
                 1, 0, 0, 1, //left
                 // 1, 0, 0, 1, 
                 // 0, 1, 0, 1,
                 // 0, 1, 0, 1,

                 // 0, 1, 0, 1, //bottom
                 // 0, 1, 0, 1, 
                 // 0, 0, 1, 1,
                 // 0, 0, .5, 1,

                 // 1, 0, 0, 1, //right
                 // 1, 0, 0, 1, 
                 // 0, 0, .5, 1,
                 // 0, 0, .5, 1,

                 // 1, 0, 0, 1, //front
                 // 0, 1, 0, 1, 
                 // 0, 0, 1, 1,

                 // 1, 0, 0, 1, //back
                 // 0, 1, 0, 1, 
                 // 0, 0, 1, 1
                ]
    }),
    square = new PhiloGL.O3D.Model({
        vertices: [1, 1, 0, 
                   -1, 1, 0, 
                   1, -1, 0, 
                   -1, -1, 0],
        colors: [0.5, 0.5, 1, 1, 
                 0.5, 0.5, 1, 1, 
                 0.5, 0.5, 1, 1, 
                 0.5, 0.5, 1, 1]
    });


    square = new PhiloGL.O3D.Model({
        vertices: [-1, -1,  1,
                   1, -1,  1,
                   1,  1,  1,
                   -1,  1,  1,

                   -1, -1, -1,
                   -1,  1, -1,
                   1,  1, -1,
                   1, -1, -1,

                   -1,  1, -1,
                   -1,  1,  1,
                   1,  1,  1,
                   1,  1, -1,

                   -1, -1, -1,
                   1, -1, -1,
                   1, -1,  1,
                   -1, -1,  1,

                   1, -1, -1,
                   1,  1, -1,
                   1,  1,  1,
                   1, -1,  1,

                   -1, -1, -1,
                   -1, -1,  1,
                   -1,  1,  1,
                   -1,  1, -1],
        indices: [0, 1, 2, 0, 2, 3,
                  4, 5, 6, 4, 6, 7,
                  8, 9, 10, 8, 10, 11,
                  12, 13, 14, 12, 14, 15,
                  16, 17, 18, 16, 18, 19,
                  20, 21, 22, 20, 22, 23],
        colors: [1, 0, 0, 1, 
                 1, 0, 0, 1,
                 1, 0, 0, 1,
                 1, 0, 0, 1,
                 1, 1, 0, 1, 
                 1, 1, 0, 1, 
                 1, 1, 0, 1, 
                 1, 1, 0, 1, 
                 0, 1, 0, 1, 
                 0, 1, 0, 1, 
                 0, 1, 0, 1, 
                 0, 1, 0, 1, 
                 1, 0.5, 0.5, 1, 
                 1, 0.5, 0.5, 1, 
                 1, 0.5, 0.5, 1, 
                 1, 0.5, 0.5, 1, 
                 1, 0, 1, 1, 
                 1, 0, 1, 1, 
                 1, 0, 1, 1, 
                 1, 0, 1, 1, 
                 0, 0, 1, 1,
                 0, 0, 1, 1,
                 0, 0, 1, 1,
                 0, 0, 1, 1]
    });

    PhiloGL('lesson02-canvas', {
        program: {
            from: 'ids',
            vs: 'shader-vs',
            fs: 'shader-fs'
        },
        onError: function() {
            alert("An error ocurred while loading the application");
        },
        onLoad: function(app) {
            var gl = app.gl,
                canvas = app.canvas,
                program = app.program,
                camera = app.camera,
                view = new PhiloGL.Mat4(),
                rTri = 0, rSquare = 0;

            gl.viewport(0, 0, canvas.width, canvas.height);
            gl.clearColor(0, 0, 0, 1);
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


