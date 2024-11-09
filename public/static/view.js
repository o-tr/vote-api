window.onload = async()=>{
  const init = document.getElementById('init');
  const password = document.getElementById('password');
  const initButton = document.getElementById('init-button');

  const voteId = new URLSearchParams(location.search).get('id');

  if (!voteId){
    alert('IDが指定されていません');
    location.href = '/create.html';
    return;
  }

  initButton.addEventListener('click', async()=>{
    const req = await fetch(`/api/v1/votes/${voteId}`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `basic ${btoa(`hoge:${password.value}`)}`,
      },
    });
    const res = await req.json();
    if (res.error){
      alert(res.error);
      return;
    }
    init.style.display = 'none';
    render(res);
  });

  const render = (data) => {
    const title = document.getElementById('title');
    const statics = document.getElementById('statics');
    const result = document.getElementById('result');
    title.textContent = data.title;

    const count = Object.entries(countByValue(data.answers.map((answer) => answer.value))).sort((a, b) => b[1] - a[1]);
    count.forEach((entry) => {
      const div = document.createElement('tr');
      const value = document.createElement('td');
      value.textContent = entry[0];
      const count = document.createElement('td');
      count.textContent = entry[1];
      div.appendChild(value);
      div.appendChild(count);
      statics.appendChild(div);
    });

    data.answers.forEach((answer) => {
      const div = document.createElement('tr');
      const name = document.createElement('td');
      name.textContent = answer.name || "無記名";
      const value = document.createElement('td');
      value.textContent = answer.value;
      div.appendChild(name);
      div.appendChild(value);
      result.appendChild(div);
    })
  }
  const countByValue = (array) => {
    const result = {};
    array.forEach((value) => {
      if (!result[value]){
        result[value] = 0;
      }
      result[value]++;
    });
    return result;
  }
}