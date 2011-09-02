
function webGLStart() {
    var z = 0, i = 0,
        palette = [
            [ 201/255, 96/255, 78/255, 1 ],
            [ 161/255, 59/255, 74/255, 1 ],
            [ 115/255, 42/255, 86/255, 1 ]
        ];

    //Red/Blue/Green array
    // [
    //          1, 0, 0, 1, //right
    //          1, 0, 0, 1, 
    //          0, 1, 0, 1,
    //          0, 1, 0, 1,

    //          0, 1, 0, 1, //bottom
    //          0, 1, 0, 1, 
    //          0, 0, 1, 1,
    //          0, 0, .5, 1,

    //          1, 0, 0, 1, //left
    //          1, 0, 0, 1, 
    //          0, 0, .5, 1,
    //          0, 0, .5, 1,

    //          1, 0, 0, 1, //front
    //          0, 1, 0, 1, 
    //          0, 0, 1, 1,

    //          1, 0, 0, 1, //back
    //          0, 1, 0, 1, 
    //          0, 0, 1, 1
    //         ],

    var colorArr = [],ap = Array.prototype;
    ap.push.apply( colorArr, palette[1] );//right
    ap.push.apply( colorArr, palette[1] );
    ap.push.apply( colorArr, palette[0] );
    ap.push.apply( colorArr, palette[0] );

    ap.push.apply( colorArr, palette[0] );//bottom
    ap.push.apply( colorArr, palette[0] );
    ap.push.apply( colorArr, palette[2] );
    ap.push.apply( colorArr, palette[2] );

    ap.push.apply( colorArr, palette[1] );//left
    ap.push.apply( colorArr, palette[1] );
    ap.push.apply( colorArr, palette[2] );
    ap.push.apply( colorArr, palette[2] );

    ap.push.apply( colorArr, palette[1] );//front
    ap.push.apply( colorArr, palette[0] );
    ap.push.apply( colorArr, palette[2] );

    ap.push.apply( colorArr, palette[1] );//back
    ap.push.apply( colorArr, palette[0] );
    ap.push.apply( colorArr, palette[2] );

    var triangle = new PhiloGL.O3D.Model({
        colors: colorArr,

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
                   0, 1, -1,
                   0, 1, 0,
                   -1, -1, 0,
                   -1, -1, -1,
            //front
                   0, 1, 0, 
                   1, -1, 0,
                   -1, -1, 0, 
            //back
                   0, 1, -1, 
                   1, -1, -1,
                   -1, -1, -1 
                  ],
        //Define triangles to fill squares above
        indices: [  0,  1, 2,  0, 2,  3, //right
                    4,  6, 7,  4, 5,  6, //bottom
                    8, 10, 11, 8, 9, 10, //left
                   10, 12, 9,
                   12, 13, 14, //front
                   15, 16, 17 //back
                 ]
    }),
    square = new PhiloGL.O3D.Model({
        vertices: [ 1, 1, 0, 
                   -1, 1, 0, 
                    1, -1, 0, 
                   -1, -1, 0 ],
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
                   -1,  1, -1
                  ],
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
                rTri = 0;

            gl.viewport(0, 0, canvas.width, canvas.height);
            gl.clearColor( 97/255, 112/255, 88/255, 1);
            gl.clearDepth( 1 );
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

            function drawScene(){

                gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT );

                //Draw triangle
                triangle.position.set(0, 0, -4);
                triangle.rotation.set(0.25*rTri, rTri, 0);
                setupElement( triangle );
                program.setBuffer('triangle');
                gl.drawArrays( gl.TRIANGLES, 0, Math.floor( triangle.$verticesLength / 3 ));
                program.setBuffer('indices', {
                    value: triangle.indices,
                    bufferType: gl.ELEMENT_ARRAY_BUFFER,
                    size: 1
                });
                gl.drawElements(gl.TRIANGLES, triangle.indices.length, gl.UNSIGNED_SHORT,0);

            }

            function animate(){
                rTri = rTri + 0.02;

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


