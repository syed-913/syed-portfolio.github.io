import test from 'node:test';
import assert from 'node:assert/strict';
import { CANVAS_LIMITS, canvasIssues, fitCanvasBox, normalizeHeroCanvas, publicCanvasScenes } from '../src/lib/heroCanvas.ts';
import { initialHeroCanvas, newCanvasElement, sceneFromProject } from '../src/lib/canvasPresets.ts';
import { safeLink } from '../src/lib/safeLink.ts';

const project = { id:'console', name:'User Management Console', description:'Linux account lifecycle automation.', stack:['Bash','Linux'], command:'umc', url:'https://github.com/syed-913/User_Management_Console', output:'', visible:true, order:0 };

test('old, missing and unsupported canvas settings keep the original hero available', () => {
  for (const input of [undefined, null, {}, {version:2,enabled:true,scenes:[]}, {version:1,enabled:true,scenes:[]}]) assert.equal(normalizeHeroCanvas(input), undefined);
  const config = initialHeroCanvas([project]);
  assert.equal(config.enabled, false);
  assert.equal(publicCanvasScenes(config, [project]).length, 0);
  assert.ok(normalizeHeroCanvas(config));
});
test('only explicitly published projects can contribute linked public scenes', () => {
  const visible = sceneFromProject(project), hidden = sceneFromProject({...project,id:'private',visible:false});
  const custom = sceneFromProject();
  const config = {version:1,enabled:true,defaultSceneId:visible.id,scenes:[visible,hidden,custom]};
  assert.deepEqual(publicCanvasScenes(config,[project,{...project,id:'private',visible:false}]).map(scene=>scene.id),[visible.id,custom.id]);
  assert.match(canvasIssues(config,[project]).join(' '),/visible project/);
});
test('authored shape data cannot become script, CSS or an executable link', () => {
  const config = initialHeroCanvas([project]);
  const node = config.scenes[0].elements[0];
  node.href = 'javascript:alert(1)';node.color='red';node.style={position:'fixed'};
  node.kind='box';node.text='<script>alert(1)</script> **still just authored text**';
  node.box={x:99,y:-5,width:150,height:NaN};
  const safe = normalizeHeroCanvas(config).scenes[0].elements[0];
  assert.equal(safe.href,'');assert.equal('color' in safe,false);assert.equal('style' in safe,false);
  assert.equal(safe.text,node.text);assert.deepEqual(safe.box,{x:0,y:0,width:100,height:16});
  assert.match(canvasIssues(config,[project]).join(' '),/invalid link/);
});
test('URL validation rejects ambiguous navigation while preserving real project destinations', () => {
  for(const url of ['javascript:alert(1)','data:text/html,x','//evil.example','/\\evil.example','https://user:password@example.com','https://example.com\n/path','ftp://example.com']) assert.equal(safeLink(url),undefined,url);
  for(const url of ['/projects/#console','#work','https://github.com/syed-913/User_Management_Console']) assert.equal(safeLink(url),url);
  assert.equal(safeLink('/projects#console'), '/projects/#console');
});
test('desktop and mobile layouts remain independent and bounded after normalization', () => {
  const config = initialHeroCanvas([project]);
  const node = config.scenes[0].elements[0];
  node.box={x:15,y:10,width:30,height:25};node.mobileBox={x:4,y:6,width:92,height:18};
  const safe = normalizeHeroCanvas(config).scenes[0].elements[0];
  assert.deepEqual(safe.box,node.box);assert.deepEqual(safe.mobileBox,node.mobileBox);
  assert.deepEqual(fitCanvasBox({x:95,y:95,width:20,height:20}),{x:80,y:80,width:20,height:20});
});
test('invalid or duplicate objects cannot make ambiguous elements or default tabs', () => {
  const config = initialHeroCanvas([project]);
  const scene = config.scenes[0], node = scene.elements[0];
  config.defaultSceneId='missing';scene.elements.push({...node},{...node,id:'bad id'},{...node,id:'unknown',kind:'iframe'});config.scenes.push({...scene});
  const safe=normalizeHeroCanvas(config);
  assert.equal(safe.scenes.length,1);assert.equal(safe.defaultSceneId,scene.id);
  assert.equal(safe.scenes[0].elements.filter(item=>item.id===node.id).length,1);
  assert.equal(safe.scenes[0].elements.some(item=>item.kind==='iframe'),false);
});
test('layout budget measures UTF-8 and fails safely before oversized settings are saved', () => {
  const config=initialHeroCanvas([project]);
  config.scenes[0].elements=Array.from({length:40},()=>({...newCanvasElement('text'),text:'😀'.repeat(2000)}));
  assert.ok(new TextEncoder().encode(JSON.stringify(config)).byteLength>CANVAS_LIMITS.bytes);
  assert.equal(normalizeHeroCanvas(config),undefined);
  assert.match(canvasIssues(config,[project]).join(' '),/too large/);
});
