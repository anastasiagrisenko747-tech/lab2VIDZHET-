import { Dashboard } from "./Dashboard.js";

const container = document.getElementById("widget-grid");
const notice = document.getElementById("notice");
const select = document.getElementById("widget-select");
const addButton = document.getElementById("add-widget-btn");
const dashboard = new Dashboard(container, notice);

function updateDate() {
  const date = new Date();
  document.getElementById("today-label").textContent = date.toLocaleDateString("ru-RU", {
    weekday: "long", day: "numeric", month: "long", year: "numeric"
  });
}

addButton.addEventListener("click", () => dashboard.addWidget(select.value));
updateDate();
dashboard.restoreState();