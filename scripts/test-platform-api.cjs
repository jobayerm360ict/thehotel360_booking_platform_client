const test = require('node:test'), assert = require('node:assert/strict'), path = require('node:path'), fs = require('node:fs'), Module = require('node:module'), ts = require('typescript');
const root = path.join(__dirname, '..');
process.env.NEXT_PUBLIC_API_BASE_URL = 'http://localhost:3109/api/v1';
const originalLoad = Module._load, originalResolve = Module._resolveFilename;
Module._resolveFilename = function(name, ...args) { return originalResolve.call(this, name.startsWith('@/') ? path.join(root,name.slice(2)) : name, ...args); };
Module._load = function(name, ...args) { if (name === '@/components/ui/sonner') return { toast: { error() {} } }; return originalLoad.call(this, name, ...args); };
for (const extension of ['.ts', '.tsx']) Module._extensions[extension] = (module, filename) => module._compile(ts.transpileModule(fs.readFileSync(filename,'utf8'),
  { compilerOptions: { target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.CommonJS, esModuleInterop: true, jsx: ts.JsxEmit.ReactJSX } }).outputText, filename);
const storage = new Map([['token','test-access-token']]);
global.window = {}; global.localStorage = { getItem: key => storage.get(key) || null, setItem: (key,value) => storage.set(key,value), removeItem: key => storage.delete(key) };
global.sessionStorage = { getItem: () => null, setItem() {}, removeItem() {} };
const { platformService } = require('../services/platformService.ts');
const actions = require('../store/platformActions.ts');
const { configureStore } = require('@reduxjs/toolkit');
const favorites = require('../store/slices/favoritesSlice.ts').default;
const bookings = require('../store/slices/bookingSlice.ts').default;
const messages = require('../store/slices/messagesSlice.ts').default;
function store() { return configureStore({ reducer: { auth: () => ({ user: { id:'9' }, currentRole:'guest', isAuthenticated:true }), favorites, booking:bookings, messages } }); }
const response = (data,status=200) => new Response(JSON.stringify(data), { status, headers: { 'Content-Type':'application/json' } });

test('pagination requests every backend page with auth and keeps backend IDs', async () => {
  const calls=[]; global.fetch=async(url,options)=>{const parsed=new URL(url); calls.push({url:parsed,options});const page=Number(parsed.searchParams.get('page'));return response({success:true,data:[{id:String(page)}],meta:{hasNextPage:page===1}});};
  assert.deepEqual((await platformService.listings()).map(x=>x.id), ['1','2']);
  assert.equal(calls[0].options.headers.Authorization,'Bearer test-access-token');assert.equal(calls[1].url.searchParams.get('page'),'2');
});
test('favorites change only after successful persistence and preserve state on failure', async () => {
  const s=store(); let finish;global.fetch=()=>new Promise(resolve=>{finish=resolve;});
  const pending=s.dispatch(actions.toggleFavorite('123'));assert.deepEqual(s.getState().favorites.favoriteIds,[]);
  finish(response({success:true,data:{isFavorite:true}}));await pending.unwrap();assert.deepEqual(s.getState().favorites.favoriteIds,['123']);
  global.fetch=async()=>response({success:false,message:'Forbidden'},403);
  await assert.rejects(s.dispatch(actions.toggleFavorite('123')).unwrap());assert.deepEqual(s.getState().favorites.favoriteIds,['123']);
});
test('booking create sends only guest DTO plus retry key, never fabricated payment or status',async()=>{
  let captured;global.fetch=async(url,options)=>{captured=options;return response({success:true,data:{id:'456',status:'pending',paidAmount:0}});};
  const body={listingId:'123',checkIn:'2099-01-01',checkOut:'2099-01-03',guests:{adults:2,children:0,infants:0,pets:0},paymentPlan:'full',paymentMethod:'card'};
  const booking=await platformService.createBooking(body,'retry-key');assert.equal(booking.id,'456');assert.equal(booking.status,'pending');assert.deepEqual(JSON.parse(captured.body),body);assert.equal(captured.headers['Idempotency-Key'],'retry-key');
});
test('message transport strips client-supplied identity and caches returned thread IDs',async()=>{
  let sent;global.fetch=async(url,options)=>{if(url.endsWith('/messages/send')){sent=JSON.parse(options.body);return response({success:true,data:{id:'42'}});}return response({success:true,data:{id:'7',guestId:'9',messages:[{id:'42',text:'Hello',senderId:'9'}]}});};
  const s=store();await s.dispatch(actions.sendMessage({conversationId:'7',text:'Hello',senderId:'forged',senderName:'forged',senderRole:'host'})).unwrap();
  assert.deepEqual(sent,{conversationId:'7',text:'Hello'});assert.equal(s.getState().messages.conversations[0].messages[0].id,'42');
});
test('host listing create strips ratings, badges and claimed host identity',async()=>{
  let sent;global.fetch=async(url,options)=>{sent=JSON.parse(options.body);return response({success:true,data:{...sent,id:'99',host:{id:'9'}}});};
  const s=store();await s.dispatch(actions.createListing({id:'mock',title:'Test property',description:'Real description',category:'all',location:{city:'Dhaka',country:'Bangladesh'},pricePerNight:100,images:['https://example.com/photo.jpg'],specs:{maxGuests:2,bedrooms:1,beds:1,bathrooms:1,propertyType:'apartment'},amenities:[],rules:[],host:{id:'forged'},rating:5,reviewCount:99,isFeatured:true})).unwrap();
  assert.equal(sent.host,undefined);assert.equal(sent.rating,undefined);assert.equal(sent.isFeatured,undefined);assert.equal(sent.id,undefined);
});
test('avatar paths resolve safely and empty avatars use a local placeholder',async()=>{
  global.fetch=async()=>response({success:true,data:{id:'1',host:{avatar:'user-files/avatar.jpg'},guestAvatar:''}});
  const result=await platformService.listing('1');assert.match(result.host.avatar,/travistay\/user-files\/avatar.jpg$/);assert.equal(result.guestAvatar,'/app.svg');
});
test('homepage benefits and newsletter use public API without guest credentials',async()=>{
  const calls=[];
  global.fetch=async(url,options)=>{
    calls.push({url:new URL(url),options});
    return response({success:true,data:url.endsWith('/home-content')?{benefits:[{id:'1',title:{en:'Clear prices',bn:'স্বচ্ছ মূল্য'},description:{en:'Details',bn:'বিবরণ'},icon:'Wallet',sortOrder:1}],settings:{benefitsHeading:{en:'Why choose us',bn:'কেন আমাদের'},faqHeading:{en:'FAQ',bn:'প্রশ্ন'},faqDescription:{en:'Answers',bn:'উত্তর'},storiesHeading:{en:'Stories',bn:'গল্প'},storiesDescription:{en:'Read more',bn:'আরও পড়ুন'},subscriptionHeading:{en:'Updates',bn:'খবর'},subscriptionDescription:{en:'Join us',bn:'যোগ দিন'}}}:{status:'accepted'}});
  };
  const content=await platformService.homeContent();
  const subscription=await platformService.subscribe('guest@example.com');
  assert.equal(content.benefits[0].title.en,'Clear prices');
  assert.equal(content.settings.subscriptionHeading.bn,'খবর');
  assert.equal(subscription.status,'accepted');
  assert.equal(calls[0].url.pathname,'/api/v1/home-content');
  assert.equal(calls[1].url.pathname,'/api/v1/subscriptions');
  assert.equal(calls[0].options.headers.Authorization,undefined);
  assert.equal(calls[1].options.headers.Authorization,undefined);
  assert.deepEqual(JSON.parse(calls[1].options.body),{email:'guest@example.com'});
});
