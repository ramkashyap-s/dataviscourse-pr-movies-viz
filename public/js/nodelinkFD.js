/**
 * Created by Kashyap on 11/26/2017.
 */
class NodeLinkFD{

    constructor(movies){
        //this.movies = movies;
        this.margin = {top: 10, right: 20, bottom: 30, left: 50};
        this.nodeLink = d3.select("#nodeLink");

        //fetch the svg bounds
        this.svgBounds = this.nodeLink.node().getBoundingClientRect();
        this.svgWidth = (this.svgBounds.width - this.margin.right);
        this.svgHeight = 400;

        this.movies = movies;  //default 50 movies
        //console.log(this.data[0].movie_title);
        this.edges = [];
        this.nodes = [];
        this.directors = new Set([]);
        this.actors = new Set();
        this.movietitles = new Set([]);
        /*        (this.data).forEach(function (movie) {
         console.log(movie)
         this.edges.push([movie.movie_title.trim(), movie.director_name], [movie.movie_title.trim(), movie.actor_1_name],
         [movie.movie_title.trim(), movie.actor_2_name],[movie.movie_title.trim(), movie.actor_3_name]);
         this.nodes.push([movie.movie_title.trim(), {label: movie.movie_title.trim()}, {group:'0'}]);
         this.nodes.push([movie.director_name, {label: movie.director_name}, {group:'1'}]);//{color:'orange'}
         this.nodes.push([movie.actor_1_name, {label: movie.actor_1_name}, {group:'2'}]); //{color:'red'}
         this.nodes.push([movie.actor_2_name, {label: movie.actor_2_name},{group:'2'}]);
         this.nodes.push([movie.actor_3_name, {label: movie.actor_3_name}, {group:'2'}]);
         },this)
         */
    }

    update(selectedmovies){
        // let svgnodeLink = this.nodeLink.append("svg").attr("id","svgNL")
        //      .attr("width", this.svgWidth + this.margin.right*2)
        //      .attr("height", this.svgHeight);
        if(!selectedmovies){
            selectedmovies = this.movies.slice(0, 50) //default selection
        }

        selectedmovies.forEach(function(movie) {
            //edges from movie to director, actor1,2,3
            this.edges.push({"source": movie.movie_title.trim(), "target": movie.director_name.trim()})
            this.edges.push({"source": movie.movie_title.trim(), "target": movie.actor_1_name.trim()})
            this.edges.push({"source": movie.movie_title.trim(), "target": movie.actor_2_name.trim()})
            this.edges.push({"source": movie.movie_title.trim(), "target": movie.actor_3_name.trim()})
            //nodes data for title, director, actor1,2,3
            this.nodes.push({"id": movie.movie_title.trim(), "label": movie.movie_title.trim(), "group": 0, "color":"blue"});
            this.nodes.push({"id": movie.director_name.trim(), "label": movie.director_name.trim(), "group": 1, "color":"orange"});
            this.nodes.push({"id": movie.actor_1_name.trim(), "label": movie.actor_1_name.trim(), "group": 2, "color":"red"});
            this.nodes.push({"id": movie.actor_2_name.trim(), "label": movie.actor_2_name.trim(), "group": 2, "color":"red"});
            this.nodes.push({"id": movie.actor_3_name.trim(), "label": movie.actor_3_name.trim(), "group": 2, "color":"red"});


        },this)

        // let nodenames = new Set(this.nodes.map(d => { return d["id"]}))
        // console.log(nodenames)

        // let x = d3.nest()
        //     .key( (d) => { return d["id"]; } )
        //     .entries(this.nodes);


        // console.log(this.nodes)
        // console.log(this.edges)
        // this.nodes.forEach(function (node) {
        //     node.source
        // })


        //Set up tooltip
        let tip = d3.tip()
            .attr('class', 'd3-tip')
            .offset([-10, 0])
            .html(function (d) {
                return  d.id + "</span>";
            })


        let svgnodeLink = d3.select('#canvas')
            .attr("width", this.svgWidth )
            .attr("height", this.svgHeight);

        svgnodeLink.call(tip);

        // Here we create our simulation, and give it some forces to apply to all the nodes:
        let simulation = d3.forceSimulation()
        // forceLink creates tension along each link, keeping connected nodes together
            .force("link", d3.forceLink()
                .id(function (d) {
                return d.id;
            }))
            // forceManyBody creates a repulsive force between nodes, keeping them away from each other
            .force("charge", d3.forceManyBody().strength(-20))
            // forceCenter acts like gravity, keeping the whole visualization in the middle of the screen
            .force("center", d3.forceCenter(this.svgWidth / 2, this.svgHeight / 2))
            .force("forceX", d3.forceX())
            .force("forceY", d3.forceY())
            // .force("collide", d3.forceCollide());
            .force("collide",d3.forceCollide( function(d){return d.r + 8 }).iterations(16) )

        //simulation.stop();
        // First we create the links in their own group that comes before the node group;
        // using groups like layers, the circles will always be on top of the lines
        let linkLayer = svgnodeLink.append("g")
            .attr("class", "links");
        // Now let's create the lines
        let links = linkLayer.selectAll("line")
            .data(this.edges)
            .enter().append("line");

        // Now we create the node layer, and the nodes inside it
        let nodeLayer = svgnodeLink.append("g")
            .attr("class", "nodes");
        let nodes = nodeLayer
            .selectAll("circle")
            .data(this.nodes)
            .enter().append("circle")
            .attr("r", 5)
            .attr("fill", function (d) {
                //console.log(d)
                // return color(d.group);
                return d.color;
            })
            // This part adds event listeners to each of the nodes; when you click,
            // move, and release the mouse on a node, each of these functions gets called
            // (we've defined them at the end of the file)
            .call(d3.drag()
                .on("start", dragstarted)
                .on("drag", dragged)
                .on("end", dragended))
                .call(tip)
                .on('mouseover', tip.show)
                .on('mouseout', tip.hide);



        // simulation.force("center").x(this.svgWidth / 2).y(this.svgHeight / 2);
        //
        // simulation.force("collide")
        //     .strength(1)
        //     // .radius(function(v) {
        //     //     return scales.radius(v.degree) + 2;
        //     // });
        //
        // simulation.force("charge").strength(-12);


        // Now that we have the data, let's give it to the simulation...
        simulation.nodes(this.nodes);

        // The tension force (the forceLink that we named "link" above) also needs to know
        // about the link data that we finally have
        simulation.force("link")
            .links(this.edges)
            .distance(10);

        // Finally, let's tell the simulation how to update the graphics
        simulation.on("tick", function () {
            // Every "tick" of the simulation will create / update each node's coordinates;
            // we need to use those coordinates to move the lines and circles into place
            links
                .attr("x1", function (d) {
                    return d.source.x;
                })
                .attr("y1", function (d) {
                    return d.source.y;
                })
                .attr("x2", function (d) {
                    return d.target.x;
                })
                .attr("y2", function (d) {
                    return d.target.y;
                });

            nodes
                .attr("cx", function (d) {
                    return d.x;
                })
                .attr("cy", function (d) {
                    return d.y;
                });
        });

        function dragstarted(d) {
        if (!d3.event.active) simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
    }

        function dragged(d) {
        d.fx = d3.event.x;
        d.fy = d3.event.y;
    }

        function dragended(d) {
        if (!d3.event.active) simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
    }

    }// close update()

}//close class