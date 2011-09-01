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

var $ = function( id ){
    return document.getElementById.apply( document, arguments );
};


arr = (function( seed, length, max ){
    var arr = [];
    max = max || 100;
    for( var i = seed; i < length; i++ ){
        arr.push( i, Math.floor( Math.random() * 100 ) );
    }
    return arr;
})( 0, 70 );

//arr = [0, 95, 1, 61, 2, 91, 3, 12, 4, 87, 5, 0, 6, 89, 7, 34, 8, 11, 9, 7, 10, 41, 11, 66, 12, 29, 13, 57, 14, 97, 15, 54, 16, 71, 17, 65, 18, 35, 19, 78, 20, 6, 21, 44, 22, 84, 23, 9, 24, 26, 25, 0, 26, 1, 27, 24, 28, 58, 29, 46, 30, 96, 31, 73, 32, 90, 33, 92, 34, 74, 35, 60, 36, 3, 37, 57, 38, 40, 39, 83, 40, 78, 41, 64, 42, 65, 43, 29, 44, 59, 45, 53, 46, 69, 47, 29, 48, 41, 49, 92, 50, 72, 51, 6, 52, 57, 53, 9, 54, 41, 55, 20, 56, 51, 57, 55, 58, 89, 59, 67, 60, 14, 61, 36, 62, 35, 63, 45, 64, 2, 65, 69, 66, 81, 67, 11, 68, 35, 69, 94];


function webGLStart() {
    
    function prepareData( arr ){
        var z = 0, i = 0, cleanArr = [];
        for( i = 0; i < arr.length; i = i + 1 ){
            if( i && i % 2 === 0 ){
                cleanArr.push( z );
            }

            cleanArr.push ( arr[i] );
        }
        cleanArr.push( z );

        return injectPoints( cleanArr );
    }

    function bezier( a, b, c, d, t ){
        var a3 = a * 3, b3 = b * 3, c3 = c * 3;
        var ret = a + t*(b3 - a3 + t*(a3-2*b3+c3 + t*(b3-a-c3+d)));
        return ret;
    }
    function bezier3( a, b, c, d, t, dest ){
        if( dest == null ) dest = [];
        var x = bezier(a[0], b[0], c[0], d[0], t);
        dest.push( x );
        dest.push( 0 );
        dest.push( 0 ); //sigh hard coded z axis
        dest.push( x );
        dest.push( bezier(a[1], b[1], c[1], d[1], t) );
        //dest.push( bezier(a[2], b[2], c[2], d[2], t) ); skipping z for now
        dest.push( 0 );
        return dest;
    }
    var ap = Array.prototype.push;
    function faux( a, b, enda, endb ){
        //Make control points, okay?
        var ret = [],
            cp1 = [ ],
            cp2 = [ ],
            dx = 0.25 * ( b[0] - a[0] ),
            dy = 0.25 * ( b[1] - a[1] );

        //endpoints controlpoint dy
        if( enda ){
            cp1.push( a[0] );
            cp1.push( b[1] > a[1] ? b[1] + dy : b[1] - dy );
            cp1.push( a[2] );//only true in flat
        } else {
            cp1.push( a[0] + dx );
            cp1.push( a[1] );
            cp1.push( a[2] );//only true in flat
        }

        if( endb ){
            cp2.push( b[0] );
            cp2.push( b[1] > a[1] ? b[1] - dy : b[1] + dy );
            cp2.push( b[2] );//only true in flat
        } else {
            cp2.push( b[0] - dx );
            cp2.push( b[1] );
            cp2.push( b[2] );//only true in flat
        }

        for( var i = 1, count = 500; i < count; i++ ){
            var t = i / ( count - 1 );
            ap.apply( ret, bezier3( 
                a, 
                cp1,
                cp2,
                b,
                t ) );
        }
        return ret;
    }

    //Inject points so every point is ( start, pt, end )
    function injectPoints( arr ){

        var ret = [], prev, current;
        //arr = bezier( arr );        
        for( var i = 0, l = arr.length / 3; i < l; i = i + 1 ){
            current = [ arr[ i*3 ], arr[ i*3 + 1 ], arr[ i*3 + 2 ] ];
            if( i > 0 ){
                ap.apply( ret, faux( prev, current, i === 1, i === l  ) );
            }
            ret.push( arr[ i*3 ], 0, arr[ i*3 + 2 ],
                    arr[ i*3 ], arr[ i*3 + 1 ], arr[ i*3 + 2 ]);
            prev = current;
        }
        return ret;
    }

    function prepareIndices( iindices ){
        var ret = [];
        for( var i = 0; i < iindices; i = i + 4 ){
            ret.push( i, i + 1, i + 3 );
            ret.push( i + 1, i + 2, i + 3 );
        }

        return ret;
    }
    
    var matrix = prepareData( arr ),
        iindices = Math.floor( matrix.length / 3 ),
        indices = prepareIndices( iindices ),
        theta = 0;

    var graph = new PhiloGL.O3D.Model({
        vertices: matrix,
        colors: [ 1, 0, 0, 1 ],
        indices: indices

    }), pos;

    PhiloGL('canvas', {
        program: {
            from: 'ids',
            vs: 'shader-vs',
            fs: 'shader-fs'
        },
        events: {
            onDragStart: function(e) {
                this.pos = {
                    x: e.x,
                    y: e.y
                };
                this.dragging = true;
            },
            onDragCancel: function(){
                this.dragging = false;
            },
            onDragMove: function(e) {
                var z = this.camera.position.z,
                    sign = Math.abs(z) / z,
                    pos = this.pos,
                    x = -(pos.x - e.x) / 100,
                    y = sign * (pos.y - e.y) / 100,
                    graph = this.scene.models[0];

                graph.position.x += (pos.x - e.x) * this.camera.aspect / 2;
                graph.position.y += -(pos.y - e.y) / 2;
                graph.update();

                pos.x = e.x;
                pos.y = e.y;
            },
            onDragEnd: function(){
                theta = this.scene.models[0].rotation.y;
                this.dragging = false;
            },
            onMouseWheel: function(e) {
                e.stop();
                var camera = this.camera;

                camera.position.z += e.wheel * 100;
                camera.update();
            }
        },
        onError: function() {
            console.log( this, arguments );

        },
        onLoad: function(app) {
            var gl = app.gl,
                canvas = app.canvas,
                program = app.program,
                scene = app.scene,
                //camera = app.camera,
                view = new PhiloGL.Mat4(),
                rTri = 0, rSquare = 0,
                camera = new PhiloGL.Camera( 45, 0.1, 10, -1000, {
                position: {
                    x: 100, y: -100, z: -500
                }
            });
            app.camera = camera;

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
            $( 'rendered' ).innerHTML = 'Vertice Count: ' + Math.floor( graph.$verticesLength / 3 ) * 3;


            var camy = 0;
            scene.add( graph );
                graph.position.set( -50, -80, 0 );
            function drawScene(){
                //scene.add( graph );


                gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT );
                // if( !app.dragging ){
                //     theta += 0.005;
                //     graph.rotation.set(0, theta, 0);
                // }
                graph.update();
                camera.update();
                setupElement( graph );
                program.setBuffer('graph');
                gl.drawArrays( gl.TRIANGLE_STRIP, 0, 
                               Math.floor( graph.$verticesLength / 3 ) );
                
                program.setBuffer('indices', {
                    value: graph.indices,
                    bufferType: gl.ELEMENT_ARRAY_BUFFER,
                    size: 1
                });
                gl.drawElements( gl.TRIANGLES, graph.indices.length, gl.UNSIGNED_SHORT, 0 );
                //scene.render();

            }

            (function tick(){

                drawScene();
                setTimeout(tick,1000/24);
            })();
            //drawScene();
        }
    });
}


