import test from 'node:test';
import assert from 'node:assert/strict';
import {inlineCopyLines, parseInlineCopy, plainInlineCopy} from '../src/lib/inlineCopy.ts';
import {educationTimeline, isExactEducationDate, parseEducationDate, readableEducationDate} from '../src/lib/education.ts';

test('basic site copy retains readable words, nested emphasis, and opaque inline code',()=>{
 const source='Learn **Linux and *cloud*** with `user_name`.';
 const parts=parseInlineCopy(source);
 assert.equal(plainInlineCopy(source),'Learn Linux and cloud with user_name.');
 assert.equal(parts.find(p=>p.kind==='strong').children.some(p=>p.kind==='em'),true);
 assert.equal(parseInlineCopy('`**literal** <script>`')[0].kind,'code');
 assert.equal(parseInlineCopy('`**literal** <script>`')[0].text,'**literal** <script>');
});
test('escaped or unfinished delimiters and literal HTML are safe text, not generated markup',()=>{
 assert.equal(plainInlineCopy('A \\*literal\\* and **unfinished'),'A *literal* and **unfinished');
 assert.deepEqual(parseInlineCopy('<img src=x onerror=alert(1)>'),[{kind:'text',text:'<img src=x onerror=alert(1)>'}]);
 assert.equal(plainInlineCopy('Linux_System_Admin'),'Linux_System_Admin');
 assert.equal(plainInlineCopy('**Cloud**\n*Security*'),'Cloud\nSecurity');
});
test('formatting survives authored headline line breaks before line wrappers are created',()=>{
 const text='Linux.\nCloud.\nSecurity.';
 const visible=parts=>parts.map(part=>part.children?visible(part.children):part.text).join('');
 for(const [marker,kind] of [['**','strong'],['*','em'],['`','code']]){
   const lines=inlineCopyLines(marker+text+marker);
   assert.deepEqual(lines.map(visible),['Linux.','Cloud.','Security.']);
   assert.equal(lines.every(line=>line[0].kind===kind),true);
 }
 const nested=inlineCopyLines('**Linux.\n*Cloud.*\nSecurity.**');
 assert.deepEqual(nested.map(visible),['Linux.','Cloud.','Security.']);
 assert.equal(nested[1][0].children.find(part=>part.kind==='em')?.text,'Cloud.');
 assert.equal(plainInlineCopy('`line\nbreak`'),'line break');
});
test('estimated legacy months and years use consistent Karachi calendar boundaries',()=>{
 assert.equal(parseEducationDate('May/2025'),Date.parse('2025-04-30T19:00:00Z'));
 assert.equal(parseEducationDate('2025',true),Date.parse('2025-12-30T19:00:00Z'));
 assert.equal(parseEducationDate('2028-02',true),Date.parse('2028-02-28T19:00:00Z'));
 assert.equal(readableEducationDate('2027-09-15'),'15 Sept 2027');
 assert.equal(readableEducationDate('May/2025'),'May 2025');
});
test('invalid and ambiguous dates cannot invent a percentage or enable an exact reminder',()=>{
 for(const text of ['2026-02-29','2025-13-02','2025-02-30','Sep-ish 2025','03/04/2025','0000','2025-00'])assert.equal(parseEducationDate(text),null,text);
 assert.equal(isExactEducationDate('2028-02-29'),true);
 assert.equal(isExactEducationDate('2027-02-29'),false);
 assert.equal(educationTimeline({startDate:'2027',endDate:'2026',educationStatus:'in_progress'}),null);
 assert.equal(educationTimeline({startDate:'2025',educationStatus:'in_progress'}),null);
 assert.equal(educationTimeline({startDate:'2025',endDate:'2027',endDatePrecision:'exact',educationStatus:'in_progress'}),null);
});
test('planned time clamps before and after its range without granting completion',()=>{
 const entry={startDate:'2026-01-01',endDate:'2026-01-11',educationStatus:'in_progress',endDatePrecision:'exact'};
 assert.equal(educationTimeline(entry,Date.parse('2026-01-05T19:00:00Z')).percent,50);
 assert.equal(educationTimeline(entry,Date.parse('2025-12-31T18:59:00Z')).percent,0);
 const ended=educationTimeline(entry,Date.parse('2026-01-10T19:00:00Z'));
 assert.equal(ended.percent,100);assert.equal(ended.reached,true);assert.equal(entry.educationStatus,'in_progress');
 assert.equal(educationTimeline({...entry,educationStatus:'completed'}),null);
});
