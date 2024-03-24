// script.js
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

  // После сохранения данных перезагружаем результаты
  displayResults();
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
      hourlySalaryResult.textContent += `, ${secondHourlySalary}`;
    }
    // Вывод результатов в список
    data.forEach((entry, index) => {
      const listItem = document.createElement("li");

      // Добавление стиля для второй записи
      if (index === 1) {
        listItem.classList.add("underline");
      }

      // Формирование содержимого элемента списка
      listItem.innerHTML = `<strong>Terminal</strong>: ${
        entry.sum
      }, <strong>Heures</strong>: ${
        entry.hours
      }<br><strong>Salaire</strong>: ${entry.result.toFixed(
        2
      )}<br><strong>Commission</strong>: ${entry.com.toFixed(
        2
      )}, <strong>Horaire</strong>: ${entry.hourlySalary.toFixed(
        1
      )}<br><strong>TOTAL BRUT</strong>: ${entry.bigtotal.toFixed(2)}
      <br><strong>TOTAL NET</strong>: ${entry.ADtotal.toFixed(2)}`;

      // Добавление элемента в список результатов
      resultsList.appendChild(listItem);
    });
  } catch (error) {
    console.error("Ошибка при отображении результатов:", error.message);
    alert("Произошла ошибка при отображении результатов.");
  }
}

async function fetchResults() {
  const { data, error } = await supabaseClient
    .from("peon")
    .select("sum, hours, result, date")
    .order("id", { ascending: true }) // Сортировка по ID в порядке возрастания
    .limit(10);

  if (error) {
    console.error("Error fetching data from Supabase:", error.message);
  } else {
    createChart(data);
  }
}

function createChart(results) {
  const labels = results.map(
    (result) => `Total: ${result.sum}, Hours: ${result.hours}`
  );
  const data = results.map((result) => result.result.toFixed(2));

  const ctx = document.getElementById("myChart").getContext("2d");
  const myChart = new Chart(ctx, {
    type: "line",
    data: {
      labels: labels,
      datasets: [
        {
          label: "Result",
          data: data,
          fill: false,
          borderColor: "#0284C7",
          borderWidth: 1,
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

window.onload = function () {
  fetchResults();
};
