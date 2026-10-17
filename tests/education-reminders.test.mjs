import test from 'node:test';
import assert from 'node:assert/strict';
import {sendEducationReminders} from '../workers/education-reminders.js';
import contactWorker from '../cloudflare-worker.js';
import reminderWorker from '../workers/contact-with-reminders.js';
const date=Date.parse('2026-10-15T04:00:00Z');
const entry={name:'Diploma in Cloud Cyber Security',institution:'Example institute',entryType:'education',educationStatus:'in_progress',startDate:'2025-01-01',endDate:'2026-10-15',endDatePrecision:'exact',visible:true};
function fixture(records=[entry]){
 const values=new Map();const deliveries=[];const queries=[];let deliveryStatus=204;
 const env={FIREBASE_PROJECT_ID:'portfolio-fixture',FIREBASE_API_KEY:'test-key',DISCORD_WEBHOOK_URL:'https://discord.invalid/test',EDUCATION_REMINDERS:{get:async k=>values.get(k),put:async(k,v)=>values.set(k,v)}};
 const fetcher=async(url,options)=>{if(String(url).includes('firestore.googleapis.com')){queries.push(JSON.parse(options.body));return Response.json(records.map((item,i)=>({document:{name:`projects/portfolio-fixture/databases/(default)/documents/certificates/item-${i}`,fields:Object.fromEntries(Object.entries(item).map(([key,value])=>[key,typeof value==='boolean'?{booleanValue:value}:{stringValue:value}]))}})))}deliveries.push(JSON.parse(options.body));return new Response(null,{status:deliveryStatus})};
 return{env,values,deliveries,queries,fetcher,setStatus:status=>deliveryStatus=status,records};
}
test('an exact due target uses the existing webhook and deduplicates successful daily deliveries',async()=>{
 const f=fixture();assert.deepEqual(await sendEducationReminders(f.env,date,f.fetcher),{sent:1,skipped:0});
 assert.equal(f.deliveries.length,1);assert.equal(f.values.size,1);assert.equal(f.deliveries[0].allowed_mentions.parse.length,0);
 assert.deepEqual(await sendEducationReminders(f.env,date+86400000,f.fetcher),{sent:0,skipped:1});
 assert.equal(f.queries[0].structuredQuery.where.fieldFilter.field.fieldPath,'visible');
 assert.equal(f.deliveries[0].embeds[0].fields.find(f=>f.name==='Target date').value,'2026-10-15');
});
test('estimates, completed, hidden, certificate, malformed, future, and missing dates never notify',async()=>{
 const f=fixture([{...entry,endDatePrecision:'estimated'},{...entry,educationStatus:'completed'},{...entry,visible:false},{...entry,entryType:'certificate'},{...entry,endDate:'2026-02-30'},{...entry,endDate:'2027-10-15'},{...entry,endDate:''},{...entry,startDate:'2027-01-01'},{...entry,endDatePrecision:undefined}].map(item=>Object.fromEntries(Object.entries(item).filter(([,v])=>v!==undefined))));
 assert.deepEqual(await sendEducationReminders(f.env,date,f.fetcher),{sent:0,skipped:9});assert.equal(f.deliveries.length,0);
});
test('extending a target creates a new reminder only when the revised timeline ends',async()=>{
 const f=fixture();await sendEducationReminders(f.env,date,f.fetcher);f.records[0]={...entry,endDate:'2026-11-15'};
 assert.equal((await sendEducationReminders(f.env,date+86400000,f.fetcher)).sent,0);
 assert.equal((await sendEducationReminders(f.env,Date.parse('2026-11-15T04:00:00Z'),f.fetcher)).sent,1);assert.equal(f.values.size,2);
});
test('failed Discord delivery stays retryable, and one failed record does not suppress another',async()=>{
 const f=fixture();f.setStatus(429);await assert.rejects(sendEducationReminders(f.env,date,f.fetcher),AggregateError);assert.equal(f.values.size,0);
 f.setStatus(204);assert.equal((await sendEducationReminders(f.env,date+86400000,f.fetcher)).sent,1);
 const pair=fixture([entry,{...entry,name:'Another program'}]);let first=true;
 const transport=async(u,o)=>{if(String(u).includes('discord.invalid')&&first){first=false;return new Response(null,{status:500})}return pair.fetcher(u,o)};
 await assert.rejects(sendEducationReminders(pair.env,date,transport),AggregateError);assert.equal(pair.values.size,1);
});
test('only a supplied numeric Discord ID can be mentioned; usernames cannot ping unintended accounts',async()=>{
 const f=fixture();f.env.DISCORD_USER_ID='felix_913';await sendEducationReminders(f.env,date,f.fetcher);assert.deepEqual(f.deliveries[0].allowed_mentions.users,[]);
 const g=fixture();g.env.DISCORD_USER_ID='123456789012345678';await sendEducationReminders(g.env,date,g.fetcher);assert.match(g.deliveries[0].content,/<@123456789012345678>/);assert.deepEqual(g.deliveries[0].allowed_mentions.users,['123456789012345678']);
});
test('missing configuration and failed Firebase reads do not send or mark reminders',async()=>{
 const f=fixture();await assert.rejects(sendEducationReminders({...f.env,EDUCATION_REMINDERS:undefined},date,f.fetcher));
 await assert.rejects(sendEducationReminders(f.env,date,async()=>new Response(null,{status:403})));assert.equal(f.deliveries.length,0);assert.equal(f.values.size,0);
});
test('the scheduled addition leaves the contact Worker HTTP gate and CORS contract intact',async()=>{
 assert.equal((await contactWorker.fetch(new Request('https://contact.invalid'),{})).status,405);
 const options=await contactWorker.fetch(new Request('https://contact.invalid',{method:'OPTIONS'}),{});assert.equal(options.headers.get('Access-Control-Allow-Methods'),'POST, OPTIONS');
});
test('reminders are opt-in and reuse the exact original contact HTTP handler',async()=>{
 assert.equal(contactWorker.scheduled,undefined);
 assert.equal(reminderWorker.fetch,contactWorker.fetch);
 const work=[];
 reminderWorker.scheduled({scheduledTime:date},{},{waitUntil:promise=>work.push(promise)});
 assert.equal(work.length,1);
 await assert.rejects(work[0],/Education reminders need/);
});
