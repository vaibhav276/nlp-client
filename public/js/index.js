// Global variables
let poller = null;
let reqId = null;
let nlpEngine = null;
const pollDuration = 1000; // milliseconds
const btnStartStop = d3.select('#btnStartStop');
const txtInputUrl = d3.select('#txtInputUrl');

// Event Handlers
const startStopHandler = () => {
    if (reqId === null) {
	resetDOM();
	nlpEngine = new NLPEngineMock('localhost:3000');
	reqId = createRequest();
	startPolling();
    }
    else {
	stopPolling();
	reqId = null;
	nlpEngine = null;
    }
}

// Utility functions
const createRequest = () => {
    const inputUrl = txtInputUrl.property('value');
    reqId = nlpEngine.create(inputUrl);

    console.log('Created request', reqId);
}

const startPolling = () => {
    btnStartStop.text('Stop');
    poller = setInterval(pollHandler, pollDuration);
}

const stopPolling = () => {
    btnStartStop.text('Start');
    clearInterval(poller);
    poller = null; // TODO: execute after async call to clearInterval above returns
    reqId = null;
}

const pollHandler = () => {
    // Poll server and update DOM
    const data = nlpEngine.fetch(reqId);

    console.log('Data', data);

    updateDOM(data);
    if (data.done === true) stopPolling();
}

const resetDOM = () => {
    d3.select('#ulSteps').selectAll('li').remove();
    const divExcerpt = d3.select('#divExcerpt');
    divExcerpt.select('a')
	.attr('href', null)
	.text('');
    divExcerpt.select('p').text('');

    d3.select('#divScore').select('p').text('');

    d3.select('#divComponents').select('table').remove();
}

const updateDOM = data => {
    // Update DOM
    d3.select('#ulSteps').selectAll('li')
	.data(data.steps)
	.join('li')
	.text(d => d);

    if (data.done === true) {
	d3.select('#ulSteps').selectAll('li')
	    .transition()
	    .ease(d3.easeLinear)
	    .duration(1000)
	    .remove();

	const divExcerpt = d3.select('#divExcerpt');
	divExcerpt.select('a')
	    .attr('href', txtInputUrl.property('value'))
	    .attr('target', '_blank')
	    .text('View original page');
	divExcerpt.select('p').text(data.results.excerpt);

	d3.select('#divScore').select('p').text(scoreString(data.results.score));

	d3.select('#divComponents').append('table').selectAll('tr')
	    .data(data.results.components)
	    .join('tr')
	    .selectAll('td')
	    .data(d => [camel2title(d.name), floatToPrecentageString(d.value) + ' likely', d.desc])
	    .enter().append('td')
	    .text(d => d);
    }
}

const camel2title = camelCase => camelCase
  .replace(/([A-Z])/g, match => ` ${match}`)
      .replace(/^./, match => match.toUpperCase());

const floatToPrecentageString = n => {
    const rn = Number(Math.round((n * 100)+'e'+2)+'e-'+2);
    return rn + '%';
}

const scoreString = n => {
    return 'Overall Score: '
	+ n
	+ ' (<0.3 : Content may be harmful, 0.3 - 0.7: Content is questionble, >0.7: Content looks good)';
}

// Event bindings
btnStartStop.on('click', startStopHandler);
