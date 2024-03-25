// Объявляем переменную myChart в глобальной области видимости
let myChart;

// Объявляем переменную chartType в глобальной области видимости
let chartType = "line";

function toggleTheme() {
  document.body.classList.toggle("dark-theme");
}
// Функция для создания графика
function createChart(results) {
  const labels = results.map(
    (result) => `Total: ${result.sum}, Hours: ${result.hours}`
  );
  const data = results.map((result) =>
    result.result ? result.result.toFixed(2) : 0
  );
  const ADbrutData = results.map((result) =>
    result.ADbrut ? result.ADbrut.toFixed(2) : 0
  );

  const ctx = document.getElementById("myChart").getContext("2d");

  // Проверяем существует ли myChart и является ли он объектом Chart перед вызовом destroy()
  if (typeof myChart === "object" && myChart !== null) {
    myChart.destroy();
  }

  myChart = new Chart(ctx, {
    type: chartType,
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
        {
          label: "ADbrut",
          data: ADbrutData,
          fill: false,
          borderColor: "#FF5733",
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

// Определение функции updateChart для обновления графика
async function updateChart() {
  const { data, error } = await supabaseClient
    .from("peon")
    .select("sum, hours, result, ADbrut, date")
    .order("id", { ascending: true })
    .limit(10);

  if (error) {
    console.error("Error fetching data from Supabase:", error.message);
  } else {
    createChart(data);
  }
}

// Отображение результатов при загрузке страницы
document.addEventListener("DOMContentLoaded", function () {
  displayResults(); // Вызов функции после полной загрузки DOM

  async function calculateSalary() {
    const sumInput = document.getElementById("sum").value;
    const hoursInput = document.getElementById("hours").value;

    const sum = parseFloat(sumInput);
    const hours = parseFloat(hoursInput);

    if (isNaN(sum) || isNaN(hours)) {
      alert("Пожалуйста, введите корректные числа.");
      return;
    }

    const currentDate = new Date();
    const formattedDate = currentDate.toLocaleString();
    let brut, result, com;

    if (sum === 0 && hours === 0) {
      brut = 38.5 * 15.25;
      result = brut - 0.21 * brut;
      com = 0; // Предполагая, что комиссия будет равна 0, если сумма и часы равны 0
    } else {
      const y = hours * 15.25;
      const z = y * 2;
      const t = sum - z;
      com = t - 0.6 * t; // Вычисляем комиссию
      const w = com + y;
      brut = w;
      result = w - 0.21 * w;
    }

    let hourlySalary;
    if (sum === 0 && hours === 0) {
      hourlySalary = 15.25;
    } else {
      hourlySalary = hours !== 0 ? brut / hours : 0;
    }

    if (!isFinite(hourlySalary)) {
      hourlySalary = 0;
    }

    sum.toFixed(2);
    hours.toFixed(2);
    brut.toFixed(2);
    result.toFixed(2);
    hourlySalary.toFixed(2);

    const { data, error } = await supabaseClient
      .from("peon")
      .upsert([{ sum, hours, result, com, hourlySalary, date: formattedDate }]);

    if (error) {
      console.error("Error saving data to Supabase:", error.message);
      alert("Произошла ошибка при записи данных в базу данных!");
    } else {
      displayResults();
    }

    document.getElementById("hourlySalaryResult").textContent =
      hourlySalary.toFixed(2);
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
        .limit(2);

      if (error) {
        console.error(
          "Ошибка при получении данных из Supabase:",
          error.message
        );
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

      // Показываем только первый элемент списка
      document.querySelector("#resultsList li:first-child").style.display =
        "block";
    } catch (error) {
      console.error("Ошибка при отображении результатов:", error.message);
      alert("Произошла ошибка при отображении результатов.");
    }
  }

  // Определяем текущий индекс отображаемого элемента
  let currentIndex = 0;

  // Функция для обновления отображаемых элементов списка
  function updateVisibleItems() {
    const listItems = resultsList.querySelectorAll("li");

    listItems.forEach((item, index) => {
      if (index === currentIndex) {
        item.style.display = "block"; // Показываем текущий элемент
      } else {
        item.style.display = "none"; // Скрываем остальные элементы
      }
    });
  }

  // Обработчик события прокрутки для элемента списка
  resultsList.addEventListener("wheel", (event) => {
    event.preventDefault(); // Отменяем стандартное действие прокрутки

    // Определяем направление прокрутки (1 - вниз, -1 - вверх)
    const direction = event.deltaY > 0 ? 1 : -1;

    // Обновляем индекс отображаемого элемента
    currentIndex += direction;

    // Ограничиваем индекс отображаемого элемента
    const listItems = resultsList.querySelectorAll("li");
    const maxIndex = listItems.length - 1;
    if (currentIndex < 0) {
      currentIndex = 0;
    } else if (currentIndex > maxIndex) {
      currentIndex = maxIndex;
    }

    // Обновляем отображаемые элементы списка
    updateVisibleItems();
  });

  // Вызываем функцию для первоначальной настройки отображения
  updateVisibleItems();

  // Объявление переменных графика и начального типа графика
  let myChart;
  let chartType = "line";

  // Функция для загрузки данных и создания графика при загрузке страницы
  async function fetchResults() {
    const { data, error } = await supabaseClient
      .from("peon")
      .select("sum, hours, result, ADbrut, date")
      .order("id", { ascending: true })
      .limit(10);

    if (error) {
      console.error("Error fetching data from Supabase:", error.message);
    } else {
      createChart(data);
    }
  }

  // Вызов функции загрузки данных и создания графика при загрузке страницы
  window.onload = function () {
    fetchResults();
  };

  // Функция для обновления графика
  async function updateChart() {
    const { data, error } = await supabaseClient
      .from("peon")
      .select("sum, hours, result, ADbrut, date")
      .order("id", { ascending: true })
      .limit(10);

    if (error) {
      console.error("Error fetching data from Supabase:", error.message);
    } else {
      createChart(data);
    }
  }

  // Добавление прослушивателя события для поля ввода суммы
  //document.getElementById("sum").addEventListener("input", calculateSalary);

  // Добавление прослушивателя события для поля ввода часов
  //document.getElementById("hours").addEventListener("input", calculateSalary);

  // Добавление прослушивателя события для поля ввода дополнительной суммы
  //document
  //  .getElementById("additionalValue")
  //  .addEventListener("input", calculateSalary);
});
