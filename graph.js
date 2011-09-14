(function(){

/**
# graph3d

## Options:

 - canvas: id or DOM element to reference

 - datasets: array of datasets

 - colors: array of colors, see

 */
window.graph3d = function( options ){

    var canvas = options.canvas;
    if( !canvas ){

        console.log( 'Need a reference to a canvas' );
    }
    if( PhiloGL.hasWebGL() === false ){

        if( type( canvas ) === "string" ){
            canvas = $( canvas );
        }
        canvas.innerHTML = "You do not support WebGL";
    } else {

        if( canvas ){

            options = generateModel( options );
            return webGLStart( options );
        }
    }

    return null;
};

//Prevent errors if log doesn't existent
if( !window.console ){
    window.console = {};
    window.console.log = function(){};
}

//Build a random 2d graph
function generatePoints( seed, length, max ){
    var arr = [], val;
    max = max || 100;
    seed = seed || 0;
    length = length*10 || 400;

    for( var i = seed; i < length; i=i+10 ){

        val = Math.floor( Math.random() * max );
        arr.push( i, val );
    }

    return arr;
}

//Take any set of values and make them fit in our window nicely
function normalizeArray( arr, x, y ){
    var maxx = Math.max.apply(Math,arr.filter(function(n,i){ return !(i%2); })),
        maxy = Math.max.apply(Math,arr.filter(function(n,i){ return i%2; }));

    for( var i = 0,l = arr.length; i < l; i = i + 2 ){

        arr[ i + 1 ] = arr[ i + 1 ] * y / maxy;
        arr[ i ] = arr[ i ] * x / maxx;
    }
    maxx = 375;
    maxy = 300;
    return arr;
}

//Convert 2 wide matrix to 3 wide matrix, z = 0
function expandPoints( arr, x, y, z ){
    var i = 0, cleanArr = [];
    z = z * 10 || 0;
    arr = normalizeArray( arr, x, y );

    for( i = 0; i < arr.length; i = i + 1 ){

        if( i && i % 2 === 0 ){

            cleanArr.push( z );
        }

        cleanArr.push ( arr[i] );
    }
    cleanArr.push( z );

    return injectPoints( cleanArr );
}

//Prefix every point with a point on the y=0 axis
//Also applying bezier curve to generated points
function injectPoints( arr, raw ){

    var ret = [], prev, current,
    value;

    for( var i = 0, l = arr.length / 3; i < l; i = i + 1 ){

        current = [ arr[ i*3 ], arr[ i*3 + 1 ], arr[ i*3 + 2 ] ];

        if( !raw && i > 0 ){

            value = faux( prev, current, i === 1, i === l  );
            ap.push.apply( ret, value );
        }

        ret.push( arr[ i*3 ], 0, arr[ i*3 + 2 ],
                 arr[ i*3 ], arr[ i*3 + 1 ], arr[ i*3 + 2 ]);
        prev = current;
    }

    return ret;
}

//Pass in the number of vertices, subtract 8 and connect the 4 faces
//Then calculate add indices of remaining 8 vertices
function prepareIndices( iindices ){
    var ret = [],
        length = iindices,
        quarter = length / 4,
        i, j, l, temp, max;
    //remove right/left
    //length = length - 8;
    l = length;
    ret.push( 0, 1, quarter );
    ret.push( 1, quarter, quarter + 1 );

    ret.push( quarter - 2, quarter - 1, quarter * 2 - 1 );
    ret.push( quarter - 2, quarter * 2 - 1, quarter * 2 - 2 );

    //Now do the 4 faces, but do not combine each of them
    for( j = 0; j < 4; j = j + 1 ){

        for( i = j * quarter; i + 3< quarter + j * quarter; i = i + 2 ){

            ret.push( i, i + 1, i + 2 );
            ret.push( i + 1, i + 2, i + 3 );
        }
    }

    return ret;
}

//Create back, top, bottom walls
function make3d( matrix, z ){
    var length3 = matrix.length,
        displace = z || 10,
        top = [], bottom = [],
        i,l;

    //Build back face
    for( i = 0, l = length3; i < l; i = i + 3 ){

        matrix.push( matrix[i], matrix[i+1], matrix[i + 2] + displace );
        //These are only necessary if the bottom should be a different color
        // webgl lessons #4, read comments
        // If this is removed, must alter how generateColors works
        //Build top or bottom
        if( i%2 ){
            top.push( matrix[i] , matrix[i+1], matrix[i+2] );
            top.push( matrix[i] , matrix[i+1], matrix[i+2] + displace );
        } else {
            bottom.push( matrix[i] , matrix[i+1], matrix[i+2] );
            bottom.push( matrix[i] , matrix[i+1], matrix[i+2] + displace );
        }
    }
    ap.push.apply( matrix, top );
    ap.push.apply( matrix, bottom );

    return matrix;
}

//Add colors to the vertices, options? 1: vertices
function generateColors( length, pos ){
    var colors = [],
        colorsTmpl = [ 
            [ 
                //Guessing a bit on side of each color
                [ 12/255, 37/255, 56/255, 1 ], //Front
                [ 43/255, 67/255, 79/255, 1 ], //Side
                [ 99/255,130/255,112/255, 1 ], //Top
                [188/255,201/255,142/255, 1 ]  //Bottom
            ],
            [
                [ 219/255, 158/255, 54/255, 1 ],
                [ 255/255, 211/255, 78/255, 1 ],
                [ 189/255,  73/255, 50/255, 1 ],
                [ 189/255,  73/255, 50/255, 1 ]
            ],
            [
                [ 204/255, 161/255, 100/255, 1 ],
                [ 171/255, 152/255, 119/255, 1 ],
                [ 212/255, 193/255, 155/255, 1 ],
                [  54/255,  36/255,  40/255, 1 ]
            ]
                     ],
        i,j;
    pos = pos || 0;
    pos = pos % 3;
    for( j = 0; j < 4; j = j + 1 ){
        for( i = 0;
             i < length / 4;
             i = i + 3 ){
                 ap.push.apply( colors, colorsTmpl[ pos ][ j ] );
        }
    }

    return colors;
}

//Generate a new model based on data
function generateModel( options ){
    var matrix = [],
        points = options.points,
        indices = [],
        i;

    options.models = [];
    if( points && type( points[0] ) === "array" ){

        //Multiple x/y planes, iterate over them
        for( i = 0; i < points.length; i = i + 1 ){

            matrix.push( expandPoints( points[ i ][ 0 ] ? 
                                      points[ i ] : generatePoints(), 400, 300, i ) );
            make3d( matrix[ i ] );
            indices.push( prepareIndices( matrix[ i ].length / 3 ) );
            options.models.push(
                new PhiloGL.O3D.Model({
                    vertices: matrix[ i ],
                    colors: generateColors( matrix[ i ].length, i ),
                    indices: indices[ i ]
                }));
        }
    } else {

        matrix = expandPoints( points || generatePoints(), 400, 300 );
        make3d( matrix );
        indices = prepareIndices( matrix.length / 3 );
        options.models.push(
            new PhiloGL.O3D.Model({
                vertices: matrix,
                colors: generateColors( matrix.length ),
                indices: indices
            }));
    }

    //Debug FINAL matrices and indices
    // for( i = 0; i < indices.length; i = i + 3 ){
    //     console.log( indices[i], indices[i+1], indices[i+2] );
    // }

    // for( i = 0; i < matrix.length; i = i + 3 ){
    //     console.log( i/3 + ':', matrix[i], matrix[i+1], matrix[i+2] );
    // }
    return options;
}

function updatePosition( graph ){

    //graph.position.set( -maxx/2 + 15, -maxy*2/3 - 15, graph.position.z );
    //Still can't seem to automatically determine this so using normalize to control it
    graph.position.set( -150, -215, graph.position.z );
    graph.rotation.set( 0, -0.39, 0 );
}

var $ =
    function( id ){
        return document.getElementById.apply( document, arguments );
    },
    ap = Array.prototype,
    op = Object.prototype,
    typeCache = {},
    type = function( obj ){
        var _class = op.toString.call( obj );
        if( !typeCache[ _class ] ){
            typeCache[ _class ] = _class
                .replace( /\[object\s([^\]]+)]/, function( all, m ){
                    return m.toLowerCase();
                });
        }
        return typeCache[ _class ] || 'object';
    };


function grow( model, fps ){

    var ratio = 1, vertices = model.$vertices,
        original = Array.prototype.slice.call( vertices ),
        fx = easing.easeOutCubic,
        duration = 80;

    fps = fps || 24;

    function f(){

        ratio = ratio + 1;
        if( ratio <= duration ){
            //console.log( ratio );
            for( var i = 1, l = vertices.length; i < l; i=i+3 ){

                //vertices[i] = original[i] * ratio / 400;
                vertices[i] = fx( ratio, 0, original[ i ], duration );
            }

            setTimeout(f, 1000/fps);
        }
    }
    f();

}

function each( array, callback ){

    var i = 0, l = array.length,
        args = Array.prototype.slice.call( arguments, 2 );

    args.unshift( null );
    for( ; i < l; i++ ){

        args[ 0 ] = array[ i ];
        //This is async safe, thanks .slice()
        callback.apply( array[ i ], args.slice() );
    }
}

var webGLStart = function( options ) {
    var theta = 0,
        icamera = 1,
        graph = options.models,
        i, pos, fps = 60;

    //console.log( Array.prototype.slice.call(graph[0].vertices,105,400) );
    each( graph, grow, fps );
    each( graph, updatePosition );

    PhiloGL( options.canvas, {

        program: {

            from: 'ids',
            vs: 'shader-vs',
            fs: 'shader-fs'
        },
        camera: {

            position: {

                x: 0, y: 0, z: -400 * 1.3
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
                view = new PhiloGL.Mat4(),
                rTri = 0, rSquare = 0,
                camera = app.camera;

            var count = graph.reduce(function( a, b ){

                return Object.prototype.toString.call( a ) === "[object Object]" ?
                    a.$verticesLength : a + b.$verticesLength;
            });

            //Reduce sucks balls for size 1 arrays
            count = count.$verticesLength || count;

            //Allow much further camera
            camera.far = 1000;
            //Aspect based on normalize
            camera.aspect = 0.85;
            gl.viewport( 0, 0, canvas.width, canvas.height );
            //Scene background color
            gl.clearColor( 211/255, 200/255, 184/255, 1 );
            gl.clearDepth( 1 );
            gl.enable( gl.DEPTH_TEST );
            gl.depthFunc( gl.LEQUAL );
            camera.view.id();
            //updatePosition( graph );

            $( 'rendered' ).innerHTML = 'Vertice Count: ' + count;

            //scene.add.apply( scene, graph );
            each( graph, function( g ){

                scene.add( g );
            });

            // console.log( Array.prototype.slice.call( graph[0].$vertices ) );
            // console.log( Array.prototype.slice.call(  graph[1].$vertices ) );

            (function tick(){

                drawScene();
                setTimeout( tick, 1000/60 );
            })();

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

                //set uniforms
                program.setUniform('uMVMatrix', view);
                program.setUniform('uPMatrix', camera.projection);
            }

            function drawScene(){

                gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT );

                each( graph, function( graphElement ){

                    setupElement( graphElement );
                    program.setBuffer('indices', {
                        value: graphElement.indices,
                        bufferType: gl.ELEMENT_ARRAY_BUFFER,
                        size: 1
                    });

                    gl.drawElements(
                        gl.TRIANGLES,
                        graphElement.indices.length,
                        gl.UNSIGNED_SHORT, 0 );
                });

                camera.update();
            }

        },
        events: {

            onDragStart: function(e) {

                this.pos = {
                    x: e.x,
                    y: e.y
                };
                console.log( 'Mouse', e.x,
                             'Graph', this.scene.models[0].position.x,
                             'Camera', this.camera.aspect );
                this.dragging = true;
            },
            onDragCancel: function(){

                this.dragging = false;
            },
            onDragMove: function(e) {

                var z = this.camera.position.z,
                    camera = this.camera,
                    sign = Math.abs(z) / z,
                    pos = this.pos,
                    x = -(pos.x - e.x) / 100,
                    y = sign * (pos.y - e.y) / 100,
                    models = this.scene.models;

                //Due to aspect ratio manipulations X must be calculated based
                // this aspect ratio;
                // The needed ratio comes out to:
                // -2.3136792453 @ 1
                // -2.3061583578 @ 0.8
                // -2.3294117647 @ 0.4

                if( !e.event.ctrlKey ){

                    each( models, function( graph ){

                        graph.position.x += (pos.x - e.x) * camera.aspect / 2.3136792;
                        //graph.position.y += -(pos.y - e.y);
                    });
                } else {
                    each( models, function( graph ){

                        //graph.rotation.x += -(pos.y - e.y)/100;
                        graph.rotation.y += -(pos.x - e.x)/100;
                    });
                }

                pos.x = e.x;
                pos.y = e.y;

            },
            onDragEnd: function(e){

                console.log( 'Mouse', e.x,
                             'Graph', this.scene.models[0].position.x,
                             'Camera', this.camera.aspect );

                this.dragging = false;

            },
            onMouseWheel: function(e) {

                e.stop();
                var camera = this.camera;

                if( !e.event.shiftKey ){

                    camera.aspect -= e.wheel * .1;
                    if( camera.aspect <= 0.01 ){
                        camera.aspect = 0.01; }
                    if( camera.aspect > 2.5 ){
                        camera.aspect = 2.5;
                    }
                    console.log( 'Aspect Ratio:', camera.aspect );
                } else {

                    camera.position.z += e.wheel * 100;
                    console.log( 'Camera X:', camera.position.x,
                                 'Y:', camera.position.y,
                                 'Z:', camera.position.z );
                }

            }
        }

    });
};

//Methods related to build Bezier curve
function bezier( a, b, c, d, t ){

    var a3 = a * 3, b3 = b * 3, c3 = c * 3;
    var ret = a + t*(b3 - a3 + t*(a3-2*b3+c3 + t*(b3-a-c3+d)));
    return ret;
}
function bezier3( a, b, c, d, t, dest ){

    if( dest == null ) dest = [];
    var x = bezier(a[0], b[0], c[0], d[0], t);
    //Inject a y=0 axis point prior to calculated point
    dest.push( x );
    dest.push( 0 );
    dest.push( a[2] ); //No smoothing of z-axis
    dest.push( x );
    dest.push( bezier(a[1], b[1], c[1], d[1], t) );
    //dest.push( bezier(a[2], b[2], c[2], d[2], t) ); skipping z for now
    dest.push( a[2] ); //No smoothing of z-axis
    return dest;
}

//Dynamically create control points and
// send them to Bezier functions
// Return: array of points for
// build a curve
function faux( a, b, enda, endb ){

    //Make control points, okay?
    var ret = [],
        cp1 = [ ],
        cp2 = [ ],
        dx = 0.4 * ( b[0] - a[0] ),
        dy = 0.4 * ( b[1] - a[1] );

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

    for( var i = 1, count = 50; i < count; i++ ){

        var t = i / ( count - 1 );
        ap.push.apply( ret, bezier3(
            a,
            cp1,
            cp2,
            b,
            t ) );
    }

    return ret;
}

var easing = {
    // t: current time, b: begInnIng value, c: change In value, d: duration
    easeOutCubic: function ( t, b, c, d ) {
	return c * ( ( t = t / d - 1 ) * t * t + 1 ) + b;
    }
};

/*
 *
 * TERMS OF USE - EASING EQUATIONS
 *
 * Open source under the BSD License.
 *
 * Copyright 2001 Robert Penner
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without modification,
 * are permitted provided that the following conditions are met:
 *
 * Redistributions of source code must retain the above copyright notice, this list of
 * conditions and the following disclaimer.
 * Redistributions in binary form must reproduce the above copyright notice, this list
 * of conditions and the following disclaimer in the documentation and/or other materials
 * provided with the distribution.
 *
 * Neither the name of the author nor the names of contributors may be used to endorse
 * or promote products derived from this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY
 * EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF
 * MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE
 * COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL,
 * EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE
 * GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED
 * AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
 * NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED
 * OF THE POSSIBILITY OF SUCH DAMAGE.
 *
 */

})();
