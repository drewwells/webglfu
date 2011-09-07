On a quest to learn WebGLfu.

# [graph3d]

![graph growing effect](images/graph.gif)

This is an extension of most 2d and canvas based graphs like flot.  Now, we can visualize a large number of data points in realtime. This is achieved by using the 3d graphics power of the GPU.  There are initial setup costs related to building the dataset and transforming it into 3-axis points.  Afterwards, panning, zooming, and expanding of the graph is rendered on the GPU.

Currently, it normalizes any dataset to a suitable viewing size for the canvas on the page.  I assume some math can make this work for any size canvas.

### Features

* Automatic normalization of any datasets, assumed to be X/Y points
* Optional Z axis (although only one can be used currently)
* 3d effects provided by depth of the graph
* Smooth transitions between points using a [Bézier curve][1].


### Controls:

* Ctrl + Left Mouse: Rotate Graph
* Shift + Mouse Wheel: Zoom the camera in/out on the graph
* Mouse Wheel: Expand and contract the graph on the X axis

## TODO: 

* Multi-graph: stack multiple plots one behind the other
* Realtime data: Merge new data points into existing matrix
* Labels: Provide the user with X/Y feedback (and legend in the case of multimap)
* Linear and Logarithmic plots

[graph3d]: http://drewwells.github.com/webglfu/graph.html
[1]: http://en.wikipedia.org/wiki/B%C3%A9zier_curve