function render1(data, plot_id, my_flag) {
    //var test = document.getElementById('test');
    //test.innerHTML = "hello world";
    
    data_length = data.length;

    //console.log(data);
    
    // max count(*)
    data_max = Math.max.apply(Math,data.map(function(d){
        return d["COUNT(*)"];}));
    data_min = Math.min.apply(Math,data.map(function(d){return d["COUNT(*)"];}));
    // set the ranges
    // 定义比例尺，将横轴、纵轴的取值映射到坐标
    // 针对第二种数据类型，画直方图
    if (data_length > 200)
    {

        var margin = {top: 20, right: 80, bottom: 80, left: 80},
    
        width = 420 - margin.left - margin.right;
        height = 400 - margin.top - margin.bottom;
        var tip = d3.tip()
            .attr('class', 'd3-tip')
            .offset([-10, 0])
            .html(function(d) {
                return "<strong>Frequency:</strong> <span style='color:red'>" + d.y + "</span>";
            })
        //添加SVG绘制区域
        var svg = d3.select(document.getElementById(plot_id)).append("svg")
                .attr("width",width + margin.left + margin.right)
                .attr("height",height + margin.top + margin.bottom);
        document.getElementById(plot_id).firstChild.setAttribute("id", plot_id + 17);
        svg.call(tip);

        val_min[plot_id] = Math.min.apply(Math,data.map(function(d){return d[tbl_name[plot_id]];}));
        val_max[plot_id] = Math.max.apply(Math,data.map(function(d){return d[tbl_name[plot_id]];}));
        //console.log(val_max, val_min);
        var bin_num = 6;
        var histogram = d3.layout.histogram()
            .value(function(d) { return d[tbl_name[plot_id]]; })
            .range([val_min[plot_id],val_max[plot_id]])
            .bins(bin_num)
            .frequency(true);
        var data_trans = histogram(data);
        //console.log(data);
        //console.log(data_trans);

        //定义比例尺
        var max_height = 300;
        var rect_step = 40;
        var heights = [];
        var trans_length = data_trans.length;


        for(var i=0;i<trans_length;i++){
            heights.push( data_trans[i].y );
            //console.log(data_trans[i].y);
        }
        //console.log(d3.min(heights));
        min_height_flag[plot_id] = d3.min(heights);
        max_height_flag[plot_id] = d3.max(heights);

        var yScale = d3.scale.linear()
                .domain([d3.min(heights),d3.max(heights)])
                .range([max_height, 0]);
        var yAxis = d3.svg.axis()  
                .scale(yScale)  
                .orient("left")
                .ticks(20); 
     
        //绘制图形
        var graphics = svg.append("g")
                //.attr("transform","translate(30,20)"); 
                .attr("transform", 
                      "translate(" + margin.left + "," + margin.top + ")");
     
        //绘制矩形
        graphics.selectAll("rect")
            .data(data_trans)
            .enter()
            .append("rect")
            .attr("x",function(d,i){
                return i * rect_step; 
            })
            .attr("y", function(d,i){
                return yScale(d.y);
            })
            .attr("width", function(d,i){
                return rect_step - 2; 
            })
            .attr("height", function(d){
                return max_height - yScale(d.y);
            })
            .attr("id", function(d, i){

                var left = val_min[plot_id] + (val_max[plot_id]-val_min[plot_id])*(i-1/2) / 20;
                var right = val_min[plot_id] + (val_max[plot_id]-val_min[plot_id])*(i+1/2) / 20;
                console.log("left and right");
                console.log(left,right);
                return tbl_name[plot_id] + '_' + left +'_' + right;
            })
            .attr("fill","steelblue")
            .on('click', function() {
                //console.log(this.id);
                d3.select(this).attr("fill","green");
                parms_2 = parms_2 + '__' + this.id;
                flag_id[plot_id] = 1;
                console.log("parms_2: ");
                console.log(parms_2);
                //yScale_flag[plot_id] = yScale;
                //bar_reset(parms);
            })
            .on('mouseover', tip.show)
            .on('mouseout', tip.hide);
      
        //绘制坐标轴的直线
        graphics.append("line")
            .attr("stroke","black")
            .attr("stroke-width","1px")
            .attr("x1",0)
            .attr("y1",max_height)
            .attr("x2",trans_length * rect_step)
            .attr("y2",max_height);
      
      
        //绘制坐标轴的分隔符直线
        graphics.selectAll(".linetick")
            .data(data_trans)
            .enter()
            .append("line")
            .attr("stroke","black")
            .attr("stroke-width","1px")
            .attr("x1",function(d,i){
                return i * rect_step + rect_step/2;
            })
            .attr("y1",max_height)
            .attr("x2",function(d,i){
                return i * rect_step + rect_step/2;
            })
            .attr("y2",max_height + 5);
      
        //绘制文字
        graphics.selectAll("text")
            .data(data_trans)
            .enter()
            .append("text")
            .attr("font-size","10px")
            .attr("x",function(d,i){
                return i * rect_step; 
            })
            .attr("y", function(d,i){
                return max_height;
            })
            .attr("dx",rect_step/2 - 8)
            .attr("dy","15px")
            .text(function(d){
                return Math.floor(d.x);
            });
        svg.append("g")
            .attr("class","axis")
            .attr("transform","translate(" + margin.left + "," + margin.top + ")")
            .call(yAxis);
        graphics.append("text")
            .attr("x", (width/2))
            .attr("y", 0 - (margin.top /2 ))
            .attr("text-anchor", "middle")
            .style("font-size", "16px")
            .style("text-decoration", "underline")
            .text(function(d) {
                return tbl_name[plot_id];
            });
    }
    // 针对第一种数据类型，画条形图
    else {
        var formatCount = d3.format(",.0f");
        // set the dimensions of the canvas
        var margin = {top: 20, right: 20, bottom: 80, left: 80},
            width = (data_length*40 < 180 ? 180:(data_length *40 < 400 ? 400 : (data_length * 40 > 1000 ? 1000 : data_length * 40))) - margin.left - margin.right,
            //width = 500 - margin.left - margin.right,
            height = 400 - margin.top - margin.bottom;
        var x = d3.scale.ordinal()
            .domain(data.map(function(d) { return d[tbl_name[plot_id]]; }))
            .rangeRoundBands([0, width]);
        min_height_flag[plot_id] = 0;
        max_height_flag[plot_id] = data_max;
    
        var y = d3.scale.linear()
            .domain([0, data_max])
            .range([height, 0]);

        // define the axis
        var xAxis = d3.svg.axis()
            .scale(x)
            .orient("bottom")


        var yAxis = d3.svg.axis()
            .scale(y)
            .orient("left")
            .ticks(20);

        var tip = d3.tip()
            .attr('class', 'd3-tip')
            .offset([-10, 0])
            .html(function(d) {
                return "<strong>Frequency:</strong> <span style='color:red'>" + d["COUNT(*)"] + "</span>";
            })
        // add the SVG element
        var svg = d3.select(document.getElementById(plot_id)).append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", 
                "translate(" + margin.left + "," + margin.top + ")");
    
    
        document.getElementById(plot_id).firstChild.setAttribute("id", plot_id + 17);
        svg.call(tip);
        // scale the range of the data
        x.domain(data.map(function(d) { return d[tbl_name[plot_id]]; }));
        y.domain([0, data_max]);
        //console.log(d3.max(data, function(d) {return d["COUNT(*)"];}));

        // add axis
        svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + height + ")")
            .call(xAxis)
            .selectAll("text")
            .style("text-anchor", "end")
            .attr("dx", "-.8em")
            .attr("dy", "-.55em")
            .attr("transform", "rotate(-90)" );

        svg.append("g")
            .attr("class", "y axis")
            .call(yAxis)
            .append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 5)
            .attr("dy", ".71em")
            .style("text-anchor", "end")
            .text("Frequency");

      
        // Add bar chart
        svg.selectAll(".bar")
            .data(data)
            .enter().append("rect")
            .attr("class", "bar")
            .attr("x", function(d) { 
                return x(d[tbl_name[plot_id]]); 
            })
            .attr("width", x.rangeBand() - 2)
            .attr("y", function(d) { 
                return y(d["COUNT(*)"]); 
            })
    
            .attr("height", function(d) { return height - y(d["COUNT(*)"]); })
            .attr("id", function(d){
                return tbl_name[plot_id] + '_' + d[tbl_name[plot_id]];
            })
            .attr('fill', 'steelblue')
            .on('click', function() {
                console.log(this.id);
                d3.select(this).attr("fill","green");
                parms = parms + '__' + this.id;
                flag_id[plot_id] = 1;
                //yScale_flag[plot_id] = y;
        
                //bar_reset(parms);
                })
            .on('mouseover', tip.show)
            .on('mouseout', tip.hide);
        svg.append("text")
            .attr("x", (width/2))
            .attr("y", 0 - (margin.top /2 ))
            .attr("text-anchor", "middle")
            .style("font-size", "14px")
            .style("text-decoration", "underline")
            .text(function(d) {
                return tbl_name[plot_id];
            });
    }     
}