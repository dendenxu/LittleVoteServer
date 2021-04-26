import http from 'k6/http';
import { check, group, sleep, fail } from 'k6';
export let options = {
  vus: 50, // 1 user looping for 1 minute
  duration: '20s',
  thresholds: {
    http_req_duration: ['p(99)<1500'], // 99% of requests must complete below 1.5s
  },
};

const BASE_URL = 'http://localhost:4000';
var names = ["James", "John", "Robert", "Michael", "William"];
var token = "2fcecaec0a2fd633415da5d8e2ec22c9"; 
export default () => {
	const peopleQuery = `
# Write your query or mutation here
query People {
  	query(names: ${JSON.stringify(names)}) {
    	name
    	voteCount
  	}
}
	`;

	const ticketQuery = `
query Ticket {
    cas {
        token
        used
        total
    }
}
	`;

	const voteForMutation = `
mutation Vote {
    vote(names: ${JSON.stringify(names)}, token: ${JSON.stringify(token)}) {
        success
        message
        updated {
            name
            voteCount
        }
    }
}
	`;

  let headers = {
      'Content-Type': 'application/json',
  };

  let peopleResp = http.post(`${BASE_URL}`, JSON.stringify({query: peopleQuery}), {headers});
  check(peopleResp, {
    'Query names successful': (resp) => {
      return resp.status === 200;
    },
  });

  let ticketResp = http.post(`${BASE_URL}`, JSON.stringify({query: ticketQuery}), {headers});
  check(ticketResp, {
    'Query ticket successful': (resp) => {
      return resp.status === 200;
    },
  });
  let jsonData = JSON.parse(ticketResp.body);
  let newTicket = jsonData.data.cas.token;
  if (token !== newTicket) {
    console.log(`Setting new token: ${newTicket}, old: ${token}`);
    token = newTicket
  } else {
    console.log(`Token ${token} is currently valid`);
  } 

  const voteResp = http.post(`${BASE_URL}`, JSON.stringify({query: voteForMutation}), {headers});
  check(voteResp, {
    'Voting names successfully': (resp) => {
      console.log(`Voting result: ${JSON.stringify(JSON.parse(resp.body))}`);
      return resp.status === 200;
    },
  });

  sleep(0.1);
};

