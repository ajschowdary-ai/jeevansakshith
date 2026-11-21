const subjects = [
 ['Mathematics',4],
 ['Database Management Systems',4],
 ['Operating Systems',3],
 ['Computer Networks',3],
 ['Software Engineering',3],
 ['AI Lab',3]
];

const branches = ['CSE(AI & DS)','ECE','EEE','MECH'];

const names = [
 'Aarav Kumar','Ananya Rao','Jeevan Sakshith','Charan Teja',
 'Divya Reddy','Ishaan Patel','Kavya Sharma',
 'Manoj Kumar','Niharika G','Pranavi S'
];

const points = {O:10,'A+':9,A:8,'B+':7,B:6,C:5,F:0};

function grade(m) {
 return m>=90?'O':
        m>=80?'A+':
        m>=70?'A':
        m>=60?'B+':
        m>=50?'B':
        m>=40?'C':'F';
}

const students = Array.from({length:100},(_,i)=>{
 let year = 2026+i%3;
 let branch = branches[i%4];
 let hall = String(year).slice(2)+branch+String(101+i);

 let records = subjects.map(([name,credits],j)=>{
  let total = 48+(i*13+j*17+i*j*3)%51;
  if(i%17===0&&j===2) total=35;

  let internal = Math.round(total*.3);
  let g = grade(total);

  return {
   name,credits,total,internal,
   external:total-internal,
   grade:g
  };
 });

 let sgpa = records.reduce(
  (a,r)=>a+r.credits*points[r.grade],0
 )/20;

 if(i===3) {
  ['A+','A+','A+','A','A+','A+'].forEach((g,j)=>{
   records[j].grade=g;
   records[j].total=[84,86,82,76,88,85][j];
   records[j].internal=Math.round(records[j].total*.3);
   records[j].external=records[j].total-records[j].internal;
  });
  sgpa=8.85;
 }

 return {
  hall,branch,year,
  name:names[i%10]+' '+(i+1),
  records,
  sgpa:+sgpa.toFixed(2),
  cgpa:+Math.max(5,Math.min(10,sgpa+(i%9-4)*.035)).toFixed(2),
  credits:20
 };
});

let demo = students[3];

Object.assign(demo,{
 hall:'26MVADSR0001',
 name:'Jeevan Sakshith',
 branch:'CSE(AI & DS)',
 year:2026,
 cgpa:8.72
});

let selected = demo;
let charts = {};

document.querySelectorAll('.tab').forEach(b=>{
 b.onclick=()=>{
  document.querySelectorAll('.tab').forEach(x=>
   x.classList.toggle('active',x===b)
  );

  document.querySelectorAll('.panel').forEach(p=>
   p.classList.toggle('active',p.id===b.dataset.panel)
  );

  if(b.dataset.panel==='analyticsPanel') analytics();
  if(b.dataset.panel==='toolsPanel') tools();
 };
});

function showMark(s) {
 selected=s;

 document.getElementById('studentName').textContent=s.name;
 document.getElementById('studentMeta').textContent=
  `${s.hall} • ${s.branch} • ${s.year} Batch`;

 document.getElementById('mHall').textContent=s.hall;
 document.getElementById('mBranch').textContent=s.branch;
 document.getElementById('sgpa').textContent=s.sgpa.toFixed(2);
 document.getElementById('cgpa').textContent=s.cgpa.toFixed(2);

 document.getElementById('status').textContent=
  s.records.every(r=>r.grade!=='F')?'PASS':'RE-APPEAR';

 document.getElementById('marks').innerHTML=
  s.records.map(r=>`
   <tr>
    <td>${r.name}</td>
    <td>${r.credits}</td>
    <td>${r.internal}</td>
    <td>${r.external}</td>
    <td>${r.total}</td>
    <td><span class="grade">${r.grade}</span></td>
   </tr>
  `).join('');
}

function searchResult() {
 let q=document.getElementById('hallTicket').value.trim().toUpperCase();
 let s=students.find(x=>x.hall.toUpperCase()===q);

 document.getElementById('error').textContent=
  s?'':'No demo record found. Try 22CSE104.';

 if(s) showMark(s);
}

document.getElementById('hallTicket').addEventListener('keydown',e=>{
 if(e.key==='Enter') searchResult();
});

function makeChart(id,type,data,options={}) {
 if(charts[id]) charts[id].destroy();

 charts[id]=new Chart(document.getElementById(id),{
  type,
  data,
  options:{
   responsive:true,
   maintainAspectRatio:false,
   ...options
  }
 });
}

function passRates() {
 return subjects.map(([n])=>
  Math.round(
   students.filter(s=>
    s.records.find(r=>r.name===n).grade!=='F'
   ).length
  )
 );
}

function average(arr,k) {
 return arr.reduce((a,s)=>a+s[k],0)/(arr.length||1);
}

function analytics() {
 let rates=passRates();

 let overall=Math.round(
  students.reduce((a,s)=>
   a+s.records.filter(r=>r.grade!=='F').length,0
  )/(students.length*6)*100
 );

 document.getElementById('studentCount').textContent=students.length;
 document.getElementById('passKpi').textContent=overall+'%';
 document.getElementById('topKpi').textContent=
  Math.max(...students.map(s=>s.sgpa)).toFixed(2);

 makeChart('passChart','bar',{
  labels:subjects.map(s=>s[0]),
  datasets:[{
   label:'Pass rate %',
   data:rates,
   backgroundColor:'#3157d5',
   borderRadius:7
  }]
 },{
  scales:{y:{min:0,max:100}},
  plugins:{legend:{display:false}}
 });

 let bins=['5–6','6–7','7–8','8–9','9–10'];
 let counts=[0,0,0,0,0];

 students.forEach(s=>{
  counts[Math.min(4,Math.max(0,Math.floor(s.cgpa)-5))]++;
 });

 makeChart('cgpaChart','bar',{
  labels:bins,
  datasets:[{
   label:'Students',
   data:counts,
   backgroundColor:'#16b8b0',
   borderRadius:7
  }]
 },{
  plugins:{legend:{display:false}},
  scales:{y:{beginAtZero:true,ticks:{precision:0}}}
 });

 makeChart('branchChart','bar',{
  labels:branches,
  datasets:[{
   label:'Average SGPA',
   data:branches.map(b=>
    average(students.filter(s=>s.branch===b),'sgpa')
   ),
   backgroundColor:'#3157d5',
   borderRadius:7
  }]
 },{
  scales:{y:{min:0,max:10}}
 });

 leaderboard();
}

function leaderboard() {
 let b=document.getElementById('branchFilter').value;

 let list=students
  .filter(s=>b==='ALL'||s.branch===b)
  .sort((a,c)=>c.sgpa-a.sgpa)
  .slice(0,10);

 document.getElementById('leaders').innerHTML=
  list.map((s,i)=>`
   <tr>
    <td>${['🥇','🥈','🥉'][i]||i+1}</td>
    <td>${s.hall}</td>
    <td>${s.branch}</td>
    <td>${s.sgpa.toFixed(2)}</td>
    <td>${s.credits}</td>
   </tr>
  `).join('');
}

function tools() {
 document.getElementById('feeOptions').innerHTML=
  subjects.map(([n])=>`
   <label style="display:block;margin:10px 0;font-size:13px">
    <input type="checkbox" class="fee" onchange="feeCalc()"> ${n}
   </label>
  `).join('');

 let rates=passRates();

 document.getElementById('difficulty').innerHTML=
  subjects.map(([n],i)=>{
   let f=100-rates[i];
   let level=f>=35?'High':f>=20?'Medium':'Low';

   return `
    <tr>
     <td>${n}</td>
     <td>${f}%</td>
     <td>${level}</td>
    </tr>
   `;
  }).join('');
}

function feeCalc() {
 let n=document.querySelectorAll('.fee:checked').length;

 document.getElementById('feeTotal').textContent=
  `Selected subjects: ${n} • Estimated fee: ₹${n*300} (sample rate)`;
}

function showTrend() {
 let s=students.find(x=>
  x.hall.toUpperCase()===
  document.getElementById('trendHall').value.trim().toUpperCase()
 );

 if(!s) {
  alert('Hall ticket not found');
  return;
 }

 makeChart('trendChart','line',{
  labels:['Sem I','Sem II','Sem III','Sem IV'],
  datasets:[{
   label:'SGPA',
   data:[s.cgpa-.42,s.cgpa-.25,s.cgpa-.1,s.sgpa],
   borderColor:'#3157d5',
   backgroundColor:'#3157d522',
   fill:true,
   tension:.35
  }]
 },{
  scales:{y:{min:0,max:10}}
 });
}

function compareBatches() {
 let a=document.getElementById('batchA').value;
 let b=document.getElementById('batchB').value;

 let A=students.filter(s=>String(s.year)===a);
 let B=students.filter(s=>String(s.year)===b);

 document.getElementById('batchResult').innerHTML=
  a===b
   ?'Choose two different batches.'
   :`<b>${a}:</b> ${A.length} students, average CGPA ${average(A,'cgpa').toFixed(2)}
     <br><b>${b}:</b> ${B.length} students, average CGPA ${average(B,'cgpa').toFixed(2)}
     <br><small>Generated sample data</small>`;
}

function downloadCSV() {
 let rows=[
  ['Subject','Credits','Internal','External','Total','Grade'],
  ...selected.records.map(r=>[
   r.name,r.credits,r.internal,r.external,r.total,r.grade
  ])
 ];

 let csv=rows.map(r=>r.join(',')).join('\n');
 let url=URL.createObjectURL(
  new Blob([csv],{type:'text/csv'})
 );

 let a=document.createElement('a');
 a.href=url;
 a.download=selected.hall+'_marksheet.csv';
 a.click();

 URL.revokeObjectURL(url);
}

showMark(demo);
