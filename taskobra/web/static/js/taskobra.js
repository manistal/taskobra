/*
    Dynamic Hostlist Rendering function
      Specializes the <template> in the home.html sheet
      https://developer.mozilla.org/en-US/docs/Web/HTML/Element/template
*/
function render_systems(system_list) {
  console.log( "taskobra.js: entered render_hostlist" );
  // Construct the instance of the template
  var template = document.querySelector('#taskobra-hostlist-entry');
  system_list.forEach(host => {
    // Fill in the attrs of the instance
    var instance = template.content.cloneNode(true);
    instance.querySelector(".hostlist-checkbox").value = host.hostname;
    instance.querySelector(".hostlist-name").textContent = host.hostname;
    instance.querySelector(".hostlist-cores").textContent = host.cores;
    instance.querySelector(".hostlist-memory").textContent = host.memory;
    instance.querySelector(".hostlist-storage").textContent = host.storage;
    instance.querySelector("tr").addEventListener("click", function(event){
      var hostlist_checkbox = event.currentTarget.querySelector(".hostlist-checkbox");
      hostlist_checkbox.checked = !hostlist_checkbox.checked;
    }, false);

    // Add it to the content section 
    document.querySelector("#taskobra-hostlist-entries").appendChild(instance);
  });
  
  // Always ensure at least one hostname is checked 
  $('input:checkbox:first').each(function () { this.checked = true })
}

/*
    Dynamic Chart rendering function
      Fills in the charts for each tabbed section 
      https://developers.google.com/chart/interactive/docs/quick_start
*/
function render_charts() {
  document.querySelectorAll(".taskobra-chart").forEach(chart => {
    // Query the UI for information about what the user wants rendered
    var metric_type = chart.getAttribute('data-metric-type')
    var selected_hostnames = $("tr input:checked").map(function () { return this.value }).get()

    // Ensure the chart is visible and a set of data sets are selected before rendering
    if ($( chart ).parent('.active').length == 0) { return }
    if (selected_hostnames.length == 0) { return }

    // Asynchronously fetch data and draw the chart 
    $.ajax({
      url: "/api/metrics/" + metric_type, 
      data: {'hostnames': selected_hostnames.join(',')},
      chart: chart, hostnames: selected_hostnames, 
      success: function(chart_data) {
        // Generate the labels for the legend based on the selected hosts 
        var labels = [ {label: 'Time', id: 'time'} ]; 
        this.hostnames.forEach(function (hostname) { 
          var hostname_id = hostname.toLowerCase().split(' ').join('')
          labels.push({label: hostname, id: hostname_id, type: 'number'}) 
        })

        // Google requires a 'DataTable' object for it series
        // This is of the shape [ [{ column info }] [x1, y1, z1] [x2, y2, z2] ]
        var data = google.visualization.arrayToDataTable(
          [ labels ].concat(chart_data)
        );

        // Use window information to make the chart responsive to page sizing
        var options = {
          curveType: 'function',
          width: $(window).width()*0.80, 
          height: $(window).height()*0.50, 
          chartArea: {'width': '90%', 'height': '80%'},
          legend: {position: 'none'}
        };

        var chart = new google.visualization.LineChart(this.chart);
        chart.draw(data, options);
    }})
  });
}

/* 
    Main Callback
      When document finishes loading in the client
*/
window.onload = (event) => {
  console.log( "taskobra.js: entered onload" );

  // Hostlist setup
  $.ajax({url: "/api/systems", success: render_systems});

  // Charting setup
  // Load the Visualization API and the corechart package.
  google.charts.load('current', {'packages':['corechart']});
  google.charts.setOnLoadCallback(render_charts);
};

/* 
    On Ready Callback
      After the load finishes
*/
$( document ).ready(function () {
  $('#v-pills-cpu-tab').tab('show')
  setInterval(render_charts, 1000);
})