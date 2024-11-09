window.onload = async()=>{
  const form = document.getElementById('form');
  const addChoiceButton = document.getElementById('add-choice');
  const addChoiceValue = document.getElementById('add-choice-value');
  const choices = document.getElementById('choices');

  let choiceArray = [];

  form.addEventListener('submit', async(e) => {
    e.preventDefault();
    if (choiceArray.length < 1){
      alert('選択肢を追加してください');
      return;
    }
    const formData = new FormData(form);

    const result = {};

    for (const [key, value] of formData.entries()){
      if (key.endsWith('[]')){
        const name = key.slice(0, -2);
        if (!result[name]){
          result[name] = [];
        }
        result[name].push(value);
        continue;
      }
      result[key] = value;
    }

    const req = await fetch("/api/v1/votes", {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(result),
    });
    const res = await req.json();
    if (res.error) {
      alert(res.error);
      return
    }
    location.href = `/view.html?id=${res.id}`;
  });

  addChoiceButton.addEventListener('click', async() => {
    if (!addChoiceValue.value){
      return;
    }
    if (choiceArray.includes(addChoiceValue.value)){
      alert('選択肢が重複しています');
      return;
    }
    const div = document.createElement('li');
    const input = document.createElement('input');
    input.type = 'text';
    input.name = 'options[]';
    input.value = addChoiceValue.value;
    input.required = true;
    div.appendChild(input);
    choiceArray.push(addChoiceValue.value);
    const button = document.createElement('button');
    button.innerText = '削除';
    button.addEventListener('click', () => {
      div.remove();
      choiceArray = choiceArray.filter((v) => v !== addChoiceValue.value);
    });
    div.appendChild(button);
    choices.appendChild(div);
    addChoiceValue.value = '';
  });

}
