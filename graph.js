(function(){
var $ =
    function( id ){
        return document.getElementById.apply( document, arguments );
    },
    ap = Array.prototype.push,
    arr = [];
//Prevent errors
if( !window.console ){
    window.console = {};
    window.console.log = function(){};
}

function generatePoints( seed, length, max ){
    var arr = [];
    max = max || 100;
    seed = seed || 0;
    length = length*10 || 400;

    for( var i = seed; i < length; i=i+10 ){
        arr.push( i, Math.floor( Math.random() * max ) );
    }

    return arr;
}

//Globally accessible values
var maxx,// = Math.max.apply(Math,arr.filter(function(n,i){ return !(i%2); })),
    maxy;// = Math.max.apply(Math,arr.filter(function(n,i){ return i%2; }));

function normalizeArray( arr ){
    maxx = Math.max.apply(Math,arr.filter(function(n,i){ return !(i%2); }));
    maxy = Math.max.apply(Math,arr.filter(function(n,i){ return i%2; }));

    for( var i = 0,l = arr.length; i < l; i = i + 2 ){

        arr[ i + 1 ] = arr[ i + 1 ] * 300 / maxy;
        arr[ i ] = arr[ i ] * 400 / maxx;
    }
    maxx = 375;
    maxy = 300;
    return arr;
}

//Convert 2 wide matrix to 3 wide matrix, z = 0
function prepareData( arr, z ){
    var i = 0, cleanArr = [];
    z = z || 0;
    arr = normalizeArray( arr );

    for( i = 0; i < arr.length; i = i + 1 ){
        if( i && i % 2 === 0 ){
            cleanArr.push( z );
            //console.log( cleanArr[ cleanArr.length - 3], cleanArr[ cleanArr.length - 2],cleanArr[ cleanArr.length - 1 ] );
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
    //Inject a y=0 axis point prior to calculated point
    dest.push( x );
    dest.push( 0 );
    dest.push( 0 ); //sigh hard coded z axis
    dest.push( x );
    dest.push( bezier(a[1], b[1], c[1], d[1], t) );
    //dest.push( bezier(a[2], b[2], c[2], d[2], t) ); skipping z for now
    dest.push( 0 );
    return dest;
}

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
//Prefix every point with a point on the y=0 axis
function injectPoints( arr ){

    var ret = [], prev, current,
    value;

    for( var i = 0, l = arr.length / 3; i < l; i = i + 1 ){
        current = [ arr[ i*3 ], arr[ i*3 + 1 ], arr[ i*3 + 2 ] ];
        if( false &&i > 0 ){
            value = faux( prev, current, i === 1, i === l  );
            ap.apply( ret, value );
        }
        ret.push( arr[ i*3 ], 0, arr[ i*3 + 2 ],
                  arr[ i*3 ], arr[ i*3 + 1 ], arr[ i*3 + 2 ]);
        prev = current;
    }

    return ret;
}

//Create indices between necessary points
//If double create links to the mirror image at z=z+1
function prepareIndices( iindices, dbl ){
    var ret = [], i = 0, half = Math.floor( iindices/2 ), temp;


    //Connect Z facing graphs
    for( ; i < iindices; i = i + 2 ){

        ret.push( i, i + 1, i + 3 );
        ret.push( i, i + 2, i + 3 );
    }

    return ret;
    
    //FIXME: calculate indices to back (same direction as front)
    //Build Back, Top, Bottom, Right, Left

    //If a block, must connect side, top, bottom sides of graph
    if( dbl ){
        //Connect start and finish of points
        ret.push( 0, 1, iindices - 2 );
        ret.push( 1, iindices - 2, iindices - 1 );

        for( i = 0; i < half ; i = i + 1 ){

            temp = iindices - i - 4; //Less math
            if( i % 2 ){
                temp = temp + 2;
            }
            ret.push( i, i + 2, temp );
            ret.push( i, temp, temp + 2 );
        }
        //ret.push( half - 1, half + 1, half - 2 );
        //ret.push( half, half + 1, half - 2 );

    }

    return ret;
}

//Generate a new model based on data
function generateModel(){
    var matrix = prepareData( generatePoints(0,4) ),
        iindices,// = Math.floor( matrix.length / 3 ),
        indices,// = prepareIndices( iindices );
        length3 = matrix.length,
        length = length3 / 3,
        l, half,i,tmp,
        top = [], bottom=[];

    //Build back face
    for( i = 0, l = length3; i < l;i = i + 3 ){

        matrix.push( matrix[i], matrix[i+1], matrix[i + 2] - 100 );
        //Build top or bottom
        if( i%2 ){
            top.push( matrix[i] , matrix[i+1], matrix[i+2] );
            top.push( matrix[i] , matrix[i+1], matrix[i+2] - 100 );
        } else {
            bottom.push( matrix[i] , matrix[i+1], matrix[i+2] );
            bottom.push( matrix[i] , matrix[i+1], matrix[i+2] - 100 );
        }
    }
    ap.apply( matrix, top );
    ap.apply( matrix, bottom );

    //FIXME: I guess loop left/right, inefficient with one push
    //Build right face
    tmp = ( ( length ) - 2  ) * 3;
    matrix.push( matrix[ tmp ], matrix[ tmp + 1 ], matrix[ tmp + 2 ] );
    tmp = tmp + 3;
    matrix.push( matrix[ tmp ], matrix[ tmp + 1 ], matrix[ tmp + 2 ] );
    tmp = tmp - 3 + length3;
    matrix.push( matrix[ tmp ], matrix[ tmp + 1 ], matrix[ tmp + 2 ] );
    tmp = tmp + 3;
    matrix.push( matrix[ tmp ], matrix[ tmp + 1 ], matrix[ tmp + 2 ] );

    //Build left face
    tmp = 0 * 3;
    matrix.push( matrix[ tmp ], matrix[ tmp + 1 ], matrix[ tmp + 2 ] );
    tmp = tmp + 3;
    matrix.push( matrix[ tmp ], matrix[ tmp + 1 ], matrix[ tmp + 2 ] );
    tmp = tmp - 3 + length3;
    matrix.push( matrix[ tmp ], matrix[ tmp + 1 ], matrix[ tmp + 2 ] );
    tmp = tmp + 3;
    matrix.push( matrix[ tmp ], matrix[ tmp + 1 ], matrix[ tmp + 2 ] );

    iindices = Math.floor( matrix.length / 3 );
    indices = prepareIndices( iindices, true );
    //Debug matrices and indices
    // for( var i = 0; i < matrix.length; i = i + 3 ){
    //     console.log( i/3 + ':', matrix[i], matrix[i+1], matrix[i+2] );
    // }
    // for( var i = 0; i < indices.length; i = i + 3 ){
    //     console.log( indices[i], indices[i+1], indices[i+2] );
    // }

    var colors = [];
    for( i = 0; i < matrix.length; i = i + 3 ){
        if( i < matrix.length / 2 ){
            colors.push( 1, 0, 0, 1 );
        } else {
            colors.push( 0, 1, 0, 1 );
        }
    }
    return new PhiloGL.O3D.Model({
        vertices: matrix,
        colors: colors,
        indices: indices
    });
}

function updatePosition( graph ){

    //graph.position.set( -maxx/2 + 15, -maxy*2/3 - 15, graph.position.z );
    //Still can't seem to automatically determine this so using normalize to control it
    graph.position.set( -180, -215, graph.position.z );
}


window.webGLStart = function() {
    var theta = 0,
        icamera = 1,
        graph = generateModel(), pos;

    $( 'generate' ).addEventListener('click',function(){
        graph = generateModel();
        updatePosition( graph );
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
                scene = app.scene,
                view = new PhiloGL.Mat4(),
                rTri = 0, rSquare = 0,
                camera = new PhiloGL.Camera( 45, 1, 10, 0, {
                position: {
                    x: 0, y: 0, z: -(400 )*1.3
                }
            });

            app.camera = camera;

            gl.viewport(0, 0, canvas.width, canvas.height);
            gl.clearColor( 211/255, 200/255, 184/255, 1);
            gl.clearDepth( 1 );
            gl.enable (gl.DEPTH_TEST );
            gl.depthFunc( gl.LEQUAL );

            //gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
            camera.view.id();
            updatePosition( graph );
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

            $( 'rendered' ).innerHTML = 'Vertice Count: ' +
                Math.floor( graph.$verticesLength / 3 ) * 3;

            scene.add( graph );

            function drawScene(){

                gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT );

                setupElement( graph );
                program.setBuffer('graph');
                gl.drawArrays( gl.TRIANGLE_STRIP, 0,
                               Math.floor( graph.$verticesLength / 3 ) );

                program.setBuffer('indices', {
                    value: graph.indices,
                    bufferType: gl.ELEMENT_ARRAY_BUFFER,
                    size: 1
                });

                gl.drawElements(
                    gl.TRIANGLES,
                    graph.indices.length,
                    gl.UNSIGNED_SHORT, 0 );
                graph.update();
                camera.update();

            }

            (function tick(){

                drawScene();
                setTimeout(tick,1000/24);
            })();
        },
        events: {
            onDragStart: function(e) {

                this.pos = {
                    x: e.x,
                    y: e.y
                };
                console.log( 'Mouse', e.x, 'Graph', this.scene.models[0].position.x, 'Camera', this.camera.aspect );
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
                    graph = this.scene.models[0];

                //Due to aspect ratio manipulations X must be calculated based
                // this aspect ratio;
                // The needed ratio comes out to:
                // -2.3136792453 @ 1
                // -2.3061583578 @ 0.8
                // -2.3294117647 @ 0.4

                if( !e.event.ctrlKey ){
                    graph.position.x += (pos.x - e.x) * camera.aspect / 2.3136792;
                    graph.position.y += -(pos.y - e.y);
                } else {
                    graph.rotation.x += -(pos.y - e.y)/100;
                    graph.rotation.y += -(pos.x - e.x)/100;
                }
                pos.x = e.x;
                pos.y = e.y;

            },
            onDragEnd: function(e){
                console.log( 'Mouse', e.x, 'Graph', this.scene.models[0].position.x, 'Camera', this.camera.aspect );
                this.dragging = false;

            },
            onMouseWheel: function(e) {
                e.stop();
                var camera = this.camera;

                //camera.position.z += e.wheel * 100;
                camera.aspect -= e.wheel * .1;
                if( camera.aspect <= 0.01 ){
                    camera.aspect = 0.01; }
                if( camera.aspect > 2.5 ){
                    camera.aspect = 2.5;
                }
                console.log( 'Aspect Ratio:', camera.aspect );
            }
        }

    });
};

})();
