let token = undefined;
window.onSuccess = (val)=>{
  token = val;
};

const main = async() => {
  const [positions,weather] = await Promise.all([await fetch('/api/v1/geo-list'), await fetch('/api')]);
  const data = (await positions.json()).data;
  const weatherData = await weather.json();
  const geoPosId = weatherData.geoPosId;
  const list = document.getElementById('list');
  for (const [key, prefs] of Object.entries(data)){
    const group = document.createElement('div');
    group.classList.add('group');
    const h2 = document.createElement('h2');
    h2.innerText = key;
    group.appendChild(h2);
    for (const [pref, regionData] of Object.entries(prefs)){
      if (typeof regionData === 'object'){
        const region = document.createElement('div');
        region.classList.add('region');
        const h3 = document.createElement('h3');
        h3.innerText = pref;
        region.appendChild(h3);
        const regionList = document.createElement('div');
        regionList.classList.add('region-list');
        for (const [city,value] of Object.entries(regionData)){
          const div = document.createElement('label');
          const input = document.createElement('input');
          input.type = 'radio';
          input.value = value;
          input.name = 'city';
          input.innerText = `${city}`;
          if (value === geoPosId){
            input.checked = true;
          }
          div.appendChild(input);
          const span = document.createElement('span');
          span.innerText = `${city}`;
          div.appendChild(span);
          regionList.appendChild(div);
        }
        region.appendChild(regionList);

        group.appendChild(region);
        continue;
      }
      const region = document.createElement('div');
      region.classList.add('region');
      const h3 = document.createElement('h3');
      h3.innerText = pref;
      region.appendChild(h3);
      const regionList = document.createElement('div');
      regionList.classList.add('region-list');
      const div = document.createElement('label');
      const input = document.createElement('input');
      input.type = 'radio';
      input.value = regionData;
      input.name = 'city';
      if (regionData === geoPosId){
        input.checked = true;
      }
      div.appendChild(input);
      const span = document.createElement('span');
      span.innerText = `${pref}`;
      div.appendChild(span);
      regionList.appendChild(div);
      region.appendChild(regionList);

      group.appendChild(region);
    }
    list.appendChild(group);
  }
  const update = document.getElementById('update');
  update.addEventListener('click', async() => {
    const city = document.querySelector('input[name="city"]:checked');
    if (!city){
      alert('都道府県を選択してください');
      return;
    }
    if(!token){
      alert('CAPTCHAの認証を行ってください');
      return;
    }
    const res = await fetch('/api/v1/save-geo-id', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({geoPosId: city.value, token: token}),
    });
    const json = await res.json();
    if (json.status === 'success'){
      alert('情報を更新しました');
      location.reload()
      return;
    }else if (json.status === 'error'){
      alert('エラーが発生しました\n開発者にお問い合わせください');
      return;
    }
  });
}
void main();
