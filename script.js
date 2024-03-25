// script.js

let myChart;

function toggleTheme() {
  const body = document.body;
  const themeToggle = document.getElementById("themeToggle");

  // Переключение темы
  body.classList.toggle("dark-theme");

  // Проверка текущей темы и изменение иконки
  if (body.classList.contains("dark-theme")) {
    themeToggle.src = "./favicon6-black.ico";
  } else {
    themeToggle.src = "./favicon6.ico";
  }
  // Получаем ссылку на мета-тег
  const statusBarMeta = document.getElementById("statusBarStyle");

  // Если тема светлая, устанавливаем стиль строки состояния черным
  if (document.body.classList.contains("dark-theme")) {
    statusBarMeta.setAttribute("content", "black");
  } else {
    // Если тема тёмная, устанавливаем стиль строки состояния белым
    statusBarMeta.setAttribute("content", "white");
  }
}

async function calculateSalary() {
  const sumInput = document.getElementById("sum").value;
  const hoursInput = document.getElementById("hours").value;
  const additionalValueInput = document.getElementById("additionalValue").value;

  const sum = parseFloat(sumInput);
  const hours = parseFloat(hoursInput);
  const additionalValue = parseFloat(additionalValueInput);

  if (isNaN(sum) || isNaN(hours) || isNaN(additionalValue)) {
    alert("Please enter valid numbers.");
    return;
  }

  // Выполняем существующие формулы расчёта
  let brut, result, com;

  if (sum === 0 && hours === 0) {
    brut = 38.5 * 15.25;
    result = brut - 0.21 * brut;
    com = 0;
  } else {
    const y = hours * 15.25;
    const z = y * 2;
    const t = sum - z;
    com = t - 0.6 * t;
    const w = com + y;
    brut = w;
    result = w - 0.21 * w;
  }

  // Добавляем дополнительное значение к результату и brut
  const additionalResult = additionalValue + result;
  const additionalBrut = additionalValue + brut;

  // Вычисляем дополнительные значения по формуле
  const additionalNalog = additionalValue + 0.21 * brut + result;

  // Вычисляем часовую зарплату
  let hourlySalary;
  if (sum === 0 && hours === 0) {
    hourlySalary = 15.25;
  } else {
    hourlySalary = hours !== 0 ? brut / hours : 0;
  }

  if (!isFinite(hourlySalary)) {
    hourlySalary = 0;
  }

  // Сохранение данных в базу данных Supabase
  await saveDataToSupabase(
    sum,
    hours,
    result,
    com,
    hourlySalary,
    additionalResult,
    additionalBrut,
    additionalNalog
  );
  await fetchResults();

  // После сохранения данных и получения новых данных из базы данных перезагружаем результаты и обновляем график
  displayResults();
  await updateChart();
}
// Получение элементов DOM
const resultsList = document.getElementById("resultsList");
const hourlySalaryResult = document.getElementById("hourlySalaryResult");

// Функция для отображения результатов
async function displayResults() {
  try {
    // Получение данных из базы данных Supabase
    const { data, error } = await supabaseClient
      .from("peon")
      .select("*")
      .order("id", { ascending: false })
      .limit(3);

    if (error) {
      console.error("Ошибка при получении данных из Supabase:", error.message);
      alert("Произошла ошибка при получении данных из базы данных.");
      return;
    }

    // Очистка списка перед обновлением
    resultsList.innerHTML = "";
    resultsList2.innerHTML = ""; // Добавлено для второго списка
    resultsList3.innerHTML = "";

    // Вывод почасовой зарплаты для второй записи
    if (data.length >= 2) {
      const firstEntry = data[1];
      const firstHourlySalary = (
        firstEntry.bigtotal / firstEntry.hours
      ).toFixed(2);
      hourlySalaryResult.textContent = `${firstHourlySalary}...`;
    }

    // Вывод почасовой зарплаты для второй записи
    if (data.length >= 2) {
      const secondEntry = data[1];
      const secondHourlySalary = secondEntry.hourlySalary.toFixed(2);
      hourlySalaryResult.textContent += ` ${secondHourlySalary}`;
    }
    // Вывод результатов в список
    data.forEach((entry, index) => {
      const listItem = document.createElement("li");

      // Добавление стиля для второй записи
      if (index === 1) {
        listItem.classList.add("blueunderline");
      } else {
        listItem.classList.add("redunderline");
      }

      // Формирование содержимого элемента списка
      listItem.innerHTML = `<strong>Terminal</strong>: ${
        entry.sum
      }, <strong>Heures</strong>: ${
        entry.hours
      }      <br><strong>Commission</strong>: ${entry.com.toFixed(2)}
      <br><strong>Salaire</strong>: ${entry.result.toFixed(
        2
      )}, <strong>$</strong>: ${entry.hourlySalary.toFixed(2)}
      <br><strong>TOTAL</strong>: ${entry.ADtotal.toFixed(2)}`;

      if (index < 1) {
        resultsList.appendChild(listItem);
      } else if (index < 2) {
        const listItem2 = listItem.cloneNode(true); // Создание копии элемента
        resultsList2.appendChild(listItem2); // Добавление копии во второй список
      } else {
        const listItem3 = listItem.cloneNode(true); // Создание копии элемента
        resultsList3.appendChild(listItem3); // Добавление копии в третий список
      }
    });
  } catch (error) {
    console.error("Ошибка при отображении результатов:", error.message);
    alert("Произошла ошибка при отображении результатов.");
  }
}

function createChart(results) {
  const labels = results.map(
    (result) => `Total: ${result.sum}, Hours: ${result.hours}`
  );
  const data = results.map((result) =>
    result.result ? result.result.toFixed(2) : 0
  );
  const ADtotalData = results.map((result) =>
    result.ADtotal ? result.ADtotal.toFixed(2) : 0
  );
  const ctx = document.getElementById("myChart").getContext("2d");
  if (typeof myChart === "object" && myChart !== null) {
    myChart.destroy();
  }
  myChart = new Chart(ctx, {
    // Удалено ключевое слово const
    type: "line",
    data: {
      labels: labels,
      datasets: [
        {
          label: "Net",
          data: data,
          fill: false,
          borderColor: "#0284C7",
          borderWidth: 2,
        },
        {
          label: "Net",
          data: ADtotalData,
          fill: false,
          borderColor: "#FF5733",
          borderWidth: 2,
        },
      ],
    },
    options: {
      scales: {
        y: {
          beginAtZero: true,
          display: false,
          ticks: {
            display: false,
          },
          grid: {
            display: false,
            drawBorder: false,
          },
        },
        x: {
          display: false,
          grid: {
            display: true,
          },
        },
      },
      plugins: {
        legend: {
          display: false,
        },
      },
    },
  });
}

async function fetchResults() {
  const { data, error } = await supabaseClient
    .from("peon")
    .select("sum, hours, result, date, ADtotal")
    .order("id", { ascending: false }) // Сортировка по ID в порядке возрастания
    .limit(10);

  if (error) {
    console.error("Error fetching data from Supabase:", error.message);
  } else {
    createChart(data.reverse()); // Используйте метод reverse() для изменения порядка записей
  }
}

async function updateChart() {
  const { data, error } = await supabaseClient
    .from("peon")
    .select("sum, hours, result, date, ADtotal")
    .order("id", { ascending: false }) // Сортировка по ID в порядке возрастания
    .limit(10);

  if (error) {
    console.error("Error fetching data from Supabase:", error.message);
  } else {
    createChart(data.reverse()); // обращаем массив данных перед созданием графика
  }
}

window.onload = function () {
  fetchResults();
};
