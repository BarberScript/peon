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
  const y = hours * 15.25;
  const z = y * 2;
  const t = sum - z;
  const r = t - 0.6 * t;
  const w = r + y;
  const result = w - 0.19 * w;

  // Запись данных в базу данных Supabase
  const { data, error } = await supabaseClient
    .from("barbercalc")
    .upsert([{ sum, hours, result, date: formattedDate }]);

  if (error) {
    console.error("Error saving data to Supabase:", error.message);
    alert("Произошла ошибка при записи данных в базу данных.");
  } else {
    displayResults();
  }
  const hourlyResultDiv = document.getElementById("hourlySalaryResult");
  hourlyResultDiv.innerHTML = `<strong>Hourly Salary:</strong> ${result.toFixed(
    2
  )}`;
}

function displayResults() {
  const resultsList = document.getElementById("resultsList");
  resultsList.innerHTML = "";

  // Получение данных из базы данных Supabase
  supabaseClient
    .from("barbercalc")
    .select("*")
    .order("id", { ascending: false }) // Сортировка по ID в порядке убывания
    .limit(5) // Получение последних 5 записей
    .then(({ data, error }) => {
      if (error) {
        console.error(
          "Ошибка при получении данных из Supabase:",
          error.message
        );
        alert("Произошла ошибка при получении данных из базы данных.");
      } else {
        if (data.length > 0) {
          // Итерация по каждой записи и создание элементов li
          data.forEach((entry, index) => {
            // Форматирование даты для вывода в стандартном формате
            //const formattedDate = new Date(entry.date).toLocaleString();

            // Создание элемента li с результатами
            const listItem = document.createElement("li");

            // Проверка, является ли запись третьей, и добавление класса для подчеркивания
            if (index === 1) {
              listItem.classList.add("underline"); // Замените "underline" на ваш класс CSS для подчеркивания
            }

            listItem.innerHTML = `<strong>Total</strong>: ${
              entry.sum
            }, <strong>Hours</strong>: ${
              entry.hours
            }, <strong>::</strong> ${entry.result.toFixed(2)}`;
            resultsList.appendChild(listItem);
          });
        } else {
          // Если база данных пуста
          const noDataItem = document.createElement("li");
          noDataItem.textContent = "База данных пуста";
          resultsList.appendChild(noDataItem);
        }
      }
    });
}

async function fetchResults() {
  const { data, error } = await supabaseClient
    .from("barbercalc")
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
