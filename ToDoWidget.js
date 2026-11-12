import { UIComponent } from "../UIComponent.js";

export class ToDoWidget extends UIComponent {
  constructor(id, dashboard, tasks = []) {
    super(id, "Список дел", dashboard);
    this.icon = "✓";
    this.iconClass = "icon-todo";
    this.kicker = "ВАШ ПЛАН НА ДЕНЬ";
    this.tasks = Array.isArray(tasks) ? tasks : [];
  }

  render() {
    const card = super.render();
    const form = document.createElement("form");
    form.className = "task-form";

    const input = document.createElement("input");
    input.className = "task-input";
    input.type = "text";
    input.maxLength = 120;
    input.placeholder = "Например, забронировать отель…";
    input.setAttribute("aria-label", "Новая задача");

    const addButton = document.createElement("button");
    addButton.className = "button button-primary";
    addButton.type = "submit";
    addButton.textContent = "Добавить";
    form.append(input, addButton);

    this.list = document.createElement("ul");
    this.list.className = "task-list";
    this.summary = document.createElement("div");
    this.summary.className = "task-summary";

    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const text = input.value.trim();
      if (!text) {
        input.focus();
        return;
      }
      this.tasks.push({ id: this.makeTaskId(), text, completed: false });
      input.value = "";
      this.renderTasks();
      input.focus();
    });

    this.body.append(form, this.list, this.summary);
    this.renderTasks();
    return card;
  }

  makeTaskId() {
    return `task-${Date.now()}-${Math.random().toString(16).slice(2)}`;
  }

  renderTasks() {
    this.list.replaceChildren();
    if (this.tasks.length === 0) {
      const empty = document.createElement("li");
      empty.className = "empty-state";
      empty.textContent = "Пока нет задач. Добавьте первую!";
      this.list.append(empty);
    }

    this.tasks.forEach((task) => {
      const item = document.createElement("li");
      item.className = `task-item${task.completed ? " completed" : ""}`;

      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.checked = Boolean(task.completed);
      checkbox.setAttribute("aria-label", `Отметить задачу: ${task.text}`);
      checkbox.addEventListener("change", () => {
        task.completed = checkbox.checked;
        this.renderTasks();
      });

      const text = document.createElement("span");
      text.className = "task-text";
      text.textContent = task.text;

      const remove = document.createElement("button");
      remove.type = "button";
      remove.className = "task-delete";
      remove.textContent = "×";
      remove.title = "Удалить задачу";
      remove.setAttribute("aria-label", `Удалить задачу: ${task.text}`);
      remove.addEventListener("click", () => {
        this.tasks = this.tasks.filter((entry) => entry.id !== task.id);
        this.renderTasks();
      });

      item.append(checkbox, text, remove);
      this.list.append(item);
    });

    const completed = this.tasks.filter((task) => task.completed).length;
    this.summary.replaceChildren();
    const count = document.createElement("span");
    count.textContent = `Всего задач: ${this.tasks.length}`;
    const progress = document.createElement("span");
    progress.textContent = `Выполнено: ${completed}`;
    this.summary.append(count, progress);
    this.dashboard.saveState();
  }
}