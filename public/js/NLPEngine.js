class NLPEngine {
    constructor(serverAddr) {
	this.serverAddr = serverAddr;
    }

    create = (url, cb) => {
	fetch(this.serverAddr + 'create.php', {
	    method: 'POST',
	    headers: {
		'Accept': 'application/json'
	    },
	    body: JSON.stringify({url: url})
	})
	    .then(r => {
		console.log('create response headers');
		for (let [k, v] of r.headers) console.log(k, v);
		return r;
	    })
	    .then(r => r.json())
	    .then(d => {
		console.log('create response body', d);
		cb(d);
	    });
    }
    
    fetch = (reqId, cb) => {
	fetch(this.serverAddr + 'fetch.php?reqId=' + reqId, {
	    method: 'GET',
	    headers: {
		'Accept': 'application/json'
	    },
	    // body: JSON.stringify({url: url})
	})
	    .then(r => {
		console.log('fetch response headers');
		for (let [k, v] of r.headers) console.log(k, v);
		return r;
	    })
	    .then(r => r.json())
	    .then(d => {
		console.log('fetch response body', d);
		cb(d);
	    });
    }
}
