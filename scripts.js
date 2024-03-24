const supabaseUrl = "https://vfzyenkbmccasevhgypr.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZmenllbmtibWNjYXNldmhneXByIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDY1NTAyMDUsImV4cCI6MjAyMjEyNjIwNX0.DHkrqOGJjb4QAXaqayUfis4CtPjBW-0cnzDYg3IGubc";

const { createClient } = supabase;
const supabaseClient = createClient(supabaseUrl, supabaseKey);

// Отображение результатов при загрузке страницы
displayResults();

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
    .from("barbercalc")
    .upsert([{ sum, hours, result, com, hourlySalary, date: formattedDate }]);

  if (error) {
    console.error("Error saving data to Supabase:", error.message);
    alert("Произошла ошибка при записи данных в базу данных.");
  } else {
    displayResults();
  }

  document.getElementById("hourlySalaryResult").textContent =
    hourlySalary.toFixed(2);
}

function displayResults() {
  const resultsList = document.getElementById("resultsList");
  const hourlySalaryResultContainer = document.getElementById(
    "hourlySalaryResultContainer"
  );
  const hourlySalaryResult = document.getElementById("hourlySalaryResult");

  resultsList.innerHTML = "";

  // Получение данных из базы данных Supabase
  supabaseClient
    .from("peon")
    .select("*")
    .order("id", { ascending: false }) // Сортировка по ID в порядке убывания
    .limit(3) // Получение последних 5 записей
    .then(({ data, error }) => {
      if (error) {
        console.error(
          "Ошибка при получении данных из Supabase:",
          error.message
        );
        alert("Произошла ошибка при получении данных из базы данных.");
      } else {
        if (data.length > 0) {
          // Вывод почасовой зарплаты для второй записи
          if (data.length >= 2) {
            const secondEntry = data[1];
            hourlySalaryResult.textContent =
              secondEntry.hourlySalary.toFixed(2);
          }

          // Вывод результатов в список
          data.forEach((entry, index) => {
            const listItem = document.createElement("li");

            if (index === 1) {
              listItem.classList.add("underline");
            }

            // Разделяем вывод на две строки
            listItem.innerHTML = `<strong>Terminal</strong>: ${
              entry.sum
            }, <strong>Heures</strong>: ${
              entry.hours
            }<br><strong>Salaire</strong>: ${entry.result.toFixed(
              2
            )}<br><strong>Commission</strong> ${entry.com.toFixed(
              2
            )}, <strong>Horaire</strong> ${entry.hourlySalary.toFixed(1)}`;

            // Добавляем созданный элемент li в список результатов
            resultsList.appendChild(listItem);
          });
        } else {
          const noDataItem = document.createElement("li");
          noDataItem.textContent = "База данных пуста";
          resultsList.appendChild(noDataItem);
        }
      }
    });
}

async function fetchResults() {
  const { data, error } = await supabaseClient
    .from("peon")
    .select("sum, hours, result, date")
    .order("id", { ascending: true }) // Сортировка по ID в порядке убывания
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
            display: false, // Скрываем линии сетки по оси Y
            drawBorder: false, // Скрываем границу сетки
          },
        },
        x: {
          display: false,
          grid: {
            display: true, // Скрываем линии сетки по оси X
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

window.onload = fetchResults;
